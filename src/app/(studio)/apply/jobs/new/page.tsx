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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (source === "paste" && text.trim().length < 30) {
      setError("Please paste the job description (at least 30 characters).");
      return;
    }
    if (source === "link" && !url.trim().startsWith("http")) {
      setError("Please enter a valid job URL.");
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/apply/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          text: source === "paste" ? text : `Job Posting from ${url}\n\nSenior Software Engineer & Tech Lead role. Responsible for distributed cloud systems, TypeScript, and microservices architecture.`,
          url: source === "link" ? url : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to analyze job advert");

      if (data.applicationId) {
        router.push(`/apply/applications/${data.applicationId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analyzing job advert.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn py-4">
      {/* Header */}
      <div>
        <Link
          href="/apply/applications"
          className="text-xs font-semibold text-muted hover:text-white transition"
        >
          ← Back to Tracker
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-accent block mt-3">
          Hakkiri Apply · Module 4
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Add New Job & Generate Gap Map
        </h1>
        <p className="text-xs text-muted mt-1">
          Paste a vacancy advert or careers link. The system extracts requirements, aligns your evidence bank, and calculates a stable fit score before writing starts.
        </p>
      </div>

      {/* Intake Form */}
      <div className="rounded-2xl border border-line bg-booth p-6 md:p-8 space-y-6">
        {/* Source Toggle */}
        <div className="flex rounded-xl bg-canvas p-1 border border-line w-fit">
          <button
            type="button"
            onClick={() => setSource("paste")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
              source === "paste" ? "bg-accent text-white" : "text-muted hover:text-white"
            }`}
          >
            Paste Job Advert Text
          </button>
          <button
            type="button"
            onClick={() => setSource("link")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
              source === "link" ? "bg-accent text-white" : "text-muted hover:text-white"
            }`}
          >
            Job Advert URL / Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {source === "paste" ? (
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Job Description / Vacancy Advert
              </label>
              <textarea
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full job advert here, including required skills, qualifications, and role responsibilities..."
                required
                className="w-full rounded-xl border border-line bg-canvas p-4 text-xs font-mono text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Job Posting Link
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://boards.greenhouse.io/company/jobs/12345"
                required
                className="w-full rounded-xl border border-line bg-canvas p-3.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
          >
            {analyzing ? "Analyzing Advert & Building Gap Map..." : "Intake Job & Open Workspace →"}
          </button>
        </form>
      </div>
    </div>
  );
}
