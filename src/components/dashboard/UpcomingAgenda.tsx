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
  relative: string;
  href: string;
  actionLabel: string;
}

export function UpcomingAgenda({ events }: { events: UpcomingEvent[] }) {
  const [filter, setFilter] = useState<"this-week" | "all">("this-week");

  // Show all 3 events on both views to fill the space cleanly and gracefully
  const displayed = filter === "this-week" ? events.slice(0, 3) : events;

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
            <p className="mt-0.5 text-[13px] text-muted">Your agenda for the next 7 days.</p>
          </div>
          <div className="inline-flex rounded-xl bg-panel-2 p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <button
              type="button"
              onClick={() => setFilter("this-week")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-300 cursor-pointer",
                filter === "this-week"
                  ? "bg-[#28324a] text-ink shadow-[0_2px_8px_rgba(0,0,0,0.4)] scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-300 cursor-pointer",
                filter === "all"
                  ? "bg-[#28324a] text-ink shadow-[0_2px_8px_rgba(0,0,0,0.4)] scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              All upcoming
            </button>
          </div>
        </div>

        {/* Event List */}
        <div className="mt-4 flex flex-col gap-3.5">
          {displayed.map((item, idx) => (
            <div
              key={item.id}
              className="animate-rise"
              style={{ animationDelay: `${0.06 * (idx + 1)}s` }}
            >
              <span className="mb-1.5 block text-xs font-semibold text-muted">
                {item.dateGroup}
              </span>
              <div className="group relative overflow-hidden flex items-center justify-between gap-3.5 rounded-[15px] bg-panel-2 p-4 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),inset_0_0_0_1px_var(--color-line-strong)]">
                {/* Subtle sheen highlight on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {/* Time & date pill */}
                <div className="shrink-0 text-left min-w-[70px]">
                  <div className="text-sm font-bold text-ink">{item.time}</div>
                  <div className="text-[11px] text-muted whitespace-nowrap mt-0.5">{item.dateGroup}</div>
                </div>

                {/* Details */}
                <div className="min-w-0 grow px-1">
                  {item.type === "interview" ? (
                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#1e2544] px-2.5 py-0.5 text-[11px] font-semibold text-[#818cf8] shadow-sm">
                      <Icon name="cal" size={11} /> Interview
                    </span>
                  ) : (
                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#162a26] px-2.5 py-0.5 text-[11px] font-semibold text-[#34d399] shadow-sm">
                      <Icon name="present" size={11} /> Presentation
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className="block text-[14px] font-semibold tracking-[-0.01em] text-ink hover:underline group-hover:text-blue-soft transition-colors leading-snug"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-muted mt-0.5">{item.subtitle}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                    <Icon name="cal" size={11} className="text-dim" />
                    <span>{item.relative}</span>
                  </div>
                </div>

                {/* Action button with sheen and micro-bounce */}
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

      {/* Bottom helper card to keep height balanced with other columns */}
      <div className="flex items-center justify-between rounded-[13px] bg-panel-2/70 px-4 py-3 text-xs text-muted shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-200 hover:bg-panel-2 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue shadow-[0_0_8px_var(--color-blue)]" />
          </span>
          <span className="font-medium text-ink">{displayed.length} sessions on your agenda</span>
        </span>
        <Link
          href="/interviews/new"
          className="group/link flex items-center gap-1 font-semibold text-blue-soft hover:underline transition-colors"
        >
          <Icon name="plus" size={13} strokeWidth={2.4} className="transition-transform duration-300 group-hover/link:rotate-90" />
          <span>Add session</span>
        </Link>
      </div>
    </div>
  );
}
