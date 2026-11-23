import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { listEvidence, removeSeededEvidence, saveEvidence } from "@/lib/apply/db";
import type { Evidence } from "@/lib/apply/schema";
import crypto from "node:crypto";

function extractNumbersAndSkills(text: string): { numbers: string[]; skillTags: string[] } {
  const numbers = text.match(/([£$€]?\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|m|%|bn)?)/gi) || [];
  const cleanNumbers = numbers.map((n) => n.trim()).filter(Boolean);

  const COMMON_SKILLS = [
    "TypeScript", "React", "Next.js", "Python", "AWS", "SQL", "MongoDB", "Kubernetes",
    "Docker", "Agile", "Scrum", "Product Management", "Leadership", "System Architecture",
    "CI/CD", "Node.js", "GraphQL", "Figma", "Stripe", "DevOps"
  ];
  const skillTags = COMMON_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(text)
  );

  return { numbers: cleanNumbers, skillTags };
}

/** The person's own evidence. A new account's bank is empty: nothing is written into it for them. */
export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id as string;
    // Clear out the three invented entries an earlier build put into every account.
    await removeSeededEvidence(userId);
    return NextResponse.json(await listEvidence(userId));
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/evidence GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to list evidence." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const body = await req.json();
    const { text, sourceKind = "typed-note", sourceRef, transcript } = body;

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json({ error: "invalid_text", message: "Evidence text is too short." }, { status: 400 });
    }

    const { numbers, skillTags } = extractNumbersAndSkills(text);
    const now = new Date().toISOString();
    const newEvidence: Evidence = {
      id: `ev_${crypto.randomBytes(6).toString("hex")}`,
      userId,
      text: text.trim(),
      numbers,
      skillTags,
      sourceKind,
      sourceRef,
      confirmed: true,
      transcript,
      createdAt: now,
      updatedAt: now,
    };

    await saveEvidence(newEvidence);
    return NextResponse.json(newEvidence, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/evidence POST] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to create evidence." }, { status: 500 });
  }
}
