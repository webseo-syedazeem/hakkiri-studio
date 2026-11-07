"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

export function StageTracker({
  onArchiveRole,
}: {
  onArchiveRole?: (reason: string) => void;
}) {
  const [currentStage, setCurrentStage] = useState<number>(2);
  const [stage1Feedback, setStage1Feedback] = useState<string>(
    "Priya showed very strong domain depth in payments checkout flows. Clear structure on metric ownership. Advanced to hiring manager round with Sam."
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");
  const [isSuccessfulNotice, setIsSuccessfulNotice] = useState<boolean>(false);

  const handleMarkSuccessful = () => {
    if (currentStage < 4) {
      setCurrentStage((prev) => prev + 1);
      setIsSuccessfulNotice(true);
      setTimeout(() => setIsSuccessfulNotice(false), 3000);
    }
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedbackText.trim()) {
      setStage1Feedback((prev) => prev + " | " + newFeedbackText.trim());
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
              H
            </span>
            <div className="min-w-0 grow">
              <Link
                href="/interviews/halden"
                className="block text-[14px] font-semibold text-ink hover:underline leading-snug truncate"
              >
                Senior Product Manager, Payments
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span>Halden</span>
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
          <span className="font-semibold text-ink">Stage {currentStage} of 4</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-7 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span
              className={clsx(
                "h-1.5 w-7 rounded-full transition-colors duration-300",
                currentStage >= 2 ? "bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/[0.12]"
              )}
            />
            <span
              className={clsx(
                "h-1.5 w-7 rounded-full transition-colors duration-300",
                currentStage >= 3 ? "bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/[0.12]"
              )}
            />
            <span
              className={clsx(
                "h-1.5 w-7 rounded-full transition-colors duration-300",
                currentStage >= 4 ? "bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/[0.12]"
              )}
            />
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="mt-4 flex flex-col">
          {/* Stage 1 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-[10px] font-bold text-[#0d1e18] shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Icon name="check" size={11} strokeWidth={3} />
              </div>
              <div className="h-7 w-[2px] bg-[#10b981]" />
            </div>
            <div className="-mt-0.5 flex min-w-0 grow items-center justify-between gap-2 pb-1.5">
              <div>
                <div className="text-[13px] font-semibold text-ink">
                  Stage 1 · Recruiter screen
                </div>
                <div className="text-xs text-muted">Completed · 4 Nov</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-[#10b981]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#10b981]">
                  Successful
                </span>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex items-center gap-1 rounded-lg bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted hover:text-ink hover:bg-[#282a38] transition-colors cursor-pointer"
                >
                  <Icon name="chat" size={12} />
                  <span>Feedback</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stage 2 (Current) */}
          <div
            className={clsx(
              "my-1 rounded-[13px] p-3 transition-all duration-300",
              currentStage === 2
                ? "bg-[#1c2237] shadow-[0_0_20px_rgba(99,102,241,0.15),inset_0_0_0_1.5px_#6366f1]"
                : "bg-panel-2 shadow-[inset_0_0_0_1px_var(--color-line)]"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#818cf8] bg-panel-2 mt-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#818cf8] opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-[#818cf8]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-ink">
                    Stage 2 · Hiring manager
                  </div>
                  <div className="text-xs font-medium text-[#818cf8]">
                    Upcoming · 12 Nov, 10:00
                  </div>
                </div>
              </div>
              <Link
                href="/interviews/halden"
                className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] hover:bg-blue-hover active:scale-95 transition-all shrink-0"
              >
                <span className="relative z-10">Prepare</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              </Link>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="flex items-start gap-3 mt-1">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-transparent",
                  currentStage >= 3 ? "border-[#818cf8]" : "border-white/[0.22]"
                )}
              />
              <div className="h-7 w-[2px] bg-white/[0.12]" />
            </div>
            <div className="-mt-0.5 min-w-0 grow pb-1.5">
              <div className="text-[13px] font-medium text-muted">
                Stage 3 · Case interview
              </div>
              <div className="text-xs text-dim">Not scheduled</div>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-transparent",
                  currentStage >= 4 ? "border-[#818cf8]" : "border-white/[0.22]"
                )}
              />
            </div>
            <div className="-mt-0.5 min-w-0 grow">
              <div className="text-[13px] font-medium text-muted">
                Stage 4 · Final panel
              </div>
              <div className="text-xs text-dim">Not scheduled</div>
            </div>
          </div>
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
                <span className="font-semibold text-ink block mb-1">Recruiter Screen Feedback (4 Nov):</span>
                {stage1Feedback}
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
