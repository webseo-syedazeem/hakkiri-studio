/**
 * Dates for the prototype. The demo week moves with the real calendar, so
 * "today" on the home screen always matches the clock and the reports.
 * (Read once when the server starts.)
 */

/** Today's date in London, e.g. "2026-10-25". */
export function londonToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

/** "2026-10-25" + 3 days → "2026-10-28" */
export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** A London wall-clock time as an ISO instant, correct in summer and winter time. */
export function londonIso(day: string, hhmm: string): string {
  const guess = new Date(`${day}T${hhmm}:00Z`);
  const shown = guess.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/London" });
  const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  return new Date(guess.getTime() - (mins(shown) - mins(hhmm)) * 60_000).toISOString();
}

/** The prototype's "today". */
export const DEMO_TODAY = londonToday();
