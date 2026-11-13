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

  const demoRecentRuns = [
    { label: "Run 4: full run", time: "2:37", score: "1.6", note: "Too short, needs more depth.", href: `/presentations/${p.id}/runs/demo-run-4` },
    { label: "Run 3: full run", time: "11:20", score: "3.6", note: "Closer, timing slightly over.", href: `/presentations/${p.id}/runs/demo-run-3` },
    { label: "Run 2: full run", time: "12:10", score: "3.4", note: "Good structure, over time.", href: `/presentations/${p.id}/runs/demo-run-2` },
    { label: "Run 1: full run", time: "13:05", score: "3.0", note: "Clear, but too long.", href: `/presentations/${p.id}/runs/demo-run-1` },
  ];

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
      {/* 1. HEADER (Matching Image 3) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shadow-md">
            <Icon name="present" size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{p.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{p.audience === "leadership" ? "Leadership team" : AUDIENCE_LABEL[p.audience]}</span>
              <Sep />
              <span>{longDay(p.date)}, {clock(p.date)}</span>
              <Sep />
              <span>{minutesLong(p.timeLimitSec)}</span>
              {days >= 0 && (
                <>
                  <Sep />
                  <span className="font-semibold text-white">
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
            className="px-4 py-2 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all"
          >
            Set-up and timing
          </Link>
          <Link
            href={`/rehearse/${p.id}`}
            className="pro-btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-blue hover:bg-blue-600 text-xs font-semibold text-white shadow-lg transition-all"
          >
            <Icon name="play" size={13} />
            <span>Start full run, {Math.round(p.timeLimitSec / 60)} min</span>
          </Link>
        </div>
      </header>

      {/* 2. TOP 2 CARDS (Presentation readiness & Performance by area) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: Presentation readiness */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Presentation readiness</h2>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Use your rehearsals to improve each part of the presentation before the real session.
            </p>

            {/* Warning Box */}
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
              <Icon name="alertCircle" size={17} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-rose-300">Not ready yet</div>
                <div className="text-[11px] text-[#e8c8ce] mt-0.5 leading-relaxed">
                  Ready when two full runs in a row score 4 or more and finish inside 10:00.
                </div>
              </div>
            </div>
          </div>

          {/* Past runs badges */}
          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
              <Icon name="x" size={12} strokeWidth={2.4} />
              Run 2: 3.4, 12:10
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
              <Icon name="x" size={12} strokeWidth={2.4} />
              Run 3: 3.6, 11:20
            </span>
          </div>
        </div>

        {/* Right: Performance by area */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h2 className="text-base font-bold text-white tracking-tight">Performance by area</h2>
              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <span className="h-2 w-2 rounded-sm bg-rose-500" />
                  Needs work
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-300">
                  <span className="h-2 w-2 rounded-sm bg-indigo-400" />
                  On track
                </span>
                <span className="inline-flex items-center gap-1 text-muted">
                  <span className="h-2 w-2 rounded-sm bg-white/20" />
                  Not covered
                </span>
              </div>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Area 1: Opening */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Icon name="flag" size={14} className="text-muted" />
                    <span>Opening</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-300">Not yet</span>
                </div>
                <div className="text-[11px] text-muted">How clearly you set the context and hook the audience</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 6 ? "bg-rose-500" : "bg-white/[0.08]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 2: Message and ask */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Icon name="layers" size={14} className="text-muted" />
                    <span>Message and ask</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-300">Nearly</span>
                </div>
                <div className="text-[11px] text-muted">Whether your main recommendation and final ask are clear</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 15 ? "bg-indigo-400" : "bg-white/[0.08]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 3: Timing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Icon name="clock" size={14} className="text-muted" />
                    <span>Timing</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-300">Not yet</span>
                </div>
                <div className="text-[11px] text-muted">How well you keep to the planned time overall</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 9 ? "bg-rose-500" : "bg-white/[0.08]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Area 4: Q&A */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Icon name="chat" size={14} className="text-muted" />
                    <span>Q&A</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-300">Nearly</span>
                </div>
                <div className="text-[11px] text-muted">How clearly and confidently you answer questions</div>
                <div className="flex gap-1 h-2 w-full pt-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex-1 rounded-[2px]",
                        i < 16 ? "bg-indigo-400" : "bg-white/[0.08]"
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
        {/* LEFT: Your slide plan (Matching Image 3) */}
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Your slide plan</h2>
              <p className="text-xs text-muted mt-0.5">The point each slide needs to land. Rehearse any slide on its own.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#141326] border border-white/10 text-muted num">
              {p.slides.length} slides, {mmss(p.slides.reduce((a, s) => a + s.plannedSec, 0))}
            </span>
          </div>

          <div className="divide-y divide-white/[0.06] mt-1">
            {p.slides.map((s) => (
              <div key={s.n} className="py-3 flex items-center justify-between gap-4 group hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-9 rounded bg-white text-gray-900 overflow-hidden shadow-sm flex items-center justify-center font-bold text-xs shrink-0">
                    {s.n}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-blue-soft transition-colors">
                      {s.n}. {s.title}
                    </div>
                    <div className="text-[11px] text-muted truncate mt-0.5">{s.point}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="num text-xs font-semibold text-muted">{mmss(s.plannedSec)}</span>
                  <Link
                    href={`/rehearse/${p.id}?from=${s.n}&to=${s.n}`}
                    className="text-xs font-semibold text-blue-soft hover:underline px-2.5 py-1 rounded-lg hover:bg-blue/10 transition-colors"
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
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon name="zap" size={14} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Rehearsal modes</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-white/[0.07] pb-3">Choose how you want to practise.</p>

            <div className="space-y-2">
              <Link
                href={`/rehearse/${p.id}`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-blue-soft group-hover:bg-blue/20 transition-colors">
                    <Icon name="play" size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-soft transition-colors">Full run</div>
                    <div className="text-[11px] text-muted">Every slide, with timing. {Math.round(p.timeLimitSec / 60)} minutes.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </Link>

              <Link
                href={`/rehearse/${p.id}?mode=opening`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
                    <Icon name="flag" size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">Opening only</div>
                    <div className="text-[11px] text-muted">Your first 60 seconds, scored on hook and relevance.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </Link>

              <Link
                href={`/qa/${p.id}`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Icon name="chat" size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">Q&A only</div>
                    <div className="text-[11px] text-muted">Sceptical audience, four questions, about 8 minutes.</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-white transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card 2: Recent runs */}
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon name="chart" size={14} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Recent runs</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-white/[0.07] pb-3">Your latest rehearsals, with time, score and a quick note.</p>

            <div className="space-y-2">
              {demoRecentRuns.map((r, i) => (
                <Link
                  key={i}
                  href={r.href}
                  className="p-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 flex items-center justify-between text-xs transition-all group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-soft transition-colors">{r.label}</div>
                    <div className="text-[11px] text-muted mt-0.5">{r.note}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="num font-semibold text-white">{r.time}</span>
                    <span className="mx-1.5 text-muted">·</span>
                    <span className={clsx("num font-bold", Number(r.score) < 3.2 ? "text-rose-400" : "text-white")}>{r.score}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Card 3: Audience Q&A */}
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon name="users" size={14} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Audience Q&A</h3>
            </div>
            <p className="text-xs text-muted mb-3 border-b border-white/[0.07] pb-3">Questions based on your chosen audience.</p>

            <Link
              href={`/qa/${p.id}`}
              className="p-3 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 flex items-center justify-between text-xs transition-all group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-blue-soft transition-colors">Dana, finance director</div>
                <div className="text-[11px] text-muted mt-0.5">Sceptical, 4 questions</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="num font-bold text-white">3.7</span>
                  <span className="text-[11px] text-muted block">Effective</span>
                </div>
                <Icon name="chevronRight" size={13} className="text-muted group-hover:text-white transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
