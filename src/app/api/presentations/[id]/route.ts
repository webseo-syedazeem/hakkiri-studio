import { NextResponse } from "next/server";
import { presentationFromForm } from "@/lib/pitch/payload";
import { deletePresentation, getPresentation, savePresentation } from "@/lib/pitch/store";
import { deleteRecordings } from "@/lib/answers/audio";
import { requireUser } from "@/lib/auth/require";
import { readForm } from "@/lib/http/body";

export const runtime = "nodejs";

/** PUT /api/presentations/{id}: saves changes from the set-up form. Runs so far keep the plan they were scored against. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { id } = await params;
  const existing = getPresentation(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not-found", message: "That presentation doesn’t exist." }, { status: 404 });
  }
  // A deck's text and its slide pictures: 64 MB in all is far more than a real deck, and nothing larger is read in.
  const read = await readForm(req, 64 * 1024 * 1024, "Those changes couldn’t be read. Try again.");
  if (!read.ok) return read.response;
  const form = read.data;
  const p = await presentationFromForm(form, id, existing);
  if ("message" in p) return NextResponse.json({ error: "bad-request", message: p.message }, { status: 400 });
  p.userId = user.id;
  savePresentation(p, user.id);
  return NextResponse.json({ id });
}

/** DELETE /api/presentations/{id}: the presentation, its slide pictures, runs, Q&A rounds and recordings. The demo can't be deleted. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { id } = await params;
  const existing = getPresentation(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not-found", message: "That presentation doesn’t exist." }, { status: 404 });
  }
  const removed = deletePresentation(id, user.id);
  if (!removed) return NextResponse.json({ error: "demo", message: "The demo presentation can’t be deleted." }, { status: 400 });
  // Run recordings are saved under run-<id>; Q&A answers under their own ids.
  deleteRecordings([...removed.runIds.map((r) => `run-${r}`), ...removed.answerIds]);
  return NextResponse.json({ ok: true });
}
