"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  IconChevronDown,
  IconChevronRight,
  IconMessageSquare,
  IconUserCheck,
  IconTarget,
  IconGraduationCap,
} from "@/components/interview-questions/Icons";

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
    [`${base}#how`, "How it works", false],
    ["/blog", "Blog", path.startsWith("/blog")],
    ["/about", "About", path === "/about"],
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
    <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2 text-[13px]">
      {/* Primary Navigation Links */}
      {interviewLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3.5 py-1.5 transition-all duration-200 md:inline-flex items-center font-medium text-[13px] whitespace-nowrap leading-none",
            current
              ? "text-slate-900 font-semibold bg-black/[0.06] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]"
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
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200 font-medium text-[13px] cursor-pointer whitespace-nowrap leading-none",
            isQuestionsActive
              ? "text-slate-900 font-semibold bg-black/[0.06] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]"
          )}
          aria-expanded={questionsMenuOpen}
        >
          <span>Interview Questions</span>
          <IconChevronDown className={clsx("h-3.5 w-3.5 text-slate-400 transition-transform duration-200", questionsMenuOpen && "rotate-180 text-slate-700")} />
        </button>

        {questionsMenuOpen && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-[100] w-84 sm:w-92 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)] animate-dropdown">
            {/* Header Badge */}
            <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interview Guides</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                Free & Verified
              </span>
            </div>

            <Link
              href="/interview-questions"
              onClick={() => setQuestionsMenuOpen(false)}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <IconMessageSquare className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    20 Most Common Questions
                  </span>
                  <IconChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-600" />
                </div>
                <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                  Top questions, sample answers & scoring rubrics
                </span>
              </div>
            </Link>

            <Link
              href="/interview-questions/tell-me-about-yourself"
              onClick={() => setQuestionsMenuOpen(false)}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <IconUserCheck className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Tell Me About Yourself Guide
                  </span>
                  <IconChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-600" />
                </div>
                <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                  The proven 60-second formula & 9 role scripts
                </span>
              </div>
            </Link>

            <Link
              href="/interview-questions/why-should-we-hire-you"
              onClick={() => setQuestionsMenuOpen(false)}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <IconTarget className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Why Should We Hire You? Guide
                  </span>
                  <IconChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-emerald-600" />
                </div>
                <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                  3-sentence value formula & 20+ best answers
                </span>
              </div>
            </Link>

            <Link
              href="/interview-questions/tell-me-about-yourself-internship"
              onClick={() => setQuestionsMenuOpen(false)}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <IconGraduationCap className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                    Internship Interview Guide
                  </span>
                  <IconChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-purple-600" />
                </div>
                <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                  Formula for zero experience & 7 field examples
                </span>
              </div>
            </Link>

            {/* Footer Prompt */}
            <div className="mt-1.5 pt-2 border-t border-slate-100 px-2.5 py-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Practise aloud with live AI:</span>
              <Link
                href="/dashboard"
                onClick={() => setQuestionsMenuOpen(false)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Open Studio</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {secondaryLinks.map(([href, label, current]) => (
        <Link
          key={label}
          href={href}
          aria-current={current ? "page" : undefined}
          className={clsx(
            "hidden rounded-full px-3.5 py-1.5 transition-all duration-200 md:inline-flex items-center font-medium text-[13px] whitespace-nowrap leading-none",
            current
              ? "text-slate-900 font-semibold bg-black/[0.06] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
              : "text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]"
          )}
        >
          {label}
        </Link>
      ))}

      {/* Admin Quick Portal Badge */}
      {isUserAdmin && (
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100/80 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse"></span>
          <span>Admin</span>
        </Link>
      )}

      {/* Auth / Studio CTAs */}
      {user ? (
        <div className="relative flex items-center gap-2.5 pl-2 shrink-0" ref={menuRef}>
          {/* Main Open Studio CTA Button */}
          <Link
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap inline-flex items-center justify-center shrink-0"
          >
            Open Studio
          </Link>

          {/* User Profile Avatar Pill & Dropdown */}
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-[11px] font-bold tracking-tight text-white shadow-sm ring-1 ring-black/10 hover:ring-2 hover:ring-blue-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none shrink-0"
            title={`${user.firstName || "User"} (${user.email || ""})`}
          >
            {user.initials || "U"}
          </button>

          {/* Polished Glass Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)] animate-dropdown">
              <div className="border-b border-slate-100 px-3 py-2.5 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                  {user.initials || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Authenticated User"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-blue-600 font-bold">●</span>
                  Studio Dashboard
                </Link>

                <Link
                  href="/interviews"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-violet-600 font-bold">🎙️</span>
                  Mock Interviews
                </Link>

                <Link
                  href="/presentations"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-indigo-600 font-bold">📊</span>
                  Presentations
                </Link>

                {isUserAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50/70 hover:bg-purple-100/80 transition-colors"
                  >
                    <span className="text-purple-600 font-bold">⚙️</span>
                    Admin Console
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-slate-400 font-bold">⚙️</span>
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
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
