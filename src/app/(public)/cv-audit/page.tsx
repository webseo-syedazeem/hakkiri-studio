"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

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
  /** One or two sentences made by the server from this check's own results. */
  summary?: string;
  interviewerQuestionsCount: number;
}

const SAMPLE_TECH_LEAD_CV = `ALEX MORGAN
alex.morgan@email.com • +44 7700 900123 • London, UK • linkedin.com/in/alexmorgan-tech

PROFESSIONAL SUMMARY
Senior Full Stack Engineer & Tech Lead with 7+ years of experience building scalable, high-throughput distributed architectures in fintech and cloud infrastructure.

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer & Tech Lead | FinTech Scaleup
London, UK (Hybrid) | 2022 – Present
• Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.
• Reduced cloud infrastructure latency by 42% through distributed Redis caching and query plan optimization.
• Led engineering team of 8 across backend, web, and DevOps; mentored 4 junior developers into mid-level positions.
• Implemented automated CI/CD deployment pipelines on AWS Kubernetes, cutting release cycle time from 3 days to 45 minutes.

Software Engineer | Cloud Infrastructure Labs
London, UK | 2019 – 2022
• Developed microservices handling 25,000+ requests per second using TypeScript, Next.js, and Node.js.
• Responsible for database migrations and zero-downtime PostgreSQL schema deployments across 12 customer tenants.
• Assisted product management with technical scoping and sprint planning for enterprise security features.

EDUCATION
BSc (Hons) Computer Science — University of Manchester (First Class Honours, 2015 – 2019)

TECHNICAL & CORE SKILLS
Languages & Frameworks: TypeScript, Python, Next.js, React, Node.js, Go
Cloud & DevOps: AWS (ECS, Lambda, RDS), Kubernetes, Docker, Terraform, CI/CD
Databases & Architecture: PostgreSQL, Redis, Event-Driven Architecture, Microservices, REST APIs, GraphQL`;

export default function CvAuditPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [jobText, setJobText] = useState("");
  const [showJobInput, setShowJobInput] = useState(false);
  // "Check against a job" (/cv-audit?job=1) opens with the job advert box out.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("job") === "1") setShowJobInput(true);
  }, []);
  const [region, setRegion] = useState<"uk" | "us">("uk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [email, setEmail] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleLoadSample = () => {
    setText(SAMPLE_TECH_LEAD_CV);
    setError(null);
  };

  const handleClear = () => {
    setText("");
    setJobText("");
    setError(null);
  };

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
    <div className="w-full bg-[#080811] text-white py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">
        {!result ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero / Intro */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue/15 border border-blue/30 text-blue-300 text-xs font-mono font-bold tracking-wide uppercase">
                <span>✦</span> Free CV check
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Free CV and resume check
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Know where your CV stands before you apply: a score, the lines to fix first, and the questions an interviewer is likely to ask.
              </p>
            </div>

            {/* What the check is, honestly */}
            <p className="text-center text-xs text-slate-400 max-w-2xl mx-auto py-3 border-y border-white/10">
              Hakkiri checks your CV against written rules in code: evidence, clarity, structure and how easily software can read the text.
              It is not a test against any named applicant-tracking system, and no employer sees this score.
            </p>

            {/* Audit Form Container */}
            <div className="rounded-3xl border border-white/15 bg-[#10111f] p-6 sm:p-8 shadow-2xl space-y-6">
              <form onSubmit={handleRunAudit} className="space-y-6">
                {/* Conventions & Regional Standard Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                      Conventions & Spelling Standard
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Select target market format to calibrate page length and spelling rules.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#18192c] p-1.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setRegion("uk")}
                      className={clsx(
                        "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        region === "uk"
                          ? "bg-blue text-white shadow-md shadow-blue/20"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>🇬🇧</span>
                      <span>UK (2-page standard)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegion("us")}
                      className={clsx(
                        "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        region === "us"
                          ? "bg-blue text-white shadow-md shadow-blue/20"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>🇺🇸</span>
                      <span>US (1-page standard)</span>
                    </button>
                  </div>
                </div>

                {/* CV Text Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="cv-text" className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>📄</span> Paste your CV / Resume Text
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition cursor-pointer"
                        title="Fill the box with an example CV that is not yours, to see how the check works"
                      >
                        <span>✦</span> Try an example CV (not yours)
                      </button>
                      {text.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      id="cv-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={12}
                      placeholder="Paste your full CV text here, including experience bullets, education, and technical skills..."
                      className="w-full rounded-2xl border border-white/10 bg-[#0c0d18] p-4 text-xs sm:text-sm font-mono text-white placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue leading-relaxed [scrollbar-width:none]"
                    />
                    <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-500">
                      {text.length} characters (min 50)
                    </div>
                  </div>
                </div>

                {/* Optional Job Description */}
                <div className="rounded-xl border border-white/10 bg-[#141528] p-3.5">
                  <button
                    type="button"
                    onClick={() => setShowJobInput(!showJobInput)}
                    className="text-xs font-bold text-blue-300 hover:text-blue-200 flex items-center justify-between w-full cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>{showJobInput ? "Remove target job description" : "Compare against specific job advert (Optional)"}</span>
                    </span>
                    <span className="text-xs">{showJobInput ? "▲" : "▼"}</span>
                  </button>

                  {showJobInput && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 animate-fadeIn">
                      <p className="text-[11px] text-slate-400">
                        Paste the target vacancy or careers link to evaluate your keyword match density and qualification coverage.
                      </p>
                      <textarea
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                        rows={4}
                        placeholder="Paste the job description or advert requirements..."
                        className="w-full rounded-xl border border-white/10 bg-[#0c0d18] p-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-blue focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-indigo-500 py-4 text-sm font-black text-white shadow-xl shadow-blue/25 hover:shadow-indigo-500/30 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Auditing Document with Code Checks…</span>
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      <span>Check my CV →</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* AUDIT RESULTS & ATS SPEEDOMETER SCREEN                          */
          /* =============================================================== */
          <div className="space-y-8 animate-fadeIn">
            {/* Top Score Banner with ATS Speedometer Gauge */}
            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#141528] to-[#0d0e19] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono font-bold">
                <span>✦</span> Your CV score
              </div>

              {/* Speedometer Gauge Visual */}
              <div className="relative w-52 h-26 mx-auto overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#27293d"
                    strokeWidth="8"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#resultScoreGrad)"
                    strokeWidth="8"
                    strokeDasharray="125.6"
                    strokeDashoffset={Math.max(10, 125.6 - (result.score / 100) * 125.6)}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="resultScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="40%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                  <span className="text-4xl font-black text-white font-mono">
                    {result.score}
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-bold uppercase tracking-wider",
                      result.isGoodEnough ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {result.isGoodEnough ? "Good enough to apply" : `${result.totalFindingsCount} ${result.totalFindingsCount === 1 ? "thing" : "things"} to look at`}
                  </span>
                </div>
              </div>

              {/* Said from this check's own results, never a stock line. */}
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed" data-testid="check-summary">
                {result.summary || (result.isGoodEnough ? "This CV is good enough to apply with." : "The findings below say what to look at first.")}
              </p>

              {/* 5 ATS Subscores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-left">
                <div className="rounded-2xl bg-[#18192c] p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono">Evidence (45 points)</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {result.subscores.evidence}%
                  </div>
                </div>
                <div className="rounded-2xl bg-[#18192c] p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono">Clarity (20 points)</div>
                  <div className="text-2xl font-black text-blue-300 font-mono mt-1">
                    {result.subscores.clarity}%
                  </div>
                </div>
                <div className="rounded-2xl bg-[#18192c] p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono">Structure (20 points)</div>
                  <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                    {result.subscores.structure}%
                  </div>
                </div>
                <div className="rounded-2xl bg-[#18192c] p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono">Readable by software (15 points)</div>
                  <div className="text-2xl font-black text-teal-300 font-mono mt-1">
                    {result.subscores.software}%
                  </div>
                </div>
              </div>
            </div>

            {/* Top Critical Findings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🔍</span> Critical Findings Detected ({result.teaserFindings.length} previewed)
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  +{result.totalFindingsCount - result.teaserFindings.length} more in unlocked report
                </span>
              </div>

              <div className="space-y-4">
                {result.teaserFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="rounded-2xl border border-white/10 bg-[#121324] p-5 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/25">
                        {finding.severity} Severity · {finding.area}
                      </span>
                    </div>

                    {finding.quote?.trim() && (
                      <div className="rounded-xl bg-[#090a14] p-3 border-l-4 border-blue text-xs font-mono text-slate-300 italic">
                        &quot;{finding.quote}&quot;
                      </div>
                    )}

                    <div className="text-xs text-slate-300">
                      <b className="text-white">Problem:</b> {finding.problem}
                    </div>

                    <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                      <b className="text-emerald-400">Recommended Fix:</b> {finding.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Unlock Gate */}
            <div className="rounded-3xl border border-blue/40 bg-gradient-to-b from-[#151730] to-[#0e0f1e] p-6 sm:p-8 shadow-2xl space-y-4 text-center">
              <div className="max-w-xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-mono font-bold">
                  <span>✓</span> Free 1-Click Access
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {result.interviewerQuestionsCount > 0 ? "Unlock the full report and interview questions" : "Unlock the full report"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  See all {result.totalFindingsCount} {result.totalFindingsCount === 1 ? "finding" : "findings"}
                  {result.interviewerQuestionsCount > 0 ? `, and ${result.interviewerQuestionsCount} ${result.interviewerQuestionsCount === 1 ? "question" : "questions"} an interviewer could ask about lines in this CV` : ""}. Then open the same text in the CV builder to fix them.
                </p>

                <form onSubmit={handleUnlock} className="space-y-4 pt-3 text-left">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to unlock your full report..."
                      required
                      className="w-full rounded-xl border border-white/15 bg-[#0a0b14] p-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-slate-900"
                        required
                      />
                      <span>
                        I agree to the <Link href="/terms" className="text-blue-400 underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 underline">Privacy Policy</Link>.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-slate-900"
                      />
                      <span>Send me occasional interview tips and career updates (optional).</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={unlocking}
                      className="flex-1 rounded-xl bg-blue hover:bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {unlocking ? "Unlocking Diagnostic Report…" : "Unlock Full Report →"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Scan Another
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
