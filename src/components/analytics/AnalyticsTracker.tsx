"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track if path changed
    if (!pathname || pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    // Ignore admin routes from candidate traffic metrics
    if (pathname.startsWith("/admin")) return;

    try {
      // Get or create anonymous visitor ID
      let visitorId = "";
      if (typeof window !== "undefined" && window.localStorage) {
        visitorId = localStorage.getItem("hk_vis_id") || "";
        if (!visitorId) {
          visitorId = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
          localStorage.setItem("hk_vis_id", visitorId);
        }
      }

      const payload = {
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        visitorId,
      };

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Silently ignore tracking errors
    }
  }, [pathname]);

  return null;
}
