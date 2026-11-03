import { reportProblem } from "@/lib/alerts/store";
import { devOr, SERVICE_PROBLEM } from "@/lib/launch";
import "server-only";
import { NextResponse } from "next/server";
import { recordUsage } from "@/lib/usage/store";
import type { Word } from "@/lib/types";
import { aiConfig, missingKeys } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { DeepgramSpeechToText, ProviderError } from "@/lib/ai/providers/deepgram";
import { ClaudeInterviewerBrain, RuleInterviewerBrain } from "@/lib/ai/brain";
import type { FollowUpInput, InterviewerBrain } from "@/lib/ai/types";
import { followUpLimit } from "@/lib/followups";
import { getInterview } from "@/lib/interviews/store";
import type { Draft } from "./drafts";

/**
 * Steps shared by the answer routes: keys check, speech-to-text,
 * the follow-up decision, and turning provider errors into plain words.
 */

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // about 25 minutes of compressed speech

export function notConfigured(): NextResponse | null {
  const missing = missingKeys();
  if (!missing.length || mockAiEnabled()) return null;
  return NextResponse.json({ error: "not-configured", message: devOr(`Add ${missing.join(" and ")} to .env.local to score real answers.`, SERVICE_PROBLEM) }, { status: 503 });
}

export async function transcribe(audio: Blob, mockWords: () => Word[]): Promise<Word[]> {
  if (mockAiEnabled()) {
    // Test mode: no real call, but the usage page shows what one would have used.
    const words = mockWords();
    recordUsage({ service: "deepgram", label: "speech-to-text", model: "nova-3", seconds: words.at(-1)?.end ?? 0, simulated: true });
    return words;
  }
  const stt = new DeepgramSpeechToText(aiConfig.deepgramKey);
  return (await stt.transcribe(await audio.arrayBuffer(), { mimeType: audio.type })).words;
}

export function brain(): InterviewerBrain {
  return mockAiEnabled() ? new RuleInterviewerBrain() : new ClaudeInterviewerBrain();
}

/** Everything the interviewer needs to decide on a follow-up for this draft. */
export function followUpInput(draft: Draft): FollowUpInput | null {
  const interview = getInterview(draft.interviewId);
  const question = interview?.questions.find((q) => q.id === draft.questionId);
  if (!interview || !question) return null;
  return {
    question: question.text,
    type: question.type,
    role: interview.role,
    interviewer: interview.interviewer,
    style: draft.style ?? interview.style,
    cvFacts: interview.likelyAsks,
    turns: draft.turns,
    limit: draft.followUpLimit,
  };
}

export type NextTurn = { followUp: { kind: string; question: string; number: number; of: number } | null; correction?: true };

/**
 * Asks the interviewer brain for a follow-up and records it on the draft.
 * Never throws: if the brain fails, the interview simply moves on. A
 * correction ("that's not on my CV") on the main answer is passed back so
 * the interviewer can apologise and ask something else.
 */
export async function nextFollowUp(draft: Draft): Promise<NextTurn> {
  draft.pending = null;
  const input = draft.followUpsOn ? followUpInput(draft) : null;
  if (!input) return { followUp: null };
  const decision = await brain()
    .decideFollowUp(input)
    .catch((err) => {
      console.warn("[follow-up] moving on after an error:", err instanceof Error ? err.message : err);
      return { action: "move-on" as const };
    });
  if (decision.action === "correction") return draft.turns.length === 1 ? { followUp: null, correction: true } : { followUp: null };
  if (decision.action === "move-on") return { followUp: null };
  draft.pending = { kind: decision.kind, question: decision.question };
  return { followUp: { kind: decision.kind, question: decision.question, number: draft.turns.length, of: input.limit ?? followUpLimit(input.style, input.type) } };
}

export function scoringError(err: unknown): NextResponse {
  const status = err instanceof ProviderError ? err.status : 0;
  console.error("[answers] failed:", err);
  void reportProblem({ source: "service", where: err instanceof ProviderError ? `${err.provider}: scoring an answer` : "Scoring an answer", message: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined });
  const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
  const message = timedOut
    ? "That took too long to score. Try again."
    : status === 401 || status === 403
      ? devOr("An API key was rejected. Check the keys in .env.local.", SERVICE_PROBLEM)
      : status === 402 || status === 429
        ? devOr("An AI provider is out of credit or busy. Try again in a minute.", "Hakkiri is busy right now. Try again in a minute.")
        : "Something went wrong while scoring your answer. Try again.";
  return NextResponse.json({ error: "scoring-failed", message }, { status: 502 });
}
