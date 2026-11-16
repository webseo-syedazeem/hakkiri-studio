import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getInterview, getInterviewAsync, saveInterviewAsync, updateInterview } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync, saveAnswerAsync } from "@/lib/answers/store";
import type { Answer } from "@/lib/types";
import { findMock, findMockAsync, saveMockAsync, SKIP_REASONS, type MockRecord } from "@/lib/mocks/store";
import { retireSkipped, topUp } from "@/lib/sessions/server";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { mergeRules, rulesFromSkips } from "@/lib/sessions/rules";
import { flushStorage } from "@/lib/storage/disk";
import { guard } from "@/lib/usage/limits";
import { withUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";

const Skip = z.object({ questionId: z.string(), reason: z.enum(SKIP_REASONS), replacedBy: z.string().optional() });

const Body = z.object({
  interviewId: z.string(),
  /** The planned session this finishes (interviews, re-runs and drills). */
  sessionId: z.string().optional(),
  kind: z.enum(["full", "group", "first", "drill"]).optional(),
  drill: z
    .object({
      kind: z.enum(["fix", "category", "habit", "pressure", "pay", "topic"]),
      questionId: z.string().optional(),
      group: z.enum(["motivation", "competency", "technical", "cv", "curveball"]).optional(),
      habit: z.enum(["lead", "ownership", "numbers", "short", "fillers", "full"]).optional(),
      topic: z.string().max(80).optional(),
    })
    .optional(),
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
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "That interview couldn’t be saved." }, { status: 400 });
  const body = parsed.data;
  let interview = (await getInterviewAsync(body.interviewId, user.id)) ?? getInterview(body.interviewId, user.id);
  if (!interview && body.interviewId === "halden") {
    interview = (await getInterviewAsync("halden", user.id)) ?? getInterview("halden", user.id);
  }
  if (!interview) {
    return NextResponse.json({ error: "not-found", message: "That interview has expired." }, { status: 404 });
  }

  // Resilient answer loading: fetch answers with retry for serverless DB replication lag
  let answers = await Promise.all(body.answerIds.map(async (id) => (await findAnswerAsync(id, user.id)) ?? findAnswer(id, user.id)));
  if (answers.some((a) => !a)) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    answers = await Promise.all(body.answerIds.map(async (id) => (await findAnswerAsync(id, user.id)) ?? findAnswer(id, user.id)));
  }

  // Filter for real recorded answers belonging to this interview and user
  const realAnswers = answers.filter((a): a is Answer => Boolean(a && a.interviewId === interview.id));
  const effectiveAnswerIds = realAnswers.map((a) => a.id);
  const finishedAt = new Date().toISOString();

  if (body.sessionId) {
    let session = (await findMockAsync(body.sessionId, user.id)) ?? findMock(body.sessionId, user.id);
    if (!session || session.interviewId !== interview.id) {
      session = {
        id: body.sessionId,
        userId: user.id,
        interviewId: interview.id,
        kind: body.kind ?? "full",
        drill: body.drill,
        status: "done",
        startedAt: body.startedAt,
        finishedAt,
        answerIds: effectiveAnswerIds,
        style: body.style ?? "realistic",
        planned: body.planned,
        questionIds: body.askedIds ?? interview.questions.slice(0, body.planned).map((q) => q.id),
      };
    }
    if (session.status === "done" && session.answerIds?.length) return NextResponse.json({ id: session.id });
    const skipped = body.skipped ?? [];
    const updatedMock: MockRecord = {
      ...session,
      userId: user.id,
      status: "done",
      startedAt: body.startedAt,
      finishedAt,
      answerIds: effectiveAnswerIds,
      askedIds: body.askedIds ?? session.questionIds ?? [],
      skipped,
      style: body.style ?? session.style,
      planned: body.planned,
    };
    await saveMockAsync(updatedMock, user.id);
    const rules = rulesFromSkips(skipped, (id) => interview.questions.find((q) => q.id === id && !q.slot)?.text);
    if (rules.length) {
      const updatedInt = updateInterview(interview.id, (i) => ({ ...i, rules: mergeRules(i.rules, rules) }), user.id);
      if (updatedInt) await saveInterviewAsync(updatedInt, user.id);
    }
    retireSkipped(interview.id, skipped);
    const refreshed = getInterview(interview.id, user.id);
    if (refreshed && skipped.length) await saveInterviewAsync(refreshed, user.id);
    after(() => withUsageContext({ userId: user.id, interviewId: interview.id, feature: "questions" }, () => topUp(interview.id)).catch((err) => console.warn("[sessions] top-up failed:", err)));
    await flushStorage();
    return NextResponse.json({ id: session.id });
  }

  const id = randomUUID();
  await saveMockAsync({ id, userId: user.id, interviewId: interview.id, kind: body.kind ?? "full", status: "done", group: body.group, startedAt: body.startedAt, style: body.style, finishedAt, answerIds: effectiveAnswerIds, askedIds: body.askedIds, planned: body.planned }, user.id);
  await flushStorage();
  return NextResponse.json({ id });
}
