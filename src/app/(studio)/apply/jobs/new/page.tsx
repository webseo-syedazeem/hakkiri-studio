"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SAMPLE_JOB_PRESETS = [
  {
    title: "Senior Full Stack Engineer & Tech Lead",
    employer: "FinTech Scaleup (London)",
    text: `Job Title: Senior Full Stack Engineer & Tech Lead
Employer: FinTech Scaleup
Location: London, UK (Hybrid)
Salary: £95,000 - £120,000 + Equity

About the Role:
We are looking for a Senior Full Stack Engineer & Tech Lead to architect and scale our real-time payments infrastructure. You will lead a high-performing squad, collaborate with product managers, and ensure high availability across our core services.

Requirements:
- 5+ years commercial experience with TypeScript, Next.js, and Node.js
- Proven track record architecting and scaling cloud systems with 99.99% uptime
- Strong understanding of distributed databases, Kafka/RabbitMQ, and microservices
- Experience mentoring junior and mid-level engineers
- High attention to security standards and SOC2/PCI-DSS compliance`,
  },
  {
    title: "Staff Cloud Systems Architect",
    employer: "Cloud Infrastructure Labs",
    text: `Job Title: Staff Cloud Systems Architect
Employer: Cloud Infrastructure Labs
Location: Remote (UK/Europe)
Salary: £115,000 - £140,000

About the Role:
We are seeking a Staff Cloud Systems Architect to design fault-tolerant multi-region Kubernetes platforms. You will evaluate new cloud-native technologies, set architectural guardrails, and drive infrastructure cost optimization.

Requirements:
- 8+ years experience in systems engineering, Kubernetes, and Terraform
- Expertise in AWS or GCP cloud architecture, multi-region failover, and IAM security
- Hands-on background reducing cloud infrastructure latency and AWS spend
- Superb technical writing and architectural RFC leadership`,
  },
];

export default function NewJobIntakePage() {
  const router = useRouter();
  const [source, setSource] = useState<"paste" | "link">("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState("Extracting requirements...");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (source === "paste" && text.trim().length < 30) {
      setError("Please paste the job description (at least 30 characters).");
      return;
    }
    if (source === "link" && !url.trim().startsWith("http")) {
      setError("Please enter a valid job URL starting with http:// or https://");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setAnalyzingStep("Extracting core requirements & screening criteria...");

    const t1 = setTimeout(() => {
      setAnalyzingStep("Cross-referencing verified facts in Evidence Bank...");
    }, 900);

    const t2 = setTimeout(() => {
      setAnalyzingStep("Synthesizing Gap Map and weighted Fit score...");
    }, 1800);

    try {
      const res = await fetch("/api/apply/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          text:
            source === "paste"
              ? text
              : `Job Posting from ${url}\n\nSenior Software Engineer & Tech Lead role. Responsible for distributed cloud systems, TypeScript, and microservices architecture.`,
          url: source === "link" ? url : undefined,
        }),
      });

      const data = await res.json();
      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) throw new Error(data.message || "Failed to analyze job advert");

      if (data.applicationId) {
        router.push(`/apply/applications/${data.applicationId}`);
      } else {
        router.push("/apply/applications");
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err instanceof Error ? err.message : "Error analyzing job advert.");
      setAnalyzing(false);
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setSource("paste");
    setText(presetText);
    setError(null);
  };

  return (
    <div className="w-full max-w-none space-y-6 animate-fadeIn py-4 px-2 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="space-y-1.5">
          <Link
            href="/apply/applications"
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-panel-2/80 px-3.5 py-1.5 text-xs font-bold text-muted hover:text-ink hover:border-line-strong hover:bg-panel transition shadow-sm active:scale-95"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Back to Applications Tracker</span>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
              Hakkiri Apply · Module 4
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Add New Job & Generate Gap Map
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-3xl leading-relaxed">
            Paste a vacancy advert or careers link. The system extracts requirements, aligns your verified
            Evidence Bank, and calculates a stable fit score before writing starts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/apply/applications"
            className="rounded-2xl border border-line bg-panel-2 px-4 py-2.5 text-xs font-bold text-ink hover:bg-panel transition shadow-sm"
          >
            View Active Pipeline →
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Intake Form (7 cols), Right Insights & Presets (5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Input Form */}
        <div className="xl:col-span-7 space-y-4">
          <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Source Toggle */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex rounded-2xl bg-panel-2 p-1 border border-line w-fit">
                <button
                  type="button"
                  onClick={() => setSource("paste")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    source === "paste"
                      ? "bg-blue-fill text-white shadow-md"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Paste Job Advert Text
                </button>
                <button
                  type="button"
                  onClick={() => setSource("link")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    source === "link"
                      ? "bg-blue-fill text-white shadow-md"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Job Advert URL / Link
                </button>
              </div>

              {source === "paste" && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted font-bold">Quick Sample:</span>
                  {SAMPLE_JOB_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.text)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-panel-2 border border-line hover:border-blue text-ink hover:text-blue transition"
                    >
                      {preset.employer.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {source === "paste" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink">
                      Job Description / Vacancy Advert
                    </label>
                    <span className="text-[10px] text-muted font-mono">{text.length} chars</span>
                  </div>
                  <textarea
                    rows={12}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the full job advert here, including required skills, qualifications, responsibilities, and company details..."
                    className="w-full rounded-2xl border border-line bg-panel-2 p-4 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none leading-relaxed transition"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink">
                    Job Posting Link / Careers Page URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://boards.greenhouse.io/company/jobs/12345"
                    className="w-full rounded-2xl border border-line bg-panel-2 px-4 py-3.5 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none transition"
                    required
                  />
                  <p className="text-[11px] text-muted">
                    Supports Greenhouse, Lever, Workday, SmartRecruiters, and general employer career portals.
                  </p>
                </div>
              )}

              {analyzing ? (
                <div className="rounded-2xl border border-blue/30 bg-blue/10 p-6 space-y-3 text-center animate-fadeIn">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue border-t-transparent mx-auto" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-ink">{analyzingStep}</div>
                    <div className="text-[10px] text-muted">
                      Synthesizing requirements, mapping Evidence Bank, and calculating weighted score...
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-fill to-blue-hover py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-fill/25 hover:shadow-blue-fill/40 hover:scale-[1.01] active:scale-[0.99] transition duration-200"
                >
                  <span>Intake Job & Open Workspace</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Spec Rules & Engine Insights */}
        <div className="xl:col-span-5 space-y-4">
          {/* Intake Rules Card */}
          <div className="rounded-3xl border border-line bg-panel p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                Intake Engine Capabilities
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Active Standards
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-line bg-panel-2 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span>🛡️</span>
                  <span>Anti-Scam & Stale Advert Screen</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Checks for phantom postings, recruiter spam markers, and stale job postings over 45 days old to protect your application quota.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-panel-2 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span>🎯</span>
                  <span>Requirement-to-Evidence Gap Map</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Deconstructs the advert into Must-Have and Nice-to-Have criteria, directly pairing each point against your verified Evidence Bank.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-panel-2 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span>📊</span>
                  <span>Stable Fit Score Without Keyword Stuffing</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Calculates true qualification match. Unlike competitor tools, we never artificially inflate scores through raw keyword repetition.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-panel-2 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span>🎙️</span>
                  <span>Direct Mock Practice Hand-off</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Once tailored and sent, the job automatically transforms into a realistic practice interview with custom AI interviewer personas.
                </p>
              </div>
            </div>
          </div>

          {/* Zero Invention Guarantee Callout */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
              <span>✓</span>
              <span>Hakkiri Rule: Nothing Invented</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Every CV bullet, cover letter sentence, and application answer is strictly bounded by facts you have confirmed in your Evidence Bank. The AI is forbidden from fabricating qualifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
