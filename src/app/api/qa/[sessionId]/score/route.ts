import { NextResponse } from "next/server";
import { getPresentation } from "@/lib/pitch/store";
import { getQaDraft, getQaDraftAsync } from "@/lib/pitch/qa-drafts";
import { scoreQaQuestion } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";
import { readJsonValue } from "@/lib/http/body";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/qa/{sessionId}/score: score question k while the Q&A carries on. */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { sessionId } = await params;
  const limited = guard(req, "answer", { inSession: true, userId: user.id });
  if (limited) return limited;
  const draft = (await getQaDraftAsync(sessionId)) ?? getQaDraft(sessionId);
  if (!draft || draft.userId !== user.id) return NextResponse.json({ error: "not-found", message: "This Q&A has expired." }, { status: 404 });
  setUsageContext({ userId: user.id, sessionId, presentationId: draft.presentationId, feature: "q&a" });
  const p = getPresentation(draft.presentationId, user.id);
  const sent = await readJsonValue(req, 1_000);
  if (!sent.ok) return sent.response;
  const body = (sent.json && typeof sent.json === "object" ? sent.json : {}) as { k?: unknown };
  if (!p || typeof body.k !== "number" || !Number.isInteger(body.k) || body.k < 0 || !draft.turns[body.k]) return NextResponse.json({ error: "not-found", message: "This Q&A has expired." }, { status: 404 });
  const answer = await scoreQaQuestion(draft, p, body.k);
  return answer ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "scoring-failed", message: "That answer couldn’t be scored yet. It will be tried again at the end." }, { status: 502 });
}
