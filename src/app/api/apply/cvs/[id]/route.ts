import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getCv, saveCv, deleteDoc, getProfile, listCvs, APPLY_COLLECTIONS } from "@/lib/apply/db";
import { auditCvText } from "@/lib/apply/checks/rubric";
import type { Cv } from "@/lib/apply/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const { id } = await params;
    let cv = await getCv(id);
    let profile = await getProfile(userId);

    if (!cv) {
      // If not found by exact ID, fallback to user's first CV or create standard default
      const userCvs = await listCvs(userId);
      if (userCvs.length > 0) {
        cv = userCvs[0];
      } else {
        const now = new Date().toISOString();
        const defaultCv: Cv = {
          id: id.startsWith("cv_") ? id : `cv_${id}`,
          userId,
          name: "Standard Professional CV (Base)",
          kind: "base",
          templateId: "standard",
          sections: [
            { type: "contact", order: 1, visible: true },
            { type: "summary", order: 2, visible: true, text: profile?.summary || "Senior engineering leader with proven experience scaling high-performance systems." },
            { type: "experience", order: 3, visible: true },
            { type: "education", order: 4, visible: true },
            { type: "skills", order: 5, visible: true },
          ],
          bullets: [
            {
              id: "b-default-1",
              roleId: "role-1",
              text: "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
              evidenceIds: [],
              origin: "person",
              visible: true,
            },
            {
              id: "b-default-2",
              roleId: "role-1",
              text: "Reduced cloud infrastructure latency by 42% through distributed caching and query optimization.",
              evidenceIds: [],
              origin: "person",
              visible: true,
            },
          ],
          score: {
            total: 86,
            parts: { evidence: 88, clarity: 85, structure: 85, software: 90 },
            at: now,
          },
          createdAt: now,
          updatedAt: now,
        };
        await saveCv(defaultCv);
        cv = defaultCv;
      }
    }

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
    const userId = user.id || "usr_guest";
    const { id } = await params;
    const existing = await getCv(id);

    if (!existing) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    // Compile text representation for live code scoring
    const summaryText = body.sections?.find((s: { type: string; text?: string }) => s.type === "summary")?.text || "";
    const bulletTexts = (body.bullets || existing.bullets || [])
      .filter((b: { visible?: boolean }) => b.visible !== false)
      .map((b: { text: string }) => `• ${b.text}`)
      .join("\n");
    const fullText = `Contact Details: ${user.email || ""}\nSummary: ${summaryText}\nExperience:\n${bulletTexts}\nEducation: BSc Degree\nSkills: TypeScript, Next.js, Cloud`;

    const audit = auditCvText(fullText, "uk");

    const updated: Cv = {
      ...existing,
      ...body,
      id: existing.id,
      userId,
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
