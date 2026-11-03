"use client";

import clsx from "clsx";

interface IllustrationProps {
  type: string;
  selected?: boolean;
  className?: string;
}

export function OptionIllustration({ type, selected = false, className }: IllustrationProps) {
  switch (type) {
    /* ---------------------- Step 4: Work Context Visuals (High-Res 3D Glassmorphic Art) ---------------------- */
    case "tech_product":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 shadow-md",
            selected
              ? "ring-2 ring-blue-400 shadow-[0_0_22px_rgba(99,102,241,0.6)] scale-105"
              : "border border-blue-500/25 group-hover:scale-105",
            className
          )}
        >
          <img
            src="/illustrations/tech.jpg"
            alt="Tech & Product"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none" />
        </div>
      );

    case "corporate_finance":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 shadow-md",
            selected
              ? "ring-2 ring-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.6)] scale-105"
              : "border border-emerald-500/25 group-hover:scale-105",
            className
          )}
        >
          <img
            src="/illustrations/finance.jpg"
            alt="Corporate & Finance"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay pointer-events-none" />
        </div>
      );

    case "sales_marketing":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 shadow-md",
            selected
              ? "ring-2 ring-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.6)] scale-105"
              : "border border-amber-500/25 group-hover:scale-105",
            className
          )}
        >
          <img
            src="/illustrations/sales.jpg"
            alt="Sales & Marketing"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay pointer-events-none" />
        </div>
      );

    case "healthcare_edu":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 shadow-md",
            selected
              ? "ring-2 ring-rose-400 shadow-[0_0_22px_rgba(251,113,133,0.6)] scale-105"
              : "border border-rose-500/25 group-hover:scale-105",
            className
          )}
        >
          <img
            src="/illustrations/health.jpg"
            alt="Healthcare, Legal & Education"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-rose-500/10 mix-blend-overlay pointer-events-none" />
        </div>
      );

    /* ---------------------- Step 2: Voice Profiles ---------------------- */
    case "male":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-blue-500/30 to-indigo-600/30 ring-2 ring-blue-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105"
              : "bg-[#181a28] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="20" cy="28" r="12" stroke="#7b88ff" strokeWidth="2.5" fill="#1b1f35" />
            <path d="M28 20L40 8M40 8H30M40 8V18" stroke="#7b88ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Resonance soundwave bars inside */}
            <line x1="16" y1="25" x2="16" y2="31" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="22" x2="20" y2="34" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="26" x2="24" y2="30" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "female":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-purple-500/30 to-pink-600/30 ring-2 ring-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)] scale-105"
              : "bg-[#201726] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="18" r="12" stroke="#f472b6" strokeWidth="2.5" fill="#29152b" />
            <line x1="24" y1="30" x2="24" y2="42" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="36" x2="30" y2="36" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
            {/* Clarity wave */}
            <path d="M18 18Q21 13 24 18Q27 23 30 18" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "non_binary":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-teal-500/30 to-emerald-600/30 ring-2 ring-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.5)] scale-105"
              : "bg-[#142322] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="11" stroke="#2dd4bf" strokeWidth="2.5" fill="#132b29" />
            <path d="M24 13V5M20 9H28" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 32L40 40M40 40H32M40 40V32" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="3" fill="#99f6e4" />
          </svg>
        </div>
      );

    /* ---------------------- Step 3: Career Stages ---------------------- */
    case "early":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-amber-500/30 to-yellow-600/30 ring-2 ring-amber-400 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
              : "bg-[#211a14] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          {/* Rocket / Launch Illustration */}
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 6C24 6 34 16 34 28L28 32L24 28L20 32L14 28C14 16 24 6 24 6Z"
              fill="#2e2014"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <circle cx="24" cy="18" r="3" fill="#fde68a" />
            <path d="M24 32V42" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "mid_level":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-blue-500/30 to-indigo-600/30 ring-2 ring-blue-400 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              : "bg-[#161a29] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="14" width="32" height="24" rx="3" fill="#1b2238" stroke="#60a5fa" strokeWidth="2" />
            <path d="M18 14V10C18 8.89543 18.8954 8 20 8H28C29.1146 8 30 8.89543 30 10V14" stroke="#93c5fd" strokeWidth="2" />
            <circle cx="24" cy="24" r="2.5" fill="#bfdbfe" />
          </svg>
        </div>
      );

    case "exec":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-purple-500/30 to-pink-600/30 ring-2 ring-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-[#22152b] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          {/* Executive Crown */}
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M8 36L12 16L20 26L24 12L28 26L36 16L40 36H8Z"
              fill="#2e1438"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="14" r="2" fill="#e9d5ff" />
            <circle cx="24" cy="10" r="2.5" fill="#e9d5ff" />
            <circle cx="36" cy="14" r="2" fill="#e9d5ff" />
          </svg>
        </div>
      );

    case "self_learner":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-teal-500/30 to-cyan-600/30 ring-2 ring-teal-400 scale-105 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
              : "bg-[#132426] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          {/* Sparkles & Star Art */}
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 6L28 18L40 22L28 26L24 38L20 26L8 22L20 18L24 6Z"
              fill="#133033"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="36" cy="12" r="1.5" fill="#99f6e4" />
            <circle cx="12" cy="34" r="1.5" fill="#99f6e4" />
          </svg>
        </div>
      );

    /* ---------------------- Step 6: Roadblock Challenges ---------------------- */
    case "blank_pressure":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-red/30 to-amber-600/30 ring-2 ring-red scale-105 shadow-[0_0_15px_rgba(255,92,97,0.4)]"
              : "bg-[#251619] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M18 10C13 10 10 15 10 20C10 25 14 27 16 32V38H32V32C34 27 38 25 38 20C38 15 35 10 30 10"
              stroke="#ff5c61"
              strokeWidth="2"
            />
            <line x1="20" y1="24" x2="28" y2="24" stroke="#ffb3b5" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      );

    case "too_long":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-amber-500/30 to-yellow-600/30 ring-2 ring-amber-400 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
              : "bg-[#231a14] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="15" stroke="#fbbf24" strokeWidth="2.5" />
            <path d="M24 15V24L30 28" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 6L6 14M34 6L42 14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "filler_rush":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-blue-500/30 to-indigo-600/30 ring-2 ring-blue-400 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              : "bg-[#181a29] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M6 24H12L16 12L22 36L28 18L32 28L36 24H42"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    case "explain_simple":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-purple-500/30 to-pink-600/30 ring-2 ring-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-[#21152a] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M12 36L32 16L36 20L16 40L10 42L12 36Z" fill="#2d1738" stroke="#c084fc" strokeWidth="2" />
            <circle cx="34" cy="14" r="2" fill="#e9d5ff" />
            <path d="M26 8L28 12L32 14L28 16L26 20L24 16L20 14L24 12L26 8Z" fill="#e9d5ff" />
          </svg>
        </div>
      );

    case "lose_confidence":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-rose-500/30 to-red/30 ring-2 ring-rose-400 scale-105 shadow-[0_0_15px_rgba(251,113,133,0.4)]"
              : "bg-[#27151a] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M24 6L10 12V22C10 32 16 40 24 44C32 40 38 32 38 22V12L24 6Z" fill="#2d1419" stroke="#fb7185" strokeWidth="2" />
            <path d="M24 16V26M24 32H24.02" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    /* ---------------------- Step 7: Goals ---------------------- */
    case "authority":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-purple-500/30 to-blue-600/30 ring-2 ring-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-[#1f172a] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="20" r="10" stroke="#c084fc" strokeWidth="2" fill="#2d1738" />
            <path d="M17 38L24 32L31 38" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 16V24M20 20H28" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "calmer_confident":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-emerald-500/30 to-teal-600/30 ring-2 ring-emerald-400 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
              : "bg-[#142621] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            {/* Zen Lotus / Calm Shield */}
            <path
              d="M24 8C20 16 12 24 12 30C12 36.6274 17.3726 42 24 42C30.6274 42 36 36.6274 36 30C36 24 28 16 24 8Z"
              fill="#15362d"
              stroke="#34d399"
              strokeWidth="2"
            />
            <path d="M24 22V36M18 30C20 32 22 34 24 34C26 34 28 32 30 30" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "persuasive_arguments":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-blue-500/30 to-indigo-600/30 ring-2 ring-blue-400 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              : "bg-[#161c2b] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M10 38V12L24 6L38 12V38H10Z" fill="#18233a" stroke="#60a5fa" strokeWidth="2" />
            <path d="M18 24L24 18L30 24" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case "clear_daily":
      return (
        <div
          className={clsx(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-amber-500/30 to-yellow-600/30 ring-2 ring-amber-400 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
              : "bg-[#221b14] border border-white/10 group-hover:scale-105",
            className
          )}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M26 6L14 26H24L22 42L34 22H24L26 6Z" fill="#2f2211" stroke="#fbbf24" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
