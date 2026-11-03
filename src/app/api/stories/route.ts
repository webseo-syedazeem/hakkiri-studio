import { NextResponse } from "next/server";
import { z } from "zod";
import { completeStory } from "@/lib/stories/bank";
import { londonToday } from "@/lib/dates";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const Part = z.string().trim().max(800);
const Body = z.object({
  key: z.string().min(1).max(200),
  parts: z.object({ situation: Part, task: Part, action: Part, result: Part }),
});

/** POST /api/stories: "Fill in the gaps" on a story in the story bank. Redrafts it from your words and saves it everywhere it's used. */
export async function POST(req: Request) {
  const blocked = guard(req, "ai");
  if (blocked) return blocked;
  setUsageContext({ feature: "stories" });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Fill in at least one part." }, { status: 400 });
  const { key, parts } = parsed.data;
  if (!Object.values(parts).some((p) => p.length >= 5)) return NextResponse.json({ error: "bad-request", message: "Add a sentence to at least one part." }, { status: 400 });
  try {
    const story = await completeStory(key, parts, londonToday());
    if (!story) return NextResponse.json({ error: "not-found", message: "That story isn’t in your bank any more." }, { status: 404 });
    return NextResponse.json({ story });
  } catch (err) {
    console.error("[stories] couldn't complete a story:", err);
    return NextResponse.json({ error: "failed", message: "Your story couldn’t be saved. Try again." }, { status: 500 });
  }
}
