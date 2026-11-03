import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterview } from "@/lib/interviews/store";
import { buildStory } from "@/lib/interviews/stories";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const Part = z.string().trim().max(800);
const Body = z.object({
  skill: z.string().trim().min(2).max(60),
  question: z.string().trim().min(8).max(200),
  parts: z.object({ situation: Part, task: Part, action: Part.min(10, "Say what you did, in a sentence or two."), result: Part }),
});

/** POST /api/interviews/{id}/stories: the story builder. Drafts your story in your words and saves it. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blocked = guard(req, "ai");
  if (blocked) return blocked;
  setUsageContext({ interviewId: id, feature: "stories" });
  const interview = getInterview(id);
  if (!interview) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist any more." }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: parsed.error.issues[0]?.message ?? "Fill in what you did, at least." }, { status: 400 });
  try {
    const { story, questionId } = await buildStory(id, { ...parsed.data, role: interview.role });
    return NextResponse.json({ story, practiseHref: `/mock/${id}?q=${questionId}&story=${story.id}` });
  } catch (err) {
    console.error("[stories] failed:", err);
    return NextResponse.json({ error: "failed", message: "Your story couldn’t be drafted. Try again." }, { status: 500 });
  }
}
