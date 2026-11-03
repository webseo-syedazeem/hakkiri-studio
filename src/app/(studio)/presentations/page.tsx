import Link from "next/link";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Panel, Sep } from "@/components/ui";
import { SlideView } from "@/components/pitch/SlideView";
import { listPresentations, listQa, listRuns } from "@/lib/pitch/store";
import { pitchReadiness } from "@/lib/pitch/plan";
import { AUDIENCE_LABEL } from "@/lib/pitch/labels";
import { londonToday } from "@/lib/dates";
import { clock, daysBetween, longDay } from "@/lib/format";
import { demoPresentation, demoRuns } from "@/lib/pitch/demo";

export const dynamic = "force-dynamic";

const PLANNED = [30, 60, 45, 60, 60, 60, 60, 30, 45, 45, 45, 60];
const ACTUAL = [32, 75, 40, 160, 70, 65, 50, 25, 50, 55, 48, 10];

export default function PresentationsPage() {
  const all = listPresentations();

  return (
    <div className="flex grow flex-col gap-7 pb-10">
      {/* Top Header */}
      <header className="flex animate-rise flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Icon name="present" size={14} className="text-lilac" />
            <span>Executive Pitch Suite</span>
          </div>
          <h1 className="mt-1 text-[32px] font-extrabold tracking-tight text-ink">Presentations & Pitches</h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-muted">
            Rehearse slide-by-slide against strict time budgets, diagnose speaking overruns, and simulate tough executive Q&A.
          </p>
        </div>
        <ButtonLink href="/presentations/new" variant="primary" size="md" className="shadow-lg">
          <Icon name="plus" size={16} strokeWidth={2.4} />
          <span>New Presentation Deck</span>
        </ButtonLink>
      </header>

      {/* KPI Overview Banner across full desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-rise [animation-delay:0.05s]">
        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Active Decks</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">{all.length}</span>
            <span className="text-xs text-lilac">In rehearsal</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Time Target</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">10:00</span>
            <span className="text-xs text-muted">min maximum</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Pacing Diagnosis</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-soft">+1:20</span>
            <span className="text-xs text-red-soft/80">Slide 4 ran long</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Rehearsal History</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">3 Runs</span>
            <span className="text-xs text-emerald-400">Improving cadence</span>
          </div>
        </div>
      </div>

      {/* Main Desktop Grid */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left Primary Column */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-ink">Active Pitch Decks</span>
              <span className="rounded-full bg-lilac/15 px-2.5 py-0.5 text-xs font-semibold text-lilac">
                {all.length} Ready
              </span>
            </div>
            <div className="text-xs text-muted">
              Slide pacing and timing telemetry enabled
            </div>
          </div>

          {all.map((p, i) => {
            const runs = listRuns(p.id);
            const r = pitchReadiness(p, runs, listQa(p.id));
            const days = daysBetween(londonToday(), p.date);

            return (
              <Panel
                key={p.id}
                className="pro-card animate-slide-up rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    <SlideView
                      slide={p.slides[0]}
                      presentationId={p.id}
                      className="w-[190px] rounded-xl border border-white/15 shadow-lg"
                      showNumber={false}
                    />
                    <div className="mt-2 text-center text-[11px] font-semibold text-muted">
                      Slide 1 of {p.slides.length}
                    </div>
                  </div>

                  <div className="min-w-0 grow">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/presentations/${p.id}`}
                            className="text-xl font-bold tracking-tight text-ink hover:text-blue-soft transition-colors"
                          >
                            {p.title}
                          </Link>
                          <Chip tone="blue">Key Rehearsal</Chip>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                          <span className="font-semibold text-ink">{AUDIENCE_LABEL[p.audience]}</span>
                          <Sep />
                          <span>{Math.round(p.timeLimitSec / 60)} min limit</span>
                          <Sep />
                          <span>{p.slides.length} slides</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={clsx("text-sm font-bold", r.statusTone === "red" ? "text-red-soft" : "text-lilac")}>
                          {r.status}
                        </div>
                        <div className="text-xs text-muted">
                          {runs.length} rehearsal run{runs.length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    {/* Date Pill */}
                    <div className="mt-3.5 flex items-center gap-2 text-xs text-muted">
                      <Icon name="cal" size={13} className="text-blue-soft" />
                      <span>{longDay(p.date)}, {clock(p.date)}</span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-bold text-ink">
                        {days < 0 ? "done" : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
                      </span>
                    </div>

                    {/* Slide Pacing Breakdown Bar */}
                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-booth/70 p-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted">Slide Pacing Heatmap (Run 3)</span>
                        <span className="text-red-soft font-bold text-[11px]">Slide 4: +1:40 over budget</span>
                      </div>
                      <div className="mt-2.5 flex gap-1 h-3 rounded overflow-hidden" aria-hidden>
                        {PLANNED.map((pl, idx) => (
                          <span
                            key={idx}
                            title={`Slide ${idx + 1}: ${ACTUAL[idx]}s (budget: ${pl}s)`}
                            className={clsx(
                              "rounded-[2px] transition-all",
                              ACTUAL[idx] > pl + 15 ? "bg-red" : "bg-blue"
                            )}
                            style={{ flex: pl }}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                        <span>Slide 1 (Opening)</span>
                        <span>Slide 4 (3 Bets - Ran Long)</span>
                        <span>Slide 12 (The Ask)</span>
                      </div>
                    </div>

                    {/* AI Pacing Cuts & Optimization Suggestions */}
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Icon name="flag" size={13} />
                        <span>AI Pacing Coach Recommendation:</span>
                      </div>
                      <p className="mt-1 text-ink/90 leading-relaxed">
                        Say slide 4 in three clean sentences (one per bet). Save the background debates and workshop stories for Q&A to recover 90 seconds.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <div className="text-xs text-muted">
                        Next action: Rehearse with slide cuts to hit 10:00 flat
                      </div>
                      <div className="flex items-center gap-2">
                        <ButtonLink href={`/presentations/${p.id}`} variant="secondary" size="sm">
                          Deck Details & Runs
                        </ButtonLink>
                        <ButtonLink href={`/rehearse/${p.id}`} variant="primary" size="sm" className="shadow-md">
                          <span>Rehearse Against Clock</span>
                          <Icon name="arrowRight" size={14} />
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}

          {/* Quick Deck Upload Card */}
          <Link
            href="/presentations/new"
            className="flex items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-panel/40 p-6 backdrop-blur-sm transition-all hover:border-blue/50 hover:bg-panel/70 group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lilac/15 text-lilac group-hover:scale-105 transition-transform">
              <Icon name="plus" size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink group-hover:text-lilac transition-colors">
                Upload Another Deck (PDF or PowerPoint)
              </h3>
              <p className="mt-1 text-xs text-muted max-w-lg">
                Drag and drop your executive slides or investor pitch deck. Hakkiri renders high-resolution slide thumbnails, calculates target budgets, and anticipates executive pushback.
              </p>
            </div>
          </Link>
        </div>

        {/* Right Desktop Audience & Rehearsal Intelligence Hub */}
        <aside className="flex flex-col gap-6">
          {/* Simulated Audience Persona */}
          <div className="rounded-2xl border border-white/[0.08] bg-panel/80 p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Icon name="present" size={15} className="text-blue-soft" />
                Audience Simulation Profile
              </h3>
              <span className="rounded-md bg-red/15 px-2 py-0.5 text-[10px] font-bold text-red-soft">Sceptical</span>
            </div>

            <div className="mt-4 rounded-xl bg-booth/70 p-4 border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-fill/20 text-xs font-bold text-blue-soft">
                  DF
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">Dana Flores</div>
                  <div className="text-[11px] text-muted">Finance Director · Sceptical Reviewer</div>
                </div>
              </div>

              <div className="mt-3.5 text-xs text-ink/90 border-t border-line/60 pt-3">
                <span className="font-semibold text-muted text-[11px] uppercase tracking-wider">Top Expected Question:</span>
                <p className="mt-1 italic text-muted">
                  “You’re asking for two hires. What happens to the roadmap if we only approve one?”
                </p>
              </div>

              <div className="mt-3 text-[11px] text-blue-soft font-medium">
                Tip: State which bet slips in the first 5 words. Finance directors want decisions first.
              </div>
            </div>

            <Link
              href={`/qa/${demoPresentation.id}`}
              className="mt-3.5 flex items-center justify-between rounded-xl bg-panel-2 px-3.5 py-2.5 text-xs font-semibold text-ink hover:text-blue-soft border border-white/[0.06] transition-colors"
            >
              <span>Launch Sceptical Q&A Simulation</span>
              <Icon name="arrowRight" size={13} />
            </Link>
          </div>

          {/* Rehearsal Cadence & Trend */}
          <div className="rounded-2xl border border-white/[0.08] bg-panel/80 p-5 backdrop-blur-md shadow-lg">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Icon name="trending" size={15} className="text-emerald-400" />
              Timing Cadence Progress
            </h3>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04]">
                <div>
                  <div className="font-semibold text-ink">Run 1 (Initial Read)</div>
                  <div className="text-[11px] text-muted">3 days ago</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-soft">18m 10s</span>
                  <div className="text-[10px] text-dim">+8:10 over</div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04]">
                <div>
                  <div className="font-semibold text-ink">Run 2 (First Cuts)</div>
                  <div className="text-[11px] text-muted">2 days ago</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lilac">14m 20s</span>
                  <div className="text-[10px] text-dim">+4:20 over</div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04] ring-1 ring-blue/20">
                <div>
                  <div className="font-semibold text-ink">Run 3 (Latest)</div>
                  <div className="text-[11px] text-muted">Yesterday</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-soft">11m 20s</span>
                  <div className="text-[10px] text-emerald-400">Within 80s of target!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rehearsal Best Practices */}
          <div className="rounded-2xl border border-white/[0.08] bg-panel/80 p-5 backdrop-blur-md shadow-lg text-xs">
            <h4 className="font-bold text-ink flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-blue-soft" />
              Executive Room Rules
            </h4>
            <ul className="mt-2.5 space-y-2 text-muted">
              <li className="flex items-start gap-2">
                <span className="text-blue-soft font-bold">•</span>
                <span><b>Open with the ask:</b> Tell the room on slide 1 what decision you need at the end.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-soft font-bold">•</span>
                <span><b>Never read the slide:</b> The audience reads twice as fast as you speak. Provide the narrative why.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-soft font-bold">•</span>
                <span><b>Leave 30% for questions:</b> Executive meetings are conversations, not lectures.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
