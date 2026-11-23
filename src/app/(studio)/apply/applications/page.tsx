"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@/lib/apply/schema";

const COLUMNS: { id: ApplicationStatus; title: string; color: string; badge: string }[] = [
  {
    id: "queued",
    title: "Matched & Queued",
    color: "text-blue-400",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  {
    id: "draft",
    title: "Preparing",
    color: "text-purple-400",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  {
    id: "ready",
    title: "Ready to Send",
    color: "text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  {
    id: "sent",
    title: "Sent & Applied",
    color: "text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "screen",
    title: "Screening Call",
    color: "text-cyan-400",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  },
  {
    id: "interview",
    title: "Interview",
    color: "text-blue",
    badge: "border-blue/30 bg-blue/10 text-blue",
  },
  {
    id: "offer",
    title: "Offer Received",
    color: "text-green-300",
    badge: "border-green-400/30 bg-green-400/10 text-green-300",
  },
  {
    id: "rejected",
    title: "Closed",
    color: "text-zinc-500",
    badge: "border-zinc-700/40 bg-zinc-800 text-zinc-400",
  },
];

interface EnrichedApp extends Application {
  job: {
    title: string;
    employer: string;
    location: string;
  };
}

const STARTER_APPLICATIONS: EnrichedApp[] = [
  {
    id: "app_starter_1",
    userId: "usr_guest",
    jobId: "job_1",
    status: "ready",
    gapMap: [],
    fit: 92,
    mode: "approved",
    stages: [{ name: "Review Ready", date: new Date().toISOString().slice(0, 10) }],
    notes: "High match on TypeScript, Next.js architecture, and serverless infrastructure.",
    answerOutputIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    job: {
      title: "Senior Full Stack Engineer & Tech Lead",
      employer: "FinTech Scaleup",
      location: "London, UK (Hybrid)",
    },
  },
  {
    id: "app_starter_2",
    userId: "usr_guest",
    jobId: "job_2",
    status: "queued",
    gapMap: [],
    fit: 85,
    mode: "approved",
    stages: [{ name: "Matched", date: new Date().toISOString().slice(0, 10) }],
    notes: "Matched against Evidence Bank. Ready for cover letter generation.",
    answerOutputIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    job: {
      title: "Staff Cloud Systems Architect",
      employer: "Cloud Infrastructure Labs",
      location: "Remote / London",
    },
  },
];

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState<EnrichedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/applications");
        const data = res.ok ? await res.json() : [];
        if (Array.isArray(data) && data.length > 0) {
          setApplications(data);
        } else {
          setApplications(STARTER_APPLICATIONS);
        }
      } catch (err) {
        console.warn("Using starter applications fallback:", err);
        setApplications(STARTER_APPLICATIONS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMoveStage = async (appId: string, nextStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
    );
    try {
      await fetch(`/api/apply/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const safeApps = Array.isArray(applications) ? applications : [];

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-none pb-16">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
            Hakkiri Apply Suite · Tracker
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">
            Job Applications Board ({safeApps.length})
          </h1>
          <p className="text-xs text-muted max-w-2xl">
            Track and manage every role from automated intake to tailoring, sending, and mock practice hand-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-2xl bg-panel p-1 border border-line">
            <button
              onClick={() => setViewMode("board")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                viewMode === "board"
                  ? "bg-blue-fill text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-blue-fill text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              List View
            </button>
          </div>

          <Link
            href="/apply/jobs/new"
            className="rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            + Add Job Advert
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
        </div>
      ) : viewMode === "board" ? (
        /* Kanban Columns: Full Viewport Stretch */
        <div className="flex gap-5 overflow-x-auto pb-6 pt-1 items-stretch w-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          {COLUMNS.map((col) => {
            const columnApps = safeApps.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 rounded-3xl border border-line bg-panel/85 p-4 space-y-3 shadow-xl backdrop-blur-md min-h-[calc(100vh-260px)] flex flex-col"
              >
                {/* Column Title & Badge */}
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${col.badge}`}
                  >
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1">
                  {columnApps.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line/60 text-xs font-medium text-muted/60">
                      Empty stage
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        className="group relative rounded-2xl border border-line bg-panel-2 p-4 space-y-3 hover:border-blue/50 hover:shadow-lg transition shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-black text-ink line-clamp-1 group-hover:text-blue-soft transition">
                              {app.job?.title || "Role Application"}
                            </h4>
                            <span className="text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 flex-shrink-0">
                              {app.fit}% Fit
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-muted">
                            {app.job?.employer || "Company"}
                          </div>
                          <div className="text-[10px] text-muted font-mono">
                            {app.job?.location || "Remote"}
                          </div>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-muted/90 line-clamp-2 leading-relaxed bg-booth/50 p-2 rounded-xl border border-line/40">
                            {app.notes}
                          </p>
                        )}

                        <div className="pt-2 border-t border-line/50 flex flex-col gap-2">
                          <Link
                            href={`/apply/applications/${app.id}`}
                            className="inline-flex items-center justify-between text-[11px] font-bold text-blue hover:text-blue-soft transition"
                          >
                            <span>Open Workspace</span>
                            <span>→</span>
                          </Link>

                          {/* Quick Stage Progression */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {col.id === "queued" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "ready")}
                                className="w-full rounded-xl bg-blue-fill/10 border border-blue-fill/30 py-1.5 text-[10px] font-bold text-blue hover:bg-blue-fill hover:text-white transition"
                              >
                                Mark Ready
                              </button>
                            )}
                            {col.id === "ready" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "sent")}
                                className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                              >
                                Mark Sent
                              </button>
                            )}
                            {(col.id === "sent" || col.id === "screen" || col.id === "interview") && (
                              <Link
                                href="/practice"
                                className="w-full text-center rounded-xl bg-blue/10 border border-blue/30 py-1.5 text-[10px] font-bold text-blue hover:bg-blue hover:text-white transition"
                              >
                                Mock Practice →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-3xl border border-line bg-panel overflow-hidden shadow-xl">
          <div className="divide-y divide-line">
            {safeApps.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-panel-2 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-ink">{app.job?.title}</span>
                    <span className="text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5">
                      {app.fit}% Fit
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {app.job?.employer} · {app.job?.location}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted px-2.5 py-1 rounded-xl bg-panel-2 border border-line">
                    {app.status}
                  </span>
                  <Link
                    href={`/apply/applications/${app.id}`}
                    className="rounded-xl bg-panel-2 border border-line-strong px-4 py-2 text-xs font-bold text-ink hover:bg-blue-fill hover:text-white hover:border-blue-fill transition"
                  >
                    Workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
