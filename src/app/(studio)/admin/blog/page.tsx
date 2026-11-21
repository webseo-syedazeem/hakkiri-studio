import type { Metadata } from "next";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { AdminBlogClient } from "./AdminBlogClient";

export const metadata: Metadata = {
  title: "Blog & SEO Manager | Hakkiri Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPage() {
  const { posts, categories } = await getBlogPostsAsync({ publishedOnly: false });

  return <AdminBlogClient initialPosts={posts} categories={categories} />;
}
