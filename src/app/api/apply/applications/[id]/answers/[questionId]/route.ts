import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getApplication, getVoice, saveOutput } from "@/lib/apply/db";
import { shapeAnswer } from "@/lib/apply/own-data";
import { measureVoice } from "@/lib/apply/checks/voice";
import { findBannedPhrases } from "@/lib/apply/checks/banned";
import type { Output } from "@/lib/apply/schema";
import crypto from "node:crypto";

const Body = z.object({
  question: z.string().max(2000).optional(),
  notes: z.string().max(20_000),
  limit: z.number().int().min(10).max(5000).optional(),
  unit: z.enum(["words", "chars"]).optional(),
});

/**
 * An answer to an application question, made from the person's own notes
 * and nothing else: the spacing is tidied and it is cut to the limit. No
 * sentence is written for them. (Rewriting notes into a finished answer
 * needs live AI, which this route does not use.)
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const user = await requireUser();
    const { id, questionId } = await params;
    const application = await getApplication(id, user.id);

    if (!application) {
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    const read = await readJson(req, Body, { max: 100_000, message: "Those notes couldn’t be read. Send plain text, up to 20,000 characters." });
    if (!read.ok) return read.response;
    const { limit = 150, unit = "words" } = read.data;
    const notes = read.data.notes.trim();

    if (notes.length < 10) {
      return NextResponse.json({ error: "too_short", message: "Please provide rough notes or speech to shape the answer." }, { status: 400 });
    }

    const shaped = shapeAnswer(notes, limit, unit);
    const voice = await getVoice(user.id);
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
          text: shaped.text,
          notes,
          // Every sentence is the person's own, so none needs evidence found for it and none is a link added by the app.
          sentences: shaped.sentences.map((text) => ({ text, evidenceIds: [], isConnective: false })),
          unsupported: [],
          voiceScore: measureVoice(shaped.text, voice ?? undefined).score,
          banned: findBannedPhrases(shaped.text, voice?.never ?? []),
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await saveOutput(outputDoc);

    return NextResponse.json({
      success: true,
      draft: shaped.text,
      whatWeKept: shaped.text,
      whatWeAdded: "Nothing. This is your own notes, tidied and cut to the limit.",
      cut: shaped.cut,
      wordCount: shaped.text.split(/\s+/).filter(Boolean).length,
      charCount: shaped.text.length,
      outputId,
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/applications/[id]/answers] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to generate answer." }, { status: 500 });
  }
}
