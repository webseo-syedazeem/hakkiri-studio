import type { Metadata } from "next";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { BlogIndexClient } from "./BlogIndexClient";

export const metadata: Metadata = {
  title: {
    absolute: "Career Guides, Interview Strategies & Speaking Mastery | Hakkiri Blog",
  },
  description:
    "Actionable, research-backed guides to passing NHS nursing interviews, mastering the STAR technique, conquering presentation anxiety, and scaling your executive career.",
  openGraph: {
    title: "Hakkiri Blog: Interview Prep, STAR Method & Presentation Mastery",
    description:
      "Expert frameworks, high-scoring interview examples, and presentation insights from top clinical and business leaders.",
    url: "https://hakkiri.com/blog",
    siteName: "Hakkiri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkiri Blog: Executive Interview Prep & Speaking Mastery",
    description: "Actionable guides to passing high-stakes interviews with realistic AI practice.",
  },
  alternates: {
    canonical: "https://hakkiri.com/blog",
  },
};

export default async function BlogIndexPage() {
  const { posts, categories } = await getBlogPostsAsync({ publishedOnly: true });

  return <BlogIndexClient initialPosts={posts} categories={categories} />;
}
