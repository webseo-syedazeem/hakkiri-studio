"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPost } from "@/lib/blog/types";
import type { AnalyticsSummary } from "@/lib/analytics/tracker";

export function AdminAnalyticsClient({
  initialPosts,
  initialSummary,
}: {
  initialPosts: BlogPost[];
  initialSummary: AnalyticsSummary;
}) {
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "today">("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "articles" | "setup" | "playbook">("overview");
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const fresh = await res.json();
        setSummary(fresh);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText("https://hakkiri-studio.vercel.app/sitemap.xml");
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  const maxViews = Math.max(10, ...summary.dailyStats.map((d) => d.pageviews));

  return (
    <div className="w-full text-slate-100 pb-16 space-y-6">
      {/* ========================================================================= */}
      {/* TOP HEADER & REAL DATABASE STATUS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>MongoDB Atlas Live Data Feed (analytics_events)</span>
            </span>

            <span className="rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-0.5 border border-purple-500/30">
              Not Demo · 100% Real Production Tracking
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Real-Time Website Traffic & Candidate Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected live to MongoDB Atlas. Every visit by candidates, recruiters, and clients is recorded in real time.
          </p>
        </div>

        {/* Live Refresh Button & External Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 px-3.5 py-2 text-xs font-bold text-emerald-300 transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className={clsx(isRefreshing && "animate-spin")}>🔄</span>
            <span>{isRefreshing ? "Fetching from Atlas..." : "Refresh Live Data"}</span>
          </button>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-[#161722] hover:bg-[#202230] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-amber-400">🔍</span>
            Google Search Console
          </a>

          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-[#161722] hover:bg-[#202230] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-orange-400">📊</span>
            Google Analytics 4
          </a>

          <button
            type="button"
            onClick={() => setActiveTab("playbook")}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
          >
            <span>🚀</span>
            Traffic Playbook
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 REAL-TIME METRIC CARDS DIRECTLY FROM MONGODB */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Real Total Pageviews */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Real Pageviews</span>
            <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
              Atlas Live
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5 font-mono">
            {summary.totalPageviews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Recorded in <code className="text-purple-300">analytics_events</code>
          </div>
        </div>

        {/* Card 2: Real Unique Visitors */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unique Visitors</span>
            <span className="rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 border border-purple-500/30">
              Distinct
            </span>
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1.5 font-mono">
            {summary.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unique candidate devices</div>
        </div>

        {/* Card 3: Real Today's Pageviews */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today&apos;s Traffic</span>
            <span className="rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 border border-blue-500/30">
              Today
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5 font-mono">
            {summary.todayPageviews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary.todayVisitors} unique visitors today
          </div>
        </div>

        {/* Card 4: Avg Read Duration */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Session Time</span>
            <span className="rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 border border-indigo-500/30">
              Engaged
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5 font-mono">
            {Math.floor(summary.avgDurationSeconds / 60)}m {summary.avgDurationSeconds % 60}s
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Candidate read & practice time</div>
        </div>

        {/* Card 5: Real-time Live Visitors (15 mins window) */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 relative overflow-hidden shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Active Right Now
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
              Live
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5 font-mono">
            {summary.activeNow} Active
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            Browsing pages in last 15 mins
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex border-b border-white/[0.08] bg-[#141520] rounded-2xl p-1 gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "📈 Real Traffic Trend (MongoDB)" },
          { id: "articles", label: "📰 Real Page Hits by URL" },
          { id: "sources", label: "🌐 Live Acquisition Channels" },
          { id: "setup", label: "⚙️ GA4 & Search Console Setup" },
          { id: "playbook", label: "🚀 How to 10x Real Traffic" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={clsx(
              "px-4 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap",
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REAL DAILY TRAFFIC BAR CHART */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📊</span> Real Daily Traffic & Pageviews (Past 7 Days)
                  </h3>
                  <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                    Live Database
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct database aggregation from MongoDB Atlas <code className="text-purple-300">analytics_events</code>
                </p>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Last updated: <strong className="text-white font-mono">{summary.lastUpdated}</strong></span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 px-2 border-b border-white/[0.08]">
                {summary.dailyStats.map((d) => {
                  const heightPercent = Math.max(12, Math.round((d.pageviews / maxViews) * 100));
                  return (
                    <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {d.pageviews} views
                      </div>

                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-[#1e202f] group-hover:bg-[#25283b] transition-all relative overflow-hidden flex flex-col justify-end"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl transition-all duration-500"
                          style={{ height: "100%" }}
                        />
                        {d.organic > 0 && (
                          <div
                            className="w-full bg-emerald-400/80 absolute bottom-0 left-0"
                            style={{ height: `${Math.round((d.organic / Math.max(1, d.pageviews)) * 100)}%` }}
                            title={`Google Organic: ${d.organic}`}
                          />
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full text-center">
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-600 shadow-sm" />
                  <span>Total Real Pageviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm" />
                  <span>Google Organic Hits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Split & Verification Test */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Real Device Split */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>📱 Real Device Breakdown (From User-Agent Headers)</span>
                <span className="text-xs text-emerald-400 font-mono">Verified Live</span>
              </h3>

              <div className="space-y-3 pt-2">
                {summary.devices.map((dev) => (
                  <div key={dev.device}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{dev.device}</span>
                      <span className="text-purple-300 font-bold">{dev.percentage}% ({dev.count} hits)</span>
                    </div>
                    <div className="w-full bg-[#1c1d27] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, dev.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Real-time Live Proof Test Box */}
            <div className="lg:col-span-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  ✓
                </span>
                <h3 className="text-sm font-bold text-white">How You Can Verify This is Not Demo:</h3>
              </div>

              <div className="text-xs text-purple-200 space-y-2 leading-relaxed">
                <p>
                  1. Open another tab and visit any page, for example:
                  <br />
                  <Link href="/blog" target="_blank" className="font-mono text-purple-300 underline">
                    https://hakkiri-studio.vercel.app/blog
                  </Link>
                </p>
                <p>
                  2. Come back to this screen and click the <strong>&quot;Refresh Live Data&quot;</strong> button above.
                </p>
                <p>
                  3. You will immediately see the <strong>Total Real Pageviews</strong> count increment by 1, and your URL will be added directly into MongoDB Atlas.
                </p>
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300">
                <span>Status: <strong>Active Telemetry</strong></span>
                <span>Collection: <code className="font-mono text-white">analytics_events</code></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REAL PAGE HITS TABLE */}
      {/* ========================================================================= */}
      {activeTab === "articles" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] overflow-hidden">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📰</span> Real Page Hits by URL (Actual Database Counts)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact hit count recorded in MongoDB Atlas for each URL on your website
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline"
            >
              Refresh Table
            </button>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {summary.topPages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No page views recorded yet. Visit any page to record your first live hit!
              </div>
            ) : (
              summary.topPages.map((page, idx) => (
                <div key={page.path} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-purple-300 font-mono">
                      #{idx + 1}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="text-sm font-bold text-white hover:text-purple-400 transition font-mono truncate block"
                      >
                        {page.path}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {page.path === "/" ? "Homepage" : page.path.startsWith("/blog/") ? "Blog Article" : "Public Platform Page"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-xs text-right">
                    <div>
                      <div className="font-bold text-white text-sm font-mono">{page.views.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Real Pageviews</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-300 text-sm font-mono">{page.uniqueVisitors.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Unique Visitors</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACQUISITION CHANNELS */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🌐</span> Real Acquisition Channels (From HTTP Referrer Headers)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified directly from visitors&apos; incoming HTTP referrer metadata
            </p>
          </div>

          <div className="space-y-4">
            {summary.channels.map((ch) => (
              <div key={ch.name} className="rounded-xl border border-white/[0.06] bg-[#1c1d27] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={clsx("h-2.5 w-2.5 rounded-full", ch.color)} />
                    <span className="font-bold text-white text-sm">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{ch.count} hits</span>
                    <span className="font-black text-white text-sm font-mono">{ch.percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className={clsx("h-full rounded-full transition-all duration-500", ch.color)} style={{ width: `${Math.max(5, ch.percentage)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE ANALYTICS & SEARCH CONSOLE SETUP */}
      {/* ========================================================================= */}
      {activeTab === "setup" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Google Search Console */}
            <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 text-xl font-bold border border-amber-500/30">
                  GSC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Search Console</h3>
                  <p className="text-xs text-slate-400">Index articles & view Google search rankings</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Submit your dynamic sitemap so Google bot crawls and indexes all new blog articles within 24 hours:
                </p>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1c1d27] p-2.5">
                  <input
                    type="text"
                    readOnly
                    value="https://hakkiri-studio.vercel.app/sitemap.xml"
                    className="w-full bg-transparent font-mono text-purple-300 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopySitemap}
                    className="shrink-0 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1 text-xs font-semibold text-white transition active:scale-95"
                  >
                    {copiedSitemap ? "✓ Copied!" : "Copy"}
                  </button>
                </div>

                <div className="pt-2">
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold underline"
                  >
                    Open Google Search Console →
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2: Google Analytics 4 (GA4) */}
            <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 text-xl font-bold border border-orange-500/30">
                  GA4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Analytics 4 (GA4)</h3>
                  <p className="text-xs text-slate-400">Direct integration with Google Analytics</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Hakkiri Studio has built-in native support for Google Analytics. Set your Measurement ID in your environment variables:
                </p>

                <div className="rounded-xl border border-white/10 bg-[#1c1d27] p-3 font-mono text-slate-300 text-[11px] space-y-1">
                  <div className="text-purple-400"># In Vercel Environment Variables:</div>
                  <div>NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX</div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Once set, the Google gtag script automatically fires across every public landing page and blog post.
                </p>

                <div className="pt-2">
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold underline"
                  >
                    Open Google Analytics 4 Dashboard →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TRAFFIC PLAYBOOK */}
      {/* ========================================================================= */}
      {activeTab === "playbook" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 sm:p-8 space-y-6">
          <div>
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 border border-emerald-500/30">
              Live Organic Strategy
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
              How to Drive Real Candidates & Scale Traffic
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Step-by-step organic traffic blueprint tailored for UK & healthcare interview practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  1
                </span>
                <h4 className="text-sm font-bold text-white">Submit Dynamic Sitemap to Google</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit <code className="text-purple-300 font-mono">https://hakkiri-studio.vercel.app/sitemap.xml</code> to Google Search Console. Google bot will index all published articles within 24 to 48 hours.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  2
                </span>
                <h4 className="text-sm font-bold text-white">Target High-Intent NHS Questions</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Write articles targeting:
                <br />
                <span className="text-purple-300">• &quot;NHS Band 5 Nursing Interview Questions 2026&quot;</span>
                <br />
                <span className="text-purple-300">• &quot;STAR Method Examples for Healthcare&quot;</span>
                <br />
                <span className="text-purple-300">• &quot;Civil Service Delivering at Pace Level 7&quot;</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
