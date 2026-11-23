import { NextResponse } from "next/server";
import { devOr } from "@/lib/launch";
import { getPresentation } from "@/lib/pitch/store";
import { getQaDraft, getQaDraftAsync, deleteQaDraftAsync } from "@/lib/pitch/qa-drafts";
import { finishQa } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { flushStorage } from "@/lib/storage/disk";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 120;

/** POST /api/qa/{sessionId}/finish: waits for every answer's score and saves the Q&A for its report. */
export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { sessionId } = await params;
  const limited = guard(req, "answer", { inSession: true });
  if (limited) return limited;
  const draft = (await getQaDraftAsync(sessionId)) ?? getQaDraft(sessionId);
  if (!draft || draft.userId !== user.id) return NextResponse.json({ error: "not-found", message: "This Q&A has expired. Start it again." }, { status: 404 });
  setUsageContext({ userId: user.id, sessionId, presentationId: draft.presentationId, feature: "q&a" });
  const p = getPresentation(draft.presentationId, user.id);
  if (!p) return NextResponse.json({ error: "not-found", message: "This Q&A has expired. Start it again." }, { status: 404 });
  const session = await finishQa(draft, p, user.id);
  await flushStorage();
  return NextResponse.json({ id: session.id });
}
