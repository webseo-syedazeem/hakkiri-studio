import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getVoice, saveVoice } from "@/lib/apply/db";
import type { Voice } from "@/lib/apply/schema";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;
    let voice = await getVoice(userId);

    if (!voice) {
      const now = new Date().toISOString();
      const defaultVoice: Voice = {
        userId,
        samples: [],
        measured: {
          sentenceMean: 14.2,
          sentenceSpread: 4.8,
          formality: 3,
          contractions: true,
          firstPerson: true,
          spelling: "uk",
          opens: ["Direct", "Context-first"],
          closes: ["Action-oriented", "Impact-led"],
        },
        signature: [
          "driven by customer impact",
          "high-velocity delivery",
          "rigorous architectural trade-offs",
        ],
        never: [
          "passionate",
          "synergy",
          "spearheaded",
          "utilize",
          "rockstar",
          "delve",
        ],
        learnedFromEdits: [],
        createdAt: now,
        updatedAt: now,
      };
      await saveVoice(defaultVoice);
      voice = defaultVoice;
    }

    return NextResponse.json(voice);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/voice GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load voice profile." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const existing = await getVoice(userId);
    const body = await req.json();

    const now = new Date().toISOString();
    const updated: Voice = {
      ...(existing || {
        userId,
        samples: [],
        measured: {
          sentenceMean: 14,
          sentenceSpread: 4,
          formality: 3,
          contractions: true,
          firstPerson: true,
          spelling: "uk",
          opens: [],
          closes: [],
        },
        signature: [],
        never: [],
        learnedFromEdits: [],
        createdAt: now,
        updatedAt: now,
      }),
      ...body,
      userId,
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
