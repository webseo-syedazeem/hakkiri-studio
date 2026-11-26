"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";

/**
 * Friendly dismissible advisory banner on phones informing the user that desktop is recommended
 * for live mic practice sessions, remembered across visits on this device/account.
 */
export function PhoneNotice() {
  const [dismissed, setDismissed] = useState(true); // default true for SSR

  useEffect(() => {
    const isDismissed = localStorage.getItem("hk_dismiss_phone_notice") === "1" || sessionStorage.getItem("dismiss_phone_notice") === "1";
    setDismissed(isDismissed);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem("hk_dismiss_phone_notice", "1");
      sessionStorage.setItem("dismiss_phone_notice", "1");
    } catch {
      // ignore quota error
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Mobile viewing advisory"
      className="print-hide fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 rounded-2xl bg-panel/95 backdrop-blur-xl border border-line p-3.5 shadow-2xl md:hidden animate-fade-in text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-fill/15 text-blue-fill border border-blue-fill/25">
          <Icon name="sparkle" size={16} />
        </div>
        <p className="text-xs leading-relaxed text-ink line-clamp-2">
          Live interview mic sessions work best on a laptop or desktop. Dashboard, reports and review are fully supported on mobile.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-full bg-blue-fill py-1.5 px-3 text-xs font-semibold text-white shadow-md hover:bg-blue-hover transition-all active:scale-[0.98] cursor-pointer"
      >
        Got it
      </button>
    </div>
  );
}
