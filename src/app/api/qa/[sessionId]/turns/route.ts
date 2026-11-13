import { NextResponse } from "next/server";
import { getPresentation } from "@/lib/pitch/store";
import { getQaDraft, getQaDraftAsync } from "@/lib/pitch/qa-drafts";
import { answerQa } from "@/lib/pitch/server";
import { mockQaTranscript } from "@/lib/ai/pitch/mock";
import { MAX_AUDIO_BYTES, notConfigured, scoringError, transcribe } from "@/lib/answers/pipeline";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/qa/{sessionId}/turns: your answer to question k (or your reply
 * when they asked again). Returns the press to ask, or null to move on.
 * cutIn=1 means a time-pressed exec stopped you, so they ask for the short answer.
 */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const limited = guard(req, "answer", { inSession: true });
  if (limited) return limited;
  setUsageContext({ sessionId: (await params).sessionId, feature: "q&a" });
  const blocked = notConfigured();
  if (blocked) return blocked;
  const { sessionId } = await params;
  const draft = (await getQaDraftAsync(sessionId)) ?? getQaDraft(sessionId);
  const p = draft && getPresentation(draft.presentationId);
  if (!draft || !p) return NextResponse.json({ error: "not-found", message: "This Q&A has expired. Start it again." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  const k = Number(form?.get("k"));
  if (!(audio instanceof Blob) || !Number.isInteger(k) || k < 0 || k >= draft.questions.length) {
    return NextResponse.json({ error: "bad-request", message: "Missing the recording." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: "too-large", message: "That answer is too long to score." }, { status: 413 });

  try {
    const turn = draft.turns[k].length;
    const words = await transcribe(audio, () => mockQaTranscript(k, turn));
    if (turn === 0 && words.length < 3) {
      return NextResponse.json({ error: "no-speech", message: "We couldn’t hear an answer. Check your mic and try again." }, { status: 422 });
    }
    const press = await answerQa(draft, p, k, words, { data: await audio.arrayBuffer(), type: audio.type || "audio/webm" }, form?.get("cutIn") === "1");
    return NextResponse.json({ press });
  } catch (err) {
    return scoringError(err);
  }
}
