"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import type { BlogPost, BlogSeoData } from "@/lib/blog/types";
import { analyzeBlogSeo, slugify, calculateReadingTimeMinutes } from "@/lib/blog/seo";
import { markdownToHtml } from "@/lib/blog/markdown";

const PRESET_CATEGORIES = [
  "Interview Prep",
  "STAR Method",
  "Presentations",
  "Career Advice",
  "Leadership",
  "Clinical Scenarios",
  "Civil Service",
];

export function AdminBlogClient({
  initialPosts,
  categories: initialCategories,
}: {
  initialPosts: BlogPost[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<"list" | "editor">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Check if ?action=new is set
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleStartNewPost();
    }
  }, [searchParams]);

  // List view filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Editor states
  const [contentTab, setContentTab] = useState<"write" | "preview">("write");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [seoPreviewTab, setSeoPreviewTab] = useState<"audit" | "serp" | "social" | "schema">("audit");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  const avgSeoScore = useMemo(() => {
    if (posts.length === 0) return 0;
    const scores = posts.map((p) =>
      analyzeBlogSeo({
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        seo: p.seo,
      }).score
    );
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / scores.length);
  }, [posts]);

  // Filtered posts for list view
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.published) ||
        (statusFilter === "draft" && !p.published);

      const matchCategory =
        categoryFilter === "all" ||
        p.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seo.focusKeyword?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchCategory && matchSearch;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  // Create new post template
  const handleStartNewPost = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: "",
      title: "",
      excerpt: "",
      content: "## Introduction\n\nStart your article here...",
      category: "Interview Prep",
      tags: ["Career", "Interview"],
      author: {
        name: "Hakkiri Editorial Team",
        title: "Career & Interview Specialist",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      readingTimeMinutes: 3,
      published: false,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {
        metaTitle: "",
        metaDescription: "",
        focusKeyword: "",
        secondaryKeywords: [],
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        noIndex: false,
      },
    };
    setEditingPost(newPost);
    setActiveTab("editor");
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost({ ...post });
    setActiveTab("editor");
  };

  // Real-time SEO analysis for active editing post
  const activeSeoAnalysis = useMemo(() => {
    if (!editingPost) return null;
    return analyzeBlogSeo({
      title: editingPost.title,
      slug: editingPost.slug || slugify(editingPost.title),
      content: editingPost.content,
      excerpt: editingPost.excerpt,
      seo: editingPost.seo,
    });
  }, [editingPost]);

  // Save changes via API
  const handleSavePost = async (publishOverride?: boolean) => {
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      showToast("⚠️ Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const finalSlug = (editingPost.slug.trim() || slugify(editingPost.title)) || `post-${Date.now()}`;
      const isPublished = publishOverride !== undefined ? publishOverride : editingPost.published;

      const postToSave: BlogPost = {
        ...editingPost,
        slug: finalSlug,
        published: isPublished,
        publishedAt: isPublished && !editingPost.published ? new Date().toISOString() : editingPost.publishedAt,
        readingTimeMinutes: calculateReadingTimeMinutes(editingPost.content),
        updatedAt: new Date().toISOString(),
        seo: {
          ...editingPost.seo,
          metaTitle: editingPost.seo.metaTitle || editingPost.title,
          metaDescription: editingPost.seo.metaDescription || editingPost.excerpt,
          canonicalUrl: editingPost.seo.canonicalUrl || `https://hakkiri.com/blog/${finalSlug}`,
        },
      };

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postToSave),
      });

      if (!res.ok) throw new Error("Failed to save post");

      const data = await res.json();
      const savedPost: BlogPost = data.post;

      setPosts((prev) => {
        const index = prev.findIndex((p) => p.id === savedPost.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedPost;
          return updated;
        }
        return [savedPost, ...prev];
      });

      setEditingPost(savedPost);
      showToast(isPublished ? "🚀 Post published to live website!" : "💾 Draft saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle quick publish from list
  const handleQuickTogglePublish = async (post: BlogPost) => {
    try {
      const updated: BlogPost = {
        ...post,
        published: !post.published,
        publishedAt: !post.published ? new Date().toISOString() : post.publishedAt,
      };

      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
        showToast(updated.published ? "Post published live!" : "Post moved to drafts.");
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (editingPost?.id === id) {
          setEditingPost(null);
          setActiveTab("list");
        }
        setDeleteConfirmId(null);
        showToast("🗑️ Post deleted.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("❌ Could not delete post.");
    }
  };

  // Toolbar actions for markdown editor
  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("blog-content-editor") as HTMLTextAreaElement | null;
    if (!textarea || !editingPost) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = editingPost.content;
    const selected = current.substring(start, end) || "text";

    const replacement = `${prefix}${selected}${suffix}`;
    const nextContent = current.substring(0, start) + replacement + current.substring(end);

    setEditingPost({ ...editingPost, content: nextContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  return (
    <div className="w-full text-slate-100 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#161722] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete this article?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone. The article and its live URL will be removed from your database and website.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePost(deleteConfirmId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: POSTS LIST & STATS OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Top Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
                  Dedicated Admin Console
                </span>
                <span className="text-xs text-slate-400">MongoDB Atlas Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Blog & Content Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Create, edit, audit SEO real-time, and manage articles on the live website.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/blog"
                target="_blank"
                className="rounded-xl border border-white/10 bg-[#181926] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#252634] hover:text-white transition flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Live Site
              </Link>
              <button
                type="button"
                onClick={handleStartNewPost}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Article
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#141520] p-4">
              <div className="text-xs font-medium text-slate-400">Total Articles</div>
              <div className="text-2xl font-bold text-white mt-1">{totalPosts}</div>
              <div className="text-[11px] text-slate-500 mt-1">Across all categories</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141520] p-4">
              <div className="text-xs font-medium text-emerald-400">Published Live</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{publishedCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Indexable by Google</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141520] p-4">
              <div className="text-xs font-medium text-amber-400">Drafts</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{draftCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">In progress</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141520] p-4">
              <div className="text-xs font-medium text-purple-400">Avg SEO Score</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-purple-300">{avgSeoScore}</span>
                <span className="text-xs font-semibold text-purple-400/80">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Real-time keyword audit</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141520] p-3">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                placeholder="Search articles, slugs, focus keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-white/10 bg-[#1c1d27] px-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex rounded-xl bg-[#1c1d27] p-0.5 border border-white/10">
                {(["all", "published", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={clsx(
                      "px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors",
                      statusFilter === s ? "bg-purple-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-xl border border-white/10 bg-[#1c1d27] px-3 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set([...initialCategories, ...PRESET_CATEGORIES])).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Posts Table / List */}
          <div className="rounded-2xl border border-white/10 bg-[#141520] overflow-hidden">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No articles found matching your filters.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredPosts.map((post) => {
                  const seo = analyzeBlogSeo({
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    excerpt: post.excerpt,
                    seo: post.seo,
                  });

                  return (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="h-16 w-24 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="h-16 w-24 rounded-xl bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                              {post.category}
                            </span>
                            <span
                              className={clsx(
                                "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                                post.published
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              )}
                            >
                              {post.published ? "Published" : "Draft"}
                            </span>
                            <span
                              className={clsx(
                                "rounded-md px-2 py-0.5 text-[10px] font-bold border",
                                seo.score >= 80
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : seo.score >= 60
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              )}
                            >
                              SEO: {seo.score}/100 ({seo.grade})
                            </span>
                          </div>

                          <h3
                            onClick={() => handleEditPost(post)}
                            className="text-sm sm:text-base font-bold text-white hover:text-purple-400 cursor-pointer transition-colors truncate"
                          >
                            {post.title}
                          </h3>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="font-mono text-[11px] text-purple-400/90">/blog/{post.slug}</span>
                            <span>•</span>
                            <span>Keyword: &quot;{post.seo.focusKeyword || "None"}&quot;</span>
                            <span>•</span>
                            <span>{new Date(post.updatedAt).toLocaleDateString("en-GB")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#252634] transition flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleQuickTogglePublish(post)}
                          className={clsx(
                            "rounded-xl px-3 py-1.5 text-xs font-semibold transition border",
                            post.published
                              ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          )}
                        >
                          {post.published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditPost(post)}
                          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                        >
                          Edit & SEO
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(post.id)}
                          className="rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium transition"
                          title="Delete article"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: POST EDITOR & REAL-TIME ADVANCED SEO SUITE */}
      {/* ========================================================================= */}
      {activeTab === "editor" && editingPost && (
        <div className="space-y-6">
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-white/10 bg-[#1c1d27] p-2 text-slate-400 hover:text-white hover:bg-[#252634] transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Editing Post:</span>
                  <span className="text-xs font-bold text-white truncate max-w-xs">{editingPost.title || "Untitled"}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  /blog/{editingPost.slug || slugify(editingPost.title) || "slug"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status selector */}
              <select
                value={editingPost.published ? "published" : "draft"}
                onChange={(e) => setEditingPost({ ...editingPost, published: e.target.value === "published" })}
                className="h-9 rounded-xl border border-white/10 bg-[#1c1d27] px-3 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              {editingPost.slug && (
                <Link
                  href={`/blog/${editingPost.slug}`}
                  target="_blank"
                  className="rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Preview on Live Site
                </Link>
              )}

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost(false)}
                className="rounded-xl border border-white/10 bg-[#1c1d27] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#252634] transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost(true)}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                {isSaving ? "Publishing..." : "Publish Live"}
              </button>
            </div>
          </div>

          {/* Split Two-Column View: Editor (Left) & SEO Suite (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ========================================================= */}
            {/* LEFT COLUMN: ARTICLE CONTENT & METADATA */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 space-y-5">
              {/* Title & Slug */}
              <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <label className="font-semibold text-white">Article Title *</label>
                    <span className={clsx(editingPost.title.length > 70 ? "text-rose-400" : "text-slate-400")}>
                      {editingPost.title.length} chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingPost({
                        ...editingPost,
                        title,
                        slug: editingPost.slug || slugify(title),
                      });
                    }}
                    placeholder="e.g. How to Ace Your NHS Band 5 Nursing Interview: 2026 STAR Guide"
                    className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Slug with Auto Generator */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <label className="font-medium text-slate-300">Custom URL Slug</label>
                    <button
                      type="button"
                      onClick={() => setEditingPost({ ...editingPost, slug: slugify(editingPost.title) })}
                      className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                    >
                      Generate from title
                    </button>
                  </div>
                  <div className="flex items-center rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs text-slate-400">
                    <span className="font-mono opacity-60">hakkiri.com/blog/</span>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: slugify(e.target.value) })}
                      placeholder="custom-article-slug"
                      className="w-full bg-transparent font-mono text-purple-300 focus:outline-none ml-1"
                    />
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    >
                      {PRESET_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editingPost.tags.join(", ")}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="NHS, Nursing, STAR Method"
                      className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <label className="font-medium text-slate-300">Excerpt / Teaser</label>
                    <span>{editingPost.excerpt.length} chars</span>
                  </div>
                  <textarea
                    rows={2}
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence hook for cards, social previews, and search snippets..."
                    className="w-full rounded-xl border border-white/10 bg-[#1c1d27] p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingPost.coverImage}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                  {editingPost.coverImage && (
                    <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-white/10">
                      <img src={editingPost.coverImage} alt="Cover preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Author Name</label>
                    <input
                      type="text"
                      value={editingPost.author.name}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: { ...editingPost.author, name: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Author Title / Role</label>
                    <input
                      type="text"
                      value={editingPost.author.title}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: { ...editingPost.author, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Editor */}
              <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setContentTab("write")}
                      className={clsx(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        contentTab === "write"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Write Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab("preview")}
                      className={clsx(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        contentTab === "preview"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Formatted Preview
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{editingPost.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span>•</span>
                    <span>~{calculateReadingTimeMinutes(editingPost.content)} min read</span>
                  </div>
                </div>

                {/* Toolbar */}
                {contentTab === "write" && (
                  <div className="flex items-center gap-1 flex-wrap rounded-xl bg-[#1c1d27] p-1.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("## ")}
                      className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("### ")}
                      className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("**", "**")}
                      className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("*", "*")}
                      className="rounded px-2 py-1 text-xs italic text-slate-300 hover:bg-white/10"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("> ")}
                      className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                      title="Quote"
                    >
                      &ldquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("- ")}
                      className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                      title="Bullet list"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("1. ")}
                      className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                      title="Numbered list"
                    >
                      1. List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("> [!NOTE]\n> ")}
                      className="rounded px-2 py-1 text-xs text-purple-300 hover:bg-white/10"
                      title="Callout Note"
                    >
                      Callout
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("[link text](", ")")}
                      className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                      title="Insert link"
                    >
                      Link
                    </button>
                  </div>
                )}

                {contentTab === "write" ? (
                  <textarea
                    id="blog-content-editor"
                    rows={20}
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#10111a] p-4 font-mono text-xs text-slate-200 leading-relaxed placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Write your article in Markdown..."
                  />
                ) : (
                  <div className="rounded-xl border border-white/10 bg-[#10111a] p-6 min-h-[400px]">
                    <div
                      className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(editingPost.content) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN: ADVANCED REAL-TIME SEO SUITE */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 space-y-5">
              {/* SEO Score Health Badge Card */}
              {activeSeoAnalysis && (
                <div className="rounded-2xl border border-white/10 bg-[#141520] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Real-Time SEO Audit</div>
                      <div className="text-xl font-extrabold text-white mt-0.5">
                        Optimization Score
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "flex items-center justify-center rounded-2xl h-14 w-14 font-black text-xl border",
                        activeSeoAnalysis.score >= 80
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : activeSeoAnalysis.score >= 60
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      )}
                    >
                      {activeSeoAnalysis.score}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-500",
                        activeSeoAnalysis.score >= 80
                          ? "bg-emerald-500"
                          : activeSeoAnalysis.score >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                      style={{ width: `${activeSeoAnalysis.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                    <span>Status: <strong className="text-white">{activeSeoAnalysis.grade}</strong></span>
                    <span>{activeSeoAnalysis.checks.filter((c) => c.status === "pass").length} / {activeSeoAnalysis.checks.length} tests passed</span>
                  </div>
                </div>
              )}

              {/* Target Focus Keyword Input */}
              <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    🎯 Target Focus Keyword *
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Enter the exact search term you want this article to rank for on Google.
                  </p>
                  <input
                    type="text"
                    value={editingPost.seo.focusKeyword}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        seo: { ...editingPost.seo, focusKeyword: e.target.value },
                      })
                    }
                    placeholder="e.g. NHS nursing interview"
                    className="w-full rounded-xl border border-purple-500/40 bg-[#1c1d27] px-3.5 py-2 text-xs font-semibold text-purple-300 placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {activeSeoAnalysis && activeSeoAnalysis.keywordOccurrences > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                    <div className="rounded-xl bg-[#1c1d27] p-2.5">
                      <div className="text-[10px] text-slate-400">Occurrences</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {activeSeoAnalysis.keywordOccurrences} times
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#1c1d27] p-2.5">
                      <div className="text-[10px] text-slate-400">Keyword Density</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {activeSeoAnalysis.keywordDensity}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Sub-panel Selector Tabs */}
              <div className="rounded-2xl border border-white/10 bg-[#141520] overflow-hidden">
                <div className="flex border-b border-white/[0.08] bg-[#1a1b26]">
                  {[
                    { id: "audit", label: "Checklist" },
                    { id: "serp", label: "Google SERP" },
                    { id: "social", label: "Social Card" },
                    { id: "schema", label: "Schema.org" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSeoPreviewTab(tab.id as typeof seoPreviewTab)}
                      className={clsx(
                        "flex-1 py-2.5 text-xs font-semibold transition text-center",
                        seoPreviewTab === tab.id
                          ? "bg-[#141520] text-purple-400 border-b-2 border-purple-500"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* TAB 1: SEO CHECKLIST */}
                  {seoPreviewTab === "audit" && activeSeoAnalysis && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-white mb-2">Live Content Diagnostics</div>
                      {activeSeoAnalysis.checks.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-white/[0.06] bg-[#1c1d27] p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{c.label}</span>
                            <span
                              className={clsx(
                                "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                                c.status === "pass" && "bg-emerald-500/20 text-emerald-400",
                                c.status === "warn" && "bg-amber-500/20 text-amber-400",
                                c.status === "fail" && "bg-rose-500/20 text-rose-400"
                              )}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{c.message}</p>
                          {c.recommendation && (
                            <p className="text-purple-300 text-[11px] font-medium pt-1">
                              💡 Tip: {c.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: LIVE GOOGLE SERP PREVIEW */}
                  {seoPreviewTab === "serp" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Google Search Result Snippet</span>
                        <div className="flex rounded-lg bg-[#1c1d27] p-0.5 border border-white/10 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setSerpDevice("desktop")}
                            className={clsx(
                              "px-2 py-0.5 rounded",
                              serpDevice === "desktop" ? "bg-purple-600 text-white" : "text-slate-400"
                            )}
                          >
                            Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setSerpDevice("mobile")}
                            className={clsx(
                              "px-2 py-0.5 rounded",
                              serpDevice === "mobile" ? "bg-purple-600 text-white" : "text-slate-400"
                            )}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>

                      {/* SERP Card simulating Google results */}
                      <div className="rounded-xl bg-white p-4 text-slate-800 shadow-md font-sans">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            H
                          </div>
                          <div className="text-[12px] text-slate-700 leading-tight">
                            <span className="font-semibold text-slate-900">Hakkiri</span>
                            <span className="text-slate-400 mx-1">›</span>
                            <span className="text-slate-500">blog › {editingPost.slug || "url-slug"}</span>
                          </div>
                        </div>

                        <h4 className="text-[17px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                          {editingPost.seo.metaTitle || editingPost.title || "Article Title for Google SERP"}
                        </h4>

                        <p className="text-[13px] text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                          {editingPost.seo.metaDescription ||
                            editingPost.excerpt ||
                            "Add an SEO meta description to display a punchy snippet in Google search results."}
                        </p>
                      </div>

                      {/* Meta Title input */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <label className="font-medium text-slate-300">SEO Meta Title (SERP)</label>
                          <span
                            className={clsx(
                              (editingPost.seo.metaTitle || editingPost.title).length >= 50 &&
                                (editingPost.seo.metaTitle || editingPost.title).length <= 60
                                ? "text-emerald-400 font-bold"
                                : "text-amber-400"
                            )}
                          >
                            {(editingPost.seo.metaTitle || editingPost.title).length} / 60 optimal
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingPost.seo.metaTitle}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              seo: { ...editingPost.seo, metaTitle: e.target.value },
                            })
                          }
                          placeholder={editingPost.title}
                          className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Meta Description input */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <label className="font-medium text-slate-300">SEO Meta Description</label>
                          <span
                            className={clsx(
                              (editingPost.seo.metaDescription || editingPost.excerpt).length >= 120 &&
                                (editingPost.seo.metaDescription || editingPost.excerpt).length <= 160
                                ? "text-emerald-400 font-bold"
                                : "text-amber-400"
                            )}
                          >
                            {(editingPost.seo.metaDescription || editingPost.excerpt).length} / 155 optimal
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={editingPost.seo.metaDescription}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              seo: { ...editingPost.seo, metaDescription: e.target.value },
                            })
                          }
                          placeholder={editingPost.excerpt || "Concise summary tailored for search results..."}
                          className="w-full rounded-xl border border-white/10 bg-[#1c1d27] p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Canonical URL */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Canonical URL Override</label>
                        <input
                          type="text"
                          value={editingPost.seo.canonicalUrl || `https://hakkiri.com/blog/${editingPost.slug}`}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              seo: { ...editingPost.seo, canonicalUrl: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SOCIAL MEDIA PREVIEW */}
                  {seoPreviewTab === "social" && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-white">Social Share Card (LinkedIn & Twitter/X)</span>

                      <div className="rounded-xl border border-slate-700 overflow-hidden bg-[#0d0e14]">
                        {editingPost.coverImage && (
                          <div className="h-40 w-full overflow-hidden bg-slate-800">
                            <img src={editingPost.coverImage} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="p-3 space-y-1">
                          <div className="text-[10px] uppercase font-mono text-slate-400">hakkiri.com</div>
                          <div className="text-sm font-bold text-white line-clamp-2">
                            {editingPost.seo.ogTitle || editingPost.seo.metaTitle || editingPost.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-2">
                            {editingPost.seo.ogDescription || editingPost.seo.metaDescription || editingPost.excerpt}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Custom OpenGraph Title</label>
                        <input
                          type="text"
                          value={editingPost.seo.ogTitle || ""}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              seo: { ...editingPost.seo, ogTitle: e.target.value },
                            })
                          }
                          placeholder={editingPost.title}
                          className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SCHEMA.ORG JSON-LD PREVIEW */}
                  {seoPreviewTab === "schema" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Google Rich Results (JSON-LD)</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Schema: BlogPosting</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        This structured markup is automatically injected into the page HTML so Google understands the author, date, and topic.
                      </p>
                      <pre className="rounded-xl bg-[#0f1017] p-3 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-60 border border-white/10 leading-relaxed">
                        {JSON.stringify(
                          {
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            headline: editingPost.title,
                            description: editingPost.excerpt,
                            image: editingPost.coverImage,
                            datePublished: editingPost.publishedAt,
                            dateModified: editingPost.updatedAt,
                            author: {
                              "@type": "Person",
                              name: editingPost.author.name,
                            },
                            publisher: {
                              "@type": "Organization",
                              name: "Hakkiri",
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
