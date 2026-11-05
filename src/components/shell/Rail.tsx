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
    href: "/",
    icon: "home",
    match: (p) => p === "/" || p.startsWith("/welcome"),
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
      className="print-hide sticky top-0 flex h-screen w-[68px] shrink-0 flex-col items-center gap-1.5 border-r border-line py-5"
    >
      <Link
        href="/"
        aria-label="Hakkiri Studio home"
        className="mb-[18px] text-ink"
      >
        <Mark size={30} />
      </Link>
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
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-panel-2",
              on
                ? "bg-panel-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
                : "text-muted",
            )}
          >
            <Icon name={it.icon} size={20} />
          </Link>
        );
      })}
      <div className="grow" />
      {beta && <FeedbackButton />}
      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-panel-2"
      >
        <Icon name="gear" size={20} />
      </Link>
      <Link
        href="/settings"
        aria-label={`${initials}, your account`}
        title="Your account"
        className="mt-2 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-panel-2 text-xs font-semibold shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-blue-soft)]"
      >
        {initials}
      </Link>
    </nav>
  );
}
