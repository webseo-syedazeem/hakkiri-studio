import Link from "next/link";
import clsx from "clsx";
import { ButtonLink, Chip, Panel } from "@/components/ui";
import { isDemoInterview, listInterviews } from "@/lib/interviews/store";
import { settingsLine, settingsOr } from "@/lib/interviews/settings";
import { standing } from "@/lib/sessions/server";
import { interviewWhen } from "@/lib/sessions/labels";
import { VERDICT_LABEL } from "@/lib/mocks/report";
import { londonToday } from "@/lib/dates";
import { DraftInterviewCard } from "@/components/interview/DraftInterviewCard";
import { InterviewsHeaderControls } from "@/components/interview/InterviewsHeaderControls";

export const dynamic = "force-dynamic";

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;

/** Your interviews, soonest first, then the demo. */
export default function InterviewsPage() {
  const all = listInterviews(londonToday());
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

      {all.length === 0 && (
        <Panel className="mt-6 max-w-[620px] animate-rise px-6 py-6">
          <h2 className="text-[15px] font-semibold">No interviews yet</h2>
          <p className="mt-1.5 text-sm text-muted">Add the company, the job spec and your CV. Hakkiri builds a realistic interview from them in about two minutes.</p>
          <ButtonLink href="/interviews/new" variant="primary" className="mt-4">
            Set up your first interview
          </ButtonLink>
        </Panel>
      )}

      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
        {all.map((iv, i) => {
          const st = standing(iv);
          const when = interviewWhen(iv.date, londonToday());
          return (
            <Link key={iv.id} href={`/interviews/${iv.id}`} className="group block animate-rise" style={{ animationDelay: `${0.05 * i}s` }}>
              <Panel className="flex gap-4 p-5 transition-shadow group-hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                <span aria-hidden className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[13px] bg-halden text-[22px] font-bold text-[#ddebe5]">
                  {iv.companyInitial}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="truncate text-lg font-semibold tracking-[-0.01em]">{iv.company}</h2>
                    {isDemoInterview(iv.id) && <Chip>Demo</Chip>}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted">
                    {iv.role} · {settingsLine(settingsOr(iv.settings, iv.style))}
                  </div>
                  <div className="mt-3 text-sm">
                    {when.text} {when.rel && <span className="text-muted">({when.rel})</span>}
                  </div>
                  <div className="mt-2 text-[13px] font-semibold">
                    {st.verdict ? <span className={verdictTone[st.verdict]}>{VERDICT_LABEL[st.verdict]}, {st.report?.score?.toFixed(1)}</span> : <span className="text-lilac">Not started</span>}
                    <span className={clsx("font-normal text-muted")}> · {st.freshCount} interview{st.freshCount === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
