"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import {
  ACTIVITIES,
  PROMPTS,
  ROADMAP_WEEKS,
  type ActivityModel,
  type PromptModel,
} from "@/lib/gym/catalog";
import {
  evaluateSpeechFeedback,
  type EvaluationFeedback,
} from "@/lib/gym/evaluator";

const DAYS = [
  { day: "Mon", date: "1", completed: true },
  { day: "Tue", date: "2", completed: true },
  { day: "Wed", date: "3", completed: true },
  { day: "Thu", date: "4", today: true },
  { day: "Fri", date: "5" },
  { day: "Sat", date: "6" },
  { day: "Sun", date: "7" },
];

export function GymDashboard() {
  const [selectedSlug, setSelectedSlug] = useState<string>("think_fast");
  const [activeDrill, setActiveDrill] = useState<PromptModel | null>(null);
  const [activeActivity, setActiveActivity] = useState<ActivityModel | null>(null);

  // Drill Runner State
  const [drillStage, setDrillStage] = useState<"idle" | "prep" | "speaking" | "review">("idle");
  const [prepCountdown, setPrepCountdown] = useState<number>(3);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(60);
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // Thu 4

  const currentActivity = ACTIVITIES.find((a) => a.slug === selectedSlug) || ACTIVITIES[0];
  const activityPrompts = PROMPTS.filter((p) => p.activitySlug === selectedSlug);

  // Prep Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (drillStage === "prep" && prepCountdown > 0) {
      timer = setTimeout(() => setPrepCountdown((c) => c - 1), 1000);
    } else if (drillStage === "prep" && prepCountdown === 0) {
      setDrillStage("speaking");
    }
    return () => clearTimeout(timer);
  }, [drillStage, prepCountdown]);

  // Speaking Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (drillStage === "speaking" && speakingSeconds > 0) {
      timer = setTimeout(() => setSpeakingSeconds((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [drillStage, speakingSeconds]);

  const startDrill = (prompt: PromptModel, activity: ActivityModel) => {
    setActiveDrill(prompt);
    setActiveActivity(activity);
    setPrepCountdown(prompt.prepSeconds);
    setSpeakingSeconds(prompt.durationSeconds);
    setSpokenTranscript("");
    setFeedback(null);
    setDrillStage("prep");
  };

  const handleFinishDrill = (sampleTranscript?: string) => {
    if (!activeDrill) return;
    const transcriptToEvaluate =
      sampleTranscript ||
      spokenTranscript ||
      "I would start by listening to understand their concerns, acknowledge their perspective, and then align on shared objectives so we basically avoid any roadblocks, if that makes sense.";
    
    const evalResult = evaluateSpeechFeedback({
      prompt: activeDrill,
      transcript: transcriptToEvaluate,
      durationSeconds: activeDrill.durationSeconds - speakingSeconds,
    });

    setSpokenTranscript(transcriptToEvaluate);
    setFeedback(evalResult);
    setDrillStage("review");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Gamification Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-blue/15 px-3 py-0.5 text-[11px] font-extrabold text-blue-soft border border-blue/20 uppercase tracking-wider">
              Communication Agility Gym
            </span>
            <span className="text-xs text-muted">Daily Spontaneous Articulation Drills</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Neuromuscular Speaking Practice
          </h1>
        </div>

        {/* Gamification Strip (XP & Streak decoupled from score) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300">
            <Icon name="flame" size={16} className="text-amber-400" />
            <span>4-Day Streak</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-blue/30 bg-blue/10 px-4 py-2 text-xs font-bold text-blue-soft">
            <Icon name="zap" size={16} className="text-blue-soft" />
            <span>320 XP</span>
          </div>

          <Link
            href="/analytics"
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-panel-2 px-3 py-2 text-xs font-semibold text-ink hover:bg-[#282a35] transition-colors"
          >
            <Icon name="barChart" size={15} />
            <span className="hidden md:inline">Clarity Profile</span>
          </Link>
        </div>
      </div>

      {/* Week Calendar Strip & Today's Anchor Drill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Featured Anchor Card */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-[#141522] p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-soft">
                TODAY'S DAILY ANCHOR · 60 SEC · DRILL 1 OF 4
              </span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Active Habit
              </span>
            </div>

            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Think Fast: The High-Stakes Stakeholder Challenge
            </h2>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed max-w-xl">
              A key stakeholder challenges your project delivery date in front of executives. You have 3 seconds to organize, then 60 seconds to state your conclusion and boundary without waffling.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => startDrill(PROMPTS[0], ACTIVITIES[0])}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-hover transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Icon name="play" size={15} />
              <span>Launch Today's Drill (60s)</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-muted">
              <Icon name="shield" size={14} className="text-blue-soft" />
              <span>Calibrated for BLUF & Power Pauses</span>
            </div>
          </div>
        </div>

        {/* 7-Day Calendar Strip Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Week 1: Foundations
              </span>
              <span className="text-xs font-bold text-blue-soft">3 / 7 Completed</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDayIndex(i)}
                  className={clsx(
                    "flex flex-col items-center py-2.5 rounded-xl border text-center transition-all cursor-pointer",
                    selectedDayIndex === i
                      ? "border-blue bg-blue/20 text-white shadow-md ring-1 ring-blue/40"
                      : d.completed
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-white/[0.06] bg-panel-2/50 text-muted hover:border-white/20"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase">{d.day}</span>
                  <span className="mt-1 text-sm font-bold">{d.date}</span>
                  {d.completed && (
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.05] bg-panel-2/80 p-3 text-xs text-muted">
            <span className="font-bold text-ink">Streak Rule: </span>
            Completing 1 drill per day maintains your streak and sharpens neuromuscular reaction speed.
          </div>
        </div>
      </div>

      {/* 7 MVP Activities Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-ink">
            The 7 Agility Gym Workstations
          </h3>
          <span className="text-xs text-muted">Select an activity to view drill prompts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {ACTIVITIES.map((act) => {
            const isSelected = act.slug === selectedSlug;
            return (
              <button
                key={act.slug}
                onClick={() => setSelectedSlug(act.slug)}
                className={clsx(
                  "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-blue bg-blue/15 shadow-md ring-1 ring-blue/40"
                    : "border-white/[0.06] bg-panel/80 hover:border-white/15 hover:bg-panel-2"
                )}
              >
                <span className="rounded-lg bg-white/[0.06] p-2 text-blue-soft mb-2">
                  <Icon name={act.icon as IconName} size={18} />
                </span>
                <span className="text-xs font-bold text-ink truncate w-full">{act.name}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-muted line-clamp-1">
                  {act.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Activity Details & Prompts */}
        <div className="rounded-3xl border border-white/[0.08] bg-panel/90 p-6 md:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue/20 px-2 py-0.5 text-[11px] font-bold text-blue-soft">
                  {currentActivity.badge}
                </span>
                <span className="text-xs text-muted">
                  Prep: {currentActivity.prepDurationSeconds}s · Duration: {currentActivity.defaultDurationSeconds}s
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">{currentActivity.name}</h2>
              <p className="mt-1 text-sm text-muted max-w-2xl">{currentActivity.tagline}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-panel-2 p-3 text-xs text-ink/80 max-w-xs">
              <span className="font-bold text-blue-soft">Cognitive Mechanism: </span>
              {currentActivity.cognitiveMechanism}
            </div>
          </div>

          {/* Prompts list for this activity */}
          <div className="mt-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Available High-Stakes Prompts ({activityPrompts.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activityPrompts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/[0.06] bg-booth p-5 flex flex-col justify-between hover:border-white/15 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase text-blue-soft">
                        {p.title || currentActivity.name}
                      </span>
                      <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase font-bold text-muted">
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-ink leading-relaxed">
                      "{p.promptText}"
                    </p>
                    {p.secondaryText && (
                      <div className="mt-2 rounded-lg bg-panel-2 p-2.5 text-xs text-muted line-clamp-3">
                        <span className="font-bold text-ink/80">Brief: </span>
                        {p.secondaryText}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <span className="text-[11px] text-muted">
                      {p.durationSeconds}s articulation
                    </span>
                    <button
                      onClick={() => startDrill(p, currentActivity)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-fill px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-hover transition-colors cursor-pointer"
                    >
                      <Icon name="play" size={13} />
                      <span>Start Drill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drill Runner Modal */}
      {drillStage !== "idle" && activeDrill && activeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-[#141522] p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setDrillStage("idle")}
              className="absolute top-5 right-5 text-muted hover:text-white transition-colors"
            >
              <Icon name="x" size={20} />
            </button>

            {/* Stage 1: Preparation Countdown */}
            {drillStage === "prep" && (
              <div className="py-10 text-center space-y-6">
                <span className="rounded-full bg-blue/20 px-3 py-1 text-xs font-bold text-blue-soft border border-blue/30 uppercase tracking-wider">
                  Prep Window · No Notes Allowed
                </span>
                <div className="text-7xl font-black text-blue-soft animate-pulse">
                  {prepCountdown}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Review the challenge prompt:</h3>
                  <p className="mt-2 text-base text-ink/90 font-medium max-w-md mx-auto">
                    "{activeDrill.promptText}"
                  </p>
                </div>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Take a calm diaphragmatic breath. Organize your thesis using BLUF (Bottom Line Up Front).
                </p>
              </div>
            )}

            {/* Stage 2: Speaking & Recording */}
            {drillStage === "speaking" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-soft">
                      Live Recording Active
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {speakingSeconds}s left
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-booth p-5">
                  <span className="text-[11px] font-bold uppercase text-muted">Prompt</span>
                  <p className="mt-1 text-base font-semibold text-white">
                    "{activeDrill.promptText}"
                  </p>
                  <p className="mt-2 text-xs text-blue-soft">
                    Objective: {activeDrill.objective}
                  </p>
                </div>

                {/* Animated Speech Waveform Simulation */}
                <div className="flex h-16 items-center justify-center gap-1 rounded-2xl bg-panel-2/50 px-4">
                  {Array.from({ length: 32 }, (_, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-blue-soft animate-pulse"
                      style={{
                        height: `${Math.max(12, Math.sin(i * 0.4 + speakingSeconds) * 48)}px`,
                        animationDelay: `${(i % 5) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Simulated speech transcript input or live voice */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Speaking Stream (Speak aloud or refine below)
                  </label>
                  <textarea
                    rows={3}
                    value={spokenTranscript}
                    onChange={(e) => setSpokenTranscript(e.target.value)}
                    placeholder="Start speaking aloud into your microphone... Or test with your custom verbal response."
                    className="w-full rounded-xl border border-white/10 bg-panel-2 p-3 text-sm text-white placeholder-muted focus:border-blue focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      handleFinishDrill(
                        "I would start by listening to understand their concerns, acknowledge their perspective, and then align on shared objectives so we basically avoid any roadblocks, if that makes sense."
                      )
                    }
                    className="text-xs text-blue-soft hover:underline cursor-pointer"
                  >
                    Load Sample Practice Response →
                  </button>

                  <button
                    onClick={() => handleFinishDrill()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-hover cursor-pointer"
                  >
                    <span>Complete & Analyze</span>
                    <Icon name="check" size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3: Instant 4-Pillar Evaluation Report */}
            {drillStage === "review" && feedback && (
              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-soft">
                      DRILL FEEDBACK REPORT · {activeActivity.name}
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      Speech Evaluation Scorecard
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-soft">
                      {feedback.overallScore}.0 / 5.0
                    </div>
                    <span className="text-[11px] text-muted">Overall Agility Score</span>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: "Fluency & Presence", score: feedback.pillars.executiveScore },
                    { label: "Clarity & Structure", score: feedback.pillars.clarityScore },
                    { label: "Conciseness & Impact", score: feedback.pillars.impactScore },
                    { label: "Engagement & Tone", score: feedback.pillars.engagementScore },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.06] bg-panel-2 p-3 text-center"
                    >
                      <span className="text-[10px] font-bold text-muted uppercase block leading-tight">
                        {p.label}
                      </span>
                      <span className="mt-1 text-lg font-black text-white block">
                        {p.score}.0 / 5
                      </span>
                    </div>
                  ))}
                </div>

                {/* Telemetry Stats: Pacing, Crutches, Pauses */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-booth p-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted">Pacing:</span>
                    <span className="font-bold text-ink">{feedback.pillars.pacingWpm} WPM</span>
                  </div>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted">Power Pauses:</span>
                    <span className="font-bold text-emerald-400">
                      {feedback.pillars.powerPauseCount} deliberate
                    </span>
                  </div>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted">Crutch Words:</span>
                    <span
                      className={clsx(
                        "font-bold",
                        feedback.pillars.crutchCount > 0 ? "text-amber-400" : "text-emerald-400"
                      )}
                    >
                      {feedback.pillars.crutchCount} detected
                    </span>
                  </div>
                </div>

                {/* One Strength & One Specific Improvement */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Decisive Strength
                    </span>
                    <p className="mt-1 text-sm text-ink/90 font-medium">
                      {feedback.oneStrength}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red/20 bg-red/10 p-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-soft">
                      Targeted Improvement
                    </span>
                    <p className="mt-1 text-sm text-ink/90 font-medium">
                      {feedback.oneSpecificImprovement}
                    </p>
                  </div>
                </div>

                {/* Highlighted Phrase */}
                <div className="rounded-xl border border-white/10 bg-panel-2 p-4">
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span className="font-bold text-blue-soft uppercase">
                      Highlighted Moment ({feedback.highlightedPhrase.timestampRange})
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    "{feedback.highlightedPhrase.phrase}"
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {feedback.highlightedPhrase.critique}
                  </p>
                </div>

                {/* Exemplar Reference */}
                <div className="rounded-xl border border-blue/20 bg-blue/10 p-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-soft">
                    Gold Standard Exemplar Response
                  </span>
                  <p className="mt-1 text-xs text-ink/80 italic leading-relaxed">
                    "{feedback.exemplarResponse}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => startDrill(activeDrill, activeActivity)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-panel-2 px-4 py-2.5 text-xs font-bold text-ink hover:bg-[#282a35] transition-colors cursor-pointer"
                  >
                    <Icon name="repeat" size={14} />
                    <span>Try Coached Retry</span>
                  </button>

                  <button
                    onClick={() => setDrillStage("idle")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-hover transition-colors cursor-pointer"
                  >
                    <span>Save to Clarity Profile</span>
                    <Icon name="check" size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
