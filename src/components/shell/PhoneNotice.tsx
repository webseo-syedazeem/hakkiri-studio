"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * Friendly advisory on phones informing the user that desktop is recommended
 * for live mic practice sessions, while offering a one-tap button to continue
 * viewing all studio dashboards, reports, and questions on mobile.
 */
export function PhoneNotice() {
  const [dismissed, setDismissed] = useState(true); // default true for SSR

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("dismiss_phone_notice") === "1";
    setDismissed(isDismissed);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("dismiss_phone_notice", "1");
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Mobile viewing advisory"
      className="print-hide fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-booth/95 backdrop-blur-xl px-6 text-center md:hidden animate-fade-in"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/15 text-blue-soft border border-blue/25 shadow-xl">
        <Icon name="sparkle" size={28} />
      </div>

      <div className="max-w-[360px] space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Hakkiri Studio on Mobile
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          For live voice sessions with microphone calibration, a laptop or desktop with Chrome is best. You can still view your dashboard, reports, and questions on your phone.
        </p>
      </div>

      <div className="mt-2 flex flex-col w-full max-w-[280px] gap-2.5">
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full rounded-full bg-blue-fill py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-blue/25 hover:bg-blue-hover transition-all active:scale-[0.98] cursor-pointer"
        >
          Continue on Mobile
        </button>
        <Link
          href="/"
          className="w-full rounded-full border border-line py-2.5 px-4 text-xs font-medium text-muted hover:text-white hover:bg-panel-2 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
