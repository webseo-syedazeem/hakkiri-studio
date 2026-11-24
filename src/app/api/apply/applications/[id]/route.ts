import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import {
  getApplication,
  saveApplication,
  getJob,
  listEvidence,
  getVoice,
  listOutputs,
  listSendLogs,
} from "@/lib/apply/db";
import { fitFromGapMap } from "@/lib/apply/own-data";
import { ApplicationStatus, type Application } from "@/lib/apply/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    // Each of these is the signed-in person's own: an application, its job and its drafts belonging to
    // anyone else are simply not found.
    const application = await getApplication(id, user.id);

    if (!application) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const job = await getJob(application.jobId, user.id);
    // The fit shown is worked out from the saved gap map, so a figure that was once raised to a minimum is not shown.
    const fit = job ? fitFromGapMap(job.requirements, application.gapMap) : null;
    const evidenceList = await listEvidence(user.id);
    const voice = await getVoice(user.id);
    const outputs = await listOutputs(application.id, user.id);
    const sendLogs = await listSendLogs(application.id, user.id);

    return NextResponse.json({
      application: { ...application, fit: fit ?? 0, fitKnown: fit != null },
      job,
      evidenceList,
      voice,
      outputs,
      sendLogs,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id] GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load application workspace." }, { status: 500 });
  }
}

/**
 * What a person can change about an application: where it has got to, its
 * stages and their own notes. The job it is for, its owner, its fit and the
 * drafts attached to it are set by the server and can't be sent in.
 */
const Patch = z
  .object({
    status: ApplicationStatus.optional(),
    notes: z.string().max(5000).optional(),
    stages: z
      .array(z.object({ name: z.string().trim().min(1).max(120), date: z.string().max(40).optional(), outcome: z.string().max(200).optional() }).strict())
      .max(20)
      .optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getApplication(id, user.id);

    if (!existing) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const read = await readJson(req, Patch, { max: 20_000, message: "That change couldn’t be saved." });
    if (!read.ok) return read.response;
    const updated: Application = {
      ...existing,
      ...read.data,
      updatedAt: new Date().toISOString(),
    };

    await saveApplication(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id] PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update application." }, { status: 500 });
  }
}
