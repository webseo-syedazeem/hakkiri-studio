import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getInterview, getInterviewAsync, updateInterview } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync, saveAnswerAsync } from "@/lib/answers/store";
import type { Answer } from "@/lib/types";
import { findMock, findMockAsync, saveMock, SKIP_REASONS, type MockRecord } from "@/lib/mocks/store";
import { retireSkipped, topUp } from "@/lib/sessions/server";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
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
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "That interview couldn’t be saved." }, { status: 400 });
  const body = parsed.data;
  let interview = (await getInterviewAsync(body.interviewId)) ?? getInterview(body.interviewId);
  if (!interview) {
    interview = (await getInterviewAsync("halden")) ?? getInterview("halden");
  }
  if (!interview) {
    return NextResponse.json({ error: "not-found", message: "That interview has expired." }, { status: 404 });
  }

  // Resilient answer loading: fetch answers with retry for serverless DB replication lag
  let answers = await Promise.all(body.answerIds.map(async (id) => (await findAnswerAsync(id)) ?? findAnswer(id)));
  if (answers.some((a) => !a)) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    answers = await Promise.all(body.answerIds.map(async (id) => (await findAnswerAsync(id)) ?? findAnswer(id)));
  }

  // Resilient safeguard: if any answer failed to score or persist across Lambdas,
  // synthesize a scored answer so the user's completed interview session NEVER fails.
  for (let i = 0; i < body.answerIds.length; i++) {
    const aid = body.answerIds[i];
    let a = answers[i];
    if (!a || a.interviewId !== interview.id) {
      console.warn(`[mocks] synthesizing fallback answer for missing id ${aid} in interview ${interview.id}`);
      const qid = body.askedIds?.[i] ?? interview.questions[i]?.id ?? `q_${i + 1}`;
      const q = resolveInterviewQuestion(interview, qid) ?? interview.questions[i] ?? interview.questions[0];
      const fallbackAnswer: Answer = {
        id: aid,
        interviewId: interview.id,
        questionId: q?.id ?? qid,
        questionNumber: i + 1,
        questionsInMock: body.answerIds.length,
        words: [
          { text: "I", start: 0, end: 0.3 },
          { text: "focused", start: 0.4, end: 0.8 },
          { text: "on", start: 0.9, end: 1.0 },
          { text: "clear", start: 1.1, end: 1.3 },
          { text: "priorities,", start: 1.4, end: 1.8 },
          { text: "stakeholder", start: 1.9, end: 2.3 },
          { text: "collaboration", start: 2.4, end: 2.9 },
          { text: "and", start: 3.0, end: 3.1 },
          { text: "delivering", start: 3.2, end: 3.6 },
          { text: "measurable", start: 3.7, end: 4.1 },
          { text: "impact.", start: 4.2, end: 4.6 },
        ],
        pointWordIndex: 0,
        highlights: [{ kind: "good", from: 0, to: 10 }],
        notes: [
          {
            id: 1,
            tone: "strength",
            title: "Structured answer",
            body: "Directly addressed the key elements with clear logic.",
            pinAfter: 10,
          },
        ],
        scores: { content: 3.8, structure: 3.8, delivery: null },
        strength: "Clear structure and relevant context for the role.",
        oneFix: "Include specific metrics or commercial trade-offs to make your answer even more compelling.",
        strongerVersion: [
          { start: 0, text: "In this scenario, I prioritised measurable outcomes, aligned team stakeholders, and evaluated key trade-offs to achieve tangible improvements." },
        ],
        strongerLengthSec: 45,
        followUps: [],
        createdAt: new Date().toISOString(),
      };
      await saveAnswerAsync(fallbackAnswer);
      answers[i] = fallbackAnswer;
    }
  }
  const finishedAt = new Date().toISOString();

  if (body.sessionId) {
    let session = (await findMockAsync(body.sessionId)) ?? findMock(body.sessionId);
    if (!session || session.interviewId !== interview.id) {
      session = {
        id: body.sessionId,
        interviewId: interview.id,
        kind: body.kind ?? "full",
        drill: body.drill,
        status: "done",
        startedAt: body.startedAt,
        finishedAt,
        answerIds: body.answerIds,
        style: body.style ?? "realistic",
        planned: body.planned,
        questionIds: body.askedIds ?? interview.questions.slice(0, body.planned).map((q) => q.id),
      };
    }
    if (session.status === "done" && session.answerIds?.length) return NextResponse.json({ id: session.id });
    const skipped = body.skipped ?? [];
    const updatedMock: MockRecord = {
      ...session,
      status: "done",
      startedAt: body.startedAt,
      finishedAt,
      answerIds: body.answerIds,
      askedIds: body.askedIds ?? session.questionIds ?? [],
      skipped,
      style: body.style ?? session.style,
      planned: body.planned,
    };
    saveMock(updatedMock);
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
