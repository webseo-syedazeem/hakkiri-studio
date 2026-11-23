import { NextResponse } from "next/server";
import { z } from "zod";
import { listCvs, saveCv } from "@/lib/apply/db";
import type { Cv } from "@/lib/apply/schema";
import { loadOwnCv, requireUserId } from "@/lib/cv/access";
import crypto from "node:crypto";

/** A person's own CVs, newest first. A new account has none: nothing is made up for them. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const cvs = await listCvs(userId);
    cvs.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return NextResponse.json(cvs);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list CVs." }, { status: 500 });
  }
}

const NewCvSchema = z.object({
  name: z.string().trim().min(1).max(120).default("My CV"),
  templateId: z.enum(["standard", "graduate"]).default("standard"),
  kind: z.enum(["base", "tailored"]).default("base"),
  parentCvId: z.string().optional(),
});

/** Creates an empty CV. Every section starts blank. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const parsed = NewCvSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input", message: "That CV could not be created." }, { status: 400 });
    }
    const { name, templateId, kind, parentCvId } = parsed.data;
    if (parentCvId && !(await loadOwnCv(parentCvId, userId))) {
      return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newCv: Cv = {
      id: `cv_${crypto.randomBytes(8).toString("hex")}`,
      userId: userId,
      name,
      kind,
      templateId,
      parentCvId,
      sections: [
        { type: "contact", order: 1, visible: true },
        { type: "summary", order: 2, visible: true, text: "" },
        { type: "experience", order: 3, visible: true },
        { type: "education", order: 4, visible: true },
        { type: "skills", order: 5, visible: true },
      ],
      bullets: [],
      score: { total: 0, parts: {}, at: now },
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
