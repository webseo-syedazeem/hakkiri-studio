"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { Finding, InterviewerQuestion } from "@/lib/apply/schema";
import { fromCheckPath, rememberCheck } from "@/lib/cv/carry";

interface FullAudit {
  id: string;
  score: number;
  subscores: {
    evidence: number;
    clarity: number;
    structure: number;
    software: number;
    fit?: number;
  };
  /** Every finding, once the check is the person's own or unlocked. */
  findings?: Finding[];
  /** Before that: the first findings, and how many there are in all. */
  teaserFindings?: Finding[];
  totalFindingsCount?: number;
  interviewerQuestions?: InterviewerQuestion[];
  region: string;
  isUnlocked: boolean;
  createdAt: string;
  /** Said by the server from this check's own results. */
  summary?: string;
  isGoodEnough?: boolean;
}

export default function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [audit, setAudit] = useState<FullAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/audit/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load audit");
        setAudit(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading audit report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3d4bd8] border-t-transparent" />
          <p className="text-xs">Loading diagnostic report...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-ink p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-2xl font-bold text-rose-700">Report Not Available</div>
          <p className="text-sm text-muted">{error || "Could not find the requested audit report."}</p>
          <Link
            href="/cv-audit"
            className="inline-block rounded-xl bg-[#3d4bd8] px-5 py-2.5 text-xs font-bold text-white"
          >
            Run New Free Audit
          </Link>
        </div>
      </div>
    );
  }

  // Until the check is opened in the builder (or unlocked), the server sends only its first findings.
  const findings = audit.findings ?? audit.teaserFindings ?? [];
  const total = audit.totalFindingsCount ?? findings.length;
  const hidden = Math.max(0, total - findings.length);
  const filteredFindings = filterArea === "all" ? findings : findings.filter((f) => f.area === filterArea);

  return (
    <div className="min-h-screen bg-white text-ink antialiased">
      {/* Top Bar */}
      {/* The site's own header is above: this bar only names the report and leads to the builder. */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="rounded-full bg-panel border border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
          Report #{audit.id.slice(4, 10)}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href={fromCheckPath(audit.id)}
            onClick={() => rememberCheck(audit.id)}
            className="rounded-lg bg-[#3d4bd8] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2e3ab8] transition shadow"
          >
            Fix in CV Builder →
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        {/* Score Card Header */}
        <div className="rounded-2xl border border-line bg-booth p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-panel border border-line text-muted mb-2">
                Diagnostic Score
              </div>
              <div className="text-5xl md:text-6xl font-extrabold text-ink tracking-tight">
                {audit.score}
                <span className="text-xl text-muted font-normal"> / 100</span>
              </div>
              {/* Said from this check's own results: what was found, and which part scored lowest. */}
              <p className="mt-2 text-sm font-semibold text-ink max-w-xl" data-testid="check-summary">
                <span className={audit.isGoodEnough ? "text-emerald-800" : "text-amber-800"}>{audit.summary || (audit.isGoodEnough ? "This CV is good enough to apply with." : "The findings below say what to look at first.")}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={fromCheckPath(audit.id)}
                onClick={() => rememberCheck(audit.id)}
                data-testid="open-in-builder"
                className="rounded-xl bg-[#3d4bd8] px-5 py-3 text-center text-xs font-bold text-white shadow-lg shadow-[#3d4bd8]/25 hover:bg-[#2e3ab8] transition"
              >
                Open in CV Builder →
              </Link>
              <Link
                href="/interviews"
                className="rounded-xl border border-line bg-panel/80 px-5 py-3 text-center text-xs font-bold text-ink hover:bg-panel transition"
              >
                Practise Questions →
              </Link>
            </div>
          </div>

          {/* Subscores Bar: each is the share earned of what could be judged from pasted text. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-line">
            <div className="rounded-xl bg-white p-3.5 border border-line">
              <div className="text-[11px] text-muted">Evidence (45 points)</div>
              <div className="text-xl font-bold text-ink mt-1">{audit.subscores.evidence}%</div>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-line">
              <div className="text-[11px] text-muted">Clarity (20 points)</div>
              <div className="text-xl font-bold text-ink mt-1">{audit.subscores.clarity}%</div>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-line">
              <div className="text-[11px] text-muted">Structure (20 points)</div>
              <div className="text-xl font-bold text-ink mt-1">{audit.subscores.structure}%</div>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-line">
              <div className="text-[11px] text-muted">Readable by software (15 points)</div>
              <div className="text-xl font-bold text-ink mt-1">{audit.subscores.software}%</div>
            </div>
          </div>
        </div>

        {/* The Interviewer's View (Competitor differentiator) */}
        {audit.interviewerQuestions && audit.interviewerQuestions.length > 0 && (
          <div className="rounded-2xl border border-[#3d4bd8]/30 bg-[#3d4bd8]/5 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <div>
                <h2 className="text-base font-bold text-ink">The Interviewer&apos;s View</h2>
                <p className="text-xs text-muted">
                  Questions a hiring manager will directly challenge you on based on the wording in this CV.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {audit.interviewerQuestions.map((iq) => (
                <div key={iq.id} className="rounded-xl border border-line bg-booth p-4 space-y-2.5">
                  <div className="text-xs text-muted font-mono italic bg-white p-2 rounded border border-line/50">
                    &quot;{iq.quote}&quot;
                  </div>
                  <div className="text-sm font-semibold text-ink">
                    {iq.question}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-accent">
                      Theme: {iq.practiceTheme || "Behavioral Impact"}
                    </span>
                    <Link
                      href="/interviews"
                      className="rounded-lg bg-[#3d4bd8]/20 border border-[#3d4bd8]/40 px-3 py-1 text-xs font-semibold text-accent hover:bg-[#3d4bd8]/30 transition"
                    >
                      Practise Answering This →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings Filter & List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
            <h2 className="text-lg font-bold text-ink">
              {hidden ? `Findings (${findings.length} of ${total})` : `Findings (${findings.length})`}
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["all", "evidence", "clarity", "structure", "software"].map((area) => (
                <button
                  key={area}
                  onClick={() => setFilterArea(area)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition ${
                    filterArea === area
                      ? "bg-[#3d4bd8] text-white"
                      : "bg-panel text-muted hover:text-ink"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {hidden > 0 && (
            <p className="rounded-xl border border-line bg-panel p-4 text-sm text-ink" data-testid="more-findings">
              {hidden === 1 ? "1 more finding is" : `${hidden} more findings are`} waiting.{" "}
              <Link href={fromCheckPath(audit.id)} onClick={() => rememberCheck(audit.id)} className="font-semibold text-[#3d4bd8] underline">
                Open this in the CV builder
              </Link>{" "}
              (a free account) to see them all and fix them line by line.
            </p>
          )}

          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-line bg-white p-5 space-y-3 hover:border-line-strong transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      finding.severity === "high"
                        ? "text-rose-700 bg-rose-500/10 border-rose-500/20"
                        : finding.severity === "medium"
                        ? "text-amber-800 bg-amber-500/10 border-amber-500/20"
                        : "text-blue-700 bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    {finding.severity} Severity · {finding.area}
                  </span>
                </div>

                {finding.quote?.trim() && (
                  <div className="rounded-lg bg-white p-3 border-l-2 border-[#3d4bd8] text-xs font-mono text-muted italic">
                    &quot;{finding.quote}&quot;
                  </div>
                )}

                <div className="text-sm font-medium text-ink">
                  Problem: <span className="font-normal text-muted">{finding.problem}</span>
                </div>

                <div className="text-sm font-medium text-emerald-800 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  Recommended Fix: <span className="text-ink">{finding.fix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
