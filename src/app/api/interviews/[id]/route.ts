import { NextResponse } from "next/server";
import { deleteInterview, getInterview, isDemoInterview } from "@/lib/interviews/store";
import { deleteAnswersFor } from "@/lib/answers/store";
import { deleteRecordings } from "@/lib/answers/audio";
import { deleteMocksFor } from "@/lib/mocks/store";
import { removeQuestionsFor } from "@/lib/questions/store";

export const runtime = "nodejs";

/**
 * DELETE /api/interviews/{id}: deletes an interview you set up, with its CV
 * and job text, your answers, recordings, mocks and added questions
 * (spec: "Delete any of them at any time"). The demo can't be deleted.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getInterview(id)) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist." }, { status: 404 });
  if (isDemoInterview(id)) return NextResponse.json({ error: "demo", message: "The demo interview can’t be deleted." }, { status: 400 });
  deleteRecordings(deleteAnswersFor(id));
  deleteMocksFor(id);
  removeQuestionsFor(id);
  deleteInterview(id);
  return NextResponse.json({ ok: true });
}
