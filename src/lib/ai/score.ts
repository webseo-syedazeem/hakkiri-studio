import "server-only";
import { aiConfig } from "./config";
import { callClaude, extractJson } from "./providers/claude";
import { callGemini } from "./providers/gemini";
import { buildScorePrompt, checkScoreWithFollowUps, ScoreWithFollowUpsSchema, type ScoreInput, type ScoreResult } from "./score-answer";
import type { FollowUpScores } from "./score-follow-ups";

export interface Scored {
  result: ScoreResult;
  /** One per follow-up reply, in order; null when there were no follow-ups. */
  followUps: FollowUpScores | null;
}

/**
 * Scores one answer, and the replies to any follow-up questions, in one call
 * to the main model (build plan step 3), then checks the reply in code
 * (step 5). A reply that fails the schema or the guardrails is retried once
 * with the problems listed; if it still fails, the call errors rather than
 * showing a wrong score.
 *
 * The instructions, job and CV go first and are cached between the answers
 * of one interview (see buildScorePrompt), so they're paid for in full once.
 */
export async function scoreAnswer(input: ScoreInput, extraSources: string[] = []): Promise<Scored> {
  const { system, context, user } = buildScorePrompt(input);
  const followCount = input.followUps?.length ?? 0;
  let problems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const retryNote = problems.length ? `\n\nYour last reply had these problems. Fix them:\n- ${problems.join("\n- ")}` : "";
    const text = aiConfig.geminiKey
      ? await callGemini(
          {
            model: aiConfig.mainModel.startsWith("gemini")
              ? aiConfig.mainModel
              : "gemini-2.5-flash",
            system,
            context,
            user: `${user}${retryNote}`,
            maxTokens: 2000 + 700 * followCount,
            temperature: 0,
            timeoutMs: 90_000,
            label: "score-answer",
          },
          { apiKey: aiConfig.geminiKey },
        )
      : await callClaude(
          { model: aiConfig.mainModel, system, context, user: `${user}${retryNote}`, maxTokens: 2000 + 700 * followCount, temperature: 0, timeoutMs: 90_000, label: "score-answer" },
          { apiKey: aiConfig.anthropicKey, workspaceId: aiConfig.anthropicWorkspaceId || undefined },
        );
    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      problems = ["The reply was not a single JSON object."];
      continue;
    }
    const check = ScoreWithFollowUpsSchema.safeParse(parsed);
    if (!check.success) {
      problems = check.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
      continue;
    }
    problems = checkScoreWithFollowUps(check.data, input, extraSources);
    if (problems.length === 0) {
      const { followUps, ...result } = check.data;
      return { result, followUps: followCount && followUps ? { followUps } : null };
    }
  }
  throw new Error(`Scoring failed its checks: ${problems.join("; ")}`);
}
