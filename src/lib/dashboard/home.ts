import { addDays } from "@/lib/dates";

/**
 * What the home screen says. All of it is worked out from the signed-in
 * person's own interviews, presentations and practice sessions. The built-in
 * example interview and presentation are never counted or put in the agenda:
 * they are examples, not the person's diary. With nothing of their own, the
 * counts are zero and the screen says what to do first.
 */

export interface HomeStage {
  name?: string;
  date?: string;
  time?: string;
  status?: string;
}

export interface HomeInterview {
  id: string;
  role: string;
  company: string;
  isDemo: boolean;
  /** ISO date-time of the real interview, when the person gave one. */
  date?: string;
  stages?: HomeStage[];
}

export interface HomePresentation {
  id: string;
  title: string;
  isDemo: boolean;
  /** ISO date-time of the real talk. */
  date?: string;
  minutes?: number;
}

export interface AgendaEvent {
  id: string;
  type: "interview" | "presentation";
  /** The London day it is on, "2026-11-28". */
  day: string;
  dateGroup: string;
  /** "10:00", or "" when no time was given. */
  time: string;
  title: string;
  subtitle: string;
  relative: string;
  href: string;
  actionLabel: string;
  thisWeek: boolean;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const dayNumber = (day: string) => Math.round(Date.parse(`${day}T12:00:00Z`) / 86_400_000);
const validDay = (y: number, m: number, d: number) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

/**
 * The day and time a date the person typed or picked falls on, in London.
 * Understands an ISO date or date-time, and "12 Nov 2026" / "Thu 12 Nov" /
 * "12 November" with an optional "10:00". A date with no year is taken as
 * its next occurrence. Anything else ("Just practice", "TBC") is no date.
 */
export function whenOf(date: string | undefined, time: string | undefined, today: string): { day: string; time: string } | null {
  const raw = (date ?? "").trim();
  if (!raw) return null;
  const clock = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec((time ?? "").trim());
  const hhmm = clock ? `${pad(+clock[1])}:${clock[2]}` : "";

  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(raw);
  if (iso) {
    if (!validDay(+iso[1], +iso[2], +iso[3])) return null;
    // A full instant ("…Z" or an offset) is shown as the London day and time it falls on.
    if (iso[4] && /(Z|[+-]\d{2}:?\d{2})$/.test(raw)) {
      const at = new Date(raw);
      if (Number.isNaN(at.getTime())) return null;
      return { day: at.toLocaleDateString("en-CA", { timeZone: "Europe/London" }), time: hhmm || at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/London" }) };
    }
    return { day: `${iso[1]}-${iso[2]}-${iso[3]}`, time: hhmm || (iso[4] ? `${iso[4]}:${iso[5]}` : "") };
  }

  const words = /^(?:[A-Za-z]{3,9},?\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?(?:\s+(\d{4}))?(?:,?\s+(\d{1,2}):(\d{2}))?$/.exec(raw);
  if (!words) return null;
  const month = MONTHS.indexOf(words[2].slice(0, 3).toLowerCase()) + 1;
  if (!month) return null;
  const d = +words[1];
  const inline = words[4] ? `${pad(+words[4])}:${words[5]}` : "";
  let year = words[3] ? +words[3] : +today.slice(0, 4);
  if (!validDay(year, month, d)) return null;
  // With no year given, a date that has already gone this year means next year's.
  if (!words[3] && `${year}-${pad(month)}-${pad(d)}` < today) year += 1;
  if (!validDay(year, month, d)) return null;
  return { day: `${year}-${pad(month)}-${pad(d)}`, time: hhmm || inline };
}

function relative(day: string, today: string): string {
  const days = dayNumber(day) - dayNumber(today);
  return days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
}

const dayLabel = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/**
 * What the person has coming up, soonest first: each of their own interviews'
 * dated stages that aren't completed (or the interview's own date when no
 * stage has one), and each of their own presentations. Nothing in the past,
 * nothing without a date, nothing from the examples.
 */
export function agenda(interviews: HomeInterview[], presentations: HomePresentation[], today: string): AgendaEvent[] {
  const weekEnd = addDays(today, 6);
  const out: AgendaEvent[] = [];
  const push = (e: Omit<AgendaEvent, "dateGroup" | "relative" | "thisWeek">) => {
    if (e.day < today) return;
    out.push({ ...e, dateGroup: dayLabel(e.day), relative: relative(e.day, today), thisWeek: e.day <= weekEnd });
  };

  for (const iv of interviews) {
    if (iv.isDemo) continue;
    const title = iv.role || "Interview";
    let staged = false;
    (iv.stages ?? []).forEach((st, i) => {
      if (st.status === "completed") return;
      const when = whenOf(st.date, st.time, today);
      if (!when) return;
      staged = true;
      push({ id: `${iv.id}:stage-${i + 1}`, type: "interview", day: when.day, time: when.time, title, subtitle: [iv.company, st.name].filter(Boolean).join(" · "), href: `/interviews/${iv.id}`, actionLabel: "Prepare" });
    });
    if (!staged) {
      const when = whenOf(iv.date, undefined, today);
      if (when) push({ id: iv.id, type: "interview", day: when.day, time: when.time, title, subtitle: iv.company, href: `/interviews/${iv.id}`, actionLabel: "Prepare" });
    }
  }
  for (const p of presentations) {
    if (p.isDemo) continue;
    const when = whenOf(p.date, undefined, today);
    if (when) push({ id: p.id, type: "presentation", day: when.day, time: when.time, title: p.title || "Presentation", subtitle: p.minutes ? `${p.minutes} min` : "", href: `/presentations/${p.id}`, actionLabel: "Rehearse" });
  }
  return out.sort((a, b) => a.day.localeCompare(b.day) || (a.time || "24:00").localeCompare(b.time || "24:00") || a.title.localeCompare(b.title));
}

/** The line at the top of the home screen. */
export function homeHeadline(events: AgendaEvent[], ownInterviews: number, ownPresentations: number): string {
  const week = events.filter((e) => e.thisWeek).length;
  if (week > 0) return `You have ${week} ${week === 1 ? "thing" : "things"} coming up this week.`;
  if (events.length > 0) return `Nothing this week. Your next one is ${events[0].relative}.`;
  if (ownInterviews + ownPresentations === 0) return "Set up your first interview to get started.";
  return "Nothing is booked yet. Add a date to an interview and it will show here.";
}
