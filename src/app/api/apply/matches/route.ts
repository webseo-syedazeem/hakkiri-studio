import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { listMatches, saveMatch, listJobs } from "@/lib/apply/db";
import type { Match } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    let matches = await listMatches(userId);
    const jobs = await listJobs();
    const jobsById = new Map(jobs.map((j) => [j.id, j]));

    if (matches.length === 0) {
      const now = new Date().toISOString();
      const demoMatches: Match[] = [
        {
          id: `match_${crypto.randomBytes(6).toString("hex")}`,
          userId,
          jobId: jobs[0]?.id || "job_1",
          fit: 88,
          reasons: [
            "Strong TypeScript & Next.js commercial experience",
            "Confirmed AWS serverless cloud deployment background",
            "Matched salary requirements (>£85k)",
          ],
          missing: ["Knowledge of GraphQL federation (nice-to-have)"],
          state: "new",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `match_${crypto.randomBytes(6).toString("hex")}`,
          userId,
          jobId: jobs[1]?.id || "job_2",
          fit: 82,
          reasons: [
            "Mentored engineering teams and established sprint cadence",
            "Experience with real-time financial transaction systems",
          ],
          missing: ["Kubernetes cluster orchestration"],
          state: "saved",
          createdAt: now,
          updatedAt: now,
        },
      ];
      for (const m of demoMatches) {
        await saveMatch(m);
      }
      matches = demoMatches;
    }

    const enriched = matches.map((m) => ({
      ...m,
      job: jobsById.get(m.jobId) || {
        title: "Staff Software Engineer",
        employer: "Global FinTech",
        location: "London (Hybrid)",
        applyRoute: "open-form",
      },
    }));

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/matches GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list matches." }, { status: 500 });
  }
}
