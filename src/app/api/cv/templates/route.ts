import { NextResponse } from "next/server";
import { badInput, failure, requireUserId } from "@/lib/cv/access";
import { CV_TEMPLATES, type TemplateId } from "@/lib/cv/schema";
import { EXAMPLE_TEMPLATES, examplesFor, instantiateTemplate } from "@/lib/cv/templates/examples";
import { atCvLimit, saveCv, TOO_MANY_CVS } from "@/lib/cv/store";

/** GET /api/cv/templates?region=us: the example CVs, worded for the region (UK by default). */
export async function GET(req: Request) {
  const region = new URL(req.url).searchParams.get("region") === "us" ? "us" : "uk";
  const summaries = examplesFor(region).map((t) => ({
    id: t.id,
    title: t.title,
    role: t.role,
    level: t.level,
    region: t.region,
    regions: t.regions,
    category: t.category,
    badge: t.badge,
    description: t.description,
    summary: t.summary,
    stats: t.stats,
  }));
  return NextResponse.json({ templates: summaries });
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = (await req.json().catch(() => ({}))) as { templateId?: string; name?: string; region?: string; template?: string; letter?: boolean };
    const { templateId, name } = body;
    if (body.region !== undefined && body.region !== "uk" && body.region !== "us") return badInput("Choose UK or US.");

    if (!templateId) return badInput("Template ID is required.");
    const template = EXAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return badInput("Template not found.");

    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);

    // With its cover letter: the CV is then aimed at the letter's made-up job, which the person changes to their own.
    const doc = instantiateTemplate(template, userId, name, body.region as "uk" | "us" | undefined, { letter: body.letter === true });
    // A design chosen in the template gallery replaces the one the example is shown in.
    const design = (CV_TEMPLATES as readonly string[]).includes(body.template ?? "") ? (body.template as TemplateId) : undefined;
    if (design) doc.design = { ...doc.design, template: design };
    const saved = await saveCv(doc);

    return NextResponse.json({ id: saved.id, name: saved.name }, { status: 201 });
  } catch (err) {
    return failure("api/cv/templates POST", err, "Failed to create CV from template.");
  }
}
