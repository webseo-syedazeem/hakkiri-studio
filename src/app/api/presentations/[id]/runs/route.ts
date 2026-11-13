import { NextResponse } from "next/server";
import { z } from "zod";
import { getPresentation } from "@/lib/pitch/store";
import { recordRun } from "@/lib/pitch/server";
import { MAX_AUDIO_BYTES, notConfigured, scoringError, transcribe } from "@/lib/answers/pipeline";
import { flushStorage } from "@/lib/storage/disk";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 300;

const Meta = z.object({
  mode: z.enum(["full", "section", "opening"]),
  from: z.number().int().min(1),
  to: z.number().int().min(1),
  startedAt: z.iso.datetime(),
  totalSec: z.number().min(1).max(5400),
  marks: z.array(z.object({ n: z.number().int().min(1), at: z.number().min(0) })).min(1).max(2000),
});

/**
 * POST /api/presentations/{id}/runs: a finished rehearsal (design screen 12).
 * The recording plus the moments you changed slide. Transcribes it, splits
 * it by slide, measures it, has the model judge it, and saves the run for
 * the report (design screen 13).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const limited = guard(req, "answer", { practice: true });
  if (limited) return limited;
  setUsageContext({ userId: user.id, presentationId: (await params).id, feature: "presentation" });
  const blocked = notConfigured();
  if (blocked) return blocked;
  const { id } = await params;
  const p = getPresentation(id, user.id);
  if (!p) return NextResponse.json({ error: "not-found", message: "That presentation doesn’t exist." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  let meta: z.infer<typeof Meta> | null = null;
  try {
    const m = Meta.safeParse(JSON.parse(String(form?.get("meta") ?? "")));
    meta = m.success ? m.data : null;
  } catch {
    meta = null;
  }
  if (!(audio instanceof Blob) || !meta || meta.to < meta.from || meta.to > p.slides.length) {
    return NextResponse.json({ error: "bad-request", message: "Missing the recording or the slide timings." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES * 2) return NextResponse.json({ error: "too-large", message: "That recording is too long to score in one go." }, { status: 413 });

  try {
    const run = await recordRun({ presentation: p, userId: user.id, ...meta, audio, transcribe });
    if ("error" in run) return NextResponse.json({ error: "no-speech", message: "We couldn’t hear anything in that run. Check your mic and try again." }, { status: 422 });
    await flushStorage();
    return NextResponse.json({ id: run.id });
  } catch (err) {
    return scoringError(err);
  }
}
