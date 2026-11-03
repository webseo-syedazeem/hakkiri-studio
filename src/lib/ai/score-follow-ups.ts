import { z } from "zod";
import type { Word } from "@/lib/types";
import { quoteInWords } from "./quotes";

/**
 * Scoring for follow-up replies (spec: "Follow-up answers are scored too:
 * staying consistent with your first answer, staying calm, and answering
 * directly"). "Staying calm" is judged only from what was said, never from
 * voice or tone. Delivery is measured in code, as for every answer.
 *
 * The replies are scored in the same call as the first answer (see
 * score-answer.ts), so the first answer and the job are sent once, not twice.
 */

export const FollowUpScoreSchema = z.object({
  content: z.number().int().min(1).max(5),
  structure: z.number().int().min(1).max(5),
  tripped: z.string().max(40).nullable(),
  fillerPhrases: z.array(z.string()),
  note: z.object({
    tone: z.enum(["fix", "strength"]),
    title: z.string().max(40),
    body: z.string().max(160),
    quote: z.string(),
  }),
});

export const FollowUpScoresSchema = z.object({ followUps: z.array(FollowUpScoreSchema).min(1).max(2) });
export type FollowUpScores = z.infer<typeof FollowUpScoresSchema>;

/** How follow-up replies are judged. Part of the scoring system prompt, the same for every call. */
export const FOLLOW_UP_RULES = [
  "Sometimes there were follow-up questions after the first answer. Then also score each reply, in followUps: one entry per follow-up, in order. Leave followUps out when there were none.",
  "For a reply, content: did they answer the question actually asked, with real substance, and stay consistent with their first answer? An honest “I don't know, but here's how I'd find out” is a good answer, not a weak one.",
  "For a reply, structure: does the answer to the follow-up come in the first sentence or two, rather than after a run-up?",
  "For a reply, tripped: if it went wrong, name it in 2 to 5 words the speaker will recognise (for example: Back to “we” again; Changed your first step; Didn't answer the question). Otherwise null.",
  "Give one note per reply, pointing at exact words from that reply.",
];

export const FOLLOW_UP_HINT = `"followUps": [
    {
      "content": 1-5,
      "structure": 1-5,
      "tripped": "2 to 5 words on what went wrong, or null if handled well",
      "fillerPhrases": ["like", "you know"],
      "note": { "tone": "fix" | "strength", "title": "≤40 chars", "body": "≤160 chars", "quote": "exact words from this reply" }
    }
  ]`;

/** Guardrails: one score per follow-up, and every quote taken from its own reply. */
export function checkFollowUpScores(result: FollowUpScores, replies: Word[][]): string[] {
  const problems: string[] = [];
  if (result.followUps.length !== replies.length) problems.push(`Expected ${replies.length} follow-up scores, got ${result.followUps.length}.`);
  result.followUps.forEach((f, k) => {
    const words = replies[k];
    if (!words) return;
    if (!quoteInWords(words, f.note.quote)) problems.push(`Follow-up ${k + 1}: quote not in the reply: "${f.note.quote}"`);
  });
  return problems;
}
