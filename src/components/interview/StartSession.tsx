"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { QuestionGroup } from "@/lib/types";
import { Button, Icon } from "@/components/ui";
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
  useEffect(() => {
    if (!busy) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 1500);
    return () => clearTimeout(t);
  }, [busy]);
  async function plan(body: PlanBody) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json().catch(() => ({}))) as { href?: string; message?: string };
      if (!res.ok || !json.href) throw new Error(json.message ?? "That couldn’t be started. Try again.");
      router.push(micOk ? json.href : `/mic-check?next=${encodeURIComponent(json.href)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That couldn’t be started. Try again.");
      setBusy(false);
    }
  }
  return { plan, busy, slow, error };
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
}: {
  interviewId: string;
  micOk: boolean;
  body: PlanBody;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { plan, busy, slow, error } = usePlan(interviewId, micOk);
  return (
    <span className={clsx("inline-flex flex-col items-end gap-1", className)}>
      <Button variant={variant} size={size} disabled={busy} onClick={() => void plan(body)} className="w-full">
        {busy ? (slow && body.kind !== "rerun" ? "Writing your questions…" : "Starting…") : children}
      </Button>
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
          {busy ? (slow ? "Writing your questions…" : "Starting…") : label}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-right text-[13px] text-red-soft">
          {error}
        </p>
      )}
    </div>
  );
}
