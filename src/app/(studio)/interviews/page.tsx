import { isDemoInterview, listInterviewsAsync } from "@/lib/interviews/store";
import { settingsLine, settingsOr } from "@/lib/interviews/settings";
import { standing } from "@/lib/sessions/server";
import { interviewWhen } from "@/lib/sessions/labels";
import { VERDICT_LABEL } from "@/lib/mocks/report";
import { londonToday } from "@/lib/dates";
import { DraftInterviewCard } from "@/components/interview/DraftInterviewCard";
import { InterviewsHeaderControls } from "@/components/interview/InterviewsHeaderControls";
import { InterviewsGrid } from "@/components/interview/InterviewsGrid";

export const dynamic = "force-dynamic";

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;

/** Your interviews, soonest first, then the demo. */
export default async function InterviewsPage() {
  const all = await listInterviewsAsync(londonToday());
  const serialized = all.map((iv) => {
    const st = standing(iv);
    const when = interviewWhen(iv.date, londonToday());
    return {
      id: iv.id,
      company: iv.company,
      companyInitial: iv.companyInitial,
      role: iv.role,
      isDemo: isDemoInterview(iv.id),
      settingsLine: settingsLine(settingsOr(iv.settings, iv.style)),
      whenText: when.text,
      whenRel: when.rel,
      verdictLabel: st.verdict ? VERDICT_LABEL[st.verdict] : "Not started",
      verdictScore: st.report?.score,
      verdictTone: st.verdict ? verdictTone[st.verdict] : "text-lilac",
      freshCount: st.freshCount,
    };
  });

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Interviews</h1>
          <p className="mt-1 text-[15px] text-muted">One for each job you’re going for, built from the company, the job spec and your CV.</p>
        </div>
        <InterviewsHeaderControls />
      </header>

      {/* In-progress Saved Draft Card */}
      <DraftInterviewCard />

      {/* Dynamic Grid merging server interviews with client-created interviews */}
      <InterviewsGrid initialInterviews={serialized} />
    </div>
  );
}
