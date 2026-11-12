import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/* ------------------------------------------------------------------ Button */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";
const buttonVariants: Record<Variant, string> = {
  primary:
    "pro-btn-glow bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-white border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_16px_-2px_rgba(79,82,248,0.45)] hover:from-[#5b5efd] hover:to-[#7b6dff] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_24px_-2px_rgba(79,82,248,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  secondary:
    "bg-[#1c1d27] text-ink border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:border-white/20 hover:bg-[#252634] hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  ghost:
    "bg-transparent text-muted hover:text-white hover:bg-white/[0.06] active:scale-[0.98]",
};
const buttonSizes: Record<Size, string> = {
  sm: "h-[34px] px-3.5 rounded-[10px] text-[13px]",
  md: "h-[42px] px-5 rounded-xl text-sm",
  lg: "h-[48px] px-6 rounded-xl text-[15px]",
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
  sliders: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
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
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  edit: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  sparkle: "M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z",
  drag: "M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01",
  archive: "M21 8v13H3V8 M1 3h22v5H1z M10 12h4",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  chart: "M18 20V10 M12 20V4 M6 20v-6",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  graduationCap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  bank: "M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M8 10v11 M12 10v11 M16 10v11 M20 10v11",
  megaphone: "M3 11v2h4l5 5V4L7 9H3z M19 8a5 5 0 0 1 0 8 M16 10a2.5 2.5 0 0 1 0 4",
  moreHorizontal: "M12 12h.01 M19 12h.01 M5 12h.01",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  cloudUpload: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242 M12 12v9 M8 16l4-4 4 4",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  diamond: "M6 3h12l4 6-10 13L2 9z",
  volume: "M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07",
  volumeX: "M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6 M17 9l6 6",
  alertCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
