import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/require";
import { findAnswer, findAnswerAsync, saveAnswerAsync } from "@/lib/answers/store";
import type { Word } from "@/lib/types";

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

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", details: parsed.error.issues }, { status: 400 });
  }

  const newText = parsed.data.text;
  const rawWords = newText.split(/\s+/).filter(Boolean);

  // Generate synthetic word timings preserving speech cadence
  let cursor = 0;
  const words: Word[] = rawWords.map((w, idx) => {
    const start = cursor;
    const end = Number((cursor + 0.35).toFixed(2));
    cursor = Number((end + 0.08).toFixed(2));
    return { text: w, start, end };
  });

  const updated = {
    ...answer,
    words,
    // The marks on the transcript were made for the words as first heard. They are not carried onto corrected
    // words, and nothing is marked "good" that has not been judged.
    highlights: [],
  };

  await saveAnswerAsync(updated, user.id);

  return NextResponse.json({ ok: true, id: answer.id, wordCount: words.length });
}
