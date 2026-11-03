import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Meter, Panel, Sep, toneText } from "@/components/ui";
import { SlideView } from "@/components/pitch/SlideView";
import { getPresentation, isDemoPresentation, listQa, listRuns } from "@/lib/pitch/store";
import { DeleteInterview } from "@/components/interview/DeleteInterview";
import { completeRuns, onTime, pitchReadiness } from "@/lib/pitch/plan";
import { AUDIENCE_LABEL, QA_STYLE_LABEL, runTitle } from "@/lib/pitch/labels";
import { READINESS_LABEL, scoreLabel } from "@/lib/scoring/combine";
import { londonToday } from "@/lib/dates";
import { clock, daysBetween, longDay, minutesLong, mmss, whenSaid } from "@/lib/format";

export const dynamic = "force-dynamic";

const MODES = (id: string, qaLabel: string | null, limit: number) => [
  { href: `/rehearse/${id}`, title: "Full Rehearsal Run", detail: `Every slide against strict time budget. ${minutesLong(limit)}.`, primary: true },
  { href: `/rehearse/${id}?mode=opening`, title: "Hook & Opening Only", detail: "First 60 seconds scored on message clarity and audience grab." },
  { href: `/qa/${id}`, title: "Simulated Audience Q&A", detail: qaLabel ? `${qaLabel} executive panel, 4 pushback questions, ~8 min.` : "4 questions from the room, ~8 min." },
];

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
    <div className="flex grow flex-col gap-6 pb-10">
      {/* Top Header */}
      <header className="flex animate-rise flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-halden to-[#132420] text-[#ddebe5] shadow-inner">
            <Icon name="present" size={26} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[30px] font-extrabold tracking-tight text-ink">{p.title}</h1>
              {isDemoPresentation(p.id) && <Chip tone="blue">Key Rehearsal</Chip>}
            </div>
            <div className="mt-1 flex flex-wrap items-center text-sm text-muted">
              <span className="font-semibold text-ink/90">{AUDIENCE_LABEL[p.audience]}</span>
              <Sep />
              <span>{longDay(p.date)}, {clock(p.date)}</span>
              <Sep />
              <span>{minutesLong(p.timeLimitSec)} budget</span>
              {days >= 0 && (
                <>
                  <Sep />
                  <span className="rounded-full bg-blue/15 px-2 py-0.5 text-xs font-bold text-blue-soft">
                    {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isDemoPresentation(p.id) && <DeleteInterview id={p.id} company={p.title} kind="presentation" />}
          <ButtonLink href={`/presentations/${p.id}/edit`} variant="secondary">
            Settings & Timing
          </ButtonLink>
          <ButtonLink href={`/rehearse/${p.id}`} variant="primary" size="md" className="shadow-lg">
            <Icon name="mic" size={16} strokeWidth={2.2} />
            <span>Start Full Run ({Math.round(p.timeLimitSec / 60)} min)</span>
          </ButtonLink>
        </div>
      </header>

      {/* Readiness Overview Panel */}
      <Panel aria-label="Readiness" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Presentation Readiness</span>
              <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-bold", r.ready ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-400/15 text-amber-400")}>
                {r.ready ? "Executive Ready" : "In Progress"}
              </span>
            </div>
            <div className={clsx("mt-2 text-2xl font-extrabold tracking-tight", r.ready ? "text-blue-soft" : "text-ink")}>
              {r.ready ? "Ready for the room" : "Pacing & Delivery Need Calibration"}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted max-w-md">
              Target requirement: Two consecutive full rehearsal runs scoring 4.0+ overall while finishing within {mmss(p.timeLimitSec)}.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {lastTwo.length === 0 && <span className="text-xs text-dim">No complete runs logged yet.</span>}
              {lastTwo.map((x) => {
                const good = (x.overall ?? 0) >= 4 && onTime(x, p.timeLimitSec);
                return (
                  <Link
                    key={x.id}
                    href={`/presentations/${p.id}/runs/${x.id}`}
                    className={clsx(
                      "inline-flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-bold border transition-colors",
                      good ? "bg-blue/15 text-blue-soft border-blue/30" : "bg-red/10 text-red-soft border-red/20"
                    )}
                  >
                    <Icon name={good ? "check" : "x"} size={13} strokeWidth={2.4} />
                    <span>Run {x.number}: {x.overall?.toFixed(1) ?? "n/a"} ({mmss(x.totalSec)})</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {r.rows.length === 0 && (
              <p className="text-xs text-muted">Detailed scoring meters for Opening, Core Message, Timing, and Audience Q&A appear after your first run.</p>
            )}
            {r.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[130px_1fr_95px] items-center gap-4 rounded-xl bg-booth/50 p-2.5 border border-white/[0.04]">
                <span className="text-xs font-bold text-ink truncate">{row.label}</span>
                <Meter value={row.score} tone={row.level} label={`${row.label}: ${row.score} out of 5`} />
                <span className={`text-right text-xs font-mono font-bold ${toneText[row.level]}`}>
                  {row.score.toFixed(1)} <span className="text-[10px] uppercase font-sans">{READINESS_LABEL[row.level]}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid min-h-0 grow grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Left Column: Slide Plan & Outline */}
        <Panel aria-label="Your plan" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Slide Narrative Plan & Pacing</h2>
              <p className="mt-0.5 text-xs text-muted">The core takeaway and planned time target for each individual slide.</p>
            </div>
            <span className="num font-mono text-xs font-bold text-muted">
              {p.slides.length} slides · {mmss(p.slides.reduce((a, s) => a + s.plannedSec, 0))} total
            </span>
          </div>

          <ol className="mt-4 divide-y divide-white/[0.06]">
            {p.slides.map((s) => (
              <li key={s.n} className="group grid grid-cols-[80px_minmax(0,1fr)_60px_auto] items-center gap-4 py-3.5 transition-colors hover:bg-white/[0.02] rounded-xl px-2">
                <SlideView slide={s} presentationId={p.id} className="w-[80px] rounded-lg border border-white/10 shadow-sm" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink">
                    <span className="num font-mono mr-2 text-dim">{s.n}.</span>
                    {s.title}
                    {s.n === p.askSlide && (
                      <span className="ml-2 rounded bg-blue/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-soft border border-blue/20">
                        The Ask
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">{s.point}</div>
                </div>
                <span className="num font-mono text-right text-xs font-bold text-ink/80">{mmss(s.plannedSec)}</span>
                <Link
                  href={`/rehearse/${p.id}?from=${s.n}&to=${s.n}`}
                  className="rounded-lg bg-panel-2 px-2.5 py-1 text-xs font-semibold text-blue-soft hover:bg-blue-fill hover:text-white transition-colors"
                >
                  Drill
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Right Column: Rehearsal Modes & Run History */}
        <div className="flex min-w-0 flex-col gap-6">
          <Panel aria-label="Rehearse" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-base font-bold text-ink border-b border-white/[0.08] pb-3">Rehearsal Modes</h2>
            <div className="mt-3 divide-y divide-white/[0.06]">
              {MODES(p.id, p.qaStyle ? QA_STYLE_LABEL[p.qaStyle] : null, p.timeLimitSec).map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-white/[0.02] rounded-xl px-2 group"
                >
                  <div>
                    <span className="block text-xs font-bold text-ink group-hover:text-blue-soft transition-colors">{m.title}</span>
                    <span className="block text-[11px] text-muted mt-0.5">{m.detail}</span>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panel-2 group-hover:bg-blue-fill group-hover:text-white transition-colors">
                    <Icon name="play" size={13} className={m.primary ? "text-blue-soft group-hover:text-white" : "text-muted group-hover:text-white"} />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel aria-label="Runs" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-ink">Recorded Runs</h2>
              <span className="text-xs text-muted">Timing & Fillers</span>
            </div>

            {runs.length === 0 ? (
              <p className="mt-3 text-xs text-muted">No runs logged yet. Launch a full rehearsal to establish your pacing baseline.</p>
            ) : (
              <div className="mt-2 divide-y divide-white/[0.06]">
                {[...runs].reverse().map((x) => (
                  <Link
                    key={x.id}
                    href={`/presentations/${p.id}/runs/${x.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-xs transition-colors hover:bg-white/[0.02] rounded-xl px-2 group"
                  >
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-ink group-hover:text-blue-soft transition-colors">{runTitle(x)}</span>
                      <span className="block text-[11px] text-muted">{whenSaid(x.startedAt)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <span className={clsx("num font-mono font-bold", x.mode === "full" && x.totalSec > p.timeLimitSec + 5 ? "text-red-soft" : "text-ink")}>
                        {mmss(x.totalSec)}
                      </span>
                      <span className="rounded-md bg-blue/10 px-2 py-0.5 font-mono font-bold text-blue-soft">
                        {x.overall?.toFixed(1) ?? "n/a"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel aria-label="Q&A" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-ink">Audience Q&A Rounds</h2>
              <span className="text-xs text-muted">{p.qaStyle ? QA_STYLE_LABEL[p.qaStyle] : "Simulated"}</span>
            </div>

            {qa.length === 0 ? (
              <p className="mt-3 text-xs text-muted">No Q&A rounds completed yet.</p>
            ) : (
              <div className="mt-2 divide-y divide-white/[0.06]">
                {[...qa].reverse().map((s) => (
                  <Link
                    key={s.id}
                    href={`/presentations/${p.id}/qa/${s.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-xs transition-colors hover:bg-white/[0.02] rounded-xl px-2 group"
                  >
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-ink group-hover:text-blue-soft transition-colors">
                        {s.persona.name} ({s.persona.title})
                      </span>
                      <span className="block text-[11px] text-muted">
                        {s.answers.length} questions answered · {whenSaid(s.startedAt)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-md bg-blue/10 px-2 py-0.5 font-mono font-bold text-blue-soft">
                        {s.overall?.toFixed(1) ?? "n/a"}
                      </span>
                    </div>
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
