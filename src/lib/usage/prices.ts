/**
 * Estimated prices in US dollars, for the usage page and the spending limits.
 * Starting points from public price lists (checked 26 October 2026); override any of
 * them in .env.local if your rates differ. Estimates, not invoices: check
 * each provider's dashboard for what you're actually billed.
 */

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** Dollars per million tokens: input, output, and cached input. */
export const CLAUDE_PRICES: Record<string, { input: number; output: number; cached: number }> = {
  sonnet: { input: num(process.env.HAKKIRI_PRICE_SONNET_IN, 2), output: num(process.env.HAKKIRI_PRICE_SONNET_OUT, 10), cached: 0.2 },
  haiku: { input: num(process.env.HAKKIRI_PRICE_HAIKU_IN, 1), output: num(process.env.HAKKIRI_PRICE_HAIKU_OUT, 5), cached: 0.1 },
  /** Haiku 5.5, for prompts up to 100,000 tokens (all of Hakkiri's). */
  haiku5: { input: num(process.env.HAKKIRI_PRICE_HAIKU5_IN, 0.1), output: num(process.env.HAKKIRI_PRICE_HAIKU5_OUT, 0.5), cached: 0.01 },
  opus: { input: num(process.env.HAKKIRI_PRICE_OPUS_IN, 5), output: num(process.env.HAKKIRI_PRICE_OPUS_OUT, 25), cached: 0.5 },
};

export function claudePrice(model: string) {
  const m = model.toLowerCase();
  return m.includes("haiku-5") ? CLAUDE_PRICES.haiku5 : m.includes("haiku") ? CLAUDE_PRICES.haiku : m.includes("opus") ? CLAUDE_PRICES.opus : CLAUDE_PRICES.sonnet;
}

/** Deepgram Nova-3, pre-recorded audio, dollars per minute. */
export const DEEPGRAM_PER_MIN = num(process.env.HAKKIRI_PRICE_DEEPGRAM_MIN, 0.0043);

/** ElevenLabs Flash v2.5 on the Creator plan, dollars per 1,000 characters (May 2026 price list). */
export const ELEVENLABS_PER_1K = num(process.env.HAKKIRI_PRICE_ELEVENLABS_1K, 0.05);

/** A 5-minute prompt-cache write costs 1.25 times the input price. */
export const CACHE_WRITE_FACTOR = 1.25;

export function costOf(e: { service: "claude" | "deepgram" | "elevenlabs"; model?: string; inputTokens?: number; outputTokens?: number; cachedTokens?: number; cacheWriteTokens?: number; seconds?: number; characters?: number }): number {
  if (e.service === "claude") {
    const p = claudePrice(e.model ?? "");
    return ((e.inputTokens ?? 0) * p.input + (e.outputTokens ?? 0) * p.output + (e.cachedTokens ?? 0) * p.cached + (e.cacheWriteTokens ?? 0) * p.input * CACHE_WRITE_FACTOR) / 1_000_000;
  }
  if (e.service === "deepgram") return e.characters ? ((e.characters / 1000) * 0.015) : (((e.seconds ?? 0) / 60) * DEEPGRAM_PER_MIN);
  return ((e.characters ?? 0) / 1000) * ELEVENLABS_PER_1K;
}

/** "$0.42", "$0.004", "under $0.001" */
export function dollars(n: number): string {
  if (n <= 0) return "$0.00";
  if (n < 0.001) return "under $0.001";
  if (n < 0.1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}
