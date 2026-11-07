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
    icon: "cal",
    match: (p) => p.startsWith("/interviews") || p.startsWith("/mock"),
  },
  {
    label: "Presentations",
    href: "/presentations",
    icon: "present",
    match: (p) => p.startsWith("/presentations"),
  },
  {
    label: "Practice",
    href: "/interviews/halden",
    icon: "zap",
    match: (p) => p.startsWith("/mock") || p.startsWith("/rehearse"),
  },
  {
    label: "Progress",
    href: "/story-bank",
    icon: "chart",
    match: (p) => p.startsWith("/story-bank"),
  },
  {
    label: "Profile",
    href: "/settings",
    icon: "user",
    match: (p) => p.startsWith("/settings"),
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
  const displayInitials = authUser?.initials || initials || "SA";

  return (
    <nav
      aria-label="Main"
      className="print-hide sticky top-0 flex h-screen w-[200px] shrink-0 flex-col border-r border-line py-5 px-3"
    >
      {/* Brand Header */}
      <Link
        href="/"
        aria-label="Hakkiri Studio home"
        className="mb-6 flex items-center gap-3 px-2 text-ink hover:opacity-90 transition-opacity"
      >
        <Mark size={28} />
        <span className="text-[18px] font-bold tracking-tight text-white">Hakkiri</span>
      </Link>

      {/* Navigation Items with labels matching mockup */}
      <div className="flex flex-col gap-1">
        {ITEMS.map((it) => {
          const on = it.match(pathname);
          return (
            <Link
              key={it.label}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                on
                  ? "bg-[#1c2237] text-white shadow-[inset_0_0_0_1px_#374268]"
                  : "text-muted hover:bg-panel-2 hover:text-ink"
              )}
            >
              <Icon
                name={it.icon}
                size={18}
                className={clsx("shrink-0 transition-colors", on ? "text-blue-soft" : "text-muted")}
              />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grow" />
      {beta && <FeedbackButton />}

      {/* Bottom Profile and Settings */}
      <div className="mt-4 flex flex-col gap-3 border-t border-line/80 pt-4 px-2">
        <Link
          href="/settings"
          aria-label="Settings"
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-panel-2 hover:text-ink transition-colors"
        >
          <Icon name="gear" size={19} />
        </Link>

        <div className="relative">
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
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-panel-2 text-xs font-semibold text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-blue-soft)] transition-all"
            >
              {displayInitials}
            </Link>
          )}

          {showMenu && authUser && (
            <div className="absolute bottom-10 left-0 z-50 mb-1 w-48 rounded-xl border border-line bg-panel p-2 shadow-2xl backdrop-blur-md">
              <div className="px-2.5 py-1.5 border-b border-line/60">
                <p className="text-[13px] font-medium text-ink truncate">{authUser.firstName || "Sazia Aktar"}</p>
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
              <Link
                href="/landing"
                target="_blank"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted hover:bg-panel-2 hover:text-ink transition-colors"
              >
                <Icon name="globe" size={15} />
                Preview Homepage
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
      </div>
    </nav>
  );
}
