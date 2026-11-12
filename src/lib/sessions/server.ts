import "server-only";
import type { Interview, QuestionGroup } from "@/lib/types";
import { limitReached } from "@/lib/usage/limits";
import { getInterview, getInterviewAsync, saveInterviewAsync, updateInterview } from "@/lib/interviews/store";
import { addQuestions, rethink, understandingOf } from "@/lib/interviews/build";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { CATEGORY_ORDER, enabledGroups, settingsOr, styleFor, type SessionSettings } from "@/lib/interviews/settings";
import { buildReport, categoryScores, type MockReport, type MockRow, type Verdict } from "@/lib/mocks/report";
import { createSession, doneSessions, findMock, isFresh, lastAskedMap, lastAskedMapAsync, listMocks, rerunOf, rowsFor, saveMock, saveMockAsync, type MockRecord, type SkipRecord } from "@/lib/mocks/store";
import { drillQuestions, suggestDrills, type DrillSpec, type DrillSuggestion } from "./drills";
import { matchesDifficulty, needsAny, pickQuestions, questionsNeeded } from "./pick";
import type { WrongReason } from "@/lib/ai/interview/questions";
import { mergeRules } from "./rules";
import { roundFor } from "@/lib/ai/interview/build-plan";
import { PAY_IDS, payQuestions, payStage } from "./pay";

/**
 * Sessions on the server: where you stand on an interview, planning an
 * interview, a re-run or a drill, keeping enough unheard questions in the
 * bank for the next one, and stopping when something's wrong.
 */

const canWrite = () => !mockAiEnabled() && Boolean(aiConfig.anthropicKey || aiConfig.geminiKey);

/* ---------------------------------------------------------------- standing */

export interface Standing {
  /** Your latest interview with new questions. */
  last: MockRecord | null;
  report: MockReport | null;
  rows: MockRow[];
  verdict: Verdict | null;
  /** Each category's score from the latest interview that included it. */
  categories: Partial<Record<QuestionGroup, number>>;
  /** From the latest interview's report, with the ones you've done marked. */
  drills: (DrillSuggestion & { done: boolean })[];
  /** Whether "Run it again" is still open for the latest interview. */
  canRerun: boolean;
  freshCount: number;
  sessions: MockRecord[];
}

const sameDrill = (a: DrillSpec, b: DrillSpec) => a.kind === b.kind && a.questionId === b.questionId && a.group === b.group && a.habit === b.habit && a.topic === b.topic && a.skill === b.skill;

export function standing(interview: Interview): Standing {
  const sessions = doneSessions(interview.id);
  const fresh = sessions.filter(isFresh);
  const last = fresh[0] ?? null;
  const rows = last ? rowsFor(last) : [];
  const report = last ? buildReport(rows, interview.interviewer.name) : null;
  const categories: Partial<Record<QuestionGroup, number>> = {};
  for (const m of fresh) {
    const c = categoryScores(rowsFor(m));
    for (const g of CATEGORY_ORDER) if (categories[g] == null && c[g] != null) categories[g] = c[g];
  }
  const u = understandingOf(interview);
  const shortOf = (id: string) => interview.questions.find((q) => q.id === id)?.short ?? "this question";
  const doneDrills = sessions.filter((m) => m.kind === "drill" && m.drill?.fromSession === last?.id).map((m) => m.drill!);
  const storiesBuilt = new Set((interview.stories ?? []).map((s) => s.skill).filter(Boolean));
  const drills = report && last
    ? suggestDrills({ sessionId: last.id, rows, fixes: report.fixes, categories: report.categories, gaps: (interview.gaps ?? []).filter((g) => !storiesBuilt.has(g.skill)), technicalLabel: u.technicalLabel, shortOf }).map((d) => ({
        ...d,
        done: doneDrills.some((x) => sameDrill(x, d.spec)),
      }))
    : [];
  return {
    last,
    report,
    rows,
    verdict: report?.verdict ?? null,
    categories,
    drills,
    canRerun: Boolean(last && rerunOf(last.id)?.status !== "done"),
    freshCount: fresh.length,
    sessions,
  };
}

/* ---------------------------------------------------------------- top-ups */

const g = globalThis as unknown as { __hakkiriTopUps?: Map<string, Promise<unknown>> };
const running = (g.__hakkiriTopUps ??= new Map());

/** Waits for any question writing already under way for this interview. */
async function settled(interviewId: string) {
  await running.get(interviewId)?.catch(() => undefined);
}

function withLock<T>(interviewId: string, work: () => Promise<T>): Promise<T> {
  const prev = running.get(interviewId) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(work);
  running.set(interviewId, next);
  void next.finally(() => running.get(interviewId) === next && running.delete(interviewId)).catch(() => undefined);
  return next;
}

/**
 * Makes sure the bank has enough unheard questions (and spares) for an
 * interview with these settings, writing more if it can. Run after each
 * session, so your next "New questions" doesn't wait.
 */
export function topUp(interviewId: string, settings?: SessionSettings): Promise<void> {
  return withLock(interviewId, async () => {
    const interview = (await getInterviewAsync(interviewId)) ?? getInterview(interviewId);
    if (!interview) return;
    // A background nicety: skip it once a spending limit is reached, rather than spend more.
    if (limitReached()) return;
    const s = settings ?? settingsOr(interview.settings, interview.style);
    const lastAsked = await lastAskedMapAsync(interviewId);
    const need = questionsNeeded(pickQuestions(interview.questions, s, lastAsked));
    if (needsAny(need)) await addQuestions(interview, need, { difficulty: s.difficulty });
  });
}

/* --------------------------------------------------------------- planning */

export class PlanError extends Error {}

/** An interview with new questions. Writes more first if the bank is short. */
export async function planInterview(interviewId: string, settings: SessionSettings): Promise<MockRecord> {
  await settled(interviewId);
  let interview = (await getInterviewAsync(interviewId)) ?? getInterview(interviewId);
  if (!interview) throw new PlanError("That interview doesn’t exist any more.");
  // Remember these settings for next time.
  // A named mix sets the round too (it decides how the pay drill talks about pay).
  interview = updateInterview(interviewId, (i) => ({ ...i, settings, style: styleFor(settings.difficulty), round: settings.preset === "custom" ? i.round : roundFor(settings.preset) })) ?? interview;
  await saveInterviewAsync(interview);
  const lastAsked = await lastAskedMapAsync(interviewId);
  let picked = pickQuestions(interview.questions, settings, lastAsked);
  const need = questionsNeeded(picked);
  if (needsAny(need)) {
    await withLock(interviewId, async () => {
      const fresh = (await getInterviewAsync(interviewId)) ?? getInterview(interviewId)!;
      await addQuestions(fresh, need, { difficulty: settings.difficulty });
    });
    interview = getInterview(interviewId)!;
    picked = pickQuestions(interview.questions, settings, lastAsked);
  }
  // Still short (the standard set ran out without a key): bring back the ones you had longest ago (same difficulty only).
  if (CATEGORY_ORDER.some((c) => picked.short[c] > 0)) picked = pickQuestions(interview.questions, settings, lastAsked, { allowRepeats: true });
  if (picked.questionIds.length === 0) throw new PlanError("There are no questions for these settings yet.");
  const session = createSession({ interviewId, kind: "interview", settings, questionIds: picked.questionIds, spareIds: picked.spareIds, style: styleFor(settings.difficulty) });
  await saveMockAsync(session);
  return session;
}

/** "Run it again": the same main questions as that interview, once. */
export function planRerun(interviewId: string, sessionId: string): MockRecord {
  const source = findMock(sessionId);
  if (!source || source.interviewId !== interviewId || !isFresh(source)) throw new PlanError("That interview can’t be run again.");
  const existing = rerunOf(source.id);
  if (existing?.status === "done") throw new PlanError("You’ve already run this interview again. Try new questions instead.");
  if (existing?.status === "planned") return existing;
  // The questions you answered, in the order you had them (a spare that replaced a skip included).
  const skipped = new Set((source.skipped ?? []).map((s) => s.questionId));
  const ids = [...new Set(rowsFor(source).map((r) => r.questionId))].filter((id) => !skipped.has(id));
  if (!ids.length) throw new PlanError("That interview has no answers to run again.");
  const interview = getInterview(interviewId)!;
  const settings = source.settings ?? settingsOr(interview.settings, interview.style);
  return createSession({ interviewId, kind: "rerun", rerunOf: source.id, settings, questionIds: ids, spareIds: [], style: source.style ?? styleFor(settings.difficulty) });
}

/**
 * The four "Talking about pay" questions, written for the interview's round,
 * added to the bank the first time you do the drill. They're never asked in
 * an interview or another drill.
 */
export function ensurePayQuestions(interviewId: string): Interview | undefined {
  const interview = getInterview(interviewId);
  if (!interview) return undefined;
  const pay = payQuestions(payStage(interview.round), interview.company).map((q) => ({ ...q, group: "motivation" as const, pay: true }));
  // Already there, written for this round: nothing to do.
  if (pay.every((p) => interview.questions.some((q) => q.id === p.id && q.text === p.text))) return interview;
  return updateInterview(interviewId, (i) => {
    const closing = i.questions.filter((q) => q.slot === "closing");
    const rest = i.questions.filter((q) => q.slot !== "closing" && !PAY_IDS.includes(q.id as (typeof PAY_IDS)[number]));
    return { ...i, questions: [...rest, ...pay, ...closing] };
  });
}

/** A drill: its questions come from the bank (writing more for a category drill if needed). */
export async function planDrill(interviewId: string, spec: DrillSpec): Promise<MockRecord> {
  await settled(interviewId);
  let interview = spec.kind === "pay" ? ensurePayQuestions(interviewId) : ((await getInterviewAsync(interviewId)) ?? getInterview(interviewId));
  if (!interview) throw new PlanError("That interview doesn’t exist any more.");
  const settings = settingsOr(interview.settings, interview.style);
  const lastAsked = await lastAskedMapAsync(interviewId);
  if (spec.kind === "category" && spec.group) {
    const unheard = interview.questions.filter(
      (q) => q.group === spec.group && !q.slot && !q.retired && !q.pay && matchesDifficulty(q, settings.difficulty) && !lastAsked.has(q.id),
    ).length;
    if (unheard < 3 && canWrite()) {
      await withLock(interviewId, () => addQuestions(getInterview(interviewId)!, { [spec.group!]: 3 - unheard }, { difficulty: settings.difficulty }));
      interview = getInterview(interviewId)!;
    }
  }
  const ids = drillQuestions(spec, interview.questions, lastAsked, enabledGroups(settings.mix), settings.difficulty);
  if (!ids.length) throw new PlanError("There are no questions for that focused practice yet.");
  // A category drill starts at your difficulty and gets harder as you do well; a pressure drill is always tough.
  const style = spec.kind === "pressure" ? "tough" : styleFor(settings.difficulty);
  const rec = createSession({ interviewId, kind: "drill", drill: spec, settings, questionIds: ids, spareIds: [], style });
  await saveMockAsync(rec);
  return rec;
}

/* ---------------------------------------------------------------- skipping */

/**
 * Questions you skipped are set aside for good: they never come back, not
 * even when the standard set runs out and older questions are allowed again.
 * "Tell me about yourself" and the closing question can't be skipped.
 */
export function retireSkipped(interviewId: string, skipped: Pick<SkipRecord, "questionId" | "reason">[]) {
  const ids = new Set(skipped.filter((s) => s.reason !== "by-choice").map((s) => s.questionId));
  if (!ids.size) return;
  updateInterview(interviewId, (i) => ({ ...i, questions: i.questions.map((q) => (ids.has(q.id) && !q.slot ? { ...q, retired: true } : q)) }));
}

/* ---------------------------------------------------------------- stopping */

/**
 * "Something's wrong": the session stops and isn't scored, and your feedback
 * is kept for the rebuild. Skip reasons count as feedback too.
 */
export function stopSession(sessionId: string, feedback: { reasons: WrongReason[]; note: string; askedIds: string[]; skipped: SkipRecord[] }): MockRecord {
  const m = findMock(sessionId);
  if (!m || m.status !== "planned") throw new PlanError("That interview has already finished.");
  const stopped: MockRecord = { ...m, status: "stopped", finishedAt: new Date().toISOString(), askedIds: feedback.askedIds, skipped: feedback.skipped, feedback: { reasons: feedback.reasons, note: feedback.note } };
  saveMock(stopped);
  retireSkipped(m.interviewId, feedback.skipped);
  return stopped;
}

/** Rethinks the job from the feedback on a stopped session. */
export async function rethinkFrom(interviewId: string, sessionId: string) {
  const interview = getInterview(interviewId);
  const m = findMock(sessionId);
  if (!interview || !m || m.interviewId !== interviewId || m.status !== "stopped") throw new PlanError("There’s nothing to rebuild from.");
  // "Tell me about yourself" and the closing question are asked in every interview: never a reason to rebuild.
  const text = (id: string) => interview.questions.find((q) => q.id === id && !q.slot)?.text;
  const asked = (m.askedIds ?? []).map(text).filter((t): t is string => Boolean(t));
  const skippedText = (m.skipped ?? []).map((s) => text(s.questionId)).filter((t): t is string => Boolean(t));
  const result = await rethink(interview, { reasons: m.feedback?.reasons ?? [], note: m.feedback?.note ?? "", asked: [...skippedText, ...asked.filter((a) => !skippedText.includes(a))], skipped: skippedText });
  return { ...result, attempt: (interview.rebuilds ?? 0) + 1 };
}

/**
 * Rebuilds the questions: saves the corrected understanding and rules, sets
 * aside every question you haven't heard, writes a fresh set and plans a new
 * interview with your settings.
 */
export async function rebuildAndPlan(interviewId: string, change: { understanding: Interview["understanding"]; rules: string[]; documents?: Partial<NonNullable<Interview["documents"]>>; sources?: Interview["sources"]; templates?: boolean }, opts: { start: boolean }): Promise<{ interview: Interview; session: MockRecord | null }> {
  await settled(interviewId);
  const base = getInterview(interviewId);
  if (!base) throw new PlanError("That interview doesn’t exist any more.");
  const rules = mergeRules(base.rules, change.rules);
  const updated = updateInterview(interviewId, (i) => ({
    ...i,
    understanding: change.understanding ?? i.understanding,
    role: change.understanding?.role && change.understanding.role !== understandingOf(i).role ? change.understanding.role : i.role,
    seniority: change.understanding?.level ?? i.seniority,
    rules,
    rebuilds: (i.rebuilds ?? 0) + 1,
    documents: change.documents && i.documents ? { ...i.documents, ...change.documents } : i.documents,
    sources: change.sources ? { ...i.sources, ...change.sources } : i.sources,
  }))!;
  const heard = [...(await lastAskedMapAsync(interviewId)).keys()];
  const settings = settingsOr(updated.settings, updated.style);
  const need = questionsNeeded(pickQuestions(updated.questions.map((q) => (q.slot || heard.includes(q.id) ? q : { ...q, retired: true })), settings, await lastAskedMapAsync(interviewId)));
  await withLock(interviewId, () => addQuestions(updated, need, { retireExcept: heard, templatesOnly: change.templates, difficulty: settings.difficulty }));
  if (change.templates) updateInterview(interviewId, (i) => ({ ...i, planBy: "templates" }));
  const session = opts.start ? await planInterview(interviewId, settings) : null;
  return { interview: getInterview(interviewId)!, session };
}

/** The live screen can't open a session that has finished. */
export function openSession(interviewId: string, sessionId: string): MockRecord | null {
  const m = findMock(sessionId);
  return m && m.interviewId === interviewId ? m : null;
}

export { listMocks };

/* -------------------------------------------------------------- next step */

/** What Home's Continue does for an interview: open it, start a drill, or set up new questions. */
export interface NextStep {
  label: string;
  detail: string;
  /** A page to open. */
  href?: string;
  /** A drill to plan and start (Continue goes straight into it). */
  drill?: DrillSpec;
}

export function interviewNextStep(interview: Interview, st: Standing = standing(interview)): NextStep {
  if (!st.last) return { label: "Start your first interview", detail: "Check what Hakkiri understood, then start", href: `/interviews/${interview.id}` };
  const drill = st.drills.find((d) => !d.done);
  if (drill?.spec.kind === "story") {
    return { label: drill.title, detail: `${drill.minutes} min`, href: `/interviews/${interview.id}/story?skill=${encodeURIComponent(drill.spec.skill ?? "")}&question=${encodeURIComponent(drill.spec.question ?? "")}` };
  }
  if (drill) return { label: drill.title, detail: `Focused practice, ${drill.minutes} min`, drill: drill.spec };
  return { label: "New questions", detail: st.verdict === "ready" ? "Keep it fresh before the day" : "Leans towards your weakest category", href: `/interviews/${interview.id}#new-questions` };
}
