/** 75 → "1:15" */
export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "2026-10-29T10:00:00Z" → "Thursday 29 October" */
export function longDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" });
}

/** "2026-10-29T10:00:00Z" → "Thu 29 Oct" */
export function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" });
}

/** "a Data Analyst", "an Account Executive" */
export function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun.trim()) ? "an" : "a"} ${noun.trim()}`;
}

/** "2026-10-29T10:00:00Z" → "10:00" */
export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

/** Whole days from `from` to `to`, ignoring time of day. */
export function daysBetween(fromIso: string, toIso: string): number {
  const d = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  return Math.round((d(toIso) - d(fromIso)) / 86_400_000);
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export function inWords(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** London calendar date of an ISO time, e.g. "2026-10-24". */
function londonDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

/** "Today at 11:05", "Yesterday at 11:05", or "Sat 24 Oct at 11:05". */
export function whenSaid(iso: string, nowIso: string = new Date().toISOString()): string {
  const days = daysBetween(londonDate(iso), londonDate(nowIso));
  const day =
    days === 0
      ? "Today"
      : days === 1
        ? "Yesterday"
        : new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" });
  return `${day} at ${clock(iso)}`;
}

/** 1430 seconds → "24 minutes"; under a minute → "under a minute". */
export function minutesLong(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 1 ? "under a minute" : `${m} minute${m === 1 ? "" : "s"}`;
}
