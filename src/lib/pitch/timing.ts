import { inWords, mmss } from "@/lib/format";

/**
 * Suggested timing for each slide (design screen 11), worked out in code.
 * The model suggests how long each slide deserves and what its point is;
 * code always does the arithmetic, so the plan adds up to your time limit
 * exactly, in steps a speaker can actually hit. Without a model, the
 * estimate below stands in.
 */

export interface SlideText {
  title: string;
  lines: string[];
  notes?: string;
}

const STOP = new Set(
  "a an and are as at be but by for from has have in into is it its of on or our so that the their them then there these they this to was we were what when which will with you your".split(" "),
);

/** Lower-case words without punctuation. */
export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .split(/[^a-z0-9%'£$€]+/)
    .filter(Boolean);
}

export function slideWordCount(s: SlideText): number {
  return tokens([s.title, ...s.lines].join(" ")).length;
}

/** Seconds per step, and the least a slide can get. Short talks with many slides use 5-second steps. */
export function stepFor(slideCount: number, limitSec: number): number {
  return limitSec / Math.max(1, slideCount) >= 30 ? 15 : 5;
}

/**
 * A first guess at how much each slide deserves, when there's no model:
 * more words means more to say, a title slide gets little, and the ask
 * always gets a proper share.
 */
export function estimateWeights(slides: SlideText[], askSlide: number): number[] {
  const weights = slides.map((s, i) => {
    const words = slideWordCount(s) + Math.min(40, tokens(s.notes ?? "").length / 3);
    if (i === 0 && slideWordCount(s) <= 14 && slides.length > 1) return 0.5;
    return 0.6 + Math.min(words, 60) / 30;
  });
  // The ask gets at least a typical slide's share, however short its text.
  const others = weights.filter((_, i) => i + 1 !== askSlide && i > 0).sort((a, b) => a - b);
  const typical = others.length ? others[Math.floor(others.length / 2)] : 1;
  if (askSlide >= 1 && askSlide <= weights.length) weights[askSlide - 1] = Math.max(weights[askSlide - 1], typical);
  return weights;
}

/**
 * Turns weights into seconds that add up to the limit exactly, in whole
 * steps, with at least one step per slide.
 */
export function fitToLimit(weights: number[], limitSec: number): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const step = stepFor(n, limitSec);
  const total = weights.reduce((a, b) => a + Math.max(0.01, b), 0);
  const raw = weights.map((w) => (Math.max(0.01, w) / total) * limitSec);
  const out = raw.map((r) => Math.max(step, Math.round(r / step) * step));
  const target = Math.max(n * step, Math.round(limitSec / step) * step);
  let sum = out.reduce((a, b) => a + b, 0);
  for (let guard = 0; sum !== target && guard < 1000; guard++) {
    if (sum > target) {
      // Take a step from the slide furthest above its share.
      let best = -1;
      for (let i = 0; i < n; i++) if (out[i] > step && (best < 0 || out[i] - raw[i] > out[best] - raw[best])) best = i;
      if (best < 0) break;
      out[best] -= step;
      sum -= step;
    } else {
      let best = 0;
      for (let i = 1; i < n; i++) if (raw[i] - out[i] > raw[best] - out[best]) best = i;
      out[best] += step;
      sum += step;
    }
  }
  return out;
}

/** Content words shared between two texts. */
function overlap(a: string, b: string): number {
  const bs = new Set(tokens(b).filter((t) => !STOP.has(t) && t.length > 2));
  return new Set(tokens(a).filter((t) => bs.has(t))).size;
}

const ASK_WORDS = /\b(the ask|our ask|we ask|asking for|approve|approval|sign off|sign-off|decision|next steps|invest|funding|budget)\b/i;

/** The slide that makes the ask: the one that shares most words with it, or says "approve" or "next steps", or the last. */
export function findAskSlide(slides: SlideText[], ask: string): number {
  let best = -1;
  let bestScore = 1;
  slides.forEach((s, i) => {
    const text = [s.title, ...s.lines].join(" ");
    const score = overlap(text, ask) + (ASK_WORDS.test(text) ? 1.5 : 0) + i / (slides.length * 10);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return best >= 0 ? best + 1 : slides.length;
}

/** True when no slide states the ask in its own words. */
export function askMissing(slides: SlideText[], ask: string): boolean {
  if (!ask.trim()) return false;
  const needed = Math.min(2, tokens(ask).filter((t) => !STOP.has(t) && t.length > 2).length);
  return !slides.some((s) => overlap([s.title, ...s.lines].join(" "), ask) >= needed) && !slides.some((s) => ASK_WORDS.test([s.title, ...s.lines].join(" ")));
}

/**
 * Things to watch, spotted in code (the model may add one of its own).
 * At most two, most useful first.
 */
export function codeWarnings(slides: (SlideText & { plannedSec: number })[], limitSec: number, ask: string): string[] {
  const out: string[] = [];
  const each = limitSec / Math.max(1, slides.length);
  if (each < 25) {
    out.push(`${slides.length} slides in ${mmss(limitSec)} is about ${Math.round(each)} seconds each. Merge or cut a few, or every slide will feel rushed.`);
  }
  // A slide that lists several ideas side by side ("Three bets for Q1") tends to run long.
  const busy = slides.findIndex(
    (s) => s.lines.length >= 3 && s.lines.length <= 5 && s.lines.every((l) => tokens(l).length <= 6) && s.plannedSec <= 60 && /\b(two|three|four|five|[2-5])\b/i.test(s.title),
  );
  if (busy >= 0) {
    const k = slides[busy].lines.length;
    out.push(`Slide ${busy + 1} has ${inWords(k)} ideas on it. Rehearse it with one sentence for each, or it will run long.`);
  }
  const wordy = slides.findIndex((s) => slideWordCount(s) > 55);
  if (wordy >= 0) out.push(`Slide ${wordy + 1} has a lot of text (${slideWordCount(slides[wordy])} words). Say its point rather than reading it out.`);
  if (askMissing(slides, ask)) out.push("None of your slides states the ask. Say it plainly on your last slide, so it’s what they remember.");
  return out.slice(0, 2);
}

/** Fallback point for a slide when there's no model: its title, with its first real line when the title is short. */
export function fallbackPoint(s: SlideText): string {
  const title = s.title.trim().replace(/[.:]$/, "");
  const first = s.lines.map((l) => l.trim()).find((l) => tokens(l).length >= 3);
  let point = title || first || "This slide’s main idea";
  if (title && first && tokens(title).length <= 4) point = `${title}: ${first.charAt(0).toLowerCase()}${first.slice(1)}`;
  point = point.length > 118 ? `${point.slice(0, 117).replace(/\s+\S*$/, "")}…` : point;
  return /[.!?…]$/.test(point) ? point : `${point}.`;
}
