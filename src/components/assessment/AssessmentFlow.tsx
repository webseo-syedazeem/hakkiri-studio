"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/ui";

interface Option {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  iconName?: string;
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
      },
      {
        id: "female",
        title: "Female Clarity",
        subtitle: "Develop pitch clarity, commanding low-chest cadence, and vocal control.",
        badge: "♀ Pitch 165-255 Hz",
      },
      {
        id: "non_binary",
        title: "Non-binary / Vocal Alignment",
        subtitle: "Personalize your resonance range, comfort frequencies, and delivery.",
        badge: "⚧ Custom Resonance",
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
      },
      {
        id: "mid_level",
        title: "Mid-Level Professional",
        subtitle: "Cross-functional meetings, sprint demos, and promotion conversations.",
        badge: "3-7 Years",
      },
      {
        id: "exec",
        title: "Senior Executive / Founder",
        subtitle: "Board presentations, investor pitches, and keynote industry speeches.",
        badge: "8+ Years / Exec",
      },
      {
        id: "self_learner",
        title: "General Self-Learner",
        subtitle: "Everyday articulation, personal confidence, and speaking poise.",
        badge: "Universal Track",
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
      },
      {
        id: "corporate_finance",
        title: "Corporate & Finance",
        subtitle: "Board meetings, financial data reviews, and high-stakes formal decks.",
        badge: "Finance / Strategy",
      },
      {
        id: "sales_marketing",
        title: "Sales, Growth & Marketing",
        subtitle: "Adversarial negotiation, customer pitches, and audience engagement.",
        badge: "Commercial",
      },
      {
        id: "healthcare_edu",
        title: "Healthcare, Legal & Education",
        subtitle: "Empathetic communication, precise counsel, and clear explanations.",
        badge: "Specialized",
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
      },
      {
        id: "too_long",
        title: "I take too long to get to the point",
        subtitle: "I provide excessive context and preamble before stating my conclusion.",
        badge: "Preamble / Waffle",
      },
      {
        id: "filler_rush",
        title: "I rush or use too many filler words",
        subtitle: "I lean on 'um', 'like', 'sort of', or speed up my delivery when anxious.",
        badge: "Pacing & Fillers",
      },
      {
        id: "explain_simple",
        title: "I struggle to explain things simply",
        subtitle: "I know what I mean, but make technical concepts sound overly complex.",
        badge: "Jargon Trap",
      },
      {
        id: "lose_confidence",
        title: "I lose confidence when challenged",
        subtitle: "I get defensive or trail off when stakeholders push back on my proposals.",
        badge: "Adversarial Pushback",
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
      },
      {
        id: "calmer_confident",
        title: "Feel calm and collected under acute pressure",
        subtitle: "Never freeze up when put on the spot; rely on structured spontaneous habits.",
        badge: "Resilience",
      },
      {
        id: "persuasive_arguments",
        title: "Build clear, persuasive arguments on the fly",
        subtitle: "Deploy PREP and BLUF frameworks effortlessly without preparation notes.",
        badge: "Persuasion",
      },
      {
        id: "clear_daily",
        title: "Eliminate filler words & speak concisely every day",
        subtitle: "Cut your talking time in half while doubling message retention.",
        badge: "Conciseness",
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

  const step = STEPS[currentStep];

  const handleSelect = (optionId: string) => {
    setSelections((prev) => ({ ...prev, [currentStep]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Mark assessment completed in cookies and state
      document.cookie = `hk_assessed=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
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
      <div className="mx-auto max-w-4xl py-6 animate-fade-in">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#141522] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
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

          {/* Dual Focus Pillars */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-blue/30 bg-blue/10 p-5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-soft">
                Priority Focus 1
              </span>
              <h4 className="mt-1 text-lg font-bold text-white">Answer First, Then Explain (BLUF)</h4>
              <p className="mt-1 text-xs text-ink/70">
                Lead with your conclusion in the first 5 seconds to command immediate stakeholder respect.
              </p>
            </div>
            <div className="rounded-2xl border border-lilac/30 bg-lilac/10 p-5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-lilac">
                Priority Focus 2
              </span>
              <h4 className="mt-1 text-lg font-bold text-white">Replace Filler Words with Power Pauses</h4>
              <p className="mt-1 text-xs text-ink/70">
                Eliminate permission-seeking phrases ("sort of", "like", "you know") with 1-second deliberate silence.
              </p>
            </div>
          </div>

          {/* 4-Week Progression Roadmap */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Your 4-Week Curriculum
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
                    "rounded-xl p-4 border transition-all",
                    item.active
                      ? "border-blue/40 bg-panel-2 shadow-lg ring-1 ring-blue/20"
                      : "border-white/[0.06] bg-panel-2/40 opacity-80"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-hover transition-transform hover:scale-[1.02]"
            >
              <span>Launch Daily Gym & Drills</span>
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link
              href="/"
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
    <div className="mx-auto max-w-2xl py-6 animate-fade-in">
      {/* Top Header Bar matching user's exact screenshot */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel-2 text-muted hover:text-white transition-colors cursor-pointer"
              title="Go back"
            >
              <Icon name="back" size={14} />
            </button>
          )}
          <span className="text-xs font-black tracking-widest text-[#aab3ff] uppercase">
            {step.tag} · {step.stepNum}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Top-right pill progress bar */}
          <div className="w-28 h-2 rounded-full bg-white/[0.1] overflow-hidden">
            <div
              className="h-full bg-[#7a88ff] transition-all duration-300 rounded-full"
              style={{ width: `${step.progress * 100}%` }}
            />
          </div>

          {/* Quick Skip Option */}
          <Link
            href="/api/assessment/skip"
            className="text-xs text-muted hover:text-white transition-colors ml-1"
            title="Skip assessment and enter dashboard"
          >
            Skip →
          </Link>
        </div>
      </div>

      {/* Main Question Card matching screenshot container styling */}
      <div className="rounded-[28px] border border-white/[0.08] bg-[#141520]/95 p-7 md:p-10 shadow-2xl backdrop-blur-md">
        <h1 className="text-2xl md:text-[38px] font-black tracking-tight text-white leading-tight">
          {step.titlePre}
          <span className="text-[#8494ff]">{step.titleHighlight}</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted/90">{step.subtitle}</p>

        {/* Step 1: Name and Role Input (Exact replica of user screenshot) */}
        {step.isNameInput && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted/80 mb-2">
                YOUR FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-xl border border-white/[0.08] bg-[#1a1b28]/90 px-4 py-3.5 text-base font-semibold text-white placeholder-muted focus:border-blue-soft focus:outline-none focus:ring-2 focus:ring-blue/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted/80 mb-2">
                TARGET ROLE OR PROFESSIONAL POSITION
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Senior Product Manager"
                className="w-full rounded-xl border border-white/[0.08] bg-[#1a1b28]/90 px-4 py-3.5 text-base font-semibold text-white placeholder-muted focus:border-blue-soft focus:outline-none focus:ring-2 focus:ring-blue/30 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 5: Confidence Gauge Slider */}
        {step.hasGauge && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#1a1b28] p-6 text-center">
              <div className="text-5xl font-black text-blue-soft">{confidenceScore} / 5</div>
              <div className="mt-2 text-base font-bold text-white">
                {confidenceScore === 1 && "Extremely Anxious & Overwhelmed under pressure"}
                {confidenceScore === 2 && "Not very confident (I struggle to find words)"}
                {confidenceScore === 3 && "Fairly confident (Clear, but rely on filler words)"}
                {confidenceScore === 4 && "Strong speaker (Wanting to sharpen executive presence)"}
                {confidenceScore === 5 && "Highly confident & poised in any room"}
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
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue"
              />
              <div className="flex justify-between text-[11px] font-bold text-muted mt-2">
                <span>1 (Anxious)</span>
                <span>3 (Fairly Confident)</span>
                <span>5 (Executive)</span>
              </div>
            </div>
          </div>
        )}

        {/* Options List for other steps */}
        {step.options && (
          <div className="mt-6 space-y-3">
            {step.options.map((opt: Option) => {
              const selected = selections[currentStep] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={clsx(
                    "cursor-pointer rounded-2xl p-4 md:p-5 border transition-all duration-200 flex items-start gap-4",
                    selected
                      ? "border-blue/50 bg-blue/15 shadow-md ring-1 ring-blue/30"
                      : "border-white/[0.06] bg-[#1a1b28]/60 hover:border-white/15 hover:bg-[#1a1b28]"
                  )}
                >
                  <div
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                      selected ? "border-blue bg-blue text-white" : "border-white/20"
                    )}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>

                  <div className="min-w-0 grow">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-ink">{opt.title}</h3>
                      {opt.badge && (
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-blue-soft border border-white/5">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted leading-relaxed">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Bar matching screenshot */}
        <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <span className="text-xs text-muted/70">
            Step {step.stepNum} · All data stored locally & confidentially
          </span>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-fill px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-hover transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <span>{currentStep === STEPS.length - 1 ? "Complete Assessment" : "Continue"}</span>
            <Icon name="arrowRight" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
