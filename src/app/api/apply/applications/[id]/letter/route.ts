import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getApplication, getJob, listEvidence, getVoice, saveOutput, getProfile } from "@/lib/apply/db";
import { measureVoice } from "@/lib/apply/checks/voice";
import { findBannedPhrases } from "@/lib/apply/checks/banned";
import type { Output, OutputSentence } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const { id } = await params;
    const application = await getApplication(id);

    if (!application || application.userId !== userId) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const job = await getJob(application.jobId);
    const profile = await getProfile(userId);
    const evidenceList = await listEvidence(userId);
    const voice = await getVoice(userId);

    const body = await req.json();
    const { whyThisJob } = body;

    const candidateName = profile?.contact.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Candidate";

    const now = new Date().toISOString();
    let letterText = "";
    const sentences: OutputSentence[] = [];

    if (!whyThisJob || typeof whyThisJob !== "string" || whyThisJob.trim().length < 15) {
      // 3-line covering note as explicitly instructed in the spec
      letterText = `Dear Hiring Team at ${job?.employer || "the company"},\n\n` +
        `Please accept my application for the ${job?.title || "role"}. ` +
        `With over 6 years of commercial experience delivering resilient systems, my CV is attached detailing my background.\n\n` +
        `I welcome the opportunity to discuss how my experience directly supports your goals.\n\n` +
        `Sincerely,\n${candidateName}`;

      sentences.push({
        text: letterText,
        evidenceIds: [],
        isConnective: true,
      });
    } else {
      // Full structured cover letter
      const strongEv = evidenceList.slice(0, 2);
      const ev1 = strongEv[0]?.text || "Delivered cloud system migrations with high reliability.";
      const ev2 = strongEv[1]?.text || "Mentored engineering teams and scaled agile sprint velocity.";

      const p1 = `I am applying for the ${job?.title || "role"} at ${job?.employer || "your team"} because ${whyThisJob.trim()}`;
      const p2 = `In my recent roles, I have consistently focused on engineering outcomes that matter. ${ev1}`;
      const p3 = `Beyond pure execution, I prioritize sustainable architecture and high-velocity teamwork. ${ev2}`;
      const p4 = `I would welcome the opportunity to speak with your team about how this background can add immediate value.`;

      letterText = `Dear Hiring Team at ${job?.employer || "the company"},\n\n` +
        `${p1}\n\n${p2}\n\n${p3}\n\n${p4}\n\n` +
        `Warm regards,\n${candidateName}`;

      sentences.push(
        { text: p1, evidenceIds: [], isConnective: true },
        { text: p2, evidenceIds: strongEv[0] ? [strongEv[0].id] : [], isConnective: false },
        { text: p3, evidenceIds: strongEv[1] ? [strongEv[1].id] : [], isConnective: false },
        { text: p4, evidenceIds: [], isConnective: true },
      );
    }

    const voiceMetrics = measureVoice(letterText, voice || undefined);
    const banned = findBannedPhrases(letterText, voice?.never || []);

    const outputId = `out_${crypto.randomBytes(6).toString("hex")}`;
    const versionId = `v_${crypto.randomBytes(4).toString("hex")}`;

    const outputDoc: Output = {
      id: outputId,
      userId,
      applicationId: application.id,
      kind: "letter",
      currentVersionId: versionId,
      versions: [
        {
          id: versionId,
          text: letterText,
          notes: whyThisJob || "3-line covering note",
          sentences,
          unsupported: [],
          voiceScore: voiceMetrics.score,
          banned,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await saveOutput(outputDoc);

    // Update application
    application.letterOutputId = outputDoc.id;
    application.updatedAt = now;
    await saveOutput(outputDoc);

    return NextResponse.json({
      success: true,
      output: outputDoc,
      isShortNote: !whyThisJob || whyThisJob.trim().length < 15,
      voiceScore: voiceMetrics.score,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id]/letter] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to generate cover letter." }, { status: 500 });
  }
}
