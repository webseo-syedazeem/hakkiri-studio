import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getVoice, saveVoice } from "@/lib/apply/db";
import { measureVoice } from "@/lib/apply/checks/voice";
import type { Voice } from "@/lib/apply/schema";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const voice = await getVoice(userId);
    const body = await req.json();
    const { text, kind = "cover-letter" } = body;

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "too_short", message: "Sample must be at least 50 characters." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const newSample = {
      id: `smp_${crypto.randomBytes(6).toString("hex")}`,
      text: text.trim(),
      kind: kind as "email" | "cover-letter" | "slack" | "blog" | "other",
      addedAt: now,
    };

    const allSamples = [...(voice?.samples || []), newSample];
    const combinedText = allSamples.map((s) => s.text).join("\n\n");
    const metrics = measureVoice(combinedText, voice || undefined);

    const updated: Voice = {
      ...(voice || {
        userId,
        signature: [],
        never: ["passionate", "synergy", "spearheaded"],
        learnedFromEdits: [],
        createdAt: now,
      }),
      userId,
      samples: allSamples,
      measured: {
        sentenceMean: metrics.sentenceMean,
        sentenceSpread: metrics.sentenceSpread,
        formality: metrics.sentenceMean > 18 ? 4 : 3,
        contractions: metrics.contractionRate > 0,
        firstPerson: metrics.firstPersonRate > 0,
        spelling: (voice?.measured?.spelling || "uk") as "uk" | "us",
        opens: voice?.measured?.opens || ["Direct", "Context-first"],
        closes: voice?.measured?.closes || ["Action-oriented"],
      },
      updatedAt: now,
    };

    await saveVoice(updated);
    return NextResponse.json({ success: true, voice: updated });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/voice/samples] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to add writing sample." }, { status: 500 });
  }
}
