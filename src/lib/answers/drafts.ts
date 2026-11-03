import type { FollowUpKind, InterviewerStyle } from "@/lib/types";
import type { Turn } from "@/lib/ai/types";
import type { Recording } from "./audio";

/**
 * An answer in progress: the main answer plus any follow-ups so far,
 * transcribed but not yet scored. Scoring happens once the interviewer
 * moves on, so the feedback covers the whole exchange.
 * In memory until the database lands; drafts expire after two hours.
 */
export interface Draft {
  id: string;
  interviewId: string;
  questionId: string;
  questionNumber: number;
  questionsInMock: number;
  followUpsOn: boolean;
  /** A drill can set how many follow-ups this question gets (the follow-up pressure drill asks three). */
  followUpLimit?: number;
  /** The interview, re-run or drill this answer belongs to (none for a single question). */
  sessionId?: string;
  /** The interviewer style chosen for this practice. */
  style: InterviewerStyle;
  turns: Turn[];
  /** The recording of each turn, for playback on the feedback screen. */
  audio: (Recording | null)[];
  /** The follow-up the interviewer has just asked and is waiting on. */
  pending: { kind: FollowUpKind; question: string } | null;
  createdAt: number;
}

const TTL_MS = 2 * 60 * 60 * 1000;
const g = globalThis as unknown as { __hakkiriDrafts?: Map<string, Draft> };
const drafts = (g.__hakkiriDrafts ??= new Map<string, Draft>());

export function saveDraft(d: Draft) {
  const now = Date.now();
  for (const [id, old] of drafts) if (now - old.createdAt > TTL_MS) drafts.delete(id);
  drafts.set(d.id, d);
}

export function getDraft(id: string): Draft | undefined {
  const d = drafts.get(id);
  if (d && Date.now() - d.createdAt > TTL_MS) {
    drafts.delete(id);
    return undefined;
  }
  return d;
}

export function deleteDraft(id: string) {
  drafts.delete(id);
}

/** "Delete all my data": answers still being scored. */
export function clearDrafts() {
  drafts.clear();
}
