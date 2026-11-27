import type { Question } from "@/lib/types";
import { FOCUS_CATEGORIES, type FocusCategoryKey } from "@/lib/interviews/settings";
import { weightedAverage, type MockRow } from "@/lib/mocks/report";

/**
 * Latest practice results in the same question categories as the practice
 * settings (Competency & Behavioural, Strengths, Technical, Experience…), so
 * the score for each category sits next to its share of the interview.
 */

/** The focus category a question belongs to. */
export function focusOf(q: Pick<Question, "group" | "type" | "focus">): FocusCategoryKey {
  if (q.focus) return q.focus;
  if (q.type === "strengths") return "strengths";
  switch (q.group) {
    case "competency":
      return "competency";
    case "technical":
      return "technical";
    case "cv":
      return "experience";
    case "motivation":
      return "motivation";
    default:
      return "situational";
  }
}

export interface FocusResult {
  key: FocusCategoryKey;
  name: string;
  /** Out of 5, one decimal place, from the latest session that included it. Null until practised. */
  score: number | null;
  /** Change since the session before that which included it. */
  delta: number | null;
  /** Its share of the interview in the practice settings (0 when it isn't in the focus). */
  weight: number;
}

/**
 * `sessions` are each session's answer rows, newest first. Every category in
 * the focus is listed (practised or not), then any other category that has
 * been scored, so nothing practised goes missing.
 */
export function focusResults(sessions: MockRow[][], questionOf: (id: string) => Pick<Question, "group" | "type" | "focus"> | undefined, weights: Partial<Record<FocusCategoryKey, number>>): FocusResult[] {
  const perSession = sessions.map((rows) => {
    const by: Partial<Record<FocusCategoryKey, MockRow[]>> = {};
    for (const r of rows) {
      if (r.slot) continue;
      const q = questionOf(r.questionId);
      const k = q ? focusOf(q) : focusOf({ group: r.group, type: "competency" });
      (by[k] ??= []).push(r);
    }
    const out: Partial<Record<FocusCategoryKey, number>> = {};
    for (const [k, rs] of Object.entries(by) as [FocusCategoryKey, MockRow[]][]) {
      const v = weightedAverage(rs);
      if (v != null) out[k] = v;
    }
    return out;
  });
  const results: FocusResult[] = [];
  for (const c of FOCUS_CATEGORIES) {
    const weight = Math.max(0, Math.round(weights[c.key] ?? 0));
    const scored = perSession.map((s) => s[c.key]).filter((v): v is number => v != null);
    if (weight === 0 && !scored.length) continue;
    results.push({
      key: c.key,
      name: c.label,
      score: scored[0] ?? null,
      delta: scored.length > 1 ? Number((scored[0] - scored[1]).toFixed(1)) : null,
      weight,
    });
  }
  // In the focus first, largest share first; then anything practised outside it.
  return results.sort((a, b) => b.weight - a.weight);
}
