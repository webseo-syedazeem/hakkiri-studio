import type { Answer, FollowUpKind, Question, QuestionGroup } from "@/lib/types";
import { scoreAnswerView } from "@/lib/answers/view";
import { answerSignals } from "@/lib/ai/follow-up";
import { CATEGORY_ORDER } from "@/lib/interviews/settings";
import { inWords } from "@/lib/format";

/**
 * The mock report (design screen 7), worked out in code from the scored
 * answers: no extra model call, so the same answers always give the same report.
 */

export interface MockFollowUpRow {
  question: string;
  kind: FollowUpKind;
  lengthSec: number;
  overall: number | null;
  /** The model's structure score: did the answer come first? */
  structure: number | null;
  tripped: string | null;
  we: number;
  i: number;
}

/** One question of a mock, reduced to what the report needs. */
export interface MockRow {
  number: number;
  questionId: string;
  question: string;
  group: QuestionGroup;
  lengthSec: number;
  overall: number | null;
  /** null when the answer was too short to judge. */
  pointFirst: boolean | null;
  lengthStatus: "under" | "in" | "over";
  fillerCount: number;
  we: number;
  i: number;
  /** The saved answer, when there is one to open. */
  answerId?: string;
  followUps: MockFollowUpRow[];
  /** "Tell me about yourself" or "What questions do you have for us?": scored, but outside the categories. */
  slot?: "opening" | "closing";
  /** Measured in the answer (not stored for older summary rows). */
  hasNumber?: boolean;
  wordCount?: number;
  /** When the point arrived, in seconds. */
  pointSec?: number | null;
}

export function rowFromAnswer(answer: Answer, question: Question, number: number): MockRow {
  const v = scoreAnswerView(answer, question.type);
  const s = answerSignals(answer.words);
  const point = answer.pointWordIndex >= 0 ? answer.words[answer.pointWordIndex] : undefined;
  return {
    number,
    questionId: question.id,
    question: question.text,
    group: question.group,
    slot: question.slot,
    hasNumber: s.hasNumber,
    wordCount: s.wordCount,
    pointSec: point ? point.start - (answer.words[0]?.start ?? 0) : null,
    lengthSec: v.metrics.lengthSec,
    overall: v.overall,
    pointFirst: v.metrics.pointFirst,
    lengthStatus: v.metrics.lengthStatus,
    fillerCount: v.metrics.fillerCount,
    we: s.we,
    i: s.i,
    answerId: answer.id,
    followUps: v.followUps.map((f) => {
      const fs = answerSignals(f.words);
      return { question: f.question, kind: f.kind, lengthSec: f.lengthSec, overall: f.overall, structure: f.scores.structure, tripped: f.tripped, we: fs.we, i: fs.i };
    }),
  };
}

/** A follow-up counts half as much as a main answer in the mock score and readiness. */
export const FOLLOW_UP_WEIGHT = 0.5;

const round1 = (n: number) => Math.round(n * 10) / 10;

function weightedAverage(rows: MockRow[]): number | null {
  let sum = 0;
  let weight = 0;
  for (const r of rows) {
    if (r.overall != null) {
      sum += r.overall;
      weight += 1;
    }
    for (const f of r.followUps) {
      if (f.overall != null) {
        sum += f.overall * FOLLOW_UP_WEIGHT;
        weight += FOLLOW_UP_WEIGHT;
      }
    }
  }
  return weight ? round1(sum / weight) : null;
}

/** The mock's overall score: every answer, with follow-ups at half weight. */
export function mockScore(rows: MockRow[]): number | null {
  return weightedAverage(rows);
}

/** Scores for each category in this interview (opening and closing left out). */
export function categoryScores(rows: MockRow[]): Partial<Record<QuestionGroup, number>> {
  const out: Partial<Record<QuestionGroup, number>> = {};
  for (const g of CATEGORY_ORDER) {
    const v = weightedAverage(rows.filter((r) => r.group === g && !r.slot));
    if (v != null) out[g] = v;
  }
  return out;
}

/** "Tell me about yourself" and your questions for them, together. */
export function openingCloseScore(rows: MockRow[]): number | null {
  return weightedAverage(rows.filter((r) => r.slot));
}

export type Verdict = "ready" | "nearly" | "not-yet";

export const VERDICT_LABEL: Record<Verdict, string> = { ready: "Ready", nearly: "Nearly", "not-yet": "Not yet" };

/**
 * Ready for the real thing: 4 or more overall and no category under 3.5.
 * Nearly: 3.2 or more. The verdict comes only from interviews with new
 * questions; a re-run (you knew the questions) or a drill can't raise it.
 */
export function verdictFor(score: number | null, categories: Partial<Record<QuestionGroup, number>>): Verdict {
  if (score == null) return "not-yet";
  const cats = Object.values(categories);
  if (score >= 4 && cats.every((c) => c >= 3.5)) return "ready";
  return score >= 3.2 ? "nearly" : "not-yet";
}

/** "questions 3 and 4", "question 3", "questions 1, 3 and 6" */
export function questionList(numbers: number[]): string {
  const n = [...new Set(numbers)].sort((a, b) => a - b);
  if (n.length === 1) return `question ${n[0]}`;
  return `questions ${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
}

export interface Fix {
  id: "lead" | "ownership" | "result" | "over" | "fillers" | "under";
  title: string;
  detail: string;
  /** How many answers and follow-ups show the pattern. */
  count: number;
  /** A question to practise it on. */
  practiseQuestionId: string;
}

const PRIORITY: Fix["id"][] = ["lead", "ownership", "result", "over", "fillers", "under"];

/**
 * The top fixes across the whole mock: patterns that repeat, found from
 * measured signals (point timing, “we” versus “I”, length, fillers) and from
 * what the follow-ups had to ask for. Most repeated first.
 */
export function topFixes(rows: MockRow[], limit = 2, interviewerName = "The interviewer"): Fix[] {
  const totalFollowUps = rows.reduce((n, r) => n + r.followUps.length, 0);
  // "every question" reads better than listing all six.
  const qs = (numbers: number[]) => (rows.length > 2 && new Set(numbers).size === rows.length ? "every question" : questionList(numbers));
  const fixes: Fix[] = [];
  const add = (f: Omit<Fix, "practiseQuestionId">, questionIds: string[]) => f.count > 0 && fixes.push({ ...f, practiseQuestionId: questionIds[0] });

  // 1. The point arrives late, or a follow-up answer took a run-up.
  const lateMain = rows.filter((r) => r.pointFirst === false);
  const lateFollow = rows.flatMap((r) => r.followUps.filter((f) => f.structure != null && f.structure <= 2).map(() => r));
  {
    const parts: string[] = [];
    if (lateMain.length) parts.push(`Late in ${qs(lateMain.map((r) => r.number))}`);
    if (lateFollow.length) {
      const fu =
        lateFollow.length === totalFollowUps
          ? totalFollowUps === 1
            ? "the follow-up"
            : totalFollowUps === 2
              ? "both follow-ups"
              : "every follow-up"
          : lateFollow.length === 1
            ? `the follow-up on question ${lateFollow[0].number}`
            : `${inWords(lateFollow.length)} follow-ups`;
      parts.push(parts.length ? `and in ${fu}` : `Late in ${fu}`);
    }
    add({ id: "lead", title: "Lead with your decision or first step", detail: `${parts.join(", ")}.`, count: lateMain.length + lateFollow.length }, [...lateMain, ...lateFollow].map((r) => r.questionId));
  }

  // 2. “We” where the interviewer needs “I”.
  const weMain = rows.filter((r) => r.we >= 3 && r.we > r.i);
  const askedOwnership = rows.filter((r) => r.followUps.some((f) => f.kind === "ownership"));
  const stillWe = rows.filter((r) => r.followUps.some((f) => f.kind === "ownership" && (f.we > f.i || f.tripped != null)));
  {
    const detail =
      stillWe.length === 1
        ? `The follow-up on question ${stillWe[0].number} asked for this, and it came back as “we”.`
        : stillWe.length > 1
          ? `The follow-ups on ${qs(stillWe.map((r) => r.number))} asked for this, and the answers came back as “we”.`
          : askedOwnership.length
            ? `${askedOwnership.length === 1 ? "A follow-up" : "Follow-ups"} on ${qs(askedOwnership.map((r) => r.number))} had to ask for your part.`
            : `You said “we” more than “I” in ${qs(weMain.map((r) => r.number))}.`;
    add({ id: "ownership", title: "Say “I”, not “we”, for your part", detail, count: weMain.length + stillWe.length }, [...stillWe, ...weMain].map((r) => r.questionId));
  }

  // 3. The interviewer had to ask for the result.
  const askedResult = rows.filter((r) => r.followUps.some((f) => f.kind === "result"));
  add(
    { id: "result", title: "End with the result, and a number", detail: `${interviewerName} had to ask for the result in ${qs(askedResult.map((r) => r.number))}.`, count: askedResult.length },
    askedResult.map((r) => r.questionId),
  );

  // 4–6. Length and fillers.
  const over = rows.filter((r) => r.lengthStatus === "over");
  add({ id: "over", title: "Keep inside the target length", detail: `Over time in ${qs(over.map((r) => r.number))}.`, count: over.length }, over.map((r) => r.questionId));
  const fillers = rows.filter((r) => r.lengthSec >= 20 && r.fillerCount / (r.lengthSec / 60) > 4);
  add({ id: "fillers", title: "Swap fillers for a short pause", detail: `Most fillers in ${qs(fillers.map((r) => r.number))}.`, count: fillers.length }, fillers.map((r) => r.questionId));
  const under = rows.filter((r) => r.lengthStatus === "under");
  add({ id: "under", title: "Say more: a reason, then an example", detail: `Short in ${qs(under.map((r) => r.number))}.`, count: under.length }, under.map((r) => r.questionId));

  return fixes.sort((a, b) => b.count - a.count || PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id)).slice(0, limit);
}

export interface MockReport {
  score: number | null;
  verdict: Verdict;
  categories: Partial<Record<QuestionGroup, number>>;
  openingClose: number | null;
  fixes: Fix[];
  questionCount: number;
  followUpCount: number;
}

export function buildReport(rows: MockRow[], interviewerName?: string): MockReport {
  const score = mockScore(rows);
  const categories = categoryScores(rows);
  return {
    score,
    verdict: verdictFor(score, categories),
    categories,
    openingClose: openingCloseScore(rows),
    fixes: topFixes(rows, 3, interviewerName),
    questionCount: rows.length,
    followUpCount: rows.reduce((n, r) => n + r.followUps.length, 0),
  };
}

/** "6 questions and 2 follow-ups", "1 question, no follow-ups" */
export function countsLine(questions: number, followUps: number): string {
  const q = `${questions} question${questions === 1 ? "" : "s"}`;
  return followUps ? `${q} and ${followUps} follow-up${followUps === 1 ? "" : "s"}` : `${q}, no follow-ups`;
}
