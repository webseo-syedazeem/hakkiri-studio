import { notFound } from "next/navigation";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync } from "@/lib/answers/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { scoreAnswerView } from "@/lib/answers/view";
import { findMock, findMockAsync } from "@/lib/mocks/store";
import { hasRecording } from "@/lib/answers/audio";
import { requirePageUser } from "@/lib/auth/require";
import { QuestionFeedbackView } from "@/components/feedback/QuestionFeedbackView";

export const dynamic = "force-dynamic";

export default async function AnswerFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; answerId: string }>;
  searchParams: Promise<{ demo?: string; tab?: string; mock?: string }>;
}) {
  const user = await requirePageUser();
  const { id, answerId } = await params;
  const { mock: mockId } = await searchParams;

  const interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
  const answer = (await findAnswerAsync(answerId, user.id)) ?? findAnswer(answerId, user.id);
  if (!interview || !answer || answer.interviewId !== interview.id) notFound();

  const question = resolveInterviewQuestion(interview, answer.questionId);
  if (!question) notFound();

  const { overall } = scoreAnswerView(answer, question.type);
  const mock = mockId ? ((await findMockAsync(mockId)) ?? findMock(mockId)) : undefined;

  let prevAnswerId: string | null = null;
  let nextAnswerId: string | null = null;
  if (mock && mock.answerIds && mock.answerIds.length > 0) {
    const idx = mock.answerIds.indexOf(answerId);
    if (idx > 0) prevAnswerId = mock.answerIds[idx - 1];
    if (idx >= 0 && idx < mock.answerIds.length - 1) nextAnswerId = mock.answerIds[idx + 1];
  }

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

  return (
    <QuestionFeedbackView
      interviewId={interview.id}
      mockId={mock?.id}
      roleTitle={interview.role}
      companyName={interview.company}
      categoryLabel={categoryLabel}
      question={question}
      answer={answer}
      overallScore={overall ?? 2.7}
      prevAnswerId={prevAnswerId}
      nextAnswerId={nextAnswerId}
      audioSrc={audioSrc}
      jobDescription={interview.sources?.job}
    />
  );
}
