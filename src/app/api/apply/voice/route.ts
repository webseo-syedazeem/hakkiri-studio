import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getVoice, saveVoice } from "@/lib/apply/db";
import { emptyVoice, UNMEASURED, withoutSeededVoice } from "@/lib/apply/own-data";
import type { Voice } from "@/lib/apply/schema";

/**
 * The person's writing voice. Until they add a sample of their own writing
 * nothing has been measured, and the figures say so. No signature phrase or
 * banned word is chosen for them. The values an earlier build saved into every
 * account are removed when read.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const stored = await getVoice(user.id);
    if (!stored) return NextResponse.json(emptyVoice(user.id, new Date().toISOString()));
    const { voice, changed } = withoutSeededVoice(stored);
    if (changed) await saveVoice({ ...voice, updatedAt: new Date().toISOString() });
    return NextResponse.json(voice);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/voice GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load voice profile." }, { status: 500 });
  }
}

const phrase = (max: number) => z.string().trim().min(1).max(max);
/** What a person can change: their own phrases, the words they never use, their spelling, and which samples to keep. */
const Patch = z
  .object({
    signature: z.array(phrase(120)).max(15),
    never: z.array(phrase(60)).max(80),
    measured: z.object({ spelling: z.enum(["uk", "us"]) }),
    samples: z.array(z.object({ id: z.string().max(80) })).max(50),
  })
  .partial();

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const read = await readJson(req, Patch, { max: 400_000, message: "Your voice settings couldn’t be saved. Check what you entered and try again." });
    if (!read.ok) return read.response;
    const body = read.data;

    const now = new Date().toISOString();
    const stored = await getVoice(user.id);
    const base = stored ? withoutSeededVoice(stored).voice : emptyVoice(user.id, now);
    // Samples are added through their own route, where they are measured. Here they can only be removed.
    const samples = body.samples ? base.samples.filter((s) => body.samples!.some((x) => x.id === s.id)) : base.samples;
    const measured = samples.length === 0 ? { ...UNMEASURED, spelling: body.measured?.spelling ?? base.measured.spelling } : { ...base.measured, ...(body.measured ?? {}) };
    const updated: Voice = {
      ...base,
      samples,
      measured,
      signature: body.signature ? [...new Set(body.signature)] : base.signature,
      never: body.never ? [...new Set(body.never.map((w) => w.toLowerCase()))] : base.never,
      userId: user.id,
      updatedAt: now,
    };

    await saveVoice(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/voice PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update voice profile." }, { status: 500 });
  }
}
