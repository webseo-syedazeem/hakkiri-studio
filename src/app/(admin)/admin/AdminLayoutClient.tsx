"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Mark } from "@/components/brand/Mark";

const ADMIN_NAV = [
  {
    name: "Blog Articles",
    href: "/admin/blog",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    name: "Real-time SEO Suite",
    href: "/admin/seo",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    name: "Database & Cloud",
    href: "/admin/database",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3m-16 5c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3" />
      </svg>
    ),
  },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState(false);

  // Check simple admin passcode unlock state in localStorage for convenience
  useEffect(() => {
    const saved = localStorage.getItem("hakkiri_admin_unlocked");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "admin2026" || passcode.trim() === "hakkiri" || passcode.trim() === "admin") {
      localStorage.setItem("hakkiri_admin_unlocked", "true");
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLock = () => {
    localStorage.removeItem("hakkiri_admin_unlocked");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12131c] p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Mark size={28} />
          </div>

          <div>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
              Restricted Area
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3">
              Hakkiri Admin Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your administration passcode to access CMS and SEO tools.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError(false);
                }}
                className={clsx(
                  "w-full h-11 rounded-xl border bg-[#1a1b26] px-4 text-sm text-center font-mono text-white placeholder-slate-500 focus:outline-none transition-all",
                  authError ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-white/15 focus:border-purple-500"
                )}
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">Incorrect passcode. Try &quot;admin2026&quot;</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition"
            >
              Unlock Console
            </button>
          </form>

          <div className="pt-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 underline underline-offset-4">
              &larr; Return to Hakkiri Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d14] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* ========================================================================= */}
      {/* STANDALONE ADMIN SIDEBAR (DESKTOP) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/[0.08] bg-[#0e0f18] shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* Admin Brand Header */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-white">
              <Mark size={22} />
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Hakkiri <span className="rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold px-1.5 py-0.5 tracking-wider uppercase border border-purple-500/30">ADMIN</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>MongoDB Connected</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              Content & SEO
            </div>
            {ADMIN_NAV.map((item) => {
              const active = pathname === item.href || (item.href === "/admin/blog" && pathname.startsWith("/admin/blog"));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
                    active
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <span className={clsx(active ? "text-white" : "text-slate-400")}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick External Links */}
          <div className="pt-4 border-t border-white/[0.08] space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              Live Ecosystem
            </div>
            <Link
              href="/blog"
              target="_blank"
              className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Public Blog Site
              </span>
              <span className="text-[10px] text-purple-400 font-mono">Live &rarr;</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Public Homepage
              </span>
              <span className="text-[10px] text-slate-500 font-mono">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Bottom Status / Logout */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-white">Super Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">live.session</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLock}
            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Lock Console"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE TOP BAR */}
      {/* ========================================================================= */}
      <header className="md:hidden flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0e0f18] px-4">
        <div className="flex items-center gap-2.5">
          <Mark size={20} />
          <span className="text-sm font-bold text-white">Hakkiri Admin</span>
          <span className="rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5">PROD</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-white/10 p-2 text-slate-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#12131d] p-4 space-y-2">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-white/[0.08]">
            <Link
              href="/blog"
              target="_blank"
              className="flex items-center gap-2 text-xs text-purple-400 font-semibold p-2"
            >
              View Live Website &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN ADMIN WORKSPACE */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-7 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
