import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

export default async function NewInterviewPage() {
  await requirePageUser();
  return (
    <div className="flex w-full grow flex-col">
      <InterviewSetup />
    </div>
  );
}
