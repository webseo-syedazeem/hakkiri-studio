import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getInterview, updateInterview } from "@/lib/interviews/store";
import { findAnswer } from "@/lib/answers/store";
import { findMock, saveMock, SKIP_REASONS } from "@/lib/mocks/store";
import { retireSkipped, topUp } from "@/lib/sessions/server";
import { mergeRules, rulesFromSkips } from "@/lib/sessions/rules";
import { flushStorage } from "@/lib/storage/disk";
import { guard } from "@/lib/usage/limits";
import { withUsageContext } from "@/lib/usage/store";

export const runtime = "nodejs";

const Skip = z.object({ questionId: z.string(), reason: z.enum(SKIP_REASONS), replacedBy: z.string().optional() });

const Body = z.object({
  interviewId: z.string(),
  /** The planned session this finishes (interviews, re-runs and drills). */
  sessionId: z.string().optional(),
  kind: z.enum(["full", "group", "first"]).optional(),
  group: z.enum(["motivation", "competency", "technical", "cv", "curveball"]).optional(),
  startedAt: z.iso.datetime(),
  style: z.enum(["friendly", "realistic", "tough"]).optional(),
  planned: z.number().int().min(1).max(40),
  answerIds: z.array(z.string()).min(1).max(40),
  askedIds: z.array(z.string()).max(60).optional(),
  skipped: z.array(Skip).max(30).optional(),
});

/**
 * POST /api/mocks: the session has ended and its answers are scored. Saves
 * it and returns its id for the report. Skip reasons become rules for the
 * questions written next, and the bank is topped up in the background so
 * your next interview doesn't wait.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "That interview couldn’t be saved." }, { status: 400 });
  const body = parsed.data;
  const interview = getInterview(body.interviewId);
  const answers = body.answerIds.map((id) => findAnswer(id));
  if (!interview || answers.some((a) => !a || a.interviewId !== interview.id)) {
    return NextResponse.json({ error: "not-found", message: "Some answers in this interview have expired." }, { status: 404 });
  }
  const finishedAt = new Date().toISOString();

  if (body.sessionId) {
    const session = findMock(body.sessionId);
    if (!session || session.interviewId !== interview.id) return NextResponse.json({ error: "not-found", message: "That interview has expired." }, { status: 404 });
    if (session.status === "done") return NextResponse.json({ id: session.id });
    const skipped = body.skipped ?? [];
    saveMock({ ...session, status: "done", startedAt: body.startedAt, finishedAt, answerIds: body.answerIds, askedIds: body.askedIds ?? session.questionIds, skipped, style: body.style ?? session.style, planned: body.planned });
    const rules = rulesFromSkips(skipped, (id) => interview.questions.find((q) => q.id === id && !q.slot)?.text);
    if (rules.length) updateInterview(interview.id, (i) => ({ ...i, rules: mergeRules(i.rules, rules) }));
    retireSkipped(interview.id, skipped);
    after(() => withUsageContext({ interviewId: interview.id, feature: "questions" }, () => topUp(interview.id)).catch((err) => console.warn("[sessions] top-up failed:", err)));
    await flushStorage();
    return NextResponse.json({ id: session.id });
  }

  const id = randomUUID();
  saveMock({ id, interviewId: interview.id, kind: body.kind ?? "full", status: "done", group: body.group, startedAt: body.startedAt, style: body.style, finishedAt, answerIds: body.answerIds, planned: body.planned });
  await flushStorage();
  return NextResponse.json({ id });
}
