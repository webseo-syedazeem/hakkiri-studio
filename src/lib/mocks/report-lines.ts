import type { QuestionGroup } from "@/lib/types";
import { rowHabit, habitLine, type Habit } from "@/lib/sessions/drills";
import { countsLine, VERDICT_LABEL, type MockReport, type MockRow } from "./report";

/**
 * The words on the interview report. Each line is worked out from the session
 * itself: the scores of the answers that were scored, and what was measured
 * in them. Where nothing was scored or measured, the line says so. None of it
 * is a stock sentence that would read the same for any session.
 */

export const GROUP_LABEL: Record<QuestionGroup, string> = { cv: "Experience", competency: "Skills", technical: "Technical", motivation: "Motivation", curveball: "Situational" };
const ORDER: QuestionGroup[] = ["cv", "competency", "technical", "motivation", "curveball"];

export interface CategoryLine {
  key: QuestionGroup | "opening-close";
  label: string;
  score: number;
}

/** The categories that have a scored answer, in a fixed order. A category with nothing scored is not listed. */
export function categoryLines(report: Pick<MockReport, "categories" | "openingClose">): CategoryLine[] {
  const lines: CategoryLine[] = [];
  for (const key of ORDER) {
    const score = report.categories[key];
    if (score != null && Number.isFinite(score)) lines.push({ key, label: GROUP_LABEL[key], score });
  }
  if (report.openingClose != null) lines.push({ key: "opening-close", label: "Opening and close", score: report.openingClose });
  return lines;
}

export function reportHeadline(report: Pick<MockReport, "score" | "verdict">): string {
  if (report.score == null) return "Not scored";
  return report.verdict === "ready" ? "Ready for the real thing" : report.verdict === "nearly" ? "Nearly there" : "Not there yet";
}

/** One or two sentences under the headline: what was scored, and the strongest and weakest category. */
export function reportSummary(report: MockReport): string {
  const counts = countsLine(report.questionCount, report.followUpCount);
  if (report.questionCount === 0) return "No questions were answered in this session, so there is nothing to score.";
  if (report.score == null) return `${counts}. None of the answers could be scored, so there is no overall score.`;
  const cats = categoryLines({ categories: report.categories, openingClose: null });
  const lead = `${counts}, ${report.score.toFixed(1)} out of 5 overall (${VERDICT_LABEL[report.verdict].toLowerCase()}).`;
  if (cats.length === 0) return lead;
  if (cats.length === 1) return `${lead} Scored on ${cats[0].label.toLowerCase()} questions only (${cats[0].score.toFixed(1)}).`;
  const sorted = [...cats].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best.score - worst.score < 0.05) return `${lead} Every category scored ${best.score.toFixed(1)}.`;
  return `${lead} Strongest: ${best.label.toLowerCase()} (${best.score.toFixed(1)}). Weakest: ${worst.label.toLowerCase()} (${worst.score.toFixed(1)}).`;
}

export interface Takeaway {
  tone: "good" | "fix" | "none";
  title: string;
  detail?: string;
}

/**
 * The takeaways: the strongest category when it is 4 or more, then the
 * repeated patterns found across the answers (the report's fixes). When
 * there is neither, one line says that nothing repeated.
 */
export function takeaways(report: MockReport, limit = 3): Takeaway[] {
  const out: Takeaway[] = [];
  const cats = categoryLines({ categories: report.categories, openingClose: null }).sort((a, b) => b.score - a.score);
  if (cats.length && cats[0].score >= 4) out.push({ tone: "good", title: `Strongest area: ${cats[0].label.toLowerCase()}, ${cats[0].score.toFixed(1)} out of 5.` });
  for (const fix of report.fixes) out.push({ tone: "fix", title: fix.title, detail: fix.detail });
  if (out.length === 0) {
    out.push({ tone: "none", title: report.score == null ? "Nothing could be measured in this session." : "No pattern repeated across your answers, so there is no single thing to fix." });
  }
  return out.slice(0, limit);
}

const HABITS: Habit[] = ["lead", "ownership", "numbers", "fillers"];

/**
 * What was measured in one answer, split into what went right and what to
 * change. Each line states a measurement (when the point came, “I” against
 * “we”, length, fillers). A habit that can't be told for this answer is left out.
 */
export function rowFeedback(row: MockRow): { good: string[]; improve: string[] } {
  const good: string[] = [];
  const improve: string[] = [];
  if (!row.lengthSec || row.lengthSec <= 0) return { good, improve };
  for (const habit of HABITS) {
    const did = rowHabit(row, habit);
    if (did == null) continue;
    // “I” and “we” are only worth a line when the answer used them.
    if (habit === "ownership" && row.i + row.we === 0) continue;
    (did ? good : improve).push(habitLine(row, habit));
  }
  const length = row.lengthStatus === "under" ? habitLine(row, "full") : habitLine(row, "short");
  (row.lengthStatus === "in" ? good : improve).push(length);
  return { good, improve };
}
