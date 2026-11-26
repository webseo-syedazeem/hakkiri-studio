"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Icon } from "@/components/ui";
import type { Presentation, Run, Slide } from "@/lib/pitch/types";
import { mmss } from "@/lib/format";

interface RunReportViewProps {
  presentation: Presentation;
  run: Run;
  whenFormatted: string;
}

const DEFAULT_COACHING_DATA: Record<
  number,
  {
    subtitle: string;
    status: "Partly covered" | "Covered" | "Needs work";
    whatDidWell: string[];
    whatToImprove: string[];
    structure: { step: number; name: string; detail: string }[];
    suggestedOpening: string;
  }
> = {
  1: {
    subtitle: "Setting the scene and objective",
    status: "Covered",
    whatDidWell: ["Direct and confident start that set the scene.", "Clearly established the ten-minute timeline."],
    whatToImprove: ["Mention the specific two hires in the first 30 seconds to preview the decision required."],
    structure: [
      { step: 1, name: "Hook", detail: "State the objective and the specific decision needed." },
      { step: 2, name: "Scope", detail: "Confirm the agenda and rehearsal timing." },
    ],
    suggestedOpening: "“Good morning. Today I'm presenting the Q1 payments roadmap, and I'll be asking for approval for the plan and two key hires.”",
  },
  2: {
    subtitle: "Explaining payment performance",
    status: "Partly covered",
    whatDidWell: [
      "You communicated that payment completion had improved and identified a contributing factor (new client intake process).",
      "Spoke at a clear and steady pace with minimal filler words.",
    ],
    whatToImprove: [
      "The explanation was a bit hard to follow, with the result and its causes presented together.",
      "You didn't clearly state the starting figure (41%) and ending figure (58%).",
    ],
    structure: [
      { step: 1, name: "Result", detail: "State the key change clearly (e.g. “Payment completion increased from 41% to 58%”)." },
      { step: 2, name: "Evidence", detail: "Explain the changes that contributed to the improvement, distinguishing results from assumptions." },
      { step: 3, name: "Significance", detail: "Explain why the improvement matters (e.g. higher revenue, better customer experience)." },
    ],
    suggestedOpening:
      "“Payment completion increased from 41% to 58%. I'll explain the changes behind that improvement and what they mean for our next priorities.”",
  },
  3: {
    subtitle: "Customer feedback and problem context",
    status: "Covered",
    whatDidWell: ["Effective use of customer quotes to show ground-level pain.", "Clear contrast between sign-up drop-off and payment failure."],
    whatToImprove: ["Link customer sentiment directly to revenue loss before transitioning to the solution."],
    structure: [
      { step: 1, name: "Insight", detail: "Quote the voice of the customer directly." },
      { step: 2, name: "Implication", detail: "Highlight churn and lifetime value impact." },
    ],
    suggestedOpening: "“Customers leave when a payment fails, not before. Here is what 40 support calls in December told us.”",
  },
  4: {
    subtitle: "Three core strategic bets",
    status: "Partly covered",
    whatDidWell: ["Structured each of the three bets into clear thematic buckets.", "Kept pacing close to the planned one-minute window."],
    whatToImprove: ["Avoid getting bogged down in how the ideas were chosen; save team workshop details for questions."],
    structure: [
      { step: 1, name: "Bet 1", detail: "Instant refunds — solve customer friction." },
      { step: 2, name: "Bet 2", detail: "Smarter fraud rules — cut false declines." },
      { step: 3, name: "Bet 3", detail: "One-tap repeat payments — increase repurchase rate." },
    ],
    suggestedOpening: "“We have three core bets for Q1: instant refunds, smarter fraud rules, and one-tap repeat payments.”",
  },
};

export function RunReportView({ presentation, run, whenFormatted }: RunReportViewProps) {
  const [activeTab, setActiveTab] = useState<"coaching" | "overall" | "transcript" | "compare">("coaching");
  const [selectedSlideNum, setSelectedSlideNum] = useState<number>(1);
  const [notDeliveredOpen, setNotDeliveredOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSlides = presentation.slides.length || 1;
  const deliveredSlidesCount = Math.min(totalSlides, Math.max(0, run.slides?.length || 0));
  const isComplete = deliveredSlidesCount >= totalSlides;

  const deliveredSlides = presentation.slides.slice(0, deliveredSlidesCount);
  const notDeliveredSlides = presentation.slides.slice(deliveredSlidesCount);

  const isDemo = presentation.id === "demo-pres" || presentation.id.startsWith("demo-") || run.id.startsWith("demo-");
  const hasAiCoaching = Boolean(run.fix?.body || (run.evidence && Object.keys(run.evidence).length > 0));

  const activeCoaching = isDemo
    ? DEFAULT_COACHING_DATA[selectedSlideNum] ?? {
        subtitle: `Slide ${selectedSlideNum} delivery`,
        status: "Partly covered" as const,
        whatDidWell: ["Addressed the core subject clearly.", "Stayed close to the target speaking duration."],
        whatToImprove: ["Make the key take-away even more explicit at the start of the slide."],
        structure: [
          { step: 1, name: "Point", detail: "Deliver the main insight in one clear headline." },
          { step: 2, name: "Evidence", detail: "Support with specific figures or customer facts." },
        ],
        suggestedOpening: "“The key takeaway here is simple: focused execution delivers measurable improvements.”",
      }
    : null;

  const scoreVal = run.overall != null ? run.overall : null;
  const timeVerdict = `Delivered ${mmss(run.totalSec || 0)} of ${mmss(presentation.timeLimitSec)}, reached slide ${deliveredSlidesCount} of ${totalSlides}.`;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-20 animate-rise text-ink">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-line pb-5">
        <div>
          <Link
            href={`/presentations/${presentation.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <Icon name="back" size={13} />
            <span>Presentations</span>
            <span className="text-dim/40">/</span>
            <span>{presentation.title}</span>
            <span className="text-dim/40">/</span>
            <span className="text-ink/85">Run {run.number}</span>
          </Link>

          <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink">{presentation.title} — Rehearsal report</h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="text-ink font-medium">{presentation.audience === "leadership" ? "Leadership team" : presentation.audience}</span>
            <span className="text-dim/40">·</span>
            <span>Run {run.number}</span>
            <span className="text-dim/40">·</span>
            <span>{whenFormatted}</span>
            <span className="text-dim/40">·</span>
            <span>{totalSlides} slides</span>
            <span className="text-dim/40">·</span>
            <span>Target: {Math.round(presentation.timeLimitSec / 60)} minutes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="bg-panel dark:bg-[#141326] border border-line-strong dark:border-white/10 hover:border-blue/40 text-ink dark:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Icon name="share" size={14} />
            <span>{copied ? "Copied link!" : "Share report"}</span>
          </button>

          <Link
            href={`/rehearse/${presentation.id}`}
            className="pro-btn-glow bg-blue-fill hover:bg-blue-hover text-white flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Icon name="mic" size={14} />
            <span>Rehearse again</span>
          </Link>
        </div>
      </header>

      {/* 2. TOP HERO SUMMARY CARD */}
      <div className="rounded-2xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] p-6 lg:p-7 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_10px_28px_-6px_rgba(15,23,42,0.08)] dark:shadow-xl grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 items-center">
        {/* Left: Gauge + Description */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Radial Gauge */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="var(--color-line)" strokeWidth="10" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#rehearsalGradient)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (scoreVal ?? 0) / 5)}`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="rehearsalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071e3" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="num text-2xl font-bold text-ink tracking-tight leading-none">
                {scoreVal != null ? scoreVal.toFixed(1) : "—"}
              </span>
              <span className="text-[11px] text-muted font-medium mt-0.5">
                {scoreVal != null ? "/ 5" : "Not scored"}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink tracking-tight">
              {scoreVal != null
                ? scoreVal >= 4
                  ? "An outstanding rehearsal"
                  : "A solid performance"
                : !isComplete
                ? "A solid start, but incomplete"
                : "Rehearsal finished"}
            </h2>
            <p className="mt-2 text-xs text-muted leading-relaxed max-w-md">
              {timeVerdict}{" "}
              {!isComplete && totalSlides > deliveredSlidesCount
                ? `The rehearsal ended early, so the later slides (${deliveredSlidesCount + 1}–${totalSlides}) weren't assessed.`
                : "Continue refining pacing and emphasis on your core ask."}
            </p>
          </div>
        </div>

        {/* Right: Metrics + Incomplete Notice */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-panel-2 dark:bg-[#141326] border border-line dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Icon name="clock" size={13} />
                <span>Time delivered</span>
              </div>
              <div className="mt-1 text-lg font-bold text-ink num">
                {mmss(run.totalSec || 0)} <span className="text-muted text-xs font-normal">/ {mmss(presentation.timeLimitSec)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-panel-2 dark:bg-[#141326] border border-line dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Icon name="present" size={13} />
                <span>Slides reached</span>
              </div>
              <div className="mt-1 text-lg font-bold text-ink num">
                {deliveredSlidesCount} <span className="text-muted text-xs font-normal">/ {totalSlides}</span>
              </div>
            </div>
          </div>

          {!isComplete && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <Icon name="alertCircle" size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Incomplete rehearsal</div>
                <div className="text-[11px] text-amber-900/80 dark:text-[#e2d5c3] mt-0.5 leading-relaxed">
                  The score reflects the slides you delivered (1–{deliveredSlidesCount}) and is not directly comparable with completed runs.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ROW 2: 3-CARD GRID (Performance by area, What went well, Recommended next step) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Card 1: Performance by area */}
        <div className="rounded-2xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_10px_28px_-6px_rgba(15,23,42,0.08)] dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line dark:border-white/[0.07]">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span>Performance by area</span>
                <Icon name="info" size={13} className="text-muted" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Opening", score: 3.8, isLow: false },
                { label: "Message and ask", score: 3.2, isLow: false },
                { label: "Structure and flow", score: 3.5, isLow: false },
                { label: "Slide coverage", score: 1.7, isLow: true },
                { label: "Timing", score: 3.0, isLow: false },
                { label: "Audience fit", score: 3.6, isLow: false },
                { label: "Delivery", score: 4.0, isLow: false },
              ].map((area) => (
                <div key={area.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/85">{area.label}</span>
                    <span className="num font-semibold text-ink">{area.score.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-panel-2 border border-line/60 dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-700",
                        area.isLow ? "bg-rose-500" : "bg-gradient-to-r from-blue-fill to-indigo-500"
                      )}
                      style={{ width: `${Math.min(100, (area.score / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: What went well & Main areas to improve */}
        <div className="rounded-2xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_10px_28px_-6px_rgba(15,23,42,0.08)] dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="space-y-4">
              {/* What went well */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>What went well</span>
                </div>
                <ul className="space-y-2 text-xs text-muted leading-relaxed">
                  {isDemo ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>Clear and confident opening that set the context.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>Explained the performance improvement with a relevant business example.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>Spoke at a good pace with minimal filler words.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>
                          {run.delivery?.fillersPerMinute != null && run.delivery.fillersPerMinute < 3
                            ? `Spoke cleanly with only ${run.delivery.fillerCount} filler words (${run.delivery.fillersPerMinute.toFixed(1)}/min).`
                            : `Delivered ${deliveredSlidesCount} slides of your presentation.`}
                        </span>
                      </li>
                      {run.fix?.title && (
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                          <span>{run.fix.title}</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>

              {/* Main areas to improve */}
              <div className="pt-3 border-t border-line dark:border-white/[0.07]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  <Icon name="alertCircle" size={13} />
                  <span>Main areas to improve</span>
                </div>
                <ul className="space-y-2 text-xs text-muted leading-relaxed">
                  {isDemo ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>Complete the full presentation, including the recommendation and final ask.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>Be more concise on key results (e.g. payment completion).</span>
                      </li>
                    </>
                  ) : (
                    <>
                      {!isComplete && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>Complete the full presentation, including the final ask.</span>
                        </li>
                      )}
                      {run.fix?.body ? (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{run.fix.body}</span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>Review per-slide timings below to optimize your delivery.</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recommended next step */}
        <div className="rounded-2xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_10px_28px_-6px_rgba(15,23,42,0.08)] dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/10 dark:bg-indigo-500/15 text-blue-soft">
                <Icon name="target" size={14} />
              </div>
              <h3 className="text-sm font-semibold text-ink">Recommended next step</h3>
            </div>
            <div className="mt-3">
              {deliveredSlidesCount < totalSlides ? (
                <>
                  <h4 className="text-base font-bold text-ink tracking-tight">Continue the presentation</h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Rehearse from slide {deliveredSlidesCount + 1} to complete the deck, cover the remaining points, and finish with a clear ask.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-base font-bold text-ink tracking-tight">Full presentation delivered</h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    You covered all slides. Rehearse again to sharpen your timing, or practise tough audience questions.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            {deliveredSlidesCount < totalSlides && (
              <Link
                href={`/rehearse/${presentation.id}?from=${deliveredSlidesCount + 1}&to=${totalSlides}`}
                className="pro-btn-glow w-full bg-blue-fill hover:bg-blue-hover text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <Icon name="play" size={13} />
                <span>Continue from slide {deliveredSlidesCount + 1} →</span>
              </Link>
            )}

            <Link
              href={`/rehearse/${presentation.id}`}
              className="w-full bg-panel-2 hover:bg-panel dark:bg-[#141326] border border-line-strong dark:border-white/10 hover:border-blue/40 text-ink dark:text-white flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Icon name="repeat" size={13} />
              <span>Rehearse the full presentation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: TABS & SLIDE-BY-SLIDE COACHING */}
      <div className="rounded-2xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_10px_28px_-6px_rgba(15,23,42,0.08)] dark:shadow-xl">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-line dark:border-white/[0.08] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("coaching")}
            className={clsx(
              "text-sm font-semibold pb-1 relative transition-colors cursor-pointer",
              activeTab === "coaching" ? "text-ink after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-fill" : "text-muted hover:text-ink"
            )}
          >
            Slide-by-slide coaching
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("overall")}
            className={clsx(
              "text-sm font-semibold pb-1 relative transition-colors cursor-pointer",
              activeTab === "overall" ? "text-ink after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-fill" : "text-muted hover:text-ink"
            )}
          >
            Overall feedback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transcript")}
            className={clsx(
              "text-sm font-semibold pb-1 relative transition-colors cursor-pointer",
              activeTab === "transcript" ? "text-ink after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-fill" : "text-muted hover:text-ink"
            )}
          >
            Transcript
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={clsx(
              "text-sm font-semibold pb-1 relative transition-colors cursor-pointer",
              activeTab === "compare" ? "text-ink after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-fill" : "text-muted hover:text-ink"
            )}
          >
            Compare runs
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left: Slide Selector List */}
          <div className="space-y-2">
            {deliveredSlides.map((s) => {
              const active = s.n === selectedSlideNum;
              const runSlide = run.slides?.find((rs) => rs.n === s.n);
              const timingFormatted = runSlide
                ? `${mmss(runSlide.seconds)} / ${mmss(s.plannedSec)}`
                : `— / ${mmss(s.plannedSec)}`;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setSelectedSlideNum(s.n)}
                  className={clsx(
                    "w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer",
                    active
                      ? "bg-blue/10 border-blue-fill ring-1 ring-blue-fill text-ink"
                      : "bg-panel-2 dark:bg-[#141326] border-line dark:border-white/10 hover:border-line-strong text-ink/85"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-6 rounded bg-panel border border-line text-ink text-[8px] font-bold flex items-center justify-center shrink-0">
                      {s.n}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate text-ink">{s.n}. {s.title}</div>
                      <div className="text-[11px] text-muted num">{timingFormatted}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Icon name="checkCircle" size={14} className="text-emerald-500" />
                    <Icon name="chevronRight" size={12} className="text-muted" />
                  </div>
                </button>
              );
            })}

            {/* Collapsible Not Delivered */}
            {notDeliveredSlides.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setNotDeliveredOpen((o) => !o)}
                  className="w-full p-2.5 rounded-xl bg-panel-2 dark:bg-[#141326]/60 border border-line dark:border-white/[0.08] flex items-center justify-between text-xs text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <span>Not delivered ({notDeliveredSlides.length})</span>
                  <Icon name="chevronDown" size={14} className={clsx("transition-transform", notDeliveredOpen && "rotate-180")} />
                </button>

                {notDeliveredOpen && (
                  <div className="mt-2 space-y-1.5 pl-2 animate-rise">
                    {notDeliveredSlides.map((s) => (
                      <div
                        key={s.n}
                        className="p-2 rounded-lg bg-panel-2 dark:bg-[#141326] border border-line dark:border-white/[0.06] flex items-center justify-between text-xs text-muted"
                      >
                        <span className="truncate">{s.n}. {s.title}</span>
                        <span className="text-[11px] num">Planned {mmss(s.plannedSec)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Active Slide Coaching Card */}
          <div className="rounded-xl bg-panel-2 dark:bg-[#141326] border border-line dark:border-white/10 p-5 shadow-sm">
            {/* Slide Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded-lg bg-blue/10 border border-blue/30 flex items-center justify-center text-blue-soft">
                  <Icon name="chart" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">Slide {selectedSlideNum}: {presentation.slides.find((s) => s.n === selectedSlideNum)?.title}</h3>
                    {activeCoaching && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {activeCoaching.status}
                      </span>
                    )}
                  </div>
                  {activeCoaching && <div className="text-xs text-muted mt-0.5">{activeCoaching.subtitle}</div>}
                </div>
              </div>

              {/* Timing stats & navigation */}
              {(() => {
                const activeSlideDef = presentation.slides.find((s) => s.n === selectedSlideNum);
                const activeSlideRun = run.slides?.find((s) => s.n === selectedSlideNum);
                const activePlanned = activeSlideDef?.plannedSec ?? 60;
                const activeActual = activeSlideRun?.seconds ?? 0;
                const diff = activeActual - activePlanned;
                const diffText = diff > 0 ? `${mmss(diff)} over` : diff < 0 ? `${mmss(Math.abs(diff))} under` : "on plan";
                const diffColor = diff > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
                return (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs text-muted">
                      <span className="num font-semibold text-ink">Time: {mmss(activeActual)}</span> · Planned: {mmss(activePlanned)} · <span className={diffColor}>{diffText}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSlideNum((n) => Math.max(1, n - 1))}
                        disabled={selectedSlideNum === 1}
                        className="p-1 rounded text-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                      >
                        <Icon name="chevronRight" size={14} className="rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSlideNum((n) => Math.min(Math.max(1, deliveredSlidesCount), n + 1))}
                        disabled={selectedSlideNum >= deliveredSlidesCount}
                        className="p-1 rounded text-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                      >
                        <Icon name="chevronRight" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Coaching Details */}
            {activeCoaching ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: What you did well & What to improve */}
                <div className="space-y-4">
                  {/* What you did well */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                      <Icon name="checkCircle" size={14} />
                      <span>What you did well</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted leading-relaxed">
                      {activeCoaching.whatDidWell.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What to improve */}
                  <div className="pt-3 border-t border-line dark:border-white/[0.08]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                      <Icon name="alertCircle" size={14} />
                      <span>What to improve</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted leading-relaxed">
                      {activeCoaching.whatToImprove.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Recommended structure & Suggested opening */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-soft mb-2.5">
                      <Icon name="layers" size={14} />
                      <span>Recommended structure: Result → Evidence → Significance</span>
                    </div>
                    <div className="space-y-2 text-xs text-muted">
                      {activeCoaching.structure.map((item) => (
                        <div key={item.step} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-fill text-[10px] font-bold text-white mt-0.5">
                            {item.step}
                          </span>
                          <div>
                            <strong className="text-ink font-semibold">{item.name}</strong> — {item.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Opening */}
                  <div className="p-3.5 rounded-xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/10">
                    <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Suggested opening</div>
                    <p className="text-xs text-muted italic leading-relaxed">{activeCoaching.suggestedOpening}</p>
                  </div>

                  {/* Practise this slide button */}
                  <div className="pt-1">
                    <Link
                      href={`/rehearse/${presentation.id}?from=${selectedSlideNum}&to=${selectedSlideNum}`}
                      className="pro-btn-glow w-full bg-blue-fill hover:bg-blue-hover text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
                    >
                      <Icon name="play" size={13} />
                      <span>Practise this slide →</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 p-8 rounded-xl bg-panel dark:bg-[#0d0c1c] border border-line dark:border-white/[0.08] text-center">
                <Icon name="info" size={24} className="mx-auto mb-2 text-blue-soft opacity-80" />
                <p className="text-sm font-semibold text-ink">Coaching needs the AI service; your timings are below.</p>
                <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                  Slide timing and coverage have been measured and recorded from your live rehearsal.
                </p>
                <div className="mt-4 inline-block">
                  <Link
                    href={`/rehearse/${presentation.id}?from=${selectedSlideNum}&to=${selectedSlideNum}`}
                    className="pro-btn-glow bg-blue-fill hover:bg-blue-hover text-white inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all"
                  >
                    <Icon name="play" size={13} />
                    <span>Practise slide {selectedSlideNum} again</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
