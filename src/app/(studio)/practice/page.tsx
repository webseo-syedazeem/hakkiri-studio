import { requirePageUser } from "@/lib/auth/require";
import { listInterviewsAsync } from "@/lib/interviews/store";
import { staffNurse } from "@/lib/mock-data";
import { londonToday } from "@/lib/dates";
import { PracticeHubClient, type PracticeQuestionType } from "@/components/practice/PracticeHubClient";

export const dynamic = "force-dynamic";

export default async function PracticeHubPage({
  searchParams,
}: {
  searchParams: Promise<{ interview?: string; type?: string }>;
}) {
  const user = await requirePageUser();
  const { interview: initialInterviewId, type: initialType } = await searchParams;
  const interviews = await listInterviewsAsync(londonToday(), user.id);

  const hasStaffNurse = interviews.some((i) => i.id === staffNurse.id);
  const allInterviews = hasStaffNurse ? interviews : [staffNurse, ...interviews];

  return (
    <PracticeHubClient
      interviews={allInterviews}
      initialInterviewId={initialInterviewId}
      initialType={initialType as PracticeQuestionType}
    />
  );
}
