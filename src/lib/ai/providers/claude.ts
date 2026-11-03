import { ProviderError } from "./deepgram";
import { recordUsage } from "@/lib/usage/store";

/**
 * Minimal Claude Messages API client (no SDK needed).
 * Auth: the key as a bearer token, per the Claude Platform docs.
 * https://platform.claude.com/docs/en/manage-claude/authentication
 */
const ENDPOINT = "https://api.anthropic.com/v1/messages";

export interface ClaudeRequest {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  /** Give up after this long (the follow-up decision must be quick). */
  timeoutMs?: number;
  /** What the call is for, for the usage page ("score-answer", "follow-up"…). */
  label?: string;
  /**
   * Text that's the same across many calls (the job and the CV), sent first
   * in the user turn and cached with the system prompt for 5 minutes: later
   * calls pay a tenth for it. Claude only caches 1,024 tokens or more on
   * Sonnet 5 (512 on newer models); below that it's sent normally, no error.
   * https://platform.claude.com/docs/en/build-with-claude/prompt-caching
   */
  context?: string;
}

/**
 * Model-specific request fields (checked against the Claude Platform docs, October 2026):
 *  - Claude 5-generation models (Sonnet 5 and 5.5, Haiku 5.5, Opus 5 and 5.5,
 *    Fable, Mythos) reject temperature, top_p and top_k with a 400 error, so
 *    those are only sent to older models such as Haiku 4.5.
 *  - They think by default (billed as output tokens, and slower). Hakkiri's
 *    calls are short structured tasks checked in code, so thinking is turned
 *    off: "disabled" on Sonnet 5 and Haiku 5.5, "between_tools" (the lowest
 *    setting) on Sonnet 5.5. Opus 5.5 and Fable always think; nothing is sent.
 * https://platform.claude.com/docs/en/build-with-claude/thinking
 */
export function modelFields(model: string, temperature: number | undefined): Record<string, unknown> {
  const m = model.toLowerCase();
  const nextGen = /claude-(sonnet-5|haiku-5|opus-5|fable|mythos)/.test(m);
  const fields: Record<string, unknown> = {};
  if (!nextGen && temperature != null) fields.temperature = temperature;
  if (/sonnet-5-5/.test(m)) fields.thinking = { type: "between_tools" };
  else if (/claude-(sonnet-5|haiku-5)/.test(m)) fields.thinking = { type: "disabled" };
  return fields;
}

export async function callClaude(req: ClaudeRequest, auth: { apiKey: string; workspaceId?: string }): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${auth.apiKey}`,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };
  if (auth.workspaceId) headers["anthropic-workspace-id"] = auth.workspaceId;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens,
      ...modelFields(req.model, req.temperature ?? 0),
      system: req.system,
      messages: [
        {
          role: "user",
          content: req.context
            ? [
                { type: "text", text: req.context, cache_control: { type: "ephemeral" } },
                { type: "text", text: req.user },
              ]
            : req.user,
        },
      ],
    }),
    signal: req.timeoutMs ? AbortSignal.timeout(req.timeoutMs) : undefined,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ProviderError("claude", res.status, detail.slice(0, 300));
  }
  const json = (await res.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } };
  const u = json.usage;
  recordUsage({
    service: "claude",
    label: req.label ?? "claude",
    model: req.model,
    inputTokens: u?.input_tokens ?? 0,
    outputTokens: u?.output_tokens ?? 0,
    cachedTokens: u?.cache_read_input_tokens ?? 0,
    cacheWriteTokens: u?.cache_creation_input_tokens ?? 0,
  });
  return (json.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
}

/** Pulls the JSON object out of a model reply, tolerating ```json fences or a sentence around it. */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in the model's reply");
  return JSON.parse(body.slice(start, end + 1));
}
