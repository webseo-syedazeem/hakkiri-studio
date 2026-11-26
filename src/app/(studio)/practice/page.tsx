import { requirePageUser } from "@/lib/auth/require";
import { isDemoInterview, listInterviewsAsync } from "@/lib/interviews/store";
import { understandingOf } from "@/lib/interviews/build";
import { prepStage } from "@/lib/interviews/prep-view";
import { doneSessions, isFresh, rowsFor } from "@/lib/mocks/store";
import { categoryScores, mockScore } from "@/lib/mocks/report";
import { listPresentations, isDemoPresentation } from "@/lib/pitch/store";
import { interviewWhen } from "@/lib/sessions/labels";
import { overviewCategories } from "@/lib/sessions/overview";
import { practiceStats, practiceTypeOf, type PracticeType } from "@/lib/sessions/practice-stats";
import { getTopicsForInterview } from "@/lib/sessions/topics";
import { londonToday } from "@/lib/dates";
import { PracticeHubClient, type HubInterview } from "@/components/practice/PracticeHubClient";

export const dynamic = "force-dynamic";

const TYPES: PracticeType[] = ["strengths", "competency", "technical", "situational", "motivation", "experience"];

/**
 * The Practice Hub. Everything on it is about the signed-in person's own
 * interviews: the one chosen (kept in the address), its real stage and date,
 * figures from their own finished sessions, and the practice topics the app
 * matches to that job. Nothing is filled in from a sample.
 */
export default async function PracticeHubPage({ searchParams }: { searchParams: Promise<{ interview?: string; type?: string }> }) {
  const user = await requirePageUser();
  const { interview: wantedId, type } = await searchParams;
  const today = londonToday();
  const now = new Date();
  const list = await listInterviewsAsync(today, user.id);

  const interviews: HubInterview[] = list.map((iv) => {
    // Only this person's own sessions: a demo's built-in example session is not their practice.
    const sessions = doneSessions(iv.id, user.id).filter((m) => m.userId === user.id);
    const scored = sessions.map((m) => ({ startedAt: m.startedAt, finishedAt: m.finishedAt, score: mockScore(rowsFor(m, user.id)) }));
    const u = understandingOf(iv);
    const categories = overviewCategories(sessions.filter(isFresh).map((m) => categoryScores(rowsFor(m, user.id))), u.technicalLabel);
    const lowest = [...categories].sort((a, b) => a.score - b.score)[0];
    return {
      id: iv.id,
      role: iv.role,
      company: iv.company,
      companyInitial: iv.companyInitial || iv.company.charAt(0).toUpperCase(),
      isDemo: isDemoInterview(iv.id),
      stage: prepStage(iv),
      when: interviewWhen(iv.date, today),
      stats: practiceStats(scored, now),
      focus: lowest ? { name: lowest.name, score: lowest.score } : null,
      topics: getTopicsForInterview(iv).map((t) => ({ id: t.id, title: t.title, focusLabel: t.focusLabel, subtitle: t.subtitle, minutes: t.minutes, type: practiceTypeOf(t) })),
    };
  });

  // The interview named in the address; otherwise the person's own soonest, and empty state if they have none.
  const ownInterviews = interviews.filter((i) => !i.isDemo);
  const chosen = interviews.find((i) => i.id === wantedId) ?? ownInterviews[0];
  const own = listPresentations(user.id).find((p) => !isDemoPresentation(p.id) && p.userId === user.id);

  return (
    <PracticeHubClient
      interviews={interviews}
      initialInterviewId={chosen?.id}
      initialType={TYPES.includes(type as PracticeType) ? (type as PracticeType) : undefined}
      presentation={own ? { id: own.id, title: own.title } : null}
    />
  );
}
