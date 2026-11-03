import type { Word } from "@/lib/types";

/**
 * Delivery measures, calculated in code from word timings
 * (build plan: "What is measured in code").
 *
 * Nothing here calls a model: the same words always give the same numbers,
 * which keeps delivery scores consistent and accent-neutral.
 */

/** Minimum speech before a measure is shown (spec: "Quiet meetings and minimum talk time"). */
export const MIN_SPEECH = {
  /** Pace needs this much speech. Meetings use 60 s across 3+ turns; single answers use 20 s. */
  paceSec: 20,
  /** Below this, show the filler count only, not a rate. */
  fillerRateSec: 120,
  /** "Point first" is only checked on answers longer than this. */
  pointFirstSec: 30,
} as const;

/** A gap between words at least this long counts as a pause. */
export const PAUSE_SEC = 0.8;
/** Pauses this long are flagged as long. */
export const LONG_PAUSE_SEC = 3;
/** A comfortable pace for interview answers, in words a minute. */
export const PACE_RANGE: [number, number] = [110, 170];

/** Single-word fillers that speech-to-text returns when filler words are switched on. */
const FILLER_TOKENS = new Set(["um", "uh", "erm", "er", "uhm", "hmm", "mm", "mhmm"]);

const normalise = (t: string) => t.toLowerCase().replace(/[^a-z' ]/g, "").trim();

/**
 * "um" and "uh" are always fillers. Words like "like" or phrases like "you know"
 * are only fillers when the model marks them (`filler: true`), because
 * "I like the role" is not a filler.
 */
export function isFiller(word: Word): boolean {
  return word.filler === true || FILLER_TOKENS.has(normalise(word.text));
}

export interface Pause {
  start: number;
  duration: number;
  /** Index of the word after the pause. */
  beforeWord: number;
}

export interface DeliveryMetrics {
  lengthSec: number;
  speakingSec: number;
  /** null when there isn't enough speech to measure. */
  wordsPerMinute: number | null;
  fillerCount: number;
  /** null below MIN_SPEECH.fillerRateSec: show the count only. */
  fillersPerMinute: number | null;
  fillers: { index: number; text: string; start: number }[];
  pauses: Pause[];
  longPauses: Pause[];
  /** Seconds from the start until the main point; null if unknown. */
  pointArrivesAt: number | null;
  /** null when the answer is too short to judge. */
  pointFirst: boolean | null;
  lengthStatus: "under" | "in" | "over";
}

export interface DeliveryOptions {
  targetSec: [number, number];
  /** Index of the first word of the sentence that answers or decides. */
  pointWordIndex?: number | null;
  /** The point should land within this many seconds (from the profile). */
  pointWithinSec?: number;
}

export function computeDelivery(words: Word[], opts: DeliveryOptions): DeliveryMetrics {
  if (words.length === 0) {
    return {
      lengthSec: 0,
      speakingSec: 0,
      wordsPerMinute: null,
      fillerCount: 0,
      fillersPerMinute: null,
      fillers: [],
      pauses: [],
      longPauses: [],
      pointArrivesAt: null,
      pointFirst: null,
      lengthStatus: "under",
    };
  }

  const t0 = words[0].start;
  const lengthSec = round1(words[words.length - 1].end - t0);

  const pauses: Pause[] = [];
  let pausedSec = 0;
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap >= PAUSE_SEC) {
      pauses.push({ start: round1(words[i - 1].end - t0), duration: round1(gap), beforeWord: i });
      pausedSec += gap;
    }
  }
  const speakingSec = round1(Math.max(0, lengthSec - pausedSec));

  const fillers = words.flatMap((w, index) => (isFiller(w) ? [{ index, text: normalise(w.text) || w.text, start: round1(w.start - t0) }] : []));

  // Fillers are not counted as words for pace.
  const spokenWords = words.filter((w) => !isFiller(w)).length;
  const wordsPerMinute = speakingSec >= MIN_SPEECH.paceSec ? Math.round(spokenWords / (speakingSec / 60)) : null;
  const fillersPerMinute = lengthSec >= MIN_SPEECH.fillerRateSec ? round1(fillers.length / (lengthSec / 60)) : null;

  const p = opts.pointWordIndex;
  const pointArrivesAt = p != null && p >= 0 && p < words.length ? round1(words[p].start - t0) : null;
  const within = opts.pointWithinSec ?? 10;
  const pointFirst = pointArrivesAt == null || lengthSec <= MIN_SPEECH.pointFirstSec ? null : pointArrivesAt <= within;

  const [min, max] = opts.targetSec;
  const lengthStatus = lengthSec < min ? "under" : lengthSec > max ? "over" : "in";

  return {
    lengthSec,
    speakingSec,
    wordsPerMinute,
    fillerCount: fillers.length,
    fillersPerMinute,
    fillers,
    pauses,
    longPauses: pauses.filter((x) => x.duration >= LONG_PAUSE_SEC),
    pointArrivesAt,
    pointFirst,
    lengthStatus,
  };
}

/**
 * Delivery score, 1–5, from the measures above. A first rule set to be
 * tuned against the calibration set:
 * - length more than 25% outside the target: −1
 * - pace outside the comfortable range: −1
 * - fillers above 2 a minute: −1; above 4 a minute: −2
 *   (for answers under 2 minutes this uses the count spread over the answer's
 *   length internally; the screen still shows the count, not a rate)
 * - two or more long pauses, unless the profile allows thinking pauses: −1
 */
export function deliveryScore(m: DeliveryMetrics, opts: { targetSec: [number, number]; allowThinkingPauses?: boolean }): number | null {
  if (m.lengthSec < MIN_SPEECH.paceSec) return null; // not enough speech to judge
  let score = 5;
  const [min, max] = opts.targetSec;
  if (m.lengthSec < min * 0.75 || m.lengthSec > max * 1.25) score -= 1;
  if (m.wordsPerMinute != null && (m.wordsPerMinute < PACE_RANGE[0] || m.wordsPerMinute > PACE_RANGE[1])) score -= 1;
  const rate = m.fillerCount / (m.lengthSec / 60);
  if (rate > 4) score -= 2;
  else if (rate > 2) score -= 1;
  if (!opts.allowThinkingPauses && m.longPauses.length >= 2) score -= 1;
  return Math.max(1, score);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
