"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminEmail } from "@/lib/auth/admins";

/** The public site's top links matching the beta landing navigation. */
export function SiteNav() {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPresent = path === "/present";
  const anchorBase = isPresent ? "/present" : "/";

  // Core navigation links
  const primaryLinks: [string, string, boolean][] = [
    ["/", "Interviews", path === "/" || path === "/landing"],
    ["/present", "Presentations", isPresent],
    ["/cv-audit", "Free CV Audit", path.startsWith("/cv-audit")],
    ["/about", "About", path === "/about"],
    ["/blog", "Blog", path.startsWith("/blog")],
  ];

  // Secondary anchor links (visible on wider screens)
  const secondaryLinks: [string, string][] = [
    [`${anchorBase}#how`, "How it works"],
    [`${anchorBase}#beta`, "Beta"],
    [`${anchorBase}#faq`, "Questions"],
  ];

  const isUserAdmin = isAdminEmail(user?.email);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav aria-label="Main" className="flex items-center gap-1 text-[13px] sm:gap-2">
      {/* Primary Navigation Links */}
      {primaryLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3 py-1.5 transition-all duration-150 md:inline",
            current
              ? "text-mk-ink font-semibold bg-black/[0.04]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]"
          )}
        >
          {label}
        </Link>
      ))}

      {/* Secondary Anchor Links (desktop only) */}
      {secondaryLinks.map(([href, label]) => (
        <Link
          key={label}
          href={href}
          className="hidden rounded-full px-3 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] lg:inline"
        >
          {label}
        </Link>
      ))}

      {/* Admin Quick Link (Subtle, sleek, non-intrusive) */}
      {isUserAdmin && (
        <Link
          href="/admin"
          className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/70 px-3 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 hover:text-purple-800 transition-all"
          title="Hakkiri Admin Console"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
          Admin
        </Link>
      )}

      {/* Auth / Studio CTAs */}
      {user ? (
        <div className="relative flex items-center gap-2" ref={menuRef}>
          {/* Main Open Studio CTA Button (clean label without initials in parentheses) */}
          <Link
            href="/dashboard"
            className="rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:bg-mk-cta-hover hover:shadow-md hover:shadow-mk-cta/25"
          >
            Open Studio
          </Link>

          {/* User Profile Avatar Pill & Dropdown */}
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white shadow-sm ring-1 ring-slate-950/10 hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer select-none"
            title={`${user.firstName || "User"} (${user.email || ""})`}
          >
            {user.initials || "U"}
          </button>

          {/* Polished Glass Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl animate-dropdown">
              <div className="border-b border-black/[0.06] px-3 py-2">
                <p className="truncate text-xs font-bold text-slate-900">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Authenticated User"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-blue-600 font-bold">●</span>
                  Studio Dashboard
                </Link>

                <Link
                  href="/apply/cvs"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-emerald-600 font-bold">📄</span>
                  CV Builder
                </Link>

                <Link
                  href="/interviews"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-violet-600 font-bold">🎙️</span>
                  Mock Interviews
                </Link>

                {isUserAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-purple-600 font-bold">⚙️</span>
                    Admin Console
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-slate-500 font-bold">⚙️</span>
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-black/[0.06] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    void logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <span>🚪</span>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="ml-1 rounded-full bg-mk-cta px-4 py-1.5 font-medium text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:bg-mk-cta-hover hover:shadow-md hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
          >
            Sign up free
          </Link>
        </>
      )}
    </nav>
  );
}
