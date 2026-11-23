"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn py-6 px-2 sm:px-4">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/apply/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
        >
          <span>←</span> Back to Tracker
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[11px] font-bold tracking-wide uppercase mt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse" />
          Hakkiri Apply · Intelligent Job Intake
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
          Add New Job & Generate Gap Map
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Paste a vacancy advert or careers link. The system extracts requirements, aligns your verified
          Evidence Bank, and calculates a stable fit score before writing starts.
        </p>
      </div>

      {/* Intake Form Card */}
      <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        {/* Source Toggle */}
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
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full job advert here, including required skills, responsibilities, tech stack, and employer details..."
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
                className="w-full rounded-2xl border border-line bg-panel-2 px-4 py-3 text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-none transition"
                required
              />
              <p className="text-[11px] text-muted">
                Works with Greenhouse, Lever, Workday, SmartRecruiters, and general employer career portals.
              </p>
            </div>
          )}

          {analyzing ? (
            <div className="rounded-2xl border border-blue/30 bg-blue/10 p-5 space-y-3 text-center animate-fadeIn">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue border-t-transparent mx-auto" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-ink">{analyzingStep}</div>
                <div className="text-[10px] text-muted">
                  Building structured requirements and calculating evidence alignment...
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
  );
}
