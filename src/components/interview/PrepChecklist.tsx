"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  drillHref?: string;
}

export function PrepChecklist({
  items,
  interviewId,
}: {
  items: ChecklistItem[];
  interviewId: string;
}) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className="divide-y divide-line/60">
      {items.map((item) => {
        const isChecked = !!checkedIds[item.id];
        return (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1"
          >
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={clsx(
                  "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
                  isChecked
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold"
                    : "border-line bg-panel hover:border-line-strong text-transparent"
                )}
                aria-label={`Toggle ${item.title}`}
              >
                ✓
              </button>
              <div className="min-w-0 text-xs">
                <span
                  className={clsx(
                    "font-semibold transition-colors",
                    isChecked ? "text-muted line-through" : "text-ink"
                  )}
                >
                  {item.title}
                </span>
                <span className="text-muted"> — {item.description}</span>
              </div>
            </div>

            <Link
              href={item.drillHref || `/interviews/${interviewId}`}
              className="shrink-0 rounded-lg bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-ink border border-line hover:bg-white/[0.08] transition-colors"
            >
              Practise
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
