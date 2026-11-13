import { NextResponse } from "next/server";
import { mockFollowUpTranscript } from "@/lib/ai/mock";
import { getDraft, getDraftAsync, saveDraft, saveDraftAsync } from "@/lib/answers/drafts";
import { MAX_AUDIO_BYTES, nextFollowUp, notConfigured, scoringError, transcribe } from "@/lib/answers/pipeline";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/answers/{draftId}/turns: the reply to the follow-up just asked.
 * Transcribes it, adds it to the draft, and asks the interviewer whether
 * to follow up again (never more than the style allows).
 */
export async function POST(req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = notConfigured();
  if (blocked) return blocked;

  const { draftId } = await params;
  const limited = guard(req, "answer", { inSession: true });
  if (limited) return limited;
  const draft = (await getDraftAsync(draftId)) ?? getDraft(draftId);
  if (draft) setUsageContext({ interviewId: draft.interviewId, sessionId: draft.sessionId, feature: draft.sessionId ? "interview" : "single question" });
  if (!draft) return NextResponse.json({ error: "not-found", message: "This answer has expired. Start the question again." }, { status: 404 });
  if (!draft.pending) return NextResponse.json({ error: "no-follow-up", message: "There’s no follow-up waiting for a reply." }, { status: 409 });

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob)) return NextResponse.json({ error: "bad-request", message: "Missing the recording." }, { status: 400 });
  if (audio.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: "too-large", message: "That recording is too long." }, { status: 413 });

  try {
    const words = await transcribe(audio, mockFollowUpTranscript);
    const { kind, question } = draft.pending;
    if (words.length < 3) {
      // Nothing heard: drop this follow-up and move on rather than score silence.
      draft.pending = null;
      await saveDraftAsync(draft);
      return NextResponse.json({ followUp: null, skipped: true });
    }
    draft.turns.push({ asked: question, kind, words });
    draft.audio.push({ data: await audio.arrayBuffer(), type: audio.type || "audio/webm" });
    const { followUp } = await nextFollowUp(draft);
    await saveDraftAsync(draft);
    return NextResponse.json({ followUp });
  } catch (err) {
    return scoringError(err);
  }
}
