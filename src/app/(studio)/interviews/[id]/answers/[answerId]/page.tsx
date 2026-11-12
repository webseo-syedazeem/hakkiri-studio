import { notFound } from "next/navigation";
import { devOr } from "@/lib/launch";
import { AnswerClip } from "@/components/feedback/AnswerClip";
import { Transcript } from "@/components/feedback/Transcript";
import { HearButton } from "@/components/feedback/HearButton";
import { ButtonLink, Chip, Crumbs, Icon, Panel, Pin } from "@/components/ui";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { findAnswer, findAnswerAsync } from "@/lib/answers/store";
import { resolveInterviewQuestion } from "@/lib/sessions/topics";
import { SCORE_LABELS } from "@/lib/scoring/combine";
import { scoreAnswerView } from "@/lib/answers/view";
import { findMock, findMockAsync } from "@/lib/mocks/store";
import { hasRecording } from "@/lib/answers/audio";
import { inWords } from "@/lib/format";

function PartScore({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="w-[118px]">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="num font-semibold">{score ?? "n/a"}</span>
      </div>
      <div className="mt-1.5 flex gap-[3px]" role="img" aria-label={`${label}: ${score ?? "not scored"} out of 5`}>
        {Array.from({ length: 5 }, (_, k) => (
          <span key={k} className={`h-2 flex-1 rounded-[2px] ${score != null && k < score ? "bg-blue" : "bg-white/[0.08]"}`} />
        ))}
      </div>
      <div className="mt-1.5 text-xs text-muted">{score != null ? SCORE_LABELS[score] : "Not scored here"}</div>
    </div>
  );
}

const DEMO_NOTE: Record<string, string> = {
  "no-keys": devOr("This is the demo feedback. Add DEEPGRAM_API_KEY and GEMINI_API_KEY or ANTHROPIC_API_KEY to .env.local to score your own answers.", "Scoring isn’t available right now, so this is an example. Try again in a few minutes."),
  "no-audio": "No recording was captured (the mic may be blocked), so this is the demo feedback.",
  error: "Your answer couldn’t be scored this time, so this is the demo feedback.",
};

export default async function AnswerFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; answerId: string }>;
  searchParams: Promise<{ demo?: string; tab?: string; mock?: string }>;
}) {
  const { id, answerId } = await params;
  const { demo, tab, mock: mockId } = await searchParams;
  const interview = (await getInterviewAsync(id)) ?? getInterview(id);
  const answer = (await findAnswerAsync(answerId)) ?? findAnswer(answerId);
  if (!interview || !answer || answer.interviewId !== interview.id) notFound();
  const question = resolveInterviewQuestion(interview, answer.questionId);
  if (!question) notFound(); // the question was removed after it was answered
  // Delivery is measured in code from the word timings (for the answer and each
  // follow-up reply); content and structure come from the model.
  const { profile, metrics, scores, overall, followUps } = scoreAnswerView(answer, question.type);
  const lateHl = answer.highlights.find((h) => h.kind === "late");
  const mock = mockId ? ((await findMockAsync(mockId)) ?? findMock(mockId)) : undefined;
  const late = lateHl ? { start: answer.words[lateHl.from].start, end: answer.words[lateHl.to].end } : null;

  return (
    <div className="flex h-[calc(100vh-56px)] min-h-[820px] flex-col">
      <header className="flex animate-rise items-start justify-between gap-8">
        <div className="min-w-0">
          <Crumbs
            items={[
              mock
                ? { label: `${interview.company} report`, href: `/interviews/${interview.id}/mocks/${mock.id}` }
                : { label: `${interview.company} interview`, href: `/interviews/${interview.id}` },
              { label: answer.questionsInMock > 1 ? `Question ${answer.questionNumber} of ${answer.questionsInMock}` : "Single question" },
            ]}
          />
          <h1 className="mt-2 text-[23px] font-semibold leading-[1.3] tracking-[-0.02em]">{question.text}</h1>
          <div className="mt-2.5 flex items-center gap-2 text-[13px]">
            <span className="text-muted">Scored as</span>
            <Chip>{profile.label}</Chip>
            {followUps.length > 0 && (
              <span className="text-muted">
                · {inWords(followUps.length)} follow-up{followUps.length > 1 ? "s" : ""}, scored on {followUps.length > 1 ? "their" : "its"} own
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-[22px]">
          <PartScore label="Content" score={scores.content} />
          <PartScore label="Structure" score={scores.structure} />
          <PartScore label="Delivery" score={scores.delivery} />
          <div className="border-l border-line pl-[22px] text-right">
            <div className="num text-[42px] font-semibold leading-none tracking-[-0.035em]">{overall?.toFixed(1) ?? "n/a"}</div>
            {answer.previousOverall != null && overall != null && (
              <div className="mt-1.5 text-xs text-muted">
                {overall > answer.previousOverall ? `up from ${answer.previousOverall.toFixed(1)}` : overall < answer.previousOverall ? `down from ${answer.previousOverall.toFixed(1)}` : "same as last time"}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-[18px]">
        <AnswerClip
          words={answer.words}
          metrics={metrics}
          late={late}
          belongsWithinSec={profile.pointWithinSec}
          targetSec={profile.targetSec}
          audioSrc={hasRecording(answer.id) ? `/api/answers/${answer.id}/audio/0` : null}
        />
      </div>

      <div className="mt-[18px] grid min-h-0 grow grid-cols-[1fr_392px] gap-5">
        <Panel aria-label="Transcript" className="overflow-hidden px-6 pt-3.5">
          <Transcript
            words={answer.words}
            highlights={answer.highlights}
            notes={answer.notes}
            stronger={answer.strongerVersion}
            strongerLengthSec={answer.strongerLengthSec}
            followUps={followUps.map((f, k) => ({ ...f, audioSrc: hasRecording(answer.id, k + 1) ? `/api/answers/${answer.id}/audio/${k + 1}` : null }))}
            interviewerName={interview.interviewer.name}
            initialTab={tab === "follow-ups" && followUps.length ? "follow-ups" : "yours"}
          />
        </Panel>
        <Panel aria-label="Coach notes" className="flex flex-col px-5 pb-[18px] pt-3.5">
          <h2 className="mb-1 text-[15px] font-semibold">Coach notes</h2>
          {answer.notes.map((n) => (
            <div key={n.id} className="grid grid-cols-[22px_1fr] gap-2.5 border-t border-line py-3">
              <span className="mt-0.5">
                <Pin n={n.id} tone={n.tone} />
              </span>
              <div>
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="mt-0.5 text-[13px] leading-normal text-muted">{n.body}</div>
              </div>
            </div>
          ))}
          <div className="grow" />
          <div className="rounded-xl bg-panel-2 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <div className="text-xs text-muted">Your one fix for the retry</div>
            <div className="mt-0.5 text-base font-semibold">{answer.oneFix}</div>
            <HearButton text={answer.strongerVersion.map((s) => s.text).join(" ")} />
          </div>
          <div className="mt-3 flex gap-2.5">
            <ButtonLink href={mock ? `/interviews/${interview.id}/mocks/${mock.id}` : `/interviews/${interview.id}`} className="flex-1">
              {mock ? "Back to report" : "Back to the interview"}
            </ButtonLink>
            <ButtonLink href={`/mock/${interview.id}?q=${question.id}`} variant="primary" className="flex-[1.6]">
              <Icon name="repeat" size={16} strokeWidth={2} />
              Retry with this fix
            </ButtonLink>
          </div>
        </Panel>
      </div>
    </div>
  );
}
