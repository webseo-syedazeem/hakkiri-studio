import "server-only";

/**
 * API keys and model choices, read from .env.local on the server only.
 * Keys never reach the browser.
 */
export const aiConfig = {
  get geminiKey() {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.gemini_api_key ||
      process.env.GOOGLE_API_KEY ||
      process.env.google_api_key ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.google_genai_api_key ||
      ""
    );
  },
  get deepgramKey() {
    return process.env.DEEPGRAM_API_KEY || process.env.deepgram_api_key || "";
  },
  get anthropicKey() {
    return process.env.ANTHROPIC_API_KEY || process.env.anthropic_api_key || "";
  },
  get anthropicWorkspaceId() {
    return process.env.ANTHROPIC_WORKSPACE_ID ?? "";
  },
  get mainModel() {
    return process.env.HAKKIRI_MAIN_MODEL || "claude-sonnet-5";
  },
  get fastModel() {
    return process.env.HAKKIRI_FAST_MODEL || "claude-haiku-5-5";
  },
};

export function missingKeys(): string[] {
  const missing: string[] = [];
  if (!aiConfig.deepgramKey) missing.push("DEEPGRAM_API_KEY");
  if (!aiConfig.anthropicKey && !aiConfig.geminiKey) missing.push("GEMINI_API_KEY or ANTHROPIC_API_KEY");
  return missing;
}
