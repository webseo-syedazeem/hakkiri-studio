"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";
import { Icon, type IconName } from "@/components/ui";
import { FeedbackButton } from "./FeedbackButton";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminEmail } from "@/lib/auth/admins";

const ITEMS: {
  label: string;
  href: string;
  icon: IconName;
  match: (p: string) => boolean;
}[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: "home",
    match: (p) => p === "/dashboard" || p === "/" || p.startsWith("/welcome"),
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: "cal",
    match: (p) => p.startsWith("/interviews") || p.startsWith("/mock"),
  },
  {
    label: "Practice Hub",
    href: "/practice",
    icon: "chart",
    match: (p) => p.startsWith("/practice") || p.startsWith("/rehearse"),
  },
  {
    label: "Presentations",
    href: "/presentations",
    icon: "present",
    match: (p) => p.startsWith("/presentations") || p.startsWith("/qa"),
  },
  {
    label: "Experience Library",
    href: "/interview-examples",
    icon: "layers",
    match: (p) => p.startsWith("/interview-examples"),
  },
  {
    label: "Robot Tester",
    href: "/robot-test",
    icon: "sparkle",
    match: (p) => p.startsWith("/robot-test"),
  },
  {
    label: "Blog Manager",
    href: "/admin/blog",
    icon: "doc",
    match: (p) => p.startsWith("/admin/blog"),
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
  initials?: string;
  beta?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const { user: authUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayInitials = authUser?.initials || initials || "SA";

  const visibleItems = ITEMS.filter(
    (it) => it.href !== "/robot-test" || isAdminEmail(authUser?.email)
  );

  return (
    <>
      {/* Mobile Top Bar (< md) */}
      <header className="print-hide sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-line bg-booth/95 px-4 backdrop-blur-md md:hidden">
        <Link
          href="/"
          aria-label="Hakkiri Studio home"
          className="flex items-center gap-2.5 text-ink hover:opacity-90 transition-opacity"
        >
          <Mark size={24} badge />
          <span className="text-[17px] font-bold tracking-tight text-white">Hakkiri</span>
        </Link>

        <div className="flex items-center gap-2">
          {beta && (
            <div className="scale-90 origin-right">
              <FeedbackButton />
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel-2 border border-line text-ink hover:bg-panel transition-colors cursor-pointer"
          >
            <Icon name={mobileOpen ? "x" : "menu"} size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay (< md) */}
      {mobileOpen && (
        <div className="print-hide fixed inset-0 top-14 z-40 flex flex-col bg-booth/98 backdrop-blur-xl p-5 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1.5 grow">
            {visibleItems.map((it) => {
              const on = it.match(pathname);
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200",
                    on
                      ? "bg-[#1c2237] text-white shadow-[inset_0_0_0_1px_#374268]"
                      : "text-muted hover:bg-panel-2 hover:text-ink"
                  )}
                >
                  <Icon
                    name={it.icon}
                    size={20}
                    className={clsx("shrink-0", on ? "text-blue-soft" : "text-muted")}
                  />
                  <span>{it.label}</span>
                </Link>
              );
            })}

            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-muted hover:bg-panel-2 hover:text-ink transition-all mt-2"
            >
              <Icon name="gear" size={20} className="text-muted" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="border-t border-line/80 pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                  {displayInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{authUser?.firstName || "Studio Account"}</p>
                  <p className="text-[11px] text-muted truncate">{authUser?.email}</p>
                </div>
              </div>
              {authUser && (
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); void logout(); }}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-soft hover:bg-red/10 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop spacer to preserve layout flow alongside fixed sidebar */}
      <div className="hidden md:block print:hidden w-[200px] shrink-0" aria-hidden="true" />

      {/* Desktop Navigation Sidebar (>= md) */}
      <nav
        aria-label="Main"
        className="print-hide fixed top-0 bottom-0 left-0 z-30 hidden md:flex h-screen w-[200px] shrink-0 flex-col border-r border-line bg-booth py-5 px-3 overflow-y-auto overflow-x-hidden [scrollbar-width:none]"
      >
        {/* Brand Header */}
        <Link
          href="/"
          aria-label="Hakkiri Studio home"
          className="mb-6 flex items-center gap-3 px-2 text-ink hover:opacity-90 transition-opacity"
        >
          <Mark size={28} badge />
          <span className="text-[18px] font-bold tracking-tight text-white">Hakkiri</span>
        </Link>

        {/* Navigation Items with labels matching mockup */}
        <div className="flex flex-col gap-1">
          {visibleItems.map((it) => {
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
              <div className="absolute bottom-11 left-0 z-50 mb-1 w-44 rounded-xl border border-line bg-panel p-2 shadow-2xl backdrop-blur-md">
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
    </>
  );
}
