import { Suspense } from "react";
import type { Metadata } from "next";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { AdminBlogClient } from "./AdminBlogClient";

export const metadata: Metadata = {
  title: "Blog & Content Management | Hakkiri Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPage() {
  const { posts, categories } = await getBlogPostsAsync({ publishedOnly: false });

  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Admin Console...</div>}>
      <AdminBlogClient initialPosts={posts} categories={categories} />
    </Suspense>
  );
}
