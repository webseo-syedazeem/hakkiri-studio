"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { ArchiveModal, type ArchivedItem } from "@/components/dashboard/ArchiveModal";
import { DraftStorageModal } from "./DraftStorageModal";
import type { WizardDraftData } from "./DraftInterviewCard";
import { loadArchivedItems, saveArchivedItems } from "@/lib/interviews/archive-store";

export function InterviewsHeaderControls() {
  const [draft, setDraft] = useState<WizardDraftData | null>(null);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const syncState = () => {
    try {
      const raw = localStorage.getItem("hk_interview_wizard_draft");
      if (raw) {
        setDraft(JSON.parse(raw) as WizardDraftData);
      } else {
        setDraft(null);
      }
    } catch {
      setDraft(null);
    }
    setArchivedItems(loadArchivedItems());
  };

  useEffect(() => {
    syncState();
    const handleDraftUpdate = () => syncState();
    const handleArchiveUpdate = () => syncState();
    window.addEventListener("hk_draft_updated", handleDraftUpdate);
    window.addEventListener("hk_archive_updated", handleArchiveUpdate);
    return () => {
      window.removeEventListener("hk_draft_updated", handleDraftUpdate);
      window.removeEventListener("hk_archive_updated", handleArchiveUpdate);
    };
  }, []);

  const handleRestoreArchive = (id: string) => {
    const updated = archivedItems.filter((it) => it.id !== id);
    setArchivedItems(updated);
    saveArchivedItems(updated);
  };

  const hasDraft = Boolean(draft);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2.5">
        {/* 1. Archive Button */}
        <button
          type="button"
          onClick={() => setIsArchiveOpen(true)}
          className="group/btn relative overflow-hidden inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-panel-2 px-3.5 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="archive" size={15} className="text-muted group-hover/btn:text-ink transition-colors" />
          <span>Archive</span>
          {archivedItems.length > 0 && (
            <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-dim font-bold">
              {archivedItems.length}
            </span>
          )}
        </button>

        {/* 2. View Draft Button */}
        <button
          type="button"
          onClick={() => setIsDraftModalOpen(true)}
          className={clsx(
            "group/btn relative overflow-hidden inline-flex h-[38px] items-center justify-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold transition-all duration-300 active:scale-95 cursor-pointer",
            hasDraft
              ? "bg-[#1c2444] text-blue-soft border border-blue-fill/50 shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:bg-[#232d56] hover:border-blue-fill"
              : "bg-panel-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38]"
          )}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="doc" size={15} className={clsx(hasDraft ? "text-blue-soft" : "text-muted")} />
          <span>View draft</span>
          {hasDraft && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-soft opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-soft" />
            </span>
          )}
        </button>

        {/* 3. New Interview Button (Clean Solid Unified Button) */}
        <Link
          href="/interviews/new"
          className="group/btn relative overflow-hidden inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-blue-fill px-4 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.4)] hover:bg-blue-hover hover:shadow-[0_0_24px_rgba(90,105,255,0.7)] active:scale-95 transition-all cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="plus" size={15} strokeWidth={2.4} className="transition-transform duration-300 group-hover/btn:rotate-90" />
          <span>New interview</span>
        </Link>
      </div>

      {/* Draft Storage Details Modal (Portaled to document.body) */}
      <DraftStorageModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        initialDraft={draft}
        onDraftDiscarded={() => setDraft(null)}
      />

      {/* Archive Modal (Portaled to document.body) */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archivedItems={archivedItems}
        onRestore={handleRestoreArchive}
      />
    </>
  );
}
