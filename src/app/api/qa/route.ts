import { NextResponse } from "next/server";
import { z } from "zod";
import { getPresentation } from "@/lib/pitch/store";
import { startQa } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";
import { readJsonValue } from "@/lib/http/body";

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

  const blocked = guard(req, "plan", { practice: true, userId: user.id });
  if (blocked) return blocked;
  setUsageContext({ userId: user.id, feature: "q&a" });
  const sent = await readJsonValue(req, 4_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json);
  const p = parsed.success ? getPresentation(parsed.data.presentationId, user.id) : undefined;
  if (!parsed.success || !p) return NextResponse.json({ error: "not-found", message: "That presentation doesn’t exist." }, { status: 404 });
  const draft = await startQa(p, parsed.data.style, user.id);
  return NextResponse.json({ sessionId: draft.id, persona: draft.persona, questions: draft.questions });
}
