import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Panel, Sep } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { SlideView } from "@/components/pitch/SlideView";
import { WelcomeHero } from "@/components/home/WelcomeHero";
import { londonToday } from "@/lib/dates";
import { isDemoInterview, listInterviews } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/interviews/settings";
import { interviewNextStep, standing } from "@/lib/sessions/server";
import { interviewWhenShort as interviewWhen } from "@/lib/sessions/labels";
import { VERDICT_LABEL } from "@/lib/mocks/report";
import { listPresentations, listQa, listRuns } from "@/lib/pitch/store";
import { pitchNextStep, pitchReadiness } from "@/lib/pitch/plan";
import { AUDIENCE_LABEL } from "@/lib/pitch/labels";
import { readinessFor } from "@/lib/scoring/combine";
import { capitalise, daysBetween, longDay, whenSaid } from "@/lib/format";
import { user } from "@/lib/mock-data";
import type { Interview } from "@/lib/types";

export const dynamic = "force-dynamic"; // scores change as you practise

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;
const chipTone = { ready: "bg-blue/15 text-blue-soft border border-blue/20", "getting-there": "bg-white/[0.06] text-lilac border border-white/10", "not-ready": "bg-red/12 text-red-soft border border-red/20" } as const;

/** "Halden in 4 days." / "Halden tomorrow, Q1 roadmap in 5 days." / "Ready when you are." */
function headline(events: { name: string; date?: string }[]): string {
  const soon = events
    .filter((e) => e.date && daysBetween(londonToday(), e.date) >= 0)
    .map((e) => ({ ...e, days: daysBetween(londonToday(), e.date!) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 2);
  const say = (e: { name: string; days: number }) => (e.days === 0 ? `${e.name} today` : e.days === 1 ? `${e.name} tomorrow` : `${e.name} in ${e.days} days`);
  if (!soon.length) return "Ready when you are.";
  if (soon.length === 1 || soon[1].days > 7) return `${capitalise(say(soon[0]))}.`;
  return `${capitalise(say(soon[0]))}, ${say(soon[1])}.`;
}

function InterviewCard({ interview, micOk, delay }: { interview: Interview; micOk: boolean; delay: number }) {
  const st = standing(interview);
  const step = interviewNextStep(interview, st);
  const u = understandingOf(interview);
  const when = interviewWhen(interview.date, londonToday());
  return (
    <Panel className="pro-card animate-slide-up rounded-2xl border border-white/[0.08] bg-panel/90 p-5 shadow-lg backdrop-blur-sm" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start gap-4">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-halden to-[#162a25] text-[20px] font-bold text-[#ddebe5] shadow-inner">
          {interview.companyInitial}
        </span>
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/interviews/${interview.id}`} className="truncate text-[17px] font-semibold tracking-[-0.01em] hover:text-blue-soft transition-colors">
              {interview.role}
            </Link>
            {isDemoInterview(interview.id) && <Chip tone="blue">Demo Target</Chip>}
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted">
              {interview.round === "final" ? "Final Round" : interview.round}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center text-[13px] text-muted">
            <span className="font-medium text-ink/90">{interview.company}</span>
            <Sep />
            <span>{when.text}</span>
            {when.rel && (
              <>
                <Sep />
                <span className={when.rel === "done" ? "text-muted" : "font-semibold text-blue-soft"}>{when.rel}</span>
              </>
            )}
            <Sep />
            <span className="capitalize">{interview.format} interview</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          {st.verdict ? (
            <>
              <div className={clsx("text-base font-bold leading-tight sm:text-lg", verdictTone[st.verdict])}>{VERDICT_LABEL[st.verdict]}</div>
              <div className="num mt-0.5 text-[12px] font-medium text-muted">{st.report?.score?.toFixed(1)} / 5.0 overall</div>
            </>
          ) : (
            <div className="text-[13px] font-semibold text-muted">Not started</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        {CATEGORY_ORDER.filter((g) => st.categories[g] != null).map((g) => {
          const s = st.categories[g]!;
          return (
            <span key={g} className={clsx("inline-flex h-[26px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold shadow-xs", chipTone[readinessFor(s)])}>
              <span>{categoryLabel(g, u.technicalLabel)}</span>
              <span className="num font-mono text-[11px] font-bold">{s.toFixed(1)}</span>
            </span>
          );
        })}
        {!st.last && <span className="text-[13px] text-muted">Scores by category appear after your first interview.</span>}
        {st.last && <span className="ml-auto text-xs text-dim">Last session {whenSaid(st.last.startedAt).toLowerCase()}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-panel-2/80 px-4 py-3">
        <div className="min-w-0 text-sm">
          <span className="text-muted text-xs uppercase tracking-wider font-semibold">Recommended Next: </span>
          <b className="font-semibold text-ink">{step.label}</b>
          <span className="text-muted text-xs"> · {step.detail}</span>
        </div>
        {step.drill ? (
          <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: step.drill }} variant="primary" size="sm" className="shrink-0 shadow-md">
            <span>Continue Session</span>
            <Icon name="arrowRight" size={14} />
          </StartButton>
        ) : (
          <ButtonLink href={step.href!} variant="primary" size="sm" className="shrink-0 shadow-md">
            <span>Continue Session</span>
            <Icon name="arrowRight" size={14} />
          </ButtonLink>
        )}
      </div>
    </Panel>
  );
}

/**
 * Home: your interviews and presentations, each with where it stands and a
 * Continue button that goes straight to the most useful next step.
 */
export default async function HomePage() {
  const jar = await cookies();
  const micOk = jar.get("hk_mic_ok")?.value === "1";
  const assessed = jar.get("hk_assessed")?.value === "1";

  // When the app starts, unonboarded users begin with the Diagnostic Assessment (Step 1/7)
  if (!assessed) {
    redirect("/assessment");
  }

  const interviews = listInterviews(londonToday());
  const mine = interviews.filter((i) => !isDemoInterview(i.id));
  const shown = (mine.length ? mine : interviews).slice(0, 3);
  const presentations = listPresentations().slice(0, 3);

  return (
    <div className="flex grow flex-col gap-6">
      {/* Enhanced Welcome Hero Section at top of Home Screen */}
      <WelcomeHero firstName={user.firstName} micOk={micOk} />

      {/* Main Studio Dashboard Header */}
      <header className="flex animate-rise flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
            <Icon name="cal" size={13} />
            <span>{longDay(`${londonToday()}T12:00:00Z`)}</span>
            <span className="text-white/20">|</span>
            <span className="text-blue-soft">Scheduled Milestone</span>
          </div>
          <h2 className="mt-1 text-[24px] font-bold tracking-tight text-ink sm:text-[28px]">
            {headline([...shown.map((i) => ({ name: i.company, date: i.date })), ...presentations.map((p) => ({ name: p.title, date: p.date }))])}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <ButtonLink href="/interviews/new" variant="primary" size="md">
            <Icon name="plus" size={15} strokeWidth={2.2} />
            <span>New Interview</span>
          </ButtonLink>
          <ButtonLink href="/presentations/new" variant="secondary" size="md">
            <Icon name="plus" size={15} strokeWidth={2.2} />
            <span>New Presentation</span>
          </ButtonLink>
        </div>
      </header>

      {/* 2-Column Studio Board: Interviews & Presentations */}
      <div className="grid grow grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Interviews Column */}
        <section aria-label="Interviews" className="min-w-0">
          <div className="mb-3.5 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink tracking-tight">Active Interview Pipelines</h3>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-xs font-semibold text-muted">
                {interviews.length}
              </span>
            </div>
            <Link href="/interviews" className="text-xs font-semibold text-blue-soft hover:underline">
              {interviews.length > shown.length ? `View all (${interviews.length})` : "View all pipelines"}
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {shown.map((iv, k) => (
              <InterviewCard key={iv.id} interview={iv} micOk={micOk} delay={0.05 * (k + 1)} />
            ))}
            {!mine.length && (
              <Link href="/interviews/new" className="flex animate-rise items-center gap-3.5 rounded-2xl border border-dashed border-white/15 bg-panel/40 px-5 py-4 text-sm text-muted backdrop-blur-sm transition-all hover:border-blue/40 hover:text-ink hover:bg-panel/70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft">
                  <Icon name="plus" size={16} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-semibold text-ink">Set up your own interview pipeline</div>
                  <div className="text-xs text-muted">Upload your CV and paste the job spec. AI generates tailored questions and criteria in 2 minutes.</div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* Presentations Column */}
        <section aria-label="Presentations" className="min-w-0">
          <div className="mb-3.5 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink tracking-tight">Executive Presentations</h3>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-xs font-semibold text-muted">
                {presentations.length}
              </span>
            </div>
            <Link href="/presentations" className="text-xs font-semibold text-blue-soft hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {presentations.map((p, k) => {
              const runs = listRuns(p.id);
              const qa = listQa(p.id);
              const r = pitchReadiness(p, runs, qa);
              const step = pitchNextStep(p, runs, qa);
              const when = interviewWhen(p.date, londonToday());
              return (
                <Panel key={p.id} className="pro-card animate-slide-up rounded-2xl border border-white/[0.08] bg-panel/90 p-5 shadow-lg backdrop-blur-sm" style={{ animationDelay: `${0.05 * (k + 2)}s` }}>
                  <div className="flex gap-4">
                    <SlideView slide={p.slides[0]} presentationId={p.id} className="w-[115px] shrink-0 self-start rounded-lg border border-white/15 shadow-md" showNumber={false} />
                    <div className="min-w-0 grow">
                      <Link href={`/presentations/${p.id}`} className="block truncate text-[17px] font-semibold tracking-[-0.01em] hover:text-blue-soft transition-colors">
                        {p.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center text-[13px] text-muted">
                        <span className="font-medium text-ink/90">{capitalise(AUDIENCE_LABEL[p.audience])}</span>
                        <Sep />
                        <span>{Math.round(p.timeLimitSec / 60)} min target</span>
                        <Sep />
                        <span>{when.text}</span>
                        {when.rel && when.rel !== "done" && (
                          <>
                            <Sep />
                            <span className="font-semibold text-blue-soft">{when.rel}</span>
                          </>
                        )}
                      </div>
                      <div className={clsx("mt-2 text-[13px] font-bold", r.ready ? "text-blue-soft" : r.statusTone === "red" ? "text-red-soft" : "text-lilac")}>
                        {r.ready ? "✓ Presentation Ready" : `Status: ${r.status}`}
                      </div>
                    </div>
                  </div>
                  {r.rows.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3.5">
                      {r.rows.map((row) => (
                        <span key={row.label} className={clsx("inline-flex h-[26px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold shadow-xs", chipTone[readinessFor(row.score)])}>
                          <span>{row.label}</span>
                          <span className="num font-mono text-[11px] font-bold">{row.score.toFixed(1)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-panel-2/80 px-4 py-3">
                    <div className="min-w-0 truncate text-sm">
                      <span className="text-muted text-xs uppercase tracking-wider font-semibold">Recommended Next: </span>
                      <b className="font-semibold text-ink">{step.label}</b>
                      <span className="text-muted text-xs"> · {step.detail}</span>
                    </div>
                    <ButtonLink href={step.href} variant="primary" size="sm" className="shrink-0 shadow-md">
                      <span>Rehearse Now</span>
                      <Icon name="arrowRight" size={14} />
                    </ButtonLink>
                  </div>
                </Panel>
              );
            })}
            {presentations.length === 0 && (
              <Link href="/presentations/new" className="flex items-center gap-3.5 rounded-2xl border border-dashed border-white/15 bg-panel/40 px-5 py-4 text-sm text-muted backdrop-blur-sm transition-all hover:border-blue/40 hover:text-ink hover:bg-panel/70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft">
                  <Icon name="plus" size={16} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-semibold text-ink">Upload a presentation deck or pitch</div>
                  <div className="text-xs text-muted">Upload PDF or PowerPoint slides to rehearse timing and simulated audience questions.</div>
                </div>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
