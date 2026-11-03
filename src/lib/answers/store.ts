import type { Answer } from "@/lib/types";
import { answers as demoAnswers } from "@/lib/mock-data";
import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * Scored answers (build plan: "Answers" table). Kept in memory and saved to
 * the local data folder, so they survive a restart until the database lands.
 * Kept on globalThis so they survive hot reloads in development.
 */
const FILE = "answers.json";
const g = globalThis as unknown as { __hakkiriAnswers?: Map<string, Answer> };
const store = (g.__hakkiriAnswers ??= new Map<string, Answer>(loadJson<Answer[]>(FILE, []).map((a) => [a.id, a])));

export function saveAnswer(answer: Answer) {
  store.set(answer.id, { ...answer, createdAt: answer.createdAt ?? new Date().toISOString() });
  saveJson(FILE, [...store.values()]);
}

export function findAnswer(id: string): Answer | undefined {
  const a = store.get(id) ?? demoAnswers.find((x) => x.id === id);
  // Answers saved before follow-ups existed have no followUps list.
  return a && { ...a, followUps: a.followUps ?? [] };
}

/** Answers you've recorded for an interview, oldest first (demo answers not included). */
export function listAnswers(interviewId: string): Answer[] {
  return [...store.values()].filter((a) => a.interviewId === interviewId).map((a) => ({ ...a, followUps: a.followUps ?? [] }));
}

/** Deletes every answer to an interview; returns their ids (for their recordings). */
export function deleteAnswersFor(interviewId: string): string[] {
  const ids = [...store.values()].filter((a) => a.interviewId === interviewId).map((a) => a.id);
  for (const id of ids) store.delete(id);
  saveJson(FILE, [...store.values()]);
  return ids;
}

export function allAnswers(): Answer[] {
  return [...store.values()];
}

/** "Delete all my data". */
export function clearAnswers() {
  store.clear();
  saveJson(FILE, []);
}
