"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Chip, Panel } from "@/components/ui";
import { pruneClientInterviews } from "@/lib/interviews/client-store";

export interface SerializedInterview {
  id: string;
  company: string;
  companyInitial: string;
  role: string;
  isDemo?: boolean;
  settingsLine?: string;
  whenText?: string;
  whenRel?: string | null;
  verdictLabel?: string;
  verdictScore?: number | null;
  verdictTone?: string;
  freshCount?: number;
}

export function InterviewsGrid({
  initialInterviews = [],
}: {
  initialInterviews: SerializedInterview[];
}) {
  const [showExamples, setShowExamples] = useState(false);

  // The list is the server's: the interviews saved for the signed-in account, and nothing else. An interview
  // that exists only in this browser (left by someone else, or deleted since) is not shown, and is cleared out.
  useEffect(() => {
    pruneClientInterviews(initialInterviews.map((i) => i.id));
  }, [initialInterviews]);

  const own = initialInterviews.filter((iv) => !iv.isDemo);
  const demos = initialInterviews.filter((iv) => iv.isDemo);

  const renderCard = (iv: SerializedInterview, i: number) => (
    <Link
      key={iv.id}
      href={`/interviews/${iv.id}`}
      className="group block animate-rise"
      style={{ animationDelay: `${0.05 * i}s` }}
    >
      <Panel className="flex gap-4 p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.12)] dark:group-hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65)]">
        <span
          aria-hidden
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[13px] bg-halden text-[22px] font-bold text-[#ddebe5]"
        >
          {iv.companyInitial}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="truncate text-lg font-semibold tracking-[-0.01em]">
              {iv.company}
            </h2>
            {iv.isDemo && <Chip>Example</Chip>}
          </div>
          <div className="mt-0.5 truncate text-[13px] text-muted">
            {iv.role} {iv.settingsLine ? `· ${iv.settingsLine}` : ""}
          </div>
          <div className="mt-3 text-sm">
            {iv.whenText} {iv.whenRel && <span className="text-muted">({iv.whenRel})</span>}
          </div>
          <div className="mt-2 text-[13px] font-semibold">
            {iv.verdictLabel ? (
              <span className={iv.verdictTone || "text-lilac"}>
                {iv.verdictLabel}
                {typeof iv.verdictScore === "number" ? `, ${iv.verdictScore.toFixed(1)}` : ""}
              </span>
            ) : (
              <span className="text-lilac">Not started</span>
            )}
            <span className={clsx("font-normal text-muted")}>
              {" "}
              · {iv.freshCount ?? 0} interview{(iv.freshCount ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Panel>
    </Link>
  );

  return (
    <div className="mt-6 flex flex-col gap-6">
      {own.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-5">
          {own.map((iv, i) => renderCard(iv, i))}
        </div>
      )}

      {own.length > 0 && demos.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-medium text-muted">
              {showExamples ? "Example interviews (read-only)" : "Looking for inspiration?"}
            </span>
            <button
              type="button"
              onClick={() => setShowExamples((v) => !v)}
              className="text-xs font-semibold text-blue-soft hover:underline cursor-pointer"
            >
              {showExamples ? "Hide examples" : "Show examples"}
            </button>
          </div>
          {showExamples && (
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-5">
              {demos.map((iv, i) => renderCard(iv, i))}
            </div>
          )}
        </div>
      )}

      {own.length === 0 && demos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <span>Examples</span>
            <span className="text-[11px] font-normal lowercase text-dim">· not counted in your totals</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-5">
            {demos.map((iv, i) => renderCard(iv, i))}
          </div>
        </div>
      )}
    </div>
  );
}
