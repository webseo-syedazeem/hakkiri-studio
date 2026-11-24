import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui";
import { londonToday } from "@/lib/dates";
import { isDemoInterview, listInterviewsAsync } from "@/lib/interviews/store";
import { isDemoPresentation, listPresentations } from "@/lib/pitch/store";
import { agenda, homeHeadline } from "@/lib/dashboard/home";
import { interviewNextStep, standing } from "@/lib/sessions/server";
import { isAdminUser } from "@/lib/auth/admin";
import { listMocksAsync, rowsFor } from "@/lib/mocks/store";
import { mockScore } from "@/lib/mocks/report";
import { sessionTitle } from "@/lib/sessions/labels";
import { longDay, whenSaid } from "@/lib/format";
import { DashboardClientView, type HomeNextStep, type HomeRecentPractice } from "@/components/dashboard/DashboardClientView";
import { HomeHeaderActions } from "@/components/dashboard/HomeHeaderActions";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requirePageUser();
  const jar = await cookies();
  // First visit: start at the welcome screen. An administrator goes straight in.
  if (!isAdminUser(user) && !jar.get("hk_welcomed")) redirect("/welcome");

  const today = londonToday();
  const interviews = await listInterviewsAsync(today, user.id);
  const presentations = listPresentations(user.id);
  // The person's own. The built-in example interview and presentation are offered as examples, by name, and are
  // never counted, tracked or put in the agenda as though they were the person's.
  const own = interviews.filter((iv) => !isDemoInterview(iv.id));
  const ownPresentations = presentations.filter((p) => !isDemoPresentation(p.id));
  const demo = interviews.find((iv) => isDemoInterview(iv.id));

  const events = agenda(
    interviews.map((iv) => ({ id: iv.id, role: iv.role, company: iv.company, isDemo: isDemoInterview(iv.id), date: iv.date, stages: iv.stages })),
    presentations.map((p) => ({ id: p.id, title: p.title, isDemo: isDemoPresentation(p.id), date: p.date, minutes: Math.round(p.timeLimitSec / 60) })),
    today,
  );

  // Every practice session the person has finished, on any of their interviews (their copy of the example
  // included: those sessions are theirs). The example's own built-in session is not one of them.
  const finished = (
    await Promise.all(interviews.map(async (iv) => (await listMocksAsync(iv.id, user.id)).filter((m) => m.userId === user.id && m.status === "done").map((m) => ({ m, iv }))))
  )
    .flat()
    .sort((a, b) => Date.parse(b.m.startedAt) - Date.parse(a.m.startedAt));
  const recentPractices: HomeRecentPractice[] = finished.slice(0, 5).map(({ m, iv }) => ({
    id: m.id,
    title: sessionTitle(m, iv),
    context: [iv.role, iv.company].filter(Boolean).join(" · "),
    dateText: whenSaid(m.startedAt),
    score: mockScore(rowsFor(m, user.id)),
    href: `/interviews/${iv.id}/mocks/${m.id}`,
  }));

  // What to do next on each of the person's interviews, worked out from their own sessions.
  const nextSteps: HomeNextStep[] = [
    ...own.slice(0, 3).map((iv): HomeNextStep => {
      const step = interviewNextStep(iv, standing(iv, user.id));
      return { id: iv.id, kind: "interview", title: iv.role || "Interview", subtitle: [iv.company, step.label].filter(Boolean).join(" · "), chip: step.detail, href: `/interviews/${iv.id}`, actionLabel: "Open" };
    }),
    ...ownPresentations.slice(0, 2).map((p): HomeNextStep => ({ id: p.id, kind: "presentation", title: p.title || "Presentation", subtitle: "Presentation", chip: `${Math.round(p.timeLimitSec / 60)} min`, href: `/presentations/${p.id}`, actionLabel: "Rehearse" })),
  ];

  const tracker = own.map((iv) => ({ id: iv.id, role: iv.role, company: iv.company, companyInitial: iv.companyInitial || (iv.company ? iv.company[0].toUpperCase() : "?"), stages: iv.stages }));

  return (
    <div className="flex w-full grow flex-col gap-6">
      <header className="flex flex-col sm:flex-row animate-rise sm:items-end justify-between gap-4 sm:gap-6" style={{ animationDelay: "0.05s" }}>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted">
            <Icon name="cal" size={14} className="text-blue-soft" />
            <span>{longDay(`${today}T12:00:00Z`)}</span>
          </div>
          <h1 className="mt-1 text-[24px] sm:text-[28px] md:text-[34px] font-bold tracking-[-0.025em] text-ink break-words" data-testid="home-headline">
            {homeHeadline(events, own.length, ownPresentations.length)}
          </h1>
        </div>
        <HomeHeaderActions />
      </header>

      <DashboardClientView
        interviewsCount={own.length}
        presentationsCount={ownPresentations.length}
        sessionsCount={finished.length}
        agendaEvents={events}
        activeInterview={tracker[0] ?? null}
        availableInterviews={tracker}
        nextSteps={nextSteps}
        example={demo ? { href: `/interviews/${demo.id}`, label: "Try the example interview" } : null}
        recentPractices={recentPractices}
      />
    </div>
  );
}
