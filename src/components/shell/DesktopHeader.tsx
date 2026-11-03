"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";

export function DesktopHeader({
  firstName,
  initials,
}: {
  firstName: string;
  initials: string;
}) {
  const pathname = usePathname() ?? "/";

  // Derive page label for desktop breadcrumb
  let pageTitle = "Studio Home";
  if (pathname.startsWith("/interviews")) pageTitle = "Interview Pipelines";
  else if (pathname.startsWith("/presentations")) pageTitle = "Presentation & Pitch Lab";
  else if (pathname.startsWith("/story-bank")) pageTitle = "STAR Story Bank";
  else if (pathname.startsWith("/settings")) pageTitle = "Studio Preferences";
  else if (pathname.startsWith("/welcome")) pageTitle = "Welcome & Onboarding";

  return (
    <header className="print-hide sticky top-0 z-30 -mx-9 -mt-7 mb-7 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#14151c]/90 px-8 backdrop-blur-md">
      {/* Left: Desktop App Indicator & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Decorative desktop window dots */}
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-red/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </div>

        <div className="h-4 w-px bg-white/10" aria-hidden />

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold tracking-wider text-ink/70 uppercase">Hakkiri Desktop Pro</span>
          <span className="text-white/20">/</span>
          <span className="font-semibold text-blue-soft">{pageTitle}</span>
        </div>
      </div>

      {/* Center: System & Engine Status */}
      <div className="hidden items-center gap-3 md:flex">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Offline Mock AI Engine Active
        </span>
        <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted">
          <Icon name="shield" size={13} className="text-blue-soft" />
          Zero Accent Bias
        </span>
      </div>

      {/* Right: Quick Controls, Mic Calibration & Trial Timer */}
      <div className="flex items-center gap-3">
        <Link
          href="/mic-check"
          className="flex h-8 items-center gap-2 rounded-lg bg-panel-2 px-3 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#282a35] transition-colors"
          title="Microphone Calibration"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Mic Ready</span>
        </Link>

        <div className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-blue/20 bg-blue/10 px-3 text-xs font-medium text-blue-soft">
          <span className="font-bold text-ink">11m</span>
          <span>trial credit</span>
        </div>

        <Link
          href="/interviews/new"
          className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-fill px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-hover transition-colors"
        >
          <Icon name="plus" size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Quick Add</span>
        </Link>

        <Link
          href="/login"
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-panel-2 px-2.5 text-xs font-semibold text-muted hover:text-ink hover:bg-[#282a35] transition-colors"
          title="Switch Account / Sign In"
        >
          <span>Log In</span>
        </Link>

        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-panel-2 text-xs font-bold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-blue-soft)] transition-all"
          title={`Signed in as ${firstName} (${initials})`}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
