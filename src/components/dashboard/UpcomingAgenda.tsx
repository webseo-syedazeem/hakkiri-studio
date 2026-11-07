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
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                filter === "this-week"
                  ? "bg-[#28324a] text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={clsx(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                filter === "all"
                  ? "bg-[#28324a] text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              All upcoming
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {displayed.map((item) => (
            <div key={item.id}>
              <span className="mb-2 block text-xs font-semibold text-muted">
                {item.dateGroup}
              </span>
              <div className="flex items-center justify-between gap-3 rounded-[14px] bg-panel-2 p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-all hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
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
                    className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-ink hover:underline"
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
                  className="shrink-0 !rounded-lg !px-3.5"
                >
                  {item.actionLabel}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
