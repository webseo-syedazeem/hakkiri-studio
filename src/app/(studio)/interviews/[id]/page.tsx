import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { londonToday } from "@/lib/dates";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { PRESETS, settingsOr } from "@/lib/interviews/settings";
import { interviewWhen, sessionTitle } from "@/lib/sessions/labels";
import { DRILL_TOPICS, getTopicsForInterview } from "@/lib/sessions/topics";
import { isFresh, listMocksAsync, rowsFor } from "@/lib/mocks/store";
import { categoryScores, mockScore } from "@/lib/mocks/report";
import { overviewCategories } from "@/lib/sessions/overview";
import { whenSaid } from "@/lib/format";
import { requirePageUser } from "@/lib/auth/require";
import {
  InterviewOverviewClient,
  type OverviewPracticeItem,
  type OverviewScoreCategory,
  type OverviewStageOption,
} from "@/components/interview/InterviewOverviewClient";

export const dynamic = "force-dynamic";

export default async function InterviewOverview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; rebuilt?: string }>;
}) {
  const user = await requirePageUser();
  const { id } = await params;
  const { new: isNew, rebuilt } = await searchParams;
  const interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
  if (!interview) notFound();

  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const u = understandingOf(interview);
  const settings = {
    ...settingsOr(interview.settings, interview.style),
    minutes: interview.settings?.minutes ?? 10,
  };
  const when = interviewWhen(interview.date, londonToday());
  const src = interview.sources ?? {};

  // The interview's own role and company. Where one wasn't given, the screen says so plainly.
  const roleTitle = interview.role || "this role";
  const companyName = interview.company || "the company";

  const customStages: OverviewStageOption[] = (interview.stages && interview.stages.length > 0)
    ? interview.stages.map((st, idx) => {
        const id = st.id || `stage-${idx + 1}`;
        const label = st.name || `Stage ${idx + 1}`;
        const lName = label.toLowerCase();
        const isPresetScreen = lName.includes("screen") || lName.includes("recruiter");
        const isPresetTech = lName.includes("tech") || lName.includes("case") || lName.includes("code");
        const isPresetFinal = lName.includes("final") || lName.includes("panel") || lName.includes("lead");
        const preset = isPresetScreen ? "screening" : isPresetTech ? "technical" : isPresetFinal ? "final" : "balanced";

        const hasExplicitNext = interview.stages?.some((x) => x.status === "next");
        const isNext = st.status === "next" || (!hasExplicitNext && idx === 0);
        const isCompleted = st.status === "completed";
        const status = isCompleted ? "completed" : isNext ? "next" : "upcoming";
        const subtitle = st.date ? `${st.date}${st.time ? `, ${st.time}` : ""}` : isCompleted ? "Completed" : "Upcoming";

        return {
          id,
          label,
          selectLabel: label,
          titlePhrase: label.toLowerCase(),
          description: `Focus on ${label.toLowerCase()} questions, tailored to ${roleTitle} at ${companyName}.`,
          status,
          subtitle,
          preset,
          mix: PRESETS[preset].mix,
        };
      })
    : [];

  // An interview with no stages of its own gets the four kinds of round to practise. They are choices of what to
  // practise, not a record of the person's process: none is marked as done or given a date.
  const round = (id: string, label: string, description: string, preset: Exclude<keyof typeof PRESETS, "custom">): OverviewStageOption => ({
    id,
    label,
    selectLabel: label,
    titlePhrase: label.toLowerCase(),
    description,
    status: "upcoming",
    subtitle: "Practice round",
    preset,
    mix: PRESETS[preset].mix,
  });
  const practiceRounds: OverviewStageOption[] = [
    round("screening", "Recruiter screen", "Your career story, why this role fits your background, and what you expect from it.", "screening"),
    round("hiring-manager", "Hiring manager interview", "Your experience, the decisions you made and how you work with other people, against what the job asks for.", "balanced"),
    round("technical", "Technical interview", `${u.technicalLabel} depth, practical problem-solving and reasoning about trade-offs.`, "technical"),
    round("final", "Final panel", "Judgement, working across teams, handling pushback and why you want the role.", "final"),
  ];

  const stages = customStages.length > 0 ? customStages : practiceRounds;
  const initialStage = stages.find((s) => s.status === "next") ?? stages[0];
  const initialStageId = initialStage.id;

  const mockSessions = (await listMocksAsync(interview.id, user.id)).filter((m) => m.status !== "planned");
  const recentSessions: OverviewPracticeItem[] = mockSessions.map((m) => {
    const rows = rowsFor(m, user.id);
    const score = mockScore(rows);
    return {
      id: m.id,
      title: sessionTitle(m, interview),
      dateText: whenSaid(m.startedAt),
      score: score != null ? Number(score.toFixed(1)) : null,
      href: `/interviews/${interview.id}/mocks/${m.id}`,
    };
  });

  // Category scores from this person's own interviews with new questions, newest first. Empty until one is scored.
  const fresh = mockSessions.filter((m) => m.status === "done" && isFresh(m)).sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const scoreCategories: OverviewScoreCategory[] = overviewCategories(fresh.map((m) => categoryScores(rowsFor(m, user.id))), u.technicalLabel).map((c) => ({ name: c.name, score: c.score, delta: c.delta }));

  const roleSummary = `${u.role}, ${u.level.toLowerCase()}: ${u.field}`;
  const inputsSummary =
    [src.cv, src.coverLetter, src.job, src.company].filter(Boolean).join(", ") || "No documents on file";

  return (
    <InterviewOverviewClient
      interviewId={interview.id}
      companyName={companyName}
      companyInitial={interview.companyInitial || (interview.company ? interview.company[0].toUpperCase() : "?")}
      roleTitle={roleTitle}
      whenText={when.text}
      whenRel={when.rel}
      micOk={micOk}
      isNew={Boolean(isNew)}
      rebuilt={Boolean(rebuilt)}
      interviewerName={interview.interviewer.name}
      initialSettings={settings}
      initialStageId={initialStageId}
      stages={stages}
      scoreCategories={scoreCategories}
      topics={getTopicsForInterview(interview).map((t) => ({ id: t.id, title: t.title }))}
      roleSummary={roleSummary}
      inputsSummary={inputsSummary}
      initialRecentSessions={recentSessions}
    />
  );
}
