"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminEmail } from "@/lib/auth/admins";

/** The public site's top links matching the modern executive navigation. */
export function SiteNav() {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPresent = path === "/present";

  // Core navigation links
  const primaryLinks: [string, string, boolean][] = [
    ["/", "Interviews", path === "/" || path === "/landing"],
    ["/present", "Presentations", isPresent],
    ["/cv-audit", "Free CV Audit", path.startsWith("/cv-audit")],
    ["/about", "About", path === "/about"],
    ["/blog", "Blog", path.startsWith("/blog")],
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
    <nav aria-label="Main" className="flex items-center gap-1.5 text-[13px] sm:gap-2.5">
      {/* Primary Navigation Links */}
      {primaryLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3.5 py-1.5 transition-all duration-200 md:inline font-medium",
            current
              ? "text-mk-ink font-semibold bg-black/[0.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]"
          )}
        >
          {label}
        </Link>
      ))}

      {/* Auth / Studio CTAs */}
      {user ? (
        <div className="relative flex items-center gap-2 pl-1" ref={menuRef}>
          {/* Main Open Studio CTA Button */}
          <Link
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Open Studio
          </Link>

          {/* User Profile Avatar Pill & Dropdown */}
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-[11px] font-bold tracking-tight text-white shadow-md ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-blue-600 font-bold">●</span>
                  Studio Dashboard
                </Link>

                <Link
                  href="/apply/cvs"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-emerald-600 font-bold">📄</span>
                  CV Builder
                </Link>

                <Link
                  href="/interviews"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-violet-600 font-bold">🎙️</span>
                  Mock Interviews
                </Link>

                {isUserAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50/60 hover:bg-purple-100 transition-colors"
                  >
                    <span className="text-purple-600 font-bold">⚙️</span>
                    Admin Console
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            className="hidden rounded-full px-3.5 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] sm:inline font-medium"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="ml-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta"
          >
            Sign up free
          </Link>
        </>
      )}
    </nav>
  );
}
