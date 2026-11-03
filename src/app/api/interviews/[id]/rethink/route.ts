import { NextResponse } from "next/server";
import { z } from "zod";
import { PlanError, rethinkFrom } from "@/lib/sessions/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 90;

const Body = z.object({ sessionId: z.string() });

/**
 * POST /api/interviews/{id}/rethink: after "Something's wrong", rereads the
 * documents with your feedback and returns what Hakkiri understood before and
 * now, plus rules for the next questions. Nothing is saved until you confirm.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blocked = guard(req, "ai");
  if (blocked) return blocked;
  setUsageContext({ interviewId: id, feature: "questions" });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "There’s nothing to rebuild from." }, { status: 400 });
  try {
    return NextResponse.json(await rethinkFrom(id, parsed.data.sessionId));
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: "cant-rethink", message: err.message }, { status: 409 });
    console.error("[rethink] failed:", err);
    return NextResponse.json({ error: "failed", message: "Hakkiri couldn’t reread the job. Try again." }, { status: 500 });
  }
}
