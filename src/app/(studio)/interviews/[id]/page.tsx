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
import { VERDICT_LABEL, mockScore } from "@/lib/mocks/report";
import { rowsFor } from "@/lib/mocks/store";
import { readinessFor, readinessText, scoreLabel } from "@/lib/scoring/combine";
import { interviewWhen, sessionSettingsText, sessionTitle } from "@/lib/sessions/labels";
import { whenSaid } from "@/lib/format";
import { AddQuestion, RemoveQuestion } from "@/components/interview/AddQuestion";
import { DeleteInterview } from "@/components/interview/DeleteInterview";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { NewInterviewPanel, StartButton } from "@/components/interview/StartSession";
import { PAY_STAGE_LABEL, payStage } from "@/lib/sessions/pay";
import { DRILL_MINUTES } from "@/lib/sessions/drills";

export const dynamic = "force-dynamic"; // scores change as you practise

const verdictTone = { ready: "text-blue-soft", nearly: "text-lilac", "not-yet": "text-red-soft" } as const;

/**
 * An interview's home: what Hakkiri understood about the job, your settings
 * and Start; then, once you've had an interview, where you stand (Ready,
 * Nearly or Not yet, by category), the drills your last report suggested,
 * "Run it again", and new questions that lean towards your weakest category.
 */
export default async function InterviewOverview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string; rebuilt?: string }> }) {
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold">Talking about pay</div>
        <div className="mt-0.5 text-[13px] leading-snug text-muted">
          “What are your salary expectations?”, what you earn now, a push-back, then asking about the package. Written for {PAY_STAGE_LABEL[stage]}. <span className="num text-dim">{DRILL_MINUTES.pay} min</span>
        </div>
      </div>
      <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: { kind: "pay" } }} size="sm">
        {payDone ? "Again" : "Start"}
      </StartButton>
    </div>
  );

  const understood = (
    <Panel aria-label="What Hakkiri understood" className="animate-rise px-6 py-5 [animation-delay:0.05s]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold">What Hakkiri understood</h2>
        <Link href={`/interviews/${interview.id}/rebuild?edit=1`} className="text-[13px] font-semibold text-blue-soft hover:underline">
          Not right? Edit it
        </Link>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed">
        <b className="font-semibold">{u.role}</b>, {u.level.toLowerCase()}: {u.field}.
      </p>
      <dl className="mt-3">
        {CATEGORY_ORDER.map((g) => (
          <div key={g} className="grid grid-cols-[124px_1fr] gap-3 border-t border-line py-2 text-sm">
            <dt className={clsx("font-semibold", !settings.mix[g] && "text-dim")}>{categoryLabel(g, u.technicalLabel)}</dt>
            <dd className="text-muted">{u.meanings[g]}</dd>
          </div>
        ))}
      </dl>
      {(interview.rules ?? []).length > 0 && (
        <div className="mt-2 rounded-[9px] bg-panel-2 px-3 py-2.5 text-[13px]">
          <div className="font-semibold">Following your feedback</div>
          <ul className="mt-1 space-y-0.5 text-muted">
            {interview.rules!.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 text-[13px]">
        <span className="text-muted">
          {custom.length ? `${custom.length} question${custom.length === 1 ? "" : "s"} of your own, asked in your next interview.` : "Expecting a particular question? Add it and it’s asked next time."}
        </span>
        <AddQuestion interviewId={interview.id} />
      </div>
      {custom.map((q) => (
        <div key={q.id} className="relative mt-2 rounded-[9px] bg-panel-2 py-2 pl-3 pr-9 text-sm">
          {q.text}
          <RemoveQuestion interviewId={interview.id} id={q.id} />
        </div>
      ))}
      <p className="mt-3 text-xs leading-relaxed text-dim">
        Built from {[src.cv, src.coverLetter, src.job, src.company].filter(Boolean).join(", ") || "the details you gave"}.
        {interview.planBy === "templates" && devOr(" Standard questions for now: add ANTHROPIC_API_KEY to .env.local for questions built from your documents.", " Standard questions for now.")}
      </p>
    </Panel>
  );

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[13px] bg-halden text-[22px] font-bold text-[#ddebe5]">
            {interview.companyInitial}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.02em]">{interview.role}</h1>
            <div className="mt-0.5 text-sm text-muted">
              {interview.company}
              <Sep />
              {when.text}
              {when.rel && when.rel !== "done" && (
                <>
                  <Sep />
                  <b className="font-semibold text-ink">{when.rel}</b>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!isDemoInterview(interview.id) && <DeleteInterview id={interview.id} company={interview.company} />}
          {started && (
            <ButtonLink href="#new-questions" variant="primary">
              <Icon name="mic" size={16} strokeWidth={2} />
              New questions
            </ButtonLink>
          )}
        </div>
      </header>

      {isNew && (
        <div role="status" className="mt-5 animate-rise rounded-[12px] bg-blue/12 px-5 py-3.5 text-sm text-lilac shadow-[inset_0_0_0_1px_rgb(123_136_255/0.3)]">
          <b className="font-semibold text-ink">Your interview is ready.</b> Check what Hakkiri understood about the job, then start. The questions stay hidden until {interview.interviewer.name} asks them, like the real thing.
          {(interview.setupNotes ?? []).map((n) => (
            <div key={n} className="mt-1.5 flex items-start gap-2 text-[13px] text-red-soft">
              <Icon name="flag" size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
              {n}
            </div>
          ))}
        </div>
      )}
      {rebuilt && (
        <div role="status" className="mt-5 animate-rise rounded-[12px] bg-blue/12 px-5 py-3.5 text-sm text-lilac shadow-[inset_0_0_0_1px_rgb(123_136_255/0.3)]">
          <b className="font-semibold text-ink">Questions rebuilt.</b> The ones you hadn’t heard were set aside, and new ones were written for what you told Hakkiri.
        </div>
      )}

      <InterviewTabs id={interview.id} current="overview" prepReady={started} />

      {!started ? (
        <div className="mt-5 grid grow grid-cols-[minmax(0,1fr)_560px] items-start gap-5">
          {understood}
          <Panel id="new-questions" aria-label="Your interview" className="scroll-mt-6 animate-rise px-6 py-5 [animation-delay:0.1s]">
            <h2 className="text-[15px] font-semibold">Your interview</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              With {interview.interviewer.name}, the {interview.interviewer.title}. Feedback comes at the end.
            </p>
            <div className="mt-4">
              <NewInterviewPanel interviewId={interview.id} micOk={micOk} initial={settings} meanings={u.meanings} technicalLabel={u.technicalLabel} label="Start interview" />
            </div>
            <div className="mt-4 border-t border-line pt-4">{payDrill}</div>
          </Panel>
        </div>
      ) : (
        <div className="mt-5 grid grow grid-cols-[minmax(0,1fr)_560px] items-start gap-5">
          <div className="flex min-w-0 flex-col gap-5">
            <Panel aria-label="Where you stand" className="animate-rise px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-[15px] font-semibold">Where you stand</h2>
                  <p className="mt-0.5 text-[13px] text-muted">From your last interview with new questions, {whenSaid(st.last!.startedAt).toLowerCase()}. Re-runs and drills don’t change it.</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className={clsx("text-2xl font-semibold tracking-[-0.02em]", verdictTone[st.verdict!])}>{VERDICT_LABEL[st.verdict!]}</div>
                  <div className="num mt-0.5 text-[13px] text-muted">{st.report?.score?.toFixed(1) ?? "n/a"} overall</div>
                </div>
              </div>
              <div className="mt-3">
                {CATEGORY_ORDER.filter((g) => st.categories[g] != null).map((g) => {
                  const score = st.categories[g]!;
                  const level = readinessFor(score);
                  const label = categoryLabel(g, u.technicalLabel);
                  return (
                    <div key={g} className="grid grid-cols-[132px_1fr_92px] items-center gap-[18px] py-[8px]">
                      <span className="text-sm font-medium">{label}</span>
                      <Meter value={score} tone={level} label={`${label}: ${score} out of 5, ${readinessText(score)}`} />
                      <span className={`text-right text-[13px] font-semibold ${toneText[level]}`}>
                        <span className="num">{score.toFixed(1)}</span> {readinessText(score)}
                      </span>
                    </div>
                  );
                })}
                {st.report?.openingClose != null && (
                  <div className="grid grid-cols-[132px_1fr_92px] items-center gap-[18px] py-[8px]">
                    <span className="text-sm font-medium">Opening and close</span>
                    <Meter value={st.report.openingClose} tone={readinessFor(st.report.openingClose)} label={`Opening and close: ${st.report.openingClose} out of 5`} />
                    <span className={`text-right text-[13px] font-semibold ${toneText[readinessFor(st.report.openingClose)]}`}>
                      <span className="num">{st.report.openingClose.toFixed(1)}</span> {readinessText(st.report.openingClose)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-end border-t border-line pt-3">
                <ButtonLink href={`/interviews/${interview.id}/mocks/${st.last!.id}`} size="sm">
                  Open the last report
                </ButtonLink>
              </div>
            </Panel>

            <Panel id="new-questions" aria-label="New questions" className="scroll-mt-6 animate-rise px-6 py-5 [animation-delay:0.1s]">
              <h2 className="text-[15px] font-semibold">Next interview, new questions</h2>
              <p className="mt-0.5 text-[13px] text-muted">Never a question you’ve had. Change anything first, or keep your last settings.</p>
              <div className="mt-4">
                <NewInterviewPanel interviewId={interview.id} micOk={micOk} initial={settings} meanings={u.meanings} technicalLabel={u.technicalLabel} lean={lean} label="Start with new questions" />
              </div>
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Panel aria-label="Your training" className="animate-rise px-6 py-5 [animation-delay:0.05s]">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold">Your training</h2>
                <span className="text-[13px] text-muted">From your last report</span>
              </div>
              {st.drills.length === 0 && <p className="mt-2 text-sm text-muted">Nothing stood out to drill. Try a harder interview, or new questions.</p>}
              {st.drills.map((d, k) => (
                <div key={k} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-line py-3 first-of-type:border-t-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {d.done && <Icon name="check" size={15} strokeWidth={2.4} className="shrink-0 text-blue-soft" />}
                      {d.title}
                    </div>
                    <div className="mt-0.5 text-[13px] leading-snug text-muted">
                      {d.detail} <span className="num text-dim">{d.minutes} min</span>
                    </div>
                  </div>
                  {d.spec.kind === "story" ? (
                    <ButtonLink href={`/interviews/${interview.id}/story?skill=${encodeURIComponent(d.spec.skill ?? "")}&question=${encodeURIComponent(d.spec.question ?? "")}`} size="sm">
                      {d.done ? "Again" : "Build it"}
                    </ButtonLink>
                  ) : (
                    <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "drill", drill: d.spec }} size="sm">
                      {d.done ? "Again" : "Start"}
                    </StartButton>
                  )}
                </div>
              ))}
              {st.canRerun && (
                <div className="mt-1 grid grid-cols-[1fr_auto] items-center gap-4 rounded-[10px] bg-panel-2 px-3.5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Run it again</div>
                    <div className="mt-0.5 text-[13px] leading-snug text-muted">The same questions once more, with your top fixes. See every answer before and after. It shows progress but doesn’t change your verdict.</div>
                  </div>
                  <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "rerun", sessionId: st.last!.id }} size="sm">
                    <Icon name="repeat" size={15} strokeWidth={2} />
                    Run it again
                  </StartButton>
                </div>
              )}
              <div className="mt-1 border-t border-line pt-3">{payDrill}</div>
            </Panel>

            <Panel aria-label="Prep sheet" className="flex animate-rise items-center justify-between gap-4 px-6 py-4 [animation-delay:0.08s]">
              <div>
                <h2 className="text-[15px] font-semibold">Your prep sheet</h2>
                <p className="mt-0.5 text-[13px] text-muted">One page from your own practice: best answers, stories, CV probes, questions to ask.</p>
              </div>
              <ButtonLink href={`/interviews/${interview.id}/prep`} size="sm">
                <Icon name="doc" size={15} />
                Open
              </ButtonLink>
            </Panel>

            <Panel aria-label="Past interviews" className="animate-rise px-6 py-4 [animation-delay:0.1s]">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold">Recent</h2>
                <Link href={`/interviews/${interview.id}/mocks`} className="text-[13px] font-semibold text-blue-soft hover:underline">
                  See all
                </Link>
              </div>
              {st.sessions.slice(0, 4).map((m) => {
                const score = mockScore(rowsFor(m));
                return (
                  <Link key={m.id} href={`/interviews/${interview.id}/mocks/${m.id}`} className="mt-1 grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border-t border-line px-1 py-2.5 text-sm first-of-type:border-t-0 hover:bg-white/[0.03]">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{sessionTitle(m, interview)}</span>
                      <span className="ml-2 text-muted">{[sessionSettingsText(m), whenSaid(m.startedAt)].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="text-right">{score != null ? <b className={clsx("num font-semibold", score < 3 && "text-red-soft")}>{score.toFixed(1)}</b> : <span className="text-dim">n/a</span>} <span className="text-muted">{score != null ? scoreLabel(score) : ""}</span></span>
                  </Link>
                );
              })}
            </Panel>

            {understood}
          </div>
        </div>
      )}
    </div>
  );
}
