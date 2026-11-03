import { NextResponse } from "next/server";
import { z } from "zod";
import { SKIP_REASONS } from "@/lib/mocks/store";
import { PlanError, stopSession } from "@/lib/sessions/server";

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
  const { sessionId } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Your feedback couldn’t be saved. Try again." }, { status: 400 });
  try {
    const m = stopSession(sessionId, parsed.data);
    return NextResponse.json({ href: `/interviews/${m.interviewId}/rebuild?from=${m.id}` });
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: "cant-stop", message: err.message }, { status: 409 });
    throw err;
  }
}
