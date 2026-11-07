"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { DraftStorageModal } from "@/components/interview/DraftStorageModal";
import type { WizardDraftData } from "@/components/interview/DraftInterviewCard";

export function HomeHeaderActions() {
  const [draft, setDraft] = useState<WizardDraftData | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const hasDraft = Boolean(draft);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2.5">
        {/* View Draft Button */}
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

        {/* New Interview Button with Dropdown */}
        <div ref={menuRef} className="relative flex items-center">
          <Link
            href="/interviews/new"
            className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-l-xl bg-panel-2 px-3.5 py-2 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] active:scale-95"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            <span>New interview</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center rounded-r-xl bg-panel-2 hover:bg-[#2b2d38] border-l border-line px-2 py-2 text-[12px] font-semibold text-muted hover:text-ink transition-all cursor-pointer"
            title="More interview options"
          >
            <span className={clsx("transition-transform duration-200 block", isMenuOpen && "rotate-180")}>▾</span>
          </button>

          {/* Floating Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 z-50 mt-2 w-60 rounded-xl border border-line bg-[#151824] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-md animate-scale-in text-xs">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-dim border-b border-line/50 mb-1">
                Interview Actions
              </div>
              <Link
                href="/interviews/new"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-ink hover:bg-blue-fill/15 hover:text-white transition-all"
              >
                <Icon name="plus" size={13} className="text-blue-soft" />
                <span>Start fresh setup</span>
              </Link>
              {hasDraft && (
                <Link
                  href="/interviews/new"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-ink hover:bg-blue-fill/15 hover:text-white transition-all"
                >
                  <Icon name="edit" size={13} className="text-[#10b981]" />
                  <span className="text-blue-soft">Resume saved draft</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDraftModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-ink hover:bg-panel-2 transition-all cursor-pointer"
              >
                <Icon name="doc" size={13} className="text-muted" />
                <span>Draft storage details</span>
              </button>
            </div>
          )}
        </div>

        {/* New presentation Button */}
        <Link
          href="/presentations/new"
          className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 px-4 py-2 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
          <span>New presentation</span>
        </Link>
      </div>

      {/* Draft Storage Details Modal */}
      <DraftStorageModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        initialDraft={draft}
        onDraftDiscarded={() => setDraft(null)}
      />
    </>
  );
}
