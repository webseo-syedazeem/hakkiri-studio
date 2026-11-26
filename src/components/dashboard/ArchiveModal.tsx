"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui";
import { useDialogFocus } from "@/components/ui/useDialogFocus";

export interface ArchivedItem {
  id: string;
  /** The interview this entry was made from, when it came from the stage tracker. */
  interviewId?: string;
  role: string;
  company: string;
  outcome: "Unsuccessful" | "Offer declined" | "Withdrawn" | "Withdrew" | "Offer";
  stageReached: string;
  date: string;
  feedbackNotes: string;
}

export function ArchiveModal({
  isOpen,
  onClose,
  archivedItems,
  onRestore,
}: {
  isOpen: boolean;
  onClose: () => void;
  archivedItems: ArchivedItem[];
  onRestore?: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const box = useDialogFocus<HTMLDivElement>(isOpen && mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-title"
        className="relative my-auto flex w-full max-w-[620px] max-h-[88vh] flex-col rounded-[22px] border border-line bg-panel p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-[#1a2238] dark:text-blue-soft">
              <Icon name="archive" size={20} />
            </div>
            <div>
              <h2 id="archive-title" className="text-[18px] font-bold text-ink">Archive</h2>
              <p className="text-xs text-muted">Applications you marked as ended. Kept in this browser only.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the archive"
            className="rounded-lg p-2 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto pr-1">
          {archivedItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              Nothing archived yet. When you mark an application as unsuccessful in the stage tracker, it is listed here.
            </div>
          ) : (
            archivedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-[14px] bg-panel-2 p-4 shadow-[inset_0_0_0_1px_var(--color-line)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{item.role}</h3>
                    <p className="text-xs text-muted">{[item.company, item.stageReached ? `Reached: ${item.stageReached}` : ""].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="rounded-full bg-red-soft/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-soft">
                    {item.outcome}
                  </span>
                </div>
                <div className="rounded-lg bg-panel p-2.5 text-xs text-muted border border-line dark:bg-[#141620]">
                  <span className="font-medium text-ink">Your notes: </span>
                  {item.feedbackNotes || "None written."}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-dim">
                  <span>Archived on {item.date}</span>
                  {onRestore && (
                    <button
                      type="button"
                      onClick={() => onRestore(item.id)}
                      className="font-semibold text-blue-soft hover:underline cursor-pointer"
                    >
                      Take out of the archive
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-line pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[11px] bg-panel-2 border border-line-strong px-5 py-2 text-xs font-semibold text-ink hover:bg-panel transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
