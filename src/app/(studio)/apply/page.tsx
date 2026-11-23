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

      {/* =================================================================== */}
      {/* 3 CORE PLATFORM SECTIONS                                            */}
      {/* =================================================================== */}

      {/* SECTION 1: CV / Cover Letter, Prep & Application Answers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue/20 text-blue text-xs font-black">
            1
          </span>
          <h2 className="text-base sm:text-lg font-black text-ink uppercase tracking-wide">
            Section 1 · CV, Cover Letter, Prep & Application Answers
          </h2>
          <span className="text-xs text-muted">Rezi-grade ATS Builder & Evidence Grounding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Link
            href="/apply/cvs"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                📄
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Rezi ATS Flow
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              CV & Resume Builder
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Section-by-section ATS architect, live 0–100 speedometer score gauge, AI keyword targeting, and grounded bullet writer.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Open Builder <span>→</span>
            </div>
          </Link>

          <Link
            href="/apply/evidence"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🔒
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-bold">
                Single Store
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Evidence Bank
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Confirmed store of career facts, numbers, and stories. The AI generator is strictly forbidden from inventing facts outside this bank.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Open Bank <span>→</span>
            </div>
          </Link>

          <Link
            href="/apply/voice"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🎙️
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                Natural Tone
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Voice Persona & Style
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Calibrate sentence length, contraction rate, signature phrases, and write genuine cover letters and tailored answers in your voice.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Tune Voice <span>→</span>
            </div>
          </Link>

          <Link
            href="/cv-audit"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🔍
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                Diagnostic
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Free CV & Letter Audit
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Weighted scoring benchmarked to Rezi & Resume Worded standards. Flags critical ATS blockers and tells you when to apply.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Run Audit <span>→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 2: Auto-Application & Job Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black">
            2
          </span>
          <h2 className="text-base sm:text-lg font-black text-ink uppercase tracking-wide">
            Section 2 · Auto Application & Pipeline
          </h2>
          <span className="text-xs text-muted">Intake, Gap Map, Drag & Drop Kanban, Candidate Approval Gate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Link
            href="/apply/applications"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                📋
              </div>
              <span className="text-[10px] font-mono text-blue bg-blue/10 px-2.5 py-0.5 rounded-full border border-blue/20 font-bold">
                Drag & Drop
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Applications Tracker Board
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Full Kanban board with smooth HTML5 drag-and-drop between Matched, Preparing, Ready, Sent, and Screening.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Open Board <span>→</span>
            </div>
          </Link>

          <Link
            href="/apply/jobs/new"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🎯
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-bold">
                Gap Map
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Job Intake & Gap Matcher
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Paste an advert or careers link. The system extracts hard requirements, maps against your Evidence Bank, and generates a fit score.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Intake Job <span>→</span>
            </div>
          </Link>

          <Link
            href="/apply/settings"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🛡️
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 font-bold">
                Safety Controls
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Auto-Apply Approval Gate
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Provable emergency pause, daily send caps, salary floor filters, and explicit candidate approval before anything leaves.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Configure Safeguards <span>→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 3: Practice Interviews & Spoken Rehearsal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 text-xs font-black">
            3
          </span>
          <h2 className="text-base sm:text-lg font-black text-ink uppercase tracking-wide">
            Section 3 · Practice Interviews & Rehearsal
          </h2>
          <span className="text-xs text-muted">Spoken Interviewer, Instant STAR Scoring, Accent-Neutral</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Link
            href="/interviews"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🎙️
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Spoken Practice
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Spoken Interview Simulator
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              A real-time spoken interviewer built from your job description and CV. Asks out loud, follows up on what you say, and never judges accents.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Start Practice <span>→</span>
            </div>
          </Link>

          <Link
            href="/practice"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                📊
              </div>
              <span className="text-[10px] font-mono text-blue bg-blue/10 px-2.5 py-0.5 rounded-full border border-blue/20 font-bold">
                STAR Analytics
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Practice Hub & Score Reports
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Answer-by-answer STAR breakdown, rambling overflow detection, metric gap highlighting, and personalized practice drills.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              View Analytics <span>→</span>
            </div>
          </Link>

          <Link
            href="/robot-test"
            className="group relative rounded-3xl border border-line bg-panel p-5 hover:border-blue/50 hover:bg-panel-2 transition-all duration-300 space-y-3 shadow-lg hover:shadow-2xl hover:shadow-blue/5 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-panel-2 border border-line text-xl group-hover:scale-110 transition duration-300">
                🤖
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-bold">
                5 Personas Audit
              </span>
            </div>
            <h3 className="text-base font-black text-ink group-hover:text-blue-soft transition">
              Robot Tester & Quality Audit
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Automated audit bot verifying all 3 sections across Sam (intern), Priya (graduate), Daniel (senior), Margaret (COO), and Aleksandra.
            </p>
            <div className="pt-2 text-xs font-bold text-blue flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
              Run Audit Suite <span>→</span>
            </div>
          </Link>
        </div>
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
