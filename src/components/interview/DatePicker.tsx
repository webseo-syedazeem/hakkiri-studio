"use client";

import { useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function parseDateString(str: string): { day: number; month: number; year: number } {
  const parts = str.trim().split(/\s+/);
  const now = new Date();
  let day = parseInt(parts[0], 10);
  let month = now.getMonth();
  let year = now.getFullYear();

  if (parts.length >= 2) {
    const foundIdx = MONTH_SHORT.findIndex((m) => parts[1].toLowerCase().startsWith(m.toLowerCase()));
    if (foundIdx !== -1) month = foundIdx;
  }
  if (parts.length >= 3) {
    const y = parseInt(parts[2], 10);
    if (!isNaN(y) && y >= 2000) year = y;
  }
  if (isNaN(day) || day < 1 || day > 31) day = now.getDate();

  return { day, month, year };
}

export function formatDateString(day: number, month: number, year: number): string {
  return `${day} ${MONTH_SHORT[month]} ${year}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  // 0 is Sunday, 1 is Monday ... shift so Monday is 0
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

export function CalendarPopup({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const parsed = parseDateString(value);
  const [currentYear, setCurrentYear] = useState(parsed.year);
  const [currentMonth, setCurrentMonth] = useState(parsed.month);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 z-50 mt-2 w-64 rounded-2xl border border-line bg-[#151824] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md animate-scale-in"
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-line/60">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer"
        >
          <Icon name="back" size={13} />
        </button>
        <span className="text-xs font-bold text-ink">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-panel-2 hover:text-ink transition-colors cursor-pointer rotate-180"
        >
          <Icon name="back" size={13} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>Su</span>
      </div>

      {/* Days Grid */}
      <div className="mt-1.5 grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected =
            dayNum === parsed.day &&
            currentMonth === parsed.month &&
            currentYear === parsed.year;
          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => {
                onChange(formatDateString(dayNum, currentMonth, currentYear));
                onClose();
              }}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer",
                isSelected
                  ? "bg-blue-fill text-white font-bold shadow-[0_0_12px_rgba(74,90,240,0.6)] scale-105"
                  : "text-ink hover:bg-panel-2 hover:text-blue-soft"
              )}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Quick Picks & Done */}
      <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            onChange(formatDateString(today.getDate(), today.getMonth(), today.getFullYear()));
            onClose();
          }}
          className="font-semibold text-blue-soft hover:underline cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            onChange(formatDateString(nextWeek.getDate(), nextWeek.getMonth(), nextWeek.getFullYear()));
            onClose();
          }}
          className="text-muted hover:text-ink cursor-pointer"
        >
          In 1 week
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-panel-2 px-2 py-0.5 text-muted hover:text-ink cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function TimePickerPopup({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const times = [
    "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];
  const [customTime, setCustomTime] = useState(value);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 z-50 mt-2 w-48 rounded-2xl border border-line bg-[#151824] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md animate-scale-in"
    >
      <div className="flex items-center justify-between pb-2 border-b border-line/60 text-xs font-bold text-ink">
        <span>Select Time</span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink cursor-pointer"
        >
          <Icon name="x" size={13} />
        </button>
      </div>

      <div className="mt-2 max-h-48 overflow-y-auto pr-1 flex flex-col gap-1">
        {times.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              onChange(t);
              onClose();
            }}
            className={clsx(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left",
              t === value
                ? "bg-blue-fill text-white font-bold"
                : "text-ink hover:bg-panel-2 hover:text-blue-soft"
            )}
          >
            <span>{t}</span>
            {t === value && <Icon name="check" size={12} strokeWidth={2.5} />}
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-line/60 flex items-center gap-1.5">
        <input
          type="text"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
          placeholder="Custom time"
          className="w-full bg-[#12141c] rounded-lg px-2.5 py-1 text-xs text-ink outline-none border border-line focus:border-blue-fill"
        />
        <button
          type="button"
          onClick={() => {
            if (customTime.trim()) {
              onChange(customTime.trim());
              onClose();
            }
          }}
          className="rounded-lg bg-blue-fill px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-hover cursor-pointer"
        >
          Set
        </button>
      </div>
    </div>
  );
}
