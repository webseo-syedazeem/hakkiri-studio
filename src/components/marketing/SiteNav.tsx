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
  IconSparkles,
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
  const isQuestionsActive =
    path.startsWith("/interview-questions") ||
    path.startsWith("/blog/strengths-and-weaknesses");

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
    <nav aria-label="Main" className="flex items-center gap-3 text-[13px]">
      {/* Central Segmented Navigation Capsule (Mac / Linear Style) */}
      <div className="hidden md:flex items-center gap-0.5 rounded-full bg-slate-100/80 p-1 border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm">
        {interviewLinks.map(([href, label, current]) => (
          <Link
            key={label}
            href={href}
            aria-current={current ? "page" : undefined}
            className={clsx(
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap leading-none transition-all duration-200 select-none",
              current
                ? "bg-white text-slate-950 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-slate-600 font-medium hover:text-slate-950 hover:bg-white/70 hover:shadow-sm"
            )}
          >
            {label}
          </Link>
        ))}

        {/* Interview Questions Dropdown inside Dock */}
        <div
          className="relative inline-block"
          ref={questionsRef}
          onMouseEnter={() => setQuestionsMenuOpen(true)}
          onMouseLeave={() => setQuestionsMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setQuestionsMenuOpen((prev) => !prev)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] cursor-pointer whitespace-nowrap leading-none select-none transition-all duration-200",
              isQuestionsActive || questionsMenuOpen
                ? "bg-white text-blue-600 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-slate-600 font-medium hover:text-slate-950 hover:bg-white/70 hover:shadow-sm"
            )}
            aria-expanded={questionsMenuOpen}
          >
            <span>Interview Questions</span>
            <IconChevronDown
              className={clsx(
                "h-3.5 w-3.5 transition-transform duration-200",
                questionsMenuOpen ? "rotate-180 text-blue-600" : "text-slate-400"
              )}
            />
          </button>

          {/* Solid Opaque Executive Dropdown */}
          {questionsMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] z-[100] w-[390px] rounded-3xl border border-slate-200/90 bg-white p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] animate-dropdown">
              {/* Header */}
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Interview Frameworks
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  Free & Verified
                </span>
              </div>

              {/* 4 Cards */}
              <div className="space-y-1">
                <Link
                  href="/interview-questions"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-600 border border-blue-200/50 shadow-sm transition-all group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent">
                    <IconMessageSquare className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          20 Most Common Questions
                        </span>
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded-full">
                          Top
                        </span>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                      The 20 most asked questions, answer formulas & rubrics
                    </span>
                  </div>
                </Link>

                <Link
                  href="/interview-questions/tell-me-about-yourself"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 text-indigo-600 border border-indigo-200/50 shadow-sm transition-all group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:border-transparent">
                    <IconUserCheck className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Tell Me About Yourself Guide
                        </span>
                        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-1.5 py-0.2 rounded-full">
                          60s Rule
                        </span>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                      Step-by-step formula & 9 role-specific sample answers
                    </span>
                  </div>
                </Link>

                <Link
                  href="/interview-questions/why-should-we-hire-you"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 border border-emerald-200/50 shadow-sm transition-all group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white group-hover:border-transparent">
                    <IconTarget className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Why Should We Hire You? Guide
                        </span>
                        <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                          3-Sentence
                        </span>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                      3-sentence pitch formula & 20+ best field examples
                    </span>
                  </div>
                </Link>

                <Link
                  href="/interview-questions/tell-me-about-yourself-internship"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/70 text-purple-600 border border-purple-200/50 shadow-sm transition-all group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white group-hover:border-transparent">
                    <IconGraduationCap className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                          Internship Interview Guide
                        </span>
                        <span className="text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.2 rounded-full">
                          Entry Level
                        </span>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-purple-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                      Formula for zero experience & 7 project examples
                    </span>
                  </div>
                </Link>

                <Link
                  href="/blog/strengths-and-weaknesses-interview-question"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:bg-slate-50/90 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-600 border border-amber-200/50 shadow-sm transition-all group-hover:from-amber-600 group-hover:to-orange-600 group-hover:text-white group-hover:border-transparent">
                    <IconSparkles className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                          Strengths &amp; Weaknesses
                        </span>
                        <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded-full">
                          Formula
                        </span>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-amber-600" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                      Simple formula, good vs bad lists &amp; 10 sample answers
                    </span>
                  </div>
                </Link>
              </div>

              {/* Bottom live AI practice banner */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 px-3 py-2 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-2xl border border-blue-100/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-[11px] font-medium text-slate-700">Practise out loud with real AI</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setQuestionsMenuOpen(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
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
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap leading-none transition-all duration-200 select-none",
              current
                ? "bg-white text-slate-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-slate-600 font-medium hover:text-slate-950 hover:bg-white/70 hover:shadow-sm"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right Side: Admin Badge & User Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Admin Quick Portal Badge */}
        {isUserAdmin && (
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-200/90 bg-gradient-to-r from-purple-50 to-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm hover:shadow hover:bg-purple-100/80 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span>Admin</span>
          </Link>
        )}

        {user ? (
          <div className="relative flex items-center gap-2.5" ref={menuRef}>
            {/* Main Open Studio CTA Button */}
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5"
            >
              <span>Open Studio</span>
              <span className="text-[11px] opacity-80">→</span>
            </Link>

            {/* User Profile Avatar Pill & Dropdown */}
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-label="User account menu"
              aria-expanded={userMenuOpen}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-[11px] font-bold tracking-tight text-white shadow-sm ring-2 ring-white hover:ring-blue-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none shrink-0"
              title={`${user.firstName || "User"} (${user.email || ""})`}
            >
              {user.initials || "U"}
            </button>

            {/* Solid High-End User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-[100] w-72 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] animate-dropdown">
                {/* User Card Header */}
                <div className="border-b border-slate-100 px-3 py-2.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-xs font-bold text-white shadow-sm">
                    {user.initials || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-slate-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Authenticated User"}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {user.email}
                    </p>
                    {isUserAdmin && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.2 rounded-md">
                        Admin Access
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-2 space-y-0.5">
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

                  <Link
                    href="/cv"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="text-emerald-600 font-bold">📄</span>
                    CVs & Letters
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

                <div className="border-t border-slate-100 pt-1.5">
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
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-1.5 text-slate-600 transition-all duration-150 hover:text-slate-900 hover:bg-slate-100 sm:inline font-medium whitespace-nowrap text-[13px]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1 shrink-0"
            >
              <span>Sign up free</span>
              <span className="text-[11px] opacity-80">→</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
