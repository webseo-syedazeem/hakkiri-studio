import { NextResponse } from "next/server";
import { z } from "zod";
import { findMockAsync, saveMockAsync, SKIP_REASONS } from "@/lib/mocks/store";
import { getInterview, saveInterviewAsync } from "@/lib/interviews/store";
import { PlanError, stopSession } from "@/lib/sessions/server";
import { flushStorage } from "@/lib/storage/disk";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";

const Body = z.object({
  reasons: z.array(z.enum(["wrong-job", "wrong-company", "not-true", "wrong-level", "wrong-kind"])).max(5),
  note: z.string().max(600),
  askedIds: z.array(z.string()).max(60),
  skipped: z.array(z.object({ questionId: z.string(), reason: z.enum(SKIP_REASONS), replacedBy: z.string().optional() })).max(30),
});

/**
 * POST /api/sessions/{id}/stop: "Something's wrong". The interview stops,
 * isn't scored, and your feedback is kept for the rebuild.
 */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { sessionId } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Your feedback couldn’t be saved. Try again." }, { status: 400 });
  try {
    await findMockAsync(sessionId);
    const m = stopSession(sessionId, parsed.data);
    await saveMockAsync(m);
    const updatedInt = getInterview(m.interviewId);
    if (updatedInt && parsed.data.skipped.length) await saveInterviewAsync(updatedInt);
    await flushStorage();
    return NextResponse.json({ href: `/interviews/${m.interviewId}/rebuild?from=${m.id}` });
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: "cant-stop", message: err.message }, { status: 409 });
    throw err;
  }
}
