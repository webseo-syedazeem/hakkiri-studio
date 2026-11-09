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
            className="flex items-start justify-between gap-3 py-3 -mx-2 px-2 rounded-xl transition-colors hover:bg-white/[0.02] first:pt-1.5 last:pb-1.5"
          >
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={clsx(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer active:scale-90",
                  isChecked
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold shadow-[0_0_8px_rgba(16,185,129,0.25)] scale-105"
                    : "border-white/15 bg-white/[0.04] hover:border-white/30 text-transparent"
                )}
                aria-label={`Toggle ${item.title}`}
              >
                ✓
              </button>
              <div className="min-w-0 text-xs">
                <span
                  className={clsx(
                    "font-semibold transition-all duration-200",
                    isChecked ? "text-muted line-through opacity-60" : "text-ink"
                  )}
                >
                  {item.title}
                </span>
                <span className={clsx("transition-colors", isChecked ? "text-muted/60" : "text-muted")}> — {item.description}</span>
              </div>
            </div>

            <Link
              href={item.drillHref || `/interviews/${interviewId}`}
              className="shrink-0 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:text-white border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
            >
              Practise
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
