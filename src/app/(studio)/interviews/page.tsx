import Link from "next/link";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Panel, Sep } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { isDemoInterview, listInterviews } from "@/lib/interviews/store";
import { settingsLine, settingsOr, CATEGORY_ORDER, categoryLabel } from "@/lib/interviews/settings";
import { interviewNextStep, standing } from "@/lib/sessions/server";
import { interviewWhen } from "@/lib/sessions/labels";
import { VERDICT_LABEL } from "@/lib/mocks/report";
import { readinessFor } from "@/lib/scoring/combine";
import { londonToday } from "@/lib/dates";
import { whenSaid } from "@/lib/format";
import { halden } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;
const chipTone = { 
  ready: "bg-blue/15 text-blue-soft border border-blue/20", 
  "getting-there": "bg-white/[0.06] text-lilac border border-white/10", 
  "not-ready": "bg-red/12 text-red-soft border border-red/20" 
} as const;

export default async function InterviewsPage() {
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const all = listInterviews(londonToday());

  return (
    <div className="flex grow flex-col gap-7 pb-10">
      {/* Top Header */}
      <header className="flex animate-rise flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Icon name="brief" size={14} className="text-blue-soft" />
            <span>AI Practice Suites</span>
          </div>
          <h1 className="mt-1 text-[32px] font-extrabold tracking-tight text-ink">Interview Pipelines</h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-muted">
            Each pipeline is customized to the target company, job spec, and your CV with adaptive AI follow-up questioning.
          </p>
        </div>
        <ButtonLink href="/interviews/new" variant="primary" size="md" className="shadow-lg">
          <Icon name="plus" size={16} strokeWidth={2.4} />
          <span>New Interview Pipeline</span>
        </ButtonLink>
      </header>

      {/* KPI Overview Banner across full desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-rise [animation-delay:0.05s]">
        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Active Pipelines</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">{all.length}</span>
            <span className="text-xs text-blue-soft">In preparation</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Overall Readiness</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-lilac">3.8</span>
            <span className="text-xs text-muted">/ 5.0 (Nearly Ready)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Answers Practised</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">14</span>
            <span className="text-xs text-emerald-400">Scored by AI</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Next Scheduled Interview</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">5 Days</span>
            <span className="text-xs text-blue-soft">Halden Final Round</span>
          </div>
        </div>
      </div>

      {/* Main Desktop Grid: Workstation & Intelligence Sidebar */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left Primary Column */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-ink">Your Target Pipelines</span>
              <span className="rounded-full bg-blue/15 px-2.5 py-0.5 text-xs font-semibold text-blue-soft">
                {all.length} Active
              </span>
            </div>
            <div className="text-xs text-muted">
              Auto-calibrated with Mock AI Engine
            </div>
          </div>

          {all.map((iv, i) => {
            const st = standing(iv);
            const step = interviewNextStep(iv, st);
            const when = interviewWhen(iv.date, londonToday());

            return (
              <Panel
                key={iv.id}
                className="pro-card animate-slide-up rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {/* Company Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-halden to-[#132420] text-[24px] font-extrabold text-[#ddebe5] shadow-inner"
                    >
                      {iv.companyInitial}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={`/interviews/${iv.id}`}
                          className="text-xl font-bold tracking-tight text-ink hover:text-blue-soft transition-colors"
                        >
                          {iv.role}
                        </Link>
                        {isDemoInterview(iv.id) && <Chip tone="blue">Demo Target</Chip>}
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-muted">
                          {iv.round === "final" ? "Final Round" : iv.round}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                        <span className="font-semibold text-ink">{iv.company}</span>
                        <Sep />
                        <span className="capitalize">{iv.format} Format</span>
                        <Sep />
                        <span>{settingsLine(settingsOr(iv.settings, iv.style))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Standing & Score */}
                  <div className="text-right">
                    {st.verdict ? (
                      <>
                        <div className={clsx("text-xl font-extrabold", verdictTone[st.verdict])}>
                          {VERDICT_LABEL[st.verdict]}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-muted">
                          Score: <span className="font-bold text-ink">{st.report?.score?.toFixed(1)}</span> / 5.0
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-muted">Not started</span>
                    )}
                  </div>
                </div>

                {/* Date & Time pill */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-booth/70 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Icon name="cal" size={14} className="text-blue-soft" />
                    <span>Scheduled: <b className="text-ink">{when.text}</b></span>
                    {when.rel && (
                      <span className="rounded-full bg-blue/15 px-2 py-0.5 font-bold text-blue-soft">
                        {when.rel}
                      </span>
                    )}
                  </div>
                  {st.last && (
                    <span className="text-dim">Last evaluated {whenSaid(st.last.startedAt).toLowerCase()}</span>
                  )}
                </div>

                {/* Detailed Category Progress Bars */}
                <div className="mt-5 space-y-2 border-t border-line pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted uppercase tracking-wider text-[11px]">
                      Competency Breakdown & Readiness
                    </span>
                    <span className="text-[11px] text-dim">5 Evaluated Pillars</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {CATEGORY_ORDER.map((g) => {
                      const s = st.categories[g] ?? halden.groupScores[g] ?? 3.0;
                      return (
                        <div
                          key={g}
                          className={clsx(
                            "flex flex-col justify-between rounded-xl p-2.5 shadow-xs transition-all",
                            chipTone[readinessFor(s)]
                          )}
                        >
                          <span className="text-[11px] font-semibold truncate capitalize">
                            {categoryLabel(g, "Technical")}
                          </span>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-mono text-base font-extrabold">{s.toFixed(1)}</span>
                            <span className="text-[10px] opacity-70">/ 5.0</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Questions / Probes Preview */}
                {iv.likelyAsks && iv.likelyAsks.length > 0 && (
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-panel-2/50 p-3.5 text-xs">
                    <div className="font-semibold text-muted flex items-center gap-1.5">
                      <Icon name="flag" size={13} className="text-red-soft" />
                      <span>Likely Interviewer Probes (From Job Spec & CV):</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-ink/90">
                      {iv.likelyAsks.map((ask, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-blue-soft" />
                          <span>{ask}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Next Step & CTAs */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-panel-2 px-4 py-3">
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-muted">Recommended Action: </span>
                    <b className="text-sm font-bold text-ink">{step.label}</b>
                    <span className="text-xs text-muted"> · {step.detail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ButtonLink href={`/interviews/${iv.id}`} variant="secondary" size="sm">
                      View Spec & Questions
                    </ButtonLink>
                    {step.drill ? (
                      <StartButton interviewId={iv.id} micOk={micOk} body={{ kind: "drill", drill: step.drill }} variant="primary" size="sm">
                        <span>Launch Session</span>
                        <Icon name="arrowRight" size={14} />
                      </StartButton>
                    ) : (
                      <ButtonLink href={step.href!} variant="primary" size="sm">
                        <span>Launch Session</span>
                        <Icon name="arrowRight" size={14} />
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}

          {/* Quick Setup Card */}
          <Link
            href="/interviews/new"
            className="flex items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-panel/40 p-6 backdrop-blur-sm transition-all hover:border-blue/50 hover:bg-panel/70 group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue/15 text-blue-soft group-hover:scale-105 transition-transform">
              <Icon name="plus" size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink group-hover:text-blue-soft transition-colors">
                Add Another Interview Pipeline
              </h3>
              <p className="mt-1 text-xs text-muted max-w-lg">
                Upload your CV and copy-paste any job specification. Hakkiri automatically extracts the hiring manager persona, probable questions, and rubrics in under two minutes.
              </p>
            </div>
          </Link>
        </div>

        {/* Right Desktop Coaching & Intelligence Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* 5-Day Countdown Timeline */}
          <div className="rounded-2xl border border-white/[0.08] bg-panel/80 p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Icon name="cal" size={15} className="text-blue-soft" />
                Preparation Roadmap
              </h3>
              <span className="text-[11px] font-semibold text-muted">Target: Day 5</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-booth/60 p-3 border border-white/[0.04]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">✓</span>
                <div>
                  <div className="text-xs font-semibold text-ink">Baseline Interview Completed</div>
                  <div className="text-[11px] text-muted">Scored 3.5 overall on motivation and background</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-blue/10 p-3 border border-blue/20">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue text-white text-xs font-bold animate-pulse">2</span>
                <div>
                  <div className="text-xs font-bold text-blue-soft">Current Focus: Technical Metrics</div>
                  <div className="text-[11px] text-ink/80">Drill: What to do when payments drop 15% overnight</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-booth/40 p-3 border border-white/[0.04] opacity-75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-muted text-xs font-bold">3</span>
                <div>
                  <div className="text-xs font-semibold text-muted">Full 30-min Simulated Mock</div>
                  <div className="text-[11px] text-dim">Complete dry run with adaptive follow-ups</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-booth/40 p-3 border border-white/[0.04] opacity-75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-muted text-xs font-bold">4</span>
                <div>
                  <div className="text-xs font-semibold text-muted">Halden Final Round Interview</div>
                  <div className="text-[11px] text-dim">Sunday 8 November · 10:00 AM (Video)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice & Delivery Diagnostics Hub */}
          <div className="rounded-2xl border border-white/[0.08] bg-panel/80 p-5 backdrop-blur-md shadow-lg">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Icon name="speaker" size={15} className="text-lilac" />
              Speech & Pacing Analytics
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04]">
                <div>
                  <div className="font-semibold text-ink">Filler Word Rate</div>
                  <div className="text-[11px] text-muted">"um", "like", "you know"</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 text-sm">1.4 / min</span>
                  <div className="text-[10px] text-dim">Top 15% pacing</div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04]">
                <div>
                  <div className="font-semibold text-ink">Ownership Ratio</div>
                  <div className="text-[11px] text-muted">"I did" vs "We did"</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-soft text-sm">78% "I"</span>
                  <div className="text-[10px] text-dim">Strong executive agency</div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-booth/50 p-3 border border-white/[0.04]">
                <div>
                  <div className="font-semibold text-ink">Average Speaking Pace</div>
                  <div className="text-[11px] text-muted">Target: 130 - 150 wpm</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-ink text-sm">138 wpm</span>
                  <div className="text-[10px] text-emerald-400">Optimal cadence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Story Bank Integration Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-panel/90 to-[#1e1f2b] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-soft uppercase tracking-wider">STAR Story Bank</span>
              <span className="rounded-md bg-blue/15 px-2 py-0.5 text-[11px] font-semibold text-blue-soft">6 Stories</span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-ink">Relevant Career Achievements Ready</h4>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              6 stories from Brightpay and Fernway match questions for Halden. Ensure your results feature specific metrics.
            </p>
            <Link
              href="/story-bank"
              className="mt-3.5 flex items-center justify-between rounded-xl bg-booth px-3.5 py-2.5 text-xs font-semibold text-ink hover:text-blue-soft border border-white/[0.06] transition-colors"
            >
              <span>Review Story Bank Coverage</span>
              <Icon name="arrowRight" size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
