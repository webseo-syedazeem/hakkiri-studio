import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { listApplications, listJobs } from "@/lib/apply/db";
import { fitFromGapMap } from "@/lib/apply/own-data";

/**
 * The person's own applications, each with its job. The fit is worked out
 * again here from the saved gap map, so an application saved when the figure
 * was raised to a minimum shows its real one. `fitKnown` is false when the
 * job has no requirements to measure against. A job that can't be found is
 * shown as that, with no stand-in title or employer.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const apps = await listApplications(user.id);
    const jobsById = new Map((await listJobs(user.id)).map((j) => [j.id, j]));

    const enriched = apps.map((app) => {
      const job = jobsById.get(app.jobId);
      const fit = job ? fitFromGapMap(job.requirements, app.gapMap) : null;
      return { ...app, fit: fit ?? 0, fitKnown: fit != null, job: job ?? { title: "", employer: "", location: "", missing: true } };
    });

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list applications." }, { status: 500 });
  }
}
