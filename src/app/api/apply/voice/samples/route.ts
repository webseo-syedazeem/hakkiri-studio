import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getVoice, saveVoice } from "@/lib/apply/db";
import { emptyVoice, withoutSeededVoice } from "@/lib/apply/own-data";
import { measureVoice } from "@/lib/apply/checks/voice";
import type { Voice } from "@/lib/apply/schema";
import crypto from "node:crypto";

const Body = z.object({ text: z.string().trim().max(20_000), kind: z.enum(["email", "cover-letter", "slack", "blog", "other"]).optional() });

/** Adds a sample of the person's own writing, and measures their voice from all their samples together. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const read = await readJson(req, Body, { max: 100_000, message: "That sample couldn’t be read. Paste plain text, up to 20,000 characters." });
    if (!read.ok) return read.response;
    const { text, kind = "cover-letter" } = read.data;
    if (text.length < 50) {
      return NextResponse.json({ error: "too_short", message: "Sample must be at least 50 characters." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const stored = await getVoice(user.id);
    const voice = stored ? withoutSeededVoice(stored).voice : emptyVoice(user.id, now);
    const samples = [...voice.samples, { id: `smp_${crypto.randomBytes(6).toString("hex")}`, text, kind, addedAt: now }];
    // Measured from the person's own samples, and from nothing else.
    const metrics = measureVoice(samples.map((s) => s.text).join("\n\n"), voice);

    const updated: Voice = {
      ...voice,
      userId: user.id,
      samples,
      measured: {
        ...voice.measured,
        sentenceMean: metrics.sentenceMean,
        sentenceSpread: metrics.sentenceSpread,
        formality: metrics.sentenceMean > 18 ? 4 : 3,
        contractions: metrics.contractionRate > 0,
        firstPerson: metrics.firstPersonRate > 0,
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
