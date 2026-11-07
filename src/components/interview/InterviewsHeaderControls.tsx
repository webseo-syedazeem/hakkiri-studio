"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
          className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 px-3.5 py-2 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
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
            "group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 active:scale-95 cursor-pointer",
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

        {/* 3. New Interview Button with Split Action Dropdown */}
        <div ref={menuRef} className="relative flex items-center">
          <Link
            href="/interviews/new"
            className="group/btn relative overflow-hidden inline-flex items-center gap-2 rounded-l-xl bg-blue-fill px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.4)] hover:bg-blue-hover active:scale-95 transition-all"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <Icon name="plus" size={15} strokeWidth={2.4} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            <span>New interview</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={clsx(
              "inline-flex items-center justify-center rounded-r-xl bg-blue-fill/90 hover:bg-blue-hover border-l border-white/20 px-2.5 py-2 text-[12px] font-semibold text-white transition-all cursor-pointer",
              isMenuOpen && "bg-blue-hover"
            )}
            title="More interview options"
          >
            <span className={clsx("transition-transform duration-200 block", isMenuOpen && "rotate-180")}>▾</span>
          </button>

          {/* Floating Studio Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-[#151824] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-md animate-scale-in text-xs">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-dim border-b border-line/50 mb-1 flex items-center justify-between">
                <span>Interview Options</span>
                <span className="text-[9px] text-blue-soft font-normal">Hakkiri Studio</span>
              </div>

              {/* Action 1: Start fresh */}
              <Link
                href="/interviews/new"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ink hover:bg-blue-fill/15 hover:text-white transition-all group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-fill/20 text-blue-soft group-hover:bg-blue-fill/30">
                  <Icon name="plus" size={13} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-semibold text-ink group-hover:text-white">Start fresh interview</div>
                  <div className="text-[10px] text-muted">Build from job spec & CV</div>
                </div>
              </Link>

              {/* Action 2: Resume draft (if exists) */}
              {hasDraft ? (
                <Link
                  href="/interviews/new"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ink hover:bg-blue-fill/15 hover:text-white transition-all group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10b981]/20 text-[#10b981] group-hover:bg-[#10b981]/30">
                    <Icon name="edit" size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-blue-soft flex items-center gap-1.5">
                      <span>Resume saved draft</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-soft animate-ping" />
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {draft?.jobTitle || "Halden"} · Step {draft?.step || 1} of 4
                    </div>
                  </div>
                </Link>
              ) : null}

              {/* Action 3: Storage details */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDraftModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-ink hover:bg-panel-2 transition-all cursor-pointer group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-panel-2 text-muted group-hover:text-ink">
                  <Icon name="doc" size={13} />
                </div>
                <div>
                  <div className="font-semibold text-ink">Draft storage details</div>
                  <div className="text-[10px] text-muted">Inspect workspace local cache</div>
                </div>
              </button>

              {/* Action 4: Archive */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsArchiveOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-ink hover:bg-panel-2 transition-all cursor-pointer group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#241e38] text-lilac group-hover:text-white">
                  <Icon name="archive" size={13} />
                </div>
                <div>
                  <div className="font-semibold text-ink">Archive</div>
                  <div className="text-[10px] text-muted">Past & unsuccessful interviews ({archivedItems.length})</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draft Storage Details Modal (Matches Image 2) */}
      <DraftStorageModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        initialDraft={draft}
        onDraftDiscarded={() => setDraft(null)}
      />

      {/* Archive Modal (Matches Image 1) */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archivedItems={archivedItems}
        onRestore={handleRestoreArchive}
      />
    </>
  );
}
