import { randomUUID } from "node:crypto";
import type { InterviewerStyle, QuestionGroup } from "@/lib/types";
import { demoMock, roadmapAnswer } from "@/lib/mock-data";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync, listAnswers, listAnswersAsync } from "@/lib/answers/store";
import { rowFromAnswer, mockScore, type MockRow } from "./report";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured } from "@/lib/storage/mongodb";
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

export function saveMock(m: MockRecord, userId?: string) {
  const item = { ...m, userId: userId || m.userId };
  store.set(m.id, item);
  persist();
}

export async function saveMockAsync(m: MockRecord, userId?: string): Promise<void> {
  const item = { ...m, userId: userId || m.userId };
  store.set(m.id, item);
  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<MockRecord[]>(FILE, []);
      const map = new Map<string, MockRecord>(Array.isArray(fromDb) ? fromDb.map((x) => [x.id, x]) : []);
      for (const [k, v] of store.entries()) map.set(k, v);
      map.set(item.id, item);
      for (const [k, v] of map.entries()) store.set(k, v);
      await saveJsonAsync(FILE, [...map.values()]);
      return;
    } catch (err) {
      console.warn("[mocks/store] saveMockAsync mongo failed:", err);
    }
  }
  persist();
}

/** Records a question as already presented/answered on an active planned session so even mid-session exits won't repeat it. */
export async function recordAskedQuestionAsync(sessionId: string | undefined, questionId: string): Promise<void> {
  if (!sessionId || !questionId) return;
  const existing = (await findMockAsync(sessionId)) ?? findMock(sessionId);
  if (!existing) return;
  const prev = existing.askedIds ?? [];
  if (prev.includes(questionId)) return;
  await saveMockAsync({ ...existing, askedIds: [...prev, questionId] });
}

/** Plans a session: its questions and spares are fixed now, so the live screen and the report agree. */
export function createSession(s: Omit<MockRecord, "id" | "status" | "startedAt" | "finishedAt" | "answerIds" | "planned">): MockRecord {
  const now = new Date().toISOString();
  const rec: MockRecord = { ...s, id: randomUUID(), status: "planned", startedAt: now, finishedAt: now, answerIds: [], planned: s.questionIds?.length ?? 0 };
  saveMock(rec);
  return rec;
}

export function findMock(id: string, userId?: string): MockRecord | undefined {
  const m = store.get(id) ?? (id === demo.id ? demo : undefined);
  if (!m) return undefined;
  if (userId && m.userId && m.userId !== userId && m.id !== demo.id) return undefined;
  return m;
}

export async function findMockAsync(id: string, userId?: string): Promise<MockRecord | undefined> {
  const cached = findMock(id, userId);
  if (cached) return cached;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<MockRecord[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          store.set(item.id, item);
        }
        const found = findMock(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[mocks/store] MongoDB load mocks failed:", err);
    }
  }

  return findMock(id, userId);
}

/** Every session for an interview, newest first (planned ones included). */
export function listMocks(interviewId: string, userId?: string): MockRecord[] {
  const demoHere = !store.has(demo.id) ? [demo] : [];
  return [...store.values(), ...demoHere]
    .filter((m) => m.interviewId === interviewId && (!userId || !m.userId || m.userId === userId))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function listMocksAsync(interviewId: string): Promise<MockRecord[]> {
  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<MockRecord[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          if (item?.id) store.set(item.id, item);
        }
      }
    } catch (err) {
      console.warn("[mocks/store] MongoDB listMocks failed:", err);
    }
  }
  return listMocks(interviewId);
}

export const isDone = (m: MockRecord) => (m.status ?? "done") === "done";

/** Interviews with new questions: the only ones that count towards your verdict. */
export const isFresh = (m: MockRecord) => isDone(m) && (m.kind === "interview" || m.kind === "full" || m.kind === "first");

/** Finished sessions, newest first. */
export function doneSessions(interviewId: string): MockRecord[] {
  return listMocks(interviewId).filter(isDone);
}

/**
 * When each question was last asked, across finished/stopped sessions, any
 * questions already reached in an in-progress session, and saved answers
 * (covering single questions, topic drills and mid-session exits).
 */
export function lastAskedMap(interviewId: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of [...listMocks(interviewId)].reverse()) {
    if (m.status === "planned") {
      const seenPlanned = [
        ...(m.askedIds ?? []),
        ...(m.skipped ?? []).map((s) => s.questionId),
        ...m.answerIds.map((id) => findAnswer(id)?.questionId ?? ""),
      ].filter(Boolean);
      for (const id of seenPlanned) out.set(id, m.startedAt);
      continue;
    }
    const asked = m.askedIds ?? (m.rows ?? []).map((r) => r.questionId).concat(m.answerIds.map((id) => findAnswer(id)?.questionId ?? "")).filter(Boolean);
    for (const id of asked) out.set(id, m.startedAt);
  }
  for (const a of listAnswers(interviewId)) {
    if (a.questionId) out.set(a.questionId, a.createdAt ?? new Date().toISOString());
  }
  return out;
}

export async function lastAskedMapAsync(interviewId: string): Promise<Map<string, string>> {
  await Promise.all([listMocksAsync(interviewId), listAnswersAsync(interviewId)]);
  return lastAskedMap(interviewId);
}

/** The re-run of an interview, if you've done (or started) one. */
export function rerunOf(sessionId: string): MockRecord | undefined {
  return [...store.values()].find((m) => m.rerunOf === sessionId && m.status !== "stopped");
}

/** The report rows for a session, in the order the questions were asked. */
export function rowsFor(m: MockRecord): MockRow[] {
  const interview = getInterview(m.interviewId);
  const fromAnswers = m.answerIds.flatMap((id) => {
    const a = findAnswer(id);
    const q = a ? resolveInterviewQuestion(interview, a.questionId) : undefined;
    return a && q ? [rowFromAnswer(a, q, a.questionNumber)] : [];
  });
  // Numbered 1, 2, 3… in the order answered (a skipped opening leaves no gap).
  return [...(m.rows ?? []), ...fromAnswers].sort((a, b) => a.number - b.number).map((r, k) => ({ ...r, number: k + 1 }));
}

export async function rowsForAsync(m: MockRecord): Promise<MockRow[]> {
  const interview = (await getInterviewAsync(m.interviewId)) ?? getInterview(m.interviewId);
  const fromAnswers = (
    await Promise.all(
      m.answerIds.map(async (id) => {
        const a = (await findAnswerAsync(id)) ?? findAnswer(id);
        const q = a ? resolveInterviewQuestion(interview, a.questionId) : undefined;
        return a && q ? [rowFromAnswer(a, q, a.questionNumber)] : [];
      })
    )
  ).flat();
  return [...(m.rows ?? []), ...fromAnswers].sort((a, b) => a.number - b.number).map((r, k) => ({ ...r, number: k + 1 }));
}

/** The score of the session of the same kind just before this one, to compare against. */
export function previousScore(m: MockRecord): { score: number; label: string } | null {
  if (m.previous) return m.previous;
  const before = listMocks(m.interviewId).find((x) => isFresh(x) && isFresh(m) && x.startedAt < m.startedAt);
  const score = before ? mockScore(rowsFor(before)) : null;
  return score == null ? null : { score, label: "your last interview" };
}

export function deleteMocksFor(interviewId: string) {
  for (const [id, m] of store) if (m.interviewId === interviewId) store.delete(id);
  persist();
}

export function allMocks(userId?: string): MockRecord[] {
  return [...store.values()].filter((m) => !userId || !m.userId || m.userId === userId);
}

/** "Delete all my data". */
export function clearMocks(userId?: string) {
  if (userId) {
    for (const [id, m] of store.entries()) {
      if (m.userId === userId) store.delete(id);
    }
  } else {
    store.clear();
  }
  persist();
}
