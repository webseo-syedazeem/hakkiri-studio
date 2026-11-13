import type { Answer } from "@/lib/types";
import { answers as demoAnswers } from "@/lib/mock-data";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured, saveToMongo, loadFromMongo } from "@/lib/storage/mongodb";

/**
 * Scored answers (build plan: "Answers" table). Kept in memory and saved to
 * the local data folder, so they survive a restart until the database lands.
 * Kept on globalThis so they survive hot reloads in development.
 */
const FILE = "answers.json";
const g = globalThis as unknown as { __hakkiriAnswers?: Map<string, Answer> };
const store = (g.__hakkiriAnswers ??= new Map<string, Answer>(loadJson<Answer[]>(FILE, []).map((a) => [a.id, a])));

export function saveAnswer(answer: Answer, userId?: string) {
  const item = { ...answer, userId: userId || answer.userId, createdAt: answer.createdAt ?? new Date().toISOString() };
  store.set(answer.id, item);
  saveJson(FILE, [...store.values()]);
  if (isMongoConfigured()) {
    void saveAnswerAsync(item, userId);
  }
}

export async function saveAnswerAsync(answer: Answer, userId?: string): Promise<void> {
  const item = { ...answer, userId: userId || answer.userId, createdAt: answer.createdAt ?? new Date().toISOString() };
  store.set(answer.id, item);
  if (isMongoConfigured()) {
    try {
      // 1. Direct document persistence in "answers" collection
      await saveToMongo("answers", item.id, item);

      // 2. Safe merge into "storage" collection answers.json
      const fromDb = await loadJsonAsync<Answer[]>(FILE, []);
      const map = new Map<string, Answer>(Array.isArray(fromDb) ? fromDb.map((a) => [a.id, a]) : []);
      for (const [k, v] of store.entries()) map.set(k, v);
      map.set(item.id, item);
      for (const [k, v] of map.entries()) store.set(k, v);
      await saveJsonAsync(FILE, [...map.values()]);
      return;
    } catch (err) {
      console.warn("[answers/store] saveAnswerAsync mongo failed:", err);
    }
  }
  saveJson(FILE, [...store.values()]);
}

export function findAnswer(id: string, userId?: string): Answer | undefined {
  const a = store.get(id) ?? demoAnswers.find((x) => x.id === id);
  if (!a) return undefined;
  if (userId && a.userId && a.userId !== userId && !demoAnswers.some((x) => x.id === a.id)) {
    return undefined;
  }
  // Answers saved before follow-ups existed have no followUps list.
  return { ...a, followUps: a.followUps ?? [] };
}

export async function findAnswerAsync(id: string, userId?: string): Promise<Answer | undefined> {
  const cached = findAnswer(id, userId);
  if (cached && !demoAnswers.some((x) => x.id === cached.id)) return cached;

  if (isMongoConfigured()) {
    try {
      // 1. Direct fetch from "answers" collection
      const direct = await loadFromMongo<Answer>("answers", id);
      if (direct && direct.id) {
        const item = { ...direct, followUps: direct.followUps ?? [] };
        store.set(direct.id, item);
        return findAnswer(id, userId);
      }

      // 2. Fall back to answers.json in storage collection
      const fromDb = await loadJsonAsync<Answer[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          store.set(item.id, { ...item, followUps: item.followUps ?? [] });
        }
        const found = findAnswer(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[answers/store] MongoDB load answers failed:", err);
    }
  }

  return findAnswer(id, userId);
}

/** Answers you've recorded for an interview, oldest first (demo answers not included). */
export function listAnswers(interviewId: string, userId?: string): Answer[] {
  return [...store.values()]
    .filter((a) => a.interviewId === interviewId && (!userId || !a.userId || a.userId === userId))
    .map((a) => ({ ...a, followUps: a.followUps ?? [] }));
}

export async function listAnswersAsync(interviewId: string, userId?: string): Promise<Answer[]> {
  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Answer[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          if (item?.id) store.set(item.id, { ...item, followUps: item.followUps ?? [] });
        }
      }
    } catch (err) {
      console.warn("[answers/store] MongoDB listAnswers failed:", err);
    }
  }
  return listAnswers(interviewId, userId);
}

/** Deletes every answer to an interview; returns their ids (for their recordings). */
export function deleteAnswersFor(interviewId: string, userId?: string): string[] {
  const ids = [...store.values()]
    .filter((a) => a.interviewId === interviewId && (!userId || !a.userId || a.userId === userId))
    .map((a) => a.id);
  for (const id of ids) store.delete(id);
  saveJson(FILE, [...store.values()]);
  return ids;
}

export function allAnswers(userId?: string): Answer[] {
  return [...store.values()].filter((a) => !userId || !a.userId || a.userId === userId);
}

/** "Delete all my data". */
export function clearAnswers(userId?: string) {
  if (userId) {
    for (const [id, a] of store.entries()) {
      if (a.userId === userId) store.delete(id);
    }
    saveJson(FILE, [...store.values()]);
  } else {
    store.clear();
    saveJson(FILE, []);
  }
}
