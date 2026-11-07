"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { DraftStorageModal } from "@/components/interview/DraftStorageModal";
import type { WizardDraftData } from "@/components/interview/DraftInterviewCard";

export function HomeHeaderActions() {
  const [draft, setDraft] = useState<WizardDraftData | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  const syncDraft = () => {
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
  };

  useEffect(() => {
    syncDraft();
    const handleUpdate = () => syncDraft();
    window.addEventListener("hk_draft_updated", handleUpdate);
    return () => window.removeEventListener("hk_draft_updated", handleUpdate);
  }, []);

  const hasDraft = Boolean(draft);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2.5">
        {/* View Draft Button */}
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

        {/* New Interview Button (Clean Solid Unified Button) */}
        <Link
          href="/interviews/new"
          className="group/btn relative overflow-hidden inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-panel-2 px-4 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
          <span>New interview</span>
        </Link>

        {/* New Presentation Button */}
        <Link
          href="/presentations/new"
          className="group/btn relative overflow-hidden inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-panel-2 px-4 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
          <span>New presentation</span>
        </Link>
      </div>

      {/* Draft Storage Details Modal (Portaled to document.body) */}
      <DraftStorageModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        initialDraft={draft}
        onDraftDiscarded={() => setDraft(null)}
      />
    </>
  );
}
