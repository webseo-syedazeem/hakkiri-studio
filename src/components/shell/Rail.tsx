"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Icon, type IconName } from "@/components/ui";
import { FeedbackButton } from "./FeedbackButton";

const ITEMS: {
  label: string;
  href: string;
  icon: IconName;
  match: (p: string) => boolean;
}[] = [
  {
    label: "Home",
    href: "/studio",
    icon: "home",
    match: (p) => p === "/studio" || p.startsWith("/welcome"),
  },
  {
    label: "Communication Gym",
    href: "/gym",
    icon: "zap",
    match: (p) => p.startsWith("/gym"),
  },
  {
    label: "Speech Analytics",
    href: "/analytics",
    icon: "barChart",
    match: (p) => p.startsWith("/analytics"),
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: "brief",
    match: (p) => p.startsWith("/interviews") || p.startsWith("/mock"),
  },
  {
    label: "Presentations",
    href: "/presentations",
    icon: "present",
    match: (p) => p.startsWith("/presentations"),
  },
  {
    label: "Story bank",
    href: "/story-bank",
    icon: "book",
    match: (p) => p.startsWith("/story-bank"),
  },
  {
    label: "Diagnostic Assessment",
    href: "/assessment",
    icon: "target",
    match: (p) => p.startsWith("/assessment"),
  },
];

export function Rail({
  initials,
  beta = false,
}: {
  initials: string;
  beta?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Main"
      className="print-hide sticky top-0 flex h-screen w-[72px] shrink-0 flex-col items-center gap-2 border-r border-white/[0.08] bg-[#14151c]/95 py-5 backdrop-blur-md z-40"
    >
      <Link
        href="/studio"
        aria-label="Hakkiri Studio home"
        className="mb-3 transition-transform hover:scale-105"
      >
        <Mark size={32} />
      </Link>

      <div className="flex w-full flex-col items-center gap-1.5 px-2">
        {ITEMS.map((it) => {
          const on = it.match(pathname);
          return (
            <Link
              key={it.label}
              href={it.href}
              aria-label={it.label}
              title={it.label}
              aria-current={on ? "page" : undefined}
              className={clsx(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                on
                  ? "bg-blue/15 text-blue-soft shadow-[inset_0_0_0_1px_rgba(123,136,255,0.3)]"
                  : "text-muted hover:bg-panel-2 hover:text-ink",
              )}
            >
              {on && (
                <span className="absolute -left-2 h-5 w-1 rounded-r-full bg-blue shadow-[0_0_10px_var(--color-blue)] transition-all" />
              )}
              <Icon name={it.icon} size={20} className="transition-transform group-hover:scale-110" />
            </Link>
          );
        })}
      </div>

      <div className="grow" />

      {/* Mic Check Shortcut */}
      <Link
        href="/mic-check"
        aria-label="Microphone Calibration"
        title="Check Microphone Calibration"
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-panel-2 hover:text-ink transition-colors"
      >
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#14151c]" />
        <Icon name="mic" size={18} />
      </Link>

      {beta && <FeedbackButton />}

      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings & Audio Configuration"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-panel-2 hover:text-ink transition-colors"
      >
        <Icon name="gear" size={19} />
      </Link>

      <Link
        href="/settings"
        aria-label={`${initials}, your account`}
        title="Your account"
        className="mt-1 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-gradient-to-tr from-panel-2 to-[#2f313d] text-xs font-bold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-blue-soft)] transition-all"
      >
        {initials}
      </Link>
    </nav>
  );
}
