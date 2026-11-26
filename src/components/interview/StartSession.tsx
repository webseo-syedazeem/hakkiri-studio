"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { QuestionGroup } from "@/lib/types";
import { Button, Icon } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthContext";
import { SettingsPicker } from "./SettingsPicker";
import type { DrillSpec } from "@/lib/sessions/drills";
import { CATEGORY_LABEL, type Mix, type SessionSettings, type TechnicalLabel } from "@/lib/interviews/settings";

type PlanBody = { kind: "interview"; settings: SessionSettings } | { kind: "rerun"; sessionId: string } | { kind: "drill"; drill: DrillSpec };

/** Plans the session on the server, then opens it (through the mic check if this browser hasn't had one). */
function usePlan(interviewId: string, micOk: boolean) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-warm the target routes for instant navigation
  useEffect(() => {
    router.prefetch(`/mock/${interviewId}`);
    router.prefetch("/mic-check");
  }, [router, interviewId]);

  useEffect(() => {
    if (!busy) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 1500);
    return () => clearTimeout(t);
  }, [busy]);

  async function plan(body: PlanBody) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json().catch(() => ({}))) as { href?: string; message?: string };
      if (!res.ok || !json.href) throw new Error(json.message ?? "That couldn’t be started. Try again.");
      const dest = micOk ? json.href : `/mic-check?next=${encodeURIComponent(json.href)}`;
      router.push(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That couldn’t be started. Try again.");
      setBusy(false);
    }
  }
  return { plan, busy, slow, error };
}

const PREP_STEPS = [
  "Analysing role criteria & candidate profile",
  "Structuring tailored interview questions & follow-up probes",
  "Calibrating AI interviewer voice & studio acoustics",
  "Opening your live rehearsal booth",
] as const;

function PreparingSessionModal() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || (user?.email ? user.email.split("@")[0] : "") || "Candidate";
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(24);

  useEffect(() => {
    setMounted(true);
    const stepTimer = setInterval(() => {
      setStepIdx((prev) => (prev < PREP_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    const pctTimer = setInterval(() => {
      setPct((prev) => (prev < 95 ? Math.min(95, prev + Math.max(2, Math.round((96 - prev) * 0.16))) : prev));
    }, 260);
    return () => {
      clearInterval(stepTimer);
      clearInterval(pctTimer);
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      data-testid="preparing-session-container"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-[490px] overflow-hidden rounded-2xl border border-line-strong dark:border-blue/40 bg-panel dark:bg-[#161722]/98 p-6 shadow-2xl animate-scale-in">
        {/* Ambient top glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(92,95,252,0.35),transparent_70%)]"
        />

        {/* Header with user name & animated voice bars */}
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue/40 bg-blue/10 dark:bg-gradient-to-br dark:from-[#4f52f8]/35 dark:to-[#6d5eff]/20 text-blue-soft shadow-sm">
            <div className="flex items-end gap-1 h-5" aria-hidden="true">
              <span className="w-1 h-4 rounded-full bg-blue-soft animate-wave" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-5 rounded-full bg-blue-fill dark:bg-white animate-wave" style={{ animationDelay: "180ms" }} />
              <span className="w-1 h-3.5 rounded-full bg-blue-soft animate-wave" style={{ animationDelay: "360ms" }} />
              <span className="w-1 h-5 rounded-full bg-blue-fill dark:bg-white animate-wave" style={{ animationDelay: "520ms" }} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue/30 bg-blue/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Studio Setup
              </span>
              <span className="num text-xs font-bold text-blue-soft">{pct}%</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">
              Preparing your interview, {displayName}…
            </h3>
            <p className="mt-0.5 text-[13px] text-muted">
              Tailoring your questions and calibrating the AI interviewer. Your session will open automatically in a moment.
            </p>
          </div>
        </div>

        {/* Animated Shimmer Progress Bar */}
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-panel-2 dark:bg-[#0d0e15] border border-line">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-blue-fill via-[#4f7df8] to-[#7b9dff] transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Live Step-by-Step Checklist */}
        <ul className="mt-5 space-y-2.5">
          {PREP_STEPS.map((stepText, idx) => {
            const done = idx < stepIdx;
            const active = idx === stepIdx;
            return (
              <li
                key={stepText}
                className={clsx(
                  "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] transition-all duration-300",
                  done
                    ? "border-emerald-500/30 bg-emerald-500/10 text-ink"
                    : active
                      ? "border-blue/40 bg-blue/10 text-ink shadow-sm"
                      : "border-line bg-panel-2 text-dim",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {done ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold">
                      ✓
                    </span>
                  ) : active ? (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-blue-soft/30 border-t-blue-soft animate-spin" />
                  ) : (
                    <span className="h-2 w-2 mx-1.5 shrink-0 rounded-full bg-dim/40" />
                  )}
                  <span className="truncate font-medium">{stepText}</span>
                </div>
                <span
                  className={clsx(
                    "shrink-0 text-[11px] font-semibold",
                    done ? "text-emerald-600 dark:text-emerald-300" : active ? "text-blue-soft" : "text-dim",
                  )}
                >
                  {done ? "Completed" : active ? "In progress…" : "Queued"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Please stay on this screen — your studio will launch automatically</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** One button that starts a planned session: an interview with saved settings, a re-run, or a drill. */
export function StartButton({
  interviewId,
  micOk,
  body,
  children,
  variant = "secondary",
  size = "md",
  className,
  buttonClassName,
}: {
  interviewId: string;
  micOk: boolean;
  body: PlanBody;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  buttonClassName?: string;
}) {
  const { plan, busy, slow, error } = usePlan(interviewId, micOk);
  return (
    <span className={clsx("inline-flex flex-col items-end gap-1", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (busy) return;
          void plan(body);
        }}
        className={clsx(
          "w-full cursor-pointer select-none transition-all duration-150 active:scale-[0.98]",
          busy && "opacity-80 pointer-events-none cursor-wait",
          buttonClassName,
        )}
      >
        {busy ? (
          <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
            <span>{slow && body.kind !== "rerun" ? "Preparing questions…" : "Starting…"}</span>
          </span>
        ) : children}
      </Button>
      {busy && <PreparingSessionModal />}
      {error && (
        <span role="alert" className="max-w-[320px] text-right text-xs text-red-soft">
          {error}
        </span>
      )}
    </span>
  );
}

/**
 * Settings and Start for a new interview: difficulty, length and question
 * mix (saved for next time), with an offer to lean towards your weakest
 * category once you've had an interview.
 */
export function NewInterviewPanel({
  interviewId,
  micOk,
  initial,
  meanings,
  technicalLabel,
  lean,
  label,
}: {
  interviewId: string;
  micOk: boolean;
  initial: SessionSettings;
  meanings?: Record<QuestionGroup, string>;
  technicalLabel: TechnicalLabel;
  /** The mix moved 10 points towards your weakest category. */
  lean?: { mix: Mix; weakest: QuestionGroup; strongest: QuestionGroup } | null;
  label: string;
}) {
  const [settings, setSettings] = useState<SessionSettings>(initial);
  const { plan, busy, slow, error } = usePlan(interviewId, micOk);
  const leanActive = Boolean(lean && Object.entries(lean.mix).every(([g, v]) => settings.mix[g as QuestionGroup] === v));
  const name = (g: QuestionGroup) => (g === "technical" ? technicalLabel : CATEGORY_LABEL[g]);
  return (
    <div>
      <SettingsPicker
        collapsible
        value={settings}
        onChange={setSettings}
        meanings={meanings}
        technicalLabel={technicalLabel}
        lean={lean ? { label: leanActive ? `Leaning towards ${name(lean.weakest)}, your weakest (+10%, from ${name(lean.strongest)})` : `Lean towards ${name(lean.weakest)}, your weakest category`, active: leanActive, apply: () => setSettings({ ...settings, mix: lean.mix, preset: "custom" }) } : null}
      />
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-4">
        <Button variant="primary" size="lg" disabled={busy} onClick={() => void plan({ kind: "interview", settings })}>
          <Icon name="mic" size={17} strokeWidth={2} />
          {busy ? (slow ? "Preparing questions…" : "Starting…") : label}
        </Button>
      </div>
      {busy && <PreparingSessionModal />}
      {error && (
        <p role="alert" className="mt-2 text-right text-[13px] text-red-soft">
          {error}
        </p>
      )}
    </div>
  );
}
