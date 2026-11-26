"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Panel, type IconName } from "@/components/ui";
import { UpcomingAgenda, type UpcomingEvent } from "./UpcomingAgenda";
import { StageTracker, type ArchiveRequest, type StageTrackerInterview } from "./StageTracker";
import { ArchiveModal, type ArchivedItem } from "./ArchiveModal";
import { loadArchivedItems, saveArchivedItems } from "@/lib/interviews/archive-store";

/** One thing to carry on with: an interview's next step, or a presentation to rehearse. */
export interface HomeNextStep {
  id: string;
  kind: "interview" | "presentation";
  title: string;
  /** e.g. "Acme Payroll · Fix “tell me about yourself”" */
  subtitle: string;
  /** e.g. "Focused practice, 4 min" */
  chip: string;
  href: string;
  actionLabel: string;
}

export interface HomeRecentPractice {
  id: string;
  title: string;
  /** The interview it belongs to, e.g. "Data Analyst · Acme Payroll". */
  context: string;
  dateText: string;
  score: number | null;
  href: string;
}

const CARD = "group relative overflow-hidden flex animate-rise items-center justify-between rounded-[20px] bg-panel p-5 text-left shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7)] cursor-pointer";

function Metric({ icon, tint, label, value, note, delay }: { icon: IconName; tint: string; label: string; value: number; note?: string; delay: string }) {
  return (
    <>
      <div className="relative z-10 flex items-center gap-4" style={{ animationDelay: delay }}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${tint} transition-transform duration-300 group-hover:scale-110`}>
          <Icon name={icon} size={24} />
        </div>
        <div>
          <div className="text-[13px] font-medium text-muted">{label}</div>
          <div className="mt-0.5 flex items-baseline gap-2 leading-none">
            <span className="text-[30px] font-bold text-ink">{value}</span>
            {note ? <span className="text-sm font-normal text-muted">{note}</span> : null}
          </div>
        </div>
      </div>
      <Icon name="chevronRight" size={20} className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0" />
    </>
  );
}

/**
 * The home screen. Every count, date and row here is the signed-in person's
 * own, worked out on the server and passed in: their interviews and
 * presentations, their dated stages, their practice sessions. A new account
 * sees zeros and what to do first. Nothing is shown as an example of theirs.
 */
export function DashboardClientView({
  interviewsCount,
  presentationsCount,
  sessionsCount,
  agendaEvents,
  activeInterview,
  availableInterviews = [],
  nextSteps,
  example,
  recentPractices,
}: {
  interviewsCount: number;
  presentationsCount: number;
  sessionsCount: number;
  agendaEvents: UpcomingEvent[];
  activeInterview?: StageTrackerInterview | null;
  availableInterviews?: StageTrackerInterview[];
  nextSteps: HomeNextStep[];
  /** The built-in example interview, offered by name as an example when the person has nothing of their own. */
  example?: { href: string; label: string } | null;
  recentPractices: HomeRecentPractice[];
}) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [justArchived, setJustArchived] = useState<ArchivedItem | null>(null);

  // The archive is the person's own list of applications that ended, kept in this browser.
  useEffect(() => {
    const read = () => setArchivedItems(loadArchivedItems());
    read();
    window.addEventListener("hk_archive_updated", read);
    return () => window.removeEventListener("hk_archive_updated", read);
  }, []);

  /** The person recorded that an application ended. The archive entry holds only what they entered. */
  const handleArchive = (ended: ArchiveRequest) => {
    const outcome = ended.outcome || "Unsuccessful";
    const item: ArchivedItem = {
      id: `archived-${ended.interviewId}-${Date.now()}`,
      interviewId: ended.interviewId,
      role: ended.role,
      company: ended.company,
      outcome: outcome === "Offer" ? "Offer" : outcome === "Withdrew" ? "Withdrew" : "Unsuccessful",
      stageReached: ended.stageReached,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      feedbackNotes: ended.notes,
    };
    const updated = [item, ...archivedItems.filter((a) => a.interviewId !== ended.interviewId)];
    setArchivedItems(updated);
    saveArchivedItems(updated);
    setJustArchived(item);
    void fetch(`/api/interviews/${ended.interviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: outcome.toLowerCase(), archivedAt: new Date().toISOString() }),
    }).catch(() => {});
  };

  const handleRestore = (id: string) => {
    const updated = archivedItems.filter((item) => item.id !== id);
    setArchivedItems(updated);
    saveArchivedItems(updated);
    if (justArchived?.id === id) setJustArchived(null);
  };

  // An archived application is no longer tracked. The interview itself is untouched and still in Interviews.
  const archivedIds = new Set(archivedItems.map((a) => a.interviewId).filter(Boolean));
  const tracked = availableInterviews.filter((i) => !archivedIds.has(i.id));
  const trackedActive = activeInterview && !archivedIds.has(activeInterview.id) ? activeInterview : (tracked[0] ?? null);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="home-metrics">
        <Link href="/interviews" className={CARD} style={{ animationDelay: "0.1s" }} data-testid="home-interviews">
          <Metric icon="cal" tint="bg-blue-500/10 text-blue-600 dark:bg-[#1a2238] dark:text-[#a5b4fc]" label="Your interviews" value={interviewsCount} delay="0.1s" />
        </Link>
        <Link href="/presentations" className={CARD} style={{ animationDelay: "0.15s" }} data-testid="home-presentations">
          <Metric icon="present" tint="bg-emerald-500/10 text-emerald-600 dark:bg-[#142825] dark:text-[#6ee7b7]" label="Your presentations" value={presentationsCount} delay="0.15s" />
        </Link>
        <Link href="/interviews" className={CARD} style={{ animationDelay: "0.2s" }} data-testid="home-sessions">
          <Metric icon="zap" tint="bg-purple-500/10 text-purple-600 dark:bg-[#221c38] dark:text-[#d8b4fe]" label="Practice sessions completed" value={sessionsCount} note="in all" delay="0.2s" />
        </Link>
        <button type="button" onClick={() => setIsArchiveOpen(true)} className={CARD} style={{ animationDelay: "0.25s" }} data-testid="home-archive">
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600 dark:bg-[#1a2238] dark:text-[#a5b4fc] transition-transform duration-300 group-hover:scale-110">
              <Icon name="archive" size={24} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-ink">Archive</div>
              <div className="mt-0.5 text-xs text-muted">{archivedItems.length === 0 ? "Nothing archived" : `${archivedItems.length} past application${archivedItems.length === 1 ? "" : "s"}`}</div>
            </div>
          </div>
          <Icon name="chevronRight" size={20} className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0" />
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <Panel className="flex animate-rise flex-col justify-between rounded-[22px] p-6" style={{ animationDelay: "0.3s" }}>
          <UpcomingAgenda events={agendaEvents} />
        </Panel>

        <Panel className="flex animate-rise flex-col justify-between rounded-[22px] p-6" style={{ animationDelay: "0.35s" }}>
          {justArchived && (
            <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-panel-2 px-3.5 py-3 text-xs text-ink">
              <span>
                {justArchived.role}
                {justArchived.company ? ` at ${justArchived.company}` : ""} moved to your archive.
              </span>
              <button type="button" onClick={() => handleRestore(justArchived.id)} className="font-semibold text-blue-soft hover:underline cursor-pointer">
                Undo
              </button>
            </div>
          )}
          <StageTracker interview={trackedActive} availableInterviews={tracked} onArchiveRole={handleArchive} />
        </Panel>

        <div className="flex animate-rise flex-col gap-5" style={{ animationDelay: "0.4s" }}>
          <Panel className="rounded-[22px] p-6" data-testid="home-next-steps">
            <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">Continue practising</h2>
            <p className="mt-0.5 text-[13px] text-muted">The next step for each of your interviews and presentations.</p>

            {nextSteps.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-3">
                {nextSteps.map((step) => (
                  <li key={`${step.kind}-${step.id}`} className="flex items-center justify-between gap-3.5 rounded-[14px] p-2 transition-colors duration-200 hover:bg-panel-2/60">
                    <div className="flex items-center gap-3.5 min-w-0 grow">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${step.kind === "interview" ? "bg-blue-500/10 text-blue-600 dark:bg-[#1c2338] dark:text-[#93c5fd]" : "bg-emerald-500/10 text-emerald-600 dark:bg-[#142825] dark:text-[#6ee7b7]"}`}>
                        <Icon name={step.kind === "interview" ? "chat" : "present"} size={20} />
                      </div>
                      <div className="min-w-0 grow">
                        <div className="text-[14px] font-semibold text-ink leading-snug truncate">{step.title}</div>
                        <div className="truncate text-xs text-muted mt-0.5">{step.subtitle}</div>
                        {step.chip ? <span className="mt-1 inline-block rounded bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted">{step.chip}</span> : null}
                      </div>
                    </div>
                    <Link href={step.href} aria-label={`${step.actionLabel}: ${step.title}`} className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-blue-fill px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-blue-hover">
                      {step.actionLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-[14px] bg-panel-2 p-4 text-xs text-muted" data-testid="home-no-next-steps">
                <p className="font-semibold text-ink">Nothing to continue yet</p>
                <p className="mt-1">Set up an interview with your CV and the job, and your next step will show here.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/interviews/new" className="inline-flex items-center rounded-[10px] bg-blue-fill px-4 py-2 font-semibold text-white hover:bg-blue-hover transition-colors">
                    Set up an interview
                  </Link>
                  {example ? (
                    <Link href={example.href} className="inline-flex items-center rounded-[10px] px-4 py-2 font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-panel transition-colors">
                      {example.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </Panel>

          <Panel className="rounded-[22px] p-6" data-testid="home-recent">
            <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">Recent practice</h2>
            <p className="mt-0.5 text-[13px] text-muted">Your completed practice sessions.</p>

            {recentPractices.length > 0 ? (
              <ul className="mt-3.5 flex flex-col divide-y divide-white/[0.06]">
                {recentPractices.map((rp) => (
                  <li key={rp.id}>
                    <Link href={rp.href} className="flex items-center justify-between py-3 px-2.5 -mx-2.5 rounded-xl transition-colors duration-200 hover:bg-panel-2/80 group">
                      <div className="min-w-0 grow">
                        <div className="text-[14px] font-semibold text-ink group-hover:underline leading-snug truncate">{rp.title}</div>
                        <div className="truncate text-xs text-muted mt-0.5">{rp.context}</div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs text-muted">{rp.dateText}</span>
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-[#1e2544] px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-[#c7d2fe]">{rp.score != null ? `${rp.score.toFixed(1)} / 5` : "Not scored"}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 py-8 text-center text-xs text-muted" data-testid="home-no-recent">
                <div className="flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-white/[0.04] text-muted border border-white/10 mb-2">
                  <Icon name="play" size={13} />
                </div>
                <p className="font-semibold text-ink">No practice sessions yet</p>
                <p className="mt-1 max-w-[240px] mx-auto">Completed practice sessions and their scores will appear here after your first one.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} archivedItems={archivedItems} onRestore={handleRestore} />
    </>
  );
}
