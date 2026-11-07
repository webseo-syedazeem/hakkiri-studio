"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Chip, Panel } from "@/components/ui";
import { loadClientInterviews, type ClientInterviewSummary } from "@/lib/interviews/client-store";

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
  const [clientItems, setClientItems] = useState<ClientInterviewSummary[]>([]);

  const sync = () => {
    setClientItems(loadClientInterviews());
  };

  useEffect(() => {
    sync();
    const handleUpdate = () => sync();
    window.addEventListener("hk_interviews_updated", handleUpdate);
    return () => window.removeEventListener("hk_interviews_updated", handleUpdate);
  }, []);

  // Merge server items and client localStorage items, deduping by id
  const merged: SerializedInterview[] = [...initialInterviews];

  for (const c of clientItems) {
    if (!merged.some((m) => m.id === c.id)) {
      const diff = c.settings?.difficulty ? c.settings.difficulty.charAt(0).toUpperCase() + c.settings.difficulty.slice(1) : "Medium";
      const mins = c.settings?.minutes ?? 30;
      const preset = c.settings?.preset ? c.settings.preset.charAt(0).toUpperCase() + c.settings.preset.slice(1) : "Balanced";

      const isPractice = c.date === "Just Practice";
      const whenText = isPractice
        ? "Just Practice · On-demand"
        : c.date
          ? `${c.date}${c.time ? `, ${c.time}` : ""}`
          : "Upcoming interview";
      const whenRel = isPractice ? "Ready" : "Active";

      merged.unshift({
        id: c.id,
        company: c.company,
        companyInitial: c.companyInitial || c.company.charAt(0).toUpperCase(),
        role: c.role,
        isDemo: false,
        settingsLine: `${diff} · ${mins} min · ${preset}`,
        whenText,
        whenRel,
        verdictLabel: "Not started",
        verdictTone: "text-lilac",
        freshCount: 0,
      });
    }
  }

  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
      {merged.map((iv, i) => (
        <Link
          key={iv.id}
          href={`/interviews/${iv.id}`}
          className="group block animate-rise"
          style={{ animationDelay: `${0.05 * i}s` }}
        >
          <Panel className="flex gap-4 p-5 transition-shadow group-hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
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
                {iv.isDemo && <Chip>Demo</Chip>}
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
      ))}
    </div>
  );
}
