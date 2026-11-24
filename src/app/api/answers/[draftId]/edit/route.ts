import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/require";
import { findAnswer, findAnswerAsync, saveAnswerAsync } from "@/lib/answers/store";
import { readJsonValue } from "@/lib/http/body";

const Body = z.object({
  text: z.string().trim().min(1, "Answer text cannot be empty").max(10000),
});

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorised", message: "Sign in required to edit responses." }, { status: 401 });
  }

  const { draftId } = await params;
  const answer = (await findAnswerAsync(draftId, user.id)) ?? findAnswer(draftId, user.id);
  if (!answer) {
    return NextResponse.json({ error: "not-found", message: "Answer not found." }, { status: 404 });
  }

  const sent = await readJsonValue(req, 40_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", details: parsed.error.issues }, { status: 400 });
  }

  // The correction is kept beside the answer. The words as they were heard, with their timings and marks, are
  // left untouched, so the length, pace, delivery score and every other measurement stay those of the recording.
  // (This used to replace the words with the corrected ones and invented timings for them, which changed the
  // delivery score and length shown for an answer nobody had re-recorded.)
  const corrected = parsed.data.text.replace(/\s+/g, " ").trim();
  const heard = answer.words.map((w) => w.text).join(" ");
  const updated = { ...answer, correctedText: corrected === heard ? undefined : corrected };

  await saveAnswerAsync(updated, user.id);

  return NextResponse.json({ ok: true, id: answer.id, wordCount: corrected.split(" ").length, corrected: updated.correctedText !== undefined });
}
