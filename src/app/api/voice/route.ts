import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { elevenLabsKey, ELEVENLABS_MODEL, synthesise, VOICES } from "@/lib/ai/providers/elevenlabs";
import { DEEPGRAM_VOICES, synthesiseDeepgram } from "@/lib/ai/providers/deepgram";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { loadFile, saveFile } from "@/lib/storage/disk";
import { guard } from "@/lib/usage/limits";
import { recordUsage } from "@/lib/usage/store";
import { reportProblem } from "@/lib/alerts/store";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({ text: z.string().trim().min(1).max(700), voice: z.enum(["easy", "medium", "hard"]) });

/**
 * POST /api/voice: the interviewer says `text` (MP3). Each line is made once
 * and kept, so the same question never costs twice. Uses ElevenLabs if an
 * ELEVENLABS_API_KEY is present; otherwise falls back to Deepgram Aura
 * using the existing DEEPGRAM_API_KEY. Without keys (or in test mode) it answers
 * 501 and the browser uses its own voice.
 */
export async function POST(req: Request) {
  const elevenKey = elevenLabsKey();
  const deepgramKey = aiConfig.deepgramKey;
  if ((!elevenKey && !deepgramKey) || mockAiEnabled()) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  const blocked = guard(req, "voice");
  if (blocked) return blocked;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const { text, voice } = parsed.data;

  const provider = elevenKey ? "elevenlabs" : "deepgram";
  const voiceId = elevenKey ? VOICES[voice].id : DEEPGRAM_VOICES[voice].id;
  const model = elevenKey ? ELEVENLABS_MODEL : "aura";

  const hash = createHash("sha256").update(`${provider}|${voiceId}|${model}|${text}`).digest("hex").slice(0, 32);
  const file = `voice-cache/${hash}.mp3`;
  const cached = loadFile(file);
  const headers = { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" };
  if (cached) return new Response(cached, { headers });

  try {
    const audio = elevenKey
      ? await synthesise(text, voice, elevenKey)
      : await synthesiseDeepgram(text, voice, deepgramKey);
    saveFile(file, audio);
    recordUsage({ service: provider, label: "interviewer-voice", model, characters: text.length, feature: "voice" });
    return new Response(audio, { headers });
  } catch (err) {
    console.warn(`[voice] ${provider} failed, the browser voice takes over:`, err instanceof Error ? err.message : err);
    void reportProblem({ source: "service", where: `${provider}: interviewer voice`, message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "voice-failed" }, { status: 502 });
  }
}
