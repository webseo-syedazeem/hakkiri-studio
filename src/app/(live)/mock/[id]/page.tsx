import { notFound, redirect } from "next/navigation";
import { LiveInterview, type LiveQuestion, type LiveSession } from "@/components/live/LiveInterview";

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
import { requirePageUser } from "@/lib/auth/require";
import { mockAiEnabled } from "@/lib/ai/mock";

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
  searchParams: Promise<{
    q?: string;
    followups?: string;
    session?: string;
    topic?: string;
    difficulty?: string;
    practice?: string;
    type?: string;
    duration?: string;
    next?: string;
  }>;
}) {
  const user = await requirePageUser();
  const { id } = await params;
  const { q, followups, session: sessionId, topic, difficulty, practice, type, duration, next } = await searchParams;
  const difficultyParam =
    difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? (difficulty as Difficulty) : null;
  const styleOverride = difficultyParam ? styleFor(difficultyParam) : null;
  const interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
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
    testMode: mockAiEnabled(),
  };
  const byId = (qid: string) => resolveInterviewQuestion(interview, qid);

  if (sessionId) {
    const found = (await findMockAsync(sessionId, user.id)) ?? openSession(interview.id, sessionId, user.id);
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
    const questions = (m.questionIds ?? [])
      .flatMap((qid) => byId(qid) ?? [])
      .filter((q) => q.slot !== "closing" && q.type !== "questions-for-us" && !/what questions do you have for/i.test(q.text));
    if (!questions.length) redirect(`/interviews/${interview.id}`);
    const u = understandingOf(interview);
    const shortOf = (qid: string) => byId(qid)?.short ?? "this question";
    const mode = m.kind === "rerun" ? "rerun" : m.kind === "drill" ? "drill" : "interview";
    const live: LiveSession = {
      id: m.id,
      mode,
      spares: (m.spareIds ?? [])
        .flatMap((qid) => (byId(qid) ? [toLive(byId(qid)!, 0)] : []))
        .filter((q) => q.slot !== "closing" && q.type !== "questions-for-us" && !/what questions do you have for/i.test(q.text)),
    };

    if (mode === "interview" && m.settings) {
      live.minutes = m.settings.minutes;
      live.settingsText = settingsLine(m.settings);
      live.settings = m.settings;
    }
    if (mode === "rerun" && m.rerunOf) {
      const source = findMock(m.rerunOf, user.id);
      const rows = source ? rowsFor(source, user.id) : [];
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

  // 1-Question Focused Practice Mode (from Practice Hub or practice links)
  const isSinglePractice = practice === "1" || duration === "1-question" || Boolean(q) || next === "1";
  if (isSinglePractice) {
    let targetQuestion: Question | undefined;
    if (q) {
      targetQuestion = byId(q);
    } else if (type || topic) {
      const topicSpec = topic ? getTopic(topic) : undefined;
      const topicDifficulty = difficultyParam ?? interview.settings?.difficulty ?? difficultyFor(interview.style);
      const lastAsked = await lastAskedMapAsync(interview.id, user.id);
      let candidates: Question[] = [];
      if (topicSpec) {
        candidates = topicQuestions(topicSpec.id, interview.questions, { difficulty: topicDifficulty, lastAsked, limit: 4 });
      }

      if (type) {
        const typeCandidates = (candidates.length ? candidates : interview.questions).filter((item) => {
          if (item.slot) return false;
          if (type === "strengths") return item.type === "strengths" || /\bstrengths?\b/i.test(`${item.text} ${item.short}`);
          if (type === "competency") return item.type === "competency" || item.group === "competency";
          if (type === "technical") return item.type === "technical" || item.group === "technical";
          if (type === "situational") return item.type === "situational" || (item.group === "curveball" && item.type !== "strengths");
          if (type === "motivation") return (item.type === "why-us" || item.group === "motivation") && !item.slot;
          if (type === "experience") return item.group === "cv";
          return true;
        });
        if (typeCandidates.length > 0) {
          const unasked = typeCandidates.filter((x) => !lastAsked.has(x.id));
          const pool = unasked.length > 0 ? unasked : typeCandidates;
          const matchingDiff = pool.find((x) => x.difficulty === topicDifficulty);
          targetQuestion = matchingDiff ?? pool[Math.floor(Math.random() * pool.length)];
        }
      }

      if (!targetQuestion && candidates.length > 0) {
        targetQuestion = candidates[0];
      }
    } else if (next === "1") {
      const nonSlot = interview.questions.filter((item) => !item.slot);
      const pool = nonSlot.length > 0 ? nonSlot : interview.questions;
      targetQuestion = pool[Math.floor(Math.random() * pool.length)] ?? interview.questions[0];
    }

    if (!targetQuestion) {
      if (type === "strengths") {
        targetQuestion = interview.questions.find((q) => q.type === "strengths" || (q.group === "curveball" && !q.slot)) ?? getTopic("civil-service-strengths")?.questions[0];
      } else {
        const substantive = interview.questions.filter((q) => !q.slot);
        targetQuestion = substantive[0] ?? interview.questions[0];
      }
    }

    if (targetQuestion) {
      const topicSpec = topic ? getTopic(topic) : undefined;
      const interviewerTitle =
        type === "strengths"
          ? "Strengths practice"
          : type === "motivation"
          ? "Motivation practice"
          : type === "experience"
          ? "Experience practice"
          : topicSpec?.id === "technical"
          ? "Technical interviewer"
          : topicSpec
          ? `${topicSpec.focusLabel} practice`
          : `${interview.company} practice`;

      // Gather spares for skipping: same category/topic first, then other questions
      const matchingSpares = interview.questions.filter((item) => {
        if (item.id === targetQuestion?.id) return false;
        if (type === "strengths") return item.type === "strengths" || /strength/i.test(`${item.text} ${item.short}`);
        if (type === "competency") return item.type === "competency" || item.group === "competency";
        if (type === "technical") return item.type === "technical" || item.group === "technical";
        if (type === "situational") return item.type === "situational" || (item.group === "curveball" && item.type !== "strengths");
        if (type === "motivation") return item.type === "why-us" || item.type === "tell-me-about-yourself" || item.group === "motivation";
        if (type === "experience") return item.group === "cv";
        return false;
      });
      const otherSpares = interview.questions.filter(
        (item) => item.id !== targetQuestion?.id && item.slot !== "closing" && item.type !== "questions-for-us" && !matchingSpares.some((s) => s.id === item.id)
      );
      const orderedSpares = [...matchingSpares, ...otherSpares];

      return (
        <LiveInterview
          {...common}
          interviewer={{
            ...interview.interviewer,
            title: interviewerTitle,
            style: styleOverride ?? styleFor(difficultyParam ?? "medium"),
          }}
          run={{ kind: "single" }}
          questions={[toLive(targetQuestion, 1, followups !== "off")]}
          spares={orderedSpares.map((q, i) => toLive(q, i + 2, followups !== "off"))}
        />
      );
    }
  }

  const topicSpec = getTopic(topic);
  if (topicSpec) {
    const topicDifficulty = difficultyParam ?? interview.settings?.difficulty ?? difficultyFor(interview.style);
    const lastAsked = await lastAskedMapAsync(interview.id, user.id);
    const questions = topicQuestions(topicSpec.id, interview.questions, { difficulty: topicDifficulty, lastAsked });
    if (questions.length) {
      const remainingQuestions = interview.questions.filter((q) => !questions.some((x) => x.id === q.id));
      const live: LiveSession = {
        id: `topic_${topicSpec.id}_${topicDifficulty}`,
        mode: "drill",
        minutes: topicSpec.minutes,
        feedbackEach: true,
        spares: remainingQuestions.map((q, i) => toLive(q, i + questions.length + 1)),
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
