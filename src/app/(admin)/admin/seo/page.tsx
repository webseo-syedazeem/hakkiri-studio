import type { Metadata } from "next";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { AdminSeoClient } from "./AdminSeoClient";

export const metadata: Metadata = {
  title: "SEO Health & SERP Audit | Hakkiri Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  const { posts } = await getBlogPostsAsync({ publishedOnly: false });

  return <AdminSeoClient posts={posts} />;
}
