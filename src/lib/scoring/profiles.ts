import type { ContextType, FollowUpKind } from "@/lib/types";

/**
 * Context profiles (spec: "Context-aware scoring", Step 2).
 * Each profile sets the target length, the expected shape, what counts most,
 * and the weights used to combine the three scored parts.
 *
 * Weights are starting points to test against the calibration set.
 * A weight of 0 means the part is not scored for this context, which
 * removes it rather than scoring it low.
 */
export interface ContextProfile {
  label: string;
  /** Target length in seconds, [min, max]. */
  targetSec: [number, number];
  shape: string;
  countsMost: string;
  relaxed: string | null;
  weights: { content: number; structure: number; delivery: number };
  /** Thinking pauses are not counted against the speaker. */
  allowThinkingPauses: boolean;
  /** The point should arrive within this many seconds. */
  pointWithinSec: number;
}

export const PROFILES: Record<ContextType, ContextProfile> = {
  "tell-me-about-yourself": {
    label: "Tell me about yourself",
    targetSec: [60, 90],
    shape: "Now, then background, then why this role",
    countsMost: "Relevance to the role, a clear hook",
    relaxed: "STAR not applied; one highlight is enough evidence",
    weights: { content: 0.45, structure: 0.3, delivery: 0.25 },
    allowThinkingPauses: false,
    pointWithinSec: 15,
  },
  "why-us": {
    label: "Why us",
    targetSec: [45, 75],
    shape: "A reason specific to the company, linked to you",
    countsMost: "Specific to the company, not generic",
    relaxed: "STAR not applied",
    weights: { content: 0.55, structure: 0.2, delivery: 0.25 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  competency: {
    label: "Competency question",
    targetSec: [90, 120],
    shape: "Situation, task, action, result",
    countsMost: "Evidence, structure, a clear result",
    relaxed: null,
    weights: { content: 0.5, structure: 0.3, delivery: 0.2 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  technical: {
    label: "Technical question",
    targetSec: [120, 240],
    shape: "Clarify, approach, trade-offs, answer",
    countsMost: "Reasoning, checking assumptions, thinking aloud clearly",
    relaxed: "Thinking pauses not penalised; longer length is fine",
    weights: { content: 0.6, structure: 0.25, delivery: 0.15 },
    allowThinkingPauses: true,
    pointWithinSec: 30,
  },
  situational: {
    label: "Situational question",
    targetSec: [60, 90],
    shape: "Decision first, then reasons, then risks",
    countsMost: "A clear decision, sound reasoning",
    relaxed: "STAR not applied",
    weights: { content: 0.5, structure: 0.3, delivery: 0.2 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  "questions-for-us": {
    label: "Your questions for them",
    targetSec: [30, 60],
    shape: "One or two thoughtful questions",
    countsMost: "Quality and relevance of the questions",
    relaxed: "Most delivery scores",
    weights: { content: 0.8, structure: 0.2, delivery: 0 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  salary: {
    label: "Talking about pay",
    targetSec: [15, 45],
    shape: "A researched range, said plainly, then openness to the whole package",
    countsMost: "A clear range based on the market, confident wording without apology, room to discuss the package",
    relaxed: "STAR not applied; short answers are good here",
    weights: { content: 0.6, structure: 0.2, delivery: 0.2 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  "pay-question": {
    label: "Asking about pay",
    targetSec: [10, 40],
    shape: "One clear, polite question about the package, suited to the stage",
    countsMost: "A specific question about pay, bonus, benefits or how pay is decided, asked at the right moment",
    relaxed: "STAR not applied; most delivery scores",
    weights: { content: 0.8, structure: 0.2, delivery: 0 },
    allowThinkingPauses: false,
    pointWithinSec: 10,
  },
  "presentation-opening": {
    label: "Presentation opening",
    targetSec: [0, 60],
    shape: "Why this matters to this audience",
    countsMost: "Hook, relevance",
    relaxed: null,
    weights: { content: 0.5, structure: 0.2, delivery: 0.3 },
    allowThinkingPauses: false,
    pointWithinSec: 30,
  },
  "presentation-qa": {
    label: "Q&A answer",
    targetSec: [20, 60],
    shape: "Answer, reason, link back to the message",
    countsMost: "Directness, honesty",
    relaxed: null,
    weights: { content: 0.5, structure: 0.25, delivery: 0.25 },
    allowThinkingPauses: false,
    pointWithinSec: 5,
  },
};

export function profileFor(type: ContextType): ContextProfile {
  return PROFILES[type];
}

/**
 * Follow-up answers are shorter and should answer straight away
 * (spec: "Follow-up answers are scored too"). A technical drill-down
 * gets thinking time and a little longer.
 */
export function followUpProfile(kind: FollowUpKind): ContextProfile {
  const technical = kind === "technical";
  return {
    label: "Follow-up answer",
    targetSec: technical ? [30, 90] : [30, 60],
    shape: "The answer to what was asked in the first sentence, then one supporting detail",
    countsMost: "Answering directly, staying consistent with the first answer",
    relaxed: "STAR not applied. “I don’t know, but here’s how I’d find out” is a good answer.",
    weights: { content: 0.5, structure: 0.3, delivery: 0.2 },
    allowThinkingPauses: technical,
    pointWithinSec: technical ? 15 : 8,
  };
}
