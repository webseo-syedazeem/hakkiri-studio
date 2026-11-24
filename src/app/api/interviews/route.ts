import { NextResponse } from "next/server";
import { z } from "zod";
import { buildInterview } from "@/lib/interviews/build";
import { SettingsBody } from "@/lib/interviews/settings-schema";
import { DEFAULT_SETTINGS, mixIsValid, presetFor } from "@/lib/interviews/settings";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { flushStorage } from "@/lib/storage/disk";
import { requireUser } from "@/lib/auth/require";
import { readJsonValue } from "@/lib/http/body";

export const runtime = "nodejs";
export const maxDuration = 180;

const Doc = z.object({ text: z.string().trim().min(1).max(25_000), label: z.string().max(200) });

const StageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  date: z.string().optional(),
  time: z.string().optional(),
  format: z.string().optional(),
  interviewer: z.string().optional(),
  status: z.string().optional(),
});

const Body = z.object({
  company: z.object({ name: z.string().trim().min(1).max(80), url: z.string().max(500).optional(), siteText: z.string().max(20_000).optional() }),
  job: z.object({ title: z.string().trim().max(120), text: z.string().max(25_000).optional(), url: z.string().max(500).optional(), label: z.string().max(200).optional() }),
  cv: Doc,
  coverLetter: Doc.optional(),
  date: z.iso.datetime().optional(),
  format: z.enum(["in-person", "video", "phone"]),
  settings: SettingsBody.optional(),
  stages: z.array(StageSchema).optional(),
});

/**
 * POST /api/interviews: builds an interview from the company, the job spec,
 * your CV and cover letter, with your difficulty, length and question mix
 * (set-up), and returns its id.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = guard(req, "build", { userId: user.id });
  if (blocked) return blocked;
  setUsageContext({ userId: user.id, feature: "set-up" });
  
  // A CV, a job spec, a cover letter and the company's site text, each up to 25,000 characters. The limit is in
  // bytes and a character can be up to four, so it leaves room for all four in any language.
  const sent = await readJsonValue(req, 450_000);
  if (!sent.ok) return sent.response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawBody = (sent.json && typeof sent.json === "object" && !Array.isArray(sent.json) ? sent.json : null) as Record<string, any> | null;
  if (rawBody?.settings && (typeof rawBody.settings !== "object" || Array.isArray(rawBody.settings))) rawBody.settings = undefined;
  if (rawBody?.settings && !rawBody.settings.mix) {
    rawBody.settings.mix = DEFAULT_SETTINGS.mix;
  }
  if (rawBody?.settings && !rawBody.settings.preset) {
    rawBody.settings.preset = "balanced";
  }

  const parsed = Body.safeParse(rawBody);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const message = field === "cv" ? "Add your CV first." : field === "company" ? "Add the company’s name." : "Some of the set-up is missing. Check each field and try again.";
    return NextResponse.json({ error: "bad-request", message }, { status: 400 });
  }
  if (!parsed.data.job.title && !parsed.data.job.text && !parsed.data.job.url) {
    return NextResponse.json({ error: "bad-request", message: "Add the job title, or the job spec." }, { status: 400 });
  }
  const settings = parsed.data.settings && mixIsValid(parsed.data.settings.mix) ? { ...parsed.data.settings, preset: presetFor(parsed.data.settings.mix) } : DEFAULT_SETTINGS;
  try {
    const { interview, notes } = await buildInterview({ ...parsed.data, settings, userId: user.id });
    await flushStorage();
    return NextResponse.json({
      id: interview.id,
      planBy: interview.planBy,
      notes,
      interview: {
        id: interview.id,
        company: interview.company,
        companyInitial: interview.companyInitial,
        role: interview.role,
        date: interview.date,
        format: interview.format,
        settings: interview.settings,
        createdAt: interview.createdAt,
      },
    });
  } catch (err) {
    console.error("[interviews] build failed:", err);
    return NextResponse.json({ error: "build-failed", message: "Your interview couldn’t be built. Try again." }, { status: 500 });
  }
}
