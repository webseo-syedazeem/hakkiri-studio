"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";
import { saveExamplesBatch, type InterviewExample } from "@/lib/examples/store";

interface ExtractedCandidate {
  id: string;
  title: string;
  question: string;
  answer: string;
  competency: string;
  role: string;
  interviewType: string;
  tags: string[];
  isStarStructure: boolean;
  selected: boolean;
}

const EXTRACTED_EXAMPLES_TEMPLATE: ExtractedCandidate[] = [
  {
    id: "cand-1",
    title: "Directed multi-agency strategy review for housing policy initiative",
    question: "Tell me about a time you developed a complex multi-agency strategy with conflicting priorities.",
    answer: "Situation: Cross-departmental housing frameworks had fragmented reporting across 4 government bodies.\nTask: Formulate an integrated strategy paper for the ministerial board within 6 weeks.\nAction: Mobilised working groups, led risk-scoring workshops, and reconciled divergent stakeholder data models.\nResult: Delivered a unified policy blueprint formally adopted by all 4 departments, accelerating project rollout by 3 months.",
    competency: "Strategic thinking",
    role: "Senior Policy & Strategy Adviser",
    interviewType: "Final panel",
    tags: ["Strategic thinking", "Policy", "Stakeholder management"],
    isStarStructure: true,
    selected: true,
  },
  {
    id: "cand-2",
    title: "Negotiated budget reallocation through evidence-based modeling",
    question: "Give an example of influencing a senior budget holder or executive to change their resource allocation.",
    answer: "Situation: A critical digital automation initiative was underfunded by £450k in the initial fiscal allocation.\nTask: Build a rock-solid business case demonstrating 3x ROI to secure capital expenditure.\nAction: Developed predictive cost-benefit models, stress-tested sensitivity assumptions, and presented trade-offs directly to the financial executive committee.\nResult: Secured full £450k reallocation with unanimous committee approval, resulting in £1.4M operational savings over 18 months.",
    competency: "Influencing",
    role: "Senior Adviser / Product Lead",
    interviewType: "Competency",
    tags: ["Influencing", "Data-driven", "Continuous improvement"],
    isStarStructure: true,
    selected: true,
  },
  {
    id: "cand-3",
    title: "Led rapid incident response to restore reporting compliance within 72 hours",
    question: "Describe an urgent operational blocker you resolved under intense external scrutiny.",
    answer: "Situation: A data pipeline integration failure threatened statutory disclosure deadlines with potential legal repercussions.\nTask: Restore verified reporting capabilities and identify data anomalies before external release.\nAction: Established a 24/7 technical war room, prioritised essential metrics, and created an automated checksum validation suite.\nResult: Restored full compliance 12 hours ahead of the statutory deadline with zero data infractions, turning the validation suite into standard operating procedure.",
    competency: "Problem-solving",
    role: "Operations & Delivery Lead",
    interviewType: "Hiring manager",
    tags: ["Problem-solving", "Risk management", "Delivery"],
    isStarStructure: true,
    selected: true,
  },
];

interface ImportFromCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function ImportFromCvModal({ isOpen, onClose, onSuccess }: ImportFromCvModalProps) {
  const [step, setStep] = useState<"select" | "scanning" | "review">("select");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("Extracting career milestones from your CV...");
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>(EXTRACTED_EXAMPLES_TEMPLATE);
  const [cvFileName, setCvFileName] = useState("Sazia_Aktar_CV.pdf");

  // Reset step whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setScanProgress(0);
      setCandidates(EXTRACTED_EXAMPLES_TEMPLATE);
    }
  }, [isOpen]);

  // Simulated Scanning Animation
  useEffect(() => {
    if (step === "scanning") {
      setScanProgress(15);
      setScanStatus("Parsing CV work history & key deliverables...");

      const t1 = setTimeout(() => {
        setScanProgress(45);
        setScanStatus("Detecting leadership, problem-solving, and strategic achievements...");
      }, 600);

      const t2 = setTimeout(() => {
        setScanProgress(80);
        setScanStatus("Structuring real achievements into Situation, Task, Action, Result...");
      }, 1200);

      const t3 = setTimeout(() => {
        setScanProgress(100);
        setScanStatus("Found 3 high-impact STAR examples!");
      }, 1700);

      const t4 = setTimeout(() => {
        setStep("review");
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [step]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const selectedCount = candidates.filter((c) => c.selected).length;

  const handleConfirmImport = () => {
    const toImport = candidates
      .filter((c) => c.selected)
      .map((c) => ({
        title: c.title,
        question: c.question,
        answer: c.answer,
        competency: c.competency,
        role: c.role,
        interviewType: c.interviewType,
        tags: c.tags,
        isStarStructure: c.isStarStructure,
        isFavorite: false,
      }));

    if (toImport.length > 0) {
      saveExamplesBatch(toImport);
      onSuccess(toImport.length);
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[680px] rounded-[24px] bg-[#141724] border border-white/12 shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-6 sm:p-7 overflow-hidden z-10 animate-scale-in">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Icon name="sparkle" size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Import STAR examples from CV
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Automatically extract career achievements and convert them into structured interview answers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* STEP 1: Select CV Source */}
        {step === "select" && (
          <div className="mt-5 space-y-5 animate-fade-in">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-white">Select CV document</label>

              {/* Active CV Option */}
              <div className="flex items-center justify-between rounded-xl bg-panel-2 p-3.5 border border-indigo-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Icon name="doc" size={16} />
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-semibold text-white truncate">
                      {cvFileName}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      ✓ Ready for intelligent STAR extraction
                    </span>
                  </div>
                </div>

                <label className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer underline-offset-2 hover:underline shrink-0 ml-3">
                  Change file
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="rounded-xl bg-white/[0.03] border border-white/06 p-4 space-y-2 text-xs text-muted">
              <span className="font-semibold text-white text-xs block mb-1">
                What Hakkiri AI will extract:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <span>✓</span> High-impact leadership initiatives
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <span>✓</span> Measurable bottom-line outcomes
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <span>✓</span> Conflict & stakeholder resolution
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <span>✓</span> Full STAR breakdown structure
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep("scanning")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-fill hover:bg-blue-hover px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(79,82,248,0.45)] hover:shadow-[0_6px_24px_rgba(79,82,248,0.65)] transition-all cursor-pointer"
              >
                <Icon name="sparkle" size={13} />
                <span>Extract STAR examples</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Scanning & Extraction in Progress */}
        {step === "scanning" && (
          <div className="mt-8 mb-6 flex flex-col items-center justify-center text-center space-y-5 py-6 animate-fade-in">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Icon name="sparkle" size={26} className="animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/50 animate-ping opacity-25" />
            </div>

            <div className="space-y-1.5 max-w-[420px]">
              <h3 className="text-sm font-bold text-white">Analyzing CV Work Experience</h3>
              <p className="text-xs text-muted min-h-[18px] transition-all duration-300">
                {scanStatus}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-[380px] space-y-1.5">
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-fill via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-dim font-mono">
                <span>Scanning achievements</span>
                <span>{scanProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review Extracted Examples */}
        {step === "review" && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Found {candidates.length} STAR examples from your CV:
              </span>
              <span className="text-[11px] text-muted">
                {selectedCount} of {candidates.length} selected
              </span>
            </div>

            {/* Candidates List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => toggleSelect(cand.id)}
                  className={clsx(
                    "rounded-xl p-3.5 border transition-all cursor-pointer text-left",
                    cand.selected
                      ? "bg-[#181c2e] border-indigo-500/60 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                      : "bg-panel-2/60 border-line text-muted hover:border-line-strong"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={cand.selected}
                      onChange={() => toggleSelect(cand.id)}
                      className="mt-0.5 h-4 w-4 rounded border-line text-indigo-600 focus:ring-0 cursor-pointer"
                    />

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white leading-tight">
                          {cand.title}
                        </span>
                        <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-300">
                          {cand.competency}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {cand.answer}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        {cand.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-dim"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="text-xs text-muted hover:text-white transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={handleConfirmImport}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-fill hover:bg-blue-hover disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(79,82,248,0.4)] transition-all cursor-pointer"
                >
                  <Icon name="check" size={13} strokeWidth={2.5} />
                  <span>Import selected ({selectedCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
