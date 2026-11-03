import type { Interview, QuestionGroup } from "@/lib/types";
import { listAnswers } from "@/lib/answers/store";
import { scoreAnswerView } from "@/lib/answers/view";
import { GROUP_ORDER } from "@/lib/labels";

/**
 * Each question's latest score, from everything practised so far (used for
 * "up from 3.1" on an answer). Earlier practice from before this prototype's
 * data comes from the demo record (each question's lastScore). Your verdict
 * and category scores come from your interviews instead (lib/sessions).
 */
export interface Progress {
  /** Latest score per question id, with the answer it came from (if recorded here). */
  questions: Map<string, { score: number; answerId?: string }>;
  groupScores: Record<QuestionGroup, number>;
  answersPractised: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function progressFor(interview: Interview, opts: { excludeAnswerIds?: string[] } = {}): Progress {
  const exclude = new Set(opts.excludeAnswerIds ?? []);
  const questions = new Map<string, { score: number; answerId?: string }>();
  for (const q of interview.questions) if (q.lastScore != null) questions.set(q.id, { score: q.lastScore });

  const recorded = listAnswers(interview.id).filter((a) => !exclude.has(a.id));
  for (const a of recorded) {
    const q = interview.questions.find((x) => x.id === a.questionId);
    if (!q) continue;
    const overall = scoreAnswerView(a, q.type).overall;
    if (overall != null) questions.set(q.id, { score: overall, answerId: a.id }); // later answers replace earlier ones
  }

  const groupScores = Object.fromEntries(
    GROUP_ORDER.map((g) => {
      const scores = interview.questions.filter((q) => q.group === g && questions.has(q.id)).map((q) => questions.get(q.id)!.score);
      return [g, scores.length ? round1(scores.reduce((s, x) => s + x, 0) / scores.length) : interview.groupScores[g]];
    }),
  ) as Record<QuestionGroup, number>;

  return { questions, groupScores, answersPractised: interview.answersPractised + recorded.length };
}
