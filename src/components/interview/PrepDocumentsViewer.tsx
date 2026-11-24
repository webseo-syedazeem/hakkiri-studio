"use client";

import { useState } from "react";
import clsx from "clsx";
import { Icon, Panel } from "@/components/ui";

interface PrepDocumentsViewerProps {
  role: string;
  company: string;
  jobText?: string;
  jobUrl?: string;
  cvText?: string;
  cvFileName?: string;
  coverLetterText?: string;
  coverLetterFileName?: string;
}

export function PrepDocumentsViewer({
  role,
  company,
  jobText,
  jobUrl,
  cvText,
  cvFileName,
  coverLetterText,
  coverLetterFileName,
}: PrepDocumentsViewerProps) {
  const [activeTab, setActiveTab] = useState<"job" | "cv" | "cover">("job");
  const [copied, setCopied] = useState(false);

  const cleanJobUrl = jobUrl
    ? jobUrl.startsWith("http://") || jobUrl.startsWith("https://")
      ? jobUrl
      : `https://${jobUrl}`
    : null;

  const currentText =
    activeTab === "job" ? jobText : activeTab === "cv" ? cvText : coverLetterText;

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard?.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Panel className="p-5 sm:p-6 space-y-4" data-testid="prep-documents-hub">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-blue-fill/15 text-blue-soft border-blue-fill/25">
            <Icon name="doc" size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Application Documents & Job Spec</h2>
            <p className="text-xs text-muted">
              Your one-stop reference for the job description, your submitted CV, and cover letter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cleanJobUrl && activeTab === "job" && (
            <a
              href={cleanJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/90 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>View Job Advert</span>
              <span className="text-[10px] text-muted">↗</span>
            </a>
          )}
          {currentText && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/90 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <Icon name="check" size={12} className={copied ? "text-emerald-400" : "text-muted"} />
              <span>{copied ? "Copied" : "Copy text"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
            activeTab === "job"
              ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/35"
              : "text-muted hover:text-ink hover:bg-white/[0.03]",
          )}
        >
          Job Description
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cv")}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
            activeTab === "cv"
              ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/35"
              : "text-muted hover:text-ink hover:bg-white/[0.03]",
          )}
        >
          Uploaded CV {cvFileName ? `(${cvFileName})` : ""}
        </button>

        {coverLetterText && (
          <button
            type="button"
            onClick={() => setActiveTab("cover")}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "cover"
                ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/35"
                : "text-muted hover:text-ink hover:bg-white/[0.03]",
            )}
          >
            Cover Letter {coverLetterFileName ? `(${coverLetterFileName})` : ""}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl bg-panel-2 border border-line p-4 max-h-[360px] overflow-y-auto text-xs leading-relaxed text-muted font-normal space-y-2">
        {activeTab === "job" && (
          <>
            {jobText ? (
              <div className="whitespace-pre-line text-ink/90">{jobText}</div>
            ) : (
              <p className="text-dim italic">
                No full job specification was pasted at setup. Hakkiri synthesized your role requirements
                for {role} at {company} into the focus priorities shown below.
              </p>
            )}
            {cleanJobUrl && (
              <div className="pt-2 border-t border-line/60">
                <span className="text-dim">Original source: </span>
                <a
                  href={cleanJobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-soft hover:underline font-medium"
                >
                  {cleanJobUrl}
                </a>
              </div>
            )}
          </>
        )}

        {activeTab === "cv" && (
          <>
            {cvText ? (
              <div className="whitespace-pre-line text-ink/90">{cvText}</div>
            ) : (
              <p className="text-dim italic">
                {cvFileName
                  ? `Your uploaded CV (${cvFileName}) was read at setup. Structured facts, stories and metrics were verified and linked across your preparation sheet.`
                  : "No CV text was retained for this interview."}
              </p>
            )}
          </>
        )}

        {activeTab === "cover" && (
          <>
            {coverLetterText ? (
              <div className="whitespace-pre-line text-ink/90">{coverLetterText}</div>
            ) : (
              <p className="text-dim italic">No cover letter was uploaded for this application.</p>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
