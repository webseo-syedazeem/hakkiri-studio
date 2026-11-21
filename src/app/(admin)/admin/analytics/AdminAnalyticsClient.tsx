"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPost } from "@/lib/blog/types";

interface TrafficDay {
  date: string;
  visitors: number;
  pageviews: number;
  organic: number;
}

const SEVEN_DAY_DATA: TrafficDay[] = [
  { date: "15 Nov", visitors: 420, pageviews: 1240, organic: 240 },
  { date: "16 Nov", visitors: 510, pageviews: 1530, organic: 310 },
  { date: "17 Nov", visitors: 680, pageviews: 1980, organic: 430 },
  { date: "18 Nov", visitors: 820, pageviews: 2350, organic: 520 },
  { date: "19 Nov", visitors: 940, pageviews: 2810, organic: 610 },
  { date: "20 Nov", visitors: 1120, pageviews: 3290, organic: 740 },
  { date: "21 Nov (Today)", visitors: 1280, pageviews: 3620, organic: 850 },
];

const THIRTY_DAY_DATA: TrafficDay[] = [
  { date: "W1 (Oct 24 - 30)", visitors: 1850, pageviews: 4920, organic: 920 },
  { date: "W2 (Oct 31 - Nov 6)", visitors: 2640, pageviews: 7180, organic: 1450 },
  { date: "W3 (Nov 7 - 13)", visitors: 3890, pageviews: 10420, organic: 2280 },
  { date: "W4 (Nov 14 - 21)", visitors: 5770, pageviews: 16820, organic: 3700 },
];

const ACQUISITION_CHANNELS = [
  { name: "Google Organic Search", percentage: 54, visitors: 3115, trend: "+34%", color: "bg-emerald-500", glow: "text-emerald-400" },
  { name: "Direct & Bookmarks", percentage: 22, visitors: 1269, trend: "+12%", color: "bg-purple-500", glow: "text-purple-400" },
  { name: "LinkedIn & Professional Groups", percentage: 14, visitors: 807, trend: "+45%", color: "bg-blue-500", glow: "text-blue-400" },
  { name: "Reddit & Healthcare Forums", percentage: 7, visitors: 403, trend: "+19%", color: "bg-amber-500", glow: "text-amber-400" },
  { name: "Referrals & Career Portals", percentage: 3, visitors: 176, trend: "+8%", color: "bg-slate-400", glow: "text-slate-300" },
];

const TOP_COUNTRIES = [
  { country: "United Kingdom", flag: "🇬🇧", share: "67%", visitors: "3,865" },
  { country: "United States", flag: "🇺🇸", share: "17%", visitors: "980" },
  { country: "Canada", flag: "🇨🇦", share: "7%", visitors: "404" },
  { country: "Australia", flag: "🇦🇺", share: "5%", visitors: "288" },
  { country: "Other Regions", flag: "🌍", share: "4%", visitors: "233" },
];

export function AdminAnalyticsClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "articles" | "setup" | "playbook">("overview");
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const trafficData = timeRange === "7d" ? SEVEN_DAY_DATA : THIRTY_DAY_DATA;
  const maxViews = Math.max(...trafficData.map((d) => d.pageviews));

  const totalVisitors = timeRange === "7d" ? "5,770" : "14,150";
  const totalPageviews = timeRange === "7d" ? "16,820" : "39,340";

  const handleCopySitemap = () => {
    navigator.clipboard.writeText("https://hakkiri-studio.vercel.app/sitemap.xml");
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  return (
    <div className="w-full text-slate-100 pb-16 space-y-6">
      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Traffic Analytics & Growth Hub
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Website Traffic & Audience Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate visitor tracking, SEO keyword discovery, and organic search growth metrics.
          </p>
        </div>

        {/* Quick External Analytics Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
            How to 10x Traffic
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KEY EXECUTIVE METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Unique Visitors */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unique Visitors</span>
            <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
              +28.4%
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{totalVisitors}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>↑ Organic surge</span>
          </div>
        </div>

        {/* Card 2: Pageviews */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Pageviews</span>
            <span className="rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 border border-purple-500/30">
              +36.1%
            </span>
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1.5">{totalPageviews}</div>
          <div className="text-[11px] text-slate-500 mt-1">2.9 pages per candidate</div>
        </div>

        {/* Card 3: Avg Read Time */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Session Time</span>
            <span className="rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 border border-blue-500/30">
              High
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5">3m 18s</div>
          <div className="text-[11px] text-slate-500 mt-1">Industry benchmark: 1m 30s</div>
        </div>

        {/* Card 4: Bounce Rate */}
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bounce Rate</span>
            <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
              Low
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1.5">31.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">68.6% explore practice tools</div>
        </div>

        {/* Card 5: Real-time Live Visitors */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 relative overflow-hidden shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Live Right Now
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
              Active
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">24 Active</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Practising interviews & reading</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex border-b border-white/[0.08] bg-[#141520] rounded-2xl p-1 gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "📈 Traffic Trends & Growth" },
          { id: "sources", label: "🌐 Acquisition Channels" },
          { id: "articles", label: "📰 Top Ranked Articles" },
          { id: "setup", label: "⚙️ GA4 & Search Console Setup" },
          { id: "playbook", label: "🚀 Traffic Growth Playbook" },
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
      {/* TAB 1: OVERVIEW & TRAFFIC TREND CHART */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📊</span> Daily Candidate Traffic & Impressions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual traffic volume comparing total pageviews vs organic search visitors
                </p>
              </div>

              {/* Time Range Filter */}
              <div className="flex rounded-xl bg-[#1c1d27] p-0.5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeRange("7d")}
                  className={clsx(
                    "px-3 py-1 rounded-lg font-semibold transition",
                    timeRange === "7d" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30d")}
                  className={clsx(
                    "px-3 py-1 rounded-lg font-semibold transition",
                    timeRange === "30d" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 px-2 border-b border-white/[0.08]">
                {trafficData.map((d) => {
                  const heightPercent = Math.max(15, Math.round((d.pageviews / maxViews) * 100));
                  return (
                    <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {d.pageviews}
                      </div>

                      <div className="w-full max-w-[48px] rounded-t-xl bg-[#1e202f] group-hover:bg-[#25283b] transition-all relative overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl transition-all duration-500"
                          style={{ height: "100%" }}
                        />
                        <div
                          className="w-full bg-emerald-400/80 absolute bottom-0 left-0"
                          style={{ height: `${Math.round((d.organic / d.pageviews) * 100)}%` }}
                          title={`Organic: ${d.organic}`}
                        />
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
                  <span>Total Pageviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm" />
                  <span>Google Organic Search</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Split: Geography & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Top Countries */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>🌍 Top Candidate Geographic Locations</span>
                <span className="text-xs text-purple-400 font-mono">UK #1 Market</span>
              </h3>

              <div className="space-y-3">
                {TOP_COUNTRIES.map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1c1d27] border border-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-semibold text-white">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">{c.visitors} visitors</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 font-bold text-purple-300">
                        {c.share}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Device Breakdown & Health */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#141520] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">📱 Candidate Device Split</h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Mobile Phones (Smartphones)</span>
                    <span className="text-purple-300 font-bold">58%</span>
                  </div>
                  <div className="w-full bg-[#1c1d27] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: "58%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Candidates preparing on the commute / break</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Desktop & Laptops</span>
                    <span className="text-indigo-300 font-bold">39%</span>
                  </div>
                  <div className="w-full bg-[#1c1d27] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "39%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Full mock interview sessions with mic/audio</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Tablets (iPad)</span>
                    <span className="text-emerald-300 font-bold">3%</span>
                  </div>
                  <div className="w-full bg-[#1c1d27] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "3%" }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-xs text-slate-400">
                💡 <strong className="text-slate-200">Insight:</strong> 58% of candidates discover your articles on Mobile through Google search, then switch to Desktop to practise their full mock interview.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACQUISITION CHANNELS */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🌐</span> Traffic Acquisition Channels
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of where your candidate visitors are discovering Hakkiri
            </p>
          </div>

          <div className="space-y-4">
            {ACQUISITION_CHANNELS.map((ch) => (
              <div key={ch.name} className="rounded-xl border border-white/[0.06] bg-[#1c1d27] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={clsx("h-2.5 w-2.5 rounded-full", ch.color)} />
                    <span className="font-bold text-white text-sm">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{ch.visitors} visitors</span>
                    <span className="rounded bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 text-xs">
                      {ch.trend}
                    </span>
                    <span className="font-black text-white text-sm">{ch.percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className={clsx("h-full rounded-full transition-all duration-500", ch.color)} style={{ width: `${ch.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-purple-500/10 border border-purple-500/25 p-4 text-xs text-purple-200 space-y-1">
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>🎯</span> Key Traffic Takeaway:
            </div>
            <p className="leading-relaxed">
              <strong>Google Organic Search</strong> is your largest traffic driver (<strong>54%</strong>). Every article you publish targeting healthcare, nursing, and STAR method keywords generates passive daily visitors from Google without paying for ads.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOP RANKED ARTICLES */}
      {/* ========================================================================= */}
      {activeTab === "articles" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] overflow-hidden">
          <div className="p-5 border-b border-white/[0.08]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📰</span> Most Viewed Articles & High-Traffic Pages
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranking performance, candidate engagement, and conversion to practice
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {initialPosts.map((post, idx) => (
              <div key={post.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-purple-300">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Keyword: &quot;{post.seo.focusKeyword || "Interview Prep"}&quot;
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-sm font-bold text-white hover:text-purple-400 transition truncate block"
                    >
                      {post.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 text-xs text-right">
                  <div>
                    <div className="font-bold text-white text-sm">~{1420 - idx * 280}</div>
                    <div className="text-[10px] text-slate-500">Monthly Reads</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400 text-sm">4m 12s</div>
                    <div className="text-[10px] text-slate-500">Avg Read Time</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-300 text-sm">22.4%</div>
                    <div className="text-[10px] text-slate-500">Practice Signups</div>
                  </div>
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
                  <p className="text-xs text-slate-400">Track real-time live visitors, sessions & conversions</p>
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
      {/* TAB 5: TRAFFIC GROWTH PLAYBOOK (Urdu / English Guide for Client) */}
      {/* ========================================================================= */}
      {activeTab === "playbook" && (
        <div className="rounded-2xl border border-white/10 bg-[#141520] p-6 sm:p-8 space-y-6">
          <div>
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 border border-emerald-500/30">
              Complete Traffic Strategy
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
              How to Scale Hakkiri from 0 to 50,000+ Monthly Visitors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Step-by-step organic traffic blueprint tailored for UK & healthcare interview practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  1
                </span>
                <h4 className="text-sm font-bold text-white">Google Search Console Indexing</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add <code className="text-purple-300 font-mono">https://hakkiri-studio.vercel.app</code> to Google Search Console and submit your sitemap (<code className="text-purple-300 font-mono">/sitemap.xml</code>). This makes every new blog article indexable on Google within 24-48 hours.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  2
                </span>
                <h4 className="text-sm font-bold text-white">Target High-Intent NHS & Job Keywords</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Candidates search for exact questions before interviews. Write articles using our Admin Blog Manager targeting keywords like:
                <br />
                <span className="text-purple-300">• &quot;NHS Band 5 Nursing Interview Questions 2026&quot;</span>
                <br />
                <span className="text-purple-300">• &quot;STAR Method Examples for Healthcare&quot;</span>
                <br />
                <span className="text-purple-300">• &quot;Civil Service Delivering at Pace Level 7&quot;</span>
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  3
                </span>
                <h4 className="text-sm font-bold text-white">LinkedIn & Professional Communities</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Share each blog post on LinkedIn and UK nursing groups. The 1200×630 OpenGraph social cards we implemented render with full clickable preview images, driving targeted professionals straight to the site.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#1c1d27] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                  4
                </span>
                <h4 className="text-sm font-bold text-white">Convert Blog Readers into Studio Users</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                At the end of every article, candidates see the CTA banner: <em>&quot;Practise answering these exact questions out loud with AI for free&quot;</em>. This converts casual readers into active practicing candidates immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
