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
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setEditingPost({ ...editingPost, coverImage: data.url });
      showToast("📸 Cover image uploaded from your PC!");
    } catch (err) {
      console.error("Cover upload error:", err);
      showToast("❌ Image upload failed. Try again.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setEditingPost({
        ...editingPost,
        author: { ...editingPost.author, avatarUrl: data.url },
      });
      showToast("📸 Author avatar uploaded from your PC!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast("❌ Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
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
      {/* Toast Notification with Smooth Slide & Glow */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#141522]/95 backdrop-blur-xl border border-purple-500/30 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-purple-500/20 animate-slide-in-up flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-xs font-black">
            ✦
          </span>
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
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161722] hover:bg-[#202230] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-transform duration-200 group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Articles</span>
              </button>

              <div className="hidden sm:block h-6 w-px bg-white/10" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/80">Editing Post</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-bold text-white truncate max-w-xs">{editingPost.title || "Untitled Article"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                  <span>/blog/{editingPost.slug || slugify(editingPost.title) || "slug"}</span>
                  {editingPost.slug && (
                    <span className="rounded bg-white/[0.05] px-1 text-[10px] text-slate-400">Live URL</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status pill selector */}
              <div className="relative">
                <select
                  value={editingPost.published ? "published" : "draft"}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.value === "published" })}
                  className={clsx(
                    "h-9 rounded-xl border px-3 text-xs font-medium focus:outline-none transition-all pr-8 appearance-none bg-[#1c1d27]",
                    editingPost.published
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                      : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                  )}
                >
                  <option value="draft" className="bg-[#1c1d27] text-amber-300">Draft Status</option>
                  <option value="published" className="bg-[#1c1d27] text-emerald-300">Published Status</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-2.5">
                  <span
                    className={clsx(
                      "inline-block h-2 w-2 rounded-full",
                      editingPost.published ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    )}
                  />
                </div>
              </div>

              {editingPost.slug && (
                <Link
                  href={`/blog/${editingPost.slug}`}
                  target="_blank"
                  className="rounded-xl border border-white/10 bg-[#1c1d27] hover:bg-[#252634] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview on Live Site</span>
                </Link>
              )}

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost(false)}
                className="rounded-xl border border-white/10 bg-[#1c1d27] hover:bg-[#252634] px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition disabled:opacity-50 active:scale-95"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost(true)}
                className="relative group rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
                <span>{isSaving ? "Publishing..." : "Publish Live"}</span>
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

                {/* Cover Image Upload from PC & URL */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-white flex items-center gap-1.5">
                      <span>🖼️</span> Cover Image (Upload from PC or URL)
                    </label>
                    {editingPost.coverImage && (
                      <span className="text-[11px] text-purple-400 font-mono">1200 × 630 Recommended</span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={editingPost.coverImage}
                        onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <label className="shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/25 transition-all active:scale-95">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{isUploadingCover ? "Uploading from PC..." : "Upload from PC"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingCover}
                        onChange={handleUploadCover}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Responsive High-Fidelity 16:9 / 21:9 Cover Preview */}
                  {editingPost.coverImage ? (
                    <div className="relative group aspect-[16/9] sm:aspect-[21/9] max-h-80 w-full rounded-2xl overflow-hidden border border-white/15 bg-[#0a0b12] shadow-2xl transition-all duration-300">
                      <img
                        src={editingPost.coverImage}
                        alt="Cover preview"
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Ambient gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Top left badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90 border border-white/20 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>16:9 Live Retina Banner</span>
                      </div>

                      {/* Top right floating actions on hover */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-black/75 hover:bg-black backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/25 shadow-lg transition active:scale-95">
                          <svg className="w-3.5 h-3.5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Change from PC</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingCover}
                            onChange={handleUploadCover}
                            className="sr-only"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, coverImage: "" })}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition active:scale-95 border border-rose-400/30"
                          title="Remove cover image"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>

                      {/* Bottom title & category overlay preview */}
                      <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                        <span className="rounded bg-purple-600/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {editingPost.category || "General"}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-1 drop-shadow-md truncate">
                          {editingPost.title || "Your Article Title Goes Here"}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-white/15 bg-[#12131d] p-6 text-center space-y-3 transition-colors hover:border-purple-500/40">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">No Cover Image Selected</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Upload a banner from your computer or paste an Unsplash URL above (1200×630 recommended for high CTR)
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-3.5 py-1.5 text-xs font-semibold text-purple-200 transition active:scale-95">
                        <span>📁 Choose file from PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingCover}
                          onChange={handleUploadCover}
                          className="sr-only"
                        />
                      </label>
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
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                      <span>Author Avatar</span>
                      <label className="text-purple-400 hover:text-purple-300 cursor-pointer font-semibold text-[10px]">
                        {isUploadingAvatar ? "Uploading..." : "Upload from PC"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingAvatar}
                          onChange={handleUploadAvatar}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingPost.author.avatarUrl ? (
                        <img src={editingPost.author.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-800 text-xs flex items-center justify-center shrink-0">👤</div>
                      )}
                      <input
                        type="text"
                        value={editingPost.author.avatarUrl || ""}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            author: { ...editingPost.author, avatarUrl: e.target.value },
                          })
                        }
                        placeholder="Avatar image URL"
                        className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
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
              {/* Executive SEO Audit Gauge Card */}
              {activeSeoAnalysis && (
                <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                        </span>
                        <span>Real-Time SEO Audit</span>
                      </div>
                      <div className="text-xl font-extrabold text-white mt-1">
                        Optimization Score
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Google search & snippet readiness
                      </div>
                    </div>

                    {/* Circular Radial Gauge */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                          className="text-white/10"
                          stroke="currentColor"
                          strokeWidth="3.2"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={clsx(
                            "transition-all duration-1000 ease-out",
                            activeSeoAnalysis.score >= 80
                              ? "text-emerald-400 stroke-emerald-400"
                              : activeSeoAnalysis.score >= 60
                              ? "text-amber-400 stroke-amber-400"
                              : "text-rose-400 stroke-rose-400"
                          )}
                          strokeDasharray={`${activeSeoAnalysis.score}, 100`}
                          strokeLinecap="round"
                          strokeWidth="3.2"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-white leading-none">
                          {activeSeoAnalysis.score}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 leading-none mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-white/[0.06] rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-700 ease-out rounded-full",
                        activeSeoAnalysis.score >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : activeSeoAnalysis.score >= 60
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                          : "bg-gradient-to-r from-rose-500 to-red-400"
                      )}
                      style={{ width: `${activeSeoAnalysis.score}%` }}
                    />
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-2">
                      <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <span>✓</span>
                        <span>{activeSeoAnalysis.checks.filter((c) => c.status === "pass").length} Passed</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 py-1.5 px-2">
                      <div className="text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1">
                        <span>⚠</span>
                        <span>{activeSeoAnalysis.checks.filter((c) => c.status === "warn").length} Warnings</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 py-1.5 px-2">
                      <div className="text-[10px] font-bold text-rose-400 flex items-center justify-center gap-1">
                        <span>✕</span>
                        <span>{activeSeoAnalysis.checks.filter((c) => c.status === "fail").length} Actions</span>
                      </div>
                    </div>
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
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>📋</span> Live Content Diagnostics
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {activeSeoAnalysis.checks.length} ranking tests evaluated
                        </span>
                      </div>

                      {activeSeoAnalysis.checks.map((c) => (
                        <div
                          key={c.id}
                          className={clsx(
                            "rounded-xl border p-3.5 text-xs space-y-1.5 transition-all duration-200 hover:shadow-md",
                            c.status === "pass" && "border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40",
                            c.status === "warn" && "border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40",
                            c.status === "fail" && "border-rose-500/25 bg-rose-950/15 hover:border-rose-500/40"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black shrink-0",
                                  c.status === "pass" && "bg-emerald-500/20 text-emerald-400",
                                  c.status === "warn" && "bg-amber-500/20 text-amber-400",
                                  c.status === "fail" && "bg-rose-500/20 text-rose-400"
                                )}
                              >
                                {c.status === "pass" ? "✓" : c.status === "warn" ? "!" : "✕"}
                              </span>
                              <span className="font-semibold text-white">{c.label}</span>
                            </div>

                            <span
                              className={clsx(
                                "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                                c.status === "pass" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                                c.status === "warn" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                                c.status === "fail" && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              )}
                            >
                              {c.status === "pass" ? "Pass" : c.status === "warn" ? "Warning" : "Required"}
                            </span>
                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed pl-7">{c.message}</p>

                          {c.recommendation && (
                            <div className="ml-7 mt-1 rounded-lg bg-purple-500/10 border border-purple-500/20 p-2 text-[11px] text-purple-200 flex items-start gap-1.5">
                              <span className="shrink-0 text-purple-300 font-bold">💡 Tip:</span>
                              <span className="leading-relaxed">{c.recommendation}</span>
                            </div>
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
