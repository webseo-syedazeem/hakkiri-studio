import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Panel, Sep } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { SlideView } from "@/components/pitch/SlideView";
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
import type { Interview } from "@/lib/types";

export const dynamic = "force-dynamic"; // scores change as you practise

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;
const chipTone = { ready: "bg-blue/15 text-blue-soft", "getting-there": "bg-white/[0.06] text-lilac", "not-ready": "bg-red/12 text-red-soft" } as const;

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
    <Panel className="animate-rise px-5 py-[18px]" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start gap-4">
        <span aria-hidden className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-halden text-[20px] font-bold text-[#ddebe5]">
          {interview.companyInitial}
        </span>
        <div className="min-w-0 grow">
          <div className="flex items-center gap-2">
            <Link href={`/interviews/${interview.id}`} className="truncate text-[17px] font-semibold tracking-[-0.01em] hover:underline">
              {interview.role}
            </Link>
            {isDemoInterview(interview.id) && <Chip>Demo</Chip>}
          </div>
          <div className="mt-0.5 truncate text-[13px] text-muted">
            {interview.company}
            <Sep />
            {when.text}
            {when.rel && (
              <>
                <Sep />
                <span className={when.rel === "done" ? "" : "font-semibold text-ink"}>{when.rel}</span>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {st.verdict ? (
            <>
              <div className={clsx("text-lg font-semibold leading-tight", verdictTone[st.verdict])}>{VERDICT_LABEL[st.verdict]}</div>
              <div className="num text-[13px] text-muted">{st.report?.score?.toFixed(1)} overall</div>
            </>
          ) : (
            <div className="text-[13px] font-semibold text-muted">Not started</div>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3.5">
        {CATEGORY_ORDER.filter((g) => st.categories[g] != null).map((g) => {
          const s = st.categories[g]!;
          return (
            <span key={g} className={clsx("inline-flex h-[26px] items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-semibold", chipTone[readinessFor(s)])}>
              {categoryLabel(g, u.technicalLabel)} <span className="num">{s.toFixed(1)}</span>
            </span>
          );
        })}
        {!st.last && <span className="text-[13px] text-muted">Scores by category appear after your first interview.</span>}
        {st.last && <span className="ml-auto self-center text-xs text-dim">Last interview {whenSaid(st.last.startedAt).toLowerCase()}</span>}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-4 rounded-[10px] bg-panel-2 px-3.5 py-2.5">
        <div className="min-w-0 text-sm">
          <span className="text-muted">Next: </span>
          <b className="font-semibold">{step.label}</b>
          <span className="text-muted"> · {step.detail}</span>
        </div>
        {step.drill ? (
          <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: step.drill }} variant="primary" size="sm" className="shrink-0">
            Continue
          </StartButton>
        ) : (
          <ButtonLink href={step.href!} variant="primary" size="sm" className="shrink-0">
            Continue
          </ButtonLink>
        )}
      </div>
    </Panel>
  );
}

/**
 * Home: your interviews and presentations, each with where it stands and a
 * Continue button that goes straight to the most useful next step. No
 * schedule: you practise when you can, and Hakkiri picks up from there.
 */
export default async function HomePage() {
  const jar = await cookies();
  // First visit: start at the welcome screen.
  if (!jar.get("hk_welcomed")) redirect("/welcome");
  const micOk = jar.get("hk_mic_ok")?.value === "1";

  const interviews = listInterviews(londonToday());
  const mine = interviews.filter((i) => !isDemoInterview(i.id));
  const shown = (mine.length ? mine : interviews).slice(0, 3);
  const presentations = listPresentations().slice(0, 3);

  return (
    <div className="flex grow flex-col gap-[22px]">
      <header className="flex animate-rise items-end justify-between gap-6">
        <div>
          <div className="text-sm text-muted">{longDay(`${londonToday()}T12:00:00Z`)}</div>
          <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.025em]">{headline([...shown.map((i) => ({ name: i.company, date: i.date })), ...presentations.map((p) => ({ name: p.title, date: p.date }))])}</h1>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <ButtonLink href="/interviews/new">
            <Icon name="plus" size={16} strokeWidth={2} />
            New interview
          </ButtonLink>
          <ButtonLink href="/presentations/new">
            <Icon name="plus" size={16} strokeWidth={2} />
            New presentation
          </ButtonLink>
        </div>
      </header>

      <div className="grid grow grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-[22px]">
        <section aria-label="Interviews" className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">Interviews</h2>
            <Link href="/interviews" className="text-[13px] font-semibold text-blue-soft hover:underline">
              {interviews.length > shown.length ? `See all ${interviews.length}` : "See all"}
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {shown.map((iv, k) => (
              <InterviewCard key={iv.id} interview={iv} micOk={micOk} delay={0.05 * (k + 1)} />
            ))}
            {!mine.length && (
              <Link href="/interviews/new" className="flex animate-rise items-center gap-3 rounded-[14px] px-5 py-4 text-sm text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] [animation-delay:0.2s] hover:text-ink">
                <Icon name="plus" size={16} strokeWidth={2} />
                Add your own interview: the company, the job spec and your CV. Takes about two minutes.
              </Link>
            )}
          </div>
        </section>

        <section aria-label="Presentations" className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">Presentations</h2>
            <Link href="/presentations" className="text-[13px] font-semibold text-blue-soft hover:underline">
              See all
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
                <Panel key={p.id} className="animate-rise px-5 py-[18px]" style={{ animationDelay: `${0.05 * (k + 2)}s` }}>
                  <div className="flex gap-4">
                    <SlideView slide={p.slides[0]} presentationId={p.id} className="w-[112px] shrink-0 self-start rounded-[6px] shadow-[0_0_0_1px_var(--color-line-strong)]" showNumber={false} />
                    <div className="min-w-0 grow">
                      <Link href={`/presentations/${p.id}`} className="block truncate text-[17px] font-semibold tracking-[-0.01em] hover:underline">
                        {p.title}
                      </Link>
                      <div className="mt-0.5 truncate text-[13px] text-muted">
                        {capitalise(AUDIENCE_LABEL[p.audience])}
                        <Sep />
                        {Math.round(p.timeLimitSec / 60)} min
                        <Sep />
                        {when.text}
                        {when.rel && when.rel !== "done" && (
                          <>
                            <Sep />
                            <span className="font-semibold text-ink">{when.rel}</span>
                          </>
                        )}
                      </div>
                      <div className={clsx("mt-2 text-[13px] font-semibold", r.ready ? "text-blue-soft" : r.statusTone === "red" ? "text-red-soft" : "text-lilac")}>{r.ready ? "Ready" : r.status}</div>
                    </div>
                  </div>
                  {r.rows.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3.5">
                      {r.rows.map((row) => (
                        <span key={row.label} className={clsx("inline-flex h-[26px] items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-semibold", chipTone[readinessFor(row.score)])}>
                          {row.label} <span className="num">{row.score.toFixed(1)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3.5 flex items-center justify-between gap-4 rounded-[10px] bg-panel-2 px-3.5 py-2.5">
                    <div className="min-w-0 truncate text-sm">
                      <span className="text-muted">Next: </span>
                      <b className="font-semibold">{step.label}</b>
                      <span className="text-muted"> · {step.detail}</span>
                    </div>
                    <ButtonLink href={step.href} variant="primary" size="sm" className="shrink-0">
                      Continue
                    </ButtonLink>
                  </div>
                </Panel>
              );
            })}
            {presentations.length === 0 && (
              <Link href="/presentations/new" className="flex items-center gap-3 rounded-[14px] px-5 py-4 text-sm text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink">
                <Icon name="plus" size={16} strokeWidth={2} />
                Add a presentation or pitch to rehearse.
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
