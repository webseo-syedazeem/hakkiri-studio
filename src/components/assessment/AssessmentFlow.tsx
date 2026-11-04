"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { OptionIllustration } from "@/components/illustrations/OptionIllustration";

interface Option {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  iconName: IconName;
  iconGradient: string;
  previewGraphic?: string;
}

const STEPS = [
  {
    stepNum: "1/7",
    tag: "YOUR PROFILE",
    progress: 1 / 7,
    titlePre: "What's ",
    titleHighlight: "your name?",
    subtitle: "Let's personalize your speaking experience.",
    isNameInput: true,
  },
  {
    stepNum: "2/7",
    tag: "YOUR VOICE",
    progress: 2 / 7,
    titlePre: "Which voice profile ",
    titleHighlight: "fits you best?",
    subtitle: "This helps us calibrate pitch clarity, chest resonance, and vocal pacing.",
    options: [
      {
        id: "male",
        title: "Male Resonance",
        subtitle: "Build stronger chest resonance, eliminate pitch drift, and steady projection.",
        badge: "♂ Pitch 85-180 Hz",
        iconName: "speaker" as IconName,
        iconGradient: "from-blue-600/30 to-indigo-600/20 text-blue-soft",
        previewGraphic: "bass",
      },
      {
        id: "female",
        title: "Female Clarity",
        subtitle: "Develop pitch clarity, commanding low-chest cadence, and vocal control.",
        badge: "♀ Pitch 165-255 Hz",
        iconName: "mic" as IconName,
        iconGradient: "from-purple-600/30 to-pink-600/20 text-pink-300",
        previewGraphic: "treble",
      },
      {
        id: "non_binary",
        title: "Non-binary / Vocal Alignment",
        subtitle: "Personalize your resonance range, comfort frequencies, and delivery.",
        badge: "⚧ Custom Resonance",
        iconName: "sparkles" as IconName,
        iconGradient: "from-emerald-600/30 to-teal-600/20 text-emerald-300",
        previewGraphic: "adaptive",
      },
    ],
  },
  {
    stepNum: "3/7",
    tag: "YOUR CAREER",
    progress: 3 / 7,
    titlePre: "Where are you in ",
    titleHighlight: "your career?",
    subtitle: "We'll tailor your high-stakes simulations to the situations you face daily.",
    options: [
      {
        id: "early",
        title: "Student / Early Career",
        subtitle: "Graduate schemes, competitive tech interviews, and first team presentations.",
        badge: "0-2 Years",
        iconName: "brief" as IconName,
        iconGradient: "from-amber-600/30 to-orange-600/20 text-amber-300",
      },
      {
        id: "mid_level",
        title: "Mid-Level Professional",
        subtitle: "Cross-functional meetings, sprint demos, and promotion conversations.",
        badge: "3-7 Years",
        iconName: "laptop" as IconName,
        iconGradient: "from-blue-600/30 to-indigo-600/20 text-blue-soft",
      },
      {
        id: "exec",
        title: "Senior Executive / Founder",
        subtitle: "Board presentations, investor pitches, and keynote industry speeches.",
        badge: "8+ Years / Exec",
        iconName: "crown" as IconName,
        iconGradient: "from-purple-600/30 to-indigo-600/20 text-purple-300",
      },
      {
        id: "self_learner",
        title: "General Self-Learner",
        subtitle: "Everyday articulation, personal confidence, and speaking poise.",
        badge: "Universal Track",
        iconName: "sparkles" as IconName,
        iconGradient: "from-teal-600/30 to-emerald-600/20 text-teal-300",
      },
    ],
  },
  {
    stepNum: "4/7",
    tag: "YOUR CONTEXT",
    progress: 4 / 7,
    titlePre: "What's your main ",
    titleHighlight: "work environment?",
    subtitle: "Choose the industry or domain that best matches your daily dialogue.",
    options: [
      {
        id: "tech_product",
        title: "Tech, Engineering & Product",
        subtitle: "Explaining architecture, sprint tradeoffs, and product vision simply.",
        badge: "Product / Eng",
        iconName: "laptop" as IconName,
        iconGradient: "from-blue-500/30 via-indigo-500/20 to-blue-600/30 text-blue-soft",
        previewGraphic: "tech",
      },
      {
        id: "corporate_finance",
        title: "Corporate & Finance",
        subtitle: "Board meetings, financial data reviews, and high-stakes formal decks.",
        badge: "Finance / Strategy",
        iconName: "building" as IconName,
        iconGradient: "from-emerald-500/30 via-teal-500/20 to-emerald-600/30 text-emerald-300",
        previewGraphic: "finance",
      },
      {
        id: "sales_marketing",
        title: "Sales, Growth & Marketing",
        subtitle: "Adversarial negotiation, customer pitches, and audience engagement.",
        badge: "Commercial",
        iconName: "megaphone" as IconName,
        iconGradient: "from-amber-500/30 via-orange-500/20 to-amber-600/30 text-amber-300",
        previewGraphic: "sales",
      },
      {
        id: "healthcare_edu",
        title: "Healthcare, Legal & Education",
        subtitle: "Empathetic communication, precise counsel, and clear explanations.",
        badge: "Specialized",
        iconName: "heart" as IconName,
        iconGradient: "from-rose-500/30 via-pink-500/20 to-rose-600/30 text-rose-300",
        previewGraphic: "health",
      },
    ],
  },
  {
    stepNum: "5/7",
    tag: "YOUR CONFIDENCE",
    progress: 5 / 7,
    titlePre: "How confident do you feel ",
    titleHighlight: "speaking under pressure?",
    subtitle: "Select the rating that best reflects how you feel when called on unexpectedly.",
    hasGauge: true,
  },
  {
    stepNum: "6/7",
    tag: "YOUR CHALLENGE",
    progress: 6 / 7,
    titlePre: "What gets in your way ",
    titleHighlight: "most when you speak?",
    subtitle: "Pick your biggest speaking roadblock. We will anchor your first week around it.",
    options: [
      {
        id: "blank_pressure",
        title: "I go blank under pressure",
        subtitle: "I struggle to organize my thoughts quickly when challenged without notice.",
        badge: "Cognitive Stall",
        iconName: "brain" as IconName,
        iconGradient: "from-red/30 to-amber-500/20 text-red-soft",
      },
      {
        id: "too_long",
        title: "I take too long to get to the point",
        subtitle: "I provide excessive context and preamble before stating my conclusion.",
        badge: "Preamble / Waffle",
        iconName: "clock" as IconName,
        iconGradient: "from-amber-500/30 to-yellow-500/20 text-amber-300",
      },
      {
        id: "filler_rush",
        title: "I rush or use too many filler words",
        subtitle: "I lean on 'um', 'like', 'sort of', or speed up my delivery when anxious.",
        badge: "Pacing & Fillers",
        iconName: "activity" as IconName,
        iconGradient: "from-blue-500/30 to-indigo-500/20 text-blue-soft",
      },
      {
        id: "explain_simple",
        title: "I struggle to explain things simply",
        subtitle: "I know what I mean, but make technical concepts sound overly complex.",
        badge: "Jargon Trap",
        iconName: "sparkles" as IconName,
        iconGradient: "from-purple-500/30 to-pink-500/20 text-purple-300",
      },
      {
        id: "lose_confidence",
        title: "I lose confidence when challenged",
        subtitle: "I get defensive or trail off when stakeholders push back on my proposals.",
        badge: "Adversarial Pushback",
        iconName: "shield" as IconName,
        iconGradient: "from-rose-500/30 to-red/20 text-rose-300",
      },
    ],
  },
  {
    stepNum: "7/7",
    tag: "YOUR GOAL",
    progress: 1.0,
    titlePre: "What's your ",
    titleHighlight: "main target goal?",
    subtitle: "What is the single most valuable transformation Hakkiri can deliver for you?",
    options: [
      {
        id: "authority",
        title: "Command authority & executive presence",
        subtitle: "Speak with gravitas, low chest resonance, and unshakeable poise in rooms.",
        badge: "Authority",
        iconName: "crown" as IconName,
        iconGradient: "from-purple-500/30 to-blue-500/20 text-purple-300",
      },
      {
        id: "calmer_confident",
        title: "Feel calm and collected under acute pressure",
        subtitle: "Never freeze up when put on the spot; rely on structured spontaneous habits.",
        badge: "Resilience",
        iconName: "heart" as IconName,
        iconGradient: "from-emerald-500/30 to-teal-500/20 text-emerald-300",
      },
      {
        id: "persuasive_arguments",
        title: "Build clear, persuasive arguments on the fly",
        subtitle: "Deploy PREP and BLUF frameworks effortlessly without preparation notes.",
        badge: "Persuasion",
        iconName: "trending" as IconName,
        iconGradient: "from-blue-500/30 to-indigo-500/20 text-blue-soft",
      },
      {
        id: "clear_daily",
        title: "Eliminate filler words & speak concisely every day",
        subtitle: "Cut your talking time in half while doubling message retention.",
        badge: "Conciseness",
        iconName: "zap" as IconName,
        iconGradient: "from-amber-500/30 to-yellow-500/20 text-amber-300",
      },
    ],
  },
];

export function AssessmentFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("Alex Rivera");
  const [targetRole, setTargetRole] = useState("Senior Product Manager");
  const [confidenceScore, setConfidenceScore] = useState(3);
  const [selections, setSelections] = useState<Record<number, string>>({
    1: "female",
    2: "mid_level",
    3: "tech_product",
    5: "filler_rush",
    6: "authority",
  });
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Read user from /api/auth/me or cookies
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data?.user) {
          if (data.user.name) setName(data.user.name);
          if (data.user.targetRole) setTargetRole(data.user.targetRole);
        }
      })
      .catch(() => {
        const match = document.cookie.match(/(?:^|;\s*)hk_user=([^;]*)/);
        if (match) setName(decodeURIComponent(match[1]));
      });
  }, []);

  const step = STEPS[currentStep];

  const handleSelect = (optionId: string) => {
    setSelections((prev) => ({ ...prev, [currentStep]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      document.cookie = `hk_assessed=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

      // Persist to user record in background
      fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessed: true, targetRole }),
      }).catch(() => {});

      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (isCompleted) {
    return (
      <div className="mx-auto max-w-4xl py-6 animate-scale-in">
        <div className="rounded-[32px] border border-white/[0.1] bg-[#141524]/95 p-8 md:p-12 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl ring-1 ring-white/[0.05]">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-blue/15 blur-3xl pointer-events-none animate-pulse-glow" />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Assessment Completed · 100% Calibrated
            </span>
            <span className="text-xs text-muted">Speech Profile Configured</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Your 4-Week Communication Plan is <span className="text-blue-soft">Ready, {name}.</span>
          </h2>
          <p className="mt-3 text-base md:text-lg text-ink/70 max-w-2xl">
            Based on your diagnostic profile, your speaking track is calibrated to eliminate filler words, master spontaneous bottom-line framing, and project executive authority.
          </p>

          {/* Dual Focus Pillars with glowing borders */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-blue/30 bg-gradient-to-br from-blue/15 to-transparent p-6 shadow-lg transition-transform hover:scale-[1.01]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-soft flex items-center gap-1.5">
                <Icon name="target" size={14} />
                Priority Focus 1
              </span>
              <h4 className="mt-2 text-lg font-bold text-white">Answer First, Then Explain (BLUF)</h4>
              <p className="mt-1 text-xs text-ink/70 leading-relaxed">
                Lead with your conclusion in the first 5 seconds to command immediate stakeholder respect.
              </p>
            </div>
            <div className="rounded-2xl border border-lilac/30 bg-gradient-to-br from-lilac/15 to-transparent p-6 shadow-lg transition-transform hover:scale-[1.01]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-lilac flex items-center gap-1.5">
                <Icon name="sparkles" size={14} />
                Priority Focus 2
              </span>
              <h4 className="mt-2 text-lg font-bold text-white">Replace Filler Words with Power Pauses</h4>
              <p className="mt-1 text-xs text-ink/70 leading-relaxed">
                Eliminate permission-seeking phrases ("sort of", "like", "you know") with 1-second deliberate silence.
              </p>
            </div>
          </div>

          {/* 4-Week Progression Roadmap */}
          <div className="mt-8 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Your 4-Week Structured Curriculum
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  w: "Week 1",
                  title: "Foundations & Cadence",
                  drill: "Think Fast & Cut It In Half",
                  time: "5 min/day",
                  active: true,
                },
                {
                  w: "Week 2",
                  title: "Structure & PREP",
                  drill: "1-Minute Expert & Explain Simply",
                  time: "5 min/day",
                  active: false,
                },
                {
                  w: "Week 3",
                  title: "Stress & Pushbacks",
                  drill: "Debate Me & Connect The Dots",
                  time: "6 min/day",
                  active: false,
                },
                {
                  w: "Week 4",
                  title: "Executive Polish",
                  drill: "Storytelling Gym & Keynotes",
                  time: "7 min/day",
                  active: false,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "rounded-2xl p-4.5 border transition-all duration-300 hover:-translate-y-1",
                    item.active
                      ? "border-blue/50 bg-blue/15 shadow-lg ring-1 ring-blue/30"
                      : "border-white/[0.06] bg-[#1a1b2a]/60 opacity-80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-soft">
                      {item.w}
                    </span>
                    <span className="text-[10px] text-muted">{item.time}</span>
                  </div>
                  <h5 className="mt-2 text-sm font-bold text-white leading-snug">{item.title}</h5>
                  <p className="mt-1 text-xs text-muted">{item.drill}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/gym"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-fill/30 hover:bg-blue-hover transition-transform hover:scale-[1.02]"
            >
              <span>Launch Daily Gym & Drills</span>
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-panel-2 px-5 py-3.5 text-sm font-semibold text-ink border border-white/10 hover:bg-[#282a35] transition-colors"
            >
              <span>Go to Studio Dashboard</span>
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-2xl py-4 sm:py-6">
      {/* Background Animated Gradient Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-fill/15 blur-3xl animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl animate-float"
      />

      {/* Top Header Bar with animated progress pill and back button */}
      <div className="relative z-10 mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-panel-2/90 text-muted hover:text-white hover:bg-[#282a36] border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Go back"
            >
              <Icon name="back" size={14} />
            </button>
          )}
          <span className="text-xs font-black tracking-widest text-[#aab3ff] uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-soft animate-ping" />
            {step.tag} · {step.stepNum}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Animated Glowing Progress Pill */}
          <div className="w-28 h-2.5 rounded-full bg-white/[0.08] overflow-hidden p-0.5 border border-white/[0.05] shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-fill to-blue-soft transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(123,136,255,0.6)]"
              style={{ width: `${step.progress * 100}%` }}
            />
          </div>

          {/* Quick Skip link */}
          <Link
            href="/api/assessment/skip"
            className="text-xs text-muted/80 hover:text-white transition-colors ml-1 font-medium"
            title="Skip assessment and enter dashboard"
          >
            Skip →
          </Link>
        </div>
      </div>

      {/* Main Question Card with Smooth Keyframe Slide Transition */}
      <div
        key={currentStep}
        className="relative z-10 rounded-[28px] border border-white/[0.09] bg-[#141522]/95 p-7 sm:p-10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/[0.04] animate-slide-up"
      >
        <h1 className="text-2xl sm:text-[38px] font-black tracking-tight text-white leading-[1.18]">
          {step.titlePre}
          <span className="text-[#8494ff]">{step.titleHighlight}</span>
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-muted/90 leading-relaxed">{step.subtitle}</p>

        {/* Step 1: Name and Role Input with Live Animated Audio Badge Preview */}
        {step.isNameInput && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted/80 mb-2.5">
                YOUR FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#1a1b28]/90 px-4.5 py-3.5 text-base font-bold text-white placeholder-muted/60 focus:border-blue-soft focus:outline-none focus:ring-2 focus:ring-blue/30 transition-all shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                  <Icon name="user" size={17} />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted/80 mb-2.5">
                TARGET ROLE OR PROFESSIONAL POSITION
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Senior Product Manager"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#1a1b28]/90 px-4.5 py-3.5 text-base font-bold text-white placeholder-muted/60 focus:border-blue-soft focus:outline-none focus:ring-2 focus:ring-blue/30 transition-all shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                  <Icon name="brief" size={17} />
                </span>
              </div>
            </div>

            {/* Live Visual Candidate Badge Animation */}
            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#1c1d2d]/90 to-[#161725]/90 p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-fill/30 to-blue/15 text-blue-soft font-bold text-sm shadow-inner border border-blue/20">
                  {name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AR"}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{name || "Alex Rivera"}</span>
                  <span className="text-xs text-blue-soft font-medium">{targetRole || "Senior Product Manager"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Profiling
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confidence Gauge with Dynamic Audio Reactive Meter */}
        {step.hasGauge && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#1a1b28] p-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />

              <div className="text-5xl font-black text-blue-soft font-mono transition-transform duration-300">
                {confidenceScore} / 5
              </div>

              {/* Animated Decibel Meter Bars based on confidence */}
              <div className="flex items-center justify-center gap-1.5 my-3 h-8">
                {Array.from({ length: 16 }, (_, i) => {
                  const active = i < confidenceScore * 3.2;
                  return (
                    <span
                      key={i}
                      className={clsx(
                        "w-1.5 rounded-full transition-all duration-300",
                        active
                          ? i > 11
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                            : "bg-blue-soft shadow-[0_0_6px_rgba(123,136,255,0.6)]"
                          : "bg-white/10"
                      )}
                      style={{
                        height: active ? `${Math.min(28, 10 + (i % 4) * 5)}px` : "6px",
                      }}
                    />
                  );
                })}
              </div>

              <div className="text-base font-bold text-white">
                {confidenceScore === 1 && "Extremely Anxious & Overwhelmed under pressure"}
                {confidenceScore === 2 && "Not very confident (Struggle to find words)"}
                {confidenceScore === 3 && "Fairly confident (Clear, but rely on filler words)"}
                {confidenceScore === 4 && "Strong speaker (Wanting to sharpen executive presence)"}
                {confidenceScore === 5 && "Highly poised & confident in any high-stakes room"}
              </div>
              <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                {confidenceScore <= 2
                  ? "We will build neuromuscular confidence with short, low-stakes drills."
                  : "We will sharpen concise framing, power pauses, and executive cadence."}
              </p>
            </div>

            <div className="px-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={confidenceScore}
                onChange={(e) => setConfidenceScore(Number(e.target.value))}
                className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue"
              />
              <div className="flex justify-between text-[11px] font-bold text-muted mt-2">
                <span>1 (Anxious)</span>
                <span>3 (Fairly Confident)</span>
                <span>5 (Executive Poise)</span>
              </div>
            </div>
          </div>
        )}

        {/* Options List with Visual Illustrations & Icons for all steps (including Step 4/7) */}
        {step.options && (
          <div className="mt-6 space-y-3.5">
            {step.options.map((opt: Option) => {
              const selected = selections[currentStep] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={clsx(
                    "group cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex items-start gap-4 active:scale-[0.98]",
                    selected
                      ? "border-blue/50 bg-gradient-to-r from-blue/20 via-blue/10 to-[#1a1b28] shadow-[0_0_25px_rgba(123,136,255,0.22)] ring-1 ring-blue/40 -translate-y-0.5"
                      : "border-white/[0.07] bg-[#1a1b28]/70 hover:border-white/20 hover:bg-[#1a1b28] hover:-translate-y-0.5"
                  )}
                >
                  {/* Left 3D Illustrated Artwork Capsule */}
                  <OptionIllustration type={opt.id} selected={selected} />

                  {/* Middle Details */}
                  <div className="min-w-0 grow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={clsx(
                          "text-base font-bold transition-colors",
                          selected ? "text-white" : "text-ink group-hover:text-white"
                        )}
                      >
                        {opt.title}
                      </h3>
                      {opt.badge && (
                        <span
                          className={clsx(
                            "rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border transition-all",
                            selected
                              ? "bg-blue/30 text-blue-soft border-blue/40 shadow-xs"
                              : "bg-white/[0.06] text-muted border-white/5"
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-[13px] text-muted/90 leading-relaxed">
                      {opt.subtitle}
                    </p>
                  </div>

                  {/* Right Animated Radio Check Pill */}
                  <div
                    className={clsx(
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                      selected
                        ? "border-blue bg-blue text-white shadow-[0_0_10px_rgba(123,136,255,0.8)] scale-110"
                        : "border-white/25 group-hover:border-white/40"
                    )}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white animate-scale-in" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Navigation matching user's layout with animated CTA */}
        <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <span className="text-xs text-muted/70 font-medium">
            Step {step.stepNum} · All data stored locally & confidentially
          </span>

          <button
            onClick={handleNext}
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-fill px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-fill/30 hover:bg-blue-hover hover:shadow-blue-fill/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{currentStep === STEPS.length - 1 ? "Complete Assessment" : "Continue"}</span>
            <Icon name="arrowRight" size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
