import "server-only";
import { aiConfig } from "../config";
import { ask } from "../ask";
import type { Focus, QaQuestion } from "@/lib/pitch/types";
import type { RunModelResult } from "@/lib/pitch/run";
import { buildPlanPrompt, checkPlan, PlanReplySchema, type PlanInput, type PlanReply } from "./plan-slides";
import { buildRunPrompt, checkRunReply, RunReplySchema, toRunModel, type RunScoreInput } from "./score-run";
import { buildPressPrompt, buildQuestionsPrompt, checkPress, checkQuestions, pressesRemaining, PressReplySchema, QuestionsReplySchema, type PressInput, type QuestionsInput } from "./qa";

/**
 * The presentation calls to Claude. Each reply is parsed, checked in code,
 * and retried once with the problems listed (build plan step 5), like the
 * interview scoring calls. None of these ever shows an unchecked reply:
 * on failure they return null and the caller falls back to what code can do.
 */

/** Suggested timing and points (design screen 11). Null means "use the estimate". */
export async function planSlides(input: PlanInput): Promise<PlanReply | null> {
  const { system, user } = buildPlanPrompt(input);
  return ask({ model: aiConfig.mainModel, system, user, maxTokens: 2500, timeoutMs: 45_000, schema: PlanReplySchema, check: (r) => checkPlan(r, input), label: "plan-slides" });
}

/** The listener's side of a run (spec: "What it scores"). Null means "show the measured parts only". */
export async function scoreRun(input: RunScoreInput, focus: Focus): Promise<RunModelResult | null> {
  const { system, user } = buildRunPrompt(input);
  const reply = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 3500, timeoutMs: 120_000, schema: RunReplySchema, check: (r) => checkRunReply(r, input), label: "score-run" });
  return reply && toRunModel(reply, focus);
}

/** The audience's questions. Null means "use the rule questions". */
export async function generateQuestions(input: QuestionsInput): Promise<QaQuestion[] | null> {
  const { system, user } = buildQuestionsPrompt(input);
  const reply = await ask({
    model: aiConfig.mainModel,
    system,
    user,
    maxTokens: 1200,
    temperature: 0.4,
    timeoutMs: 40_000,
    schema: QuestionsReplySchema,
    check: (r) => checkQuestions(r, input),
    label: "qa-questions",
  });
  return reply && reply.questions.map((q) => ({ text: q.text.trim(), slide: q.slide, pressIf: q.pressIf.trim() }));
}

/**
 * Whether to ask again (fast model, while the speaker waits). Like the
 * interviewer's follow-ups: 8 seconds, and any failure means "move on".
 */
export async function decidePress(input: PressInput): Promise<{ kind: "challenge" | "clarify"; question: string } | null> {
  if (pressesRemaining(input.turns) === 0) return null;
  const { system, user } = buildPressPrompt(input);
  const reply = await ask({
    model: aiConfig.fastModel,
    system,
    user,
    maxTokens: 300,
    temperature: 0.3,
    timeoutMs: 8000,
    schema: PressReplySchema,
    check: (r) => checkPress(r, input.turns),
    label: "qa-press",
  });
  return reply && reply.action === "press" ? { kind: reply.kind, question: reply.question.trim() } : null;
}
