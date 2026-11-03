import "server-only";
import type { ZodType } from "zod";
import { aiConfig } from "./config";
import { callClaude, extractJson } from "./providers/claude";
import { reportProblem } from "@/lib/alerts/store";

export interface AskOptions<T> {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  timeoutMs: number;
  schema: ZodType<T>;
  check: (value: T) => string[];
  label: string;
}

/**
 * One checked call to Claude: the reply must be one JSON object that matches
 * the schema and passes the checks in code; if not, it's retried once with
 * the problems listed (build plan step 5). Returns null rather than an
 * unchecked reply, so callers fall back to what code can do.
 */
export async function ask<T>(o: AskOptions<T>): Promise<T | null> {
  let problems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const retryNote = problems.length ? `\n\nYour last reply had these problems. Fix them:\n- ${problems.join("\n- ")}` : "";
    let text: string;
    try {
      text = await callClaude(
        { model: o.model, system: o.system, user: o.user + retryNote, maxTokens: o.maxTokens, temperature: o.temperature ?? 0, timeoutMs: o.timeoutMs, label: o.label },
        { apiKey: aiConfig.anthropicKey, workspaceId: aiConfig.anthropicWorkspaceId || undefined },
      );
    } catch (err) {
      console.warn(`[${o.label}] call failed:`, err instanceof Error ? err.message : err);
      // One more try for a passing hiccup; not for a rejected key or a timeout (that would double the wait).
      const fatal = err instanceof Error && (/ 40[13]:/.test(err.message) || err.name === "TimeoutError" || err.name === "AbortError");
      if (attempt === 0 && !fatal) continue;
      void reportProblem({ source: "service", where: `Claude: ${o.label}`, message: err instanceof Error ? err.message : String(err) });
      return null;
    }
    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      problems = ["The reply was not a single JSON object."];
      continue;
    }
    const check = o.schema.safeParse(parsed);
    if (!check.success) {
      problems = check.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
      continue;
    }
    problems = o.check(check.data);
    if (problems.length === 0) return check.data;
  }
  console.warn(`[${o.label}] gave up; the reply failed its checks:`, problems);
  void reportProblem({ source: "service", where: `Claude: ${o.label}`, message: `The reply failed its checks twice: ${problems.join("; ")}` });
  return null;
}

