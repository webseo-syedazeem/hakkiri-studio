"use client";

/**
 * The Experience Library: examples the person wrote or saved themselves.
 * It is kept in this browser only (it is not part of the account, the data
 * download or "Delete all my data" on the server). A new library is empty:
 * nothing is put into it that the person did not write.
 */

export interface InterviewExample {
  id: string;
  title: string;
  question: string;
  answer: string;
  /** Empty when the person didn't choose one. */
  competency: string;
  role: string;
  interviewType: string;
  tags: string[];
  isFavorite: boolean;
  /** Worked out from the answer's own text (see `looksLikeStar`), never assumed. */
  isStarStructure: boolean;
  createdAt: string;
}

const STORAGE_KEY = "hk_interview_examples";

const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

/**
 * Fingerprints of the eight sample examples an earlier build wrote into every
 * browser as if they were the person's own. They are removed on load. A sample
 * the person changed no longer matches, so their own text is never removed.
 */
const SEEDED = new Set(["10dsbbe", "ox0v35", "837eru", "1rvdnb2", "k45fuz", "168mz81", "v9gks0", "1jv7o6p"]);
export const isSeededExample = (e: Pick<InterviewExample, "id" | "title" | "question" | "answer">) => SEEDED.has(hash(`${e.id}|${e.title}|${e.question}|${e.answer}`));

const text = (v: unknown) => (typeof v === "string" ? v : "");

/** What is stored, read safely: only well-formed examples, without the old samples. An unreadable store is empty. */
export function readExamples(raw: string | null): InterviewExample[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: InterviewExample[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const e = item as Record<string, unknown>;
    if (!text(e.id) || !text(e.question).trim() || !text(e.answer).trim()) continue;
    const example: InterviewExample = {
      id: text(e.id),
      title: text(e.title),
      question: text(e.question),
      answer: text(e.answer),
      competency: text(e.competency),
      role: text(e.role),
      interviewType: text(e.interviewType),
      tags: Array.isArray(e.tags) ? e.tags.filter((t): t is string => typeof t === "string" && !!t.trim()) : [],
      isFavorite: e.isFavorite === true,
      isStarStructure: e.isStarStructure === true,
      createdAt: text(e.createdAt),
    };
    if (!isSeededExample(example)) out.push(example);
  }
  return out;
}

/**
 * Whether an answer is written as Situation, Task, Action, Result: at least
 * three of the four are there as labelled parts ("Situation: …").
 */
export function looksLikeStar(answer: string): boolean {
  const found = new Set<string>();
  for (const m of answer.matchAll(/(?:^|[\s(])(situation|task|action|result)s?\s*[:–—-]/gi)) found.add(m[1].toLowerCase());
  return found.size >= 3;
}

/** The heading for an example: the first sentence of the answer without its "Situation:" label, or the question. */
export function exampleTitle(question: string, answer: string): string {
  let title = answer
    .split(/[.\n]/)[0]
    ?.replace(/^(situation|task|action|result)\s*[:,–—-]\s*/i, "")
    ?.trim();
  if (!title || title.length < 8) title = question.trim();
  return title.length > 70 ? `${title.slice(0, 70)}...` : title;
}

export type NewExample = {
  question: string;
  answer: string;
  competency?: string;
  role?: string;
  interviewType?: string;
  tags?: string[];
  title?: string;
  isFavorite?: boolean;
  /** Not used: the mark is worked out from the answer's own text. */
  isStarStructure?: boolean;
};

/**
 * An example ready to keep, holding only what the person gave: no competency,
 * role, interview type or tag is filled in for them. Null when there is no
 * question or no answer.
 */
export function newExample(input: NewExample, now: Date, id = `ex-${now.getTime()}`): InterviewExample | null {
  const question = input.question.trim();
  const answer = input.answer.trim();
  if (!question || !answer) return null;
  const tags = [...new Set((input.tags ?? []).map((t) => t.trim()).filter(Boolean))];
  return {
    id,
    title: input.title?.trim() || exampleTitle(question, answer),
    question,
    answer,
    competency: (input.competency ?? "").trim(),
    role: (input.role ?? "").trim(),
    interviewType: (input.interviewType ?? "").trim(),
    tags,
    isFavorite: input.isFavorite === true,
    isStarStructure: looksLikeStar(answer),
    createdAt: now.toISOString(),
  };
}

function write(list: InterviewExample[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("hk_examples_updated"));
  } catch {
    /* storage is off or full: nothing more to do here */
  }
}

export function loadExamples(): InterviewExample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = readExamples(raw);
    // Tidy the store once if it held the old samples or anything unreadable.
    if (raw && JSON.stringify(list) !== raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

/** Keeps a new example. Returns it, or null when it has no question or no answer. */
export function saveExample(example: NewExample): InterviewExample | null {
  const created = newExample(example, new Date());
  if (!created) return null;
  write([created, ...loadExamples()]);
  return created;
}

export function toggleExampleFavorite(id: string): void {
  write(loadExamples().map((ex) => (ex.id === id ? { ...ex, isFavorite: !ex.isFavorite } : ex)));
}

export function updateExample(id: string, patch: Partial<Pick<InterviewExample, "question" | "answer" | "competency" | "role" | "interviewType" | "tags">>): InterviewExample | null {
  let updated: InterviewExample | null = null;
  const list = loadExamples().map((ex) => {
    if (ex.id !== id) return ex;
    const next = { ...ex, ...patch };
    updated = { ...next, isStarStructure: looksLikeStar(next.answer) };
    return updated;
  });
  if (updated) write(list);
  return updated;
}

export function deleteExample(id: string): void {
  write(loadExamples().filter((ex) => ex.id !== id));
}
