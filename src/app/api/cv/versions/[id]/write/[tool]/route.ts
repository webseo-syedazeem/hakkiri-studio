import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { getOwnCv } from "@/lib/cv/store";
import { addNumber, draftBullets, draftProfiles, rewriteBullet, writingMode } from "@/lib/cv/write/assist";
import { questionFor } from "@/lib/cv/write/draft";
import { suggestSkills } from "@/lib/cv/write/skills";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string; tool: string }> };

const text = (max: number) => z.string().max(max).transform((s) => s.replace(/\r/g, "").trim());
const Bodies = {
  /** "Tell me what you did": the three answers, and the role they are about. */
  bullets: z.object({ did: text(4000), changed: text(4000), number: text(600), title: text(200).default(""), org: text(200).default("") }).strict(),
  rewrite: z.object({ text: text(600).refine((s) => s.length >= 3) }).strict(),
  number: z.object({ text: text(600).refine((s) => s.length >= 3), detail: text(300).refine((s) => s.length >= 1) }).strict(),
  profile: z.object({ entryId: z.string().max(40).optional(), skills: z.array(text(80)).max(6).default([]) }).strict(),
  question: z.object({ text: text(600).refine((s) => s.length >= 3) }).strict(),
};

/**
 * POST /api/cv/versions/[id]/write/[tool]: the writing help for one CV.
 * Every tool works from the person's own words and returns a draft for them
 * to review. Nothing is written to the CV here: accepting a draft is an
 * ordinary save from the builder.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id, tool } = await params;
    const cv = await getOwnCv(id, userId);
    if (!cv) return notFound();
    if (!(tool in Bodies)) return notFound("Tool");
    // Each of these may call the AI service, so each counts against the person's own limits.
    const limited = guard(req, "ai", { userId });
    if (limited) return limited;
    setUsageContext({ userId, feature: "cv writing" });
    const raw = await req.json().catch(() => null);

    if (tool === "bullets") {
      const body = Bodies.bullets.safeParse(raw);
      if (!body.success) return badInput("Those notes could not be read.");
      const { title, org, ...capture } = body.data;
      if (!capture.did && !capture.changed) return badInput("Answer at least one of the first two questions.", { did: "Say what you were responsible for, or what changed." });
      return NextResponse.json(await draftBullets(capture, { title, org }, cv.region));
    }
    if (tool === "rewrite") {
      const body = Bodies.rewrite.safeParse(raw);
      if (!body.success) return badInput("That bullet could not be read.");
      return NextResponse.json(await rewriteBullet(body.data.text, cv.region));
    }
    if (tool === "number") {
      const body = Bodies.number.safeParse(raw);
      if (!body.success) return badInput("Type the detail you want to add.", { detail: "Type the detail you want to add." });
      return NextResponse.json(await addNumber(body.data.text, body.data.detail, cv.region));
    }
    if (tool === "profile") {
      const body = Bodies.profile.safeParse(raw);
      if (!body.success) return badInput("Those choices could not be read.");
      return NextResponse.json(await draftProfiles(cv, body.data, new Date()));
    }
    const body = Bodies.question.safeParse(raw);
    if (!body.success) return badInput("That line could not be read.");
    return NextResponse.json({ question: questionFor(body.data.text) });
  } catch (err) {
    return failure("api/cv/versions/[id]/write POST", err, "The writing help could not run.");
  }
}

/** GET /api/cv/versions/[id]/write/skills: skills worth adding, each with the line that shows it. Found by rule; no AI call. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id, tool } = await params;
    const cv = await getOwnCv(id, userId);
    if (!cv) return notFound();
    if (tool === "skills") return NextResponse.json({ suggestions: suggestSkills(cv) });
    if (tool === "status") return NextResponse.json({ mode: writingMode() });
    return notFound("Tool");
  } catch (err) {
    return failure("api/cv/versions/[id]/write GET", err, "The suggestions could not be worked out.");
  }
}
