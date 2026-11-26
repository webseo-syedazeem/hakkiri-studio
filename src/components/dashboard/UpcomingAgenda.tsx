"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui";

export interface UpcomingEvent {
  id: string;
  type: "interview" | "presentation";
  dateGroup: string;
  time: string;
  title: string;
  subtitle: string;
  relative?: string;
  href: string;
  actionLabel: string;
  /** Whether it falls within the next seven days. */
  thisWeek: boolean;
}

export function UpcomingAgenda({ events }: { events: UpcomingEvent[] }) {
  const [filter, setFilter] = useState<"this-week" | "all">("this-week");

  // "This week" is the next seven days. These are the person's own dated interviews and presentations.
  const displayed = filter === "this-week" ? events.filter((e) => e.thisWeek) : events;

  return (
    <div className="flex h-full flex-col justify-between gap-5">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink">Upcoming</h2>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-muted">
              Your own interviews and presentations that have a date.
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-panel-2 p-1 shadow-[inset_0_0_0_1px_var(--color-line)] shrink-0">
            <button
              type="button"
              aria-pressed={filter === "this-week"}
              onClick={() => setFilter("this-week")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer",
                filter === "this-week"
                  ? "bg-panel text-ink shadow-sm border border-line scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              This week
            </button>
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer",
                filter === "all"
                  ? "bg-panel text-ink shadow-sm border border-line scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              All upcoming
            </button>
          </div>
        </div>

        {/* Event List */}
        <div className="mt-4 flex flex-col gap-4" data-testid="home-agenda">
          {displayed.length === 0 && (
            <p className="rounded-[15px] bg-panel-2 border border-line p-4 text-xs text-muted leading-relaxed" data-testid="home-agenda-empty">
              {events.length === 0
                ? "Nothing is booked. When you add a date to an interview stage or a presentation, it shows here."
                : `Nothing in the next seven days. Your next one is ${events[0].relative ?? "later"}: choose “All upcoming” to see it.`}
            </p>
          )}
          {displayed.map((item, idx) => (
            <div
              key={item.id}
              className="animate-rise"
              style={{ animationDelay: `${0.06 * (idx + 1)}s` }}
            >
              <span className="mb-1.5 block text-xs font-semibold text-muted">
                {item.dateGroup}
                {item.relative ? <span className="font-normal"> · {item.relative}</span> : null}
              </span>
              <div className="group relative overflow-hidden flex items-center justify-between gap-3.5 rounded-[15px] bg-panel-2 border border-line p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-panel hover:border-line-strong hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6)]">
                {/* Subtle sheen highlight on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {/* Squircle Icon & Time / Type Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={clsx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-105",
                      item.type === "interview"
                        ? "bg-blue-500/10 text-blue-600 dark:bg-[#1a2238] dark:text-[#818cf8]"
                        : "bg-emerald-500/10 text-emerald-600 dark:bg-[#142825] dark:text-[#34d399]"
                    )}
                  >
                    <Icon name={item.type === "interview" ? "cal" : "present"} size={20} />
                  </div>
                  <div className="shrink-0 text-left">
                    <div className="text-sm font-bold text-ink font-mono">{item.time || <span className="font-sans text-xs font-medium text-muted">No time set</span>}</div>
                    <span
                      className={clsx(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5",
                        item.type === "interview"
                          ? "bg-blue-500/15 text-blue-600 dark:bg-[#1e2544] dark:text-[#818cf8]"
                          : "bg-emerald-500/15 text-emerald-600 dark:bg-[#162a26] dark:text-[#34d399]"
                      )}
                    >
                      {item.type === "interview" ? "Interview" : "Presentation"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 grow px-1">
                  <Link
                    href={item.href}
                    className="block text-[14px] font-semibold tracking-[-0.01em] text-ink hover:underline group-hover:text-blue-soft transition-colors leading-snug truncate"
                    title={item.title}
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-muted mt-0.5 truncate" title={item.subtitle}>
                    {item.subtitle}
                  </div>
                </div>

                {/* Action button */}
                <Link
                  href={item.href}
                  className="group/btn relative overflow-hidden inline-flex items-center justify-center rounded-[10px] bg-blue-fill px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(74,90,240,0.3)] transition-all duration-200 hover:bg-blue-hover hover:shadow-[0_0_20px_rgba(90,105,255,0.6)] active:scale-95 shrink-0"
                >
                  <span className="relative z-10">{item.actionLabel}</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Link: View calendar */}
      <div className="pt-2">
        <Link
          href="/interviews"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <Icon name="cal" size={14} className="text-muted group-hover:text-blue-soft transition-colors" />
          <span>See all your interviews →</span>
        </Link>
      </div>
    </div>
  );
}
