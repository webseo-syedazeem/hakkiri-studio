import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Icon, Sep } from "@/components/ui";
import { SlideView } from "@/components/pitch/SlideView";
import { getPresentation, getPresentationAsync, isDemoPresentation, listQa, listRuns } from "@/lib/pitch/store";
import { DeleteInterview } from "@/components/interview/DeleteInterview";
import { AUDIENCE_LABEL, QA_STYLE_LABEL } from "@/lib/pitch/labels";
import { londonToday } from "@/lib/dates";
import { clock, daysBetween, longDay, minutesLong, mmss } from "@/lib/format";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

export default async function PresentationWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const p = (await getPresentationAsync(id, user.id)) ?? getPresentation(id, user.id);
  if (!p) notFound();
  const runs = listRuns(p.id, user.id);
  const qa = listQa(p.id, user.id);
  const days = daysBetween(londonToday(), p.date);

  const hasRuns = runs.length > 0;
  const fullRuns = runs.filter((r) => r.mode === "full");
  const isReady =
    fullRuns.length >= 2 &&
    (fullRuns[0].overall ?? 0) >= 4 &&
    fullRuns[0].totalSec <= p.timeLimitSec &&
    (fullRuns[1].overall ?? 0) >= 4 &&
    fullRuns[1].totalSec <= p.timeLimitSec;

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-ink">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm">
            <Icon name="present" size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">{p.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{p.audience === "leadership" ? "Leadership team" : AUDIENCE_LABEL[p.audience]}</span>
              <Sep />
              <span>{longDay(p.date)}, {clock(p.date)}</span>
              <Sep />
              <span>{minutesLong(p.timeLimitSec)}</span>
              {days >= 0 && (
                <>
                  <Sep />
                  <span className="font-semibold text-ink">
                    {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {!isDemoPresentation(p.id) && <DeleteInterview id={p.id} company={p.title} kind="presentation" />}
          <Link
            href={`/presentations/${p.id}/edit`}
            className="px-4 py-2 rounded-xl bg-panel border border-line-strong hover:bg-panel-2 hover:border-blue-fill/50 text-xs font-semibold text-ink shadow-sm transition-all dark:bg-[#141326] dark:border-white/10 dark:text-white"
          >
            Set-up and timing
          </Link>
          <Link
            href={`/rehearse/${p.id}`}
            className="pro-btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-fill hover:bg-blue-hover text-xs font-semibold text-white shadow-md transition-all"
          >
            <Icon name="play" size={13} />
            <span>Start full run, {Math.round(p.timeLimitSec / 60)} min</span>
          </Link>
        </div>
      </header>

      {/* 2. TOP 2 CARDS (Presentation readiness & Performance by area) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: Presentation readiness */}
        <div className="rounded-2xl bg-panel border border-line p-6 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-ink tracking-tight">Presentation readiness</h2>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Use your rehearsals to improve each part of the presentation before the real session.
            </p>

            {/* Readiness Box */}
            {!hasRuns ? (
              <div className="mt-4 p-4 rounded-xl bg-panel-2 border border-line flex items-start gap-3">
                <Icon name="info" size={17} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-ink">No runs yet</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-relaxed">
                    Start your first rehearsal to measure timing, slide coverage, and delivery.
                  </div>
                </div>
              </div>
            ) : isReady ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                <Icon name="checkCircle" size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Ready for this presentation</div>
                  <div className="text-[11px] text-emerald-800/80 dark:text-[#c4f0db] mt-0.5 leading-relaxed">
                    Two full runs in a row scored 4 or more and finished inside {mmss(p.timeLimitSec)}.
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                <Icon name="alertCircle" size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Not ready yet</div>
                  <div className="text-[11px] text-rose-800/80 dark:text-[#e8c8ce] mt-0.5 leading-relaxed">
                    Ready when two full runs in a row score 4 or more and finish inside {mmss(p.timeLimitSec)}.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Past runs badges */}
          {hasRuns && (
            <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-line">
              {runs.slice(0, 2).map((r) => {
                const passed = (r.overall ?? 0) >= 4 && r.totalSec <= p.timeLimitSec;
                return (
                  <span
                    key={r.id}
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border",
                      passed
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25"
                    )}
                  >
                    <Icon name={passed ? "check" : "x"} size={12} strokeWidth={2.4} />
                    Run {r.number}: {r.overall ? r.overall.toFixed(1) : "—"}, {mmss(r.totalSec)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Performance by area */}
        <div className="rounded-2xl bg-panel border border-line p-6 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="text-base font-bold text-ink tracking-tight">Performance by area</h2>
              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-sm bg-rose-500" />
                  Needs work
                </span>
                <span className="inline-flex items-center gap-1 text-blue-fill dark:text-indigo-300">
                  <span className="h-2 w-2 rounded-sm bg-indigo-500 dark:bg-indigo-400" />
                  On track
                </span>
                <span className="inline-flex items-center gap-1 text-muted">
                  <span className="h-2 w-2 rounded-sm bg-line-strong dark:bg-white/20" />
                  Not covered
                </span>
              </div>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Area 1: Opening */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Icon name="flag" size={14} className="text-muted" />
                    <span>Opening</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">Not yet</span>
                </div>
                <div className="text-[11px] text-muted">How clearly you set the context and hook the audience</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 6 ? "bg-rose-500" : "bg-panel-2 border border-line/60 dark:bg-white/[0.08] dark:border-0"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 2: Message and ask */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Icon name="layers" size={14} className="text-muted" />
                    <span>Message and ask</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-fill dark:text-indigo-300">Nearly</span>
                </div>
                <div className="text-[11px] text-muted">Whether your main recommendation and final ask are clear</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 15 ? "bg-indigo-500 dark:bg-indigo-400" : "bg-panel-2 border border-line/60 dark:bg-white/[0.08] dark:border-0"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 3: Timing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Icon name="clock" size={14} className="text-muted" />
                    <span>Timing</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">Not yet</span>
                </div>
                <div className="text-[11px] text-muted">How well you keep to the planned time overall</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 9 ? "bg-rose-500" : "bg-panel-2 border border-line/60 dark:bg-white/[0.08] dark:border-0"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 4: Q&A */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Icon name="chat" size={14} className="text-muted" />
                    <span>Q&A</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-fill dark:text-indigo-300">Nearly</span>
                </div>
                <div className="text-[11px] text-muted">How clearly and confidently you answer questions</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 16 ? "bg-indigo-500 dark:bg-indigo-400" : "bg-panel-2 border border-line/60 dark:bg-white/[0.08] dark:border-0"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM 2 COLUMNS (Slide plan on Left, Modes & Runs on Right) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.38fr_0.82fr] gap-6 items-start">
        {/* LEFT: Your slide plan */}
        <div className="rounded-2xl bg-panel border border-line p-6 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08]">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">Your slide plan</h2>
              <p className="text-xs text-muted mt-0.5">The point each slide needs to land. Rehearse any slide on its own.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-panel-2 border border-line text-muted num dark:bg-[#141326] dark:border-white/10">
              {p.slides.length} slides, {mmss(p.slides.reduce((a, s) => a + s.plannedSec, 0))}
            </span>
          </div>

          <div className="divide-y divide-line mt-1">
            {p.slides.map((s) => (
              <div key={s.n} className="py-3 flex items-center justify-between gap-4 group hover:bg-panel-2/70 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-9 rounded bg-panel-2 border border-line text-ink overflow-hidden shadow-xs flex items-center justify-center font-bold text-xs shrink-0">
                    {s.n}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink truncate group-hover:text-blue-soft transition-colors">
                      {s.n}. {s.title}
                    </div>
                    <div className="text-[11px] text-muted truncate mt-0.5">{s.point}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="num text-xs font-semibold text-muted">{mmss(s.plannedSec)}</span>
                  <Link
                    href={`/rehearse/${p.id}?from=${s.n}&to=${s.n}`}
                    className="text-xs font-semibold text-blue-soft hover:underline px-2.5 py-1 rounded-lg hover:bg-blue-fill/10 transition-colors"
                  >
                    Rehearse
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Rehearsal modes, Recent runs, Audience Q&A */}
        <div className="space-y-5">
          {/* Card 1: Rehearsal modes */}
          <div className="rounded-2xl bg-panel border border-line p-5 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-fill dark:bg-indigo-500/15 dark:text-indigo-300">
                <Icon name="zap" size={14} />
              </div>
              <h3 className="text-sm font-bold text-ink tracking-tight">Rehearsal modes</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-line pb-3">Choose how you want to practise.</p>

            <div className="space-y-2">
              <Link
                href={`/rehearse/${p.id}`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-panel-2 border border-line hover:border-blue-fill/50 hover:bg-panel dark:bg-[#141326] dark:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-fill/12 text-blue-fill group-hover:bg-blue-fill/20 transition-colors">
                    <Icon name="play" size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink group-hover:text-blue-soft transition-colors">Full run</div>
                    <div className="text-[11px] text-muted">Every slide, with timing. {Math.round(p.timeLimitSec / 60)} minutes.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-ink transition-colors shrink-0" />
              </Link>

              <Link
                href={`/qa/${p.id}`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-panel-2 border border-line hover:border-purple-500/50 hover:bg-panel dark:bg-[#141326] dark:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/12 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Icon name="chat" size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Q&A only</div>
                    <div className="text-[11px] text-muted">Sceptical audience, four questions, about 8 minutes.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-ink transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card 2: Recent runs */}
          <div className="rounded-2xl bg-panel border border-line p-5 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-fill dark:bg-indigo-500/15 dark:text-indigo-300">
                <Icon name="chart" size={14} />
              </div>
              <h3 className="text-sm font-bold text-ink tracking-tight">Recent runs</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-line pb-3">Your latest rehearsals, with time, score and a quick note.</p>

            <div className="space-y-2">
              {hasRuns ? (
                runs.map((r) => {
                  const reached = r.slides.length;
                  const isCompleted = reached >= p.slides.length;
                  const note = isCompleted
                    ? r.overall && r.overall >= 4
                      ? "Target met."
                      : "Completed run."
                    : `Delivered ${mmss(r.totalSec)}, reached slide ${reached} of ${p.slides.length}.`;
                  return (
                    <Link
                      key={r.id}
                      href={`/presentations/${p.id}/runs/${r.id}`}
                      className="p-2.5 rounded-xl bg-panel-2 border border-line hover:border-blue-fill/50 hover:bg-panel dark:bg-[#141326] dark:border-white/10 flex items-center justify-between text-xs transition-all group"
                    >
                      <div>
                        <div className="font-semibold text-ink group-hover:text-blue-soft transition-colors">
                          Run {r.number}: {r.mode === "full" ? "full run" : r.mode}
                        </div>
                        <div className="text-[11px] text-muted mt-0.5">{note}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="num font-semibold text-ink">{mmss(r.totalSec)}</span>
                        <span className="mx-1.5 text-muted">·</span>
                        <span className={clsx("num font-bold", r.overall && r.overall < 3.2 ? "text-rose-600 dark:text-rose-400" : "text-ink")}>
                          {r.overall ? r.overall.toFixed(1) : "—"}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-panel-2 border border-line dark:bg-[#141326] dark:border-white/10 text-xs text-muted text-center">
                  No runs yet. Start your first rehearsal.
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Audience Q&A */}
          <div className="rounded-2xl bg-panel border border-line p-5 shadow-md dark:bg-[#0d0c1c] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-fill dark:bg-indigo-500/15 dark:text-indigo-300">
                <Icon name="users" size={14} />
              </div>
              <h3 className="text-sm font-bold text-ink tracking-tight">Audience Q&A</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-line pb-3">Questions based on your chosen audience.</p>

            {qa.length > 0 ? (
              <div className="space-y-2">
                {qa.map((q) => (
                  <Link
                    key={q.id}
                    href={`/presentations/${p.id}/qa/${q.id}`}
                    className="p-3 rounded-xl bg-panel-2 border border-line hover:border-blue-fill/50 hover:bg-panel dark:bg-[#141326] dark:border-white/10 flex items-center justify-between text-xs transition-all group"
                  >
                    <div>
                      <div className="font-semibold text-ink group-hover:text-blue-soft transition-colors">
                        {q.persona.name}, {q.persona.title}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {QA_STYLE_LABEL[q.style] || q.style}, {q.questions?.length ?? 4} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="num font-bold text-ink">{q.overall ? q.overall.toFixed(1) : "—"}</span>
                        <span className="text-[11px] text-muted block">
                          {q.overall && q.overall >= 4 ? "Effective" : q.overall ? "Solid" : "Completed"}
                        </span>
                      </div>
                      <Icon name="chevronRight" size={13} className="text-muted group-hover:text-ink transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-panel-2 border border-line dark:bg-[#141326] dark:border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ink">No Q&A sessions yet</div>
                  <div className="text-[11px] text-muted mt-0.5">Practise answering tough questions for this talk.</div>
                </div>
                <Link
                  href={`/qa/${p.id}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-fill hover:bg-blue-hover text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Start Q&A
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
