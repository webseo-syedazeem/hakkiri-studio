"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";
import { useDialogFocus } from "@/components/ui/useDialogFocus";

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
  outcome?: string;
}

/** The stage the person is on (1-based): the one marked "next", else the first that isn't completed, else the last. */
export function currentStageOf(stages: StageTrackerStage[]): number {
  if (!stages.length) return 0;
  const next = stages.findIndex((s) => s.status === "next");
  if (next >= 0) return next + 1;
  const open = stages.findIndex((s) => s.status !== "completed");
  return open >= 0 ? open + 1 : stages.length;
}

/** The stages after stage `current` (1-based) went well: it and those before it are completed, the one after is next. */
export function advanceStages(stages: StageTrackerStage[], current: number): StageTrackerStage[] {
  return stages.map((s, i) => ({ ...s, status: i < current ? "completed" : i === current ? "next" : "upcoming" }));
}

/** A stage as the interview update route accepts it: its own fields only, each within the route's limits. */
function stageForSave(s: StageTrackerStage) {
  const clip = (v: string | undefined, max: number) => (v ? v.slice(0, max) : undefined);
  return { id: clip(s.id, 60), name: (s.name || "Stage").slice(0, 120), date: clip(s.date, 40), time: clip(s.time, 20), format: clip(s.format, 60), interviewer: clip(s.interviewer, 120), status: clip(s.status, 40) };
}

function formatStageDateText(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return "";
  if (/^\d{1,2}\s+[A-Za-z]{3}/.test(dateStr)) {
    return timeStr ? `${dateStr}, ${timeStr}` : dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const timePart = timeStr || (dateStr.includes("T") ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "");
      return timePart ? `${datePart}, ${timePart}` : datePart;
    }
  } catch {}
  return dateStr;
}

/** What the tracker hands over when the person records that an application ended: all of it their own. */
export interface ArchiveRequest {
  interviewId: string;
  role: string;
  company: string;
  stageReached: string;
  /** The person's own note on the stage they reached, if they wrote one. */
  notes: string;
  outcome?: "Offer" | "Unsuccessful" | "Withdrew";
}

export function StageTracker({
  interview,
  availableInterviews = [],
  onArchiveRole,
}: {
  interview?: StageTrackerInterview | null;
  availableInterviews?: StageTrackerInterview[];
  onArchiveRole?: (ended: ArchiveRequest) => void;
}) {
  const [interviewsList, setInterviewsList] = useState<StageTrackerInterview[]>(availableInterviews);
  const [activeInterview, setActiveInterview] = useState<StageTrackerInterview | null>(() => availableInterviews.find((i) => i.id === interview?.id) ?? availableInterviews[0] ?? null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // The interviews offered are the ones the server lists for this account. The browser only remembers which
  // one was last looked at.
  useEffect(() => {
    setInterviewsList(availableInterviews);
    let wanted: string | null = null;
    try {
      wanted = localStorage.getItem("hk_active_stage_tracker_id");
    } catch {}
    setActiveInterview((current) => availableInterviews.find((i) => i.id === (current?.id ?? wanted)) ?? availableInterviews.find((i) => i.id === wanted) ?? availableInterviews.find((i) => i.id === interview?.id) ?? availableInterviews[0] ?? null);
  }, [interview, availableInterviews]);

  const totalStages = activeInterview?.stages?.length ?? 0;

  // The stages are the interview's own, as the person entered them. An interview without any shows none:
  // no stage, date or outcome is supplied for it.
  const displayStages: StageInfo[] = (activeInterview?.stages ?? []).map((st, idx) => {
    const num = idx + 1;
    const name = st.name || `Stage ${num}`;
    const dt = formatStageDateText(st.date, st.time);
    return {
      num,
      title: `Stage ${num} · ${name}`,
      defaultCompletedText: dt ? `Completed · ${dt}` : "Completed",
      upcomingText: dt ? `Upcoming · ${dt}` : "No date set",
      status: st.status,
    };
  });

  // Where the person has got to: the stage marked "next", or the first one that isn't completed.
  const currentStage = currentStageOf(activeInterview?.stages ?? []);

  const [stageFeedback, setStageFeedback] = useState<Record<number, string>>({});
  const [activeFeedbackStage, setActiveFeedbackStage] = useState<number>(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");
  const [isSuccessfulNotice, setIsSuccessfulNotice] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const notesKey = activeInterview ? `hk_stage_tracker_${activeInterview.id}_feedback` : null;
  const notesBox = useDialogFocus<HTMLDivElement>(showFeedbackModal);

  // The person's own notes on each stage of this interview, kept in this browser.
  useEffect(() => {
    setStageFeedback({});
    setSaveError(null);
    setConfirmEnd(false);
    if (!notesKey) return;
    try {
      const saved = localStorage.getItem(notesKey);
      const parsed = saved ? (JSON.parse(saved) as unknown) : null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setStageFeedback(parsed as Record<number, string>);
    } catch {}
  }, [notesKey]);

  const handleSelectInterview = (iv: StageTrackerInterview) => {
    setActiveInterview(iv);
    setIsDropdownOpen(false);
    try {
      localStorage.setItem("hk_active_stage_tracker_id", iv.id);
    } catch {}
  };

  /** Marks the current stage as completed and the one after it as next, and saves that to the interview. */
  const handleMarkSuccessful = async () => {
    if (!activeInterview?.stages || saving) return;
    const isOffer = currentStage >= totalStages;
    const before = activeInterview;
    const stages = advanceStages(activeInterview.stages, currentStage);
    const updated = { ...activeInterview, stages, outcome: isOffer ? "Offer" : activeInterview.outcome };
    setSaving(true);
    setSaveError(null);
    setActiveInterview(updated);
    setInterviewsList((list) => list.map((it) => (it.id === updated.id ? updated : it)));
    try {
      const payload: Record<string, unknown> = { stages: stages.map(stageForSave) };
      if (isOffer) {
        payload.outcome = "Offer";
      }
      const res = await fetch(`/api/interviews/${updated.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      setIsSuccessfulNotice(true);
      setTimeout(() => setIsSuccessfulNotice(false), 3000);
      if (isOffer && onArchiveRole) {
        onArchiveRole({ interviewId: activeInterview.id, role: activeInterview.role, company: activeInterview.company, stageReached: displayStages[currentStage - 1]?.title ?? "", notes: stageFeedback[currentStage] ?? "", outcome: "Offer" });
      }
    } catch {
      // Not saved: the tracker goes back to how it was, and says so.
      setActiveInterview(before);
      setInterviewsList((list) => list.map((it) => (it.id === before.id ? before : it)));
      setSaveError("That couldn’t be saved, so the stage hasn’t changed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newFeedbackText.trim();
    if (!text || !notesKey) return;
    const updated = { ...stageFeedback, [activeFeedbackStage]: stageFeedback[activeFeedbackStage] ? `${stageFeedback[activeFeedbackStage]} | ${text}` : text };
    setStageFeedback(updated);
    try {
      localStorage.setItem(notesKey, JSON.stringify(updated));
    } catch {}
    setNewFeedbackText("");
    setShowFeedbackModal(false);
  };

  if (!activeInterview) {
    return (
      <div className="flex h-full flex-col gap-3" data-testid="tracker-empty">
        <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">Multi-stage interview tracker</h2>
        <p className="text-[13px] text-muted">You haven’t set up an interview yet. When you do, its stages show here so you can follow where you’ve got to.</p>
        <Link href="/interviews/new" className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-fill px-4 py-2 text-xs font-semibold text-white hover:bg-blue-hover transition-colors">
          Set up an interview
        </Link>
      </div>
    );
  }

  const displayRole = activeInterview.role || "Role not given";
  const displayCompany = activeInterview.company || "Company not given";
  const displayCompanyInitial = activeInterview.companyInitial || (activeInterview.company ? activeInterview.company[0] : "?");
  const displayHref = `/interviews/${activeInterview.id}`;


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

        {/* Target Role Card with Interactive Dropdown */}
        <div className="relative mt-4">
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label={`Interview being tracked: ${displayRole}, ${displayCompany}. Choose another`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              } else if (e.key === "Escape") setIsDropdownOpen(false);
            }}
            className="flex items-center justify-between rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-panel cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-emerald-500/15 text-[18px] font-bold text-emerald-600 dark:text-[#34d399] shadow-sm">
                {displayCompanyInitial}
              </span>
              <div className="min-w-0 grow">
                <div className="block text-[14px] font-semibold text-ink group-hover:text-blue-soft transition-colors leading-snug truncate">
                  {displayRole}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span>{displayCompany}</span>
                  <span>·</span>
                  <span className="inline-flex items-center rounded-full bg-blue-fill/15 px-2 py-0.5 text-[10px] font-semibold text-blue-fill">
                    In progress
                  </span>
                </div>
              </div>
            </div>
            <span aria-hidden className="p-1 rounded-lg text-muted group-hover:text-ink transition-colors">
              <Icon name="chevronDown" size={16} className={clsx("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
            </span>
          </div>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-panel border border-line shadow-2xl overflow-hidden py-1.5 backdrop-blur-xl animate-dropdown divide-y divide-line">
                <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Switch multi-stage interview
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {interviewsList.map((iv) => {
                    const isSelected = iv.id === activeInterview?.id;
                    const stageCount = iv.stages?.length ?? 0;
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        onClick={() => handleSelectInterview(iv)}
                        className={clsx(
                          "w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors text-xs cursor-pointer",
                          isSelected
                            ? "bg-indigo-600/20 text-white font-semibold"
                            : "hover:bg-white/[0.08] text-[#c9cad4]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">
                            {iv.companyInitial || iv.company[0]}
                          </span>
                          <div className="min-w-0 truncate">
                            <div className="font-semibold text-white truncate">{iv.role}</div>
                            <div className="text-[11px] text-muted truncate">
                              {iv.company} · {stageCount} {stageCount === 1 ? "stage" : "stages"}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Icon name="check" size={14} className="text-indigo-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {totalStages === 0 ? (
          <p className="mt-4 rounded-[14px] bg-panel-2 p-4 text-xs text-muted" data-testid="tracker-no-stages">
            This interview has no stages yet. Add them from{" "}
            <Link href={displayHref} className="font-semibold text-blue-soft hover:underline">
              the interview’s workspace
            </Link>{" "}
            and they’ll show here.
          </p>
        ) : (
          <>
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
                  <div className="rounded-[13px] p-3 transition-all duration-300 bg-blue-fill/5 border border-blue-fill/30 shadow-sm dark:bg-[#1c2237] dark:shadow-[0_0_20px_rgba(99,102,241,0.15),inset_0_0_0_1.5px_#6366f1]">
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
          </>
        )}
      </div>

      {/* Add your own notes, move to the next stage, or record that it ended */}
      {totalStages > 0 && (
        <div className="border-t border-line/80 pt-4 text-xs">
          {saveError && (
            <p role="alert" className="mb-2 rounded-lg bg-red/10 px-3 py-2 text-red-soft">
              {saveError}
            </p>
          )}
          {confirmEnd ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-ink">Move this application to your archive?</span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => setConfirmEnd(false)} className="rounded-lg px-2.5 py-1.5 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmEnd(false);
                    onArchiveRole?.({ interviewId: activeInterview.id, role: activeInterview.role, company: activeInterview.company, stageReached: displayStages[currentStage - 1]?.title ?? "", notes: stageFeedback[currentStage] ?? "", outcome: "Unsuccessful" });
                  }}
                  className="rounded-lg bg-red/15 px-2.5 py-1.5 font-semibold text-red-soft hover:bg-red/25 transition-colors cursor-pointer"
                >
                  Not successful
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmEnd(false);
                    onArchiveRole?.({ interviewId: activeInterview.id, role: activeInterview.role, company: activeInterview.company, stageReached: displayStages[currentStage - 1]?.title ?? "", notes: stageFeedback[currentStage] ?? "", outcome: "Withdrew" });
                  }}
                  className="rounded-lg bg-white/10 px-2.5 py-1.5 font-semibold text-muted hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  Withdrew
                </button>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveFeedbackStage(currentStage);
                  setShowFeedbackModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
              >
                <Icon name="edit" size={13} />
                <span>Add a note</span>
              </button>

              <button
                type="button"
                onClick={() => void handleMarkSuccessful()}
                disabled={saving || (currentStage > totalStages && (activeInterview.stages ?? []).every(s => s.status === "completed"))}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[#34d399] hover:bg-[#10b981]/15 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="check" size={13} strokeWidth={2.4} />
                <span>{saving ? "Saving…" : currentStage >= totalStages ? "Mark as Offer" : "Mark successful"}</span>
              </button>

              <button type="button" onClick={() => setConfirmEnd(true)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-red-soft hover:bg-red-soft/15 transition-colors cursor-pointer">
                <Icon name="x" size={13} strokeWidth={2.4} />
                <span>End application</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowFeedbackModal(false)}>
          <div
            ref={notesBox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stage-notes-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && setShowFeedbackModal(false)}
            className="relative flex w-full max-w-[500px] flex-col rounded-[20px] border border-line bg-panel p-6 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <Icon name="chat" size={18} className="text-blue-soft" />
                <h3 id="stage-notes-title" className="text-sm font-bold text-ink">Your notes on this stage</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                aria-label="Close your notes"
                className="text-muted hover:text-ink cursor-pointer"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div className="rounded-[12px] bg-panel-2 p-3 text-muted border border-line">
                <span className="font-semibold text-ink block mb-1">
                  Stage {activeFeedbackStage}, your notes so far:
                </span>
                {stageFeedback[activeFeedbackStage] || "None yet. Notes are kept in this browser only."}
              </div>

              <form onSubmit={handleAddFeedback} className="mt-2 flex flex-col gap-2.5">
                <label htmlFor="stage-note" className="font-semibold text-ink">
                  Add a note: what they asked, what they said, what to prepare next
                </label>
                <textarea
                  id="stage-note"
                  data-autofocus
                  maxLength={2000}
                  rows={3}
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  placeholder="e.g. What they asked about, what went well, what to prepare for next time"
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
