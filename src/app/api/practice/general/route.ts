import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORY_KEYS, INDUSTRY_KEYS, type CategoryKey, type IndustryKey } from "@/lib/practice/catalogue";
import { startGeneralPractice } from "@/lib/practice/general";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { flushStorage } from "@/lib/storage/disk";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";

export const runtime = "nodejs";
export const maxDuration = 90;

const Body = z.object({
  industry: z.enum(INDUSTRY_KEYS as [IndustryKey, ...IndustryKey[]]),
  profession: z.string().trim().max(80).default(""),
  focus: z.union([z.literal("mix"), z.enum(CATEGORY_KEYS as [CategoryKey, ...CategoryKey[]])]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.union([z.literal(5), z.literal(10), z.literal(20), z.literal(30), z.literal(45)]),
});

/**
 * POST /api/practice/general: General practice. Writes questions for the
 * chosen industry, profession, question type, difficulty and length (none the
 * person has had before) and plans a session with them.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const blocked = guard(req, "ai", { practice: true, userId: user.id });
  if (blocked) return blocked;
  setUsageContext({ userId: user.id, feature: "questions" });
  const read = await readJson(req, Body, { max: 4_000, message: "Choose an industry, a question type and your session settings." });
  if (!read.ok) return read.response;
  try {
    const { interview, session, by } = await startGeneralPractice(read.data, user.id);
    await flushStorage();
    return NextResponse.json({ href: `/mock/${interview.id}?session=${session.id}`, by });
  } catch (err) {
    console.error("[practice/general] failed:", err);
    return NextResponse.json({ error: "failed", message: "Your practice session couldn’t be prepared. Try again." }, { status: 500 });
  }
}
