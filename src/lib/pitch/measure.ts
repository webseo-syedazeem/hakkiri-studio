import type { Word } from "@/lib/types";
import { computeDelivery, PACE_RANGE, type DeliveryMetrics } from "@/lib/scoring/delivery";
import { mmss } from "@/lib/format";
import { tokens } from "./timing";
import type { Focus, Mark, RunMode, RunScores, Slide, SlideResult, Verdict } from "./types";

/**
 * Everything about a rehearsal run that code can measure
 * (build plan: "What is measured in code"): time on each slide, what was
 * said on each, how much was read off the slide, timing and delivery scores,
 * and which problem to fix first. No model calls here.
 */

/** Seconds on each slide, added up across visits, from the slide changes and the end of the run. */
export function secondsPerSlide(marks: Mark[], endSec: number): Map<number, number> {
  const out = new Map<number, number>();
  marks.forEach((m, i) => {
    const until = i + 1 < marks.length ? marks[i + 1].at : endSec;
    out.set(m.n, (out.get(m.n) ?? 0) + Math.max(0, until - m.at));
  });
  return out;
}

/** The slide showing at time t. */
export function slideAt(marks: Mark[], t: number): number {
  let n = marks[0]?.n ?? 1;
  for (const m of marks) {
    if (m.at <= t) n = m.n;
    else break;
  }
  return n;
}

/** Words split by the slide that was showing when each one started. */
export function wordsBySlide(words: Word[], marks: Mark[]): Map<number, Word[]> {
  const out = new Map<number, Word[]>();
  for (const w of words) {
    const n = slideAt(marks, w.start);
    if (!out.has(n)) out.set(n, []);
    out.get(n)!.push(w);
  }
  return out;
}

/** A slide counts as read out when this share of its own text was said word for word. */
export const READ_OUT_SHARE = 0.6;

/**
 * Share of the slide's own 3-word runs that were said word for word (0–1).
 * Saying a short bullet while explaining around it isn't reading out, so it
 * only counts when the slide's text is at least half of what you said on it.
 * Slides with little text give 0.
 */
export function readOutShare(slide: { title: string; lines: string[] }, words: Word[]): number {
  const slideToks = tokens(slide.lines.join(" "));
  if (slideToks.length < 10) return 0;
  const spoken = tokens(words.map((w) => w.text).join(" "));
  if (slideToks.length / Math.max(1, spoken.length) < 0.5) return 0;
  const said = new Set<string>();
  for (let i = 0; i + 2 < spoken.length; i++) said.add(`${spoken[i]} ${spoken[i + 1]} ${spoken[i + 2]}`);
  let hit = 0;
  let total = 0;
  for (let i = 0; i + 2 < slideToks.length; i++) {
    total++;
    if (said.has(`${slideToks[i]} ${slideToks[i + 1]} ${slideToks[i + 2]}`)) hit++;
  }
  return total ? Math.round((hit / total) * 100) / 100 : 0;
}

/** A slide ran badly over when it's 30 seconds over, or half as long again as planned. */
export function badlyOver(seconds: number, planned: number): boolean {
  return seconds - planned >= Math.max(30, planned * 0.5);
}

export interface TimedSlide {
  n: number;
  planned: number;
  actual: number;
  isAsk: boolean;
}

/**
 * Timing, 1–5 (spec: "Within the limit, with time spread sensibly across
 * slides"). A first rule set, to tune against the calibration set:
 * - total over the limit: more than 5% −1, 15% −2, 30% −3; under 70% of it −1, under half −3
 * - slides badly over plan: one or two −1, three or more −2
 * - the ask rushed (under half its time) −1
 * Not scored for an opening-only run.
 */
export function timingScore(mode: RunMode, slides: TimedSlide[], totalSec: number, limitSec: number): number | null {
  if (mode === "opening" || !slides.length) return null;
  const budget = mode === "full" ? limitSec : slides.reduce((s, x) => s + x.planned, 0);
  let score = 5;
  const r = totalSec / Math.max(1, budget);
  if (r > 1.3 || r < 0.5) score -= 3;
  else if (r > 1.15) score -= 2;
  else if (r > 1.05 || r < 0.7) score -= 1;
  const over = slides.filter((s) => badlyOver(s.actual, s.planned)).length;
  if (over >= 3) score -= 2;
  else if (over >= 1) score -= 1;
  if (slides.some((s) => s.isAsk && s.actual < s.planned * 0.5)) score -= 1;
  return Math.max(1, score);
}

/**
 * Slide coverage, 1–5 (spec: "Each slide's key point covered, without
 * reading the slide out"): the share of slides whose point was made
 * (half for "partly"), less one if two or more slides were read out.
 */
export function coverageScore(slides: { covered: Verdict | null; readOut: number }[]): number | null {
  const checked = slides.filter((s) => s.covered != null);
  if (!checked.length) return null;
  const share = checked.reduce((sum, s) => sum + (s.covered === "yes" ? 1 : s.covered === "partly" ? 0.5 : 0), 0) / checked.length;
  let score = share >= 0.95 ? 5 : share >= 0.85 ? 4 : share >= 0.7 ? 3 : share >= 0.5 ? 2 : 1;
  if (slides.filter((s) => s.readOut >= READ_OUT_SHARE).length >= 2) score -= 1;
  return Math.max(1, score);
}

/** Long pauses in a talk: 5 seconds or more, not counting the moment you change slides. */
export const TALK_LONG_PAUSE_SEC = 5;

/**
 * Delivery over a whole talk (spec: "Steady pace, deliberate pauses, few
 * repeated fillers"). Like an answer's delivery score, but a talk's length is
 * scored under Timing, and a pause while you change slides is normal.
 */
export function talkDelivery(words: Word[], marks: Mark[]): { metrics: DeliveryMetrics; longPauses: number; score: number | null } {
  const metrics = computeDelivery(words, { targetSec: [0, 1e6] });
  const t0 = words[0]?.start ?? 0;
  const changes = marks.slice(1).map((m) => m.at);
  const longPauses = metrics.pauses.filter((p) => {
    if (p.duration < TALK_LONG_PAUSE_SEC) return false;
    const from = t0 + p.start;
    return !changes.some((at) => at >= from - 1.5 && at <= from + p.duration + 1.5);
  }).length;
  if (metrics.lengthSec < 20) return { metrics, longPauses, score: null };
  let score = 5;
  if (metrics.wordsPerMinute != null && (metrics.wordsPerMinute < PACE_RANGE[0] || metrics.wordsPerMinute > PACE_RANGE[1])) score -= 1;
  const rate = metrics.fillerCount / (metrics.lengthSec / 60);
  if (rate > 4) score -= 2;
  else if (rate > 2) score -= 1;
  if (longPauses / Math.max(1, metrics.lengthSec / 180) > 1) score -= 1;
  return { metrics, longPauses, score: Math.max(1, score) };
}

/** Weights from the spec's table ("What it scores"); Q&A handling is scored in Q&A sessions. */
export const RUN_WEIGHTS: Record<keyof RunScores, number> = { opening: 15, message: 20, structure: 15, coverage: 10, timing: 10, audience: 10, delivery: 10 };

/** Weighted average of the parts that were scored, to one decimal place. */
export function runOverall(scores: RunScores): number | null {
  let total = 0;
  let weight = 0;
  for (const k of Object.keys(RUN_WEIGHTS) as (keyof RunScores)[]) {
    const v = scores[k];
    if (v == null) continue;
    total += v * RUN_WEIGHTS[k];
    weight += RUN_WEIGHTS[k];
  }
  return weight ? Math.round((total / weight) * 10) / 10 : null;
}

/** "1:40" for a minute or more, "15 sec" under a minute. */
export function overLabel(sec: number): string {
  const s = Math.round(sec / 5) * 5;
  return s >= 60 ? mmss(s) : `${s} sec`;
}

/**
 * What the report says beside a slide (design screen 13): at most one red
 * chip for the thing that matters most, and one plain note.
 */
export function slideFlags(r: Pick<SlideResult, "seconds" | "covered" | "readOut">, planned: number, isAsk: boolean): { chip: string | null; note: string | null } {
  if (r.seconds < 3) return { chip: null, note: "Skipped" };
  const over = r.seconds - planned;
  const notes: string[] = [];
  let chip: string | null = null;
  if (badlyOver(r.seconds, planned)) chip = `${overLabel(over)} over, cut here`;
  else if (over >= 10) notes.push(`${overLabel(over)} over`);
  if (r.covered === "no") {
    if (chip) notes.unshift("Key point missed");
    else chip = "Key point missed";
  }
  if (isAsk && r.seconds < planned * 0.5) {
    if (chip) notes.push("Ask rushed");
    else chip = "Ask rushed";
  } else if (!isAsk && planned >= 30 && r.seconds < planned * 0.4) notes.push("Rushed");
  if (r.covered === "partly") notes.push("Point only partly made");
  if (r.readOut >= READ_OUT_SHARE) notes.push("Read out the slide");
  return { chip, note: notes[0] ?? null };
}

export interface FocusInput {
  mode: RunMode;
  totalSec: number;
  limitSec: number;
  slides: (Pick<SlideResult, "n" | "seconds" | "covered"> & { planned: number; isAsk: boolean })[];
  fillersPerMinute: number;
  opening: number | null;
}

/**
 * The one thing to fix next (design screen 13: "Your one fix for the next
 * run"), chosen from what was measured, biggest cost first: running over,
 * a point never made, a rushed ask, fillers, then the opening.
 */
export function chooseFocus(f: FocusInput): Focus {
  const worst = [...f.slides].sort((a, b) => b.seconds - b.planned - (a.seconds - a.planned))[0];
  const worstOver = worst ? worst.seconds - worst.planned : 0;
  const budget = f.mode === "full" ? f.limitSec : f.slides.reduce((s, x) => s + x.planned, 0);
  const overall = f.totalSec - budget;
  if (f.mode === "opening") {
    if (f.opening != null && f.opening <= 3) return { kind: "opening", slide: 1 };
    if (f.fillersPerMinute > 3) return { kind: "fillers", slide: null };
    return { kind: "keep", slide: null };
  }
  if (worst && overall > budget * 0.05 && worstOver >= 20) return { kind: "cut", slide: worst.n, overSec: Math.round(worstOver) };
  const missed = f.slides.find((s) => s.covered === "no" && s.seconds >= 3);
  if (missed) return { kind: "missed", slide: missed.n };
  const ask = f.slides.find((s) => s.isAsk && s.seconds < s.planned * 0.5);
  if (ask) return { kind: "ask", slide: ask.n };
  if (worst && badlyOver(worst.seconds, worst.planned)) return { kind: "cut", slide: worst.n, overSec: Math.round(worstOver) };
  if (f.fillersPerMinute > 3) return { kind: "fillers", slide: null };
  if (f.mode === "full" && f.opening != null && f.opening <= 3) return { kind: "opening", slide: 1 };
  return { kind: "keep", slide: null };
}

/**
 * The fix's headline, written in code because it carries the measured
 * numbers. The model adds the "how" underneath (fixBody), from what you said.
 */
export function fixTitle(focus: Focus, slides: Slide[], fillersPerMinute: number): string {
  const s = focus.slide != null ? slides.find((x) => x.n === focus.slide) : undefined;
  switch (focus.kind) {
    case "cut":
      return `Cut slide ${focus.slide} back to its point. That alone saves about ${overLabel(focus.overSec ?? 0)}.`;
    case "missed":
      return `Say slide ${focus.slide}’s point out loud. This run never made it.`;
    case "ask":
      return `Give the ask its full ${mmss(s?.plannedSec ?? 60)}. It’s the slide they’ll remember.`;
    case "fillers":
      return `Swap fillers for pauses: ${Math.round(fillersPerMinute * 10) / 10} a minute this run.`;
    case "opening":
      return "Open with why this matters to them, in the first 30 seconds.";
    case "keep":
      return "Keep this shape. Practise the hard questions next.";
  }
}

/** The fallback "how" when the model isn't available. */
export function fixBody(focus: Focus, slides: Slide[], ask: string): string {
  const s = focus.slide != null ? slides.find((x) => x.n === focus.slide) : undefined;
  switch (focus.kind) {
    case "cut":
      return `The point is “${s?.point ?? "its main idea"}”. Say that first, give one example, and move on.`;
    case "missed":
      return `It’s meant to land “${s?.point ?? "its main idea"}”. Say it in one sentence before you change slide.`;
    case "ask":
      return `Say “${ask}” plainly, then stop and let it land.`;
    case "fillers":
      return "A one-second pause sounds more certain than “um”. Pause at the end of each point instead.";
    case "opening":
      return "Start with what changes for this audience, then what you’ll ask them for. Save the background for later.";
    case "keep":
      return "Timing and points held up. A Q&A round is the best use of your next session.";
  }
}

/**
 * Where to cut to hit the time (spec: "Suggested cuts to hit the time"):
 * the slides most over plan, until the overrun is covered. The model's
 * wording replaces "Trim to its point" when it has something specific.
 */
export function cutPlan(slides: (Pick<SlideResult, "n" | "seconds"> & { planned: number })[], overSec: number): { n: number; saveSec: number }[] {
  if (overSec <= 5) return [];
  const out: { n: number; saveSec: number }[] = [];
  let left = overSec;
  for (const s of [...slides].sort((a, b) => b.seconds - b.planned - (a.seconds - a.planned))) {
    const over = Math.round(s.seconds - s.planned);
    if (over < 10 || left <= 0) break;
    out.push({ n: s.n, saveSec: over });
    left -= over;
  }
  return out.slice(0, 3);
}
