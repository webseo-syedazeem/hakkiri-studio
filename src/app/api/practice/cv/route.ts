import { NextResponse } from "next/server";
import { z } from "zod";
import { cvClaims } from "@/lib/cv/claims";
import { getOwnCv } from "@/lib/cv/store";
import { practisedClaims, startCvClaimPractice } from "@/lib/practice/cv-claims";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { flushStorage } from "@/lib/storage/disk";

export const runtime = "nodejs";

/** GET /api/practice/cv?cv={id}: the questions this CV will get, and which claims have been practised with their current wording. */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const id = new URL(req.url).searchParams.get("cv") ?? "";
  const cv = id ? await getOwnCv(id, user.id) : null;
  if (!cv) return NextResponse.json({ error: "not-found", message: "That CV doesn’t exist any more." }, { status: 404 });
  return NextResponse.json({ name: cv.name, rev: cv.rev, claims: cvClaims(cv), practised: await practisedClaims(cv, user.id) });
}

const Body = z.object({ cv: z.string().max(40), claims: z.array(z.string().max(60)).max(10).optional() });

/** POST /api/practice/cv: starts practice on one claim, or all of them (Practise all), and returns the session to open. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const read = await readJson(req, Body, { max: 4_000, message: "Choose a claim to practise." });
  if (!read.ok) return read.response;
  const cv = await getOwnCv(read.data.cv, user.id);
  if (!cv) return NextResponse.json({ error: "not-found", message: "That CV doesn’t exist any more." }, { status: 404 });
  try {
    const { interview, session } = await startCvClaimPractice(cv, read.data.claims ?? null, user.id);
    await flushStorage();
    return NextResponse.json({ href: `/mock/${interview.id}?session=${session.id}` });
  } catch (err) {
    if (err instanceof Error && err.message === "no-claims") return NextResponse.json({ error: "no-claims", message: read.data.claims ? "This line doesn’t make a claim to practise yet. Add what changed because of your work, with a number if you have one." : "There are no claims on this CV to practise yet." }, { status: 409 });
    console.error("[practice/cv] failed:", err);
    return NextResponse.json({ error: "failed", message: "Practice couldn’t be prepared. Your CV is unchanged. Try again." }, { status: 500 });
  }
}
