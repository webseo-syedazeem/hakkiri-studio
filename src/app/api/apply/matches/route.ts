import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { APPLY_COLLECTIONS, deleteDoc, listJobs, listMatches } from "@/lib/apply/db";
import { isSeededMatch } from "@/lib/apply/seeded";

/**
 * The person's job matches. There are none until something real has made
 * one: nothing is written in to fill the list. The two sample matches an
 * earlier build saved into every account are deleted here, and a match whose
 * job is not one of the person's own is left out.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const all = await listMatches(user.id);
    for (const m of all.filter(isSeededMatch)) await deleteDoc(APPLY_COLLECTIONS.MATCHES, m.id);
    const jobsById = new Map((await listJobs(user.id)).map((j) => [j.id, j]));
    const matches = all.filter((m) => !isSeededMatch(m) && jobsById.has(m.jobId)).map((m) => ({ ...m, job: jobsById.get(m.jobId)! }));
    return NextResponse.json(matches);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/matches GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list matches." }, { status: 500 });
  }
}
