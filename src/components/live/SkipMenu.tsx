"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui";
import type { SkipReason } from "@/lib/mocks/store";

const REASONS: { value: Exclude<SkipReason, "said-so" | "by-choice">; label: string }[] = [
  { value: "not-relevant", label: "Not relevant to the role" },
  { value: "not-true", label: "Not true about me" },
  { value: "already-asked", label: "Already asked" },
  { value: "wrong-level", label: "Wrong level" },
];

/**
 * "Skip": one tap to say why, then the interviewer moves on to a replacement.
 * The opening and your questions for them skip straight away (`simple`): no reason, no replacement.
 */
export function SkipMenu({ onSkip, disabled, simple }: { onSkip: (reason: SkipReason) => void; disabled?: boolean; simple?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    // Keyboard: focus the first reason, arrows move, Escape closes and returns to Skip.
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
      const at = items.indexOf(document.activeElement as HTMLElement);
      if (at < 0) return;
      e.preventDefault();
      items[(at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  if (simple) {
    return (
      <Button onClick={() => onSkip("by-choice")} disabled={disabled}>
        Skip
      </Button>
    );
  }
  return (
    <div ref={ref} className="relative">
      <Button ref={button} onClick={() => setOpen(!open)} disabled={disabled} aria-expanded={open} aria-haspopup="menu">
        Skip
      </Button>
      {open && (
        <div role="menu" aria-label="Why skip this question?" className="absolute bottom-[calc(100%+8px)] right-0 z-30 w-[250px] rounded-[12px] bg-panel-2 p-1.5 shadow-[inset_0_0_0_1px_var(--color-line-strong),0_12px_40px_rgb(0_0_0/0.45)]">
          <div className="px-2.5 pb-1.5 pt-1 text-xs text-muted">Why skip it?</div>
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSkip(r.value);
              }}
              className={clsx("block w-full rounded-[8px] px-2.5 py-2 text-left text-sm font-medium hover:bg-white/[0.06]")}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
