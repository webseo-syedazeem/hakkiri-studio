"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CustomSelect, type CustomSelectOption } from "@/components/ui";
import type { Application, Job, Evidence, Voice, Output } from "@/lib/apply/schema";

const APPLICATION_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "draft", label: "Draft", dotColor: "bg-zinc-400", description: "Not yet dispatched" },
  { value: "ready", label: "Ready to Send", dotColor: "bg-amber-400", description: "Approved & grounded" },
  { value: "queued", label: "Queued", dotColor: "bg-blue-400", description: "In dispatch pipeline" },
  { value: "sent", label: "Sent", dotColor: "bg-emerald-400", description: "Submitted to employer" },
  { value: "interview", label: "Interview Scheduled", dotColor: "bg-purple-400", description: "Ready for mock practice" },
  { value: "offer", label: "Offer Received", dotColor: "bg-emerald-300", description: "Decision reached" },
  { value: "rejected", label: "Rejected", dotColor: "bg-rose-400", description: "Closed application" },
];

export default function ApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [app, setApp] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<"gap" | "job" | "letter" | "answers" | "send">("gap");

  // Cover Letter Generator
  const [whyThisJob, setWhyThisJob] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [letterResult, setLetterResult] = useState<string | null>(null);

  // Status Updater
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/apply/applications/${id}`);
        const data = await res.json();
        if (data && data.application && data.job) {
          setApp(data.application);
          setJob(data.job);
          setEvidenceList(data.evidenceList || []);
          setVoice(data.voice || null);
          setOutputs(data.outputs || []);

          const existingLetter = data.outputs?.find((o: Output) => o.kind === "letter");
          if (existingLetter && existingLetter.versions?.[0]) {
            setLetterResult(existingLetter.versions[0].text);
          }
        } else {
          throw new Error("Application data not found in response");
        }
      } catch {
        // Not found, not this person's, or it couldn't be loaded. Nothing is shown in its place.
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!app) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/apply/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setApp(data);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingLetter(true);
    try {
      const res = await fetch(`/api/apply/applications/${id}/letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whyThisJob }),
      });
      const data = await res.json();
      if (res.ok && data.output?.versions?.[0]) {
        setLetterResult(data.output.versions[0].text);
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
    } finally {
      setGeneratingLetter(false);
    }
  };

  if (notFound || (!loading && (!app || !job))) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center" data-testid="application-not-found">
        <p className="text-sm font-bold text-ink">This application couldn’t be found</p>
        <p className="text-xs text-muted">It may have been removed, or it isn’t one of yours.</p>
        <Link href="/apply/applications" className="rounded-2xl border border-line bg-panel-2 px-4 py-2 text-xs font-bold text-ink">
          Back to your applications
        </Link>
      </div>
    );
  }

  if (loading || !app || !job) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const strongMatchesCount = app.gapMap.filter((g) => g.strength === "strong").length;

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-none px-2 sm:px-6 pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link
            href="/apply/applications"
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-panel-2/80 px-3.5 py-1.5 text-xs font-bold text-muted hover:text-ink hover:border-line-strong hover:bg-panel transition shadow-sm active:scale-95"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Back to Applications Tracker</span>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <h1 className="text-xl md:text-2xl font-black text-ink tracking-tight">
              {job.title || "Title not found in the advert"}
            </h1>
            <span className="text-muted text-sm font-medium">{job.employer ? `@ ${job.employer}` : "Employer not found in the advert"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted mt-1 font-mono">
            <span>📍 {job.location || "Location not found in the advert"}</span>
            <span>•</span>
            <span className="text-blue font-semibold">{job.applyRoute === "unknown" ? "How to apply: not known" : `${job.applyRoute} route`}</span>
          </div>
        </div>

        {/* Status & Match Fit Pill */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-panel border border-line px-4 py-2 text-center shadow-sm">
            <div className="text-[10px] text-muted font-bold uppercase">Match Fit</div>
            <div className="text-base font-black text-emerald-400">{(app as Application & { fitKnown?: boolean }).fitKnown === false ? "Not known" : `${app.fit}%`}</div>
          </div>

          <div className="w-52">
            <CustomSelect
              value={app.status}
              onChange={(newVal) => handleStatusChange(newVal)}
              options={APPLICATION_STATUS_OPTIONS}
              disabled={updatingStatus}
              align="right"
              size="sm"
            />
          </div>

          {app.status === "sent" || app.status === "interview" ? (
            <Link
              href="/interviews"
              className="rounded-2xl bg-blue-fill px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-hover transition"
            >
              Practise for this Role →
            </Link>
          ) : null}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-line gap-2 overflow-x-auto pb-1">
        {[
          { id: "gap", label: `Gap Map (${strongMatchesCount}/${app.gapMap.length} Matched)` },
          { id: "letter", label: "Cover Letter Generator" },
          { id: "job", label: "Job Description & Specs" },
          { id: "send", label: "Send log" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === tab.id
                ? "bg-accent text-white shadow"
                : "text-muted hover:text-ink hover:bg-card/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Gap Map */}
      {activeTab === "gap" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-booth p-6">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Requirement-to-Evidence Gap Map
                </h2>
                <p className="text-xs text-muted">
                  Every advert requirement mapped against verified evidence. Unmatched items invite you to supply facts, never invented by AI.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {strongMatchesCount} Strong Matches
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {job.requirements.map((req, i) => {
                const gap = app.gapMap.find((g) => g.requirementId === req.id);
                const strength = gap?.strength || "none";

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-line bg-card/60 p-4 space-y-2 hover:border-line-hover transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted">#{i + 1}</span>
                        <span className="text-xs font-bold text-white">{req.text}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-canvas text-muted border border-line">
                          {req.kind}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border self-start sm:self-auto ${
                          strength === "strong"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : strength === "partial"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {strength} evidence
                      </span>
                    </div>

                    <div className="text-[11px] text-muted italic bg-canvas/70 p-2.5 rounded-lg border border-line/60">
                      Advert context: &quot;{req.sourceQuote}&quot;
                    </div>

                    {strength === "none" && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted text-[11px]">No confirmed evidence in your bank yet.</span>
                        <Link
                          href="/apply/evidence"
                          className="text-accent hover:underline font-semibold text-[11px]"
                        >
                          + Do you have this? Add to Evidence Bank →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cover Letter Generator */}
      {activeTab === "letter" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Config Box (5 cols) */}
            <div className="md:col-span-5 rounded-2xl border border-line bg-booth p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Cover Letter Builder</h3>
                <p className="text-xs text-muted">
                  Grounded in your Gap Map and authentic writing style.
                </p>
              </div>

              <form onSubmit={handleGenerateCoverLetter} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white block mb-1">
                    Why this job? (In your own words)
                  </label>
                  <p className="text-[11px] text-muted mb-2">
                    What separates a great letter from filler. If skipped, Hakkiri writes a crisp 3-line covering note.
                  </p>
                  <textarea
                    rows={4}
                    value={whyThisJob}
                    onChange={(e) => setWhyThisJob(e.target.value)}
                    placeholder="e.g. I have followed their payments scaleup since 2024 and want to lead their next-generation API architecture..."
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingLetter}
                  className="w-full rounded-xl bg-accent py-3 text-xs font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {generatingLetter ? "Synthesizing Letter..." : "Generate Grounded Letter →"}
                </button>
              </form>
            </div>

            {/* Right Output Box (7 cols) */}
            <div className="md:col-span-7 rounded-2xl border border-line bg-booth p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-sm font-bold text-white">Generated Output</h3>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Zero Inventions Guaranteed
                </span>
              </div>

              {letterResult ? (
                <div className="rounded-xl border border-line bg-canvas p-5 text-xs text-ink/90 font-mono whitespace-pre-line leading-relaxed">
                  {letterResult}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line p-12 text-center text-xs text-muted">
                  Enter your &quot;Why this job?&quot; reason on the left to generate a personalized letter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Job Description */}
      {activeTab === "job" && (
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold text-white">Full Job Description Text</h3>
            <span className="text-xs text-muted">Tone: {job.tone}</span>
          </div>
          <div className="rounded-xl bg-canvas p-4 text-xs font-mono text-muted whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {job.text}
          </div>
        </div>
      )}

      {/* Tab 4: Send Log */}
      {activeTab === "send" && (
        <div className="rounded-2xl border border-line bg-booth p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold text-white">Send log</h3>
          </div>

          <p className="text-xs text-muted">
            Nothing has been sent for this application. Hakkiri doesn’t submit applications for you: you send it yourself, and can record where it has got to with the status above.
          </p>

          <div className="rounded-xl bg-canvas p-4 border border-line text-xs font-mono text-muted space-y-2">
            <div>• Application system: {job.applicationSystem || "Not known"}</div>
            <div>• Status: {app.status.toUpperCase()}</div>
            <div>• Route: {job.applyRoute === "unknown" ? "Not known" : job.applyRoute}</div>
            <div>• Last Checked: {new Date(app.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
