import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/* ------------------------------------------------------------------ Button */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold transition-all duration-200 active:scale-[0.98] select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50";
const buttonVariants: Record<Variant, string> = {
  primary: "bg-blue-fill text-white hover:bg-blue-hover",
  secondary: "bg-panel-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2a2b35]",
  ghost: "bg-transparent text-muted hover:text-ink",
};
const buttonSizes: Record<Size, string> = {
  sm: "h-[34px] px-3 text-[13px]",
  md: "h-[42px] px-[18px] text-sm",
  lg: "h-[46px] px-6 text-sm",
};

export function buttonClass(variant: Variant = "secondary", size: Size = "md", extra?: string) {
  return clsx(buttonBase, buttonVariants[variant], buttonSizes[size], extra);
}

export function Button({ variant = "secondary", size = "md", className, type = "button", ...rest }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({ variant = "secondary", size = "md", className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

/* ------------------------------------------------------------------- Panel */

export function Panel({ className, children, ...rest }: ComponentProps<"section">) {
  return (
    <section className={clsx("rounded-[14px] bg-panel shadow-[inset_0_0_0_1px_var(--color-line)]", className)} {...rest}>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------- Chip */

export function Chip({ tone = "neutral", className, children }: { tone?: "neutral" | "red" | "blue"; className?: string; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 text-xs font-semibold",
        tone === "neutral" && "bg-panel-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
        tone === "red" && "bg-red/15 text-red-soft",
        tone === "blue" && "bg-blue/15 text-lilac",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Crumbs */

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-[13px] text-muted">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-2.5">
          {i > 0 && <span className="text-dim">/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ---------------------------------------------------------------- Divider */

export function Sep() {
  return (
    <span aria-hidden className="mx-2.5 text-dim">
      |
    </span>
  );
}

/* ------------------------------------------------------------------- Meter */

export type MeterTone = "ready" | "getting-there" | "not-ready";

const meterColour: Record<MeterTone, string> = {
  ready: "bg-blue",
  "getting-there": "bg-lilac",
  "not-ready": "bg-red",
};
export const toneText: Record<MeterTone, string> = {
  ready: "text-blue-soft",
  "getting-there": "text-ink",
  "not-ready": "text-red-soft",
};

/** A segmented level meter, like a studio desk. */
export function Meter({ value, max = 5, segments = 20, tone, height = 16, label }: { value: number; max?: number; segments?: number; tone: MeterTone; height?: number; label?: string }) {
  const lit = Math.round((value / max) * segments);
  return (
    <div role="img" aria-label={label ?? `${value} out of ${max}`} className="flex gap-[3px]">
      {Array.from({ length: segments }, (_, k) => (
        <span key={k} className={clsx("flex-1 rounded-[2px]", k < lit ? meterColour[tone] : "bg-white/[0.07]")} style={{ height }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- Pin */

export function Pin({ n, tone }: { n: number; tone: "fix" | "strength" }) {
  return (
    <span
      aria-label={`Note ${n}`}
      className={clsx(
        "mx-1 inline-flex h-[18px] w-[18px] -translate-y-0.5 items-center justify-center rounded-full align-middle text-[11px] font-bold text-white",
        tone === "fix" ? "bg-red" : "bg-blue-fill",
      )}
    >
      {n}
    </span>
  );
}

/* --------------------------------------------------------------- Icons */

const paths = {
  home: "M4 11l8-7 8 7v9H4z M10 20v-5h4v5",
  brief: "M3 7h18v13H3z M8 7V5h8v2",
  present: "M3 4h18v12H3z M12 16v4 M8 20h8",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 5v16",
  gear: "M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1",
  plus: "M12 5v14 M5 12h14",
  mic: "M9 3h6v11H9z M5 11a7 7 0 0 0 14 0 M12 18v3",
  play: "M8 5.5v13l11-6.5z",
  pause: "M9 5v14 M15 5v14",
  repeat: "M4 12a8 8 0 1 0 2.5-5.8 M4 4v5h5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  doc: "M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  globe: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18 M12 3c3 3.5 3 14.5 0 18 M12 3c-3 3.5-3 14.5 0 18",
  cal: "M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4",
  flag: "M5 21V4 M5 4h11l-2 4 2 4H5",
  lock: "M5 11h14v9H5z M8 11V8a4 4 0 0 1 8 0v3",
  back: "M15 5l-7 7 7 7",
  speaker: "M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6",
  x: "M6 6l12 12 M18 6L6 18",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  sparkles: "M12 3l1.9 4.8L19 9.5l-4 3.7 1.2 5.3-4.2-2.7-4.2 2.7 1.2-5.3-4-3.7 5.1-1.7L12 3z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
