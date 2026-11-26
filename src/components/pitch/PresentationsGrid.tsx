"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Chip, Panel } from "@/components/ui";
import { SlideView } from "./SlideView";
import type { Presentation } from "@/lib/pitch/types";
import { AUDIENCE_LABEL } from "@/lib/pitch/labels";
import { clock, daysBetween, longDay } from "@/lib/format";

export interface SerializedPresentation {
  presentation: Presentation;
  runsCount: number;
  readiness: {
    status: string;
    statusTone: string;
  };
  isDemo?: boolean;
}

export function PresentationsGrid({
  initialPresentations = [],
  today,
}: {
  initialPresentations: SerializedPresentation[];
  today: string;
}) {
  const [showExamples, setShowExamples] = useState(false);

  const own = initialPresentations.filter((p) => !p.isDemo);
  const demos = initialPresentations.filter((p) => p.isDemo);

  const renderCard = (item: SerializedPresentation, i: number) => {
    const p = item.presentation;
    const days = daysBetween(today, p.date);
    return (
      <Link
        key={p.id}
        href={`/presentations/${p.id}`}
        className="group block animate-rise"
        style={{ animationDelay: `${0.05 * i}s` }}
      >
        <Panel className="flex gap-5 p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.12)] dark:group-hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65)]">
          <SlideView
            slide={p.slides[0]}
            presentationId={p.id}
            className="w-[168px] shrink-0 self-start rounded-[6px] shadow-[0_0_0_1px_var(--color-line-strong)]"
            showNumber={false}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="truncate text-lg font-semibold tracking-[-0.01em]">{p.title}</h2>
              {item.isDemo && <Chip>Example</Chip>}
            </div>
            <div className="mt-0.5 whitespace-nowrap text-[13px] text-muted">
              {AUDIENCE_LABEL[p.audience]} · {Math.round(p.timeLimitSec / 60)} min · {p.slides.length} slides
            </div>
            <div className="mt-3 text-sm">
              {longDay(p.date)}, {clock(p.date)}{" "}
              <span className="text-muted">
                {days < 0 ? "(done)" : days === 0 ? "(today)" : days === 1 ? "(tomorrow)" : `(in ${days} days)`}
              </span>
            </div>
            <div
              className={clsx(
                "mt-2 text-[13px] font-semibold",
                item.readiness.statusTone === "red" ? "text-red-soft" : "text-lilac"
              )}
            >
              {item.readiness.status}
              {item.runsCount > 0 && (
                <span className="font-normal text-muted">
                  {" "}
                  · {item.runsCount} run{item.runsCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </Panel>
      </Link>
    );
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      {own.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
          {own.map((item, i) => renderCard(item, i))}
        </div>
      )}

      {own.length > 0 && demos.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-medium text-muted">
              {showExamples ? "Example presentations (read-only)" : "Looking for inspiration?"}
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
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
              {demos.map((item, i) => renderCard(item, i))}
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
            {demos.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      )}
    </div>
  );
}
