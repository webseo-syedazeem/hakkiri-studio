import { NextResponse } from "next/server";
import { getPresentation } from "@/lib/pitch/store";
import { getQaDraft } from "@/lib/pitch/qa-drafts";
import { scoreQaQuestion } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/qa/{sessionId}/score: score question k while the Q&A carries on. */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const limited = guard(req, "answer", { inSession: true });
  if (limited) return limited;
  const draft = getQaDraft(sessionId);
  setUsageContext({ sessionId, presentationId: draft?.presentationId, feature: "q&a" });
  const p = draft && getPresentation(draft.presentationId);
  const body = (await req.json().catch(() => ({}))) as { k?: number };
  if (!draft || !p || typeof body.k !== "number" || !draft.turns[body.k]) return NextResponse.json({ error: "not-found", message: "This Q&A has expired." }, { status: 404 });
  const answer = await scoreQaQuestion(draft, p, body.k);
  return answer ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "scoring-failed", message: "That answer couldn’t be scored yet. It will be tried again at the end." }, { status: 502 });
}
