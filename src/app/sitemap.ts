import type { MetadataRoute } from "next";
import { getBlogPostsAsync } from "@/lib/blog/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://hakkiri.studio";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${domain}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${domain}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${domain}/present`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${domain}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const { posts } = await getBlogPostsAsync({ publishedOnly: true });
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${domain}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || now),
      changeFrequency: "weekly",
      priority: 0.85,
    }));
    return [...staticRoutes, ...blogRoutes];
  } catch (err) {
    console.warn("[sitemap] Failed to load blog posts for sitemap:", err);
    return staticRoutes;
  }
}
