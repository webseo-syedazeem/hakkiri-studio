import "server-only";

/**
 * API keys and model choices, read from .env.local on the server only.
 * Keys never reach the browser.
 */
export const aiConfig = {
  geminiKey:
    process.env.GEMINI_API_KEY ||
    process.env.gemini_api_key ||
    process.env.GOOGLE_API_KEY ||
    process.env.google_api_key ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.google_genai_api_key ||
    "",
  deepgramKey:
    process.env.DEEPGRAM_API_KEY ||
    process.env.deepgram_api_key ||
    "",
  anthropicKey:
    process.env.ANTHROPIC_API_KEY ||
    process.env.anthropic_api_key ||
    "",
  /** Only needed if your Claude key isn't scoped to one workspace. */
  anthropicWorkspaceId: process.env.ANTHROPIC_WORKSPACE_ID ?? "",
  mainModel: process.env.HAKKIRI_MAIN_MODEL || "claude-sonnet-5",
  // Haiku 5.5: a tenth of Haiku 4.5's price, and 4.5 is now a legacy model due to be retired.
  fastModel: process.env.HAKKIRI_FAST_MODEL || "claude-haiku-5-5",
};

export function missingKeys(): string[] {
  const missing: string[] = [];
  if (!aiConfig.deepgramKey) missing.push("DEEPGRAM_API_KEY");
  if (!aiConfig.anthropicKey && !aiConfig.geminiKey) missing.push("GEMINI_API_KEY or ANTHROPIC_API_KEY");
  return missing;
}
