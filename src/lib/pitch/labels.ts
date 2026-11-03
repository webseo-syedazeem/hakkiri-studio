import type { Audience, QaStyle, RunMode, RunScores } from "./types";

/** Labels and audience rules shared by the screens and the server. Safe to import in the browser. */

export const AUDIENCE_LABEL: Record<Audience, string> = {
  investors: "Investors",
  leadership: "Leadership team",
  client: "A client",
  team: "My team",
  conference: "A conference",
};

/** "to the leadership team", "to investors" */
export const AUDIENCE_TO: Record<Audience, string> = {
  investors: "investors",
  leadership: "the leadership team",
  client: "a client",
  team: "your team",
  conference: "a conference audience",
};

export const AUDIENCES = Object.keys(AUDIENCE_LABEL) as Audience[];

/** "Q1 roadmap, leadership" on the home screen. */
export const AUDIENCE_SHORT: Record<Audience, string> = { investors: "investors", leadership: "leadership", client: "client", team: "team", conference: "conference" };

export const QA_STYLE_LABEL: Record<QaStyle, string> = {
  curious: "Curious",
  sceptical: "Sceptical",
  "time-pressed": "Time-pressed exec",
  technical: "Technical expert",
};

export const QA_STYLES = Object.keys(QA_STYLE_LABEL) as QaStyle[];

export const QA_STYLE_HINT: Record<QaStyle | "none", string> = {
  none: "No questions afterwards. You can still practise Q&A from the presentation page.",
  curious: "A curious audience asks open questions to understand more, and rarely pushes back.",
  sceptical: "A sceptical audience pushes on cost and risk, and asks again if you dodge.",
  "time-pressed": "A time-pressed exec wants the answer in one line, and cuts in after a minute.",
  technical: "A technical expert asks how it works and what could break, and asks again if you hand-wave.",
};

const PERSONA_NAME: Record<QaStyle, string> = { curious: "Alex", sceptical: "Dana", "time-pressed": "Morgan", technical: "Ravi" };

const PERSONA_TITLE: Record<QaStyle, Record<Audience, string>> = {
  curious: { investors: "associate at the fund", leadership: "head of product", client: "project lead", team: "designer on the team", conference: "someone in the audience" },
  sceptical: { investors: "partner at the fund", leadership: "finance director", client: "procurement lead", team: "senior engineer", conference: "industry analyst" },
  "time-pressed": { investors: "managing partner", leadership: "chief operating officer", client: "the client’s COO", team: "your director", conference: "the panel chair" },
  technical: { investors: "technical adviser to the fund", leadership: "head of engineering", client: "the client’s head of IT", team: "principal engineer", conference: "an engineer in the audience" },
};

/** Who asks the questions: "Dana, finance director". */
export function personaFor(audience: Audience, style: QaStyle): { name: string; title: string } {
  return { name: PERSONA_NAME[style], title: PERSONA_TITLE[style][audience] };
}

/** Each question can be pressed once if the answer dodges it (the follow-up engine's limit for Q&A). */
export const QA_PRESS_LIMIT = 1;

/** A time-pressed exec cuts in after this many seconds. */
export const CUT_IN_SEC: Record<QaStyle, number | null> = { curious: null, sceptical: null, "time-pressed": 60, technical: null };

/** Questions in one Q&A session. */
export const QA_QUESTIONS = 4;

export const RUN_MODE_LABEL: Record<RunMode, string> = { full: "full run", section: "one section", opening: "opening only" };

/** The opening-only rehearsal stops after this long (spec: "Opening only, the first 60 seconds"). */
export const OPENING_SEC = 60;

export const PART_LABEL: Record<keyof RunScores, string> = {
  opening: "Opening",
  message: "Message and ask",
  structure: "Structure and flow",
  coverage: "Slide coverage",
  timing: "Timing",
  audience: "Audience fit",
  delivery: "Delivery",
};

export const PART_ORDER: (keyof RunScores)[] = ["opening", "message", "structure", "coverage", "timing", "audience", "delivery"];

/** "Run 4: slide 4", "Run 3: full run", "Run 5: opening only". */
export function runTitle(run: { number: number; mode: RunMode; from: number; to: number }): string {
  if (run.mode === "section") return `Run ${run.number}: ${run.from === run.to ? `slide ${run.from}` : `slides ${run.from} to ${run.to}`}`;
  return `Run ${run.number}: ${RUN_MODE_LABEL[run.mode]}`;
}
