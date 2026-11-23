"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Application, Match } from "@/lib/apply/schema";

export default function ApplyHomePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [appRes, matchRes] = await Promise.all([
          fetch("/api/apply/applications"),
          fetch("/api/apply/matches"),
        ]);
        const appsData = appRes.ok ? await appRes.json() : [];
        const matchesData = matchRes.ok ? await matchRes.json() : [];
        setApplications(Array.isArray(appsData) ? appsData : []);
        setMatches(Array.isArray(matchesData) ? matchesData : []);
      } catch (err) {
        console.warn("Using default apply state due to network/server fallback:", err);
        setApplications([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const safeApps = Array.isArray(applications) ? applications : [];
  const safeMatches = Array.isArray(matches) ? matches : [];

  const sentCount = safeApps.filter(
    (a) => a.status === "sent" || a.status === "screen" || a.status === "interview"
  ).length;
  const interviewsCount = safeApps.filter((a) => a.status === "interview").length;
  const readyCount = safeApps.filter((a) => a.status === "ready").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn w-full px-2 sm:px-4 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-panel via-booth to-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Hakkiri Apply Suite · Career Operating System
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
              Applications & Job Intake Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              End-to-end career workflow: free diagnostic audit, verified evidence store,
              ATS CV architect, intelligent Gap Map, and seamless mock practice hand-off.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/apply/jobs/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>+ Add Job Advert</span>
              <span className="text-xs">→</span>
            </Link>
            <Link
              href="/apply/applications"
              className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-panel-2 px-4 py-3 text-xs font-bold text-ink hover:bg-line transition duration-200"
            >
              Open Tracker Board →
            </Link>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-6 mt-6 border-t border-line/60">
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Applications Sent</div>
            <div className="text-3xl font-black text-ink mt-1">{sentCount}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span>✓</span> Logged with audit trail
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Interviews Scheduled</div>
            <div className="text-3xl font-black text-blue mt-1">{interviewsCount}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Ready for mock practice</div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Ready to Review</div>
            <div className="text-3xl font-black text-amber-400 mt-1">{readyCount}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Grounded in verified facts</div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">New Job Matches</div>
            <div className="text-3xl font-black text-purple-300 mt-1">{safeMatches.length}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Filtered by your floor salary</div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/apply/applications"
          className="group relative rounded-3xl border border-line bg-panel/80 p-6 hover:border-blue/50 hover:bg-panel transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
            📋
          </div>
          <h3 className="text-base font-extrabold text-ink group-hover:text-blue-soft transition">
            Applications Tracker
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Full 8-column Kanban board tracking roles from Matched, Preparing, Needs you, Ready, to Sent, Interview, and Offer.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Open Board <span>→</span>
          </div>
        </Link>

        <Link
          href="/apply/cvs"
          className="group relative rounded-3xl border border-line bg-panel/80 p-6 hover:border-blue/50 hover:bg-panel transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
            📄
          </div>
          <h3 className="text-base font-extrabold text-ink group-hover:text-blue-soft transition">
            CV & Resume Builder
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Dual-pane editor with live reactive ATS scoring, section on/off switches, and &quot;Tell me what you did&quot; bullet writer.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Open Builder <span>→</span>
          </div>
        </Link>

        <Link
          href="/apply/evidence"
          className="group relative rounded-3xl border border-line bg-panel/80 p-6 hover:border-blue/50 hover:bg-panel transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
            🔒
          </div>
          <h3 className="text-base font-extrabold text-ink group-hover:text-blue-soft transition">
            Evidence Bank
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            The confirmed store of career facts, metrics, and stories. The AI generator is strictly forbidden from inventing facts outside this bank.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Open Bank <span>→</span>
          </div>
        </Link>
      </div>

      {/* Sub-tools bar: Voice, Profile, Settings */}
      <div className="rounded-3xl border border-line bg-panel/80 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-ink">Candidate Settings & Styling Controls</h3>
          <p className="text-xs text-muted">
            Configure your Voice Persona, screening facts, daily application caps, and safety limits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/apply/voice"
            className="rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-ink hover:text-white hover:border-blue transition"
          >
            🎙️ Voice Persona
          </Link>
          <Link
            href="/apply/profile"
            className="rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-ink hover:text-white hover:border-blue transition"
          >
            👤 Candidate Profile
          </Link>
          <Link
            href="/apply/settings"
            className="rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-ink hover:text-white hover:border-blue transition"
          >
            ⚙️ Auto-Apply Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
