import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { elevenLabsKey, ELEVENLABS_MODEL, synthesise, VOICES } from "@/lib/ai/providers/elevenlabs";
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
 * and kept, so the same question never costs twice. Without an ElevenLabs key
 * (or in test mode) it answers 501 and the browser uses its own voice.
 */
export async function POST(req: Request) {
  const key = elevenLabsKey();
  if (!key || mockAiEnabled()) return NextResponse.json({ error: "not-configured" }, { status: 501 });
  const blocked = guard(req, "voice");
  if (blocked) return blocked;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const { text, voice } = parsed.data;

  const hash = createHash("sha256").update(`${VOICES[voice].id}|${ELEVENLABS_MODEL}|${text}`).digest("hex").slice(0, 32);
  const file = `voice-cache/${hash}.mp3`;
  const cached = loadFile(file);
  const headers = { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" };
  if (cached) return new Response(cached, { headers });
  try {
    const audio = await synthesise(text, voice, key);
    saveFile(file, audio);
    recordUsage({ service: "elevenlabs", label: "interviewer-voice", model: ELEVENLABS_MODEL, characters: text.length, feature: "voice" });
    return new Response(audio, { headers });
  } catch (err) {
    console.warn("[voice] ElevenLabs failed, the browser voice takes over:", err instanceof Error ? err.message : err);
    void reportProblem({ source: "service", where: "ElevenLabs: interviewer voice", message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "voice-failed" }, { status: 502 });
  }
}
