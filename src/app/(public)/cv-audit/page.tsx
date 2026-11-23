"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/brand/Mark";

interface TeaserFinding {
  id: string;
  area: string;
  severity: "high" | "medium" | "low";
  quote: string;
  problem: string;
  fix: string;
}

interface AuditResponse {
  auditId: string;
  score: number;
  subscores: {
    evidence: number;
    clarity: number;
    structure: number;
    software: number;
    fit?: number;
  };
  teaser: string[];
  teaserFindings: TeaserFinding[];
  totalFindingsCount: number;
  isGoodEnough: boolean;
  interviewerQuestionsCount: number;
}

export default function CvAuditPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [jobText, setJobText] = useState("");
  const [showJobInput, setShowJobInput] = useState(false);
  const [region, setRegion] = useState<"uk" | "us">("uk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [email, setEmail] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) {
      setError("Please paste at least 50 characters of your CV or resume.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jobText: showJobInput && jobText.trim() ? jobText : undefined,
          region,
          docType: "cv",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to audit document");
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!agreedTerms) {
      setError("Please agree to the Terms of Service to unlock your report.");
      return;
    }

    if (!result) return;
    setError(null);
    setUnlocking(true);

    try {
      const res = await fetch(`/api/audit/${result.auditId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketing: marketingConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unlock");

      router.push(`/audit/${result.auditId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unlock report.");
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-line bg-booth/95 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Mark size={24} badge />
          <span className="text-[17px] font-bold tracking-tight text-white">Hakkiri</span>
          <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-semibold text-accent border border-accent/30">
            Free CV Audit
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-line bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-card transition"
          >
            Open Studio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {!result ? (
          <div>
            {/* Header / Intro */}
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-accent mb-4">
                ✨ Deep Diagnostic Rubric v2026.1
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Free CV & Resume Audit
              </h1>
              <p className="mt-3 text-base text-muted max-w-2xl mx-auto">
                Discover your instant ATS score, quantified metrics ratio, duty-word traps, and the tough questions interviewers will challenge you with.
              </p>
            </div>

            {/* Audit Form Box */}
            <div className="rounded-2xl border border-line bg-booth/90 p-6 shadow-2xl backdrop-blur-sm md:p-8">
              <form onSubmit={handleRunAudit} className="space-y-6">
                {/* Region Selector */}
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Conventions & Spelling
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegion("uk")}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        region === "uk"
                          ? "bg-accent text-white shadow"
                          : "bg-card text-muted hover:text-ink"
                      }`}
                    >
                      🇬🇧 UK (2-page standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegion("us")}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        region === "us"
                          ? "bg-accent text-white shadow"
                          : "bg-card text-muted hover:text-ink"
                      }`}
                    >
                      🇺🇸 US (1-page standard)
                    </button>
                  </div>
                </div>

                {/* CV Text Area */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="cv-text" className="text-sm font-semibold text-ink">
                      Paste your CV / Resume Text
                    </label>
                    <span className="text-xs text-muted">
                      {text.length} chars (min 50)
                    </span>
                  </div>
                  <textarea
                    id="cv-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    placeholder="Paste your full CV text here, including experience bullets, education, and skills..."
                    className="w-full rounded-xl border border-line bg-canvas p-4 text-sm font-mono text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Optional Job Description */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowJobInput(!showJobInput)}
                    className="text-xs font-medium text-accent hover:underline flex items-center gap-1.5"
                  >
                    {showJobInput ? "− Remove target job description" : "+ Compare with a specific job advert (Optional)"}
                  </button>

                  {showJobInput && (
                    <div className="mt-3">
                      <textarea
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                        rows={5}
                        placeholder="Paste the job description or advert to audit keyword match & requirement coverage..."
                        className="w-full rounded-xl border border-line bg-canvas p-3.5 text-xs font-mono text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {loading ? "Auditing Document with Code Checks..." : "Run Instant Free Audit →"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Audit Teaser & Gate Screen */
          <div className="space-y-8 animate-fadeIn">
            {/* Top Score Banner */}
            <div className="rounded-2xl border border-line bg-booth p-6 md:p-8 text-center relative overflow-hidden">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-muted mb-2">
                Document Score Preview
              </div>
              <div className="text-6xl md:text-7xl font-extrabold text-white tracking-tight my-2">
                {result.score}
                <span className="text-2xl text-muted font-normal"> / 100</span>
              </div>
              <p className="text-sm font-medium text-muted">
                {result.score >= 85
                  ? "🌟 Strong CV: This CV is ready. Stop polishing and apply."
                  : result.score >= 70
                  ? "👍 Good with gaps: A few critical improvements will double interview calls."
                  : "⚠️ Needs Work: High-severity duty phrasing and missing metrics detected."}
              </p>

              {/* Subscores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-line text-left">
                <div className="rounded-xl bg-card/60 p-3 border border-line">
                  <div className="text-[11px] text-muted">Evidence & Metrics (35%)</div>
                  <div className="text-lg font-bold text-ink">{result.subscores.evidence}%</div>
                </div>
                <div className="rounded-xl bg-card/60 p-3 border border-line">
                  <div className="text-[11px] text-muted">Clarity & Brevity (25%)</div>
                  <div className="text-lg font-bold text-ink">{result.subscores.clarity}%</div>
                </div>
                <div className="rounded-xl bg-card/60 p-3 border border-line">
                  <div className="text-[11px] text-muted">Structure & Norms (20%)</div>
                  <div className="text-lg font-bold text-ink">{result.subscores.structure}%</div>
                </div>
                <div className="rounded-xl bg-card/60 p-3 border border-line">
                  <div className="text-[11px] text-muted">ATS Software Read (10%)</div>
                  <div className="text-lg font-bold text-ink">{result.subscores.software}%</div>
                </div>
              </div>
            </div>

            {/* Top 3 Teaser Findings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  3 Most Critical Findings Detected
                </h2>
                <span className="text-xs text-muted">
                  +{result.totalFindingsCount - result.teaserFindings.length} more in full report
                </span>
              </div>

              <div className="space-y-4">
                {result.teaserFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="rounded-xl border border-line bg-card/70 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {finding.severity} Severity · {finding.area}
                      </span>
                    </div>

                    <div className="rounded-lg bg-canvas p-3 border-l-2 border-accent text-xs font-mono text-muted/90 italic">
                      &quot;{finding.quote}&quot;
                    </div>

                    <div className="text-sm font-medium text-white">
                      Problem: <span className="font-normal text-muted">{finding.problem}</span>
                    </div>

                    <div className="text-sm font-medium text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      Fix: <span className="text-ink">{finding.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Unlock Gate */}
            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6 md:p-8 backdrop-blur-md">
              <div className="max-w-xl mx-auto text-center space-y-3">
                <h3 className="text-xl font-bold text-white">
                  Unlock Full Report & Interview Questions
                </h3>
                <p className="text-xs text-muted">
                  Get the complete diagnostic breakdown ({result.totalFindingsCount} findings), live ATS scanner output, and the {result.interviewerQuestionsCount} challenger interview questions.
                </p>

                <form onSubmit={handleUnlock} className="space-y-4 pt-2 text-left">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to unlock..."
                      required
                      className="w-full rounded-xl border border-line bg-canvas p-3.5 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 text-xs text-muted">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-line"
                        required
                      />
                      <span>
                        I agree to the Terms of Service and Privacy Policy. No password required.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-0.5 rounded border-line"
                      />
                      <span>
                        (Optional) Send me interview tips and platform updates.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={unlocking}
                    className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
                  >
                    {unlocking ? "Unlocking Report..." : "Unlock Full Report Free →"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
