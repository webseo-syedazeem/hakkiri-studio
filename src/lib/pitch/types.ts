import type { Answer, Word } from "@/lib/types";

/**
 * Presentations and pitches (spec: "Mode 2: Presentation & Pitch Rehearsal").
 * Shaped like the database records in the build plan, so the local store
 * can be swapped for the database without touching the screens.
 */

export type Audience = "investors" | "leadership" | "client" | "team" | "conference";

/** The four audience styles for Q&A (spec: "AI audience Q&A in four styles"). */
export type QaStyle = "curious" | "sceptical" | "time-pressed" | "technical";

/** Rehearsal modes (spec): a full run, one section, or the opening only. Q&A only has its own screen. */
export type RunMode = "full" | "section" | "opening";

/** How a slide is drawn when there's no picture of it (PowerPoint text, pasted notes, the demo deck). */
export type SlideLayout = "title" | "bullets" | "stat" | "quote" | "cards" | "chart" | "timeline" | "ask";

export interface Slide {
  /** 1-based slide number. */
  n: number;
  title: string;
  /** Body text: one entry per bullet or paragraph. */
  lines: string[];
  /** Speaker notes, if the file had any. */
  notes?: string;
  /**
   * "page": a picture of the whole slide (from a PDF).
   * "picture": a picture placed on the slide (from PowerPoint), drawn beside the text.
   */
  image?: { kind: "page" | "picture"; file: string } | null;
  layout?: SlideLayout;
  /** Planned seconds on this slide. */
  plannedSec: number;
  /** The point this slide needs to land, in one sentence. */
  point: string;
}

export interface Presentation {
  id: string;
  userId?: string;
  title: string;
  audience: Audience;
  /** What you want them to do, e.g. "Approve the Q1 roadmap and two new hires". */
  ask: string;
  /** ISO date-time of the real talk. */
  date: string;
  timeLimitSec: number;
  /** The audience style for questions afterwards, or null for none. */
  qaStyle: QaStyle | null;
  source: { kind: "pdf" | "pptx" | "notes" | "demo"; fileName?: string };
  slides: Slide[];
  /** The slide that makes the ask (usually the last one). */
  askSlide: number;
  /** Things to watch for, from the plan (e.g. "Slide 4 has three ideas on it…"). */
  warnings: string[];
  /** Where the timings and points came from: the model, an estimate in code, or you. */
  planBy: "model" | "estimate" | "you";
  createdAt: string;
}

/** Was the slide's point made out loud? */
export type Verdict = "yes" | "partly" | "no";

export interface SlideResult {
  n: number;
  /** Time on this slide, added up across visits. */
  seconds: number;
  /** Words spoken while this slide was showing (times from the start of the run). */
  words: Word[];
  /** null when it couldn't be checked (skipped, or the model couldn't score this run). */
  covered: Verdict | null;
  /** The words that made the point, copied from the transcript. */
  quote: string | null;
  /** Share of the slide's own text read out word for word, 0–1. */
  readOut: number;
}

/** The parts a run is scored on (spec: "What it scores"). Q&A handling is scored in Q&A sessions. */
export interface RunScores {
  opening: number | null;
  message: number | null;
  structure: number | null;
  coverage: number | null;
  timing: number | null;
  audience: number | null;
  delivery: number | null;
}

export type FocusKind = "cut" | "missed" | "ask" | "fillers" | "opening" | "keep";

/** The one thing to fix next, chosen in code from what was measured. */
export interface Focus {
  kind: FocusKind;
  slide: number | null;
  /** Seconds over plan on that slide (for "cut"). */
  overSec?: number;
}

export interface Mark {
  /** Slide shown from this moment. */
  n: number;
  /** Seconds into the recording (pauses not counted). */
  at: number;
}

export interface Run {
  id: string;
  userId?: string;
  presentationId: string;
  /** Run 1, Run 2… across every mode. */
  number: number;
  mode: RunMode;
  /** The slides this run covered. */
  from: number;
  to: number;
  startedAt: string;
  finishedAt: string;
  /** Length of the recording, without pauses. */
  totalSec: number;
  /** A full run that stopped before the last slide. */
  endedEarly: boolean;
  marks: Mark[];
  slides: SlideResult[];
  delivery: { wordsPerMinute: number | null; fillerCount: number; fillersPerMinute: number | null; longPauses: number };
  scores: RunScores;
  overall: number | null;
  focus: Focus;
  fix: { title: string; body: string };
  /** Suggested cuts to hit the time (spec: "Feedback"). */
  cuts: { n: number; text: string; saveSec: number }[];
  /** The opening rewritten from your own words. */
  openingRewrite: string | null;
  /** One quote per scored part, shown beside the score. */
  evidence: Partial<Record<keyof RunScores, string>>;
  /** True when the model couldn't score this run, so only the measured parts are shown. */
  partial: boolean;
  hasAudio: boolean;
}

export interface QaQuestion {
  text: string;
  /** The slide it's about, if any. */
  slide: number | null;
  /** When this person asks again, e.g. "the answer doesn't give a number or a limit". */
  pressIf: string;
}

export interface QaSession {
  id: string;
  userId?: string;
  presentationId: string;
  style: QaStyle;
  persona: { name: string; title: string };
  startedAt: string;
  finishedAt: string;
  /** Questions planned for the session. */
  questions: QaQuestion[];
  /** One scored answer per question answered; a press and its reply is a follow-up. */
  answers: Answer[];
  overall: number | null;
}
