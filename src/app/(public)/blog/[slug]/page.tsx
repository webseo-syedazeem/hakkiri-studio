import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlugAsync, getBlogPostsAsync } from "@/lib/blog/store";
import { extractHeadings } from "@/lib/blog/seo";
import { markdownToHtml } from "@/lib/blog/markdown";
import { ArticleViewClient } from "./ArticleViewClient";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPostBySlugAsync(slug, true);

  if (!post) {
    return {
      title: "Article Not Found | Hakkiri Blog",
      robots: { index: false },
    };
  }

  const metaTitle = post.seo.metaTitle || post.title;
  const metaDescription = post.seo.metaDescription || post.excerpt;
  const canonicalUrl = post.seo.canonicalUrl || `https://hakkiri.com/blog/${post.slug}`;
  const ogImage = post.seo.ogImage || post.coverImage;

  return {
    title: `${metaTitle} | Hakkiri`,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: post.seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: post.seo.ogTitle || metaTitle,
      description: post.seo.ogDescription || metaDescription,
      url: canonicalUrl,
      siteName: "Hakkiri",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.ogTitle || metaTitle,
      description: post.seo.ogDescription || metaDescription,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlugAsync(slug, true);

  if (!post) {
    notFound();
  }

  // Related articles (excluding current)
  const { posts: allPosts } = await getBlogPostsAsync({ publishedOnly: true, limit: 10 });
  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  // Extract table of contents headings
  const headings = extractHeadings(post.content).filter((h) => h.level === 2 || h.level === 3);

  // Convert markdown to clean HTML
  const contentHtml = markdownToHtml(post.content);

  // Schema.org BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.title,
    },
    publisher: {
      "@type": "Organization",
      name: "Hakkiri",
      logo: {
        "@type": "ImageObject",
        url: "https://hakkiri.com/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hakkiri.com/blog/${post.slug}`,
    },
    keywords: [post.seo.focusKeyword, ...(post.seo.secondaryKeywords || []), ...post.tags].filter(Boolean).join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleViewClient
        post={post}
        contentHtml={contentHtml}
        headings={headings}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
