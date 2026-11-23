import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { listApplications, listJobs } from "@/lib/apply/db";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;
    const apps = await listApplications(userId);
    const jobs = await listJobs(userId);
    const jobsById = new Map(jobs.map((j) => [j.id, j]));

    const enriched = apps.map((app) => ({
      ...app,
      job: jobsById.get(app.jobId) || {
        title: "Role Application",
        employer: "Company",
        location: "Remote / Hybrid",
      },
    }));

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list applications." }, { status: 500 });
  }
}
