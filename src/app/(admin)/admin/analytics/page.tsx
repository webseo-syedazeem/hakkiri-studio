import { Suspense } from "react";
import { AdminAnalyticsClient } from "./AdminAnalyticsClient";
import { getBlogPostsAsync } from "@/lib/blog/store";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { posts } = await getBlogPostsAsync();
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading traffic analytics...</div>}>
      <AdminAnalyticsClient initialPosts={posts} />
    </Suspense>
  );
}
