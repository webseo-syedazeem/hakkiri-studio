import { randomUUID } from "node:crypto";
import type { ContextType, Question, QuestionGroup } from "@/lib/types";
import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * Questions you add to an interview plan yourself ("Add your own question").
 * Saved to the local data folder until the database lands.
 */
export type CustomQuestion = Question & { interviewId: string; userId?: string };

/** How a question in each group is scored, until the fast model labels types. */
const TYPE_FOR_GROUP: Record<QuestionGroup, ContextType> = {
  motivation: "why-us",
  competency: "competency",
  technical: "technical",
  cv: "competency",
  curveball: "situational",
};

const FILE = "questions.json";
const g = globalThis as unknown as { __hakkiriQuestions?: CustomQuestion[] };
const all = (g.__hakkiriQuestions ??= loadJson<CustomQuestion[]>(FILE, []));

/** "Tell me about a time you led a team through change?" → "Tell me about a time…" */
export function shortTitle(text: string): string {
  const words = text.replace(/[?.!]+$/, "").split(/\s+/);
  return words.length <= 5 ? words.join(" ") : `${words.slice(0, 5).join(" ")}…`;
}

/**
 * The questions one person added to one interview. A question belongs to the
 * account that added it: nobody else's plan, download or delete ever includes it.
 */
export function customQuestions(interviewId: string, userId: string): Question[] {
  if (!userId) return [];
  return all.filter((q) => q.interviewId === interviewId && q.userId === userId).map(({ interviewId: _i, userId: _u, ...q }) => q);
}

export function addQuestion(interviewId: string, text: string, group: QuestionGroup, userId: string): Question {
  const clean = text.trim().replace(/\s+/g, " ");
  const q: CustomQuestion = { id: `u-${randomUUID().slice(0, 8)}`, interviewId, userId, group, text: clean, short: shortTitle(clean), type: TYPE_FOR_GROUP[group], custom: true };
  all.push(q);
  saveJson(FILE, all);
  const { interviewId: _i, userId: _u, ...plain } = q;
  return plain;
}

export function removeQuestion(interviewId: string, id: string, userId: string): boolean {
  const i = all.findIndex((q) => q.interviewId === interviewId && q.id === id && q.userId === userId);
  if (i < 0) return false;
  all.splice(i, 1);
  saveJson(FILE, all);
  return true;
}

/** When an interview is deleted, the questions its owner added to it go too. */
export function removeQuestionsFor(interviewId: string, userId: string) {
  for (let i = all.length - 1; i >= 0; i--) if (all[i].interviewId === interviewId && all[i].userId === userId) all.splice(i, 1);
  saveJson(FILE, all);
}

/** One person's added questions, for "Download my data". With no account named: every question, for the tests and the admin backup only. */
export function allCustomQuestions(userId?: string): readonly CustomQuestion[] {
  return userId ? all.filter((q) => q.userId === userId) : all;
}

/** "Delete all my data". */
export function clearQuestions(userId?: string) {
  if (userId) {
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].userId === userId) all.splice(i, 1);
    }
  } else {
    all.length = 0;
  }
  saveJson(FILE, all);
}

/**
 * Questions saved before they carried an owner. Each is given to the owner of
 * the interview it was added to; one that cannot be given to anybody (it was
 * added to a shared demo interview, or its interview is gone) is removed, so
 * that no question is ever left visible to everyone. Runs once when the
 * interviews are loaded.
 */
export function adoptOwnerlessQuestions(ownerOf: (interviewId: string) => string | undefined): number {
  let changed = 0;
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].userId) continue;
    const owner = ownerOf(all[i].interviewId);
    if (owner) all[i] = { ...all[i], userId: owner };
    else all.splice(i, 1);
    changed++;
  }
  if (changed) saveJson(FILE, all);
  return changed;
}
