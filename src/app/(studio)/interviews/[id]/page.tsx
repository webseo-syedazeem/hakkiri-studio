import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Icon, Meter, Panel, Sep, toneText } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { getInterview, isDemoInterview } from "@/lib/interviews/store";
import { devOr } from "@/lib/launch";
import { understandingOf } from "@/lib/interviews/build";
import { CATEGORY_ORDER, categoryLabel, leanTowards, settingsOr } from "@/lib/interviews/settings";
import { standing } from "@/lib/sessions/server";
import { VERDICT_LABEL } from "@/lib/mocks/report";
import { readinessFor, readinessText } from "@/lib/scoring/combine";
import { interviewWhen } from "@/lib/sessions/labels";
import { whenSaid } from "@/lib/format";
import { AddQuestion, RemoveQuestion } from "@/components/interview/AddQuestion";
import { DeleteInterview } from "@/components/interview/DeleteInterview";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { NewInterviewPanel, StartButton } from "@/components/interview/StartSession";
import { PAY_STAGE_LABEL, payStage } from "@/lib/sessions/pay";
import { DRILL_MINUTES } from "@/lib/sessions/drills";

export const dynamic = "force-dynamic";

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;

export default async function InterviewOverview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; rebuilt?: string }>;
}) {
  const { id } = await params;
  const { new: isNew, rebuilt } = await searchParams;
  const interview = getInterview(id);
  if (!interview) notFound();

  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const u = understandingOf(interview);
  const settings = settingsOr(interview.settings, interview.style);
  const st = standing(interview);
  const when = interviewWhen(interview.date, londonToday());
  const lean = leanTowards(settings.mix, st.categories);
  const custom = interview.questions.filter((q) => q.custom);
  const src = interview.sources ?? {};
  const started = st.freshCount > 0;

  const stage = payStage(interview.round);
  const payDone = st.sessions.some((m) => m.kind === "drill" && m.drill?.kind === "pay");

  const payDrill = (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-booth/60 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <Icon name="brief" size={15} className="text-blue-soft" />
          <span>Salary Negotiation & Compensation Drill</span>
        </div>
        <div className="mt-1 text-xs leading-relaxed text-muted">
          “What are your salary expectations?”, handling push-backs, and package questions tailored for {PAY_STAGE_LABEL[stage]}.
          <span className="ml-2 font-mono text-dim">({DRILL_MINUTES.pay} min target)</span>
        </div>
      </div>
      <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: { kind: "pay" } }} size="sm" variant={payDone ? "secondary" : "primary"}>
        <span>{payDone ? "Repeat Pay Drill" : "Start Pay Drill"}</span>
      </StartButton>
    </div>
  );

  const understood = (
    <Panel aria-label="What Hakkiri understood" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-ink">AI Job Specification Breakdown</h2>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted">Extracted</span>
        </div>
        <Link href={`/interviews/${interview.id}/rebuild?edit=1`} className="text-xs font-semibold text-blue-soft hover:underline">
          Edit Criteria →
        </Link>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink/90">
        <b className="font-bold text-ink">{u.role}</b> ({u.level} level) · {u.field}.
      </p>

      <dl className="mt-4 space-y-2.5">
        {CATEGORY_ORDER.map((g) => (
          <div key={g} className="grid grid-cols-[130px_1fr] items-start gap-3 rounded-xl bg-booth/50 p-3 border border-white/[0.04] text-xs">
            <dt className={clsx("font-bold", !settings.mix[g] ? "text-dim" : "text-ink")}>
              {categoryLabel(g, u.technicalLabel)}
            </dt>
            <dd className="text-muted leading-relaxed">{u.meanings[g]}</dd>
          </div>
        ))}
      </dl>

      {(interview.rules ?? []).length > 0 && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-panel-2 p-3.5 text-xs">
          <div className="font-bold text-ink">Custom Rules & Criteria</div>
          <ul className="mt-1.5 space-y-1 text-muted">
            {interview.rules!.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 text-xs">
        <span className="text-muted">
          {custom.length ? `${custom.length} custom question${custom.length === 1 ? "" : "s"} scheduled for next session.` : "Expecting a specific question? Add it to simulate it live."}
        </span>
        <AddQuestion interviewId={interview.id} />
      </div>

      {custom.map((q) => (
        <div key={q.id} className="relative mt-2 rounded-xl bg-panel-2 py-2.5 pl-3.5 pr-9 text-xs text-ink font-medium">
          {q.text}
          <RemoveQuestion interviewId={interview.id} id={q.id} />
        </div>
      ))}

      <p className="mt-4 text-[11px] leading-relaxed text-dim border-t border-line/60 pt-3">
        Engineered from {[src.cv, src.coverLetter, src.job, src.company].filter(Boolean).join(", ") || "provided documents"}.
        {interview.planBy === "templates" && devOr(" Standard templates loaded (Offline mock mode active).", " Standard questions loaded.")}
      </p>
    </Panel>
  );

  return (
    <div className="flex grow flex-col gap-6 pb-10">
      {/* Top Header */}
      <header className="flex animate-rise flex-wrap items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-halden to-[#132420] text-[24px] font-extrabold text-[#ddebe5] shadow-inner">
            {interview.companyInitial}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[30px] font-extrabold tracking-tight text-ink">{interview.role}</h1>
            <div className="mt-1 flex flex-wrap items-center text-sm text-muted">
              <span className="font-bold text-ink/90">{interview.company}</span>
              <Sep />
              <span>{when.text}</span>
              {when.rel && when.rel !== "done" && (
                <>
                  <Sep />
                  <span className="rounded-full bg-blue/15 px-2 py-0.5 text-xs font-bold text-blue-soft">{when.rel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {!isDemoInterview(interview.id) && <DeleteInterview id={interview.id} company={interview.company} />}
          {started && (
            <ButtonLink href="#new-questions" variant="primary" size="md" className="shadow-lg">
              <Icon name="mic" size={16} strokeWidth={2.2} />
              <span>Start Next Session</span>
            </ButtonLink>
          )}
        </div>
      </header>

      {isNew && (
        <div role="status" className="animate-rise rounded-2xl border border-blue/20 bg-blue/10 px-6 py-4 text-sm text-lilac backdrop-blur-sm">
          <b className="font-bold text-ink">Interview Simulation Pipeline Ready:</b> Check what Hakkiri understood about the job, then begin. Questions remain hidden until {interview.interviewer.name} asks them in the live booth.
          {(interview.setupNotes ?? []).map((n) => (
            <div key={n} className="mt-2 flex items-start gap-2 text-xs text-red-soft">
              <Icon name="flag" size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      )}

      {rebuilt && (
        <div role="status" className="animate-rise rounded-2xl border border-blue/20 bg-blue/10 px-6 py-4 text-sm text-lilac backdrop-blur-sm">
          <b className="font-bold text-ink">Interview Criteria Rebuilt:</b> Unheard questions were archived and newly tailored questions were generated based on your latest inputs.
        </div>
      )}

      <InterviewTabs id={interview.id} current="overview" prepReady={started} />

      {!started ? (
        <div className="grid grow grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_560px]">
          {understood}
          <Panel id="new-questions" aria-label="Your interview" className="scroll-mt-6 animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-base font-bold text-ink">Initial Interview Simulation</h2>
            <p className="mt-1 text-xs text-muted">
              Live practice with {interview.interviewer.name} ({interview.interviewer.title}). Full voice analysis delivered at the end.
            </p>
            <div className="mt-5">
              <NewInterviewPanel interviewId={interview.id} micOk={micOk} initial={settings} meanings={u.meanings} technicalLabel={u.technicalLabel} label="Launch Interview Simulation" />
            </div>
            <div className="mt-5 border-t border-line pt-5">{payDrill}</div>
          </Panel>
        </div>
      ) : (
        <div className="grid grow grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_560px]">
          {/* Left Column: Standing & Next Questions */}
          <div className="flex min-w-0 flex-col gap-6">
            <Panel aria-label="Where you stand" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-6 border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-base font-bold text-ink">Current Pipeline Standing</h2>
                  <p className="mt-1 text-xs text-muted">Based on your latest full simulation ({whenSaid(st.last!.startedAt).toLowerCase()}).</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className={clsx("text-2xl font-extrabold tracking-tight", verdictTone[st.verdict!])}>
                    {VERDICT_LABEL[st.verdict!]}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-muted">
                    <span className="font-mono text-ink text-sm font-bold">{st.report?.score?.toFixed(1) ?? "n/a"}</span> / 5.0 overall
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {CATEGORY_ORDER.filter((g) => st.categories[g] != null).map((g) => {
                  const score = st.categories[g]!;
                  const level = readinessFor(score);
                  const label = categoryLabel(g, u.technicalLabel);
                  return (
                    <div key={g} className="grid grid-cols-[130px_1fr_90px] items-center gap-4 rounded-xl bg-booth/50 p-2.5 border border-white/[0.04]">
                      <span className="text-xs font-bold text-ink truncate">{label}</span>
                      <Meter value={score} tone={level} label={`${label}: ${score} out of 5`} />
                      <span className={`text-right text-xs font-bold font-mono ${toneText[level]}`}>
                        {score.toFixed(1)} <span className="text-[10px] uppercase font-sans">{readinessText(score)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end border-t border-line pt-4">
                <ButtonLink href={`/interviews/${interview.id}/mocks/${st.last!.id}`} size="sm" variant="secondary">
                  <span>View Detailed Analytical Report</span>
                  <Icon name="arrowRight" size={13} />
                </ButtonLink>
              </div>
            </Panel>

            <Panel id="new-questions" aria-label="New questions" className="scroll-mt-6 animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h2 className="text-base font-bold text-ink">Configure Next Session</h2>
                  <p className="mt-0.5 text-xs text-muted">Fresh, unrepeated questions automatically calibrated to address your lowest score areas.</p>
                </div>
                <span className="rounded-full bg-blue/15 px-2.5 py-0.5 text-xs font-semibold text-blue-soft">
                  Adaptive AI
                </span>
              </div>
              <div className="mt-5">
                <NewInterviewPanel interviewId={interview.id} micOk={micOk} initial={settings} meanings={u.meanings} technicalLabel={u.technicalLabel} lean={lean} label="Launch With Targeted Questions" />
              </div>
            </Panel>
          </div>

          {/* Right Column: Training Drills & Prep Sheet Quick Link */}
          <div className="flex min-w-0 flex-col gap-6">
            <Panel aria-label="Your training" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-base font-bold text-ink">Prescribed Training Drills</h2>
                <span className="text-xs text-blue-soft font-semibold">Targeted Practice</span>
              </div>

              {st.drills.length === 0 ? (
                <p className="mt-3 text-xs text-muted">All primary categories scoring above target. Try a high-difficulty drill or full mock.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {st.drills.map((d, k) => (
                    <div key={k} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-booth/60 p-3.5 border border-white/[0.04]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-ink">
                          {d.done && <Icon name="check" size={14} className="text-emerald-400" />}
                          <span>{d.title}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted">
                          {d.detail} · <span className="font-mono text-dim">{d.minutes} min</span>
                        </div>
                      </div>

                      {d.spec.kind === "story" ? (
                        <ButtonLink href={`/interviews/${interview.id}/story?skill=${encodeURIComponent(d.spec.skill ?? "")}&question=${encodeURIComponent(d.spec.question ?? "")}`} size="sm">
                          {d.done ? "Redo" : "Build Story"}
                        </ButtonLink>
                      ) : (
                        <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: d.spec }} size="sm" variant={d.done ? "secondary" : "primary"}>
                          <span>{d.done ? "Drill Again" : "Start Drill"}</span>
                        </StartButton>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {st.canRerun && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue/20 bg-blue/10 p-3.5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink">Simulate Repeat Run</div>
                    <div className="mt-0.5 text-[11px] text-muted">Practice the same questions again to verify your improvements.</div>
                  </div>
                  <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "rerun", sessionId: st.last!.id }} size="sm">
                    <Icon name="repeat" size={14} />
                    <span>Run Again</span>
                  </StartButton>
                </div>
              )}

              <div className="mt-4 border-t border-line pt-4">{payDrill}</div>
            </Panel>

            <Panel aria-label="Prep sheet" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">Morning-Of Executive Prep Sheet</h3>
                  <p className="mt-0.5 text-xs text-muted">Single-page briefing to review before walking into the interview.</p>
                </div>
                <ButtonLink href={`/interviews/${interview.id}/prep`} size="sm" variant="primary">
                  <span>Open Sheet</span>
                  <Icon name="arrowRight" size={13} />
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
