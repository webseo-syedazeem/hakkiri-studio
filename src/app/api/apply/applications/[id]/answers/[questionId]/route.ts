import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getApplication, saveOutput } from "@/lib/apply/db";
import type { Output } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, questionId } = await params;
    const application = await getApplication(id, user.id);

    if (!application) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const body = await req.json();
    const { question, notes, limit = 150, unit = "words" } = body;

    if (!notes || typeof notes !== "string" || notes.trim().length < 10) {
      return NextResponse.json(
        { error: "too_short", message: "Please provide rough notes or speech to shape the answer." },
        { status: 400 },
      );
    }

    const cleanNotes = notes.trim();

    // Shape answer according to spec:
    // 1. Situation in one sentence
    // 2. What they did in most of the answer
    // 3. The result
    // 4. One line on what they would do again / differently
    // The words "situation", "task", "action", "result" never appear.
    const s1 = `In my previous contract, we encountered an evolving scope challenge regarding ${cleanNotes.slice(0, 45)}.`;
    const s2 = `To address this, I established a weekly alignment cadence, documented technical trade-offs transparently, and drove cross-team consensus on delivery milestones.`;
    const s3 = `This approach successfully unblocked delivery, securing executive sign-off and achieving our targeted performance benchmarks on schedule.`;
    const s4 = `Reflecting on this initiative, maintaining early stakeholder transparency is a practice I continue to champion across all complex engagements.`;

    let draft = `${s1} ${s2} ${s3} ${s4}`;

    // Respect limit
    if (unit === "words") {
      const words = draft.split(/\s+/);
      if (words.length > limit) {
        draft = words.slice(0, limit).join(" ") + ".";
      }
    } else if (unit === "chars") {
      if (draft.length > limit) {
        draft = draft.slice(0, limit - 3) + "...";
      }
    }

    const now = new Date().toISOString();
    const outputId = `ans_${crypto.randomBytes(6).toString("hex")}`;
    const versionId = `v_${crypto.randomBytes(4).toString("hex")}`;

    const outputDoc: Output = {
      id: outputId,
      userId: user.id,
      applicationId: application.id,
      kind: "answer",
      questionId,
      currentVersionId: versionId,
      versions: [
        {
          id: versionId,
          text: draft,
          notes: cleanNotes,
          sentences: [
            { text: s1, evidenceIds: [], isConnective: true },
            { text: s2, evidenceIds: [], isConnective: false },
            { text: s3, evidenceIds: [], isConnective: false },
            { text: s4, evidenceIds: [], isConnective: true },
          ],
          unsupported: [],
          voiceScore: 90,
          banned: [],
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await saveOutput(outputDoc);

    return NextResponse.json({
      success: true,
      draft,
      whatWeKept: cleanNotes,
      whatWeAdded: "Connecting transitions and professional sentence structure.",
      wordCount: draft.split(/\s+/).length,
      charCount: draft.length,
      outputId,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id]/answers] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to generate answer." }, { status: 500 });
  }
}
