import { Suspense } from "react";
import { AdminAnalyticsClient } from "./AdminAnalyticsClient";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { getLiveAnalyticsSummary } from "@/lib/analytics/tracker";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [{ posts }, summary] = await Promise.all([
    getBlogPostsAsync(),
    getLiveAnalyticsSummary(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Connecting to MongoDB Atlas Live Traffic...</div>}>
      <AdminAnalyticsClient initialPosts={posts} initialSummary={summary} />
    </Suspense>
  );
}
