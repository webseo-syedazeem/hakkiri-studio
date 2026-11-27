"use client";

import { useState, useEffect } from "react";
import { applyAppearance, saveAppearance, type Appearance } from "@/lib/theme";
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
    label: "CVs and letters",
    href: "/cv",
    icon: "doc",
    match: (p) => p === "/cv" || p.startsWith("/cv/"),
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
  // The CV editor gets a compact 56 px rail (design spec v3 §02), so the page can be wider. Everywhere else is unchanged.
  const compact = /^\/cv\/v\/[^/]+\/edit(\/|$)/.test(pathname);
  const { user: authUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const displayInitials = authUser?.initials || initials || "SA";

  useEffect(() => {
    const lightActive =
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("mk") ||
        document.documentElement.dataset.theme === "light");
    setIsDark(!lightActive);
  }, []);

  useEffect(() => {
    const follow = (e: Event) => setIsDark((e as CustomEvent<Appearance>).detail === "dark");
    window.addEventListener("hk_theme_changed", follow);
    return () => window.removeEventListener("hk_theme_changed", follow);
  }, []);

  const toggleTheme = () => {
    const next: Appearance = isDark ? "light" : "dark";
    setIsDark(next === "dark");
    applyAppearance(next);
    saveAppearance(next);
  };

  const isUserAdmin = !!authUser?.isAdmin;
  const visibleItems = ITEMS.filter(
    (it) => it.href !== "/robot-test" || isUserAdmin
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
          <span className="text-[17px] font-bold tracking-tight text-ink">Hakkiri</span>
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
        <div className="print-hide fixed inset-0 top-14 z-40 flex flex-col bg-booth/98 backdrop-blur-xl p-5 md:hidden animate-fade-in overflow-y-auto">
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
                      ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.06] font-semibold dark:bg-[#1c2237] dark:text-white dark:border-[#374268]"
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

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Change theme"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-muted hover:bg-panel-2 hover:text-ink transition-all mt-2 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
                </svg>
                <span>Appearance</span>
              </div>
              <span className="text-xs uppercase font-semibold text-muted px-2 py-0.5 rounded bg-panel-2 border border-line">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>

            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-muted hover:bg-panel-2 hover:text-ink transition-all"
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
      <div className={clsx("hidden md:block print:hidden shrink-0", compact ? "w-[56px]" : "w-[216px]")} aria-hidden="true" />

      {/* Desktop Navigation Sidebar (>= md) */}
      <nav
        aria-label="Main"
        data-compact={compact || undefined}
        className={clsx("print-hide fixed top-0 bottom-0 left-0 z-30 hidden md:flex h-screen shrink-0 flex-col border-r border-line bg-booth py-5 overflow-y-auto overflow-x-hidden [scrollbar-width:none] transition-colors duration-250", compact ? "w-[56px] px-2" : "w-[216px] px-3")}
      >
        {/* Brand Header */}
        <Link
          href="/"
          aria-label="Hakkiri Studio home"
          title={compact ? "Hakkiri home" : undefined}
          className={clsx("mb-6 flex items-center gap-3 text-ink hover:opacity-90 transition-opacity", compact ? "justify-center px-0" : "px-2")}
        >
          <Mark size={28} badge />
          <span className={compact ? "sr-only" : "text-[18px] font-bold tracking-tight text-ink"}>Hakkiri</span>
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
                title={compact ? it.label : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-all duration-200",
                  compact ? "justify-center px-0 min-h-[40px]" : "px-3",
                  on
                    ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.06] font-semibold dark:bg-[#1c2237] dark:text-white dark:border-[#374268]"
                    : "text-muted hover:bg-panel-2 hover:text-ink"
                )}
              >
                <Icon
                  name={it.icon}
                  size={18}
                  className={clsx("shrink-0 transition-colors", on ? "text-blue-soft" : "text-muted")}
                />
                <span className={compact ? "sr-only" : "truncate"}>{it.label}</span>
                {on && !compact && <span className="ml-auto h-4 w-[3px] shrink-0 rounded-full bg-blue-fill" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>

        <div className="grow" />
        {beta && !compact && <FeedbackButton />}

        {/* Bottom Appearance Toggle, Profile and Settings */}
        <div className={clsx("mt-4 flex flex-col gap-2.5 border-t border-line/80 pt-4", compact ? "items-center px-0" : "px-2")}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Change theme"
            title={isDark ? "Switch to Apple light theme" : "Switch to dark theme"}
            className={clsx("group flex w-full items-center rounded-xl py-2 text-[13px] font-medium text-ink hover:bg-panel-2 transition-all cursor-pointer", compact ? "justify-center px-0" : "justify-between px-2.5")}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={clsx("shrink-0 transition-transform duration-300 group-hover:rotate-45", isDark ? "text-amber-400" : "text-blue-600")}
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
              </svg>
              <span className={compact ? "sr-only" : "font-medium whitespace-nowrap text-ink"}>Appearance</span>
            </div>
            <span className={compact ? "sr-only" : "shrink-0 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-panel-2 text-ink border border-line"}>
              {isDark ? "Dark" : "Light"}
            </span>
          </button>

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
                {isUserAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-purple-400 hover:bg-panel-2 hover:text-purple-300 transition-colors"
                  >
                    <Icon name="sliders" size={15} />
                    Admin Console
                  </Link>
                )}
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
