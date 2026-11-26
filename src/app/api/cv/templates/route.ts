import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, requireUserId } from "@/lib/cv/access";
import { EXAMPLE_TEMPLATES, instantiateTemplate } from "@/lib/cv/templates/examples";
import { atCvLimit, saveCv, TOO_MANY_CVS } from "@/lib/cv/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const summaries = EXAMPLE_TEMPLATES.map((t) => ({
    id: t.id,
    title: t.title,
    role: t.role,
    level: t.level,
    region: t.region,
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
    const body = (await req.json().catch(() => ({}))) as { templateId?: string; name?: string };
    const { templateId, name } = body;

    if (!templateId) return badInput("Template ID is required.");
    const template = EXAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return badInput("Template not found.");

    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);

    const doc = instantiateTemplate(template, userId, name);
    const saved = await saveCv(doc);

    return NextResponse.json({ id: saved.id, name: saved.name }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[api/cv/templates POST] Schema validation error:", err.format());
      return badInput(`Template validation failed: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`);
    }
    return failure("api/cv/templates POST", err, "Failed to create CV from template.");
  }
}
