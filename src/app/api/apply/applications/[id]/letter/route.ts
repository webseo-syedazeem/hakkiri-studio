import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { z } from "zod";
import { readJson } from "@/lib/http/body";
import { getApplication, getJob, listEvidence, getVoice, saveApplication, saveOutput, getProfile } from "@/lib/apply/db";
import { measureVoice } from "@/lib/apply/checks/voice";
import { findBannedPhrases } from "@/lib/apply/checks/banned";
import type { Output, OutputSentence } from "@/lib/apply/schema";
import crypto from "node:crypto";

const Body = z.object({ whyThisJob: z.string().max(5000).optional() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const { id } = await params;
    const application = await getApplication(id, userId);

    if (!application) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const job = await getJob(application.jobId, userId);
    const profile = await getProfile(userId);
    const evidenceList = await listEvidence(userId);
    const voice = await getVoice(userId);

    const read = await readJson(req, Body, { max: 40_000, message: "That couldn’t be read. Say why you want this job in plain text." });
    if (!read.ok) return read.response;
    const { whyThisJob } = read.data;

    const candidateName = profile?.contact.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Candidate";

    const now = new Date().toISOString();
    let letterText = "";
    const sentences: OutputSentence[] = [];

    if (!whyThisJob || typeof whyThisJob !== "string" || whyThisJob.trim().length < 15) {
      // A short covering note. It says nothing about the person that they have not said themselves.
      letterText = `Dear Hiring Team at ${job?.employer || "the company"},\n\n` +
        `Please accept my application for the ${job?.title || "role"}. My CV is attached.\n\n` +
        `I would welcome the opportunity to discuss it.\n\n` +
        `Sincerely,\n${candidateName}`;

      sentences.push({
        text: letterText,
        evidenceIds: [],
        isConnective: true,
      });
    } else {
      // The person's reason, then their own saved evidence, word for word. Nothing is filled in when there is none.
      const strongEv = evidenceList.slice(0, 2).filter((e) => e.text?.trim());
      const p1 = `I am applying for the ${job?.title || "role"} at ${job?.employer || "your team"} because ${whyThisJob.trim()}`;
      const p4 = `I would welcome the opportunity to speak with your team.`;

      letterText = `Dear Hiring Team at ${job?.employer || "the company"},\n\n` +
        [p1, ...strongEv.map((e) => e.text.trim()), p4].join("\n\n") +
        `\n\nWarm regards,\n${candidateName}`;

      sentences.push(
        { text: p1, evidenceIds: [], isConnective: true },
        ...strongEv.map((e) => ({ text: e.text.trim(), evidenceIds: [e.id], isConnective: false })),
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
    await saveApplication(application);

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
