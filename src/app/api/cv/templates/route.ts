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
  } catch (err: unknown) {
    if (err instanceof z.ZodError || (Boolean(err) && typeof err === "object" && "issues" in (err as Record<string, unknown>))) {
      const issues = ((err as Record<string, unknown>).issues || []) as z.ZodIssue[];
      console.error("[api/cv/templates POST] Schema validation error:", issues);
      return badInput(`Template validation failed: ${issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`);
    }
    if (err instanceof Response) return err;
    if (err && typeof err === "object" && "status" in err && (err as { status: unknown }).status === 401) {
      return NextResponse.json({ error: "unauthorised", message: "You must be signed in to perform this action." }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/cv/templates POST] Internal error:", message, err);
    return failure("api/cv/templates POST", err, message || "Failed to create CV from template.");
  }
}
