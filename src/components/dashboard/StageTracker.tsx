"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

interface StageInfo {
  num: number;
  title: string;
  defaultCompletedText: string;
  upcomingText: string;
  status?: "completed" | "next" | "upcoming" | string;
}

export interface StageTrackerStage {
  id?: string;
  name?: string;
  status?: "completed" | "next" | "upcoming" | string;
  date?: string;
  time?: string;
  format?: string;
  interviewer?: string;
}

export interface StageTrackerInterview {
  id: string;
  role: string;
  company: string;
  companyInitial?: string;
  stages?: StageTrackerStage[];
}

const DEFAULT_STAGES: StageInfo[] = [
  {
    num: 1,
    title: "Stage 1 · Recruiter screen",
    defaultCompletedText: "Completed · 4 Nov",
    upcomingText: "Completed · 4 Nov",
    status: "completed",
  },
  {
    num: 2,
    title: "Stage 2 · Hiring manager",
    defaultCompletedText: "Completed · 12 Nov",
    upcomingText: "Upcoming · 12 Nov, 10:00",
    status: "next",
  },
  {
    num: 3,
    title: "Stage 3 · Case interview",
    defaultCompletedText: "Completed · 19 Nov",
    upcomingText: "Upcoming · 19 Nov, 14:00",
    status: "upcoming",
  },
  {
    num: 4,
    title: "Stage 4 · Final panel",
    defaultCompletedText: "Completed · 26 Nov",
    upcomingText: "Upcoming · 26 Nov, 11:00",
    status: "upcoming",
  },
];

export function StageTracker({
  interview,
  onArchiveRole,
}: {
  interview?: StageTrackerInterview | null;
  onArchiveRole?: (reason: string) => void;
}) {
  const [activeInterview, setActiveInterview] = useState<StageTrackerInterview | null>(interview ?? null);

  // Sync with client-side localStorage interviews
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hk_custom_interviews");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const match = interview ? list.find((it: any) => it.id === interview.id) : list[0];
          if (match) {
            setActiveInterview((prev) => ({
              id: match.id,
              role: match.role || prev?.role || "Associate Product Manager",
              company: match.company || prev?.company || "HMRC",
              companyInitial: match.companyInitial || match.company?.[0] || prev?.companyInitial || "H",
              stages: Array.isArray(match.stages) && match.stages.length > 0 ? match.stages : prev?.stages,
            }));
          }
        }
      }
    } catch {}
  }, [interview]);

  const displayRole = activeInterview?.role || "Senior Product Manager, Payments";
  const displayCompany = activeInterview?.company || "Halden";
  const displayCompanyInitial = activeInterview?.companyInitial || displayCompany[0] || "H";
  const displayHref = activeInterview ? `/interviews/${activeInterview.id}` : "/interviews/halden";

  const displayStages: StageInfo[] =
    activeInterview?.stages && activeInterview.stages.length > 0
      ? activeInterview.stages.map((st, idx) => {
          const num = idx + 1;
          const name = st.name || `Stage ${num}`;
          const dt = st.date ? `${st.date}${st.time ? `, ${st.time}` : ""}` : "";
          return {
            num,
            title: `Stage ${num} · ${name}`,
            defaultCompletedText: dt ? `Completed · ${dt}` : "Completed",
            upcomingText: dt ? `Upcoming · ${dt}` : "Upcoming",
            status: st.status,
          };
        })
      : DEFAULT_STAGES;

  const totalStages = displayStages.length;

  // Determine initial active stage
  const nextStageIdx = displayStages.findIndex((s) => s.status === "next");
  const defaultCurrentStage = nextStageIdx >= 0 ? nextStageIdx + 1 : 1;

  const [currentStage, setCurrentStage] = useState<number>(defaultCurrentStage);
  const [stageFeedback, setStageFeedback] = useState<Record<number, string>>({
    1: "Strong domain depth and clear metrics structure. Recommended for next round.",
  });
  const [activeFeedbackStage, setActiveFeedbackStage] = useState<number>(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");
  const [isSuccessfulNotice, setIsSuccessfulNotice] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedStage = localStorage.getItem(`hk_stage_tracker_${activeInterview?.id || "default"}_current_stage`);
      if (savedStage) {
        const parsed = parseInt(savedStage, 10);
        if (parsed >= 1 && parsed <= totalStages) {
          setCurrentStage(parsed);
        }
      } else {
        setCurrentStage(defaultCurrentStage);
      }
      const savedFeedback = localStorage.getItem(`hk_stage_tracker_${activeInterview?.id || "default"}_feedback`);
      if (savedFeedback) {
        setStageFeedback(JSON.parse(savedFeedback));
      }
    } catch {}
  }, [activeInterview?.id, totalStages, defaultCurrentStage]);

  const handleMarkSuccessful = () => {
    if (currentStage < totalStages) {
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      try {
        localStorage.setItem(`hk_stage_tracker_${activeInterview?.id || "default"}_current_stage`, String(nextStage));
      } catch {}
      setIsSuccessfulNotice(true);
      setTimeout(() => setIsSuccessfulNotice(false), 3000);
    }
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedbackText.trim()) {
      setStageFeedback((prev) => {
        const updated = {
          ...prev,
          [activeFeedbackStage]: (prev[activeFeedbackStage] ? prev[activeFeedbackStage] + " | " : "") + newFeedbackText.trim(),
        };
        try {
          localStorage.setItem("hk_stage_tracker_feedback", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setNewFeedbackText("");
      setShowFeedbackModal(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between gap-5">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">
            Multi-stage interview tracker
          </h2>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
          </span>
        </div>
        <p className="mt-0.5 text-[13px] text-muted">
          Track progress, add feedback and update outcomes.
        </p>

        {isSuccessfulNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#10b981]/20 p-2.5 text-xs font-semibold text-[#10b981] animate-fade-in">
            <Icon name="check" size={14} strokeWidth={3} />
            <span>Stage marked as successful! Next stage is now active.</span>
          </div>
        )}

        {/* Target Role Card */}
        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#143029] text-[18px] font-bold text-[#34d399] shadow-sm">
              {displayCompanyInitial}
            </span>
            <div className="min-w-0 grow">
              <Link
                href={displayHref}
                className="block text-[14px] font-semibold text-ink hover:underline leading-snug truncate"
              >
                {displayRole}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span>{displayCompany}</span>
                <span>·</span>
                <span className="inline-flex items-center rounded-full bg-blue-fill/20 px-2 py-0.5 text-[10px] font-semibold text-blue-soft">
                  In progress
                </span>
              </div>
            </div>
          </div>
          <Icon name="chevronRight" size={16} className="text-muted shrink-0 rotate-90" />
        </div>

        {/* Stage Progress Bar */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">Stage {currentStage} of {totalStages}</span>
          <div className="flex items-center gap-1.5">
            {displayStages.map((s) => (
              <span
                key={s.num}
                className={clsx(
                  "h-1.5 w-7 rounded-full transition-colors duration-300",
                  s.num <= currentStage ? "bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/[0.12]"
                )}
              />
            ))}
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="mt-4 flex flex-col gap-1">
          {displayStages.map((s, idx) => {
            const isCompleted = s.num < currentStage || s.status === "completed";
            const isCurrent = s.num === currentStage && !isCompleted;
            const isLast = idx === displayStages.length - 1;

            if (isCurrent) {
              return (
                <div key={s.num} className="my-1">
                  <div className="rounded-[13px] p-3 transition-all duration-300 bg-[#1c2237] shadow-[0_0_20px_rgba(99,102,241,0.15),inset_0_0_0_1.5px_#6366f1]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#818cf8] bg-panel-2 mt-0.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#818cf8] opacity-60" />
                          <span className="relative h-2 w-2 rounded-full bg-[#818cf8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-ink">
                            {s.title}
                          </div>
                          <div className="text-xs font-medium text-[#818cf8]">
                            {s.upcomingText}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={displayHref}
                        className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] hover:bg-blue-hover active:scale-95 transition-all shrink-0"
                      >
                        <span className="relative z-10">Prepare</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            if (isCompleted) {
              return (
                <div key={s.num} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-[10px] font-bold text-[#0d1e18] shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <Icon name="check" size={11} strokeWidth={3} />
                    </div>
                    {!isLast && <div className="h-7 w-[2px] bg-[#10b981]" />}
                  </div>
                  <div className="-mt-0.5 flex min-w-0 grow items-center justify-between gap-2 pb-1.5">
                    <div>
                      <div className="text-[13px] font-semibold text-ink">
                        {s.title}
                      </div>
                      <div className="text-xs text-muted">
                        {s.defaultCompletedText}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-[#10b981]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#10b981]">
                        Successful
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFeedbackStage(s.num);
                          setShowFeedbackModal(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-[#282a38] transition-colors cursor-pointer"
                      >
                        <Icon name="chat" size={12} />
                        <span>Feedback</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Upcoming
            return (
              <div key={s.num} className="flex items-start gap-3 mt-1">
                <div className="flex flex-col items-center">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/[0.22] bg-transparent" />
                  {!isLast && <div className="h-7 w-[2px] bg-white/[0.12]" />}
                </div>
                <div className="-mt-0.5 min-w-0 grow pb-1.5">
                  <div className="text-[13px] font-medium text-muted">
                    {s.title}
                  </div>
                  <div className="text-xs text-dim">Not scheduled</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar: Add feedback | Mark successful | Mark unsuccessful */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/80 pt-4 text-xs">
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
        >
          <Icon name="edit" size={13} />
          <span>Add feedback</span>
        </button>

        <button
          type="button"
          onClick={handleMarkSuccessful}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[#10b981] hover:bg-[#10b981]/15 transition-colors cursor-pointer"
        >
          <Icon name="check" size={13} strokeWidth={2.4} />
          <span>Mark successful</span>
        </button>

        <button
          type="button"
          onClick={() => onArchiveRole?.("Unsuccessful after hiring manager review")}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-red-soft hover:bg-red-soft/15 transition-colors cursor-pointer"
        >
          <Icon name="x" size={13} strokeWidth={2.4} />
          <span>Mark unsuccessful</span>
        </button>
      </div>

      {/* Interactive Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex w-full max-w-[500px] flex-col rounded-[20px] border border-line bg-panel p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <Icon name="chat" size={18} className="text-blue-soft" />
                <h3 className="text-sm font-bold text-ink">Interview Feedback & Notes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div className="rounded-[12px] bg-panel-2 p-3 text-muted border border-line">
                <span className="font-semibold text-ink block mb-1">
                  Stage {activeFeedbackStage} Feedback & Notes:
                </span>
                {stageFeedback[activeFeedbackStage] || "No feedback recorded yet for this stage."}
              </div>

              <form onSubmit={handleAddFeedback} className="mt-2 flex flex-col gap-2.5">
                <label className="font-semibold text-ink">Add new interviewer feedback / notes:</label>
                <textarea
                  rows={3}
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  placeholder="e.g. Hiring manager liked checkout experience, asked for more depth on fraud metrics..."
                  className="w-full resize-y rounded-[10px] bg-panel-2 p-3 text-xs text-ink outline-none border border-line focus:border-blue-fill placeholder:text-dim"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-lg px-3 py-1.5 font-medium text-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-fill px-4 py-1.5 font-semibold text-white hover:bg-blue-hover transition-colors cursor-pointer"
                  >
                    Save feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
