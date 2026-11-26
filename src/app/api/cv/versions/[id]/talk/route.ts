import { NextResponse } from "next/server";
import { z } from "zod";
import { runTurn } from "@/lib/cv/agent/turn";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { privateLines } from "@/lib/cv/privacy";
import { getOwnCv, listOwnAchievements } from "@/lib/cv/store";
import { writingMode } from "@/lib/cv/write/assist";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

const text = (max: number) => z.string().max(max).transform((s) => s.replace(/\r/g, "").trim());
const Body = z
  .object({
    /** What the person just said or typed. A pasted job advert can be long. */
    message: text(24000).refine((s) => s.length >= 1, "Say or type something first."),
    /** The message came from the microphone (it is kept as "spoken" on the lines made from it). */
    spoken: z.boolean().default(false),
    /** Everything else they said in this conversation, oldest first. */
    words: z.array(text(24000)).max(80).default([]),
    /** The conversation so far, for context. */
    history: z.array(z.object({ who: z.enum(["you", "assistant"]), text: text(4000) })).max(40).default([]),
    about: z.string().max(40).optional(),
    step: z.string().max(80).optional(),
    skipped: z.array(z.string().max(80)).max(80).default([]),
  })
  .strict();

/**
 * POST /api/cv/versions/[id]/talk: one turn of the CV conversation. Returns
 * a reply, the next question, and the edits that passed the check against
 * the person's own words. Nothing is saved here: the builder applies the
 * edits and saves them as an ordinary change, which Undo takes back.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const cv = await getOwnCv(id, userId);
    if (!cv) return notFound();
    const limited = guard(req, "ai", { userId });
    if (limited) return limited;
    setUsageContext({ userId, feature: "cv assistant" });
    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success) return badInput(body.error.issues[0]?.message === "Say or type something first." ? "Say or type something first." : "That message could not be read.");
    const size = body.data.words.reduce((n, w) => n + w.length, 0);
    if (size > 200_000) return badInput("This conversation is too long to carry on. Start a new one: your CV keeps everything added so far.");
    // Lines taken from achievements marked private are not shown to the AI service.
    const hidden = new Set(privateLines(cv, await listOwnAchievements(userId)).map((l) => l.at.field ?? ""));
    const result = await runTurn({ cv, hidden, ...body.data, now: new Date() });
    return NextResponse.json(result);
  } catch (err) {
    return failure("api/cv/versions/[id]/talk POST", err, "The assistant couldn’t answer just now. Nothing on your CV has changed.");
  }
}

/** GET /api/cv/versions/[id]/talk: whether the assistant writes with AI here, or by rule from the person's own sentences. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    if (!(await getOwnCv(id, userId))) return notFound();
    return NextResponse.json({ mode: writingMode() });
  } catch (err) {
    return failure("api/cv/versions/[id]/talk GET", err, "The assistant couldn’t be reached.");
  }
}
