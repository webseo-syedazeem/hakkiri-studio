import { notFound } from "next/navigation";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync } from "@/lib/answers/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { scoreAnswerView } from "@/lib/answers/view";
import { findMock, findMockAsync } from "@/lib/mocks/store";
import { hasRecording } from "@/lib/answers/audio";
import { requirePageUser } from "@/lib/auth/require";
import { mockAiEnabled } from "@/lib/ai/mock";
import { QuestionFeedbackView } from "@/components/feedback/QuestionFeedbackView";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AnswerFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; answerId: string }>;
  searchParams: Promise<{ demo?: string; tab?: string; mock?: string; q?: string }>;
}) {
  const user = await requirePageUser();
  const { id, answerId } = await params;
  const { mock: mockId, q: queryQid } = await searchParams;

  // Only the signed-in person's own interview, session and answer. Anything else, including an answer
  // that does not exist, is "not found": this page never shows another account's interview and never
  // makes up an answer to show feedback on.
  const interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
  if (!interview) notFound();

  const mock = mockId ? ((await findMockAsync(mockId, user.id)) ?? findMock(mockId, user.id)) : undefined;

  const answer = (await findAnswerAsync(answerId, user.id)) ?? findAnswer(answerId, user.id);
  if (!answer || answer.interviewId !== interview.id) notFound();

  const question: Question | undefined = resolveInterviewQuestion(interview, answer.questionId) ?? (queryQid ? resolveInterviewQuestion(interview, queryQid) : undefined);
  if (!question) notFound();

  // Every number on the screen is worked out here from the saved answer. An answer that couldn't be scored
  // is shown as "Not scored": no figure is put in its place.
  const scored = scoreAnswerView(answer, question.type);

  // 3. Navigation Links (Previous & Next question)
  let prevAnswerId: string | null = null;
  let nextAnswerId: string | null = null;
  if (mock?.rows && mock.rows.length > 1) {
    const currentIdx = mock.rows.findIndex(
      (r) => r.answerId === answerId || r.questionId === question?.id || r.questionId === answerId
    );
    // Previous and next only ever point at an answer that exists.
    if (currentIdx > 0) prevAnswerId = mock.rows[currentIdx - 1].answerId || null;
    if (currentIdx >= 0 && currentIdx < mock.rows.length - 1) nextAnswerId = mock.rows[currentIdx + 1].answerId || null;
  } else if (mock?.answerIds && mock.answerIds.length > 0) {
    const idx = mock.answerIds.indexOf(answerId);
    if (idx > 0) prevAnswerId = mock.answerIds[idx - 1];
    if (idx >= 0 && idx < mock.answerIds.length - 1) nextAnswerId = mock.answerIds[idx + 1];
  }

  // 4. Find next question in this interview for continuous practice
  const currentQIdx = interview.questions.findIndex((q) => q.id === question?.id);
  const nextQ =
    currentQIdx >= 0 && currentQIdx < interview.questions.length - 1
      ? interview.questions[currentQIdx + 1]
      : interview.questions[0];
  const nextQuestionId = nextQ ? nextQ.id : null;

  const categoryLabel =
    question.group === "competency"
      ? "Skills"
      : question.group === "technical"
      ? "Technical"
      : question.group === "cv"
      ? "Experience"
      : question.group === "motivation"
      ? "Motivation"
      : "Situational";

  const audioSrc = hasRecording(answer.id) ? `/api/answers/${answer.id}/audio/0` : null;
  const followUps = scored.followUps.map((f, i) => ({ ...f, audioSrc: hasRecording(answer.id, i + 1) ? `/api/answers/${answer.id}/audio/${i + 1}` : null }));

  return (
    <QuestionFeedbackView
      interviewId={interview.id}
      mockId={mock?.id}
      roleTitle={interview.role}
      categoryLabel={categoryLabel}
      question={question}
      answer={answer}
      overallScore={scored.overall}
      scores={scored.scores}
      lengthSec={scored.metrics.lengthSec}
      wordsPerMinute={scored.metrics.wordsPerMinute}
      fillerCount={scored.metrics.fillerCount}
      followUps={followUps}
      interviewerName={interview.interviewer?.name ?? "The interviewer"}
      testMode={mockAiEnabled()}
      prevAnswerId={prevAnswerId}
      nextAnswerId={nextAnswerId}
      nextQuestionId={nextQuestionId}
      audioSrc={audioSrc}
    />
  );
}
