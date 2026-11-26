"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { type ComponentProps, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * The small pieces every CV screen is built from: the bar across the top, a
 * panel, a field with its rule and anything to check, a button. One place, so
 * the screens stay consistent and can be restyled together.
 */

/**
 * Puts the cursor on the screen's heading. That is where someone using a
 * keyboard or a screen reader should find themselves after the screen has
 * changed: not back at the top of the page, with the whole menu to tab
 * through again. Returns false when the heading has not been drawn yet.
 */
export function focusHeading(): boolean {
  const h = document.querySelector<HTMLElement>(".cv h1");
  if (!h) return false;
  if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
  h.focus();
  return document.activeElement === h;
}

/** The address of the CV screen last shown, so a change of screen can be told from a first visit. */
let lastScreen: string | null = null;

/** Wraps a CV screen and cancels the app shell's own padding, so the bar can run edge to edge. */
export function CvScreen({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Moving from one CV screen to another ("Continue to Experience", tailoring to the letter) leaves the button that
  // was pressed behind, and the cursor with it. It is put on the new screen's heading, unless a field has asked for
  // it (the line a finding points at) or a dialog is open.
  useEffect(() => {
    const from = lastScreen;
    lastScreen = pathname;
    if (from === null || from === pathname) return;
    let tries = 0;
    const timer = setInterval(() => {
      const at = document.activeElement as HTMLElement | null;
      const taken = !!at && at !== document.body && (/^(?:INPUT|TEXTAREA|SELECT)$/.test(at.tagName) || !!at.closest('[role="dialog"]'));
      // The heading is not there while the screen is still loading: it is looked for again, for a couple of seconds.
      if (taken || focusHeading() || ++tries > 25) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, [pathname]);
  return <div className="cv cv-screen min-w-0 grow w-full">{children}</div>;
}

export interface Crumb {
  label: string;
  href?: string;
}

/** Where you are: the section, then the page. */
export function Crumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="cv-crumb">
      {crumbs.map((c, i) => (
        <span key={c.label + i} className="cv-row" style={{ gap: 8 }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <b aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</b>}
        </span>
      ))}
    </nav>
  );
}

/** The bar: where you are on the left, save state and actions on the right. With no actions, a plain breadcrumb line. */
export function Bar({ crumbs, children }: { crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <header className={children ? "cv-bar" : "cv-bar cv-bar-plain"}>
      <Crumbs crumbs={crumbs} />
      {children && <div className="cv-row">{children}</div>}
    </header>
  );
}

/** The heading row of a screen: a small line saying what this belongs to, the title, and the one primary action. */
export function Toolbar({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="cv-toolbar">
      <div className="min-w-0">
        {eyebrow && <div className="cv-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="cv-muted" style={{ marginTop: 5 }}>{subtitle}</p>}
      </div>
      {children && <div className="cv-row">{children}</div>}
    </div>
  );
}

export function Panel({ title, aside, children, foot, className, ...rest }: { title?: ReactNode; aside?: ReactNode; foot?: ReactNode } & Omit<ComponentProps<"section">, "title">) {
  return (
    <section className={clsx("cv-panel", className)} {...rest}>
      {(title || aside) && (
        <div className="cv-panelhead">
          {typeof title === "string" ? <h2>{title}</h2> : title}
          {aside}
        </div>
      )}
      {children}
      {foot && <div className="cv-panelfoot">{foot}</div>}
    </section>
  );
}

type BtnKind = "default" | "primary" | "quiet" | "danger";
const btnClass = (kind: BtnKind, extra?: string) => clsx("cv-btn", kind === "primary" && "cv-btn-primary", kind === "quiet" && "cv-btn-quiet", kind === "danger" && "cv-btn-danger", extra);

export function Btn({ kind = "default", className, type = "button", busy, children, disabled, ...rest }: ComponentProps<"button"> & { kind?: BtnKind; busy?: boolean }) {
  return (
    <button type={type} className={btnClass(kind, className)} disabled={disabled || busy} aria-busy={busy || undefined} {...rest}>
      {children}
    </button>
  );
}

export function BtnLink({ kind = "default", className, ...rest }: ComponentProps<typeof Link> & { kind?: BtnKind }) {
  return <Link className={btnClass(kind, className)} {...rest} />;
}

/** Something to check about a field: the reason and what can be done about it. */
export function Note({ label, children, actions, id, kind }: { label?: string; children: ReactNode; actions?: ReactNode; id?: string; /** "issue" for a concrete defect (red); otherwise a suggestion or something to check (blue). */ kind?: "issue" | "suggestion" }) {
  return (
    <div className="cv-note" id={id} role="note" data-kind={kind}>
      {label && <b>{label}</b>}
      {label && <br />}
      {children}
      {actions && <div className="cv-row" style={{ marginTop: 8, gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function Fixed({ children }: { children: ReactNode }) {
  return (
    <p className="cv-fixed">
      <span aria-hidden="true">✓</span>
      {children}
    </p>
  );
}

interface FieldProps {
  label: string;
  /** The rule for this field, shown directly under its label. */
  rule?: string;
  error?: string;
  /** Marks the field as one the upload reader was unsure about. */
  uncertain?: boolean;
  /** Shown under the input: something to check, with its actions. */
  note?: ReactNode;
  multiline?: boolean;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  /** Names the field ("entry:field") so a click on the paper can find and focus it. */
  fieldKey?: string;
}

/** A labelled input. Its rule, error and note are tied to it for screen readers. */
export function Field({ label, rule, error, uncertain, note, multiline, rows = 3, value, onChange, className, fieldKey, ...rest }: FieldProps & Omit<ComponentProps<"input">, "value" | "onChange">) {
  // A field that something else needs to find (to put the cursor in it) can be given its own id.
  const auto = useId();
  const id = rest.id ?? auto;
  const describedBy = [rule && `${id}-rule`, error && `${id}-error`, note && `${id}-note`].filter(Boolean).join(" ") || undefined;
  // A text box grows with what is in it, so a whole bullet can be read without scrolling inside the box.
  // Browsers that can size a field to its content do it themselves (see cv.css); the rest are measured here.
  const area = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = area.current;
    if (!el || (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content"))) return;
    el.style.height = "auto";
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight + 2}px`;
  }, [value, multiline]);
  // A field never holds more than is saved. As the limit comes near, the count is shown, so text is never cut unseen.
  const limit = typeof rest.maxLength === "number" ? rest.maxLength : 0;
  const near = limit >= 40 && value.length >= Math.floor(limit * 0.9);
  const full = limit > 0 && value.length >= limit;
  const shared = { id, "data-cvf": fieldKey, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, className: clsx("cv-input", uncertain && "cv-uncertain") };
  return (
    <div className={className}>
      <div className="cv-field-header">
        <label className="cv-label" htmlFor={id}>
          {label}
        </label>
        {rule && (
          <span className="cv-rule" id={`${id}-rule`}>
            {rule}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea {...shared} ref={area} rows={rows} style={{ minHeight: `calc(${rows} * 1.4em + 16px)` }} value={value} onChange={(e) => onChange(e.target.value)} onFocus={rest.onFocus as never} onBlur={rest.onBlur as never} placeholder={rest.placeholder} maxLength={rest.maxLength} disabled={rest.disabled} />
      ) : (
        <input {...rest} {...shared} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {near && (
        <small className={full ? "cv-warn" : undefined} style={{ display: "block", marginTop: 4 }} role="status" data-testid="field-count">
          {full ? `That is the most this field holds: ${limit} characters.` : `${[...value].length} of ${limit} characters.`}
        </small>
      )}
      {error && (
        <p className="cv-error-text" id={`${id}-error`}>
          {error}
        </p>
      )}
      {note && <div id={`${id}-note`}>{note}</div>}
    </div>
  );
}

/** Screen-reader announcements for things that happen without the page changing: a save, a failed save, a finished check. */
export function Announce({ children }: { children: ReactNode }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {children}
    </span>
  );
}

export function Skeleton({ height = 18, width = "100%" }: { height?: number; width?: number | string }) {
  return <div className="cv-skeleton" style={{ height, width }} aria-hidden="true" />;
}

export interface CvSelectOption {
  value: string;
  label: string;
  badge?: string;
}

/**
 * Animated Studio dropdown with glassmorphic popover, spring chevron rotation,
 * keyboard navigation, and a synced native <select> for screen-reader & test compatibility.
 */
export function CvSelect({
  id,
  value,
  onChange,
  options,
  size = "md",
  ariaLabel,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CvSelectOption[];
  size?: "md" | "sm";
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={clsx("cv-select-wrap", size === "sm" && "cv-select-wrap-sm", className)}>
      <select
        id={id}
        aria-label={ariaLabel}
        className="sr-only"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}{o.badge ? ` (${o.badge})` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx("cv-select-trigger", size === "sm" ? "cv-mini" : "cv-input", open && "cv-select-open")}
      >
        <span className="cv-select-value">
          <span className="truncate">{selected?.label ?? value}</span>
          {selected?.badge && <span className="cv-select-badge">{selected.badge}</span>}
        </span>
        <svg className="cv-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div role="listbox" className="cv-select-popover">
          {options.map((o, idx) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                style={{ animationDelay: `${idx * 18}ms` }}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={clsx("cv-select-option", active && "cv-select-option-active")}
              >
                <span className="cv-select-opt-label">
                  <span>{o.label}</span>
                  {o.badge && <span className="cv-select-badge">{o.badge}</span>}
                </span>
                {active && (
                  <svg className="cv-select-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
