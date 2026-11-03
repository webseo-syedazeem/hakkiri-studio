"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { MiniWave } from "@/components/audio/MiniWave";
import { Icon } from "@/components/ui";

export function AuthCard({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Product Manager");
  const [showPassword, setShowPassword] = useState(false);
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
    setStatusText(mode === "login" ? "Authenticating session..." : "Creating executive studio account...");

    setTimeout(() => {
      setStatusText("Calibrating accent-neutral voice engine...");
      setTimeout(() => {
        // Set the welcomed cookie so they land straight on the studio home
        document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}`;
        router.push("/");
      }, 700);
    }, 800);
  };

  const handleDemoLogin = () => {
    setError(null);
    setLoading(true);
    setStatusText("Entering as Demo Executive (Priya Shah)...");
    setTimeout(() => {
      document.cookie = `hk_welcomed=1; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.push("/");
    }, 900);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      {/* Dynamic Animated Ambient Studio Lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue/15 blur-[120px] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-fill/10 blur-[100px] animate-float"
      />

      <div className="relative z-10 w-full max-w-[1080px] grid grid-cols-1 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#171822]/90 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
        {/* Left Side: Desktop Branding & Showcase Experience */}
        <div className="relative hidden flex-col justify-between border-r border-white/[0.08] bg-gradient-to-br from-[#1b1c28] via-panel to-[#14151e] p-10 lg:flex">
          {/* Top Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue/15 shadow-[inset_0_0_0_1px_rgba(123,136,255,0.3)]">
                <Mark size={28} live={true} />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-ink">Hakkiri Studio</span>
                <span className="block text-[11px] font-semibold text-blue-soft uppercase tracking-wider">
                  Executive Practice Lab
                </span>
              </div>
            </Link>

            <h2 className="mt-8 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
              Master high-stakes interviews & executive pitches.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Simulate adaptive interviews that follow up on your logic, and rehearse slide decks against strict time budgets with accent-neutral AI.
            </p>
          </div>

          {/* Center Showcase Interactive Floating Cards */}
          <div className="my-8 space-y-4">
            {/* Floating Simulation Card */}
            <div className="pro-card rounded-2xl border border-white/[0.08] bg-booth/80 p-4 shadow-xl backdrop-blur-sm animate-slide-up">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-blue-soft">
                  <span className="h-2 w-2 rounded-full bg-blue animate-ping" />
                  Live Adaptive Interview
                </span>
                <span className="font-mono text-muted">Target: In 5 days</span>
              </div>
              <div className="mt-2.5 text-xs text-ink/90 font-medium">
                “Why do you want to lead payments at Halden rather than somewhere bigger?”
              </div>
              <MiniWave bars={44} played={26} className="mt-3 h-4" />
            </div>

            {/* Testimonial / Philosophy Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-panel-2/50 p-4 text-xs text-muted">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <Icon name="shield" size={14} className="text-emerald-400" />
                <span>Zero Accent Bias Guarantee</span>
              </div>
              Hakkiri analyzes only structure, evidence, metric depth, and pacing. Your background, native accent, and tone are never penalized.
            </div>
          </div>

          {/* Bottom Footer Tags */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-dim">
            <span>© Hakkiri Studio Pro</span>
            <span className="flex items-center gap-1 text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Offline Mock AI Engine Ready
            </span>
          </div>
        </div>

        {/* Right Side: Animated Authentication Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* Mobile Logo View */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Mark size={28} live={true} />
            <span className="text-lg font-bold text-ink">Hakkiri Studio</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative mb-6 flex rounded-xl bg-booth p-1 shadow-inner border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={clsx(
                "pro-btn relative flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200",
                mode === "login"
                  ? "bg-blue-fill text-white shadow-md"
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
                "pro-btn relative flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200",
                mode === "signup"
                  ? "bg-blue-fill text-white shadow-md"
                  : "text-muted hover:text-ink"
              )}
            >
              Create Account
            </button>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-ink">
              {mode === "login" ? "Welcome back" : "Start your practice suite"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {mode === "login"
                ? "Enter your credentials to access your interview pipelines and decks."
                : "Free trial includes 10 min interview practice and 5 min presentation rehearsal."}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mt-4 rounded-xl border border-red/20 bg-red/10 p-3 text-xs text-red-soft flex items-center gap-2 animate-slide-up">
              <Icon name="flag" size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Single-Sign-On */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="pro-btn flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-xs font-bold text-ink shadow-sm hover:border-white/20 hover:bg-[#282a36] transition-all"
            >
              {/* Google G logo */}
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="pro-btn flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-xs font-bold text-ink shadow-sm hover:border-white/20 hover:bg-[#282a36] transition-all"
            >
              {/* GitHub logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-[#171822] px-3 text-muted">Or with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
                <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="doc" size={15} className="text-muted" />
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
              <label className="block text-xs font-semibold text-ink mb-1">Work or Personal Email</label>
              <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                <Icon name="link" size={15} className="text-muted" />
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your email demo!")}
                    className="text-[11px] font-semibold text-blue-soft hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                <Icon name="lock" size={15} className="text-muted" />
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
                  className="text-xs font-semibold text-muted hover:text-ink"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Target Role</label>
                <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-panel-2 px-3 text-sm focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/30 transition-all">
                  <Icon name="brief" size={15} className="text-muted" />
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

            <button
              type="submit"
              disabled={loading}
              className="pro-btn relative mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-fill font-bold text-white shadow-lg shadow-blue-fill/25 hover:bg-blue-hover disabled:opacity-70 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="text-xs">{statusText}</span>
                </div>
              ) : (
                <>
                  <span className="text-sm">
                    {mode === "login" ? "Sign In to Studio" : "Create Studio Account"}
                  </span>
                  <Icon name="arrowRight" size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Pill */}
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center">
            <span className="text-xs text-muted block">Want to preview the studio immediately?</span>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="mt-1.5 text-xs font-bold text-emerald-400 hover:underline"
            >
              ⚡ One-Click Instant Demo Login (Priya Shah) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
