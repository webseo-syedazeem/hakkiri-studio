"use client";

import { useLayoutEffect } from "react";
import { announceBrowserData, browserData } from "@/lib/browser/owner";

/**
 * Marks this browser's stored entries as belonging to the signed-in account.
 * If they belong to another account they are set aside first, before any
 * screen reads them: this runs ahead of every screen's own effects.
 */
export function BrowserOwner({ userId }: { userId: string }) {
  useLayoutEffect(() => {
    if (browserData.claim(userId)) announceBrowserData();
  }, [userId]);
  return null;
}
