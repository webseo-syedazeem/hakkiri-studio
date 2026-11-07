"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, Panel } from "@/components/ui";
import { UpcomingAgenda, type UpcomingEvent } from "./UpcomingAgenda";
import { StageTracker } from "./StageTracker";
import { ArchiveModal, type ArchivedItem } from "./ArchiveModal";

export function DashboardClientView({
  upcomingInterviewsCount,
  upcomingPresentationsCount,
  agendaEvents,
}: {
  upcomingInterviewsCount: number;
  upcomingPresentationsCount: number;
  agendaEvents: UpcomingEvent[];
}) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([
    {
      id: "archive-1",
      role: "Lead Product Manager",
      company: "Stripe",
      outcome: "Unsuccessful",
      stageReached: "Stage 3 · Case interview",
      date: "28 Oct",
      feedbackNotes:
        "Strong product vision and API depth. Interviewers recommended deepening operational risk and ledger scale experience.",
    },
    {
      id: "archive-2",
      role: "Group PM, Growth & Retention",
      company: "Monzo",
      outcome: "Unsuccessful",
      stageReached: "Stage 2 · Hiring manager",
      date: "14 Oct",
      feedbackNotes:
        "Impressive storytelling and structure. Team decided to proceed with an internal candidate.",
    },
  ]);
  const [isHaldenArchived, setIsHaldenArchived] = useState(false);
  const [archiveToast, setArchiveToast] = useState<string | null>(null);

  const handleArchiveHalden = (reason: string) => {
    setIsHaldenArchived(true);
    const newArchived: ArchivedItem = {
      id: `halden-archived-${Date.now()}`,
      role: "Senior Product Manager, Payments",
      company: "Halden",
      outcome: "Unsuccessful",
      stageReached: "Stage 2 · Hiring manager",
      date: "Today",
      feedbackNotes:
        reason ||
        "Candidate completed recruiter screen with strong marks. Hiring manager round outcome marked unsuccessful.",
    };
    setArchivedItems((prev) => [newArchived, ...prev]);
    setArchiveToast("Interview moved to Archive (Past interviews & outcomes).");
    setTimeout(() => setArchiveToast(null), 4000);
  };

  const handleRestore = (id: string) => {
    setArchivedItems((prev) => prev.filter((item) => item.id !== id));
    if (id.includes("halden")) {
      setIsHaldenArchived(false);
    }
  };

  return (
    <>
      {archiveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-line bg-panel p-4 text-xs font-semibold text-ink shadow-2xl animate-rise">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2238] text-blue-soft">
            <Icon name="archive" size={15} />
          </div>
          <span>{archiveToast}</span>
          <button
            type="button"
            onClick={() => setIsArchiveOpen(true)}
            className="text-blue-soft hover:underline cursor-pointer ml-1"
          >
            Open Archive
          </button>
        </div>
      )}

      {/* Top Metrics Row (4 Cards Matching Mockup Exactly) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Upcoming interviews */}
        <Link
          href="/interviews"
          className="group relative overflow-hidden flex animate-rise items-center justify-between rounded-[20px] bg-panel p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(129,140,248,0.2)]"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#818cf8]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#818cf8]/20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#1a2238] text-[#818cf8] shadow-[0_0_20px_rgba(129,140,248,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Icon name="cal" size={24} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted">Upcoming interviews</div>
              <div className="mt-0.5 text-[30px] font-bold leading-none text-ink transition-transform duration-200 group-hover:scale-105 origin-left">
                {upcomingInterviewsCount}
              </div>
            </div>
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0"
          />
        </Link>

        {/* Card 2: Upcoming presentations */}
        <Link
          href="/presentations"
          className="group relative overflow-hidden flex animate-rise items-center justify-between rounded-[20px] bg-panel p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(52,211,153,0.2)]"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#34d399]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#34d399]/20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#142825] text-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Icon name="present" size={24} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted">Upcoming presentations</div>
              <div className="mt-0.5 text-[30px] font-bold leading-none text-ink transition-transform duration-200 group-hover:scale-105 origin-left">
                {upcomingPresentationsCount}
              </div>
            </div>
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0"
          />
        </Link>

        {/* Card 3: Practice sessions completed */}
        <Link
          href="/interviews"
          className="group relative overflow-hidden flex animate-rise items-center justify-between rounded-[20px] bg-panel p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(192,132,252,0.2)] cursor-pointer"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c084fc]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#c084fc]/20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#221c38] text-[#c084fc] shadow-[0_0_20px_rgba(192,132,252,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Icon name="zap" size={24} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted">Practice sessions completed</div>
              <div className="mt-0.5 flex items-baseline gap-2 leading-none">
                <span className="text-[30px] font-bold text-ink transition-transform duration-200 group-hover:scale-105 origin-left">
                  4
                </span>
                <span className="text-sm font-normal text-muted">this week</span>
              </div>
            </div>
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0"
          />
        </Link>

        {/* Card 4: Archive (Past interviews & outcomes) */}
        <button
          type="button"
          onClick={() => setIsArchiveOpen(true)}
          className="group relative overflow-hidden flex animate-rise items-center justify-between rounded-[20px] bg-panel p-5 text-left shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(129,140,248,0.25)] cursor-pointer"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#818cf8]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#818cf8]/20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#1a2238] text-[#818cf8] shadow-[0_0_20px_rgba(129,140,248,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Icon name="archive" size={24} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-ink">Archive</div>
              <div className="mt-0.5 text-xs text-muted">Past interviews & outcomes</div>
            </div>
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className="relative z-10 text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-ink shrink-0"
          />
        </button>
      </div>

      {/* Main 3-Column Content Layout (Fills Full Viewport Width) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {/* Column 1: Upcoming Agenda */}
        <Panel
          className="flex animate-rise flex-col justify-between rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
          style={{ animationDelay: "0.3s" }}
        >
          <UpcomingAgenda events={agendaEvents} />
        </Panel>

        {/* Column 2: Multi-stage interview tracker */}
        <Panel
          className="flex animate-rise flex-col justify-between rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
          style={{ animationDelay: "0.35s" }}
        >
          {isHaldenArchived ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2 text-muted shadow-inner mb-3">
                <Icon name="archive" size={26} />
              </div>
              <h3 className="text-base font-bold text-ink">Interview Archived</h3>
              <p className="mt-1 text-xs text-muted max-w-[280px]">
                The Halden role has been moved to Archive under Past interviews & outcomes.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsHaldenArchived(false)}
                  className="rounded-xl bg-panel-2 px-4 py-2 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] cursor-pointer transition-colors"
                >
                  Restore to active
                </button>
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen(true)}
                  className="rounded-xl bg-blue-fill px-4 py-2 text-xs font-semibold text-white hover:bg-blue-hover cursor-pointer transition-colors"
                >
                  View in Archive
                </button>
              </div>
            </div>
          ) : (
            <StageTracker onArchiveRole={handleArchiveHalden} />
          )}
        </Panel>

        {/* Column 3: Stacked Cards */}
        <div
          className="flex animate-rise flex-col gap-5"
          style={{ animationDelay: "0.4s" }}
        >
          {/* Upper Card: Continue practising */}
          <Panel className="rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">
              Continue practising
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Pick up where you left off and build confidence.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {/* Item 1: Technical drill */}
              <div className="group/row flex items-center justify-between gap-3.5 rounded-[14px] p-2 transition-all duration-200 hover:bg-panel-2/60 hover:translate-x-1">
                <Link
                  href="/interviews/halden"
                  className="flex items-center gap-3.5 min-w-0 grow group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1c2338] text-[#93c5fd] shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Icon name="code" size={20} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                      Technical drill
                    </div>
                    <div className="truncate text-xs text-muted mt-0.5">
                      8 min · Last practised yesterday
                    </div>
                    <span className="mt-1 inline-block rounded bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                      Technical
                    </span>
                  </div>
                </Link>
                <Link
                  href="/interviews/halden"
                  className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] transition-all duration-200 hover:bg-blue-hover hover:shadow-[0_0_20px_rgba(90,105,255,0.6)] active:scale-95 shrink-0"
                >
                  <span className="relative z-10">Resume</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                </Link>
              </div>

              {/* Item 2: Motivation answers */}
              <div className="group/row flex items-center justify-between gap-3.5 rounded-[14px] p-2 transition-all duration-200 hover:bg-panel-2/60 hover:translate-x-1">
                <Link
                  href="/interviews/halden"
                  className="flex items-center gap-3.5 min-w-0 grow group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#241e38] text-[#c084fc] shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Icon name="users" size={20} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                      Motivation answers
                    </div>
                    <div className="truncate text-xs text-muted mt-0.5">
                      6 min · Improve structure
                    </div>
                    <span className="mt-1 inline-block rounded bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                      Structure
                    </span>
                  </div>
                </Link>
                <Link
                  href="/interviews/halden"
                  className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] transition-all duration-200 hover:bg-blue-hover hover:shadow-[0_0_20px_rgba(90,105,255,0.6)] active:scale-95 shrink-0"
                >
                  <span className="relative z-10">Practise</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                </Link>
              </div>

              {/* Item 3: Re-run slide 4 */}
              <div className="group/row flex items-center justify-between gap-3.5 rounded-[14px] p-2 transition-all duration-200 hover:bg-panel-2/60 hover:translate-x-1">
                <Link
                  href="/presentations/q1-roadmap"
                  className="flex items-center gap-3.5 min-w-0 grow group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#142825] text-[#34d399] shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Icon name="present" size={20} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                      Re-run slide 4
                    </div>
                    <div className="truncate text-xs text-muted mt-0.5">
                      3 min · Timing needs work
                    </div>
                    <span className="mt-1 inline-block rounded bg-panel-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                      Timing
                    </span>
                  </div>
                </Link>
                <Link
                  href="/presentations/q1-roadmap"
                  className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] transition-all duration-200 hover:bg-blue-hover hover:shadow-[0_0_20px_rgba(90,105,255,0.6)] active:scale-95 shrink-0"
                >
                  <span className="relative z-10">Practise</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                </Link>
              </div>
            </div>
          </Panel>

          {/* Lower Card: Recent practice */}
          <Panel className="rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">
              Recent practice
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Your completed practice sessions.
            </p>

            <div className="mt-3.5 flex flex-col divide-y divide-white/[0.06]">
              {/* Recent 1 */}
              <Link
                href="/interviews/halden"
                className="flex items-center justify-between py-3 px-2.5 -mx-2.5 rounded-xl transition-all duration-200 hover:bg-panel-2/80 hover:translate-x-1.5 group"
              >
                <div className="min-w-0 grow">
                  <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                    Technical questions
                  </div>
                  <div className="truncate text-xs text-muted mt-0.5">Halden</div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs text-muted">Yesterday, 11:05</span>
                  <span className="inline-flex items-center rounded-full bg-[#1e2544] px-2.5 py-0.5 text-[11px] font-semibold text-[#818cf8] shadow-sm">
                    Interview
                  </span>
                </div>
              </Link>

              {/* Recent 2 */}
              <Link
                href="/presentations/q1-roadmap"
                className="flex items-center justify-between py-3 px-2.5 -mx-2.5 rounded-xl transition-all duration-200 hover:bg-panel-2/80 hover:translate-x-1.5 group"
              >
                <div className="min-w-0 grow">
                  <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                    Q&A rehearsal
                  </div>
                  <div className="truncate text-xs text-muted mt-0.5">Q1 roadmap</div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs text-muted">Wed 5 Nov, 16:20</span>
                  <span className="inline-flex items-center rounded-full bg-[#162a26] px-2.5 py-0.5 text-[11px] font-semibold text-[#34d399] shadow-sm">
                    Presentation
                  </span>
                </div>
              </Link>

              {/* Recent 3 */}
              <Link
                href="/interviews/halden"
                className="flex items-center justify-between py-3 px-2.5 -mx-2.5 rounded-xl transition-all duration-200 hover:bg-panel-2/80 hover:translate-x-1.5 group"
              >
                <div className="min-w-0 grow">
                  <div className="text-[14px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                    Behavioural practice
                  </div>
                  <div className="truncate text-xs text-muted mt-0.5">Halden</div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs text-muted">Tue 4 Nov, 10:10</span>
                  <span className="inline-flex items-center rounded-full bg-[#1e2544] px-2.5 py-0.5 text-[11px] font-semibold text-[#818cf8] shadow-sm">
                    Interview
                  </span>
                </div>
              </Link>
            </div>
          </Panel>
        </div>
      </div>

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archivedItems={archivedItems}
        onRestore={handleRestore}
      />
    </>
  );
}
