import { notFound } from "next/navigation";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { staffNurse, hmrc, halden } from "@/lib/mock-data";
import { wordsFromScript } from "@/lib/demo-words";
import { findAnswer, findAnswerAsync } from "@/lib/answers/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { scoreAnswerView } from "@/lib/answers/view";
import { findMock, findMockAsync } from "@/lib/mocks/store";
import { hasRecording } from "@/lib/answers/audio";
import { requirePageUser } from "@/lib/auth/require";
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

  let interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id) ?? getInterview(id);
  if (!interview) {
    if (id === staffNurse.id) interview = staffNurse;
    else if (id === hmrc.id) interview = hmrc;
    else if (id === halden.id) interview = halden;
  }
  if (!interview) notFound();

  const mock = mockId
    ? ((await findMockAsync(mockId, user.id)) ??
       findMock(mockId, user.id) ??
       (await findMockAsync(mockId)) ??
       findMock(mockId))
    : undefined;

  let answer = (await findAnswerAsync(answerId, user.id)) ?? findAnswer(answerId, user.id);

  // 1. Resolve Question
  let question: Question | undefined =
    (answer?.questionId ? resolveInterviewQuestion(interview, answer.questionId) : undefined) ??
    (queryQid ? resolveInterviewQuestion(interview, queryQid) : undefined) ??
    resolveInterviewQuestion(interview, answerId);

  if (!question && mock?.rows) {
    const row = mock.rows.find(
      (r) => r.answerId === answerId || r.questionId === answerId || r.questionId === queryQid
    );
    if (row) {
      question = resolveInterviewQuestion(interview, row.questionId);
    }
  }

  if (!question) {
    question = interview.questions.find((q) => q.id === queryQid || q.id === answerId) ?? interview.questions[0];
  }

  if (!question) notFound();

  // 2. Synthesize Answer if missing or cross-interview ID mismatch
  if (!answer || answer.interviewId !== interview.id) {
    const isClinical = /\b(nurse|nursing|nhs|clinical|healthcare|hospital|ward|patient|medical)\b/i.test(
      `${interview.role} ${interview.company} ${interview.jobSummary ?? ""}`
    );
    const isCivilService = /\b(civil service|hmrc|gov|government|ministry|public sector|dwp)\b/i.test(
      `${interview.role} ${interview.company} ${interview.jobSummary ?? ""}`
    );

    const row = mock?.rows?.find((r) => r.answerId === answerId || r.questionId === question?.id);
    const scoreVal = row?.overall ?? 3.5;

    const sampleWords = isClinical
      ? wordsFromScript([
          { start: 0, end: 14, text: "When conducting clinical handover, I prioritised patient safety by reviewing the latest NEWS2 observations and medication charts." },
          { start: 15, end: 28, text: "I identified an escalating trend in a postoperative patient, completed an immediate ABCDE assessment, and initiated oxygen therapy." },
          { start: 29, end: 41, text: "I escalated directly to the surgical registrar using the SBAR framework, which ensured timely clinical review and safe stabilisation." },
        ])
      : isCivilService
      ? wordsFromScript([
          { start: 0, end: 14, text: "I led a cross-government stakeholder group to align policy objectives with digital service delivery requirements." },
          { start: 15, end: 28, text: "I facilitated structured sessions to identify conflicting priorities and agreed on a prioritised backlog that met GDS accessibility standards." },
          { start: 29, end: 41, text: "This approach ensured delivery within agreed timeframes and secured positive engagement from all departmental stakeholders." },
        ])
      : wordsFromScript([
          { start: 0, end: 14, text: "I explained a new digital process to colleagues, walking them through the key steps and answering their questions." },
          { start: 15, end: 28, text: "I simplified complex technical trade-offs into a visual process map and ran a short collaborative workshop." },
          { start: 29, end: 41, text: "As a result, the team quickly understood the change, provided positive feedback, and adopted the new workflow." },
        ]);

    const refinedSTAR = isClinical
      ? [
          { start: 0, text: "During a busy night shift on an acute medical ward (Situation), a post-op patient triggered a NEWS2 score of 6 with deteriorating oxygen saturation (Task)." },
          { start: 18, text: "I immediately performed an ABCDE assessment, commenced high-flow oxygen, verified vital signs, and escalated to the on-duty registrar using the SBAR communication framework (Action)." },
          { start: 40, text: "The registrar attended within 10 minutes, arterial blood gases were taken, and the patient was safely stabilised without requiring ICU transfer (Result)." },
        ]
      : isCivilService
      ? [
          { start: 0, text: "While delivering a key government service transformation (Situation), two external departments held conflicting requirements regarding compliance deadlines (Task)." },
          { start: 18, text: "I convened a focused alignment workshop using the Civil Service Making Effective Decisions framework, weighed empirical risks against user needs, and agreed on a phased milestone schedule (Action)." },
          { start: 40, text: "Both departments signed off the roadmap, the service launched on schedule meeting 100% GDS standards, and ministerial commitments were upheld (Result)." },
        ]
      : [
          { start: 0, text: `On the ${interview.role} project, I needed to explain a new digital triage process to operational stakeholders who were not familiar with technical detail (Situation).` },
          { start: 18, text: "My goal was to build understanding and confidence so the team could adopt the change without operational disruption (Task). I broke the process down into a simple step-by-step visual map and ran a hands-on workshop (Action)." },
          { start: 40, text: "As a result, adoption reached 95% in week two, user friction decreased, and leadership signed off on rollout across all departments (Result)." },
        ];

    answer = {
      id: answerId,
      userId: user.id,
      interviewId: interview.id,
      questionId: question.id,
      questionNumber: row?.number ?? 1,
      questionsInMock: mock?.planned ?? interview.questions.length ?? 6,
      words: sampleWords,
      pointWordIndex: 0,
      highlights: [
        { kind: "good", from: 0, to: 8 },
        { kind: "good", from: 29, to: 38 },
      ],
      notes: [
        {
          id: 1,
          tone: "strength",
          title: "Clear structured opening",
          body: "You introduced your example directly and stated the context right away.",
          pinAfter: 14,
        },
        {
          id: 2,
          tone: "fix",
          title: "Quantify the outcome",
          body: "Include specific numbers, timeframes, or percentage improvements in your final result.",
          pinAfter: 28,
        },
        {
          id: 3,
          tone: "strength",
          title: "Good collaborative tone",
          body: "Demonstrated clear stakeholder communication and proactive problem solving.",
          pinAfter: 41,
        },
      ],
      scores: {
        content: Math.min(5, Math.max(1, Math.round(scoreVal))),
        structure: Math.min(5, Math.max(1, Math.round(scoreVal))),
        delivery: null,
      },
      previousOverall: 2.8,
      strength: "You introduced yourself directly and stated your core professional background right away.",
      oneFix: "Add more context: specify what the process was, who the audience were, and the measurable outcome.",
      strongerVersion: refinedSTAR,
      strongerLengthSec: 85,
      followUps: [],
      createdAt: new Date().toISOString(),
    };
  }

  const { overall } = scoreAnswerView(answer, question.type);

  // 3. Navigation Links (Previous & Next question)
  let prevAnswerId: string | null = null;
  let nextAnswerId: string | null = null;
  if (mock?.rows && mock.rows.length > 1) {
    const currentIdx = mock.rows.findIndex(
      (r) => r.answerId === answerId || r.questionId === question?.id || r.questionId === answerId
    );
    if (currentIdx > 0) {
      const prevRow = mock.rows[currentIdx - 1];
      prevAnswerId = prevRow.answerId || prevRow.questionId;
    }
    if (currentIdx >= 0 && currentIdx < mock.rows.length - 1) {
      const nextRow = mock.rows[currentIdx + 1];
      nextAnswerId = nextRow.answerId || nextRow.questionId;
    }
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

  return (
    <QuestionFeedbackView
      interviewId={interview.id}
      mockId={mock?.id}
      roleTitle={interview.role}
      companyName={interview.company}
      categoryLabel={categoryLabel}
      question={question}
      answer={answer}
      overallScore={overall ?? 3.5}
      prevAnswerId={prevAnswerId}
      nextAnswerId={nextAnswerId}
      nextQuestionId={nextQuestionId}
      audioSrc={audioSrc}
      jobDescription={interview.sources?.job}
    />
  );
}
