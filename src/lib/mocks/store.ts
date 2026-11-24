import { randomUUID } from "node:crypto";
import type { InterviewerStyle, QuestionGroup } from "@/lib/types";
import { demoMock, roadmapAnswer } from "@/lib/mock-data";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync, listAnswers, listAnswersAsync } from "@/lib/answers/store";
import { rowFromAnswer, mockScore, type MockRow } from "./report";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured, saveToMongo, loadFromMongo, deleteFromMongo } from "@/lib/storage/mongodb";
import type { SessionSettings } from "@/lib/interviews/settings";
import type { DrillSpec } from "@/lib/sessions/drills";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import type { WrongReason } from "@/lib/ai/interview/questions";

/**
 * Interview sessions (build plan: "Mock sessions" table): an interview with
 * new questions, a re-run of one (same questions, once), or a drill.
 * A session is planned when you press Start (its questions and spares are
 * chosen then), and done when the report is written, or stopped when you
 * press "Something's wrong". Saved to the local data folder until the
 * database lands. Older records have kinds "full", "group" and "first".
 */

export type SessionKind = "interview" | "rerun" | "drill" | "full" | "group" | "first";

/** "by-choice" is skipping the opening or your questions for them: no reason needed, no replacement, no rule. */
export const SKIP_REASONS = ["not-relevant", "not-true", "already-asked", "wrong-level", "said-so", "by-choice"] as const;
export type SkipReason = (typeof SKIP_REASONS)[number];

export const SKIP_REASON_LABEL: Record<SkipReason, string> = {
  "not-relevant": "Not relevant to the role",
  "not-true": "Not true about me",
  "already-asked": "Already asked",
  "wrong-level": "Wrong level",
  "said-so": "You said it didn’t apply",
  "by-choice": "Skipped",
};

export interface SkipRecord {
  questionId: string;
  reason: SkipReason;
  /** The spare asked instead, if there was one. */
  replacedBy?: string;
}

export interface MockRecord {
  id: string;
  userId?: string;
  interviewId: string;
  kind: SessionKind;
  /** Missing on older records, which are all done. */
  status?: "planned" | "done" | "stopped";
  settings?: SessionSettings;
  /** The questions chosen for the session, in order (opening first, closing last). */
  questionIds?: string[];
  /** Spares for skips, by category. */
  spareIds?: string[];
  /** The questions actually reached, skipped ones included. */
  askedIds?: string[];
  skipped?: SkipRecord[];
  /** The interview this one re-runs. */
  rerunOf?: string;
  drill?: DrillSpec;
  /** What you said was wrong, when you stopped it. */
  feedback?: { reasons: WrongReason[]; note: string };
  group?: QuestionGroup;
  style?: InterviewerStyle;
  startedAt: string;
  finishedAt: string;
  /** Saved answers, in the order they were asked. */
  answerIds: string[];
  /** How many questions were planned (fewer were answered if it ended early). */
  planned: number;
  /** Demo records carry summary rows and the score before them. */
  rows?: MockRow[];
  previous?: { score: number; label: string };
}

const FILE = "mocks.json";
const g = globalThis as unknown as { __hakkiriMocks?: Map<string, MockRecord> };
const store = (g.__hakkiriMocks ??= new Map<string, MockRecord>(loadJson<MockRecord[]>(FILE, []).map((m) => [m.id, m])));

const demo: MockRecord = {
  ...demoMock,
  answerIds: [roadmapAnswer.id],
  planned: 6,
};

const persist = () => saveJson(FILE, [...store.values()]);

/** Records as they were saved, by id. One with no owner belonged to nobody in particular and is not loaded. */
function remember(list: unknown) {
  if (Array.isArray(list)) for (const item of list as MockRecord[]) if (item?.id && item.userId) store.set(item.id, item);
}

export function saveMock(m: MockRecord, userId: string) {
  if (!userId || m.id === demo.id) return;
  store.set(m.id, { ...m, userId });
  persist();
}

export async function saveMockAsync(m: MockRecord, userId: string): Promise<void> {
  if (!userId || m.id === demo.id) return;
  const item = { ...m, userId };
  store.set(m.id, item);
  if (isMongoConfigured()) {
    try {
      // 1. Direct document persistence in "mocks" collection
      await saveToMongo("mocks", item.id, item);

      // 2. Safe merge into "storage" collection mocks.json
      remember(await loadJsonAsync<MockRecord[]>(FILE, []));
      store.set(item.id, item);
      await saveJsonAsync(FILE, [...store.values()]);
      return;
    } catch (err) {
      console.warn("[mocks/store] saveMockAsync mongo failed:", err);
    }
  }
  persist();
}

/** Records a question as already presented/answered on an active planned session so even mid-session exits won't repeat it. */
export async function recordAskedQuestionAsync(sessionId: string | undefined, questionId: string, userId: string): Promise<void> {
  if (!sessionId || !questionId || !userId) return;
  const existing = (await findMockAsync(sessionId, userId)) ?? findMock(sessionId, userId);
  if (!existing || existing.id === demo.id) return;
  const prev = existing.askedIds ?? [];
  if (prev.includes(questionId)) return;
  await saveMockAsync({ ...existing, askedIds: [...prev, questionId] }, userId);
}

/** Plans a session: its questions and spares are fixed now, so the live screen and the report agree. */
export function createSession(s: Omit<MockRecord, "id" | "status" | "startedAt" | "finishedAt" | "answerIds" | "planned">, userId: string): MockRecord {
  const now = new Date().toISOString();
  const rec: MockRecord = { ...s, userId, id: randomUUID(), status: "planned", startedAt: now, finishedAt: now, answerIds: [], planned: s.questionIds?.length ?? 0 };
  saveMock(rec, userId);
  return rec;
}

/**
 * One person's session, or nothing. With no account named, or for a session
 * that is someone else's or has no owner, nothing is returned. The built-in
 * demo session can be read by anyone and is never changed.
 */
export function findMock(id: string, userId: string): MockRecord | undefined {
  if (id === demo.id) return demo;
  const m = store.get(id);
  return m && !!userId && m.userId === userId ? m : undefined;
}

export async function findMockAsync(id: string, userId: string): Promise<MockRecord | undefined> {
  const cached = findMock(id, userId);
  if (cached || !userId) return cached;

  if (isMongoConfigured()) {
    try {
      // 1. Direct document fetch from "mocks" collection
      const direct = await loadFromMongo<MockRecord>("mocks", id);
      if (direct && direct.id) {
        remember([direct]);
        const res = findMock(id, userId);
        if (res) return res;
      }

      // 2. Fallback to FILE array in storage collection
      remember(await loadJsonAsync<MockRecord[]>(FILE, []));
      const found = findMock(id, userId);
      if (found) return found;
    } catch (err) {
      console.warn("[mocks/store] MongoDB load mocks failed:", err);
    }
  }

  return findMock(id, userId);
}

/** Every session one person has for an interview, newest first (planned ones included). The demo interview also has its built-in example session. */
export function listMocks(interviewId: string, userId: string): MockRecord[] {
  if (!userId) return [];
  const mine = [...store.values()].filter((m) => m.interviewId === interviewId && m.userId === userId && m.id !== demo.id);
  const example = interviewId === demo.interviewId ? [demo] : [];
  return [...mine, ...example].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function listMocksAsync(interviewId: string, userId: string): Promise<MockRecord[]> {
  if (isMongoConfigured()) {
    try {
      remember(await loadJsonAsync<MockRecord[]>(FILE, []));
    } catch (err) {
      console.warn("[mocks/store] MongoDB listMocks failed:", err);
    }
  }
  return listMocks(interviewId, userId);
}

export const isDone = (m: MockRecord) =>
  (m.status ?? "done") === "done" || (m.answerIds && m.answerIds.length > 0) || (m.rows && m.rows.length > 0);

/** Interviews with new questions: the only ones that count towards your verdict. */
export const isFresh = (m: MockRecord) => isDone(m) && (m.kind === "interview" || m.kind === "full" || m.kind === "first");

/** One person's finished sessions for an interview, newest first. */
export function doneSessions(interviewId: string, userId: string): MockRecord[] {
  return listMocks(interviewId, userId).filter(isDone);
}

/**
 * When each question was last asked, across finished/stopped sessions, any
 * questions already reached in an in-progress session, and saved answers
 * (covering single questions, topic drills and mid-session exits).
 */
export function lastAskedMap(interviewId: string, userId: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of [...listMocks(interviewId, userId)].reverse()) {
    if (m.status === "planned") {
      const seenPlanned = [
        ...(m.askedIds ?? []),
        ...(m.skipped ?? []).map((s) => s.questionId),
        ...m.answerIds.map((id) => findAnswer(id, userId)?.questionId ?? ""),
      ].filter(Boolean);
      for (const id of seenPlanned) out.set(id, m.startedAt);
      continue;
    }
    const asked = m.askedIds ?? (m.rows ?? []).map((r) => r.questionId).concat(m.answerIds.map((id) => findAnswer(id, userId)?.questionId ?? "")).filter(Boolean);
    for (const id of asked) out.set(id, m.startedAt);
  }
  for (const a of listAnswers(interviewId, userId)) {
    if (a.questionId) out.set(a.questionId, a.createdAt ?? new Date().toISOString());
  }
  return out;
}

export async function lastAskedMapAsync(interviewId: string, userId: string): Promise<Map<string, string>> {
  await Promise.all([listMocksAsync(interviewId, userId), listAnswersAsync(interviewId, userId)]);
  return lastAskedMap(interviewId, userId);
}

/** The re-run of one of a person's interviews, if they have done (or started) one. */
export function rerunOf(sessionId: string, userId: string): MockRecord | undefined {
  if (!userId) return undefined;
  return [...store.values()].find((m) => m.rerunOf === sessionId && m.userId === userId && m.status !== "stopped");
}

/** The report rows for a session, in the order the questions were asked, as its owner (`userId`) sees them. */
export function rowsFor(m: MockRecord, userId: string): MockRow[] {
  const interview = getInterview(m.interviewId, userId);
  const fromAnswers = m.answerIds.flatMap((id) => {
    const a = findAnswer(id, userId);
    const q = a ? resolveInterviewQuestion(interview, a.questionId) : undefined;
    return a && q ? [rowFromAnswer(a, q, a.questionNumber)] : [];
  });
  // Numbered 1, 2, 3… in the order answered (a skipped opening leaves no gap).
  return [...(m.rows ?? []), ...fromAnswers].sort((a, b) => a.number - b.number).map((r, k) => ({ ...r, number: k + 1 }));
}

export async function rowsForAsync(m: MockRecord, userId: string): Promise<MockRow[]> {
  if (m.rows && m.rows.length > 0 && (!m.answerIds || m.answerIds.length === 0 || m.rows.length >= m.answerIds.length)) {
    return m.rows.map((r, k) => ({ ...r, number: k + 1 }));
  }
  const interview = (await getInterviewAsync(m.interviewId, userId)) ?? getInterview(m.interviewId, userId);
  const fromAnswers = (
    await Promise.all(
      m.answerIds.map(async (id) => {
        const a = (await findAnswerAsync(id, userId)) ?? findAnswer(id, userId);
        const q = a ? resolveInterviewQuestion(interview, a.questionId) : undefined;
        return a && q ? [rowFromAnswer(a, q, a.questionNumber)] : [];
      })
    )
  ).flat();
  return [...(m.rows ?? []), ...fromAnswers].sort((a, b) => a.number - b.number).map((r, k) => ({ ...r, number: k + 1 }));
}

/** The score of the session of the same kind just before this one, to compare against. */
export function previousScore(m: MockRecord, userId: string): { score: number; label: string } | null {
  if (m.previous) return m.previous;
  const before = listMocks(m.interviewId, userId).find((x) => isFresh(x) && isFresh(m) && x.startedAt < m.startedAt);
  const score = before ? mockScore(rowsFor(before, userId)) : null;
  return score == null ? null : { score, label: "your last interview" };
}

/** The database keeps each session as its own document as well as in the list: a deleted session is removed from both. */
function forget(ids: string[]) {
  if (!isMongoConfigured() || !ids.length) return;
  for (const id of ids) void deleteFromMongo("mocks", id);
  void saveJsonAsync(FILE, [...store.values()]);
}

/** When an interview is deleted, its owner's sessions for it go too. */
export function deleteMocksFor(interviewId: string, userId: string) {
  if (!userId) return;
  const gone = [...store.values()].filter((m) => m.interviewId === interviewId && m.userId === userId).map((m) => m.id);
  for (const id of gone) store.delete(id);
  persist();
  forget(gone);
}

export function allMocks(userId?: string): MockRecord[] {
  return userId ? [...store.values()].filter((m) => m.userId === userId) : [...store.values()];
}

/** "Delete all my data". */
export function clearMocks(userId?: string) {
  const gone = [...store.values()].filter((m) => !userId || m.userId === userId).map((m) => m.id);
  for (const id of gone) store.delete(id);
  persist();
  forget(gone);
}
