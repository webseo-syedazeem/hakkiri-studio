import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { settingsOr } from "@/lib/interviews/settings";
import { standing } from "@/lib/sessions/server";
import { interviewWhen } from "@/lib/sessions/labels";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { StartButton } from "@/components/interview/StartSession";

export const dynamic = "force-dynamic";

export default async function InterviewOverview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; rebuilt?: string }>;
}) {
  const { id } = await params;
  const { new: isNew, rebuilt } = await searchParams;
  const interview = (await getInterviewAsync(id)) ?? getInterview(id);
  if (!interview) notFound();

  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const u = understandingOf(interview);
  const settings = settingsOr(interview.settings, interview.style);
  const st = standing(interview);
  const when = interviewWhen(interview.date, londonToday());
  const src = interview.sources ?? {};

  const roleTitle = interview.role || "Senior Product Manager, Payments";
  const companyName = interview.company || "Halden";
  const stageName =
    (interview.round as string) === "hiring-manager"
      ? "Stage 2: Hiring manager"
      : interview.round
        ? `Stage: ${interview.round}`
        : "Stage 2: Hiring manager";

  // Score categories with deltas
  const scoreCategories = [
    { name: "Experience", score: 4.0, delta: "+0.4", positive: true, tone: "purple" },
    { name: "Skills", score: 3.4, delta: "+0.2", positive: true, tone: "purple" },
    { name: "Technical", score: 2.5, delta: "-0.3", positive: false, tone: "red" },
    { name: "Motivation", score: 4.4, delta: "+0.3", positive: true, tone: "purple" },
    { name: "Situational", score: 3.1, delta: "+0.2", positive: true, tone: "purple" },
  ];

  return (
    <div className="flex grow flex-col pb-12">
      {/* Top Header */}
      <div className="animate-rise">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors mb-3"
        >
          <Icon name="back" size={12} />
          <span>Interviews</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40 text-[19px] font-bold text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              {interview.companyInitial || companyName[0] || "H"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">
                {roleTitle}
              </h1>
              <div className="mt-0.5 text-xs text-muted flex flex-wrap items-center gap-2">
                <span>{companyName}</span>
                <span>·</span>
                <span>{stageName}</span>
                <span>·</span>
                <span>
                  {when.text}{" "}
                  {when.rel && when.rel !== "done" && (
                    <b className="font-semibold text-ink">({when.rel})</b>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={`/interviews/${interview.id}/prep`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-panel-2 px-3.5 py-2 text-xs font-semibold text-ink border border-line hover:bg-white/[0.08] transition-colors"
            >
              <span>Prep sheet</span>
              <span className="text-[11px] text-muted">↗</span>
            </Link>

            <StartButton
              interviewId={interview.id}
              micOk={micOk}
              body={{
                kind: "interview",
                settings,
              }}
              variant="primary"
              className="bg-blue-fill hover:bg-blue-hover text-white shadow-md font-semibold text-xs px-3.5 py-2"
            >
              <Icon name="play" size={13} />
              Practise interview
            </StartButton>
          </div>
        </div>

        {isNew && (
          <div
            role="status"
            className="mt-4 animate-rise rounded-xl bg-blue/12 px-4 py-3 text-xs text-lilac border border-blue/30"
          >
            <b className="font-semibold text-white">Your interview is ready.</b> The questions stay hidden until {interview.interviewer.name} asks them, like the real thing.
          </div>
        )}
        {rebuilt && (
          <div
            role="status"
            className="mt-4 animate-rise rounded-xl bg-blue/12 px-4 py-3 text-xs text-lilac border border-blue/30"
          >
            <b className="font-semibold text-white">Questions rebuilt.</b> New questions were generated following your feedback.
          </div>
        )}

        {/* Tabs */}
        <InterviewTabs id={interview.id} current="overview" />
      </div>

      {/* Main 2-Column Grid matching Overview mockup */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 animate-rise [animation-delay:0.05s]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 1: RECOMMENDED NEXT */}
          <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#201c3a] via-[#1a1b32] to-[#15192c] p-5 shadow-[0_4px_25px_rgba(99,102,241,0.18)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                  <Icon name="target" size={18} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                    Recommended Next
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Practise technical questions
                  </h2>
                  <p className="text-xs text-muted max-w-[460px] leading-relaxed">
                    Your lowest-scoring category was Technical (2.5/5). Focus on explaining payments metrics, fraud trade-offs and product decisions.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 border border-white/10 text-ink">
                      ⏱ 8-minute targeted drill
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 border border-white/10 text-ink">
                      📋 About 3–5 questions
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 sm:self-center">
                <StartButton
                  interviewId={interview.id}
                  micOk={micOk}
                  body={{
                    kind: "drill",
                    drill: { kind: "pay" },
                  }}
                  variant="primary"
                  className="bg-blue-fill hover:bg-blue-hover text-white font-semibold text-xs px-4 py-2 shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Icon name="play" size={13} />
                  Start practising
                </StartButton>
              </div>
            </div>
          </div>

          {/* Card 2: Latest practice results */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Latest practice results</h2>
                <p className="text-xs text-muted">Full mock interview · Yesterday, 11:05</p>
              </div>
              <Link
                href={`/interviews/${interview.id}/mocks`}
                className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
              >
                <span>View full report</span>
                <span>→</span>
              </Link>
            </div>

            {/* Score bars */}
            <div className="space-y-3 pt-1">
              {scoreCategories.map((cat) => {
                const pct = (cat.score / 5) * 100;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white num">{cat.score.toFixed(1)}/5</span>
                        <span
                          className={clsx(
                            "text-[11px] font-bold num",
                            cat.positive ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {cat.positive ? "▲" : "▼"} {cat.delta}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          cat.tone === "red"
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="pt-2 text-[11px] text-muted border-t border-line/60 flex items-center gap-1.5">
              <span>ⓘ</span>
              <span>Scores reflect your latest mock interview, not your likelihood of receiving an offer.</span>
            </p>
          </Panel>

          {/* Card 3: Recent practice */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-bold text-white">Recent practice</h2>
              <Link
                href={`/interviews/${interview.id}/mocks`}
                className="text-xs font-semibold text-blue-soft hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <span>→</span>
              </Link>
            </div>

            <ul className="divide-y divide-line/60 text-xs">
              {/* Row 1 */}
              <li className="flex items-center justify-between py-3 first:pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">Full mock interview</span>
                    <p className="text-[11px] text-muted">Yesterday · 30 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">3.5 / 5</span>
                  <Link
                    href={`/interviews/${interview.id}/mocks`}
                    className="rounded-lg bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-ink border border-line hover:bg-white/[0.08] transition-colors"
                  >
                    View report
                  </Link>
                </div>
              </li>

              {/* Row 2 */}
              <li className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">Technical questions</span>
                    <p className="text-[11px] text-muted">Wed 5 Nov · 8 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">2.6 / 5</span>
                  <Link
                    href={`/interviews/${interview.id}/mocks`}
                    className="rounded-lg bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-ink border border-line hover:bg-white/[0.08] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </li>

              {/* Row 3 */}
              <li className="flex items-center justify-between py-3 last:pb-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-ink border border-white/10">
                    <Icon name="play" size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-white">&ldquo;A payments metric drops&rdquo; (follow-ups)</span>
                    <p className="text-[11px] text-muted">Tue 4 Nov · 5 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white num">3.8 / 5</span>
                  <Link
                    href={`/interviews/${interview.id}/mocks`}
                    className="rounded-lg bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-ink border border-line hover:bg-white/[0.08] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </li>
            </ul>
          </Panel>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Card 4: Your interview stages */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-white">Your interview stages</h2>
              <p className="text-xs text-muted">Track your progress and prepare for each round.</p>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line pt-2">
              {/* Stage 1 */}
              <div className="relative flex items-start gap-3 text-xs">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  ✓
                </span>
                <div>
                  <span className="font-semibold text-ink">Recruiter screen</span>
                  <p className="text-[11px] text-muted">Completed</p>
                </div>
              </div>

              {/* Stage 2 (Active Next) */}
              <div className="relative flex items-start gap-3 text-xs rounded-xl bg-indigo-500/10 p-2.5 -ml-2.5 border border-indigo-500/30">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  ⦿
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">Hiring manager</span>
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                      Next
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">Fri 13 Nov, 10:00</p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="relative flex items-start gap-3 text-xs">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.04] text-dim border border-white/10 text-[10px]">
                  ○
                </span>
                <div>
                  <span className="font-semibold text-muted">Case interview</span>
                  <p className="text-[11px] text-dim">Upcoming</p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="relative flex items-start gap-3 text-xs">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.04] text-dim border border-white/10 text-[10px]">
                  ○
                </span>
                <div>
                  <span className="font-semibold text-muted">Final panel</span>
                  <p className="text-[11px] text-dim">Upcoming</p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Card 5: Other ways to practise */}
          <Panel className="p-5 sm:p-6 space-y-3">
            <h2 className="text-sm font-bold text-white">Other ways to practise</h2>
            <div className="space-y-2 pt-1">
              <Link
                href={`/interviews/${interview.id}/mocks`}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-2 border border-line hover:border-line-strong hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-fill/15 text-blue-soft border border-blue-fill/25">
                    <Icon name="play" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Start a new full mock interview
                    </span>
                    <p className="text-[11px] text-muted">A broader practise session across key topics</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors" />
              </Link>

              <Link
                href={`/interviews/${interview.id}/mocks`}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-2 border border-line hover:border-line-strong hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    <Icon name="doc" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Practise your previous questions
                    </span>
                    <p className="text-[11px] text-muted">Revisit and improve answers you&apos;ve already tried</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors" />
              </Link>

              <Link
                href={`/interviews/${interview.id}/rebuild`}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-2 border border-line hover:border-line-strong hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25">
                    <Icon name="gear" size={13} />
                  </span>
                  <div>
                    <span className="font-semibold text-ink group-hover:text-white transition-colors">
                      Customise your session
                    </span>
                    <p className="text-[11px] text-muted">Choose topics, question types and duration</p>
                  </div>
                </div>
                <Icon name="chevronRight" size={14} className="text-muted group-hover:text-white transition-colors" />
              </Link>
            </div>
          </Panel>

          {/* Card 6: Your role information (Collapsible accordion) */}
          <details className="group rounded-2xl border border-line bg-panel p-5 shadow-sm transition-all open:bg-panel-2/70">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold text-ink list-none">
              <div className="flex items-center gap-2.5">
                <Icon name="doc" size={15} className="text-muted" />
                <div>
                  <span className="text-sm font-bold text-white block">Your role information</span>
                  <span className="text-[11px] text-muted font-normal">
                    CV, job description and company details used to tailor your practise.
                  </span>
                </div>
              </div>
              <Icon
                name="chevronDown"
                size={14}
                className="text-muted transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="mt-4 pt-3 border-t border-line/60 space-y-3 text-xs">
              <div>
                <span className="font-bold text-ink">Role & Level:</span>{" "}
                <span className="text-muted">
                  {u.role}, {u.level.toLowerCase()}: {u.field}
                </span>
              </div>
              <div>
                <span className="font-bold text-ink">Inputs used:</span>{" "}
                <span className="text-muted">
                  {[src.cv, src.coverLetter, src.job, src.company].filter(Boolean).join(", ") ||
                    "CV and job description"}
                </span>
              </div>
              <div className="pt-1">
                <Link
                  href={`/interviews/${interview.id}/rebuild?edit=1`}
                  className="text-xs font-semibold text-blue-soft hover:underline"
                >
                  Edit details or rebuild questions →
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
