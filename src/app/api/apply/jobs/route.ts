import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { saveJob, listJobs, saveApplication, listEvidence } from "@/lib/apply/db";
import { gapAndFit, readJobAdvert } from "@/lib/apply/own-data";
import type { Job, Application } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function GET() {
  try {
    const user = await requireUser();
    const jobs = await listJobs(user.id);
    return NextResponse.json(jobs);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/jobs GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list jobs." }, { status: 500 });
  }
}

const Body = z.object({
  text: z.string().max(60_000),
  source: z.enum(["paste", "link", "extension", "feed"]).optional(),
  url: z.string().max(2000).optional(),
});

/**
 * Saves a job from the text of its advert, and starts the person's
 * application for it. The job holds what the advert says: a title, employer
 * or location that can't be read from it is left empty, and no requirement
 * or keyword is supplied that isn't in it. The fit is the figure the
 * advert's requirements and the person's own evidence give, and is null when
 * no requirement could be read.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const read = await readJson(req, Body, { max: 200_000, message: "That advert couldn’t be read. Paste its text and try again." });
    if (!read.ok) return read.response;
    const { source = "paste", url } = read.data;
    const text = read.data.text.trim();

    if (text.length < 30) {
      return NextResponse.json({ error: "too_short", message: "Paste the text of the job advert (at least 30 characters)." }, { status: 400 });
    }

    const parsed = readJobAdvert(text);
    const now = new Date().toISOString();
    const jobId = `job_${crypto.randomBytes(6).toString("hex")}`;
    const dedupeKey = `${parsed.employer.toLowerCase()}_${parsed.title.toLowerCase()}`.replace(/[^a-z0-9]/g, "_").replace(/^_+$/, "") || jobId;

    const newJob: Job = {
      id: jobId,
      userId,
      source,
      url,
      title: parsed.title,
      employer: parsed.employer,
      location: parsed.location,
      remote: parsed.remote,
      text: text.slice(0, 20000),
      // How to apply isn't known from the advert's text.
      applyRoute: "unknown",
      requirements: parsed.requirements,
      keywords: parsed.keywords,
      questions: [],
      tone: parsed.tone,
      dedupeKey,
      createdAt: now,
      updatedAt: now,
    };

    await saveJob(newJob);

    const { gapMap, fit } = gapAndFit(newJob.requirements, await listEvidence(userId));
    const application: Application = {
      id: `app_${crypto.randomBytes(6).toString("hex")}`,
      userId,
      jobId: newJob.id,
      status: "draft",
      gapMap,
      // Stored as a number; with no requirements to measure against it is 0 and the response says it is unknown.
      fit: fit ?? 0,
      answerOutputIds: [],
      mode: "approved",
      // Nothing has happened to this application yet, and the notes are the person's to write.
      stages: [],
      notes: "",
      createdAt: now,
      updatedAt: now,
    };

    await saveApplication(application);

    return NextResponse.json({
      success: true,
      job: newJob,
      applicationId: application.id,
      fit,
      fitKnown: fit != null,
      notFound: [!parsed.title && "title", !parsed.employer && "employer", !parsed.location && "location", !parsed.requirements.length && "requirements"].filter(Boolean),
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/jobs POST] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to process job." }, { status: 500 });
  }
}
