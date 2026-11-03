import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Speech Analytics & Clarity Profile | Hakkiri Studio",
  description: "Executive 4-pillar speech analytics, pacing telemetry, filler-word reduction, and clarity progression.",
};

export default function AnalyticsPage() {
  return (
    <div className="py-2">
      <AnalyticsDashboard />
    </div>
  );
}
