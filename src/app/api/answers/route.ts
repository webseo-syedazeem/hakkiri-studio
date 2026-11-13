import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mockTranscript } from "@/lib/ai/mock";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { recordAskedQuestionAsync } from "@/lib/mocks/store";
import { saveDraft, saveDraftAsync, type Draft } from "@/lib/answers/drafts";
import { MAX_AUDIO_BYTES, nextFollowUp, notConfigured, scoringError, transcribe } from "@/lib/answers/pipeline";
import { soundsLikeCorrection } from "@/lib/ai/follow-up";
import { setUsageContext } from "@/lib/usage/store";
import { guard } from "@/lib/usage/limits";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/answers: the main answer to a question.
 * 1. Speech-to-text (Deepgram, fillers kept, word timings)
 * 2. The interviewer decides on a follow-up (fast model)
 * Returns a draft id, plus the follow-up to ask, or null to move on. In an
 * interview, a reply that says the question doesn't apply ("I've never
 * worked there") returns { correction: true } instead, and isn't scored.
 * Then: POST /api/answers/{draftId}/turns for each follow-up reply,
 * and POST /api/answers/{draftId}/score when the interviewer moves on.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = notConfigured();
  if (blocked) return blocked;
  // A body that isn't a form (a wrong client, or a probe) is a 400, not a crash.
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad-request", message: "Missing the recording or the question." }, { status: 400 });
  const limited = guard(req, "answer", form.get("session") ? { inSession: true } : { practice: true });
  if (limited) return limited;

  const audio = form.get("audio");
  const interviewId = String(form.get("interviewId") ?? "");
  const interview = (await getInterviewAsync(interviewId)) ?? getInterview(interviewId);
  const question = resolveInterviewQuestion(interview, String(form.get("questionId") ?? ""));
  if (!(audio instanceof Blob) || !interview || !question) {
    return NextResponse.json({ error: "bad-request", message: "Missing the recording or the question." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "too-large", message: "That recording is too long to score in one go." }, { status: 413 });
  }

  const sessionId = String(form.get("session") ?? "") || undefined;
  setUsageContext({ interviewId: interview.id, sessionId, feature: sessionId ? "interview" : "single question" });
  try {
    const words = await transcribe(audio, mockTranscript);
    // "I've never worked there": the question doesn't apply, so it's skipped rather than scored.
    if (form.get("session") && soundsLikeCorrection(words)) return NextResponse.json({ correction: true });
    if (words.length < 5) {
      return NextResponse.json({ error: "no-speech", message: "We couldn’t hear an answer. Check your mic and try again." }, { status: 422 });
    }
    const draft: Draft = {
      id: randomUUID(),
      interviewId: interview.id,
      questionId: question.id,
      sessionId,
      questionNumber: Number(form.get("questionNumber") ?? 1),
      questionsInMock: Number(form.get("totalQuestions") ?? 1),
      followUpsOn: form.get("followUps") !== "off",
      followUpLimit: form.get("followUpLimit") ? Math.min(3, Math.max(0, Number(form.get("followUpLimit")))) : undefined,
      style: (["friendly", "realistic", "tough"] as const).find((x) => x === form.get("style")) ?? interview.style,
      turns: [{ asked: question.text, kind: "main", words }],
      audio: [{ data: await audio.arrayBuffer(), type: audio.type || "audio/webm" }],
      pending: null,
      createdAt: Date.now(),
    };
    const { followUp, correction } = await nextFollowUp(draft);
    if (correction && form.get("session")) return NextResponse.json({ correction: true });
    await saveDraftAsync(draft);
    await recordAskedQuestionAsync(sessionId, question.id);
    return NextResponse.json({ draftId: draft.id, followUp });
  } catch (err) {
    return scoringError(err);
  }
}
