import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { listCvs, saveCv, getProfile } from "@/lib/apply/db";
import type { Cv } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    let cvs = await listCvs(userId);

    if (cvs.length === 0) {
      const profile = await getProfile(userId);
      const now = new Date().toISOString();

      const defaultCv: Cv = {
        id: `cv_${crypto.randomBytes(6).toString("hex")}`,
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
        bullets: profile?.roles.flatMap((r) =>
          r.bullets.map((b) => ({
            id: b.id,
            roleId: r.id,
            text: b.text,
            evidenceIds: b.evidenceIds,
            origin: "person" as const,
            visible: true,
          }))
        ) || [
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
      cvs = [defaultCv];
    }

    return NextResponse.json(cvs);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list CVs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const body = await req.json();
    const { name = "New Tailored CV", templateId = "standard", kind = "base", parentCvId } = body;

    const now = new Date().toISOString();
    const newCv: Cv = {
      id: `cv_${crypto.randomBytes(6).toString("hex")}`,
      userId,
      name,
      kind,
      templateId,
      parentCvId,
      sections: [
        { type: "contact", order: 1, visible: true },
        { type: "summary", order: 2, visible: true, text: "Professional summary tailored to core target competencies." },
        { type: "experience", order: 3, visible: true },
        { type: "education", order: 4, visible: true },
        { type: "skills", order: 5, visible: true },
      ],
      bullets: [],
      score: {
        total: 75,
        parts: { evidence: 75, clarity: 75, structure: 80, software: 85 },
        at: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    await saveCv(newCv);
    return NextResponse.json(newCv, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs POST] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to create CV." }, { status: 500 });
  }
}
