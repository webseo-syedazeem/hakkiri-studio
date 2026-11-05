import { ProviderError } from "./deepgram";
import { recordUsage } from "@/lib/usage/store";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiRequest {
  model?: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  timeoutMs?: number;
  label?: string;
  context?: string;
}

/**
 * Native Google Gemini provider (uses Gemini 2.5 Flash / 1.5 Pro).
 * Fully compatible with Hakkiri's JSON structured output requirements.
 */
export async function callGemini(
  req: GeminiRequest,
  auth: { apiKey: string },
): Promise<string> {
  const primaryModel =
    req.model && req.model.startsWith("gemini")
      ? req.model
      : "gemini-2.5-flash";

  const userParts: { text: string }[] = [];
  if (req.context) {
    userParts.push({ text: req.context });
  }
  userParts.push({ text: req.user });

  const payload: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: userParts,
      },
    ],
    generationConfig: {
      maxOutputTokens: req.maxTokens,
      temperature: req.temperature ?? 0.2,
      responseMimeType: "application/json",
    },
  };

  if (req.system) {
    payload.systemInstruction = {
      parts: [{ text: req.system }],
    };
  }

  const candidateModels = [
    primaryModel,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: Error | null = null;
  for (const model of candidateModels) {
    for (const ver of ["v1beta", "v1"]) {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${auth.apiKey}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: req.timeoutMs ? AbortSignal.timeout(req.timeoutMs) : undefined,
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          if (res.status === 404) {
            continue; // try next version or model
          }
          throw new ProviderError("claude", res.status, `Gemini error: ${detail.slice(0, 300)}`);
        }

        const json = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
        };

        const usage = json.usageMetadata;
        recordUsage({
          service: "claude",
          label: req.label ?? "gemini",
          model,
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: usage?.candidatesTokenCount ?? 0,
          cachedTokens: 0,
          cacheWriteTokens: 0,
        });

        const candidate = json.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text ?? "";
        return text;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof ProviderError && (err.status === 401 || err.status === 403)) {
          throw err;
        }
        continue;
      }
    }
  }
  throw lastError ?? new Error("Gemini call failed");
}
