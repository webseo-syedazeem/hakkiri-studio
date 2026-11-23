"use client";

import { useState, useEffect } from "react";

interface BackupSummary {
  totalCollections: number;
  totalDocuments: number;
  collectionsExported: string[];
}

interface BackupStats {
  success: boolean;
  summary: BackupSummary;
  exportedAt: string;
  source: string;
}

export function BackupDownloader() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [fetchingStats, setFetchingStats] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/backup?download=false");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats(data);
        }
      } catch (err) {
        console.warn("Failed to fetch backup stats", err);
      } finally {
        if (isMounted) setFetchingStats(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup?download=true");
      if (!res.ok) throw new Error("Backup generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `hakkiri-studio-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast("✅ Full site backup downloaded successfully!");
    } catch (err) {
      console.error("Backup error:", err);
      showToast("❌ Backup export failed. Please verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="backup" className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Disaster Recovery & Protection
            </span>
            <span className="text-xs text-slate-400">JSON Full Snapshot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Site Backup & Data Snapshot
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Export every blog article, site CMS setting, candidate profile, evidence item, and application record in 1 click.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Generating Snapshot...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Site Backup (.json)</span>
            </>
          )}
        </button>
      </div>

      {/* Snapshot Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-4">
          <div className="text-xs text-slate-400">Database Collections</div>
          <div className="text-xl font-bold text-white mt-1">
            {fetchingStats ? "Counting..." : `${stats?.summary?.totalCollections ?? 0} Collections`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Blogs, CMS, Apply Suite, Storage</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-4">
          <div className="text-xs text-slate-400">Total Stored Documents</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {fetchingStats ? "Loading..." : `${stats?.summary?.totalDocuments ?? 0} Records`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Fully captured in snapshot</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-4">
          <div className="text-xs text-slate-400">Storage Engine</div>
          <div className="text-xl font-bold text-purple-300 mt-1 truncate">
            {fetchingStats ? "Checking..." : stats?.source || "MongoDB Atlas"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">High availability cluster</p>
        </div>
      </div>

      {/* Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">1</span>
            1-Click Instant JSON
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the download button above anytime. It generates a single JSON snapshot of your entire database you can store locally or on Google Drive/S3.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-[11px]">2</span>
            Atlas Cloud Backups
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your MongoDB Atlas cluster automatically takes continuous incremental snapshots with point-in-time restore in the Atlas web console.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[11px]">3</span>
            Git Codebase Backup
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All templates, components, and schema definitions are version-controlled in your GitHub repository, deployed automatically to Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
