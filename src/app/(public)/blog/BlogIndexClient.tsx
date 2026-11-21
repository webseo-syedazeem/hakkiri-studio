"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { BlogPost } from "@/lib/blog/types";

export function BlogIndexClient({
  initialPosts,
  categories,
}: {
  initialPosts: BlogPost[];
  categories: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="w-full bg-[#fafbfc] min-h-screen">
      {/* Hero Header */}
      <section className="border-b border-black/[0.06] bg-gradient-to-b from-white via-white to-slate-50/50 pt-12 pb-14 px-4 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700 tracking-wide">
              <span>✦</span> Hakkiri Insights & Knowledge Base
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Master high-stakes interviews & executive presentations
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Forensic breakdowns, real interview answer formulas, and behavioural frameworks designed to help you land senior roles.
            </p>

            {/* Search Input */}
            <div className="w-full max-w-lg mt-4 relative">
              <input
                type="text"
                placeholder="Search articles, NHS bands, STAR frameworks, tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-full border border-slate-200 bg-white px-5 pl-11 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            {["All", ...categories].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    "rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-[1120px] px-4 sm:px-6 py-12">
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center my-8">
            <p className="text-lg font-medium text-slate-700">No articles found matching &quot;{searchQuery}&quot;</p>
            <p className="text-sm text-slate-500 mt-1">Try another search keyword or select &quot;All&quot; categories.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Hero Article (if on All or matches) */}
            {featuredPost && (
              <div className="mb-12">
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-300 grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-7 relative h-64 md:h-full min-h-[300px] overflow-hidden bg-slate-100">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span>{new Date(featuredPost.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span>{featuredPost.readingTimeMinutes} min read</span>
                      </div>

                      <Link href={`/blog/${featuredPost.slug}`}>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {featuredPost.author.avatarUrl ? (
                          <img
                            src={featuredPost.author.avatarUrl}
                            alt={featuredPost.author.name}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {featuredPost.author.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{featuredPost.author.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{featuredPost.author.title}</div>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
                      >
                        Read guide <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {gridPosts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Latest Guides & Research</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {gridPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300"
                    >
                      <Link href={`/blog/${post.slug}`} className="relative h-48 w-full overflow-hidden bg-slate-100 block">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            {post.category}
                          </span>
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                            <span>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span>•</span>
                            <span>{post.readingTimeMinutes} min read</span>
                          </div>

                          <Link href={`/blog/${post.slug}`}>
                            <h4 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{post.author.name}</span>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                          >
                            Read <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Practice Call to Action Card */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1 border border-purple-500/30">
              Interactive Rehearsals
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Turn what you read into natural interview muscle memory
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Don&apos;t just read about the STAR method or clinical scenarios—test your answers with Hakkiri&apos;s realistic AI panel and get instant STAR scoring.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Start Practicing Free
              </Link>
              <Link
                href="/present"
                className="rounded-full bg-white/10 hover:bg-white/20 px-6 py-2.5 text-sm font-semibold text-white border border-white/10 transition"
              >
                For Presenters
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
