"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Icon, type IconName } from "@/components/ui";
import { FeedbackButton } from "./FeedbackButton";
import { useAuth } from "@/lib/auth/AuthContext";

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
  const { user: authUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const displayInitials = authUser?.initials || initials || "ME";
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
      <div className="relative mt-2">
        {authUser ? (
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label={`${displayInitials}, your account`}
            title={authUser.email || "Your account"}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-panel-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-blue-soft)] transition-all cursor-pointer"
          >
            {displayInitials}
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="Sign in"
            title="Sign in to Hakkiri Studio"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-panel-2 text-[10px] font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-blue-soft)] transition-all"
          >
            {displayInitials}
          </Link>
        )}

        {showMenu && authUser && (
          <div className="absolute bottom-0 left-[48px] z-50 mb-0 w-48 rounded-xl border border-line bg-panel p-2 shadow-2xl backdrop-blur-md">
            <div className="px-2.5 py-1.5 border-b border-line/60">
              <p className="text-[13px] font-medium text-ink truncate">{authUser.firstName || "Studio User"}</p>
              <p className="text-[11px] text-muted truncate">{authUser.email}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setShowMenu(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted hover:bg-panel-2 hover:text-ink transition-colors"
            >
              <Icon name="gear" size={15} />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => { setShowMenu(false); void logout(); }}
              className="w-full mt-0.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-red-soft hover:bg-red/10 transition-colors text-left cursor-pointer"
            >
              <Icon name="x" size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
