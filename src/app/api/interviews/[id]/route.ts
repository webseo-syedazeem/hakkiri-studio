import { NextResponse } from "next/server";
import { deleteInterview, getInterview, isDemoInterview, updateInterview } from "@/lib/interviews/store";
import { deleteAnswersFor } from "@/lib/answers/store";
import { deleteRecordings } from "@/lib/answers/audio";
import { deleteMocksFor } from "@/lib/mocks/store";
import { removeQuestionsFor } from "@/lib/questions/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";

/**
 * DELETE /api/interviews/{id}: deletes an interview you set up, with its CV
 * and job text, your answers, recordings, mocks and added questions
 * (spec: "Delete any of them at any time"). The demo can't be deleted.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { id } = await params;
  const interview = getInterview(id, user.id);
  if (!interview) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist." }, { status: 404 });
  if (isDemoInterview(id)) return NextResponse.json({ error: "demo", message: "The demo interview can’t be deleted." }, { status: 400 });
  deleteRecordings(deleteAnswersFor(id, user.id));
  deleteMocksFor(id);
  removeQuestionsFor(id);
  deleteInterview(id, user.id);
  return NextResponse.json({ ok: true });
}

/**
 * PATCH /api/interviews/{id}: updates interview metadata, such as stages / rounds.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { stages?: any[]; settings?: any } | null;
  if (!body) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const updated = updateInterview(
    id,
    (current) => {
      const nextStages = Array.isArray(body.stages) ? body.stages : current.stages;
      return {
        ...current,
        stages: nextStages,
        ...(body.settings ? { settings: { ...current.settings, ...body.settings } } : {}),
      };
    },
    user.id,
  );

  if (!updated) {
    return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, interview: updated });
}
