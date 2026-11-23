"use client";

import Link from "next/link";
import clsx from "clsx";
import { type ComponentProps, type ReactNode, useId, useLayoutEffect, useRef } from "react";

/**
 * The small pieces every CV screen is built from: the bar across the top, a
 * panel, a field with its rule and anything to check, a button. One place, so
 * the screens stay consistent and can be restyled together.
 */

/** Wraps a CV screen and cancels the app shell's own padding, so the bar can run edge to edge. */
export function CvScreen({ children }: { children: ReactNode }) {
  return <div className="cv -mx-4 -my-4 sm:-mx-6 sm:-my-6 md:-mx-9 md:-my-7 min-w-0 grow">{children}</div>;
}

export interface Crumb {
  label: string;
  href?: string;
}

/** The bar: where you are on the left, save state and actions on the right. */
export function Bar({ crumbs, children }: { crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <header className="cv-bar">
      <nav aria-label="Breadcrumb" className="cv-crumb">
        {crumbs.map((c, i) => (
          <span key={c.label + i} className="cv-row" style={{ gap: 8 }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <b aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</b>}
          </span>
        ))}
      </nav>
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
export function Note({ label, children, actions, id }: { label?: string; children: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <div className="cv-note" id={id} role="note">
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
  const id = useId();
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
  const shared = { id, "data-cvf": fieldKey, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, className: clsx("cv-input", uncertain && "cv-uncertain") };
  return (
    <div className={className}>
      <label className="cv-label" htmlFor={id}>
        {label}
      </label>
      {rule && (
        <span className="cv-rule" id={`${id}-rule`}>
          {rule}
        </span>
      )}
      {multiline ? (
        <textarea {...shared} ref={area} rows={rows} style={{ minHeight: `calc(${rows} * 1.4em + 16px)` }} value={value} onChange={(e) => onChange(e.target.value)} onFocus={rest.onFocus as never} onBlur={rest.onBlur as never} placeholder={rest.placeholder} maxLength={rest.maxLength} disabled={rest.disabled} />
      ) : (
        <input {...rest} {...shared} value={value} onChange={(e) => onChange(e.target.value)} />
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
