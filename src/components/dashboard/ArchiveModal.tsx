"use client";

import { Icon } from "@/components/ui";

export interface ArchivedItem {
  id: string;
  role: string;
  company: string;
  outcome: "Unsuccessful" | "Offer declined" | "Withdrawn";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex w-full max-w-[620px] flex-col rounded-[22px] border border-line bg-panel p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1a2238] text-blue-soft">
              <Icon name="archive" size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-ink">Archive</h2>
              <p className="text-xs text-muted">Past and unsuccessful interviews & outcomes.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
          {archivedItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              No archived interviews yet. Unsuccessful or completed interviews will be stored here.
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
                    <p className="text-xs text-muted">{item.company} · Reached: {item.stageReached}</p>
                  </div>
                  <span className="rounded-full bg-red-soft/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-soft">
                    {item.outcome}
                  </span>
                </div>
                <div className="rounded-lg bg-[#141620] p-2.5 text-xs text-muted border border-line/60">
                  <span className="font-medium text-ink">Feedback & Notes: </span>
                  {item.feedbackNotes}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-dim">
                  <span>Archived on {item.date}</span>
                  {onRestore && (
                    <button
                      type="button"
                      onClick={() => onRestore(item.id)}
                      className="font-semibold text-blue-soft hover:underline cursor-pointer"
                    >
                      Restore to active
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[11px] bg-panel-2 px-5 py-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
