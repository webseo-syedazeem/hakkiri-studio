"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@/lib/apply/schema";

const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: "queued", title: "Matched & Queued", color: "border-blue-500/40 text-blue-400" },
  { id: "draft", title: "Preparing", color: "border-purple-500/40 text-purple-400" },
  { id: "ready", title: "Ready to Send", color: "border-amber-500/40 text-amber-400" },
  { id: "sent", title: "Sent & Applied", color: "border-emerald-500/40 text-emerald-400" },
  { id: "screen", title: "Screening Call", color: "border-cyan-500/40 text-cyan-400" },
  { id: "interview", title: "Interview", color: "border-accent text-accent" },
  { id: "offer", title: "Offer Received", color: "border-green-400 text-green-300" },
  { id: "rejected", title: "Closed", color: "border-zinc-700 text-zinc-500" },
];

interface EnrichedApp extends Application {
  job: {
    title: string;
    employer: string;
    location: string;
  };
}

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState<EnrichedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/apply/applications");
        const data = await res.json();
        setApplications(data || []);
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMoveStage = async (appId: string, nextStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/apply/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-[1500px] mx-auto">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply Tracker</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Job Applications Board
          </h1>
          <p className="text-xs text-muted mt-1">
            Tracks every application from automated intake to screening and practice interviews. Zero upkeep required.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-card p-1 border border-line">
            <button
              onClick={() => setViewMode("board")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewMode === "board" ? "bg-accent text-white" : "text-muted hover:text-white"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewMode === "list" ? "bg-accent text-white" : "text-muted hover:text-white"
              }`}
            >
              List View
            </button>
          </div>

          <Link
            href="/apply/jobs/new"
            className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow hover:bg-accent-hover transition"
          >
            + Add Job Advert
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : viewMode === "board" ? (
        /* Kanban Columns */
        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
          {COLUMNS.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 rounded-2xl border border-line bg-booth/90 p-4 space-y-3"
              >
                {/* Column Title & Badge */}
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold rounded-full bg-canvas px-2 py-0.5 text-muted border border-line">
                    {columnApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[420px]">
                  {columnApps.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line/60 p-6 text-center text-[11px] text-muted/60">
                      Empty stage
                    </div>
                  ) : (
                    columnApps.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-line bg-card/80 p-4 space-y-2.5 hover:border-line-hover transition relative group shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/apply/applications/${item.id}`}
                              className="text-xs font-bold text-white hover:text-accent transition line-clamp-1"
                            >
                              {item.job.title}
                            </Link>
                            <div className="text-[11px] text-accent font-medium mt-0.5">
                              {item.job.employer}
                            </div>
                          </div>

                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {item.fit}% fit
                          </span>
                        </div>

                        <div className="text-[10px] text-muted flex items-center justify-between border-t border-line/50 pt-2">
                          <span>📍 {item.job.location}</span>
                          <span className="font-mono">{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Hand-off to Mock Interview button for sent/interview stages */}
                        {(col.id === "sent" || col.id === "screen" || col.id === "interview") && (
                          <div className="pt-1">
                            <Link
                              href="/interviews"
                              className="w-full block text-center rounded-lg bg-accent/20 border border-accent/30 py-1.5 text-[10px] font-bold text-accent hover:bg-accent/30 transition"
                            >
                              🎙️ Practise Interview Now →
                            </Link>
                          </div>
                        )}

                        {/* Quick Move Action */}
                        <div className="pt-1 flex items-center justify-between text-[10px] text-muted">
                          <Link
                            href={`/apply/applications/${item.id}`}
                            className="hover:underline font-semibold text-ink"
                          >
                            Workspace →
                          </Link>

                          {col.id === "queued" && (
                            <button
                              onClick={() => handleMoveStage(item.id, "ready")}
                              className="hover:text-accent font-semibold"
                            >
                              Mark Ready →
                            </button>
                          )}
                          {col.id === "ready" && (
                            <button
                              onClick={() => handleMoveStage(item.id, "sent")}
                              className="hover:text-emerald-400 font-semibold"
                            >
                              Mark Sent →
                            </button>
                          )}
                          {col.id === "sent" && (
                            <button
                              onClick={() => handleMoveStage(item.id, "interview")}
                              className="hover:text-accent font-semibold"
                            >
                              Got Interview! →
                            </button>
                          )}
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
        <div className="rounded-2xl border border-line bg-booth divide-y divide-line">
          {applications.map((app) => (
            <div key={app.id} className="p-4 flex items-center justify-between gap-4 hover:bg-card/40 transition">
              <div>
                <Link
                  href={`/apply/applications/${app.id}`}
                  className="text-sm font-bold text-white hover:text-accent transition"
                >
                  {app.job.title} · <span className="text-accent">{app.job.employer}</span>
                </Link>
                <div className="text-xs text-muted mt-0.5">
                  📍 {app.job.location} · Mode: {app.mode}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {app.fit}% match fit
                </span>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded bg-card text-white border border-line">
                  {app.status}
                </span>
                <Link
                  href={`/apply/applications/${app.id}`}
                  className="rounded-lg bg-line px-3 py-1.5 text-xs font-bold text-ink hover:text-white transition"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
