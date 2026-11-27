"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Shown in red, for Remove and the like. */
  danger?: boolean;
  /** A separator line goes above this item. */
  divide?: boolean;
}

/**
 * A menu button (design spec v3 §02: "⋯" on roles and bullets, and More in
 * the editor header). 36 px trigger on desktop, 44 px on phone; focus goes to
 * the first item on open; arrow keys move, Escape closes and returns focus to
 * the trigger. Items that can't be used are disabled, never hidden.
 */
export function Menu({ label, trigger, items, align = "end", className, testId }: { label: string; trigger: ReactNode; items: MenuItem[]; align?: "start" | "end"; className?: string; testId?: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const first = list.current?.querySelector<HTMLButtonElement>("button:not([disabled])");
    first?.focus();
    const away = (e: MouseEvent) => {
      if (!list.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  function close(refocus = true) {
    setOpen(false);
    if (refocus) requestAnimationFrame(() => button.current?.focus());
  }

  function onKey(e: React.KeyboardEvent) {
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(at + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(at - 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (e.key === "Tab") close(false);
  }

  return (
    <span className={clsx("cv-menu", className)}>
      <button
        ref={button}
        type="button"
        className="cv-btn cv-menu-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        data-testid={testId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div ref={list} id={id} role="menu" aria-label={label} className="cv-menu-list" data-align={align} onKeyDown={onKey}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              className={clsx("cv-menu-item", it.danger && "cv-menu-danger", it.divide && "cv-menu-divide")}
              onClick={() => {
                close();
                it.onSelect();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
