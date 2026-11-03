import { Crumbs } from "@/components/ui";
import { InterviewSetup } from "@/components/interview/InterviewSetup";

/** New interview (design screen 2): built around the company, the job and your CV, with how hard and how long. */
export default function NewInterviewPage() {
  return (
    <div className="flex grow flex-col">
      <div className="animate-rise">
        <Crumbs items={[{ label: "Interviews", href: "/interviews" }, { label: "New interview" }]} />
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Set up your interview</h1>
        <p className="mt-1 text-[15px] text-muted">Hakkiri reads these to build questions for this company and this job. Nothing is shared with the company.</p>
      </div>
      <div className="mt-4 flex grow flex-col border-t border-line pt-4">
        <InterviewSetup />
      </div>
    </div>
  );
}
