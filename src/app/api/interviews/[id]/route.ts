import { z } from "zod";
import { SettingsBody } from "@/lib/interviews/settings-schema";
import { mixIsValid, settingsOr } from "@/lib/interviews/settings";
import { NextResponse } from "next/server";
import { deleteInterview, getInterview, isDemoInterview, updateInterview, updateInterviewAsync } from "@/lib/interviews/store";
import { deleteAnswersFor } from "@/lib/answers/store";
import { deleteRecordings } from "@/lib/answers/audio";
import { deleteMocksFor } from "@/lib/mocks/store";
import { removeQuestionsFor } from "@/lib/questions/store";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";

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
  deleteMocksFor(id, user.id);
  removeQuestionsFor(id, user.id);
  deleteInterview(id, user.id);
  return NextResponse.json({ ok: true });
}

const short = (max: number) => z.string().trim().max(max);
const Stage = z.object({ id: short(60).optional(), name: short(120).min(1), date: short(40).optional(), time: short(20).optional(), format: short(60).optional(), interviewer: short(120).optional(), status: short(40).optional() }).strict();
const Patch = z.object({ stages: z.array(Stage).max(12).optional(), settings: SettingsBody.partial().optional() }).strict();

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
  // Only the stages and the practice settings can be changed here, and each is checked: a stage is a few short
  // lines of text, and settings are the same shape the session routes accept. Anything else is refused.
  const read = await readJson(req, Patch, { max: 20_000, message: "That change couldn’t be saved." });
  if (!read.ok) return read.response;
  const body = read.data;
  if (body.settings?.mix && !mixIsValid(body.settings.mix)) return NextResponse.json({ error: "bad-request", message: "Those question settings don’t add up." }, { status: 400 });

  const updated = await updateInterviewAsync(
    id,
    (current) => ({
      ...current,
      stages: body.stages ?? current.stages,
      ...(body.settings ? { settings: { ...settingsOr(current.settings, current.style), ...body.settings } } : {}),
    }),
    user.id,
  );

  if (!updated) {
    return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, interview: updated });
}
