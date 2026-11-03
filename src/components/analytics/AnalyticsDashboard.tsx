"use client";

import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

const PILLARS = [
  {
    name: "Fluency & presence",
    score: 3.4,
    fillPercentage: 68,
    status: "active",
    attempts: 4,
    insight: "Steady chest resonance and pace. Reduced filler words by 40% this week.",
  },
  {
    name: "Clarity & structure",
    score: 3.8,
    fillPercentage: 76,
    status: "active",
    attempts: 6,
    insight: "Strong deployment of PREP framework. Decisive initial BLUF answers.",
  },
  {
    name: "Engagement & tone",
    score: null,
    fillPercentage: 35,
    status: "locked",
    attempts: 1,
    insight: "Needs 2 more valid attempts to establish calibrated acoustic baseline.",
  },
  {
    name: "Conciseness & impact",
    score: 3.1,
    fillPercentage: 62,
    status: "active",
    attempts: 3,
    insight: "Improved rate compression in 'Cut It In Half'. Watch out for narrative preambles.",
  },
];

const RECENT_SESSIONS = [
  {
    id: "sess_1",
    activity: "Think Fast",
    prompt: "Difficult Stakeholder Challenge",
    date: "Today, 18:24",
    duration: "48s",
    score: 4.0,
    wpm: 142,
    crutches: 0,
    pauses: 2,
    oneStrength: "Commanded authority with 2 deliberate silent power pauses.",
    oneImprovement: "Lead with the decisive conclusion in the first 5 seconds.",
  },
  {
    id: "sess_2",
    activity: "Cut It In Half",
    prompt: "Legacy Architecture Migration Brief",
    date: "Yesterday, 14:10",
    duration: "32s",
    score: 3.8,
    wpm: 150,
    crutches: 1,
    pauses: 1,
    oneStrength: "Achieved 48% information compression without losing key budget ask.",
    oneImprovement: "Eliminate the crutch phrase 'basically' when transitioning points.",
  },
  {
    id: "sess_3",
    activity: "1 Minute Expert",
    prompt: "Zero Trust Architecture",
    date: "2 Nov, 09:45",
    duration: "58s",
    score: 4.2,
    wpm: 138,
    crutches: 0,
    pauses: 3,
    oneStrength: "Exceptional castle-and-moat metaphor calibrated for non-technical leadership.",
    oneImprovement: "Wrap up within 55s to leave headroom for executive interruptions.",
  },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-blue/15 px-3 py-0.5 text-[11px] font-extrabold text-blue-soft border border-blue/20 uppercase tracking-wider">
              LAST 30 DAYS · FRESH PROMPTS ONLY
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Analytics · <span className="text-blue-soft">Your Clarity Profile.</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Unbiased 4-pillar speech telemetry measuring structure, cadence, conciseness, and presence.
          </p>
        </div>

        <Link
          href="/gym"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-hover transition-all"
        >
          <Icon name="play" size={14} />
          <span>Practise in Gym</span>
        </Link>
      </div>

      {/* 4-Column Bar / Radar Metric Display */}
      <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted mb-6">
          Executive 4-Pillar Metric Breakdown (1.0 - 5.0)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end pt-4 pb-2">
          {PILLARS.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* Score Indicator */}
              <div className="mb-2 text-center">
                {p.status === "active" ? (
                  <span className="text-2xl font-black text-white font-mono">
                    {p.score?.toFixed(1)}
                  </span>
                ) : (
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-muted">
                    Need 2 more
                  </span>
                )}
              </div>

              {/* Bar Tower */}
              <div className="w-full max-w-[120px] h-48 rounded-2xl bg-booth p-1.5 flex flex-col justify-end border border-white/[0.06]">
                <div
                  className={clsx(
                    "w-full rounded-xl transition-all duration-700",
                    p.status === "active"
                      ? idx === 1
                        ? "bg-blue-soft shadow-[0_0_15px_rgba(123,136,255,0.4)]"
                        : "bg-blue/60"
                      : "bg-white/[0.1] border border-dashed border-white/20"
                  )}
                  style={{ height: `${p.fillPercentage}%` }}
                />
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-ink block leading-snug">
                  {p.name}
                </span>
                <span className="text-[10px] text-muted">
                  {p.attempts} valid attempts
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status Banner */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#141522] p-4 flex items-center gap-4">
          <span className="rounded-md bg-blue/20 px-2 py-1 text-[10px] font-extrabold text-blue-soft uppercase tracking-wider">
            OVERALL STATUS
          </span>
          <p className="text-xs md:text-sm text-ink/90 font-medium">
            Overall readiness score unlocks when every skill has at least 3 valid attempts.{" "}
            <span className="text-blue-soft font-semibold">
              Engagement & Tone needs 2 more attempts.
            </span>
          </p>
        </div>
      </div>

      {/* Gamification Strip & Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak & XP Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icon name="flame" size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-white">4-Day Streak · 320 XP</div>
              <p className="text-xs text-muted">Consistent Daily Cadence</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink/70 leading-relaxed">
            Rewards for showing up every morning. Fair scoring policy: XP and streaks are strictly separated from your objective speech skill scores.
          </p>
        </div>

        {/* Bias Guarantee */}
        <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10 text-blue-soft border border-blue/20">
              <Icon name="shield" size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-white">Zero Accent Bias</div>
              <p className="text-xs text-muted">Pure Logical Telemetry</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink/70 leading-relaxed">
            Evaluates only structure, information density, cadence, and conciseness. Your native background, pitch, and accent are never penalized.
          </p>
        </div>

        {/* 4-Week Progress */}
        <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="target" size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-white">Week 1 of 4</div>
              <p className="text-xs text-muted">Foundations & Cadence</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink/70 leading-relaxed">
            Current priority: "Answer first, then explain" (BLUF) and replacing conversational fillers with silent power pauses.
          </p>
        </div>
      </div>

      {/* Historical Drill Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            Recent Practice Telemetry
          </h3>
          <span className="text-xs text-muted">Last 3 evaluated sessions</span>
        </div>

        <div className="space-y-3">
          {RECENT_SESSIONS.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/[0.06] bg-panel/90 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-white/15"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue/15 px-2 py-0.5 text-[10px] font-bold text-blue-soft">
                    {s.activity}
                  </span>
                  <span className="text-sm font-bold text-white">{s.prompt}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>{s.date}</span>
                  <span>·</span>
                  <span>{s.duration}</span>
                  <span>·</span>
                  <span className="font-bold text-blue-soft">{s.score.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-ink/90">
                  <span className="font-bold text-emerald-400 block mb-0.5">Strength</span>
                  {s.oneStrength}
                </div>
                <div className="rounded-xl border border-red/20 bg-red/10 p-2.5 text-ink/90">
                  <span className="font-bold text-red-soft block mb-0.5">Targeted Fix</span>
                  {s.oneImprovement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
