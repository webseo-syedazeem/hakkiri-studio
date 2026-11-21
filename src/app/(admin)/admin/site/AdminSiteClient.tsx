"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { HomepageContent } from "@/lib/site/site-content";

export function AdminSiteClient({ initialContent }: { initialContent: HomepageContent }) {
  const [content, setContent] = useState<HomepageContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setContent((prev) => ({ ...prev, heroImageUrl: data.url }));
      showToast("📸 Image uploaded from PC and set as Hero Image!");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("❌ Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error("Save failed");

      showToast("🚀 Homepage & SEO changes published to live website!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Failed to save homepage changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
              Visual CMS
            </span>
            <span className="text-xs text-slate-400">MongoDB Atlas Synced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Homepage & Site Content Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Edit the live landing page headlines, badges, call-to-actions, hero image, and homepage SEO.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded-xl border border-white/10 bg-[#181926] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#252634] hover:text-white transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Live Homepage
          </Link>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            {isSaving ? "Publishing..." : "Publish Live Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO SECTION EDITOR */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hero Section */}
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🎯</span> Hero Banner & Primary Headlines
            </h2>

            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Top Pill / Badge Text</label>
              <input
                type="text"
                value={content.badgeText}
                onChange={(e) => setContent({ ...content, badgeText: e.target.value })}
                placeholder="Beta · Free for everyone, for a limited time"
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Main Headline (H1) */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <label className="font-semibold text-white">Main Headline (H1)</label>
                <span>{content.headline.length} chars</span>
              </div>
              <input
                type="text"
                value={content.headline}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
                placeholder="Practise for the interview you actually have."
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Subheadline / Description */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <label className="font-semibold text-slate-300">Subheadline / Paragraph Pitch</label>
                <span>{content.subheadline.length} chars</span>
              </div>
              <textarea
                rows={3}
                value={content.subheadline}
                onChange={(e) => setContent({ ...content, subheadline: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Primary & Secondary CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={content.primaryCtaText}
                  onChange={(e) => setContent({ ...content, primaryCtaText: e.target.value })}
                  placeholder="Sign up free"
                  className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={content.primaryCtaLink}
                  onChange={(e) => setContent({ ...content, primaryCtaLink: e.target.value })}
                  placeholder="/signup"
                  className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs font-mono text-purple-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary CTA Text</label>
                <input
                  type="text"
                  value={content.secondaryCtaText}
                  onChange={(e) => setContent({ ...content, secondaryCtaText: e.target.value })}
                  placeholder="See how it works"
                  className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Button Link</label>
                <input
                  type="text"
                  value={content.secondaryCtaLink}
                  onChange={(e) => setContent({ ...content, secondaryCtaLink: e.target.value })}
                  placeholder="#how"
                  className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs font-mono text-purple-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Subtext below CTA */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subtext Under Buttons</label>
              <input
                type="text"
                value={content.subtext}
                onChange={(e) => setContent({ ...content, subtext: e.target.value })}
                placeholder="Free for a limited time. No card. Takes about two minutes."
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Image & Upload From PC */}
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🖼️</span> Hero Screenshot / Graphic (Upload From PC)
            </h2>

            {/* Upload from PC Box */}
            <div className="rounded-xl border-2 border-dashed border-white/15 bg-[#1a1b27] p-5 text-center space-y-3">
              <div className="flex justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Upload New Hero Image from your PC</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP (Max 10MB)</p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow transition active:scale-95">
                  <span>{isUploading ? "Uploading..." : "📁 Browse from Computer"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Image URL fallback */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Or paste Image URL</label>
              <input
                type="text"
                value={content.heroImageUrl}
                onChange={(e) => setContent({ ...content, heroImageUrl: e.target.value })}
                placeholder="/landing/interview-live.webp"
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none"
              />
            </div>

            {/* Preview */}
            {content.heroImageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-56 bg-slate-900">
                <img src={content.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LIVE VISUAL PREVIEW & HOMEPAGE SEO */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Visual Simulation Card */}
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Homepage Hero Simulation
              </h3>
              <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                Exact Scale
              </span>
            </div>

            {/* Simulated Hero Card */}
            <div className="rounded-2xl bg-white p-6 text-center text-slate-900 shadow-xl space-y-3">
              <span className="inline-block rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                {content.badgeText}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {content.headline}
              </h2>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {content.subheadline}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow">
                  {content.primaryCtaText}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  {content.secondaryCtaText} &rarr;
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{content.subtext}</p>
            </div>
          </div>

          {/* Homepage SEO Suite */}
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span> Homepage Google SEO & Meta
            </h3>

            {/* SERP Card */}
            <div className="rounded-xl bg-white p-4 text-slate-800 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-600">
                  H
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900">Hakkiri</span> › Home
                </div>
              </div>
              <h4 className="text-[15px] font-medium text-[#1a0dab] leading-snug line-clamp-2">
                {content.metaTitle || content.headline}
              </h4>
              <p className="text-[12px] text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                {content.metaDescription || content.subheadline}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Homepage SEO Title</label>
              <input
                type="text"
                value={content.metaTitle}
                onChange={(e) => setContent({ ...content, metaTitle: e.target.value })}
                placeholder="Hakkiri · Practise for the interview you actually have"
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Homepage SEO Meta Description</label>
              <textarea
                rows={3}
                value={content.metaDescription}
                onChange={(e) => setContent({ ...content, metaDescription: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#1c1d27] p-3 text-xs text-slate-200 leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
