import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Chip, Crumbs, Icon, Meter, Panel, Sep, toneText } from "@/components/ui";
import { StartButton } from "@/components/interview/StartSession";
import { BetaInterviewFeedbackModal } from "@/components/feedback/BetaInterviewFeedbackModal";
import { InterviewReportView } from "@/components/interview/InterviewReportView";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { categoryLabel, settingsLine } from "@/lib/interviews/settings";
import { findAnswer } from "@/lib/answers/store";
import { doneSessions, findMock, findMockAsync, isFresh, previousScore, rerunOf, rowsFor, rowsForAsync, SKIP_REASON_LABEL, type MockRecord } from "@/lib/mocks/store";
import { demoMock, roadmapAnswer } from "@/lib/mock-data";
import { buildReport, countsLine, VERDICT_LABEL, type MockRow } from "@/lib/mocks/report";
import { compareRuns } from "@/lib/sessions/compare";
import { HABIT_FOR_FIX, HABIT_LABEL, habitLine, rowHabit, suggestDrills } from "@/lib/sessions/drills";
import { roleWithLevel, sessionTitle } from "@/lib/sessions/labels";
import { WRONG_REASON_LABEL } from "@/lib/ai/interview/questions";
import { PAY_STAGE_LABEL, PAY_TIPS, payChecks, payStage } from "@/lib/sessions/pay";
import { readinessFor, readinessText, scoreLabel } from "@/lib/scoring/combine";
import { minutesLong, mmss, whenSaid } from "@/lib/format";
import type { Interview } from "@/lib/types";
import { devOr, isLaunch } from "@/lib/launch";
import { totals, usageFor } from "@/lib/usage/store";
import { dollars } from "@/lib/usage/prices";

export const dynamic = "force-dynamic";

const DEMO_NOTE: Record<string, string> = {
  "no-keys": devOr("This is the demo report. Add DEEPGRAM_API_KEY and GEMINI_API_KEY or ANTHROPIC_API_KEY to .env.local to get a report on your own answers.", "Scoring isn’t available right now, so this is an example. Try again in a few minutes."),
  "no-audio": "No recording was captured (the mic may be blocked), so this is the demo report.",
};

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;

function Score({ value, className }: { value: number | null; className?: string }) {
  if (value == null) return <span className={clsx("text-dim", className)}>Not scored</span>;
  return (
    <span className={className}>
      <span className={clsx("num font-semibold", value < 3 ? "text-red-soft" : "text-ink")}>{value.toFixed(1)}</span> <span className="text-muted">{scoreLabel(value)}</span>
    </span>
  );
}

function Change({ before, after, digits = 1, lowerIsBetter = false, unit = "" }: { before: number | null; after: number | null; digits?: number; lowerIsBetter?: boolean; unit?: string }) {
  const f = (n: number) => `${digits ? n.toFixed(digits) : Math.round(n)}${unit}`;
  if (after == null) return <span className="text-dim">n/a</span>;
  if (before == null) return <span className="num font-semibold">{f(after)}</span>;
  const better = lowerIsBetter ? after < before : after > before;
  const worse = lowerIsBetter ? after > before : after < before;
  return (
    <span className="num whitespace-nowrap">
      <span className="text-muted">{f(before)}</span>
      <span className="mx-1.5 text-dim">→</span>
      <b className={clsx("font-semibold", better ? "text-blue-soft" : worse ? "text-red-soft" : "text-ink")}>{f(after)}</b>
    </span>
  );
}

function Check({ ok }: { ok: boolean | null }) {
  if (ok == null) return <span className="text-dim">–</span>;
  return ok ? <Icon name="check" size={15} strokeWidth={2.6} className="text-blue-soft" /> : <Icon name="x" size={15} strokeWidth={2.4} className="text-red-soft" />;
}

/** The first words of an answer, for a quote. */
function quoteOf(answerId: string | undefined, words = 22): string | null {
  const a = answerId ? findAnswer(answerId) : undefined;
  if (!a || !a.words.length) return null;
  const text = a.words.slice(0, words).map((w) => w.text).join(" ");
  return a.words.length > words ? `${text}…` : text;
}

/** While building: what this session cost in Claude, speech and voice. Hidden once launched. */
function CostLine({ mock }: { mock?: MockRecord }) {
  if (!mock || isLaunch()) return null;
  const t = totals(usageFor({ sessionId: mock.id }));
  if (!t.costUsd && !t.claudeCalls) return null;
  const parts = [`Claude ${dollars(t.byService.claude)}`, `speech ${dollars(t.byService.deepgram)}`];
  if (t.byService.elevenlabs) parts.push(`voice ${dollars(t.byService.elevenlabs)}`);
  return (
    <div className="print-hide mt-1 text-[12px] text-dim">
      Estimated cost {dollars(t.costUsd)} ({parts.join(" · ")}){t.simulated ? ", test-mode sample, not a real charge" : ""}.{" "}
      <Link href="/settings#usage" className="underline-offset-2 hover:underline">
        Usage
      </Link>
    </div>
  );
}

function Header({ interview, mock, title, meta, right }: { interview: Interview; mock?: MockRecord; title: string; meta: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="flex animate-rise items-end justify-between gap-8">
      <div className="min-w-0">
        <Crumbs
          items={[
            { label: `${interview.company} interview`, href: `/interviews/${interview.id}` },
            { label: "Past interviews", href: `/interviews/${interview.id}/mocks` },
          ]}
        />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">{title}</h1>
        <div className="mt-1 text-sm text-muted">{meta}</div>
        <CostLine mock={mock} />
      </div>
      {right}
    </header>
  );
}

/**
 * The report after a session (design screen 7, reworked):
 *  - an interview: Ready / Nearly / Not yet, a score for each category, the
 *    changes that would raise your score most, your training (drills, Run it
 *    again, new questions) and every answer;
 *  - a re-run: before and after for every answer, each fix, the categories
 *    and how you spoke;
 *  - a drill: how each answer did on the one thing you practised.
 */
export default async function SessionReportPage({ params, searchParams }: { params: Promise<{ id: string; mockId: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { id, mockId } = await params;
  const { demo } = await searchParams;
  const interview = (await getInterviewAsync(id)) ?? getInterview(id);
  let mock = (await findMockAsync(mockId)) ?? findMock(mockId);
  if (!mock && interview?.id === "halden" && !isLaunch()) {
    mock = { ...demoMock, answerIds: [roadmapAnswer.id], planned: 6, id: mockId };
  }
  if (!interview || !mock || mock.interviewId !== interview.id) notFound();

  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const u = understandingOf(interview);
  const label = (g: MockRow["group"]) => categoryLabel(g, u.technicalLabel);
  const rows = (await rowsForAsync(mock)) ?? rowsFor(mock);
  const report = buildReport(rows, interview.interviewer.name);
  const lengthSec = Math.max(0, (Date.parse(mock.finishedAt) - Date.parse(mock.startedAt)) / 1000);
  const title = sessionTitle(mock, interview);
  const answerHref = (answerId: string, followUps = false) => `/interviews/${interview.id}/answers/${answerId}?mock=${mock.id}${followUps ? "&tab=follow-ups" : ""}`;
  const shortOf = (qid: string) => interview.questions.find((q) => q.id === qid)?.short ?? "this question";

  const demoNote = null;

  /* ------------------------------------------------------------ stopped */
  if (mock.status === "stopped" || mock.status === "planned") {
    return (
      <div className="flex grow flex-col">
        <Header interview={interview} mock={mock} title={title} meta={<>{whenSaid(mock.startedAt)}</>} />
        <Panel className="mt-5 max-w-[720px] animate-rise px-6 py-5">
          <h2 className="text-[15px] font-semibold">{mock.status === "planned" ? "Not finished" : "Stopped: rebuilt"}</h2>
          <p className="mt-1 text-sm text-muted">
            {mock.status === "planned" ? "This session was set up but never finished, so there’s nothing to report." : "You pressed Something’s wrong, so this interview wasn’t scored and the questions were rebuilt."}
          </p>
          {mock.feedback && (
            <div className="mt-3 rounded-[9px] bg-panel-2 px-3.5 py-3 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {mock.feedback.reasons.map((r) => (
                  <Chip key={r}>{WRONG_REASON_LABEL[r]}</Chip>
                ))}
              </div>
              {mock.feedback.note && <p className="mt-2 text-muted">“{mock.feedback.note}”</p>}
            </div>
          )}
          <ButtonLink href={`/interviews/${interview.id}`} className="mt-4" variant="primary">
            Back to the interview
          </ButtonLink>
        </Panel>
      </div>
    );
  }

  /* -------------------------------------------------------------- re-run */
  if (mock.kind === "rerun" && mock.rerunOf) {
    const source = findMock(mock.rerunOf);
    const beforeRows = source ? rowsFor(source) : [];
    const fixes = buildReport(beforeRows, interview.interviewer.name).fixes;
    const habits = [...new Set(fixes.map((f) => HABIT_FOR_FIX[f.id]))];
    const c = compareRuns(beforeRows, rows, habits);
    const up = c.score.before != null && c.score.after != null ? c.score.after - c.score.before : null;
    return (
      <div className="flex grow flex-col">
        {demoNote}
        <Header
          interview={interview}
          mock={mock}
          title="Run it again: before and after"
          meta={
            <>
              {whenSaid(mock.startedAt)}
              <Sep />
              The same questions as {source ? whenSaid(source.startedAt).toLowerCase() : "before"}
              <Sep />
              {countsLine(report.questionCount, report.followUpCount)}
            </>
          }
          right={
            <div className="shrink-0 text-right">
              <div className="text-[40px] font-semibold leading-none tracking-[-0.035em]">
                <Change before={c.score.before} after={c.score.after} />
              </div>
              <div className="mt-1.5 text-[13px] text-muted">{up == null ? "" : up > 0 ? `Up ${up.toFixed(1)}. ` : up < 0 ? `Down ${Math.abs(up).toFixed(1)}. ` : "No change. "}Re-runs don’t change your verdict.</div>
            </div>
          }
        />

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_400px] items-start gap-5">
          <Panel aria-label="Each answer, before and after" className="animate-rise px-6 py-5 [animation-delay:0.05s]">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[15px] font-semibold">Each answer, before and after</h2>
              {habits.length > 0 && <span className="text-[13px] text-muted">The fixes you were asked to make: {habits.map((h) => HABIT_LABEL[h].toLowerCase()).join(", ")}</span>}
            </div>
            {c.rows.map((r, k) => {
              const qb = quoteOf(r.beforeAnswerId, 18);
              const qa = quoteOf(r.afterAnswerId, 18);
              return (
                <div key={r.questionId} className={clsx("py-4", k > 0 && "border-t border-line")}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold leading-snug">{r.question}</div>
                      <div className="mt-0.5 text-xs text-muted">{r.slot ? (r.slot === "opening" ? "Opening" : "Close") : label(r.group)}</div>
                    </div>
                    <div className="text-lg">
                      <Change before={r.before} after={r.after} />
                    </div>
                  </div>
                  {r.checks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                      {r.checks.map((ch) => (
                        <span key={ch.habit} className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1" aria-label={`Before: ${ch.before == null ? "not measured" : ch.before ? "did it" : "didn’t"}`}>
                            <Check ok={ch.before} />
                          </span>
                          <span className="text-dim">→</span>
                          <span className="inline-flex items-center gap-1" aria-label={`After: ${ch.after == null ? "not measured" : ch.after ? "did it" : "didn’t"}`}>
                            <Check ok={ch.after} />
                          </span>
                          <span className="text-muted">{ch.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {(qb || qa) && (
                    <div className="mt-2.5 grid grid-cols-2 gap-3 text-[13px] leading-relaxed">
                      {[
                        ["Before", qb, r.beforeAnswerId],
                        ["After", qa, r.afterAnswerId],
                      ].map(([t, q, aid]) => (
                        <div key={t as string} className="rounded-[9px] bg-panel-2 px-3 py-2">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-semibold text-muted">{t as string}</span>
                            {aid && (
                              <Link href={answerHref(aid as string)} className="font-semibold text-blue-soft hover:underline">
                                Open
                              </Link>
                            )}
                          </div>
                          <p className="mt-1 text-[#c9cad3]">{q ? `“${q as string}”` : "Not answered"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel aria-label="Fixes made" className="animate-rise px-6 py-5 [animation-delay:0.08s]">
              <h2 className="text-[15px] font-semibold">Fixes made</h2>
              <div className="num mt-1 text-[28px] font-semibold tracking-[-0.02em]">
                {c.fixesMade.made} <span className="text-lg text-muted">of {c.fixesMade.of}</span>
              </div>
              <p className="text-[13px] text-muted">Times you did what you were asked, across every answer.</p>
            </Panel>
            <Panel aria-label="By category" className="animate-rise px-6 py-5 [animation-delay:0.1s]">
              <h2 className="text-[15px] font-semibold">By category</h2>
              {c.categories.map((x) => (
                <div key={x.group} className="flex items-center justify-between border-t border-line py-2 text-sm first-of-type:border-t-0">
                  <span>{label(x.group)}</span>
                  <Change before={x.before} after={x.after} />
                </div>
              ))}
            </Panel>
            <Panel aria-label="How you spoke" className="animate-rise px-6 py-5 [animation-delay:0.12s]">
              <h2 className="text-[15px] font-semibold">How you spoke</h2>
              <div className="flex items-center justify-between border-t border-line py-2 text-sm first-of-type:border-t-0">
                <span>Filler words a minute</span>
                <Change before={c.delivery.fillersPerMin[0]} after={c.delivery.fillersPerMin[1]} lowerIsBetter />
              </div>
              <div className="flex items-center justify-between border-t border-line py-2 text-sm">
                <span>Words a minute</span>
                <Change before={c.delivery.wordsPerMin[0]} after={c.delivery.wordsPerMin[1]} digits={0} />
              </div>
              <div className="flex items-center justify-between border-t border-line py-2 text-sm">
                <span>Average answer</span>
                <span className="num whitespace-nowrap">
                  {c.delivery.avgLengthSec[0] != null && <span className="text-muted">{mmss(c.delivery.avgLengthSec[0])}</span>}
                  {c.delivery.avgLengthSec[0] != null && <span className="mx-1.5 text-dim">→</span>}
                  <b className="font-semibold">{c.delivery.avgLengthSec[1] != null ? mmss(c.delivery.avgLengthSec[1]) : "n/a"}</b>
                </span>
              </div>
            </Panel>
            <Panel className="animate-rise px-6 py-5 [animation-delay:0.14s]">
              <h2 className="text-[15px] font-semibold">Next</h2>
              <p className="mt-0.5 text-[13px] text-muted">Your verdict comes from interviews with new questions. Test what you’ve learned on ones you haven’t heard.</p>
              <ButtonLink href={`/interviews/${interview.id}#new-questions`} variant="primary" className="mt-3 w-full">
                New questions
              </ButtonLink>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- drill */
  if (mock.kind === "drill" && mock.drill) {
    const d = mock.drill;
    const habit = d.habit;
    const done = d.kind === "habit" && habit ? rows.filter((r) => rowHabit(r, habit)).length : null;
    const first = rows[0];
    const stage = payStage(interview.round);
    const payRows = d.kind === "pay" ? rows.map((r) => ({ r, checks: payChecks(r.questionId, findAnswer(r.answerId ?? "")?.words ?? [], stage) })) : [];
    const payMarked = payRows.flatMap((x) => x.checks).filter((c) => c.ok != null);
    const summary =
      d.kind === "pay"
        ? `${payMarked.filter((c) => c.ok).length} of ${payMarked.length} checks, across ${rows.length} answer${rows.length === 1 ? "" : "s"}.`
        : d.kind === "fix" && first
        ? `${d.before != null && first.overall != null ? `${d.before.toFixed(1)} → ${first.overall.toFixed(1)} on the same question` : `${first.overall?.toFixed(1) ?? "n/a"} on the same question`}${rows[1]?.overall != null ? `, and ${rows[1].overall.toFixed(1)} on a new one.` : "."}`
        : d.kind === "habit" && habit
          ? `${done} of ${rows.length} answer${rows.length === 1 ? "" : "s"}: ${HABIT_LABEL[habit].toLowerCase()}.`
          : d.kind === "pressure" && first
            ? `${first.followUps.length} follow-up${first.followUps.length === 1 ? "" : "s"}, averaging ${first.followUps.filter((f) => f.overall != null).length ? (first.followUps.reduce((n, f) => n + (f.overall ?? 0), 0) / Math.max(1, first.followUps.filter((f) => f.overall != null).length)).toFixed(1) : "n/a"}.`
            : report.score != null
              ? `${report.score.toFixed(1)} across ${rows.length} question${rows.length === 1 ? "" : "s"}.`
              : "";
    return (
      <div className="flex grow flex-col">
        {demoNote}
        <Header
          interview={interview}
          mock={mock}
          title={`Drill: ${title}`}
          meta={
            <>
              {whenSaid(mock.startedAt)}
              <Sep />
              {countsLine(report.questionCount, report.followUpCount)}
              <Sep />
              {minutesLong(lengthSec)}
            </>
          }
          right={
            <div className="shrink-0 text-right">
              <div className="text-[13px] text-muted">How it went</div>
              <div className="mt-0.5 max-w-[420px] text-lg font-semibold">{summary}</div>
            </div>
          }
        />
        <Panel aria-label="Each answer" className="mt-5 animate-rise px-6 py-4 [animation-delay:0.05s]">
          {rows.map((r, k) => {
            const a = r.answerId ? findAnswer(r.answerId) : undefined;
            const before = d.kind === "fix" && k === 0 ? d.before ?? null : null;
            return (
              <div key={r.number} className={clsx("grid grid-cols-[28px_minmax(0,1fr)_200px] gap-4 py-3.5", k > 0 && "border-t border-line")}>
                <span className="num pt-0.5 text-dim">{r.number}</span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold leading-snug">
                    {r.answerId ? (
                      <Link href={answerHref(r.answerId)} className="hover:underline">
                        {r.question}
                      </Link>
                    ) : (
                      r.question
                    )}
                  </div>
                  {d.kind === "fix" && <div className="mt-0.5 text-xs text-muted">{k === 0 ? "The same question, with one change" : "A new question on the same skill"}</div>}
                  {d.kind === "pay" && (
                    <ul className="mt-1.5 space-y-1">
                      {(payRows.find((x) => x.r === r)?.checks ?? []).map((c) => (
                        <li key={c.label} className={clsx("flex items-start gap-1.5 text-[13px]", c.ok === true ? "text-blue-soft" : c.ok === false ? "text-red-soft" : "text-muted")}>
                          {c.ok == null ? <Icon name="flag" size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" /> : <Check ok={c.ok} />}
                          <span className="text-ink">
                            {c.label}
                            {c.note && <span className="text-muted"> {c.note}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {habit && (
                    <div className={clsx("mt-1.5 flex items-center gap-1.5 text-[13px]", rowHabit(r, habit) ? "text-blue-soft" : rowHabit(r, habit) === false ? "text-red-soft" : "text-muted")}>
                      <Check ok={rowHabit(r, habit)} />
                      <span className="text-ink">{habitLine(r, habit)}</span>
                    </div>
                  )}
                  {a?.oneFix && <p className="mt-1.5 text-[13px] text-muted">One fix: {a.oneFix}</p>}
                  {r.followUps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {r.followUps.map((f, j) => (
                        <div key={j} className="flex items-center justify-between gap-3 text-[13px]">
                          <span className="truncate text-[#c9cad3]">
                            <span className="mr-1.5 text-dim">↳</span>
                            {f.question}
                          </span>
                          <Score value={f.overall} className="shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-base">{before != null ? <Change before={before} after={r.overall} /> : <Score value={r.overall} />}</div>
              </div>
            );
          })}
        </Panel>
        {d.kind === "pay" && (
          <Panel aria-label="When to raise pay" className="mt-5 animate-rise px-6 py-5 [animation-delay:0.08s]">
            <h2 className="text-[15px] font-semibold">Talking about pay in {PAY_STAGE_LABEL[stage]}</h2>
            <p className="mt-1 text-sm text-muted">{PAY_TIPS[stage].when}</p>
            <div className="mt-3 grid grid-cols-2 gap-5">
              <div>
                <div className="text-[13px] font-semibold">Good questions to ask</div>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {PAY_TIPS[stage].ask.map((q) => (
                    <li key={q}>“{q}”</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[13px] font-semibold">Avoid</div>
                <p className="mt-1.5 text-sm">{PAY_TIPS[stage].avoid}</p>
                <p className="mt-3 text-xs text-dim">Practising for a different round? The round comes from your question mix: Screening call for a recruiter, Final round for an offer.</p>
              </div>
            </div>
          </Panel>
        )}
        <div className="mt-5 flex items-center justify-end gap-3">
          <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: d }}>
            <Icon name="repeat" size={15} strokeWidth={2} />
            Do it again
          </StartButton>
          <ButtonLink href={`/interviews/${interview.id}`} variant="primary">
            Back to your training
          </ButtonLink>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------- interview */
  const prev = previousScore(mock);
  const fresh = isFresh(mock);
  const latestFresh = doneSessions(interview.id).find(isFresh);
  const isLatest = latestFresh?.id === mock.id;
  const rerun = fresh ? rerunOf(mock.id) : undefined;
  const canRerun = fresh && rerun?.status !== "done";
  const storiesBuilt = new Set((interview.stories ?? []).map((s) => s.skill).filter(Boolean));
  const doneDrills = doneSessions(interview.id).filter((m) => m.kind === "drill" && m.drill?.fromSession === mock.id).map((m) => m.drill!);
  const drills = fresh
    ? suggestDrills({ sessionId: mock.id, rows, fixes: report.fixes, categories: report.categories, gaps: (interview.gaps ?? []).filter((g) => !storiesBuilt.has(g.skill)), technicalLabel: u.technicalLabel, shortOf }).map((x) => ({
        ...x,
        done: doneDrills.some((y) => y.kind === x.spec.kind && y.questionId === x.spec.questionId && y.group === x.spec.group && y.habit === x.spec.habit),
      }))
    : [];
  const drillMinutes = drills.reduce((n, x) => n + x.minutes, 0);
  const skipped = mock.skipped ?? [];
  const replacedCount = skipped.filter((s) => s.reason !== "by-choice").length;
  const skippedByChoice = skipped.filter((s) => s.reason === "by-choice").length;
  const endedEarly = report.questionCount < mock.planned - replacedCount - skippedByChoice;
  const isFullInterview =
    (mock.kind === "interview" || mock.kind === "full") &&
    mock.status === "done" &&
    !endedEarly &&
    report.questionCount >= 2;
  const textOf = (qid: string) => interview.questions.find((q) => q.id === qid)?.text ?? "A question";
  const overallOf = (qid: string) => rows.find((r) => r.questionId === qid)?.overall ?? undefined;

  return (
    <div className="flex grow flex-col">
      {demoNote}
      <InterviewReportView
        interview={interview}
        mock={mock}
        rows={rows}
        report={report}
        whenFormatted={whenSaid(mock.startedAt)}
        durationFormatted={minutesLong(lengthSec)}
        difficultyFormatted="Medium"
        isFullInterview={isFullInterview}
        endedEarly={endedEarly}
        micOk={micOk}
      />
    </div>
  );
}
