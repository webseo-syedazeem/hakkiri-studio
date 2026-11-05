import "server-only";
import { aiConfig } from "./config";
import { callClaude, extractJson } from "./providers/claude";
import { callGemini } from "./providers/gemini";
import { buildFollowUpPrompt, checkFollowUp, followUpsRemaining, FollowUpReplySchema, ruleFollowUp, toDecision } from "./follow-up";
import type { FollowUpDecision, FollowUpInput, InterviewerBrain } from "./types";

/**
 * InterviewerBrain on the fast model (build plan: "fast model for follow-ups").
 * It has to answer while the candidate waits, so it gets one retry and an
 * 8-second limit. Any failure means "move on": a missed follow-up is fine,
 * a stalled interview is not.
 */
export class ClaudeInterviewerBrain implements InterviewerBrain {
  readonly name = "ai-fast";

  async decideFollowUp(input: FollowUpInput): Promise<FollowUpDecision> {
    if (followUpsRemaining(input) === 0) return { action: "move-on" };
    const { system, user } = buildFollowUpPrompt(input);
    let problems: string[] = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      const retryNote = problems.length ? `\n\nYour last reply had these problems. Fix them:\n- ${problems.join("\n- ")}` : "";
      const text = aiConfig.geminiKey
        ? await callGemini(
            {
              model: aiConfig.fastModel.startsWith("gemini")
                ? aiConfig.fastModel
                : "gemini-2.5-flash",
              system,
              user: user + retryNote,
              maxTokens: 300,
              temperature: 0.3,
              timeoutMs: 8000,
              label: "follow-up",
            },
            { apiKey: aiConfig.geminiKey },
          )
        : await callClaude(
            { model: aiConfig.fastModel, system, user: user + retryNote, maxTokens: 300, temperature: 0.3, timeoutMs: 8000, label: "follow-up" },
            { apiKey: aiConfig.anthropicKey, workspaceId: aiConfig.anthropicWorkspaceId || undefined },
          );
      let parsed: unknown;
      try {
        parsed = extractJson(text);
      } catch {
        problems = ["The reply was not a single JSON object."];
        continue;
      }
      const check = FollowUpReplySchema.safeParse(parsed);
      if (!check.success) {
        problems = check.error.issues.slice(0, 4).map((i) => `${i.path.join(".")}: ${i.message}`);
        continue;
      }
      problems = checkFollowUp(check.data, input.turns);
      if (problems.length === 0) return toDecision(check.data);
    }
    console.warn("[follow-up] moving on; the model's follow-up failed its checks:", problems);
    return { action: "move-on" };
  }
}

/** Offline stand-in (HAKKIRI_MOCK_AI=1): the same limits, simple rules instead of a model. */
export class RuleInterviewerBrain implements InterviewerBrain {
  readonly name = "rules";
  async decideFollowUp(input: FollowUpInput): Promise<FollowUpDecision> {
    return ruleFollowUp(input);
  }
}
