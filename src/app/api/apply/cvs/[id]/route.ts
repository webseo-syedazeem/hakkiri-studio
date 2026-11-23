import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getCv, saveCv, deleteDoc, getProfile, APPLY_COLLECTIONS } from "@/lib/apply/db";
import { auditCvText } from "@/lib/apply/checks/rubric";
import type { Cv } from "@/lib/apply/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const cv = await getCv(id);

    if (!cv || cv.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    const profile = await getProfile(user.id);
    return NextResponse.json({ cv, profile });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load CV." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getCv(id);

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    // Compile text representation for live code scoring
    const summaryText = body.sections?.find((s: { type: string; text?: string }) => s.type === "summary")?.text || "";
    const bulletTexts = (body.bullets || existing.bullets)
      .filter((b: { visible?: boolean }) => b.visible !== false)
      .map((b: { text: string }) => `• ${b.text}`)
      .join("\n");
    const fullText = `Contact Details: ${user.email}\nSummary: ${summaryText}\nExperience:\n${bulletTexts}\nEducation: BSc Degree\nSkills: TypeScript, Next.js, Cloud`;

    const audit = auditCvText(fullText, "uk");

    const updated: Cv = {
      ...existing,
      ...body,
      id: existing.id,
      userId: user.id,
      score: {
        total: audit.score,
        parts: audit.subscores,
        at: now,
      },
      updatedAt: now,
    };

    await saveCv(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update CV." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getCv(id);

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    await deleteDoc(APPLY_COLLECTIONS.CVS, id);
    return NextResponse.json({ success: true, message: "CV deleted." });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id] DELETE] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to delete CV." }, { status: 500 });
  }
}
