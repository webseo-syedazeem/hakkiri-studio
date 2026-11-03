import type { QuestionGroup } from "@/lib/types";
import { categoryScores, mockScore, type MockRow } from "@/lib/mocks/report";
import { CATEGORY_ORDER } from "@/lib/interviews/settings";
import { HABIT_LABEL, rowHabit, type Habit } from "./drills";

/**
 * Before and after, for "Run it again": the same main questions a second
 * time, with the report's top fixes as "This time, try to…". Shows each
 * answer's score before and after, whether you made each fix, the categories
 * and how you spoke. Follow-ups differ (they react to what you say), so the
 * scores include them as usual.
 */

export interface CompareCheck {
  habit: Habit;
  label: string;
  before: boolean | null;
  after: boolean | null;
}

export interface CompareRow {
  questionId: string;
  question: string;
  group: QuestionGroup;
  slot?: "opening" | "closing";
  before: number | null;
  after: number | null;
  beforeAnswerId?: string;
  afterAnswerId?: string;
  checks: CompareCheck[];
}

export interface Comparison {
  score: { before: number | null; after: number | null };
  rows: CompareRow[];
  categories: { group: QuestionGroup; before: number | null; after: number | null }[];
  /** Filler words per minute and average answer length, across main answers. */
  delivery: { fillersPerMin: [number | null, number | null]; avgLengthSec: [number | null, number | null]; wordsPerMin: [number | null, number | null] };
  /** How many of the asked fixes you made, across every answer. */
  fixesMade: { made: number; of: number };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function delivery(rows: MockRow[]) {
  const timed = rows.filter((r) => r.lengthSec > 0);
  const secs = timed.reduce((n, r) => n + r.lengthSec, 0);
  const fillers = timed.reduce((n, r) => n + r.fillerCount, 0);
  const counted = timed.filter((r) => r.wordCount != null);
  const words = counted.reduce((n, r) => n + (r.wordCount ?? 0), 0);
  const countedSecs = counted.reduce((n, r) => n + r.lengthSec, 0);
  return {
    fillersPerMin: secs >= 30 ? round1(fillers / (secs / 60)) : null,
    avgLengthSec: timed.length ? Math.round(secs / timed.length) : null,
    wordsPerMin: countedSecs >= 30 ? Math.round(words / (countedSecs / 60)) : null,
  };
}

export function compareRuns(before: MockRow[], after: MockRow[], habits: Habit[]): Comparison {
  const rows: CompareRow[] = after.map((a) => {
    const b = before.find((x) => x.questionId === a.questionId);
    return {
      questionId: a.questionId,
      question: a.question,
      group: a.group,
      slot: a.slot,
      before: b?.overall ?? null,
      after: a.overall,
      beforeAnswerId: b?.answerId,
      afterAnswerId: a.answerId,
      checks: habits.map((h) => ({ habit: h, label: HABIT_LABEL[h], before: b ? rowHabit(b, h) : null, after: rowHabit(a, h) })),
    };
  });
  const askedIds = new Set(after.map((r) => r.questionId));
  const sameBefore = before.filter((r) => askedIds.has(r.questionId));
  const cb = categoryScores(sameBefore);
  const ca = categoryScores(after);
  const db = delivery(sameBefore);
  const da = delivery(after);
  const checks = rows.flatMap((r) => r.checks).filter((c) => c.after != null);
  return {
    score: { before: mockScore(sameBefore), after: mockScore(after) },
    rows,
    categories: CATEGORY_ORDER.filter((g) => cb[g] != null || ca[g] != null).map((g) => ({ group: g, before: cb[g] ?? null, after: ca[g] ?? null })),
    delivery: { fillersPerMin: [db.fillersPerMin, da.fillersPerMin], avgLengthSec: [db.avgLengthSec, da.avgLengthSec], wordsPerMin: [db.wordsPerMin, da.wordsPerMin] },
    fixesMade: { made: checks.filter((c) => c.after).length, of: checks.length },
  };
}
