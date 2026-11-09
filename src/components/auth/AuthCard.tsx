"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { useAuth } from "@/lib/auth/AuthContext";

export function AuthCard({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const res = await login(email, password);
        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError(res.error ?? "Failed to sign in. Please verify your email and password.");
        }
      } else {
        const res = await signup(email, password, name);
        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError(res.error ?? "Failed to create account. Please try again.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle =
    "mt-1.5 w-full rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/60 transition-all duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20 focus:outline-none [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#22232c_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#f1f1f4]";

  return (
    <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-line bg-panel/95 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_64px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-scale-in transition-all duration-300 hover:border-line-strong">
      {/* Brand header */}
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          aria-label="Hakkiri home"
          className="transition-transform duration-500 hover:scale-110 active:scale-95"
        >
          <Mark size={42} />
        </Link>
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-ink animate-fade-in">
          {mode === "signin" ? "Sign in to Hakkiri Studio" : "Create your Studio account"}
        </h1>
        <p className="mt-1 text-[14px] text-muted animate-fade-in">
          {mode === "signin"
            ? "Your practice interviews, presentations, and scores"
            : "Practise for the interview you actually have"}
        </p>
      </div>

      {/* Mode switch */}
      <div className="mt-6 flex rounded-xl bg-panel-2 p-1 border border-line">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-1.5 text-[14px] font-medium transition-all duration-200 cursor-pointer ${
            mode === "signin"
              ? "bg-panel text-ink shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-1.5 text-[14px] font-medium transition-all duration-200 cursor-pointer ${
            mode === "signup"
              ? "bg-panel text-ink shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mt-4 rounded-xl border border-red/20 bg-red/10 px-3.5 py-2.5 text-[13px] text-red-soft animate-fade-in">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === "signup" && (
          <div className="animate-fade-in">
            <label htmlFor="auth-name" className="block text-[13px] font-medium text-dim">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-[13px] font-medium text-dim">
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. alex.morgan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-[13px] font-medium text-dim">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-blue-fill py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:bg-blue-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-fill/25 hover:shadow-lg hover:shadow-blue-fill/35 cursor-pointer"
        >
          {submitting
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in to Studio"
              : "Create free account"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div aria-hidden className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <span className="relative bg-panel px-3 text-[12px] uppercase tracking-wider text-muted">
          or
        </span>
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        onClick={() => {
          window.location.href = "/api/auth/google";
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-panel-2 py-2.5 text-[14px] font-medium text-ink transition-all duration-200 hover:bg-panel-2/80 hover:border-line-strong hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Guest / Direct access link */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-blue-soft transition-all duration-200 hover:translate-x-0.5 underline-offset-4 hover:underline"
        >
          Skip for now · Continue to Studio as Guest →
        </Link>
      </div>
    </div>
  );
}
