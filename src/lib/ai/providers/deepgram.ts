import type { Word } from "@/lib/types";
import type { SpeechToText } from "@/lib/ai/types";
import { recordUsage } from "@/lib/usage/store";

/**
 * Deepgram speech-to-text (pre-recorded endpoint, whole answer at once).
 * filler_words=true is essential: without it Deepgram removes "um" and "uh",
 * and the filler count and transcript markup stop working.
 * https://developers.deepgram.com/docs/filler-words
 */
const ENDPOINT = "https://api.deepgram.com/v1/listen";

export const DEEPGRAM_PARAMS = {
  model: "nova-3",
  language: "en",
  filler_words: "true",
  punctuate: "true",
  smart_format: "false", // keep numbers and words as spoken
  // Out of Deepgram's Model Improvement Program: your recordings aren't kept
  // to train their models, only for as long as it takes to transcribe them.
  // https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program
  mip_opt_out: "true",
} as const;

interface DeepgramWord {
  word: string;
  punctuated_word?: string;
  start: number;
  end: number;
  confidence?: number;
}

/** Turns Deepgram's response into Hakkiri words. Exported for tests. */
export function parseDeepgramWords(json: unknown): Word[] {
  const words = (json as { results?: { channels?: { alternatives?: { words?: DeepgramWord[] }[] }[] } })?.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];
  return words.map((w) => ({
    text: w.punctuated_word ?? w.word,
    start: Math.round(w.start * 100) / 100,
    end: Math.round(w.end * 100) / 100,
  }));
}

export class DeepgramSpeechToText implements SpeechToText {
  readonly name = "deepgram-nova-3";
  constructor(private readonly apiKey: string) {}

  async transcribe(audio: ArrayBuffer, opts: { mimeType: string; language?: string }): Promise<{ words: Word[] }> {
    const url = `${ENDPOINT}?${new URLSearchParams({ ...DEEPGRAM_PARAMS, language: opts.language ?? DEEPGRAM_PARAMS.language })}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Token ${this.apiKey}`, "Content-Type": opts.mimeType || "audio/webm" },
      body: audio,
      // A stalled upload or transcription shouldn't pin the request open for good.
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new ProviderError("deepgram", res.status, detail.slice(0, 300));
    }
    const json = (await res.json()) as { metadata?: { duration?: number } };
    const words = parseDeepgramWords(json);
    recordUsage({ service: "deepgram", label: "speech-to-text", model: DEEPGRAM_PARAMS.model, seconds: json.metadata?.duration ?? words.at(-1)?.end ?? 0 });
    return { words };
  }
}

export const DEEPGRAM_VOICES: Record<"easy" | "medium" | "hard", { id: string; name: string }> = {
  easy: { id: process.env.DEEPGRAM_VOICE_EASY || "aura-asteria-en", name: "Asteria" },
  medium: { id: process.env.DEEPGRAM_VOICE_MEDIUM || "aura-helios-en", name: "Helios" },
  hard: { id: process.env.DEEPGRAM_VOICE_HARD || "aura-orion-en", name: "Orion" },
};

/**
 * Deepgram Aura text-to-speech: fast natural voice using the existing Deepgram API key.
 * https://developers.deepgram.com/docs/text-to-speech
 */
export async function synthesiseDeepgram(text: string, voice: "easy" | "medium" | "hard", apiKey: string): Promise<ArrayBuffer> {
  const voiceConfig = DEEPGRAM_VOICES[voice] || DEEPGRAM_VOICES.medium;
  const url = `https://api.deepgram.com/v1/speak?model=${voiceConfig.id}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ProviderError("deepgram-aura", res.status, detail.slice(0, 300));
  }
  return res.arrayBuffer();
}

export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
    detail: string,
  ) {
    super(`${provider} returned ${status}: ${detail}`);
  }
}
