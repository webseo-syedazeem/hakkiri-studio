"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { Icon } from "@/components/ui";

const TRUSTED_COMPANIES = ["Halden", "Stripe", "Revolut", "Monzo", "Google"];

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
    }, 850);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Background Studio Grid & Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/3 h-[600px] w-[600px] rounded-full bg-blue/15 blur-[140px] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 right-1/4 h-[550px] w-[550px] rounded-full bg-blue-fill/12 blur-[130px] animate-float"
      />

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-[1140px] overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#15161f]/95 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300">
        {/* Top Desktop Window Bar */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#11121a]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red/60" />
            <span className="h-3 w-3 rounded-full bg-amber-400/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/60" />
            <span className="ml-3 font-mono text-[11px] font-medium tracking-wider text-muted uppercase">
              Hakkiri Desktop Studio · Pro Suite v2.4
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium">Offline Mock AI Ready</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          {/* Left Side: Brand Showcase & Telemetry Preview */}
          <div className="relative flex flex-col justify-between border-b border-white/[0.08] bg-gradient-to-br from-[#1a1b28]/90 via-panel/80 to-[#12131b]/95 p-8 sm:p-10 lg:border-b-0 lg:border-r border-white/[0.08]">
            {/* Header / Brand */}
            <div>
              <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue/25 to-blue/10 shadow-[inset_0_0_0_1px_rgba(123,136,255,0.4)]">
                    <Mark size={30} live={true} />
                  </div>
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-ink">Hakkiri Studio</span>
                    <span className="block text-[11px] font-bold text-blue-soft uppercase tracking-widest">
                      Executive Practice Lab
                    </span>
                  </div>
                </Link>

                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue/15 px-3 py-1 text-[11px] font-semibold text-blue-soft border border-blue/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue animate-ping" />
                  Studio Online
                </span>
              </div>

              <h2 className="mt-8 text-[32px] font-extrabold leading-[1.2] tracking-tight text-ink">
                Master high-stakes interviews & executive pitches.
              </h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted max-w-lg">
                Rehearse adaptive interview scenarios that probe your decision-making, and test slide decks against strict time limits with zero accent bias.
              </p>
            </div>

            {/* Interactive Telemetry Cards */}
            <div className="my-8 space-y-3.5">
              {/* Card 1: Live Adaptive Question Preview */}
              <div className="pro-card rounded-2xl border border-white/[0.08] bg-booth/90 p-4.5 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/20 text-xs font-bold text-blue-soft">
                      S
                    </span>
                    <span className="font-bold text-ink">Sam (Hiring Manager)</span>
                  </div>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    Live Probe
                  </span>
                </div>

                <p className="mt-2.5 text-xs font-semibold leading-relaxed text-ink/90 italic">
                  “You said you paused onboarding to fix payments. What was your personal part in that decision?”
                </p>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#14151e] p-2.5 shadow-inner border border-white/[0.04]">
                  <MiniWave bars={38} played={24} className="h-4.5" />
                  <span className="num font-mono text-[11px] font-bold text-blue-soft">0:52 / 1:30</span>
                </div>
              </div>

              {/* Card 2: Performance & Speech Metrics Ribbon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-booth/60 p-3.5">
                  <div className="text-[11px] font-medium text-muted">Speech Clarity Rating</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-ink font-mono">94%</span>
                    <span className="text-[10px] font-bold text-emerald-400">High Clarity</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-booth/60 p-3.5">
                  <div className="text-[11px] font-medium text-muted">Filler Word Frequency</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-ink font-mono">1.4</span>
                    <span className="text-[10px] text-muted">/ min (Top 15%)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Trust & Equality Guarantee */}
              <div className="rounded-2xl border border-white/[0.06] bg-panel-2/40 p-3.5 text-xs text-muted flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <Icon name="shield" size={14} />
                </div>
                <div>
                  <span className="font-bold text-ink">Zero Accent Bias Guarantee:</span>
                  <span className="text-muted block text-[11px] leading-relaxed mt-0.5">
                    Evaluated strictly on logical structure, impact metrics, and concise delivery. Accent and native dialect are never scored.
                  </span>
                </div>
              </div>
            </div>

            {/* Trusted Companies Banner */}
            <div className="border-t border-white/[0.08] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-dim block mb-2">
                Simulating interview bars for candidates at
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
                {TRUSTED_COMPANIES.map((company) => (
                  <span key={company} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-ink/70">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Professional Authentication Workspace */}
          <div className="flex flex-col justify-center p-8 sm:p-12">
            {/* Sliding Mode Segmented Switcher */}
            <div className="relative mb-8 flex rounded-2xl bg-booth p-1 shadow-inner border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={clsx(
                  "pro-btn relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300",
                  mode === "login"
                    ? "bg-gradient-to-r from-blue-fill to-blue text-white shadow-lg shadow-blue-fill/30"
                    : "text-muted hover:text-ink"
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
                  "pro-btn relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300",
                  mode === "signup"
                    ? "bg-gradient-to-r from-blue-fill to-blue text-white shadow-lg shadow-blue-fill/30"
                    : "text-muted hover:text-ink"
                )}
              >
                Create Account
              </button>
            </div>

            {/* Form Title */}
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">
                {mode === "login" ? "Welcome back" : "Set up your studio pass"}
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                {mode === "login"
                  ? "Sign in to access your customized interview pipelines, slide pacing telemetry, and story vault."
                  : "Your free trial includes 10 minutes of interview practice and 5 minutes of slide rehearsal with complete analytics."}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 rounded-xl border border-red/30 bg-red/10 p-3 text-xs text-red-soft flex items-center gap-2.5 animate-slide-up">
                <Icon name="flag" size={15} className="shrink-0 text-red" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Social Authentication Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="pro-btn flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-panel-2 px-4 text-xs font-bold text-ink shadow-sm hover:border-white/20 hover:bg-[#282a36] transition-all"
              >
                {/* Official Google G Logo */}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.43 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.57l4.03 3.11c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="pro-btn flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-panel-2 px-4 text-xs font-bold text-ink shadow-sm hover:border-white/20 hover:bg-[#282a36] transition-all"
              >
                {/* Official GitHub Logo */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-[#15161f] px-4 text-muted">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Full Name</label>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-panel-2 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                    <Icon name="doc" size={16} className="text-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Shah"
                      className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-dim"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Work or Personal Email</label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-panel-2 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="link" size={16} className="text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-dim"
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
                      className="text-[11px] font-semibold text-blue-soft hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-panel-2 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="lock" size={16} className="text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-dim"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-muted hover:text-ink transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Target Role & Level</label>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-panel-2 px-3.5 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                    <Icon name="brief" size={16} className="text-muted" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Product Manager"
                      className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-dim"
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
                    className="h-4 w-4 rounded border-white/20 bg-panel-2 text-blue-fill focus:ring-blue"
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
                className="pro-btn relative mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-fill via-[#5363f8] to-blue font-bold text-white shadow-xl shadow-blue-fill/25 hover:from-blue-hover hover:to-blue disabled:opacity-75 transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span className="text-xs font-semibold">{statusText}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-bold tracking-tight">
                      {mode === "login" ? "Sign In to Studio" : "Create Executive Studio Pass"}
                    </span>
                    <Icon name="arrowRight" size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Instant Demo Access VIP Banner */}
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-4 text-center backdrop-blur-sm">
              <span className="text-[11px] font-medium text-muted block">Client or reviewer previewing the platform?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>⚡ One-Click Instant Demo Login (Priya Shah)</span>
                <Icon name="arrowRight" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
