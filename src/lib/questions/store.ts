import { randomUUID } from "node:crypto";
import type { ContextType, Question, QuestionGroup } from "@/lib/types";
import { loadJson, saveJson } from "@/lib/storage/disk";

/**
 * Questions you add to an interview plan yourself ("Add your own question").
 * Saved to the local data folder until the database lands.
 */
export type CustomQuestion = Question & { interviewId: string };

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

export function customQuestions(interviewId: string): Question[] {
  return all.filter((q) => q.interviewId === interviewId).map(({ interviewId: _i, ...q }) => q);
}

export function addQuestion(interviewId: string, text: string, group: QuestionGroup): Question {
  const clean = text.trim().replace(/\s+/g, " ");
  const q: CustomQuestion = { id: `u-${randomUUID().slice(0, 8)}`, interviewId, group, text: clean, short: shortTitle(clean), type: TYPE_FOR_GROUP[group], custom: true };
  all.push(q);
  saveJson(FILE, all);
  return q;
}

export function removeQuestion(interviewId: string, id: string): boolean {
  const i = all.findIndex((q) => q.interviewId === interviewId && q.id === id);
  if (i < 0) return false;
  all.splice(i, 1);
  saveJson(FILE, all);
  return true;
}

export function removeQuestionsFor(interviewId: string) {
  for (let i = all.length - 1; i >= 0; i--) if (all[i].interviewId === interviewId) all.splice(i, 1);
  saveJson(FILE, all);
}

export function allCustomQuestions(): readonly CustomQuestion[] {
  return all;
}

/** "Delete all my data". */
export function clearQuestions() {
  all.length = 0;
  saveJson(FILE, all);
}
