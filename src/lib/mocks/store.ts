import { randomUUID } from "node:crypto";
import type { InterviewerStyle, QuestionGroup } from "@/lib/types";
import { demoMock, roadmapAnswer } from "@/lib/mock-data";
import { getInterview } from "@/lib/interviews/store";
import { findAnswer } from "@/lib/answers/store";
import { rowFromAnswer, mockScore, type MockRow } from "./report";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured } from "@/lib/storage/mongodb";
import type { SessionSettings } from "@/lib/interviews/settings";
import type { DrillSpec } from "@/lib/sessions/drills";
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

export function saveMock(m: MockRecord) {
  store.set(m.id, m);
  persist();
}

/** Plans a session: its questions and spares are fixed now, so the live screen and the report agree. */
export function createSession(s: Omit<MockRecord, "id" | "status" | "startedAt" | "finishedAt" | "answerIds" | "planned">): MockRecord {
  const now = new Date().toISOString();
  const rec: MockRecord = { ...s, id: randomUUID(), status: "planned", startedAt: now, finishedAt: now, answerIds: [], planned: s.questionIds?.length ?? 0 };
  saveMock(rec);
  return rec;
}

export function findMock(id: string): MockRecord | undefined {
  return store.get(id) ?? (id === demo.id ? demo : undefined);
}

export async function findMockAsync(id: string): Promise<MockRecord | undefined> {
  const cached = findMock(id);
  if (cached) return cached;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<MockRecord[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          store.set(item.id, item);
        }
        const found = findMock(id);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[mocks/store] MongoDB load mocks failed:", err);
    }
  }

  return findMock(id);
}

/** Every session for an interview, newest first (planned ones included). */
export function listMocks(interviewId: string): MockRecord[] {
  const demoHere = !store.has(demo.id) ? [demo] : [];
  return [...store.values(), ...demoHere].filter((m) => m.interviewId === interviewId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export const isDone = (m: MockRecord) => (m.status ?? "done") === "done";

/** Interviews with new questions: the only ones that count towards your verdict. */
export const isFresh = (m: MockRecord) => isDone(m) && (m.kind === "interview" || m.kind === "full" || m.kind === "first");

/** Finished sessions, newest first. */
export function doneSessions(interviewId: string): MockRecord[] {
  return listMocks(interviewId).filter(isDone);
}

/**
 * When each question was last asked, across every session that got going
 * (stopped ones included: you heard those questions).
 */
export function lastAskedMap(interviewId: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of [...listMocks(interviewId)].reverse()) {
    if (m.status === "planned") continue;
    const asked = m.askedIds ?? (m.rows ?? []).map((r) => r.questionId).concat(m.answerIds.map((id) => findAnswer(id)?.questionId ?? "")).filter(Boolean);
    for (const id of asked) out.set(id, m.startedAt);
  }
  return out;
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
    const q = a && interview?.questions.find((x) => x.id === a.questionId);
    return a && q ? [rowFromAnswer(a, q, a.questionNumber)] : [];
  });
  // Numbered 1, 2, 3… in the order answered (a skipped opening leaves no gap).
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

export function allMocks(): MockRecord[] {
  return [...store.values()];
}

/** "Delete all my data". */
export function clearMocks() {
  store.clear();
  persist();
}
