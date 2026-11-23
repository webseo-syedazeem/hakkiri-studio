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
        const appsData = await appRes.json();
        const matchesData = await matchRes.json();
        setApplications(appsData || []);
        setMatches(matchesData || []);
      } catch (err) {
        console.error("Error loading apply dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sentCount = applications.filter((a) => a.status === "sent" || a.status === "screen" || a.status === "interview").length;
  const interviewsCount = applications.filter((a) => a.status === "interview").length;
  const readyCount = applications.filter((a) => a.status === "ready").length;

  return (
    <div className="max-w-6xl space-y-8 animate-fadeIn w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Hakkiri Apply Suite</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Applications & Job Intake Hub
          </h1>
          <p className="text-xs text-muted mt-1">
            End-to-end career workflow: from free audit, profile evidence, and tailored CVs to auto-apply and practice hand-off.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/apply/jobs/new"
            className="rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition"
          >
            + Add New Job Advert
          </Link>
          <Link
            href="/apply/applications"
            className="rounded-xl border border-line bg-card px-4 py-2.5 text-xs font-bold text-ink hover:bg-line transition"
          >
            Open Tracker Board →
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line bg-booth p-5">
          <div className="text-xs text-muted font-medium">Applications Sent</div>
          <div className="text-3xl font-extrabold text-white mt-1.5">{sentCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">✓ Logged with audit trail</div>
        </div>
        <div className="rounded-2xl border border-line bg-booth p-5">
          <div className="text-xs text-muted font-medium">Interviews Scheduled</div>
          <div className="text-3xl font-extrabold text-accent mt-1.5">{interviewsCount}</div>
          <div className="text-[11px] text-muted mt-1">Ready for mock practice</div>
        </div>
        <div className="rounded-2xl border border-line bg-booth p-5">
          <div className="text-xs text-muted font-medium">Ready to Review & Send</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1.5">{readyCount}</div>
          <div className="text-[11px] text-muted mt-1">Grounded in verified facts</div>
        </div>
        <div className="rounded-2xl border border-line bg-booth p-5">
          <div className="text-xs text-muted font-medium">New Job Matches</div>
          <div className="text-3xl font-extrabold text-ink mt-1.5">{matches.length}</div>
          <div className="text-[11px] text-muted mt-1">Filtered by your floor salary</div>
        </div>
      </div>

      {/* Quick Launchpad Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/apply/applications"
          className="rounded-2xl border border-line bg-booth p-6 hover:border-line-hover transition space-y-2 group shadow-sm"
        >
          <div className="text-2xl">📋</div>
          <h3 className="text-sm font-bold text-white group-hover:text-accent transition">
            Applications Tracker
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Kanban board tracking every role from Matched, Preparing, Needs you, Ready, to Sent, Interview, and Offer.
          </p>
        </Link>

        <Link
          href="/apply/cvs"
          className="rounded-2xl border border-line bg-booth p-6 hover:border-line-hover transition space-y-2 group shadow-sm"
        >
          <div className="text-2xl">📄</div>
          <h3 className="text-sm font-bold text-white group-hover:text-accent transition">
            CV & Resume Builder
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Dual-pane editor with live 200ms reactive ATS scoring, section on/off switches, and &quot;Tell me what you did&quot; bullet writer.
          </p>
        </Link>

        <Link
          href="/apply/evidence"
          className="rounded-2xl border border-line bg-booth p-6 hover:border-line-hover transition space-y-2 group shadow-sm"
        >
          <div className="text-2xl">🔒</div>
          <h3 className="text-sm font-bold text-white group-hover:text-accent transition">
            Evidence Bank
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            The confirmed store of career facts, numbers, and stories. The AI generator is strictly forbidden from inventing facts outside this bank.
          </p>
        </Link>
      </div>

      {/* Sub-tools bar: Voice, Profile, Settings */}
      <div className="rounded-2xl border border-line bg-booth p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Candidate Settings & Styling Controls</h3>
          <p className="text-xs text-muted mt-0.5">
            Configure your Voice Persona, screening facts, daily application caps, and safety limits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/apply/voice"
            className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:text-white hover:bg-line transition"
          >
            🎙️ Voice Persona
          </Link>
          <Link
            href="/apply/profile"
            className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:text-white hover:bg-line transition"
          >
            👤 Candidate Profile
          </Link>
          <Link
            href="/apply/settings"
            className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:text-white hover:bg-line transition"
          >
            ⚙️ Auto-Apply Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
