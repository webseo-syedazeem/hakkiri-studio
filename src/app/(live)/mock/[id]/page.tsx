import { notFound, redirect } from "next/navigation";
import { LiveInterview, type LiveQuestion, type LiveSession } from "@/components/live/LiveInterview";
import { demoMock, roadmapAnswer } from "@/lib/mock-data";
import { isLaunch } from "@/lib/launch";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { categoryLabel, difficultyFor, settingsLine, styleFor, type Difficulty } from "@/lib/interviews/settings";
import { profileFor } from "@/lib/scoring/profiles";
import { followUpLimit } from "@/lib/followups";
import { mmss, whenSaid } from "@/lib/format";
import { buildReport } from "@/lib/mocks/report";
import { findMock, findMockAsync, lastAskedMapAsync, rowsFor } from "@/lib/mocks/store";
import { openSession } from "@/lib/sessions/server";
import { drillTitle, HABIT_INSTRUCTION } from "@/lib/sessions/drills";
import { getTopic, resolveInterviewQuestion, topicQuestions } from "@/lib/sessions/topics";
import type { Question } from "@/lib/types";
import { PAY_STAGE_LABEL, PAY_TIPS, payStage } from "@/lib/sessions/pay";

export const dynamic = "force-dynamic";

/**
 * /mock/{interview}?session={id}   a planned interview, re-run or drill (see /api/interviews/{id}/sessions)
 * /mock/{interview}?topic={slug}   a focused topic drill (e.g. stakeholder-management)
 * /mock/{interview}?q=c1           one question, then its feedback (?followups=off to start without follow-ups)
 * /mock/{interview}                back to the interview, where you choose your settings and start
 */
export default async function MockInterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; followups?: string; session?: string; topic?: string; difficulty?: string }>;
}) {
  const { id } = await params;
  const { q, followups, session: sessionId, topic, difficulty } = await searchParams;
  const difficultyParam =
    difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? (difficulty as Difficulty) : null;
  const styleOverride = difficultyParam ? styleFor(difficultyParam) : null;
  const interview = (await getInterviewAsync(id)) ?? getInterview(id);
  if (!interview) notFound();

  const toLive = (question: Question, number: number, follow = true): LiveQuestion => {
    const profile = profileFor(question.type);
    return {
      id: question.id,
      text: question.text,
      short: question.short,
      number,
      type: question.type,
      group: question.group,
      slot: question.slot,
      contextLabel: profile.label,
      contextHint: `Aim for ${mmss(profile.targetSec[0])} to ${mmss(profile.targetSec[1])}.`,
      targetSec: profile.targetSec,
      followUps: follow && followUpLimit("tough", question.type) > 0,
    };
  };
  const common = {
    interviewId: interview.id,
    heading: `${interview.company}, ${interview.role.split(",")[0]}`,
    // Without keys (or a recording), the demo feedback and report are shown: they belong to the Halden demo.
    // The demo is hidden at launch, so don't point anyone at it.
    demoFeedbackHref: isLaunch() ? undefined : `/interviews/${demoMock.interviewId}/answers/${roadmapAnswer.id}`,
    demoReportHref: isLaunch() ? undefined : `/interviews/${demoMock.interviewId}/mocks/${demoMock.id}`,
  };
  const byId = (qid: string) => resolveInterviewQuestion(interview, qid);

  if (sessionId) {
    const found = (await findMockAsync(sessionId)) ?? openSession(interview.id, sessionId);
    const m = found ?? ({
      id: sessionId,
      interviewId: interview.id,
      kind: "interview",
      status: "planned",
      startedAt: new Date().toISOString(),
      finishedAt: "",
      answerIds: [],
      planned: Math.min(5, interview.questions.length),
      questionIds: interview.questions.slice(0, 5).map((x) => x.id),
      spareIds: interview.questions.slice(5).map((x) => x.id),
      style: interview.style,
      settings: { minutes: 20, difficulty: "medium", preset: "balanced", mix: {} },
    } as unknown as import("@/lib/mocks/store").MockRecord);
    if (m.status === "done") redirect(`/interviews/${interview.id}/mocks/${m.id}`);
    if (m.status === "stopped") redirect(`/interviews/${interview.id}`);
    const questions = (m.questionIds ?? []).flatMap((qid) => byId(qid) ?? []);
    if (!questions.length) redirect(`/interviews/${interview.id}`);
    const u = understandingOf(interview);
    const shortOf = (qid: string) => byId(qid)?.short ?? "this question";
    const mode = m.kind === "rerun" ? "rerun" : m.kind === "drill" ? "drill" : "interview";
    const live: LiveSession = { id: m.id, mode, spares: (m.spareIds ?? []).flatMap((qid) => (byId(qid) ? [toLive(byId(qid)!, 0)] : [])) };

    if (mode === "interview" && m.settings) {
      live.minutes = m.settings.minutes;
      live.settingsText = settingsLine(m.settings);
      live.settings = m.settings;
    }
    if (mode === "rerun" && m.rerunOf) {
      const source = findMock(m.rerunOf);
      const rows = source ? rowsFor(source) : [];
      const report = buildReport(rows, interview.interviewer.name);
      live.focus = report.fixes.map((f) => f.title);
      live.before = Object.fromEntries(rows.filter((r) => r.overall != null).map((r) => [r.questionId, r.overall!]));
      live.rerunOfWhen = source ? whenSaid(source.startedAt) : undefined;
      live.settingsText = m.settings ? settingsLine(m.settings) : undefined;
    }
    if (mode === "drill" && m.drill) {
      const d = m.drill;
      const title = drillTitle(d, shortOf, u.technicalLabel);
      live.feedbackEach = true;
      live.drill = { kind: d.kind, title, habit: d.habit };
      if (d.kind === "fix") {
        live.drill.instruction = HABIT_INSTRUCTION[d.habit ?? "lead"];
        live.drill.detail = "Answer it once more with one change. Then a new question on the same skill, to check it sticks.";
        if (d.questionId && d.before != null) live.before = { [d.questionId]: d.before };
      } else if (d.kind === "habit") {
        live.drill.instruction = HABIT_INSTRUCTION[d.habit ?? "lead"];
        live.followUpLimit = 0;
      } else if (d.kind === "category") {
        live.drill.instruction = `${questions.length === 1 ? "A new question" : `${questions.length} new questions`} from ${categoryLabel(d.group ?? "competency", u.technicalLabel)}: ${u.meanings[d.group ?? "competency"]} Feedback after each answer, and ${interview.interviewer.name} gets tougher after a strong one.`;
        live.escalate = true;
      } else if (d.kind === "pay") {
        const stage = payStage(interview.round);
        live.drill.instruction = `Practising for ${PAY_STAGE_LABEL[stage]}. ${interview.interviewer.name} asks what you’re looking for, what you earn now, and pushes back once. Then you ask about the package. Short answers are best here.`;
        live.drill.detail = PAY_TIPS[stage].when;
        live.followUpLimit = 0;
      } else if (d.kind === "pressure") {
        live.drill.instruction = `One question, then three follow-ups that dig deeper. Stay specific: what you did, why, and what changed.`;
        live.followUpLimit = 3;
      } else if (d.kind === "topic") {
        const t = getTopic(d.topic);
        if (t) {
          live.minutes = t.minutes;
          live.drill.topic = t.id;
          live.drill.focusLabel = t.focusLabel;
          live.drill.instruction = t.instruction;
        }
      }
    }
    const style = styleOverride ?? m.style ?? interview.style;
    const sessionRoleTitle =
      mode === "drill"
        ? m.drill?.kind === "topic" && m.drill.topic === "technical"
          ? "Technical interviewer"
          : m.drill?.kind === "category" && m.drill.group === "technical"
            ? "Technical interviewer"
            : live.drill?.focusLabel
              ? `${live.drill.focusLabel} practice`
              : "Focused practice"
        : m.settings?.preset === "technical"
          ? "Technical interviewer"
          : m.settings?.preset === "screening"
            ? "Recruiter"
            : m.settings?.preset === "final"
              ? "Final panel"
              : interview.interviewer.title;
    return (
      <LiveInterview
        {...common}
        interviewer={{ ...interview.interviewer, title: sessionRoleTitle, style }}
        run={{ kind: "session", session: live }}
        questions={questions.map((x, k) => toLive(x, k + 1))}
      />
    );
  }

  const topicSpec = getTopic(topic);
  if (topicSpec) {
    const topicDifficulty = difficultyParam ?? interview.settings?.difficulty ?? difficultyFor(interview.style);
    const lastAsked = await lastAskedMapAsync(interview.id);
    const questions = topicQuestions(topicSpec.id, interview.questions, { difficulty: topicDifficulty, lastAsked });
    if (questions.length) {
      const live: LiveSession = {
        id: `topic_${topicSpec.id}_${topicDifficulty}`,
        mode: "drill",
        minutes: topicSpec.minutes,
        feedbackEach: true,
        spares: [],
        drill: {
          kind: "topic",
          topic: topicSpec.id,
          title: topicSpec.title,
          focusLabel: topicSpec.focusLabel,
          instruction: topicSpec.instruction,
        },
      };
      return (
        <LiveInterview
          {...common}
          interviewer={{
            ...interview.interviewer,
            title: topicSpec.id === "technical" ? "Technical interviewer" : `${topicSpec.focusLabel} practice`,
            style: styleOverride ?? styleFor(topicDifficulty),
          }}
          run={{ kind: "session", session: live }}
          questions={questions.map((x, k) => toLive(x, k + 1))}
        />
      );
    }
  }

  const single = q ? byId(q) : undefined;
  if (single) {
    return <LiveInterview {...common} interviewer={{ ...interview.interviewer, style: styleOverride ?? interview.style }} run={{ kind: "single" }} questions={[toLive(single, 1, followups !== "off")]} />;
  }

  redirect(`/interviews/${interview.id}`);
}
