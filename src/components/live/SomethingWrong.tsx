"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useDialogFocus } from "@/components/ui/useDialogFocus";
import { Button, Icon, Panel } from "@/components/ui";
import { WRONG_REASON_LABEL, WRONG_REASONS, type WrongReason } from "@/lib/ai/interview/questions";

/**
 * "Something's wrong": the interview is paused while you say what's off.
 * Fix it and restart sends your feedback and opens the rebuild; Carry on
 * picks up where you were.
 */
export function SomethingWrong({
  initialReasons,
  skippedCount,
  busy,
  error,
  onFix,
  onCarryOn,
}: {
  initialReasons: WrongReason[];
  skippedCount: number;
  busy: boolean;
  error: string | null;
  onFix: (reasons: WrongReason[], note: string) => void;
  onCarryOn: () => void;
}) {
  const [reasons, setReasons] = useState<WrongReason[]>(initialReasons);
  const [note, setNote] = useState("");
  const dialog = useDialogFocus<HTMLElement>();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCarryOn();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [busy, onCarryOn]);
  const toggle = (r: WrongReason) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <Panel ref={dialog} role="dialog" aria-modal="true" aria-label="Something’s wrong" className="w-full max-w-[580px] animate-rise bg-panel px-6 py-5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-muted">
          <Icon name="pause" size={14} strokeWidth={2.4} />
          Interview paused
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.015em]">What’s off?</h2>
        <p className="mt-1 text-sm text-muted">
          {skippedCount >= 3 ? "You’ve skipped three questions, so Hakkiri may have misread the job. " : ""}Pick what fits and add anything in your own words. Hakkiri rereads your documents, shows you what it changed, and rebuilds the questions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="What’s wrong">
          {WRONG_REASONS.map((r) => {
            const on = reasons.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(r)}
                className={clsx("inline-flex h-9 items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-semibold transition-colors", on ? "bg-blue-fill text-white" : "bg-panel-2 text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink")}
              >
                {on && <Icon name="check" size={14} strokeWidth={2.6} />}
                {WRONG_REASON_LABEL[r]}
              </button>
            );
          })}
        </div>
        <label htmlFor="wrong-note" className="mt-4 block text-[13px] font-semibold">
          In your own words <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="wrong-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={600}
          placeholder="For example: It’s a sales job, I’m getting coding questions."
          className="mt-2 w-full resize-none rounded-[10px] bg-panel-2 px-3.5 py-3 text-sm outline-none shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-dim focus:shadow-[inset_0_0_0_1px_var(--color-blue)]"
        />
        {error && (
          <p role="alert" className="mt-2 text-[13px] text-red-soft">
            {error}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-dim">This interview won’t be scored.</p>
          <div className="flex gap-2.5">
            <Button onClick={onCarryOn} disabled={busy}>
              Carry on
            </Button>
            <Button variant="primary" onClick={() => onFix(reasons, note.trim())} disabled={busy || (!reasons.length && !note.trim())}>
              {busy ? "Saving…" : "Fix it and restart"}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
