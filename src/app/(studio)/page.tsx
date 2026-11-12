import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { listInterviews } from "@/lib/interviews/store";
import { listPresentations } from "@/lib/pitch/store";
import { longDay } from "@/lib/format";
import { DashboardClientView } from "@/components/dashboard/DashboardClientView";
import { HomeHeaderActions } from "@/components/dashboard/HomeHeaderActions";
import type { UpcomingEvent } from "@/components/dashboard/UpcomingAgenda";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jar = await cookies();
  // First visit: start at the welcome screen.
  if (!jar.get("hk_welcomed")) redirect("/welcome");

  const interviews = listInterviews(londonToday());
  const presentations = listPresentations();

  // Upcoming items for the agenda matching mockup
  const agendaEvents: UpcomingEvent[] = [
    {
      id: "interview-halden",
      type: "interview",
      dateGroup: "Thu 12 Nov",
      time: "10:00",
      title: "Senior Product Manager, Payments",
      subtitle: "Halden · Stage 2: Hiring manager",
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
      subtitle: "Leadership team · 10 min",
      relative: "in 6 days",
      href: "/presentations/q1-roadmap",
      actionLabel: "Rehearse",
    },
    {
      id: "interview-case-halden",
      type: "interview",
      dateGroup: "Mon 16 Nov",
      time: "14:00",
      title: "Case Interview & Metrics Practice",
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
        <HomeHeaderActions />
      </header>

      {/* Interactive 4-Card Top Metrics & 3-Column Dashboard */}
      <DashboardClientView
        upcomingInterviewsCount={upcomingInterviewsCount}
        upcomingPresentationsCount={upcomingPresentationsCount}
        agendaEvents={agendaEvents}
      />
    </div>
  );
}
