import "server-only";

/**
 * API keys and model choices, read from .env.local on the server only.
 * Keys never reach the browser.
 */
export const aiConfig = {
  deepgramKey: process.env.DEEPGRAM_API_KEY ?? "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  /** Only needed if your Claude key isn't scoped to one workspace. */
  anthropicWorkspaceId: process.env.ANTHROPIC_WORKSPACE_ID ?? "",
  mainModel: process.env.HAKKIRI_MAIN_MODEL || "claude-sonnet-5",
  // Haiku 5.5: a tenth of Haiku 4.5's price, and 4.5 is now a legacy model due to be retired.
  fastModel: process.env.HAKKIRI_FAST_MODEL || "claude-haiku-5-5",
};

export function missingKeys(): string[] {
  const missing: string[] = [];
  if (!aiConfig.deepgramKey) missing.push("DEEPGRAM_API_KEY");
  if (!aiConfig.anthropicKey) missing.push("ANTHROPIC_API_KEY");
  return missing;
}
