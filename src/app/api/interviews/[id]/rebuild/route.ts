import { NextResponse } from "next/server";
import { z } from "zod";
import { UnderstandingSchema } from "@/lib/ai/interview/build-plan";
import { PlanError, rebuildAndPlan } from "@/lib/sessions/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 240;

const Doc = z.object({ text: z.string().trim().min(1).max(25_000), label: z.string().max(200) });

const Body = z.object({
  understanding: UnderstandingSchema,
  rules: z.array(z.string().max(200)).max(8),
  /** Replaced documents, when the first rebuild was still wrong. */
  cv: Doc.optional(),
  job: Doc.optional(),
  /** Use the standard questions for the job title while the documents get sorted. */
  templates: z.boolean().optional(),
  /** Start a new interview straight away (after "Something's wrong"), or just rebuild (after editing what Hakkiri understood). */
  start: z.boolean(),
});

/**
 * POST /api/interviews/{id}/rebuild: saves the corrected understanding and
 * rules, sets aside every question you haven't heard, writes a fresh set
 * (each checked against the job and your rules), and plans a new interview
 * with your full time.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blocked = guard(req, "ai", { practice: true });
  if (blocked) return blocked;
  setUsageContext({ interviewId: id, feature: "questions" });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Check what Hakkiri understood: every field needs a few words." }, { status: 400 });
  const b = parsed.data;
  try {
    const { session } = await rebuildAndPlan(
      id,
      {
        understanding: b.understanding,
        rules: b.rules,
        templates: b.templates,
        documents: { ...(b.cv ? { cv: b.cv.text } : {}), ...(b.job ? { job: b.job.text } : {}) },
        sources: { ...(b.cv ? { cv: b.cv.label } : {}), ...(b.job ? { job: b.job.label } : {}) },
      },
      { start: b.start },
    );
    return NextResponse.json({ href: session ? `/mock/${id}?session=${session.id}` : `/interviews/${id}?rebuilt=1` });
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: "cant-rebuild", message: err.message }, { status: 409 });
    console.error("[rebuild] failed:", err);
    return NextResponse.json({ error: "failed", message: "Your questions couldn’t be rebuilt. Try again." }, { status: 500 });
  }
}
