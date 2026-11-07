"use client";

import type { ArchivedItem } from "@/components/dashboard/ArchiveModal";

export const DEFAULT_ARCHIVED_ITEMS: ArchivedItem[] = [
  {
    id: "archive-1",
    role: "Lead Product Manager",
    company: "Stripe",
    outcome: "Unsuccessful",
    stageReached: "Stage 3 · Case interview",
    date: "28 Oct",
    feedbackNotes:
      "Strong product vision and API depth. Interviewers recommended deepening operational risk and ledger scale experience.",
  },
  {
    id: "archive-2",
    role: "Group PM, Growth & Retention",
    company: "Monzo",
    outcome: "Unsuccessful",
    stageReached: "Stage 2 · Hiring manager",
    date: "14 Oct",
    feedbackNotes:
      "Impressive storytelling and structure. Team decided to proceed with an internal candidate.",
  },
];

const STORAGE_KEY = "hk_archived_interviews";

export function loadArchivedItems(): ArchivedItem[] {
  if (typeof window === "undefined") return DEFAULT_ARCHIVED_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARCHIVED_ITEMS));
      return DEFAULT_ARCHIVED_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ARCHIVED_ITEMS;
  } catch {
    return DEFAULT_ARCHIVED_ITEMS;
  }
}

export function saveArchivedItems(items: ArchivedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("hk_archive_updated"));
  } catch {}
}
