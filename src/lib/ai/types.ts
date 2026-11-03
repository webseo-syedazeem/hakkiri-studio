import type { ContextType, FollowUpKind, InterviewerStyle, Word } from "@/lib/types";

/**
 * The provider-neutral AI layer (build plan: "The AI layer is provider-neutral").
 * Each part sits behind one interface so providers can be tested and swapped
 * without touching the screens or the scoring code.
 */

/** Speech-to-text. Must keep fillers ("um", "uh") and return word timings. */
export interface SpeechToText {
  readonly name: string;
  transcribe(audio: ArrayBuffer, opts: { mimeType: string; language?: string }): Promise<{ words: Word[] }>;
}

/** One exchange so far: what was asked, and the words of the reply. */
export interface Turn {
  asked: string;
  kind: "main" | FollowUpKind;
  words: Word[];
}

export interface FollowUpInput {
  question: string;
  type: ContextType;
  role: string;
  interviewer: { name: string; title: string };
  style: InterviewerStyle;
  /** Claims or gaps from the CV and job spec that are fair to probe. */
  cvFacts: string[];
  /** The main answer first, then each follow-up and its reply. */
  turns: Turn[];
  /** How many follow-ups this question may get, when a drill sets it (the follow-up pressure drill asks three). */
  limit?: number;
}

/**
 * move-on, one follow-up, or a correction: the candidate says the question
 * doesn't apply to them ("I've never worked in software"), so the interviewer
 * apologises and asks something else.
 */
export type FollowUpDecision = { action: "move-on" } | { action: "follow-up"; kind: FollowUpKind; question: string } | { action: "correction" };

/** The fast model: decides follow-ups and labels question types. */
export interface InterviewerBrain {
  readonly name: string;
  decideFollowUp(input: FollowUpInput): Promise<FollowUpDecision>;
}

/** Interviewer voice (text to speech). */
export interface Voice {
  readonly name: string;
  speak(text: string, opts: { voiceId: string }): Promise<ArrayBuffer>;
}
