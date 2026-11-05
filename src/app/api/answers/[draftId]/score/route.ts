import { NextResponse } from "next/server";
import { mockAiEnabled, mockFollowUpScores, mockScore } from "@/lib/ai/mock";
import { scoreAnswer } from "@/lib/ai/score";
import { buildAnswer, buildFollowUp } from "@/lib/answers/build-answer";
import { deleteDraft, getDraft } from "@/lib/answers/drafts";
import { saveAnswer } from "@/lib/answers/store";
import { saveRecordings } from "@/lib/answers/audio";
import { flushStorage } from "@/lib/storage/disk";
import { notConfigured, scoringError } from "@/lib/answers/pipeline";
import { getInterview } from "@/lib/interviews/store";
import { profileFor } from "@/lib/scoring/profiles";
import type { FollowUpKind } from "@/lib/types";
import { progressFor } from "@/lib/progress";
import { rowFromAnswer } from "@/lib/mocks/report";
import { recordUsage, setUsageContext } from "@/lib/usage/store";
import { aiConfig } from "@/lib/ai/config";
import { isPayType, payChecks, payStage } from "@/lib/sessions/pay";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/answers/{draftId}/score: the interviewer has moved on, so
 * score the main answer and every follow-up reply (one call), check the
 * results in code, and save the answer for the feedback screen.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ draftId: string }> }) {
  const blocked = notConfigured();
  if (blocked) return blocked;

  const { draftId } = await params;
  const limited = guard(_req, "answer", { inSession: true });
  if (limited) return limited;
  const draft = getDraft(draftId);
  const interview = draft && getInterview(draft.interviewId);
  const question = interview?.questions.find((q) => q.id === draft?.questionId);
  if (!draft || !interview || !question) {
    return NextResponse.json({ error: "not-found", message: "This answer has expired. Start the question again." }, { status: 404 });
  }

  const [main, ...followTurns] = draft.turns;
  const mock = mockAiEnabled();
  setUsageContext({ interviewId: interview.id, sessionId: draft.sessionId, feature: draft.sessionId ? "interview" : "single question" });
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
    saveAnswer(answer);
    saveRecordings(answer.id, draft.audio ?? []);
    deleteDraft(draft.id);
    await flushStorage();
    // The measured row comes back too, so a drill can show feedback straight away.
    const pay = isPayType(question.type) ? payChecks(question.id, main.words, payStage(interview.round)) : undefined;
    return NextResponse.json({ id: answer.id, row: rowFromAnswer(answer, question, draft.questionNumber), oneFix: answer.oneFix, strength: answer.strength, pay });
  } catch (err) {
    return scoringError(err);
  }
}
