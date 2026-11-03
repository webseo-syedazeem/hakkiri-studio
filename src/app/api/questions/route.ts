import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterview } from "@/lib/interviews/store";
import { addQuestion, removeQuestion } from "@/lib/questions/store";

export const runtime = "nodejs";

const Add = z.object({
  interviewId: z.string(),
  text: z.string().trim().min(8, "Write the whole question.").max(240, "Keep it under 240 characters."),
  group: z.enum(["motivation", "competency", "technical", "cv", "curveball"]),
});

/** POST /api/questions: add your own question to an interview plan. */
export async function POST(req: Request) {
  const parsed = Add.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: parsed.error.issues[0]?.message ?? "That question couldn’t be added." }, { status: 400 });
  if (!getInterview(parsed.data.interviewId)) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist." }, { status: 404 });
  const q = addQuestion(parsed.data.interviewId, parsed.data.text, parsed.data.group);
  return NextResponse.json({ question: q });
}

/** DELETE /api/questions?interviewId=…&id=…: remove a question you added. */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const ok = removeQuestion(url.searchParams.get("interviewId") ?? "", url.searchParams.get("id") ?? "");
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not-found", message: "Only questions you added can be removed." }, { status: 404 });
}
