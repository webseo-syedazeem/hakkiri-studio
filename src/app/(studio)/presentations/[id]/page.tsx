import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Icon, Meter, Panel, Sep, toneText } from "@/components/ui";
import { SlideView } from "@/components/pitch/SlideView";
import { getPresentation, isDemoPresentation, listQa, listRuns } from "@/lib/pitch/store";
import { DeleteInterview } from "@/components/interview/DeleteInterview";
import { completeRuns, onTime, pitchReadiness } from "@/lib/pitch/plan";
import { AUDIENCE_LABEL, QA_STYLE_LABEL, runTitle } from "@/lib/pitch/labels";
import { READINESS_LABEL, scoreLabel } from "@/lib/scoring/combine";
import { londonToday } from "@/lib/dates";
import { clock, daysBetween, longDay, minutesLong, mmss, whenSaid } from "@/lib/format";

export const dynamic = "force-dynamic"; // runs change as you rehearse

const MODES = (id: string, qaLabel: string | null, limit: number) => [
  { href: `/rehearse/${id}`, title: "Full run", detail: `Every slide, with timing. ${minutesLong(limit)}.`, primary: true },
  { href: `/rehearse/${id}?mode=opening`, title: "Opening only", detail: "Your first 60 seconds, scored on hook and relevance." },
  { href: `/qa/${id}`, title: "Q&A only", detail: qaLabel ? `${qaLabel} audience, four questions, about 8 minutes.` : "Four questions from the audience, about 8 minutes." },
];

/** A presentation's workspace: readiness, rehearsal modes, the plan, and every run and Q&A so far. */
export default async function PresentationWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPresentation(id);
  if (!p) notFound();
  const runs = listRuns(p.id);
  const qa = listQa(p.id);
  const r = pitchReadiness(p, runs, qa);
  const days = daysBetween(londonToday(), p.date);
  const lastTwo = completeRuns(runs, p.timeLimitSec).slice(-2);

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-halden text-[#ddebe5]">
            <Icon name="present" size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">{p.title}</h1>
            <div className="mt-0.5 text-sm text-muted">
              {AUDIENCE_LABEL[p.audience]}
              <Sep />
              {longDay(p.date)}, {clock(p.date)}
              <Sep />
              {minutesLong(p.timeLimitSec)}
              {days >= 0 && (
                <>
                  <Sep />
                  <b className="font-semibold text-ink">{days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}</b>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {!isDemoPresentation(p.id) && <DeleteInterview id={p.id} company={p.title} kind="presentation" />}
          <ButtonLink href={`/presentations/${p.id}/edit`}>Set-up and timing</ButtonLink>
          <ButtonLink href={`/rehearse/${p.id}`} variant="primary">
            <Icon name="mic" size={16} strokeWidth={2} />
            Start full run, {Math.round(p.timeLimitSec / 60)} min
          </ButtonLink>
        </div>
      </header>

      <Panel aria-label="Readiness" className="mt-6 grid animate-rise grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-8 px-6 py-5 [animation-delay:0.04s]">
        <div>
          <div className="text-[13px] text-muted">Readiness</div>
          <div className={clsx("mt-1 text-xl font-semibold tracking-[-0.015em]", r.ready ? "text-blue-soft" : "text-ink")}>{r.ready ? "Ready for the real thing" : "Not ready yet"}</div>
          <p className="mt-1.5 text-[13px] leading-normal text-muted">Ready when two full runs in a row score 4 or more and finish inside {mmss(p.timeLimitSec)}.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lastTwo.length === 0 && <span className="text-[13px] text-dim">No full runs yet.</span>}
            {lastTwo.map((x) => {
              const good = (x.overall ?? 0) >= 4 && onTime(x, p.timeLimitSec);
              return (
                <Link key={x.id} href={`/presentations/${p.id}/runs/${x.id}`} className={clsx("inline-flex h-[30px] items-center gap-1.5 rounded-[8px] px-2.5 text-xs font-semibold", good ? "bg-blue/15 text-lilac" : "bg-red/12 text-red-soft")}>
                  <Icon name={good ? "check" : "x"} size={13} strokeWidth={2.4} />
                  Run {x.number}: {x.overall?.toFixed(1) ?? "n/a"}, {mmss(x.totalSec)}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          {r.rows.length === 0 && <p className="text-[13px] text-muted">Your scores appear here after your first run: opening, message and ask, timing, and Q&A.</p>}
          {r.rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[130px_1fr_104px] items-center gap-[18px] py-[7px]">
              <span className="text-sm font-medium">{row.label}</span>
              <Meter value={row.score} tone={row.level} label={`${row.label}: ${row.score} out of 5, ${READINESS_LABEL[row.level]}`} />
              <span className={`text-right text-[13px] font-semibold ${toneText[row.level]}`}>{READINESS_LABEL[row.level]}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid min-h-0 grow grid-cols-[minmax(0,1fr)_440px] gap-5">
        <Panel aria-label="Your plan" className="animate-rise px-5 pb-2 pt-4 [animation-delay:0.08s]">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-[15px] font-semibold">Your plan</h2>
            <span className="num text-[13px] text-muted">
              {p.slides.length} slides, {mmss(p.slides.reduce((a, s) => a + s.plannedSec, 0))}
            </span>
          </div>
          <p className="mt-0.5 px-1 text-[13px] text-muted">The point each slide needs to land. Rehearse any slide on its own.</p>
          <ol className="mt-2.5">
            {p.slides.map((s) => (
              <li key={s.n} className="group grid grid-cols-[72px_minmax(0,1fr)_52px_auto] items-center gap-4 border-t border-line px-1 py-2.5">
                <SlideView slide={s} presentationId={p.id} className="w-[72px] rounded-[3px] shadow-[0_0_0_1px_var(--color-line-strong)]" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    <span className="num mr-2 text-dim">{s.n}</span>
                    {s.title}
                    {s.n === p.askSlide && <span className="ml-2 text-xs font-semibold text-blue-soft">Your ask</span>}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted">{s.point}</div>
                </div>
                <span className="num text-right text-sm font-semibold">{mmss(s.plannedSec)}</span>
                <Link href={`/rehearse/${p.id}?from=${s.n}&to=${s.n}`} className="text-[13px] font-semibold text-blue-soft opacity-80 hover:underline group-hover:opacity-100 focus:opacity-100">
                  Rehearse
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel aria-label="Rehearse" className="animate-rise px-5 py-4 [animation-delay:0.1s]">
            <h2 className="text-[15px] font-semibold">Rehearse</h2>
            <div className="mt-2">
              {MODES(p.id, p.qaStyle ? QA_STYLE_LABEL[p.qaStyle] : null, p.timeLimitSec).map((m) => (
                <Link key={m.title} href={m.href} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line py-3 first:border-t-0">
                  <span>
                    <span className="block text-sm font-semibold">{m.title}</span>
                    <span className="block text-[13px] text-muted">{m.detail}</span>
                  </span>
                  <Icon name="play" size={16} className={m.primary ? "text-blue-soft" : "text-muted"} />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel aria-label="Runs" className="animate-rise px-5 py-4 [animation-delay:0.12s]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Runs</h2>
              <span className="text-[13px] text-muted">Score, time and fillers</span>
            </div>
            {runs.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">Nothing yet. Your first full run sets the baseline.</p>
            ) : (
              <div className="mt-2">
                {[...runs].reverse().map((x) => (
                  <Link key={x.id} href={`/presentations/${p.id}/runs/${x.id}`} className="grid grid-cols-[minmax(0,1fr)_52px_72px_48px] items-center gap-3 border-t border-line py-2.5 text-sm first:border-t-0 hover:bg-white/[0.02]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{runTitle(x)}</span>
                      <span className="block text-xs text-muted">{whenSaid(x.startedAt)}</span>
                    </span>
                    <span className={clsx("num text-right", x.mode === "full" && x.totalSec > p.timeLimitSec + 5 ? "text-red-soft" : "text-muted")}>{mmss(x.totalSec)}</span>
                    <span className="num text-right text-xs text-muted" title="Fillers a minute">
                      {x.delivery.fillersPerMinute != null ? `${x.delivery.fillersPerMinute} a min` : `${x.delivery.fillerCount} filler${x.delivery.fillerCount === 1 ? "" : "s"}`}
                    </span>
                    <span className="text-right">
                      <b className={clsx("num font-semibold", (x.overall ?? 5) < 3 && "text-red-soft")}>{x.overall?.toFixed(1) ?? "n/a"}</b>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel aria-label="Q&A" className="animate-rise px-5 py-4 [animation-delay:0.14s]">
            <h2 className="text-[15px] font-semibold">Audience Q&A</h2>
            {qa.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">No Q&A yet. {p.qaStyle ? `Your audience is set to ${QA_STYLE_LABEL[p.qaStyle].toLowerCase()}.` : ""}</p>
            ) : (
              <div className="mt-2">
                {[...qa].reverse().map((s) => (
                  <Link key={s.id} href={`/presentations/${p.id}/qa/${s.id}`} className="grid grid-cols-[minmax(0,1fr)_68px] items-center gap-3 border-t border-line py-2.5 text-sm first:border-t-0 hover:bg-white/[0.02]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {s.persona.name}, {s.persona.title}
                      </span>
                      <span className="block text-xs text-muted">
                        {QA_STYLE_LABEL[s.style]}, {s.answers.length} questions · {whenSaid(s.startedAt)}
                      </span>
                    </span>
                    <span className="text-right">
                      <b className="num font-semibold">{s.overall?.toFixed(1) ?? "n/a"}</b> <span className="text-xs text-muted">{s.overall != null ? scoreLabel(s.overall) : ""}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
