import type { Answer } from "@/lib/types";
import type { Turn } from "@/lib/ai/types";
import type { Recording } from "@/lib/answers/audio";
import type { QaQuestion, QaStyle } from "./types";

/**
 * A Q&A session in progress: the questions, the answers so far (transcribed,
 * with any press and its reply), and each question's scoring as it runs in
 * the background. In memory until the session is saved; expires after two hours.
 */
export interface QaDraft {
  id: string;
  presentationId: string;
  style: QaStyle;
  persona: { name: string; title: string };
  questions: QaQuestion[];
  /** turns[k]: the answer to question k, then the press and its reply, if any. */
  turns: Turn[][];
  audio: (Recording | null)[][];
  /** The press waiting for a reply, per question. */
  pending: ({ kind: "challenge" | "clarify"; question: string } | null)[];
  scoring: (Promise<Answer | null> | null)[];
  startedAt: string;
  createdAt: number;
}

const TTL_MS = 2 * 60 * 60 * 1000;
const g = globalThis as unknown as { __hakkiriQaDrafts?: Map<string, QaDraft> };
const drafts = (g.__hakkiriQaDrafts ??= new Map<string, QaDraft>());

export function saveQaDraft(d: QaDraft) {
  const now = Date.now();
  for (const [id, old] of drafts) if (now - old.createdAt > TTL_MS) drafts.delete(id);
  drafts.set(d.id, d);
}

export function getQaDraft(id: string): QaDraft | undefined {
  const d = drafts.get(id);
  if (d && Date.now() - d.createdAt > TTL_MS) {
    drafts.delete(id);
    return undefined;
  }
  return d;
}

export function deleteQaDraft(id: string) {
  drafts.delete(id);
}

/** "Delete all my data": answers still being scored. */
export function clearQaDrafts() {
  drafts.clear();
}
