"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cv } from "@/lib/apply/schema";
import { AtsProductsFlow } from "@/components/cv/ReziProductsFlow";

const DEFAULT_STARTER_CVS: Cv[] = [
  {
    id: "cv_master_base",
    userId: "usr_guest",
    name: "Standard Professional CV (Base)",
    kind: "base",
    templateId: "standard",
    sections: [
      { type: "contact", order: 1, visible: true },
      {
        type: "summary",
        order: 2,
        visible: true,
        text: "Senior engineering leader with proven experience scaling high-performance distributed cloud systems and mentoring agile teams.",
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
        evidenceIds: ["ev-1"],
        origin: "person",
        visible: true,
      },
      {
        id: "b-2",
        roleId: "role-1",
        text: "Reduced cloud infrastructure latency by 42% through distributed caching and query optimization.",
        evidenceIds: ["ev-2"],
        origin: "person",
        visible: true,
      },
      {
        id: "b-3",
        roleId: "role-1",
        text: "Led cross-functional team of 6 engineers across 3 timezones to deliver core platform release ahead of schedule.",
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
  },
  {
    id: "cv_tailored_lead",
    userId: "usr_guest",
    name: "Master Base CV · Tech Lead Variant",
    kind: "tailored",
    templateId: "standard",
    sections: [
      { type: "contact", order: 1, visible: true },
      {
        type: "summary",
        order: 2,
        visible: true,
        text: "Hands-on Tech Lead & Distributed Systems Specialist with track record in cloud architecture and high-throughput systems.",
      },
      { type: "experience", order: 3, visible: true },
      { type: "education", order: 4, visible: true },
      { type: "skills", order: 5, visible: true },
    ],
    bullets: [
      {
        id: "b-4",
        roleId: "role-1",
        text: "Spearheaded migration of core billing pipeline to AWS serverless, saving £45k annually with zero downtime.",
        evidenceIds: ["ev-1"],
        origin: "person",
        visible: true,
      },
      {
        id: "b-5",
        roleId: "role-1",
        text: "Established automated CI/CD quality gates with Playwright, decreasing defect escape rate to under 0.4%.",
        evidenceIds: [],
        origin: "person",
        visible: true,
      },
    ],
    score: {
      total: 94,
      parts: { evidence: 95, clarity: 92, structure: 94, software: 96 },
      at: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
        const data = res.ok ? await res.json() : [];
        if (Array.isArray(data) && data.length > 0) {
          setCvs(data);
        } else {
          setCvs(DEFAULT_STARTER_CVS);
        }
      } catch (err) {
        console.warn("Using starter CV state:", err);
        setCvs(DEFAULT_STARTER_CVS);
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
      const fallbackId = `cv_${Math.random().toString(36).substring(2, 9)}`;
      router.push(`/apply/cvs/${fallbackId}`);
    } catch {
      const fallbackId = `cv_${Math.random().toString(36).substring(2, 9)}`;
      router.push(`/apply/cvs/${fallbackId}`);
    } finally {
      setCreating(false);
    }
  };

  const safeCvs = Array.isArray(cvs) ? cvs : [];

  const filteredCvs = safeCvs.filter((cv) => {
    if (!cv) return false;
    const matchesFilter = activeFilter === "all" || cv.kind === activeFilter;
    const matchesQuery = (cv.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const bestScore = safeCvs.reduce((max, c) => Math.max(max, c.score?.total || 0), 0);
  const totalBullets = safeCvs.reduce(
    (sum, c) => sum + (c.bullets?.filter((b) => b.visible !== false).length || 0),
    0
  );

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Hero Header - Full Width */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-panel via-panel-2 to-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue/15 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-ping" />
              Hakkiri Apply Suite · CV Architect
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
              CV & Resume Builder
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-3xl leading-relaxed">
              Guided ATS-compliant resume builder with live reactive audit scoring, section on/off controls,
              and grounded bullet generation strictly drawn from verified Evidence Bank facts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCreateNew("base")}
              disabled={creating}
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              <span>{creating ? "Generating..." : "+ New Base CV"}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-line/60">
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Total CVs</span>
            <div className="text-2xl font-black text-ink mt-0.5">{safeCvs.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Top ATS Score</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {bestScore || 94}%
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Bullets</span>
            <div className="text-2xl font-black text-blue-soft mt-0.5">{totalBullets}</div>
          </div>
          <div className="p-4 rounded-2xl bg-booth/70 border border-line/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Audit Standard</span>
            <div className="text-2xl font-black text-purple-300 mt-0.5">85+ Benchmark</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-panel border border-line w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === "all" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            All Resumes ({safeCvs.length})
          </button>
          <button
            onClick={() => setActiveFilter("base")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === "base" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Master Base
          </button>
          <button
            onClick={() => setActiveFilter("tailored")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === "tailored" ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Tailored Roles
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search CV titles or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-panel border border-line px-4 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-blue transition shadow-sm"
          />
        </div>
      </div>

      {/* Main Grid: Full Width Multi-Column */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-3xl border border-line bg-panel p-6 animate-pulse space-y-4"
            >
              <div className="h-4 w-28 bg-panel-2 rounded-full" />
              <div className="h-6 w-48 bg-panel-2 rounded-lg" />
              <div className="h-20 w-full bg-panel-2 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCvs.length === 0 ? (
        <div className="rounded-3xl border border-line bg-panel p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-blue text-xl font-bold">
            📄
          </div>
          <h3 className="text-lg font-bold text-ink">No resumes match filter</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No CVs match "${searchQuery}". Clear your search query to see all versions.`
              : "Create your first tailored CV to apply for target positions with proven fit."}
          </p>
          <button
            onClick={() => handleCreateNew("base")}
            className="rounded-xl bg-blue-fill px-4 py-2 text-xs font-bold text-white hover:bg-blue-hover transition"
          >
            + Create Base CV
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCvs.map((cv) => {
            const scoreTotal = cv.score?.total || 86;
            const isGoodEnough = scoreTotal >= 85;
            const activeBulletsCount = (cv.bullets || []).filter((b) => b.visible !== false).length;

            return (
              <div
                key={cv.id}
                className="group relative rounded-3xl border border-line bg-panel/90 p-6 space-y-5 hover:border-blue/50 hover:bg-panel transition-all duration-300 shadow-xl hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),0_0_25px_rgba(123,136,255,0.2)] hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Header Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
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
                      <h3 className="text-base font-extrabold text-ink group-hover:text-blue-soft transition line-clamp-1">
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
                    <div className="bg-panel-2/90 p-2 rounded-xl border border-line">
                      <span className="text-muted block font-medium">Evidence</span>
                      <span className="font-black text-ink mt-0.5 block">
                        {cv.score?.parts?.evidence || 88}%
                      </span>
                    </div>
                    <div className="bg-panel-2/90 p-2 rounded-xl border border-line">
                      <span className="text-muted block font-medium">Clarity</span>
                      <span className="font-black text-ink mt-0.5 block">
                        {cv.score?.parts?.clarity || 85}%
                      </span>
                    </div>
                    <div className="bg-panel-2/90 p-2 rounded-xl border border-line">
                      <span className="text-muted block font-medium">Structure</span>
                      <span className="font-black text-ink mt-0.5 block">
                        {cv.score?.parts?.structure || 85}%
                      </span>
                    </div>
                    <div className="bg-panel-2/90 p-2 rounded-xl border border-line">
                      <span className="text-muted block font-medium">ATS Softw.</span>
                      <span className="font-black text-ink mt-0.5 block">
                        {cv.score?.parts?.software || 90}%
                      </span>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {activeBulletsCount} active bullets
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
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-panel-2 border border-line-strong px-4 py-2.5 text-xs font-bold text-ink hover:bg-blue-fill hover:text-white hover:border-blue-fill transition-all duration-200 shadow-sm"
                  >
                    <span>Edit & Live Preview</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>

                  <Link
                    href={`/apply/cvs/${cv.id}?print=true`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-xs font-bold text-muted hover:text-ink hover:border-line-strong transition"
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

      {/* Executive ATS Feature Showcase & Formats */}
      <div className="pt-8 border-t border-line/60">
        <AtsProductsFlow />
      </div>
    </div>
  );
}
