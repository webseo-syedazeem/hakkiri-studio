"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

export interface WizardDraftData {
  companyName: string;
  jobTitle: string;
  companyWebsite: string;
  cvDoc?: { name: string; uploaded: boolean } | null;
  jobDoc?: { name: string; uploaded: boolean } | null;
  coverDoc?: { name: string; uploaded: boolean } | null;
  stagesExpectation?: string;
  stages?: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
    format: string;
    interviewer: string;
    status: string;
    icon: string;
  }>;
  selectedRounds?: string[];
  techFocus?: number;
  skillsFocus?: number;
  expFocus?: number;
  difficulty?: string;
  duration?: number;
  step: number;
  savedAt: string;
}

export function DraftInterviewCard() {
  const [draft, setDraft] = useState<WizardDraftData | null>(null);

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem("hk_interview_wizard_draft");
      if (raw) {
        const parsed = JSON.parse(raw) as WizardDraftData;
        setDraft(parsed);
      } else {
        setDraft(null);
      }
    } catch {
      setDraft(null);
    }
  };

  useEffect(() => {
    loadDraft();
    const handleUpdate = () => loadDraft();
    window.addEventListener("hk_draft_updated", handleUpdate);
    return () => window.removeEventListener("hk_draft_updated", handleUpdate);
  }, []);

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard this draft?")) {
      try {
        localStorage.removeItem("hk_interview_wizard_draft");
        setDraft(null);
        window.dispatchEvent(new Event("hk_draft_updated"));
      } catch {}
    }
  };

  if (!draft) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] bg-gradient-to-r from-[#171d32] via-[#1c2444] to-[#171d32] p-5 shadow-[0_0_30px_rgba(99,102,241,0.22),inset_0_0_0_1.5px_#6366f1] animate-rise">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#1c264a] text-blue-soft shadow-[0_0_16px_rgba(99,102,241,0.35)]">
          <Icon name="doc" size={22} />
        </div>
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-soft/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-soft uppercase tracking-wider">
              Draft in progress
            </span>
            <span className="text-xs text-muted">
              Step {draft.step || 1} of 4 · Saved {draft.savedAt || "recently"}
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-ink truncate">
            {draft.jobTitle || "Senior Product Manager, Payments"}
          </h3>
          <p className="text-xs text-muted truncate">
            {draft.companyName || "Halden"} · {draft.stages?.length || 4} stages configured · Ready to resume
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={handleDiscard}
          className="rounded-xl px-3 py-2 text-xs font-semibold text-muted hover:text-red-soft hover:bg-red-soft/10 transition-colors cursor-pointer"
        >
          Discard
        </button>
        <Link
          href="/interviews/new"
          className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-blue-fill px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(74,90,240,0.4)] hover:bg-blue-hover hover:shadow-[0_0_24px_rgba(90,105,255,0.7)] active:scale-95 transition-all cursor-pointer"
        >
          <span className="relative z-10">Resume draft →</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
        </Link>
      </div>
    </div>
  );
}
