import { NextResponse } from "next/server";
import { z } from "zod";
import { saveCv, deleteDoc, APPLY_COLLECTIONS } from "@/lib/apply/db";
import { auditCvText } from "@/lib/apply/checks/rubric";
import { CvBulletSchema, CvSectionSchema, type Cv } from "@/lib/apply/schema";
import { loadOwnCv, cvNotFound, requireUserId } from "@/lib/cv/access";

/** Only these fields can be changed from the browser. Owner, id, kind and dates stay as stored. */
const CvPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    templateId: z.enum(["standard", "graduate"]),
    sections: z.array(CvSectionSchema).max(30),
    bullets: z.array(CvBulletSchema).max(300),
  })
  .partial()
  .strict();

/** The CV as plain text, built only from what is in it. Nothing is added. */
function cvAsText(cv: Cv): string {
  const lines: string[] = [];
  const summary = cv.sections.find((s) => s.type === "summary" && s.visible !== false)?.text?.trim();
  if (summary) lines.push("Summary", summary);
  const bullets = cv.bullets.filter((b) => b.visible !== false && b.text.trim());
  if (bullets.length) lines.push("Experience", ...bullets.map((b) => `• ${b.text.trim()}`));
  return lines.join("\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const cv = await loadOwnCv(id, userId);
    if (!cv) return cvNotFound();
    return NextResponse.json({ cv });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load CV." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const existing = await loadOwnCv(id, userId);
    if (!existing) return cvNotFound();

    const parsed = CvPatchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", message: "That change could not be saved.", issues: parsed.error.issues.slice(0, 5) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const merged: Cv = { ...existing, ...parsed.data, id: existing.id, userId: existing.userId, updatedAt: now };
    const text = cvAsText(merged);
    const audit = text ? auditCvText(text, "uk") : null;
    const updated: Cv = {
      ...merged,
      score: audit ? { total: audit.score, parts: audit.subscores, at: now } : { total: 0, parts: {}, at: now },
    };

    await saveCv(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update CV." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const existing = await loadOwnCv(id, userId);
    if (!existing) return cvNotFound();

    await deleteDoc(APPLY_COLLECTIONS.CVS, id);
    return NextResponse.json({ success: true, message: "CV deleted." });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] DELETE] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to delete CV." }, { status: 500 });
  }
}
