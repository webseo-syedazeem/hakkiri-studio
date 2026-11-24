import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { DeepgramSpeechToText } from "@/lib/ai/providers/deepgram";
import { badInput, failure, requireUserId } from "@/lib/cv/access";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * POST /api/cv/transcribe: what the person said, as text for them to correct.
 * The recording is read in memory and not kept. In test mode, and without a
 * speech-to-text key, this answers 501 and the person types instead: no
 * stand-in words are ever returned as theirs.
 */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    if (mockAiEnabled() || !aiConfig.deepgramKey) {
      return NextResponse.json({ error: "not-configured", message: "Speech-to-text isn’t switched on here. Type your answer instead." }, { status: 501 });
    }
    const limited = guard(req, "transcribe", { userId });
    if (limited) return limited;
    setUsageContext({ userId, feature: "cv writing" });
    const form = await req.formData().catch(() => null);
    const audio = form?.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) return badInput("No recording arrived. Try again, or type your answer.");
    if (audio.size > MAX_BYTES) return badInput("That recording is too long. Record a shorter answer, or type it.");
    const { words } = await new DeepgramSpeechToText(aiConfig.deepgramKey).transcribe(await audio.arrayBuffer(), { mimeType: audio.type || "audio/webm", language: (form?.get("region") === "us" ? "en-US" : "en-GB") });
    const text = words.map((w) => w.text).join(" ").replace(/\s+([,.;:!?])/g, "$1").trim();
    if (!text) return NextResponse.json({ error: "silent", message: "We couldn’t hear any words in that recording. Try again, or type your answer." }, { status: 422 });
    return NextResponse.json({ text });
  } catch (err) {
    return failure("api/cv/transcribe POST", err, "The recording couldn’t be turned into text. Try again, or type your answer.");
  }
}
