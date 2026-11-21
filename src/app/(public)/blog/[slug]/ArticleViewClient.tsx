"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPost } from "@/lib/blog/types";

export function ArticleViewClient({
  post,
  contentHtml,
  headings,
  relatedPosts,
}: {
  post: BlogPost;
  contentHtml: string;
  headings: { level: number; text: string }[];
  relatedPosts: BlogPost[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://hakkiri.com/blog/${post.slug}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <article className="w-full bg-[#fafbfc] min-h-screen pb-20">
      {/* Breadcrumb Header */}
      <div className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{post.category}</span>
          </nav>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Header Elements */}
        <header className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-3.5 py-1 text-xs font-semibold text-purple-700">
            {post.category}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            {post.excerpt}
          </p>

          {/* Author & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-100"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  {post.author.name[0]}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">{post.author.name}</div>
                <div className="text-xs text-slate-500">{post.author.title}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.coverImage && (
          <div className="my-10 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content Layout: Sidebar Table of Contents + Article Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 max-w-4xl mx-auto">
          {/* Main Body */}
          <main className="lg:col-span-8">
            <div
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-[16px] sm:text-[17px] [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-slate-900 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-slate-900 [&>p]:my-4 [&>p]:leading-relaxed [&>ul]:my-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:my-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:my-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:bg-purple-50/50 [&>blockquote]:p-4 [&>blockquote]:rounded-r-xl [&>blockquote]:italic [&>hr]:my-8 [&>hr]:border-slate-200"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Topics in this guide
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1 font-medium transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share and Feedback Bar */}
            <div className="mt-8 rounded-2xl bg-white border border-slate-200/80 p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-700">Share this guide with colleagues:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? "Link copied!" : "Copy link"}
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  Twitter / X
                </a>
              </div>
            </div>
          </main>

          {/* Sticky Desktop Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                In this article
              </h4>
              {headings.length === 0 ? (
                <p className="text-xs text-slate-400">Standard reading format</p>
              ) : (
                <ul className="space-y-2 text-xs text-slate-600">
                  {headings.map((h, i) => (
                    <li
                      key={i}
                      className={clsx(
                        h.level === 3 && "pl-3 border-l border-slate-200",
                        "hover:text-purple-600 transition-colors"
                      )}
                    >
                      <a href={`#${encodeURIComponent(h.text.toLowerCase().replace(/\s+/g, "-"))}`} className="line-clamp-2">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <hr className="border-slate-100" />

              <div className="rounded-xl bg-purple-50/80 p-3.5 border border-purple-100 space-y-2">
                <div className="text-xs font-bold text-purple-900">Practice with AI</div>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Put this framework to the test before your real panel interview.
                </p>
                <Link
                  href="/signup"
                  className="inline-block w-full text-center rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 shadow-sm transition"
                >
                  Start free rehearsal
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
              More High-Impact Career Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4"
                >
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                    <img
                      src={related.coverImage}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded-full bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
                      {related.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                    {related.excerpt}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{related.readingTimeMinutes} min read</span>
                    <span className="font-semibold text-purple-600">Read &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
