import { NextResponse } from "next/server";
import { z } from "zod";
import { getPresentation } from "@/lib/pitch/store";
import { startQa } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({ presentationId: z.string(), style: z.enum(["curious", "sceptical", "time-pressed", "technical"]) });

/**
 * POST /api/qa: starts an audience Q&A (design screen 14). Questions come from
 * your slides and what you said in your last full run.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = guard(req, "plan", { practice: true });
  if (blocked) return blocked;
  setUsageContext({ feature: "q&a" });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  const p = parsed.success ? getPresentation(parsed.data.presentationId) : undefined;
  if (!parsed.success || !p) return NextResponse.json({ error: "bad-request", message: "That presentation doesn’t exist." }, { status: 400 });
  const draft = await startQa(p, parsed.data.style);
  return NextResponse.json({ sessionId: draft.id, persona: draft.persona, questions: draft.questions });
}
