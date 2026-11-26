import "server-only";
import { ProviderError, paceTextForSpeech } from "./deepgram";

/**
 * ElevenLabs text-to-speech: the interviewer's voice. One voice per
 * difficulty (a warmer one for Easy, a firmer one for Hard), on the Flash
 * model for low delay. Change any of them in .env.local.
 * https://elevenlabs.io/docs/api-reference/text-to-speech/convert
 */

export type VoiceName = "easy" | "medium" | "hard";

export const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

/** ElevenLabs' premade voices: Sarah (warm, articulate British female - default), Daniel (steady British male). */
export const VOICES: Record<VoiceName, { id: string; name: string }> = {
  easy: { id: process.env.ELEVENLABS_VOICE_EASY || "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  medium: { id: process.env.ELEVENLABS_VOICE_MEDIUM || "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  hard: { id: process.env.ELEVENLABS_VOICE_HARD || "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },
};

/** Conversational settings with natural prosody and human inflection.
 * Stability (0.50-0.58) and subtle style expression (0.05-0.08) create authentic conversational pauses,
 * human breathing room, and dynamic delivery without monotonic reading or syllable loss.
 */
const SETTINGS: Record<VoiceName, { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean }> = {
  easy: { stability: 0.50, similarity_boost: 0.80, style: 0.08, use_speaker_boost: true },
  medium: { stability: 0.52, similarity_boost: 0.82, style: 0.06, use_speaker_boost: true },
  hard: { stability: 0.58, similarity_boost: 0.85, style: 0.05, use_speaker_boost: true },
};

export const elevenLabsKey = () => process.env.ELEVENLABS_API_KEY ?? "";

export async function synthesise(text: string, voice: VoiceName, apiKey: string): Promise<ArrayBuffer> {
  // Zero retention (ElevenLabs enterprise plans only): they keep no copy of the text or audio.
  const zero = process.env.ELEVENLABS_ZERO_RETENTION === "1" ? "&enable_logging=false" : "";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICES[voice].id}?output_format=mp3_44100_128${zero}`;
  const pacedText = paceTextForSpeech(text);
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: pacedText, model_id: ELEVENLABS_MODEL, voice_settings: SETTINGS[voice] }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new ProviderError("elevenlabs", res.status, (await res.text().catch(() => "")).slice(0, 300));
  return res.arrayBuffer();
}
