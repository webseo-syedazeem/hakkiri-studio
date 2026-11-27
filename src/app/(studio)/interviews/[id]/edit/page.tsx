import { notFound, redirect } from "next/navigation";
import { InterviewSetup, type SetupInitial } from "@/components/interview/InterviewSetup";
import { getInterview, getInterviewAsync, isDemoInterview } from "@/lib/interviews/store";
import { savedWeights, settingsOr } from "@/lib/interviews/settings";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

const FORMAT_LABEL: Record<string, string> = { "in-person": "In person", phone: "Phone call", video: "Video call" };

/**
 * /interviews/{id}/edit   "Edit interview": the set-up form again, holding
 * everything the interview was built from, ready to change and rebuild.
 */
export default async function EditInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const interview = (await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id);
  if (!interview) notFound();
  // The built-in examples have no documents of their own to edit.
  if (isDemoInterview(interview.id)) redirect(`/interviews/${interview.id}/rebuild?edit=1`);

  const s = settingsOr(interview.settings, interview.style);
  const minutes = ([10, 20, 30, 45] as const).find((m) => m === s.minutes) ?? 30;
  const site = interview.companyUrl ? (/^https?:\/\//i.test(interview.companyUrl) ? interview.companyUrl : `https://${interview.companyUrl}`) : "";
  const initial: SetupInitial = {
    id: interview.id,
    company: interview.company,
    title: interview.role,
    website: site,
    jobText: interview.documents?.job ?? "",
    jobLabel: interview.sources?.job ?? "Job description",
    cvText: interview.documents?.cv ?? "",
    cvLabel: interview.sources?.cv ?? "Your CV",
    coverText: interview.documents?.coverLetter ?? "",
    coverLabel: interview.sources?.coverLetter ?? "Cover letter",
    stages: (interview.stages ?? []).map((st) => ({
      id: st.id ?? "",
      name: st.name,
      date: st.date ?? "",
      time: st.time ?? "",
      format: st.format ?? FORMAT_LABEL[interview.format ?? "video"] ?? "Video call",
      interviewer: st.interviewer ?? "",
      status: st.status ?? "not_scheduled",
    })),
    difficulty: s.difficulty === "easy" ? "Easy" : s.difficulty === "hard" ? "Hard" : "Medium",
    duration: minutes,
    categoryWeights: savedWeights(s),
  };

  return (
    <div className="flex w-full grow flex-col">
      <InterviewSetup editing={initial} />
    </div>
  );
}
