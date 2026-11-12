import type { Question, QuestionGroup } from "@/lib/types";
import type { Fix, MockRow } from "@/lib/mocks/report";
import { categoryLabel, type Difficulty, type TechnicalLabel } from "@/lib/interviews/settings";
import { mmss } from "@/lib/format";
import { matchesDifficulty } from "./pick";
import { getTopic, topicQuestions } from "./topics";

/**
 * Drills: short practice on one thing, with feedback after every answer.
 *   fix       your weakest answer once more with one instruction, then a new question on the same skill
 *   category  three new questions from your lowest category, getting harder if you do well
 *   habit     five quick questions scored only on one habit
 *   pressure  one question, then three follow-ups that dig deeper
 *   story     a story for a skill none of your stories covers (not an interview)
 * The report suggests up to three, ordered by how much each would raise your score.
 * Safe to import in the browser.
 */

export type DrillKind = "fix" | "category" | "habit" | "pressure" | "story" | "pay" | "topic";
export type Habit = "lead" | "ownership" | "numbers" | "short" | "fillers" | "full";

export interface DrillSpec {
  kind: DrillKind;
  /** fix and pressure: the question to work on. */
  questionId?: string;
  /** category: the category to drill. */
  group?: QuestionGroup;
  /** habit (and fix: the one change to make). */
  habit?: Habit;
  /** topic: focused domain/skill drill (e.g. "stakeholder-management"). */
  topic?: string;
  /** story: the skill to build a story for, and the question that tests it. */
  skill?: string;
  question?: string;
  /** The interview it came from, for before-and-after. */
  fromSession?: string;
  /** fix: the score before. */
  before?: number;
}

export const HABIT_LABEL: Record<Habit, string> = {
  lead: "Start with the result",
  ownership: "Say “I”, not “we”",
  numbers: "End with the result, and a number",
  short: "Keep to time",
  fillers: "Fewer filler words",
  full: "Say more: a reason, then an example",
};

/** The one instruction shown before each answer. */
export const HABIT_INSTRUCTION: Record<Habit, string> = {
  lead: "This time, start with your decision or result in the first sentence, then explain how you got there.",
  ownership: "This time, say what you did: “I proposed”, “I decided”. Keep “we” for the team’s part.",
  numbers: "This time, end with what changed, and put a number on it if you have one.",
  short: "This time, keep inside the target length. Cut the background to one sentence.",
  fillers: "This time, swap “um” and “like” for a short pause. Pauses sound confident.",
  full: "This time, give a reason and then an example, before you stop.",
};

/** Which habit fixes each repeated problem in the report. */
export const HABIT_FOR_FIX: Record<Fix["id"], Habit> = { lead: "lead", ownership: "ownership", result: "numbers", over: "short", fillers: "fillers", under: "full" };

export const DRILL_MINUTES: Record<DrillKind, number> = { fix: 4, category: 8, habit: 5, pressure: 5, story: 5, pay: 6, topic: 6 };

/** Whether one answer did the habit: true, false, or null when it can't be told (too short, or not measured). */
export function rowHabit(row: Pick<MockRow, "pointFirst" | "we" | "i" | "lengthStatus" | "lengthSec" | "fillerCount" | "followUps"> & { hasNumber?: boolean }, habit: Habit): boolean | null {
  switch (habit) {
    case "lead":
      return row.pointFirst;
    case "ownership":
      return row.we < 3 || row.i >= row.we;
    case "numbers":
      return row.hasNumber ?? !row.followUps.some((f) => f.kind === "result");
    case "short":
      return row.lengthStatus !== "over";
    case "fillers":
      return row.lengthSec < 20 ? null : row.fillerCount / (row.lengthSec / 60) <= 4;
    case "full":
      return row.lengthStatus !== "under";
  }
}

/** One line on how an answer did on the habit, e.g. "“I” 6 times, “we” once". */
export function habitLine(row: Pick<MockRow, "pointFirst" | "we" | "i" | "lengthStatus" | "lengthSec" | "fillerCount" | "followUps"> & { hasNumber?: boolean; pointSec?: number | null }, habit: Habit): string {
  const times = (n: number) => (n === 1 ? "once" : `${n} times`);
  switch (habit) {
    case "lead":
      return row.pointFirst ? `Your point came first${row.pointSec != null ? `, at ${mmss(row.pointSec)}` : ""}.` : `Your point came late${row.pointSec != null ? `, at ${mmss(row.pointSec)}` : ""}.`;
    case "ownership":
      return `“I” ${times(row.i)}, “we” ${times(row.we)}.`;
    case "numbers":
      return rowHabit(row, "numbers") ? "You ended with a result." : "No result or number at the end.";
    case "short":
      return `${mmss(row.lengthSec)}, ${row.lengthStatus === "over" ? "over the target" : row.lengthStatus === "under" ? "under the target" : "inside the target"}.`;
    case "fillers":
      return `${row.fillerCount} filler word${row.fillerCount === 1 ? "" : "s"} in ${mmss(row.lengthSec)}.`;
    case "full":
      return row.lengthStatus === "under" ? `${mmss(row.lengthSec)}: too short to show much.` : `${mmss(row.lengthSec)}: enough to show your thinking.`;
  }
}

export interface DrillSuggestion {
  spec: DrillSpec;
  title: string;
  detail: string;
  minutes: number;
  /** Roughly how much it would raise your score; higher first. */
  gain: number;
}

export interface SuggestInput {
  sessionId: string;
  rows: MockRow[];
  fixes: Fix[];
  categories: Partial<Record<QuestionGroup, number>>;
  gaps: { skill: string; question: string }[];
  technicalLabel: TechnicalLabel;
  /** Question short names, for titles. */
  shortOf: (questionId: string) => string;
}

/** Up to three drills, about 15 minutes in all, ordered by how much each would raise your score. */
export function suggestDrills(s: SuggestInput, limit = 3): DrillSuggestion[] {
  const out: DrillSuggestion[] = [];
  const scored = s.rows.filter((r) => r.overall != null);

  // Fix your weakest answer.
  const weakest = [...scored].sort((a, b) => a.overall! - b.overall!)[0];
  if (weakest && weakest.overall! < 3.6) {
    const habit = s.fixes.length ? HABIT_FOR_FIX[s.fixes[0].id] : "lead";
    out.push({
      spec: { kind: "fix", questionId: weakest.questionId, habit, fromSession: s.sessionId, before: weakest.overall! },
      title: `Fix “${s.shortOf(weakest.questionId)}”`,
      detail: `Scored ${weakest.overall!.toFixed(1)}. Answer it once more with one change, then a new question on the same skill.`,
      minutes: DRILL_MINUTES.fix,
      gain: 4.5 - weakest.overall!,
    });
  }

  // Your lowest category.
  const cats = (Object.entries(s.categories) as [QuestionGroup, number][]).filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1]);
  if (cats.length && cats[0][1] < 3.8) {
    const [group, score] = cats[0];
    out.push({
      spec: { kind: "category", group, fromSession: s.sessionId },
      title: `${categoryLabel(group, s.technicalLabel)} practice`,
      detail: `Your lowest category (${score.toFixed(1)}). Three new questions, feedback after each, harder as you improve.`,
      minutes: DRILL_MINUTES.category,
      gain: (4.5 - score) * 1.2,
    });
  }

  // A habit that cost you points across answers.
  const fix = s.fixes.find((f) => f.count >= 2);
  if (fix) {
    const habit = HABIT_FOR_FIX[fix.id];
    out.push({ spec: { kind: "habit", habit, fromSession: s.sessionId }, title: HABIT_LABEL[habit], detail: `${fix.detail} Five quick questions, scored only on this.`, minutes: DRILL_MINUTES.habit, gain: fix.count * 0.45 });
  }

  // Vague when pushed.
  const follow = s.rows.flatMap((r) => r.followUps.map((f) => ({ r, f })));
  const weakFollow = follow.filter(({ f }) => f.overall != null && f.overall < 3);
  if (weakFollow.length) {
    const avg = weakFollow.reduce((n, { f }) => n + f.overall!, 0) / weakFollow.length;
    out.push({
      spec: { kind: "pressure", questionId: weakFollow[0].r.questionId, fromSession: s.sessionId },
      title: "Follow-up pressure",
      detail: `${weakFollow.length === 1 ? "A follow-up" : `${weakFollow.length} follow-ups`} scored under 3. One question, then three follow-ups that dig deeper.`,
      minutes: DRILL_MINUTES.pressure,
      gain: (3.6 - avg) * 1.1,
    });
  }

  // A story you don't have yet.
  const gap = s.gaps[0];
  if (gap && (s.categories.competency ?? 0) < 4.2) {
    out.push({
      spec: { kind: "story", skill: gap.skill, question: gap.question, fromSession: s.sessionId },
      title: `Build a story: ${gap.skill.toLowerCase()}`,
      detail: "The job asks for it and none of your stories shows it yet. Four quick prompts, then say it once.",
      minutes: DRILL_MINUTES.story,
      gain: 0.9,
    });
  }

  return out.filter((d) => d.gain > 0).sort((a, b) => b.gain - a.gain).slice(0, limit);
}

/** A drill's title, for headers and lists. */
export function drillTitle(spec: DrillSpec, shortOf: (id: string) => string, technicalLabel: TechnicalLabel = "Technical"): string {
  switch (spec.kind) {
    case "fix":
      return `Fix “${shortOf(spec.questionId ?? "")}”`;
    case "category":
      return `${categoryLabel(spec.group ?? "competency", technicalLabel)} practice`;
    case "habit":
      return HABIT_LABEL[spec.habit ?? "lead"];
    case "pressure":
      return "Follow-up pressure";
    case "story":
      return `Build a story: ${(spec.skill ?? "").toLowerCase()}`;
    case "pay":
      return "Talking about pay";
    case "topic": {
      const t = getTopic(spec.topic);
      return t ? t.title : "Topic practice";
    }
  }
}

const lastAskedOrder = (lastAsked: Map<string, string>) => (a: Question, b: Question) => (lastAsked.get(a.id) ?? "").localeCompare(lastAsked.get(b.id) ?? "");

/**
 * The questions for a drill, from the bank: questions you haven't had come
 * first, then the ones you had longest ago. Returns question ids in order.
 */
export function drillQuestions(spec: DrillSpec, bank: Question[], lastAsked: Map<string, string>, enabled: QuestionGroup[], difficulty?: Difficulty): string[] {
  const pool = bank.filter((q) => !q.slot && !q.retired && !q.pay && !q.drillOnly && (!difficulty || matchesDifficulty(q, difficulty)));
  const fresh = (qs: Question[]) => [...qs.filter((q) => !lastAsked.has(q.id)), ...qs.filter((q) => lastAsked.has(q.id)).sort(lastAskedOrder(lastAsked))];
  switch (spec.kind) {
    case "fix": {
      const q = bank.find((x) => x.id === spec.questionId);
      if (!q) return [];
      const transfer = fresh(pool.filter((x) => x.group === q.group && x.id !== q.id))[0];
      return [q.id, ...(transfer ? [transfer.id] : [])];
    }
    case "category":
      return fresh(pool.filter((x) => x.group === spec.group)).slice(0, 3).map((x) => x.id);
    case "habit": {
      // Five quick questions, taking turns across your categories, the ones you had longest ago first.
      const groups = enabled.length ? enabled : [...new Set(pool.map((q) => q.group))];
      const queues = groups.map((g) => [...pool.filter((q) => q.group === g)].sort(lastAskedOrder(lastAsked)));
      const out: string[] = [];
      for (let round = 0; out.length < 5 && round < 10; round++) for (const qs of queues) if (qs[round] && out.length < 5) out.push(qs[round].id);
      return out;
    }
    case "pressure":
      return spec.questionId && bank.some((q) => q.id === spec.questionId) ? [spec.questionId] : fresh(pool.filter((q) => q.group === "competency")).slice(0, 1).map((q) => q.id);
    case "story":
      return [];
    case "pay":
      return bank.filter((q) => q.pay).map((q) => q.id);
    case "topic":
      return topicQuestions(spec.topic ?? "", bank, { lastAsked, difficulty }).map((q) => q.id);
  }
}
