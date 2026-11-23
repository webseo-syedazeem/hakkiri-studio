import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import {
  getApplication,
  saveApplication,
  getJob,
  listEvidence,
  getVoice,
  listOutputs,
  listSendLogs,
} from "@/lib/apply/db";
import type { Application } from "@/lib/apply/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const application = await getApplication(id);

    if (!application || application.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const job = await getJob(application.jobId);
    const evidenceList = await listEvidence(user.id);
    const voice = await getVoice(user.id);
    const outputs = await listOutputs(application.id);
    const sendLogs = await listSendLogs(application.id);

    return NextResponse.json({
      application,
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getApplication(id);

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const body = await req.json();
    const updated: Application = {
      ...existing,
      ...body,
      id: existing.id,
      userId: user.id,
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
