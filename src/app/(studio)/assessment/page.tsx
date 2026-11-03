import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

export const metadata = {
  title: "Diagnostic Speaking & Voice Assessment | Hakkiri Studio",
  description: "Personalize your executive speech track, voice resonance profile, and targeted roadblocks.",
};

export default function AssessmentPage() {
  return (
    <div className="py-2">
      <AssessmentFlow />
    </div>
  );
}
