import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Crumbs, Icon, Panel } from "@/components/ui";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { getInterview } from "@/lib/interviews/store";
import { isFresh, listMocks, rowsFor } from "@/lib/mocks/store";
import { countsLine, mockScore } from "@/lib/mocks/report";
import { sessionSettingsText, sessionTitle } from "@/lib/sessions/labels";
import { scoreLabel } from "@/lib/scoring/combine";
import { minutesLong, whenSaid } from "@/lib/format";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

/** Every interview, re-run and drill for this job, newest first. */
export default async function PastSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const interview = getInterview(id, user.id);
  if (!interview) notFound();
  const sessions = listMocks(interview.id, user.id).filter((m) => m.status !== "planned");
  const started = sessions.some(isFresh);

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-end justify-between gap-8">
        <div>
          <Crumbs items={[{ label: `${interview.company} interview`, href: `/interviews/${interview.id}` }, { label: "Past interviews" }]} />
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Past interviews</h1>
          <p className="mt-1 text-sm text-muted">Interviews, re-runs and drills. Only interviews with new questions count towards your verdict.</p>
        </div>
        <ButtonLink href={`/interviews/${interview.id}#new-questions`} variant="primary">
          <Icon name="mic" size={16} strokeWidth={2} />
          {started ? "New questions" : "Start interview"}
        </ButtonLink>
      </header>
      <InterviewTabs id={interview.id} current="mocks" prepReady={started} />

      <Panel aria-label="Past sessions" className="mt-5 animate-rise px-5 pb-1.5 pt-3 [animation-delay:0.05s]">
        {sessions.length === 0 && <p className="px-1 py-3.5 text-sm text-muted">Nothing yet. Your interviews, re-runs and drills appear here, each with its report.</p>}
        {sessions.map((m, k) => {
          const rows = rowsFor(m);
          const score = mockScore(rows);
          const followUps = rows.reduce((n, r) => n + r.followUps.length, 0);
          const stopped = m.status === "stopped";
          return (
            <Link
              key={m.id}
              href={`/interviews/${interview.id}/mocks/${m.id}`}
              className={clsx("grid grid-cols-[minmax(0,1fr)_220px_110px_150px] items-center gap-4 rounded-md px-1 py-3.5 text-sm hover:bg-white/[0.03]", k > 0 && "border-t border-line")}
            >
              <span className="min-w-0 truncate">
                <span className="font-semibold">{sessionTitle(m, interview)}</span>
                {m.kind !== "drill" && !isFresh(m) && !stopped && <span className="ml-2 text-xs text-dim">doesn’t count towards your verdict</span>}
                <span className="ml-3 text-muted">{[sessionSettingsText(m), whenSaid(m.startedAt)].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="text-muted">{stopped ? "Stopped: rebuilt" : countsLine(rows.length, followUps)}</span>
              <span className="num text-muted">{stopped ? "" : minutesLong((Date.parse(m.finishedAt) - Date.parse(m.startedAt)) / 1000)}</span>
              <span className="text-right">
                {stopped ? (
                  <span className="text-dim">Not scored</span>
                ) : score != null ? (
                  <>
                    <b className={clsx("num font-semibold", score < 3 && "text-red-soft")}>{score.toFixed(1)}</b> <span className="text-muted">{scoreLabel(score)}</span>
                  </>
                ) : (
                  <span className="text-dim">Not scored</span>
                )}
              </span>
            </Link>
          );
        })}
      </Panel>
    </div>
  );
}
