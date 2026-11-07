import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon, Panel } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { listInterviews } from "@/lib/interviews/store";
import { listPresentations } from "@/lib/pitch/store";
import { longDay } from "@/lib/format";
import { UpcomingAgenda, type UpcomingEvent } from "@/components/dashboard/UpcomingAgenda";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jar = await cookies();
  // First visit: start at the welcome screen.
  if (!jar.get("hk_welcomed")) redirect("/welcome");

  const interviews = listInterviews(londonToday());
  const presentations = listPresentations();

  // Upcoming items for the agenda (3 rich sessions filling the agenda seamlessly)
  const agendaEvents: UpcomingEvent[] = [
    {
      id: "interview-halden",
      type: "interview",
      dateGroup: "Thu 12 Nov",
      time: "10:00",
      title: "Senior Product Manager, Payments",
      subtitle: "Halden · Hiring Manager Round",
      relative: "in 5 days",
      href: "/interviews/halden",
      actionLabel: "Prepare",
    },
    {
      id: "presentation-q1",
      type: "presentation",
      dateGroup: "Fri 13 Nov",
      time: "09:30",
      title: "Q1 roadmap",
      subtitle: "Leadership team · Rehearsal run",
      relative: "in 6 days",
      href: "/presentations/q1-roadmap",
      actionLabel: "Rehearse",
    },
    {
      id: "interview-case-halden",
      type: "interview",
      dateGroup: "Mon 16 Nov",
      time: "14:00",
      title: "Case Interview & Metrics Drill",
      subtitle: "Halden · Stage 3 Prep",
      relative: "in 9 days",
      href: "/interviews/halden",
      actionLabel: "Prepare",
    },
  ];

  // If the user has other custom interviews, prepend them
  for (const iv of interviews) {
    if (iv.id !== "halden" && iv.date) {
      agendaEvents.unshift({
        id: iv.id,
        type: "interview",
        dateGroup: iv.date.slice(0, 10),
        time: iv.date.includes("T") ? iv.date.slice(11, 16) : "10:00",
        title: iv.role,
        subtitle: iv.company,
        relative: "upcoming",
        href: `/interviews/${iv.id}`,
        actionLabel: "Prepare",
      });
    }
  }

  const upcomingInterviewsCount = Math.max(1, interviews.length);
  const upcomingPresentationsCount = Math.max(1, presentations.length);

  return (
    <div className="flex w-full grow flex-col gap-6">
      {/* Top Header */}
      <header className="flex animate-rise items-end justify-between gap-6" style={{ animationDelay: "0.05s" }}>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted">
            <Icon name="cal" size={14} className="text-blue-soft" />
            <span>{longDay(`${londonToday()}T12:00:00Z`)}</span>
          </div>
          <h1 className="mt-1 text-[28px] font-bold tracking-[-0.025em] text-ink sm:text-[34px]">
            You have 3 things coming up this week.
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/interviews/new"
            className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 px-4 py-2 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            <span>New interview</span>
          </Link>
          <Link
            href="/presentations/new"
            className="group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 px-4 py-2 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all duration-300 hover:bg-[#2b2d38] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            <span>New presentation</span>
          </Link>
        </div>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                <span className="text-[30px] font-bold text-ink transition-transform duration-200 group-hover:scale-105 origin-left">4</span>
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
      </div>

      {/* Main 3-Column Content Layout (Fills Full Viewport Width) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {/* Column 1: Upcoming Agenda */}
        <Panel
          className="flex animate-rise flex-col justify-between rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
          style={{ animationDelay: "0.25s" }}
        >
          <UpcomingAgenda events={agendaEvents} />
        </Panel>

        {/* Column 2: Multi-stage interview tracker */}
        <Panel
          className="flex animate-rise flex-col justify-between rounded-[22px] p-6 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">
                  Multi-stage interview tracker
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
              </div>
              <p className="mt-0.5 text-[13px] text-muted">
                Track progress and prepare for your next stage.
              </p>

              {/* Target Role Card */}
              <Link
                href="/interviews/halden"
                className="group mt-4.5 flex items-center gap-3.5 rounded-[14px] bg-panel-2 p-4 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5),inset_0_0_0_1px_var(--color-line-strong)] block"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#143029] text-[19px] font-bold text-[#34d399] shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                    H
                  </span>
                  <div className="min-w-0 grow">
                    <div className="text-[15px] font-semibold text-ink group-hover:underline group-hover:text-blue-soft transition-colors leading-snug">
                      Senior Product Manager, Payments
                    </div>
                    <div className="text-xs text-muted mt-0.5">Halden · Full-time</div>
                  </div>
                </div>
              </Link>

              {/* Stage Progress Header */}
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Stage 2 of 4</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-7 rounded-full bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                  <span className="h-1.5 w-7 rounded-full bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                  <span className="h-1.5 w-7 rounded-full bg-white/[0.12]" />
                  <span className="h-1.5 w-7 rounded-full bg-white/[0.12]" />
                </div>
              </div>

              {/* Timeline Stepper */}
              <div className="mt-4.5 flex flex-col">
                {/* Stage 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-[10px] font-bold text-[#0d1e18] shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                      <Icon name="check" size={11} strokeWidth={3} />
                    </div>
                    <div className="h-8 w-[2px] bg-gradient-to-b from-[#10b981] to-[#6366f1]" />
                  </div>
                  <div className="-mt-0.5 min-w-0 grow pb-2">
                    <div className="text-[13px] font-semibold text-ink">
                      Stage 1 · Recruiter screen
                    </div>
                    <div className="text-xs text-muted">Completed · Tue 4 Nov</div>
                  </div>
                </div>

                {/* Stage 2 (Active Stage with pulsing glow) */}
                <Link
                  href="/interviews/halden"
                  className="my-1.5 block rounded-[14px] bg-gradient-to-r from-[#1c2237] via-[#212948] to-[#1c2237] p-4 shadow-[0_0_25px_rgba(99,102,241,0.18),inset_0_0_0_1px_#4a5888] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(99,102,241,0.32),inset_0_0_0_1px_#818cf8]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#818cf8] bg-[#1a2035] shadow-[0_0_10px_#818cf8]">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#818cf8] opacity-75" />
                        <span className="relative h-2 w-2 rounded-full bg-[#818cf8]" />
                      </div>
                    </div>
                    <div className="-mt-0.5 min-w-0 grow">
                      <div className="text-[14px] font-bold text-ink">
                        Stage 2 · Hiring manager
                      </div>
                      <div className="text-xs font-semibold text-[#818cf8]">
                        Next · Thu 12 Nov, 10:00
                      </div>
                      <div className="mt-1 text-[11px] text-muted">
                        Technical interview with Sam on payments, risk & metrics
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Stage 3 */}
                <div className="flex items-start gap-3.5 mt-1.5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/[0.22] bg-transparent" />
                    <div className="h-8 w-[2px] bg-white/[0.12]" />
                  </div>
                  <div className="-mt-0.5 min-w-0 grow pb-2">
                    <div className="text-[13px] font-medium text-muted">
                      Stage 3 · Case interview
                    </div>
                    <div className="text-xs text-dim">Upcoming · Product problem solving & architecture</div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/[0.22] bg-transparent" />
                  </div>
                  <div className="-mt-0.5 min-w-0 grow">
                    <div className="text-[13px] font-medium text-muted">
                      Stage 4 · Final panel
                    </div>
                    <div className="text-xs text-dim">Upcoming · Cross-functional & leadership team</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Focus Banner */}
            <Link
              href="/interviews/halden"
              className="group mt-6 flex items-center justify-between rounded-[13px] bg-[#1b2238] px-4 py-3 text-xs shadow-[inset_0_0_0_1px_#2d3858] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2),inset_0_0_0_1px_#818cf8]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  name="compass"
                  size={18}
                  className="text-[#818cf8] shrink-0 transition-transform duration-700 ease-out group-hover:rotate-180"
                />
                <div className="min-w-0 grow truncate">
                  <span className="text-muted">Focus next: </span>
                  <span className="font-semibold text-ink">Technical questions</span>
                </div>
              </div>
              <span className="ml-2 text-[12px] font-semibold text-[#818cf8] transition-transform duration-200 group-hover:translate-x-1 shrink-0">
                Prep now →
              </span>
            </Link>
          </div>
        </Panel>

        {/* Column 3: Stacked Cards */}
        <div
          className="flex animate-rise flex-col gap-5"
          style={{ animationDelay: "0.35s" }}
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
                  <div className="truncate text-xs text-muted mt-0.5">Halden · Sam (Hiring manager)</div>
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
                  <div className="truncate text-xs text-muted mt-0.5">Q1 roadmap · Leadership review</div>
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
                  <div className="truncate text-xs text-muted mt-0.5">Halden · Motivation answers</div>
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
    </div>
  );
}
