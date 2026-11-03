import type { SkipRecord } from "@/lib/mocks/store";

/**
 * Rules that stop a skipped kind of question coming back. They're added to
 * the interview and given to whoever writes the next questions.
 */
export function rulesFromSkips(skipped: Pick<SkipRecord, "questionId" | "reason">[], textOf: (id: string) => string | undefined): string[] {
  return skipped.flatMap((s) => {
    const q = textOf(s.questionId)?.slice(0, 90);
    if (!q) return [];
    if (s.reason === "not-true" || s.reason === "said-so") return [`Don't assume facts that aren't in the CV. They said this wasn't true about them: “${q}”`];
    if (s.reason === "not-relevant") return [`No questions like “${q}”: they said it wasn't relevant to the job.`];
    if (s.reason === "wrong-level") return [`“${q}” was the wrong level for them. Pitch questions at the level in the understanding.`];
    return [];
  });
}

/** Adds rules, newest last, without repeats, keeping the latest eight. */
export function mergeRules(existing: string[] | undefined, more: string[]): string[] {
  return [...new Set([...(existing ?? []), ...more.map((r) => r.trim()).filter(Boolean)])].slice(-8);
}
