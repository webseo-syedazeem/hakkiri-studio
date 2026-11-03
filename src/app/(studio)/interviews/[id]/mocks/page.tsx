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

export const dynamic = "force-dynamic";

export default async function PastSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = getInterview(id);
  if (!interview) notFound();
  const sessions = listMocks(interview.id).filter((m) => m.status !== "planned");
  const started = sessions.some(isFresh);

  return (
    <div className="flex grow flex-col gap-6">
      <header className="flex animate-rise flex-wrap items-end justify-between gap-6">
        <div>
          <Crumbs items={[{ label: `${interview.company} Pipeline`, href: `/interviews/${interview.id}` }, { label: "Evaluation History" }]} />
          <h1 className="mt-2 text-[32px] font-extrabold tracking-tight text-ink">Evaluation History</h1>
          <p className="mt-1 text-sm text-muted">Recorded interviews, targeted drills, and re-runs for {interview.role}.</p>
        </div>
        <ButtonLink href={`/interviews/${interview.id}#new-questions`} variant="primary" size="md">
          <Icon name="mic" size={16} strokeWidth={2} />
          <span>{started ? "Start New Questions" : "Start Interview"}</span>
        </ButtonLink>
      </header>

      <InterviewTabs id={interview.id} current="mocks" prepReady={started} />

      <Panel aria-label="Past sessions" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
        {sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">
            <Icon name="repeat" size={24} className="mx-auto text-dim mb-2" />
            <p className="font-semibold text-ink">No recorded sessions yet</p>
            <p className="text-xs text-muted mt-1">Your practice runs and question drills will appear here along with full AI analytical reports.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(0,1.2fr)_200px_110px_140px] items-center gap-4 border-b border-white/[0.08] pb-3 text-xs font-bold uppercase tracking-wider text-muted">
              <span>Session & Setting</span>
              <span>Questions & Follow-ups</span>
              <span>Duration</span>
              <span className="text-right">Evaluation</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {sessions.map((m) => {
                const rows = rowsFor(m);
                const score = mockScore(rows);
                const followUps = rows.reduce((n, r) => n + r.followUps.length, 0);
                const stopped = m.status === "stopped";

                return (
                  <Link
                    key={m.id}
                    href={`/interviews/${interview.id}/mocks/${m.id}`}
                    className="grid grid-cols-[minmax(0,1.2fr)_200px_110px_140px] items-center gap-4 py-4 text-sm transition-colors hover:bg-white/[0.03] group rounded-xl px-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink group-hover:text-blue-soft transition-colors truncate">
                          {sessionTitle(m, interview)}
                        </span>
                        {m.kind !== "drill" && !isFresh(m) && !stopped && (
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted">
                            Practice Re-run
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {[sessionSettingsText(m), whenSaid(m.startedAt)].filter(Boolean).join(" · ")}
                      </div>
                    </div>

                    <div className="text-xs text-muted">
                      {stopped ? <span className="text-amber-400">Stopped: rebuilt</span> : countsLine(rows.length, followUps)}
                    </div>

                    <div className="num font-mono text-xs text-muted">
                      {stopped ? "—" : minutesLong((Date.parse(m.finishedAt) - Date.parse(m.startedAt)) / 1000)}
                    </div>

                    <div className="text-right">
                      {stopped ? (
                        <span className="text-xs text-dim">Incomplete</span>
                      ) : score != null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue/10 px-2.5 py-1 text-xs font-bold text-blue-soft border border-blue/20">
                          <span className="font-mono text-sm">{score.toFixed(1)}</span>
                          <span className="text-[11px] font-medium text-ink/80">{scoreLabel(score)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-dim">Pending</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
