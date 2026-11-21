import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { listInterviews } from "@/lib/interviews/store";
import { listPresentations } from "@/lib/pitch/store";
import { listMocksAsync, rowsFor } from "@/lib/mocks/store";
import { mockScore } from "@/lib/mocks/report";
import { sessionTitle } from "@/lib/sessions/labels";
import { longDay, whenSaid } from "@/lib/format";
import { DashboardClientView } from "@/components/dashboard/DashboardClientView";
import { HomeHeaderActions } from "@/components/dashboard/HomeHeaderActions";
import type { UpcomingEvent } from "@/components/dashboard/UpcomingAgenda";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

function formatAgendaDate(dateStr?: string): string {
  if (!dateStr) return "Upcoming";
  if (/^[A-Za-z]{3}\s+\d{1,2}\s+[A-Za-z]{3}/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    }
  } catch {}
  return dateStr.slice(0, 10);
}

function formatAgendaTime(dateStr?: string, timeStr?: string): string {
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr;
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && dateStr.includes("T")) {
        return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      }
    } catch {}
    if (dateStr.includes("T")) {
      return dateStr.slice(11, 16);
    }
  }
  return "09:30";
}

export default async function HomePage() {
  const user = await requirePageUser();
  const jar = await cookies();
  // First visit: start at the welcome screen.
  if (!jar.get("hk_welcomed")) redirect("/welcome");

  const interviews = listInterviews(londonToday(), user.id);
  const presentations = listPresentations(user.id);

  const customInterview = interviews.find((iv) => iv.id !== "halden");
  const primaryInterview = customInterview ?? interviews[0];
  const activeInterview = primaryInterview
    ? {
        id: primaryInterview.id,
        role: primaryInterview.role,
        company: primaryInterview.company,
        companyInitial: primaryInterview.companyInitial || primaryInterview.company[0] || "H",
        stages: primaryInterview.stages,
      }
    : null;

  const mocks = primaryInterview
    ? (await listMocksAsync(primaryInterview.id, user.id)).filter((m) => m.status !== "planned")
    : [];
  const recentPractices = mocks.map((m) => {
    const rows = rowsFor(m);
    const score = mockScore(rows);
    return {
      id: m.id,
      title: sessionTitle(m, primaryInterview),
      dateText: whenSaid(m.startedAt) || "Recently",
      score: score != null ? Number(score.toFixed(1)) : null,
      href: `/interviews/${primaryInterview.id}/mocks/${m.id}`,
    };
  });

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
    if (iv.id !== "halden") {
      const nextSt = iv.stages?.find((s) => s.status === "next") ?? iv.stages?.[0];
      const rawDate = nextSt?.date || iv.date;
      const rawTime = nextSt?.time;
      const dateStr = formatAgendaDate(rawDate);
      const timeStr = formatAgendaTime(rawDate, rawTime);
      agendaEvents.unshift({
        id: iv.id,
        type: "interview",
        dateGroup: dateStr,
        time: timeStr,
        title: iv.role,
        subtitle: `${iv.company}${nextSt?.name ? ` · ${nextSt.name}` : ""}`,
        relative: "upcoming",
        href: `/interviews/${iv.id}`,
        actionLabel: "Prepare",
      });
    }
  }

  const availableInterviews = interviews.map((iv) => ({
    id: iv.id,
    role: iv.role,
    company: iv.company,
    companyInitial: iv.companyInitial || iv.company[0] || "H",
    stages: iv.stages,
  }));

  const upcomingInterviewsCount = Math.max(1, interviews.length);
  const upcomingPresentationsCount = Math.max(1, presentations.length);

  return (
    <div className="flex w-full grow flex-col gap-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row animate-rise sm:items-end justify-between gap-4 sm:gap-6" style={{ animationDelay: "0.05s" }}>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted">
            <Icon name="cal" size={14} className="text-blue-soft" />
            <span>{longDay(`${londonToday()}T12:00:00Z`)}</span>
          </div>
          <h1 className="mt-1 text-[24px] sm:text-[28px] md:text-[34px] font-bold tracking-[-0.025em] text-ink break-words">
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
        activeInterview={activeInterview}
        availableInterviews={availableInterviews}
        initialRecentPractices={recentPractices}
      />
    </div>
  );
}
