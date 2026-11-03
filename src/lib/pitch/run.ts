import type { Answer, Word } from "@/lib/types";
import { scoreAnswerView } from "@/lib/answers/view";
import {
  chooseFocus,
  coverageScore,
  cutPlan,
  fixBody,
  fixTitle,
  readOutShare,
  runOverall,
  secondsPerSlide,
  talkDelivery,
  timingScore,
  wordsBySlide,
} from "./measure";
import type { Focus, FocusKind, Mark, Presentation, Run, RunMode, RunScores, Verdict } from "./types";

/**
 * Builds a rehearsal run from the recording's words, the slide changes and
 * the model's judgement (or none, when the model couldn't score it).
 * Pure, so the demo runs and real runs are put together the same way.
 */

/** What the main model judges in a run (build plan: content and structure from the model; delivery and timing in code). */
export interface RunModelResult {
  opening: { score: number | null; evidence: string | null };
  message: { score: number | null; evidence: string | null };
  structure: { score: number | null; evidence: string | null };
  audience: { score: number | null; evidence: string | null };
  slides: { n: number; covered: Verdict; quote: string | null }[];
  /** How to make the fix, written for the focus it was given. */
  fixBody: string | null;
  fixFor: FocusKind;
  cuts: { n: number; text: string }[];
  openingRewrite: string | null;
}

export interface AssembleInput {
  id: string;
  presentation: Presentation;
  number: number;
  mode: RunMode;
  from: number;
  to: number;
  startedAt: string;
  finishedAt: string;
  totalSec: number;
  marks: Mark[];
  words: Word[];
  model: RunModelResult | null;
  hasAudio: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Slides a run covers. */
export function slidesInRun(p: Presentation, from: number, to: number) {
  return p.slides.filter((s) => s.n >= from && s.n <= to);
}

/** The measured side of a run, before the model: used to brief the model and to choose the focus. */
export function measureRun(p: Presentation, mode: RunMode, from: number, to: number, marks: Mark[], words: Word[], totalSec: number) {
  const scope = slidesInRun(p, from, to);
  const secs = secondsPerSlide(marks, totalSec);
  const said = wordsBySlide(words, marks);
  const slides = scope.map((s) => ({
    n: s.n,
    seconds: round1(secs.get(s.n) ?? 0),
    words: said.get(s.n) ?? [],
    readOut: readOutShare(s, said.get(s.n) ?? []),
    planned: s.plannedSec,
    isAsk: s.n === p.askSlide,
  }));
  const delivery = talkDelivery(words, marks);
  // A rate needs a minute of speech to mean anything (one "um" in ten seconds isn't six a minute).
  const fillersPerMinute = delivery.metrics.lengthSec >= 60 ? delivery.metrics.fillerCount / (delivery.metrics.lengthSec / 60) : 0;
  const budget = mode === "full" ? p.timeLimitSec : scope.reduce((a, s) => a + s.plannedSec, 0);
  return { scope, slides, delivery, fillersPerMinute, budget };
}

/** The focus before the model has scored the opening (the model writes its fix for this). */
export function preliminaryFocus(p: Presentation, mode: RunMode, m: ReturnType<typeof measureRun>, totalSec: number): Focus {
  return chooseFocus({
    mode,
    totalSec,
    limitSec: p.timeLimitSec,
    slides: m.slides.map((s) => ({ ...s, covered: null })),
    fillersPerMinute: m.fillersPerMinute,
    opening: null,
  });
}

export function assembleRun(input: AssembleInput): Run {
  const { presentation: p, mode, model } = input;
  const m = measureRun(p, mode, input.from, input.to, input.marks, input.words, input.totalSec);
  const verdict = (n: number, seconds: number) => (seconds >= 3 ? (model?.slides.find((s) => s.n === n) ?? null) : null);
  const slides = m.slides.map((s) => {
    const v = verdict(s.n, s.seconds);
    return { n: s.n, seconds: s.seconds, words: s.words, covered: v?.covered ?? null, quote: v?.quote ?? null, readOut: s.readOut };
  });

  const full = mode === "full";
  const scores: RunScores = {
    opening: mode !== "section" ? (model?.opening.score ?? null) : null,
    message: full ? (model?.message.score ?? null) : null,
    structure: full ? (model?.structure.score ?? null) : null,
    coverage: mode === "opening" ? null : coverageScore(slides),
    timing: timingScore(
      mode,
      m.slides.map((s) => ({ n: s.n, planned: s.planned, actual: s.seconds, isAsk: s.isAsk })),
      input.totalSec,
      p.timeLimitSec,
    ),
    audience: full ? (model?.audience.score ?? null) : null,
    delivery: m.delivery.score,
  };

  const focus = chooseFocus({
    mode,
    totalSec: input.totalSec,
    limitSec: p.timeLimitSec,
    slides: slides.map((s, k) => ({ ...s, planned: m.slides[k].planned, isAsk: m.slides[k].isAsk })),
    fillersPerMinute: m.fillersPerMinute,
    opening: scores.opening,
  });
  const body = model?.fixBody && model.fixFor === focus.kind ? model.fixBody : fixBody(focus, p.slides, p.ask);

  const cuts = cutPlan(
    slides.map((s, k) => ({ ...s, planned: m.slides[k].planned })),
    input.totalSec - m.budget,
  ).map((c) => ({ ...c, text: model?.cuts.find((x) => x.n === c.n)?.text ?? "Trim it to its point and one example." }));

  const evidence: Run["evidence"] = {};
  if (model) {
    for (const k of ["opening", "message", "structure", "audience"] as const) {
      const e = model[k].evidence;
      if (e && scores[k] != null) evidence[k] = e;
    }
  }

  return {
    id: input.id,
    presentationId: p.id,
    number: input.number,
    mode,
    from: input.from,
    to: input.to,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    totalSec: round1(input.totalSec),
    endedEarly: full && !input.marks.some((x) => x.n === input.to),
    marks: input.marks,
    slides,
    delivery: {
      wordsPerMinute: m.delivery.metrics.wordsPerMinute,
      fillerCount: m.delivery.metrics.fillerCount,
      fillersPerMinute: m.delivery.metrics.lengthSec >= 60 ? round1(m.fillersPerMinute) : null,
      longPauses: m.delivery.longPauses,
    },
    scores,
    overall: runOverall(scores),
    focus,
    fix: { title: fixTitle(focus, p.slides, m.fillersPerMinute), body },
    cuts,
    openingRewrite: mode !== "section" ? (model?.openingRewrite ?? null) : null,
    evidence,
    partial: model == null,
    hasAudio: input.hasAudio,
  };
}

/** A press and its reply counts half as much as the answer itself (as with interview follow-ups). */
export const PRESS_WEIGHT = 0.5;

/** Q&A handling, 1–5: the answers' overall scores, presses at half weight. */
export function qaOverall(answers: Answer[]): number | null {
  let total = 0;
  let weight = 0;
  for (const a of answers) {
    const v = scoreAnswerView(a, "presentation-qa");
    if (v.overall != null) {
      total += v.overall;
      weight += 1;
    }
    for (const f of v.followUps) {
      if (f.overall == null) continue;
      total += f.overall * PRESS_WEIGHT;
      weight += PRESS_WEIGHT;
    }
  }
  return weight ? Math.round((total / weight) * 10) / 10 : null;
}
