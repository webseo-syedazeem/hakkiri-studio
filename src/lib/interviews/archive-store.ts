"use client";

import type { ArchivedItem } from "@/components/dashboard/ArchiveModal";

/**
 * The person's own archive: applications they marked as ended, kept in this
 * browser. It starts empty and holds only what they put there.
 */
const STORAGE_KEY = "hk_archived_interviews";

/** Entries an earlier build put into every browser as samples. They were never the person's, so they are dropped. */
const SAMPLE_IDS = new Set(["archive-1", "archive-2"]);

export function loadArchivedItems(): ArchivedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const own = (parsed as ArchivedItem[]).filter((item) => item && typeof item.id === "string" && !SAMPLE_IDS.has(item.id) && !item.id.startsWith("halden-archived-"));
    if (own.length !== parsed.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(own));
    return own;
  } catch {
    return [];
  }
}

export function saveArchivedItems(items: ArchivedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("hk_archive_updated"));
  } catch {}
}
