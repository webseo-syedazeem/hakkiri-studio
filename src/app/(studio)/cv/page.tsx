import { Dashboard } from "@/components/cv/Dashboard";
import { requirePageUser } from "@/lib/auth/require";

export default async function CvDashboardPage() {
  await requirePageUser();
  return <Dashboard />;
}
