import { NextResponse } from "next/server";
import { z } from "zod";
import { rebuildFromSetup } from "@/lib/interviews/build";
import { SettingsBody } from "@/lib/interviews/settings-schema";
import { DEFAULT_SETTINGS, mixIsValid, presetFor } from "@/lib/interviews/settings";
import { getInterview, getInterviewAsync, isDemoInterview } from "@/lib/interviews/store";
import { lastAskedMapAsync } from "@/lib/mocks/store";
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
  company: z.object({ name: z.string().trim().min(1).max(80), url: z.string().max(500).optional() }),
  job: z.object({ title: z.string().trim().max(120), text: z.string().max(25_000).optional(), url: z.string().max(500).optional(), label: z.string().max(200).optional() }),
  cv: Doc,
  coverLetter: Doc.optional(),
  format: z.enum(["in-person", "video", "phone"]),
  settings: SettingsBody.optional(),
  stages: z.array(StageSchema).optional(),
});

/**
 * POST /api/interviews/{id}/edit: the set-up form, opened on an interview you
 * already have. Saves what you changed and rebuilds the questions to match,
 * keeping the questions you've already answered (and so your history).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  if (isDemoInterview(id)) return NextResponse.json({ error: "demo", message: "The example interview can’t be edited. Set up your own to change it." }, { status: 400 });
  const existing = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
  if (!existing) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist any more." }, { status: 404 });

  const blocked = guard(req, "build", { userId: user.id });
  if (blocked) return blocked;
  setUsageContext({ userId: user.id, interviewId: id, feature: "set-up" });

  const sent = await readJsonValue(req, 450_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const message = field === "cv" ? "Add your CV first." : field === "company" ? "Add the company’s name." : "Some of the set-up is missing. Check each field and try again.";
    return NextResponse.json({ error: "bad-request", message }, { status: 400 });
  }
  const b = parsed.data;
  if (!b.job.title && !b.job.text && !b.job.url) return NextResponse.json({ error: "bad-request", message: "Add the job title, or the job spec." }, { status: 400 });
  const settings = b.settings && mixIsValid(b.settings.mix) ? { ...b.settings, preset: presetFor(b.settings.mix) } : (existing.settings ?? DEFAULT_SETTINGS);
  try {
    const heard = [...(await lastAskedMapAsync(id, user.id)).keys()];
    const { interview, notes } = await rebuildFromSetup(existing, { ...b, settings, userId: user.id }, heard);
    await flushStorage();
    return NextResponse.json({ id: interview.id, planBy: interview.planBy, notes });
  } catch (err) {
    console.error("[interviews/edit] rebuild failed:", err);
    return NextResponse.json({ error: "build-failed", message: "Your changes couldn’t be saved. Try again." }, { status: 500 });
  }
}
