import { requirePageUser } from "@/lib/auth/require";
import { AddExampleView } from "@/components/examples/AddExampleView";

export const dynamic = "force-dynamic";

export default async function NewInterviewExamplePage() {
  await requirePageUser();
  return <AddExampleView />;
}
