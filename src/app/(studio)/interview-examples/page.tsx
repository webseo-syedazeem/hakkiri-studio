import { requirePageUser } from "@/lib/auth/require";
import { InterviewExamplesView } from "@/components/examples/InterviewExamplesView";

export const dynamic = "force-dynamic";

export default async function InterviewExamplesPage() {
  await requirePageUser();
  return <InterviewExamplesView />;
}
