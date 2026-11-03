"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { Icon } from "@/components/ui";

const TRUSTED_COMPANIES = ["Halden", "Stripe", "Revolut", "Monzo", "Google", "DeepMind"];

export function AuthCard({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Product Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);
    setStatusText(mode === "login" ? "Verifying executive credentials..." : "Generating custom coaching profile...");

    setTimeout(() => {
      setStatusText("Calibrating accent-neutral voice engine...");
      setTimeout(() => {
        document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}`;
        router.push("/");
      }, 700);
    }, 800);
  };

  const handleDemoLogin = () => {
    setError(null);
    setLoading(true);
    setStatusText("Entering as Priya Shah (Senior PM Demo)...");
    setTimeout(() => {
      document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.push("/");
    }, 750);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8 bg-[#0c0d12]">
      {/* Background Studio Grid & Ambient Radial Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-[#3d4bd8]/25 to-[#7b88ff]/15 blur-[120px] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#4a5af0]/20 to-[#aeb6ff]/10 blur-[130px]"
      />

      {/* Main Glass Card Container with glowing 1px border */}
      <div className="relative z-10 w-full max-w-[1140px] overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#12131c]/90 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.85)] backdrop-blur-3xl ring-1 ring-white/[0.05]">
        {/* Top Desktop Window Chrome */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#0e0f17]/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80 ring-1 ring-[#ff5f56]/40" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80 ring-1 ring-[#ffbd2e]/40" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]/80 ring-1 ring-[#27c93f]/40" />
            <span className="ml-3 font-mono text-[11px] font-semibold tracking-wider text-muted/80 uppercase">
              Hakkiri Studio Pro · Rehearsal Booth
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-semibold text-emerald-400">Offline Mock AI Ready</span>
          </div>
        </div>

        {/* 2-Column Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          {/* Left Panel: Executive Simulation Telemetry */}
          <div className="relative flex flex-col justify-between border-b border-white/[0.08] bg-gradient-to-br from-[#161726]/95 via-[#12131e]/90 to-[#0e0f17]/95 p-8 sm:p-11 lg:border-b-0 lg:border-r border-white/[0.08]">
            {/* Header / Brand */}
            <div>
              <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-3.5 transition-transform hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-fill/30 to-blue/15 shadow-[inset_0_0_0_1px_rgba(123,136,255,0.4)] ring-1 ring-blue/20">
                    <Mark size={28} live={true} />
                  </div>
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                      Hakkiri Studio
                      <span className="rounded-md bg-blue/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-blue-soft border border-blue/30">
                        Pro
                      </span>
                    </span>
                    <span className="block text-[11px] font-semibold text-blue-soft tracking-wider">
                      Executive Speaking Agility Lab
                    </span>
                  </div>
                </Link>

                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live System
                </span>
              </div>

              <h2 className="mt-8 text-[32px] sm:text-[36px] font-black leading-[1.15] tracking-tight text-white">
                Master high-stakes interviews & executive pitches.
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed max-w-lg">
                Rehearse adaptive interview scenarios that probe your decisions, test slide timing against the clock, and train spontaneous communication with accent-neutral AI.
              </p>
            </div>

            {/* Interactive Telemetry Cards */}
            <div className="my-7 space-y-3.5">
              {/* Card 1: Adaptive Probe Simulation */}
              <div className="rounded-2xl border border-white/[0.1] bg-[#1a1b2a]/80 p-4.5 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/25 text-xs font-bold text-blue-soft shadow-inner">
                      S
                    </span>
                    <span className="font-bold text-white">Sam (AI Interviewer)</span>
                  </div>
                  <span className="rounded-md bg-blue/20 px-2 py-0.5 text-[10px] font-bold text-blue-soft border border-blue/30">
                    Target: In 5 days
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-[13px] font-semibold leading-relaxed text-ink/90 italic">
                  “Why do you want to lead payments at Halden rather than somewhere bigger?”
                </p>

                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-[#0f1018] px-3 py-2 shadow-inner border border-white/[0.04]">
                  <MiniWave bars={42} played={26} className="h-4" />
                  <span className="font-mono text-[11px] font-bold text-blue-soft">0:45 / 1:30</span>
                </div>
              </div>

              {/* Card 2: 4-Pillar Metric Strip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-[#1a1b2a]/60 p-3.5">
                  <div className="text-[11px] font-semibold text-muted">Speech Clarity Rating</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white font-mono">94%</span>
                    <span className="text-[10px] font-bold text-emerald-400">Executive Grade</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#1a1b2a]/60 p-3.5">
                  <div className="text-[11px] font-semibold text-muted">Filler Word Rate</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white font-mono">1.2</span>
                    <span className="text-[10px] text-muted">/ min (Low)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Zero Accent Bias Guarantee */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#1a1b2a]/50 p-3.5 text-xs text-muted flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue-soft mt-0.5 border border-blue/20">
                  <Icon name="shield" size={15} />
                </div>
                <div>
                  <span className="font-bold text-white">Zero Accent Bias Guarantee:</span>
                  <span className="text-muted block text-[11px] leading-relaxed mt-0.5">
                    Hakkiri scores only logic structure, metric depth, and cadence. Your native accent, pitch, and identity are never penalized.
                  </span>
                </div>
              </div>
            </div>

            {/* Trusted Candidate Placements */}
            <div className="border-t border-white/[0.08] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">
                Simulating bar-raiser questions for candidates at
              </span>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-muted">
                {TRUSTED_COMPANIES.map((company) => (
                  <span key={company} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-ink/80 border border-white/[0.04]">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Clean Professional Auth Experience */}
          <div className="flex flex-col justify-center p-8 sm:p-12 bg-[#12131c]/60">
            {/* Sliding Switcher (Login / Signup) */}
            <div className="relative mb-7 flex rounded-2xl bg-[#0c0d13] p-1 shadow-inner border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={clsx(
                  "relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                  mode === "login"
                    ? "bg-blue-fill text-white shadow-lg shadow-blue-fill/30"
                    : "text-muted hover:text-white"
                )}
              >
                Log In to Studio
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={clsx(
                  "relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                  mode === "signup"
                    ? "bg-blue-fill text-white shadow-lg shadow-blue-fill/30"
                    : "text-muted hover:text-white"
                )}
              >
                Create Account
              </button>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mode === "login" ? "Welcome back" : "Create your studio pass"}
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                {mode === "login"
                  ? "Enter your credentials to access your interview pipelines and decks."
                  : "Start your 7-day free trial with unlimited access to the Communication Gym."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-xl border border-red/30 bg-red/10 p-3 text-xs text-red-soft flex items-center gap-2.5 animate-slide-up">
                <Icon name="flag" size={15} className="shrink-0 text-red" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Social Authentication */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-4 text-xs font-bold text-white shadow-sm hover:border-white/20 hover:bg-[#202234] transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.43 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.11z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.57l4.03 3.11c.95-2.83 3.6-4.93 6.72-4.93z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-4 text-xs font-bold text-white shadow-sm hover:border-white/20 hover:bg-[#202234] transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Or Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-[#12131c] px-3 text-muted/70">Or with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Full Name</label>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                    <Icon name="doc" size={16} className="text-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Shah"
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-muted/60"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Work or Personal Email</label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="link" size={16} className="text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your email!")}
                      className="text-[11px] font-semibold text-blue-soft hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="lock" size={16} className="text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Target Role & Level</label>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#1a1b28]/80 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                    <Icon name="brief" size={16} className="text-muted" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Product Manager"
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-muted/60"
                    />
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#1a1b28] text-blue-fill focus:ring-blue cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-muted cursor-pointer select-none">
                    Remember this device for 30 days
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-fill font-bold text-white shadow-xl shadow-blue-fill/30 hover:bg-blue-hover disabled:opacity-75 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span className="text-xs font-semibold">{statusText}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-bold tracking-tight">
                      {mode === "login" ? "Sign In to Studio" : "Create Studio Pass"}
                    </span>
                    <Icon name="arrowRight" size={15} />
                  </>
                )}
              </button>
            </form>

            {/* One-Click Instant Demo Login */}
            <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-center">
              <span className="text-[11px] text-muted block">Want to preview the studio immediately?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>⚡ One-Click Instant Demo Login (Priya Shah) →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
