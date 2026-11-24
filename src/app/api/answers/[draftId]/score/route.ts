import { NextResponse } from "next/server";
import { mockAiEnabled, mockFollowUpScores, mockScore } from "@/lib/ai/mock";
import { scoreAnswer } from "@/lib/ai/score";
import { buildAnswer, buildFollowUp } from "@/lib/answers/build-answer";
import { deleteDraft, deleteDraftAsync, getDraft, getDraftAsync } from "@/lib/answers/drafts";
import { saveAnswer, saveAnswerAsync } from "@/lib/answers/store";
import { saveRecordings, saveRecordingsAsync } from "@/lib/answers/audio";
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
  const limited = guard(_req, "answer", { inSession: true, userId: user.id });
  if (limited) return limited;
  const draft = (await getDraftAsync(draftId)) ?? getDraft(draftId);
  if (draft && draft.userId !== user.id) {
    return NextResponse.json({ error: "not-found", message: "That answer doesn’t exist." }, { status: 404 });
  }
  const interview = draft ? ((await getInterviewAsync(draft.interviewId, user.id)) ?? getInterview(draft.interviewId, user.id)) : undefined;
  const question = draft ? resolveInterviewQuestion(interview, draft.questionId) : undefined;
  if (!draft || !interview || !question) {
    return NextResponse.json(
      {
        error: "draft-not-found",
        message: "The answer draft has expired or could not be found. Please try recording again.",
      },
      { status: 404 },
    );
  }

  const [main, ...followTurns] = draft.turns;
  const mock = mockAiEnabled();
  setUsageContext({ userId: user.id, interviewId: interview.id, sessionId: draft.sessionId, feature: draft.sessionId ? "interview" : "single question" });
  if (mock) {
    // Test mode: record what scoring would have used (the job and CV read from the cache), so the usage page has something to show.
    recordUsage({ service: "claude", label: "score-answer", model: aiConfig.mainModel, inputTokens: 1000 + 350 * followTurns.length, cachedTokens: 2300, outputTokens: 1200 + 400 * followTurns.length, simulated: true });
  }
  try {
    const groupMeaning = interview.understanding?.meanings?.[question.group];
    const roleCriteria = [
      groupMeaning ? `Category Focus (${question.group}): ${groupMeaning}` : "",
      question.short ? `Question topic / behaviour: ${question.short}` : "",
      interview.skills?.length ? `Key skills: ${interview.skills.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    const { result, followUps: followScores } = mock
      ? { result: mockScore(), followUps: followTurns.length ? mockFollowUpScores(followTurns.length) : null }
      : await scoreAnswer(
          {
            question: question.text,
            type: question.type,
            role: interview.role,
            seniority: interview.seniority ?? "Not stated",
            jobSummary: interview.jobSummary,
            jobDescription: interview.documents?.job?.slice(0, 2500),
            questionGroup: question.group,
            questionShort: question.short,
            assessedCriteria: roleCriteria,
            company: interview.company,
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
      previousOverall: progressFor(interview, user.id).questions.get(question.id)?.score,
      followUps: followScores ? followTurns.map((t, k) => buildFollowUp({ kind: t.kind as FollowUpKind, asked: t.asked, words: t.words }, followScores.followUps[k])) : [],
    });
    await saveAnswerAsync(answer, user.id);
    await recordAskedQuestionAsync(draft.sessionId, answer.questionId, user.id);
    await saveRecordingsAsync(answer.id, draft.audio ?? [], user.id);
    await deleteDraftAsync(draft.id);
    await flushStorage();
    // The measured row comes back too, so a drill can show feedback straight away.
    const pay = isPayType(question.type) ? payChecks(question.id, main.words, payStage(interview.round)) : undefined;
    return NextResponse.json({ id: answer.id, row: rowFromAnswer(answer, question, draft.questionNumber), oneFix: answer.oneFix, strength: answer.strength, pay });
  } catch (err) {
    return scoringError(err);
  }
}
