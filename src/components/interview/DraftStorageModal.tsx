"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { WizardDraftData } from "./DraftInterviewCard";

export function DraftStorageModal({
  isOpen,
  onClose,
  initialDraft,
  onDraftDiscarded,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDraft?: WizardDraftData | null;
  onDraftDiscarded?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<WizardDraftData | null>(initialDraft ?? null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (isOpen) {
      syncDraft();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => syncDraft();
    window.addEventListener("hk_draft_updated", handleUpdate);
    return () => window.removeEventListener("hk_draft_updated", handleUpdate);
  }, []);

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard this draft? All progress will be removed from your workspace storage.")) {
      try {
        localStorage.removeItem("hk_interview_wizard_draft");
        setDraft(null);
        window.dispatchEvent(new Event("hk_draft_updated"));
        onDraftDiscarded?.();
      } catch {}
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-auto flex w-full max-w-[540px] max-h-[88vh] flex-col rounded-[22px] border border-line bg-panel p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1a2238] text-blue-soft">
              <Icon name="archive" size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-ink">Draft Storage Details</h2>
              <p className="text-xs text-muted">Where and how your progress is saved</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Content Details */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto pr-1 text-xs">
          {/* Workspace Storage Card */}
          <div className="rounded-[12px] bg-panel-2 p-3.5 border border-line">
            <div className="flex items-center gap-2 font-semibold text-ink mb-1">
              <Icon name="globe" size={14} className="text-blue-soft" />
              <span>Workspace Local Cache</span>
            </div>
            <p className="text-muted leading-relaxed">
              Your draft is securely preserved in your browser&apos;s workspace storage (
              <code className="text-blue-soft font-mono font-medium">hk_interview_wizard_draft</code>
              ). It will not be lost if you refresh, close the tab, or navigate elsewhere.
            </p>
          </div>

          {/* Included in this draft Card */}
          <div className="rounded-[12px] bg-panel-2 p-3.5 border border-line flex flex-col gap-2">
            <span className="font-semibold text-ink">Included in this draft:</span>
            {draft ? (
              <div className="grid grid-cols-2 gap-2 text-muted">
                <div className="flex items-center gap-1.5">
                  <Icon name="check" size={12} className="text-[#10b981] shrink-0" />
                  <span className="truncate">Role: {draft.jobTitle || "Senior Product Manager, Payments"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="check" size={12} className="text-[#10b981] shrink-0" />
                  <span className="truncate">Company: {draft.companyName || "Halden"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="check" size={12} className="text-[#10b981] shrink-0" />
                  <span>Stages: {draft.stages?.length || 4} configured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="check" size={12} className="text-[#10b981] shrink-0" />
                  <span>Current step: Step {draft.step || 1} of 4</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-muted">
                No active draft stored. Starting an interview setup will automatically save your progress here.
              </div>
            )}
          </div>

          {draft?.savedAt && (
            <div className="flex items-center justify-between text-dim pt-1 text-[11px]">
              <span>Last saved timestamp:</span>
              <span className="font-medium text-ink">{draft.savedAt}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 shrink-0">
          {draft ? (
            <button
              type="button"
              onClick={handleDiscard}
              className="text-xs font-semibold text-red-soft/80 hover:text-red-soft hover:underline cursor-pointer"
            >
              Discard draft
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-muted hover:text-ink cursor-pointer"
            >
              Close
            </button>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/interviews/new"
              onClick={onClose}
              className="rounded-xl bg-blue-fill px-5 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.4)] hover:bg-blue-hover active:scale-95 transition-all cursor-pointer"
            >
              {draft ? "Keep working" : "Start setup →"}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
