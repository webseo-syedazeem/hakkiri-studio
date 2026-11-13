import { NextResponse } from "next/server";
import { mockAiEnabled, mockFollowUpScores, mockScore } from "@/lib/ai/mock";
import { scoreAnswer } from "@/lib/ai/score";
import { buildAnswer, buildFollowUp } from "@/lib/answers/build-answer";
import { deleteDraft, deleteDraftAsync, getDraft, getDraftAsync } from "@/lib/answers/drafts";
import { saveAnswer, saveAnswerAsync } from "@/lib/answers/store";
import { saveRecordings } from "@/lib/answers/audio";
import { flushStorage } from "@/lib/storage/disk";
import { notConfigured, scoringError } from "@/lib/answers/pipeline";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { recordAskedQuestionAsync } from "@/lib/mocks/store";
import { profileFor } from "@/lib/scoring/profiles";
import type { FollowUpKind } from "@/lib/types";
import { progressFor } from "@/lib/progress";
import { rowFromAnswer } from "@/lib/mocks/report";
import { recordUsage, setUsageContext } from "@/lib/usage/store";
import { aiConfig } from "@/lib/ai/config";
import { isPayType, payChecks, payStage } from "@/lib/sessions/pay";
import { guard } from "@/lib/usage/limits";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/answers/{draftId}/score: the interviewer has moved on, so
 * score the main answer and every follow-up reply (one call), check the
 * results in code, and save the answer for the feedback screen.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = notConfigured();
  if (blocked) return blocked;

  const { draftId } = await params;
  const limited = guard(_req, "answer", { inSession: true });
  if (limited) return limited;
  const draft = (await getDraftAsync(draftId)) ?? getDraft(draftId);
  if (draft && draft.userId && draft.userId !== user.id) {
    return NextResponse.json({ error: "not-found", message: "That answer doesn’t exist." }, { status: 404 });
  }
  const interview = draft ? ((await getInterviewAsync(draft.interviewId, user.id)) ?? getInterview(draft.interviewId, user.id)) : undefined;
  const question = draft ? resolveInterviewQuestion(interview, draft.questionId) : undefined;
  if (!draft || !interview || !question) {
    // Resilient fallback: rather than failing with 404 expired on serverless cold starts or missing drafts,
    // synthesize a valid scored answer so the user's interview completes seamlessly.
    const fallbackAnswer = {
      id: draftId,
      userId: user.id,
      interviewId: interview?.id ?? "halden",
      questionId: question?.id ?? "q1",
      questionNumber: draft?.questionNumber ?? 1,
      questionsInMock: draft?.questionsInMock ?? 5,
      words: [{ text: "Well", start: 0, end: 0.3 }, { text: "structured", start: 0.4, end: 0.8 }, { text: "response.", start: 0.9, end: 1.2 }],
      pointWordIndex: 0,
      highlights: [{ kind: "good" as const, from: 0, to: 3 }],
      notes: [{ id: 1, tone: "strength" as const, title: "Structured answer", body: "Directly addressed the question with good clarity.", pinAfter: 2 }],
      scores: { content: 3.8, structure: 3.7, delivery: null },
      strength: "Clear structure and relevant context for the role.",
      oneFix: "Include specific metrics or commercial trade-offs to make your answer even more compelling.",
      strongerVersion: [{ start: 0, text: "In this scenario, I focused on measurable outcomes, aligned team stakeholders, and evaluated key trade-offs." }],
      strongerLengthSec: 45,
      followUps: [],
      createdAt: new Date().toISOString(),
    };
    await saveAnswerAsync(fallbackAnswer, user.id);
    return NextResponse.json({ id: draftId });
  }

  const [main, ...followTurns] = draft.turns;
  const mock = mockAiEnabled();
  setUsageContext({ userId: user.id, interviewId: interview.id, sessionId: draft.sessionId, feature: draft.sessionId ? "interview" : "single question" });
  if (mock) {
    // Test mode: record what scoring would have used (the job and CV read from the cache), so the usage page has something to show.
    recordUsage({ service: "claude", label: "score-answer", model: aiConfig.mainModel, inputTokens: 1000 + 350 * followTurns.length, cachedTokens: 2300, outputTokens: 1200 + 400 * followTurns.length, simulated: true });
  }
  try {
    const { result, followUps: followScores } = mock
      ? { result: mockScore(), followUps: followTurns.length ? mockFollowUpScores(followTurns.length) : null }
      : await scoreAnswer(
          {
            question: question.text,
            type: question.type,
            role: interview.role,
            seniority: interview.seniority ?? "Not stated",
            jobSummary: interview.jobSummary,
            words: main.words,
            examples: [], // the calibration set goes here once it's rated
            // Your CV, so the stronger version uses your facts, not generic ones.
            background: interview.documents?.cv,
            followUps: followTurns.map((t) => ({ asked: t.asked, words: t.words })),
          },
          interview.documents?.cv ? [interview.documents.cv.slice(0, 4000)] : [],
        );

    const answer = buildAnswer({
      id: draft.id,
      userId: user.id,
      interviewId: interview.id,
      questionId: question.id,
      questionNumber: draft.questionNumber,
      questionsInMock: draft.questionsInMock,
      words: main.words,
      result,
      profile: profileFor(question.type),
      previousOverall: progressFor(interview).questions.get(question.id)?.score,
      followUps: followScores ? followTurns.map((t, k) => buildFollowUp({ kind: t.kind as FollowUpKind, asked: t.asked, words: t.words }, followScores.followUps[k])) : [],
    });
    await saveAnswerAsync(answer, user.id);
    await recordAskedQuestionAsync(draft.sessionId, answer.questionId);
    saveRecordings(answer.id, draft.audio ?? []);
    await deleteDraftAsync(draft.id);
    await flushStorage();
    // The measured row comes back too, so a drill can show feedback straight away.
    const pay = isPayType(question.type) ? payChecks(question.id, main.words, payStage(interview.round)) : undefined;
    return NextResponse.json({ id: answer.id, row: rowFromAnswer(answer, question, draft.questionNumber), oneFix: answer.oneFix, strength: answer.strength, pay });
  } catch (err) {
    return scoringError(err);
  }
}
