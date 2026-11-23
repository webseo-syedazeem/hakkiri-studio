"use client";

import { useState } from "react";
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
    name: "Homepage & Site CMS",
    href: "/admin/site",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Traffic & Analytics",
    href: "/admin/analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Media Library",
    href: "/admin/media",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

export function AdminLayoutClient({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Leaving the console signs the administrator out of the app. There is no separate lock: access is the account's.
  const handleLock = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0c0d14] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* ========================================================================= */}
      {/* STANDALONE ADMIN SIDEBAR (DESKTOP) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/[0.08] bg-[#0e0f18] shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* Admin Brand Header */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md shadow-purple-500/20 ring-1 ring-white/20 transition-transform duration-300 hover:scale-105">
              <Mark size={24} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Hakkiri <span className="rounded bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 tracking-wider uppercase shadow-sm">ADMIN</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
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
              <div className="text-xs font-bold text-white">Administrator</div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLock}
            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Sign out"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Mark size={18} />
          </div>
          <span className="text-sm font-bold text-white">Hakkiri Admin</span>
          <span className="rounded bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-extrabold px-1.5 py-0.5">PROD</span>
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
