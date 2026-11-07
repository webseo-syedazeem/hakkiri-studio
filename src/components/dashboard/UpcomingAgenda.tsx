"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ButtonLink, Icon } from "@/components/ui";

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

  // If "this-week", show the top 2 events; if "all", show all
  const displayed = filter === "this-week" ? events.slice(0, 2) : events;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink">Upcoming</h2>
            <p className="mt-0.5 text-[13px] text-muted">Your agenda for the next 7 days.</p>
          </div>
          <div className="inline-flex rounded-xl bg-panel-2 p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <button
              type="button"
              onClick={() => setFilter("this-week")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer",
                filter === "this-week"
                  ? "bg-[#28324a] text-ink shadow-sm scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={clsx(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer",
                filter === "all"
                  ? "bg-[#28324a] text-ink shadow-sm scale-[1.02]"
                  : "text-muted hover:text-ink"
              )}
            >
              All upcoming
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {displayed.map((item, idx) => (
            <div
              key={item.id}
              className="animate-rise"
              style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
            >
              <span className="mb-2 block text-xs font-semibold text-muted">
                {item.dateGroup}
              </span>
              <div className="group flex items-center justify-between gap-3 rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5),inset_0_0_0_1px_var(--color-line-strong)]">
                {/* Time & date pill */}
                <div className="shrink-0 text-left">
                  <div className="text-sm font-bold text-ink">{item.time}</div>
                  <div className="text-[11px] text-muted whitespace-nowrap">{item.dateGroup}</div>
                </div>

                {/* Details */}
                <div className="min-w-0 grow px-1">
                  {item.type === "interview" ? (
                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#1e2544] px-2 py-0.5 text-[11px] font-semibold text-[#818cf8]">
                      <Icon name="cal" size={11} /> Interview
                    </span>
                  ) : (
                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#162a26] px-2 py-0.5 text-[11px] font-semibold text-[#34d399]">
                      <Icon name="present" size={11} /> Presentation
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-ink hover:underline group-hover:text-blue-soft transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-muted">{item.subtitle}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                    <Icon name="cal" size={11} className="text-dim" />
                    <span>{item.relative}</span>
                  </div>
                </div>

                {/* Action button */}
                <ButtonLink
                  href={item.href}
                  variant="primary"
                  size="sm"
                  className="shrink-0 !rounded-lg !px-3.5 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(74,90,240,0.4)]"
                >
                  {item.actionLabel}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom helper card to keep height balanced and fill dead space */}
      <div className="mt-5 flex items-center justify-between rounded-[12px] bg-panel-2/60 px-3.5 py-2.5 text-xs text-muted shadow-[inset_0_0_0_1px_var(--color-line)] transition-all hover:bg-panel-2">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
          </span>
          <span>{displayed.length} sessions scheduled</span>
        </span>
        <Link
          href="/interviews/new"
          className="flex items-center gap-1 font-semibold text-blue-soft hover:underline transition-colors"
        >
          <Icon name="plus" size={12} strokeWidth={2.4} /> Add new
        </Link>
      </div>
    </div>
  );
}
