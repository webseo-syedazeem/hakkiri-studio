"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { IconChevronDown } from "@/components/interview-questions/Icons";

/** The public site's top links matching the modern executive navigation. */
export function SiteNav() {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [questionsMenuOpen, setQuestionsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);

  const isPresent = path === "/present";
  const base = isPresent ? "/present" : "";

  // Core navigation links matching the executive navigation
  const interviewLinks: [string, string, boolean][] = [
    ["/", "Interviews", path === "/" || path === "/landing"],
    ["/present", "Presentations", isPresent],
  ];

  const secondaryLinks: [string, string, boolean][] = [
    ["/about", "About", path === "/about"],
    ["/blog", "Blog", path.startsWith("/blog")],
    [`${base}#how`, "How it works", false],
    [`${base}#beta`, "Beta", false],
    [`${base}#faq`, "Questions", false],
  ];

  const isUserAdmin = !!user?.isAdmin;
  const isQuestionsActive = path.startsWith("/interview-questions");

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (questionsRef.current && !questionsRef.current.contains(e.target as Node)) {
        setQuestionsMenuOpen(false);
      }
    }
    if (userMenuOpen || questionsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, questionsMenuOpen]);

  return (
    <nav aria-label="Main" className="flex items-center gap-1.5 text-[13px] sm:gap-2.5">
      {/* Primary Navigation Links */}
      {interviewLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3 py-1.5 transition-all duration-200 md:inline font-medium text-[13px]",
            current
              ? "text-mk-ink font-semibold bg-black/[0.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]"
          )}
        >
          {label}
        </Link>
      ))}

      {/* Interview Questions Dropdown */}
      <div
        className="relative hidden md:inline-block"
        ref={questionsRef}
        onMouseEnter={() => setQuestionsMenuOpen(true)}
        onMouseLeave={() => setQuestionsMenuOpen(false)}
      >
        <button
          type="button"
          onClick={() => setQuestionsMenuOpen((prev) => !prev)}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 font-medium text-[13px] cursor-pointer",
            isQuestionsActive
              ? "text-mk-ink font-semibold bg-black/[0.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]"
          )}
          aria-expanded={questionsMenuOpen}
        >
          <span>Interview Questions</span>
          <IconChevronDown className={clsx("h-3 w-3 text-slate-400 transition-transform duration-200", questionsMenuOpen && "rotate-180")} />
        </button>

        {questionsMenuOpen && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl animate-dropdown">
            <Link
              href="/interview-questions"
              onClick={() => setQuestionsMenuOpen(false)}
              className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors hover:bg-slate-100/80"
            >
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">●</span>
                20 Most Common Questions
              </span>
              <span className="text-[11px] text-slate-500 pl-3.5">
                The 20 most asked questions and sample answers
              </span>
            </Link>

            <Link
              href="/interview-questions/tell-me-about-yourself"
              onClick={() => setQuestionsMenuOpen(false)}
              className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors hover:bg-slate-100/80"
            >
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                Tell Me About Yourself Guide
              </span>
              <span className="text-[11px] text-slate-500 pl-3.5">
                The 60-second formula & 9 role sample answers
              </span>
            </Link>

            <Link
              href="/interview-questions/why-should-we-hire-you"
              onClick={() => setQuestionsMenuOpen(false)}
              className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors hover:bg-slate-100/80"
            >
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">●</span>
                Why Should We Hire You? Guide
              </span>
              <span className="text-[11px] text-slate-500 pl-3.5">
                3-sentence formula & 20+ sample answers
              </span>
            </Link>
          </div>
        )}
      </div>

      {secondaryLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3 py-1.5 transition-all duration-200 md:inline font-medium text-[13px]",
            current
              ? "text-mk-ink font-semibold bg-black/[0.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-mk-ink/70 hover:text-mk-ink hover:bg-black/[0.03]"
          )}
        >
          {label}
        </Link>
      ))}

      {/* Admin Quick Portal Badge (matching Screenshot 9) */}
      {isUserAdmin && (
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-500/20 transition-all hover:scale-[1.03] whitespace-nowrap shrink-0"
        >
          <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></span>
          <span>Admin</span>
        </Link>
      )}

      {/* Auth / Studio CTAs */}
      {user ? (
        <div className="relative flex items-center gap-2 pl-1 shrink-0" ref={menuRef}>
          {/* Main Open Studio CTA Button */}
          <Link
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap inline-flex items-center justify-center shrink-0"
          >
            Open Studio
          </Link>

          {/* User Profile Avatar Pill & Dropdown */}
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-[11px] font-bold tracking-tight text-white shadow-md ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none shrink-0"
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
                  href="/interviews"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-violet-600 font-bold">🎙️</span>
                  Mock Interviews
                </Link>

                <Link
                  href="/presentations"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-black/[0.04] hover:text-slate-900 transition-colors"
                >
                  <span className="text-indigo-600 font-bold">📊</span>
                  Presentations
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
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-1.5 text-mk-ink/70 transition-all duration-150 hover:text-mk-ink hover:bg-black/[0.03] sm:inline font-medium whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="ml-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta whitespace-nowrap inline-flex items-center justify-center shrink-0"
          >
            Sign up free
          </Link>
        </div>
      )}
    </nav>
  );
}
