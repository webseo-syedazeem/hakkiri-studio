import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { londonToday } from "@/lib/dates";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { PRESETS, settingsOr } from "@/lib/interviews/settings";
import { interviewWhen } from "@/lib/sessions/labels";
import { DRILL_TOPICS } from "@/lib/sessions/topics";
import { requirePageUser } from "@/lib/auth/require";
import {
  InterviewOverviewClient,
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

  const roleTitle = interview.role || "Senior Product Manager, Payments";
  const companyName = interview.company || "Halden";
  const isPaymentsRole = /payment|fintech|checkout|halden/i.test(`${companyName} ${roleTitle}`);

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

  const defaultHaldenStages: OverviewStageOption[] = [
    {
      id: "screening",
      label: "Recruiter screen",
      selectLabel: "Recruiter screen",
      titlePhrase: "recruiter screen",
      description:
        "Focus on your career story, why this role fits your background, and clear alignment on scope and expectations.",
      status: "completed",
      subtitle: "Completed",
      preset: "screening",
      mix: PRESETS.screening.mix,
    },
    {
      id: "hiring-manager",
      label: "Hiring manager",
      selectLabel: "Hiring manager interview",
      titlePhrase: "hiring manager",
      description: isPaymentsRole
        ? "Focus on your experience, product decisions and stakeholder management, with payments-related trade-offs."
        : "Focus on your experience, role decisions and stakeholder management, tailored to the job requirements.",
      status: "next",
      subtitle: when.text || "Fri 13 Nov, 10:00",
      preset: "balanced",
      mix: PRESETS.balanced.mix,
    },
    {
      id: "technical",
      label: "Technical interview",
      selectLabel: "Technical interview",
      titlePhrase: "technical interview",
      description: isPaymentsRole
        ? "Focus on payments architecture, authorisation metrics, fraud vs conversion trade-offs and technical depth."
        : `Focus on ${u.technicalLabel.toLowerCase()} depth, practical problem-solving and system or trade-off reasoning.`,
      status: "upcoming",
      subtitle: "Upcoming",
      preset: "technical",
      mix: PRESETS.technical.mix,
    },
    {
      id: "final",
      label: "Final panel",
      selectLabel: "Final panel",
      titlePhrase: "final panel",
      description:
        "Focus on senior judgement, cross-functional leadership, handling executive pushback and long-term motivation.",
      status: "upcoming",
      subtitle: "Upcoming",
      preset: "final",
      mix: PRESETS.final.mix,
    },
  ];

  const stages = customStages.length > 0 ? customStages : defaultHaldenStages;
  const initialStage = stages.find((s) => s.status === "next") ?? stages[0];
  const initialStageId = initialStage.id;

  const scoreCategories: OverviewScoreCategory[] = interview.id === "halden"
    ? [
        { name: "Experience", score: 4.0, delta: "+0.4", positive: true, tone: "purple" },
        { name: "Skills", score: 3.4, delta: "+0.2", positive: true, tone: "purple" },
        { name: "Technical", score: 2.5, delta: "-0.3", positive: false, tone: "red" },
        { name: "Motivation", score: 4.4, delta: "+0.3", positive: true, tone: "purple" },
        { name: "Situational", score: 3.1, delta: "+0.2", positive: true, tone: "purple" },
      ]
    : [];

  const roleSummary = `${u.role}, ${u.level.toLowerCase()}: ${u.field}`;
  const inputsSummary =
    [src.cv, src.coverLetter, src.job, src.company].filter(Boolean).join(", ") || "CV and job description";

  return (
    <InterviewOverviewClient
      interviewId={interview.id}
      companyName={companyName}
      companyInitial={interview.companyInitial || companyName[0] || "H"}
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
      topics={Object.values(DRILL_TOPICS).map((t) => ({ id: t.id, title: t.title }))}
      roleSummary={roleSummary}
      inputsSummary={inputsSummary}
    />
  );
}
