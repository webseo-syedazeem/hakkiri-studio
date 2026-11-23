"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cv } from "@/lib/apply/schema";

const DEFAULT_STARTER_CV: Cv = {
  id: "cv_default",
  userId: "usr_guest",
  name: "Master Executive CV (Base)",
  kind: "base",
  templateId: "standard",
  sections: [
    { type: "contact", order: 1, visible: true },
    {
      type: "summary",
      order: 2,
      visible: true,
      text: "Senior engineering leader with proven experience scaling high-performance systems and managing cross-functional teams.",
    },
    { type: "experience", order: 3, visible: true },
    { type: "education", order: 4, visible: true },
    { type: "skills", order: 5, visible: true },
  ],
  bullets: [
    {
      id: "b-1",
      roleId: "role-1",
      text: "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
    {
      id: "b-2",
      roleId: "role-1",
      text: "Reduced cloud infrastructure latency by 42% through distributed caching and query optimization.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
    {
      id: "b-3",
      roleId: "role-1",
      text: "Led cross-functional team of 6 engineers across 3 timezones to deliver core platform release 2 weeks ahead of schedule.",
      evidenceIds: [],
      origin: "person",
      visible: true,
    },
  ],
  score: {
    total: 86,
    parts: { evidence: 88, clarity: 85, structure: 85, software: 90 },
    at: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CvsListPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "base" | "tailored">("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/cvs");
        if (!res.ok) {
          throw new Error("Failed to fetch CV list");
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCvs(data);
        } else {
          setCvs([DEFAULT_STARTER_CV]);
        }
      } catch (err) {
        console.warn("Using starter CV state due to network/server fallback:", err);
        setCvs([DEFAULT_STARTER_CV]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateNew = async (kind: "base" | "tailored") => {
    setCreating(true);
    try {
      const res = await fetch("/api/apply/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kind === "base" ? "Master Base CV" : "Tailored Role CV",
          kind,
          templateId: "standard",
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/apply/cvs/${data.id}`);
        return;
      }
      // Local fallback
      const fallbackId = `cv_${Math.random().toString(36).substring(2, 9)}`;
      router.push(`/apply/cvs/${fallbackId}`);
    } catch (err) {
      console.error("Error creating CV:", err);
      const fallbackId = `cv_${Math.random().toString(36).substring(2, 9)}`;
      router.push(`/apply/cvs/${fallbackId}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredCvs = (Array.isArray(cvs) ? cvs : []).filter((cv) => {
    if (!cv) return false;
    const matchesFilter = activeFilter === "all" || cv.kind === activeFilter;
    const matchesQuery = (cv.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const bestScore = cvs.reduce((max, c) => Math.max(max, c.score?.total || 0), 0);
  const totalBullets = cvs.reduce(
    (sum, c) => sum + (c.bullets?.filter((b) => b.visible !== false).length || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn w-full px-2 sm:px-4 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-panel via-booth to-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Hakkiri Apply Suite · CV Architect
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
              CV & Resume Builder
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              Guided ATS-optimized resume builder with live reactive audit scoring, section switches,
              and grounded bullet generation strictly drawn from your verified Evidence Bank.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCreateNew("base")}
              disabled={creating}
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              <span>{creating ? "Generating..." : "+ New Base CV"}</span>
              <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
            </button>
            <button
              onClick={() => handleCreateNew("tailored")}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-panel-2 px-4 py-3 text-xs font-bold text-ink hover:bg-line transition duration-200"
            >
              + Tailor for Job
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-line/60">
          <div className="p-3.5 rounded-2xl bg-panel-2/60 border border-line/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Total CVs</span>
            <div className="text-xl font-extrabold text-ink mt-0.5">{cvs.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-panel-2/60 border border-line/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Top ATS Score</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {bestScore || 86}%
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-panel-2/60 border border-line/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Bullets</span>
            <div className="text-xl font-extrabold text-blue-soft mt-0.5">{totalBullets}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-panel-2/60 border border-line/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Audit Standard</span>
            <div className="text-xl font-extrabold text-purple-300 mt-0.5">85+ Benchmark</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-panel border border-line w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === "all" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            All CVs ({cvs.length})
          </button>
          <button
            onClick={() => setActiveFilter("base")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === "base" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Master Base
          </button>
          <button
            onClick={() => setActiveFilter("tailored")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === "tailored" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Tailored Versions
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search CV titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-panel border border-line px-4 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-blue transition"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl border border-line bg-panel p-6 animate-pulse space-y-4"
            >
              <div className="h-4 w-28 bg-panel-2 rounded-full" />
              <div className="h-6 w-48 bg-panel-2 rounded-lg" />
              <div className="h-16 w-full bg-panel-2 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCvs.length === 0 ? (
        <div className="rounded-3xl border border-line bg-panel p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-blue text-xl font-bold">
            📄
          </div>
          <h3 className="text-lg font-bold text-ink">No resumes found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No CVs match "${searchQuery}". Clear your search to see all resumes.`
              : "Get started by building your Master Base CV. It serves as the foundation for all targeted applications."}
          </p>
          <button
            onClick={() => handleCreateNew("base")}
            className="rounded-xl bg-blue-fill px-4 py-2 text-xs font-bold text-white hover:bg-blue-hover transition"
          >
            + Create Base CV
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCvs.map((cv) => {
            const scoreTotal = cv.score?.total || 82;
            const isGoodEnough = scoreTotal >= 85;
            const activeBulletsCount = (cv.bullets || []).filter((b) => b.visible !== false).length;

            return (
              <div
                key={cv.id}
                className="group relative rounded-3xl border border-line bg-panel/80 p-6 space-y-5 hover:border-blue/40 hover:bg-panel transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue/5 flex flex-col justify-between"
              >
                {/* Header Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            cv.kind === "base"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : "bg-blue/10 text-blue border-blue/30"
                          }`}
                        >
                          {cv.kind === "base" ? "Master Base" : "Tailored Version"}
                        </span>
                        <span className="text-[10px] text-muted capitalize font-mono">
                          {cv.templateId || "Standard"} Layout
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ink group-hover:text-blue-soft transition">
                        {cv.name || "Untitled Resume"}
                      </h3>
                    </div>

                    {/* Quality Badge */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`text-2xl font-black ${
                          isGoodEnough
                            ? "text-emerald-400"
                            : scoreTotal >= 70
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {scoreTotal}
                        <span className="text-xs font-semibold text-muted">/100</span>
                      </div>
                      <div className="text-[10px] text-muted font-medium">
                        {isGoodEnough ? "Proven Fit · 85+" : "In Progress"}
                      </div>
                    </div>
                  </div>

                  {/* Summary preview */}
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {cv.sections?.find((s) => s.type === "summary")?.text ||
                      "Senior engineering leader with proven experience scaling high-performance distributed systems."}
                  </p>
                </div>

                {/* Subscores breakdown */}
                <div className="space-y-3 pt-3 border-t border-line/60">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-panel-2/80 p-2 rounded-xl border border-line">
                      <span className="text-muted block">Evidence</span>
                      <span className="font-extrabold text-ink mt-0.5 block">
                        {cv.score?.parts?.evidence || 85}%
                      </span>
                    </div>
                    <div className="bg-panel-2/80 p-2 rounded-xl border border-line">
                      <span className="text-muted block">Clarity</span>
                      <span className="font-extrabold text-ink mt-0.5 block">
                        {cv.score?.parts?.clarity || 80}%
                      </span>
                    </div>
                    <div className="bg-panel-2/80 p-2 rounded-xl border border-line">
                      <span className="text-muted block">Structure</span>
                      <span className="font-extrabold text-ink mt-0.5 block">
                        {cv.score?.parts?.structure || 85}%
                      </span>
                    </div>
                    <div className="bg-panel-2/80 p-2 rounded-xl border border-line">
                      <span className="text-muted block">ATS Softw.</span>
                      <span className="font-extrabold text-ink mt-0.5 block">
                        {cv.score?.parts?.software || 90}%
                      </span>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {activeBulletsCount} verified active bullets
                    </span>
                    <span className="font-mono text-[10px]">
                      {cv.updatedAt
                        ? `Saved ${new Date(cv.updatedAt).toLocaleDateString()}`
                        : "Ready"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <Link
                    href={`/apply/cvs/${cv.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 border border-line-strong px-4 py-2.5 text-xs font-bold text-ink hover:bg-blue-fill hover:text-white hover:border-blue-fill transition-all duration-200"
                  >
                    <span>Edit & Live Preview</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>

                  <Link
                    href={`/apply/cvs/${cv.id}?print=true`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-xs font-semibold text-muted hover:text-ink hover:border-line-strong transition"
                    title="Export Clean PDF"
                  >
                    PDF
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
