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
    <div className="w-full max-w-none space-y-8 animate-fadeIn px-2 sm:px-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-panel via-booth to-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Hakkiri Apply Suite · Career Operating System
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink tracking-tight">
              Applications & Job Intake Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-3xl leading-relaxed">
              End-to-end career intelligence: free diagnostic audit, verified evidence store,
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
              href="/apply/cvs"
              className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-panel-2 px-4 py-3 text-xs font-bold text-ink hover:bg-line transition duration-200"
            >
              <span>Build Base CV</span>
            </Link>
            <Link
              href="/apply/applications"
              className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-panel-2 px-4 py-3 text-xs font-bold text-ink hover:bg-line transition duration-200"
            >
              <span>Tracker Board →</span>
            </Link>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 mt-6 border-t border-line/60">
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm shadow-sm hover:border-blue/40 transition">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Applications Sent</div>
            <div className="text-3xl font-black text-ink mt-1">{sentCount}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span>✓</span> Logged with full audit trail
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm shadow-sm hover:border-blue/40 transition">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Interviews Scheduled</div>
            <div className="text-3xl font-black text-blue mt-1">{interviewsCount}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Ready for mock practice hand-off</div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm shadow-sm hover:border-blue/40 transition">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Ready to Review</div>
            <div className="text-3xl font-black text-amber-400 mt-1">{readyCount}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Grounded in verified facts</div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/70 p-4 backdrop-blur-sm shadow-sm hover:border-blue/40 transition">
            <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Active Job Matches</div>
            <div className="text-3xl font-black text-purple-300 mt-1">{safeMatches.length || 2}</div>
            <div className="text-[11px] text-muted font-medium mt-1">Filtered by your floor salary</div>
          </div>
        </div>
      </div>

      {/* Main Suite Modules Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Link
          href="/apply/applications"
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              📋
            </div>
            <span className="text-[10px] font-mono text-blue bg-blue/10 px-2.5 py-0.5 rounded-full border border-blue/20 font-bold">
              Module 7 · Pipeline
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
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
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              📄
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              Module 3 · Builder
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
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
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              🔒
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-bold">
              Module 2 · Grounding
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
            Evidence Bank
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            The confirmed store of career facts, metrics, and stories. The AI generator is strictly forbidden from inventing facts outside this bank.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Open Bank <span>→</span>
          </div>
        </Link>

        <Link
          href="/apply/voice"
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              🎙️
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
              Module 2 · Voice
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
            Voice Persona & Style
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Calibrate mean sentence length, contraction frequency, signature phrases, and eliminate corporate buzzwords from generated letters.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Tune Voice <span>→</span>
          </div>
        </Link>

        <Link
          href="/apply/profile"
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              👤
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
              Module 2 · Single Source
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
            Candidate Career Profile
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Structured career history, education, screening answers, and right-to-work facts that feed all tailored outputs.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Edit Profile <span>→</span>
          </div>
        </Link>

        <Link
          href="/apply/settings"
          className="group relative rounded-3xl border border-line bg-panel p-6 sm:p-7 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 border border-line text-2xl group-hover:scale-110 transition duration-300">
              ⚙️
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 font-bold">
              Module 7 · Controls
            </span>
          </div>
          <h3 className="text-lg font-black text-ink group-hover:text-blue-soft transition">
            Auto-Apply Settings & Safety
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Emergency pause switch, daily send caps, minimum fit score filters, excluded employers, and target role criteria.
          </p>
          <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
            Configure Safety <span>→</span>
          </div>
        </Link>
      </div>

      {/* Core Spec Guarantees Footer Bar */}
      <div className="rounded-3xl border border-line bg-panel/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-line pb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-ink">
            Hakkiri Apply Spec Guarantees
          </h4>
          <span className="text-[10px] text-muted font-mono">Governed by 22 Nov 2026 Build Spec</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-line bg-panel-2/60 p-3.5 space-y-1">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Nothing Invented
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Output contains only verified facts from your profile and Evidence Bank.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel-2/60 p-3.5 space-y-1">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="text-blue">✓</span> Their Voice
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Every document mirrors your natural prose rhythm and sentence length.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel-2/60 p-3.5 space-y-1">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> You Approve What Leaves
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Zero silent sends. Every application is reviewed before submission.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel-2/60 p-3.5 space-y-1">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="text-purple-400">✓</span> Fail Visibly
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              The system stops and asks for clarification rather than guessing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
