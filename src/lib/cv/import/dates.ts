/**
 * Reading dates out of a CV line: "Mar 2021 – Present", "03/2018 - 06/2020",
 * "2016–19", "(2022 to now)", "Expected June 2026". Dates come back as the
 * person gave them, to the month where a month was given and to the year
 * otherwise. Nothing is guessed: a year alone stays a year.
 */

export interface FoundDates {
  /** "", "2021" or "2021-03". */
  start: string;
  end: string;
  /** The end is "present", "now", "to date"… */
  current: boolean;
  /** Only one date was given, not a range. */
  single: boolean;
  /** A season, or a day/month order that could be read two ways: worth a check. */
  approx: boolean;
  /** Where the dates sit in the line. */
  index: number;
  length: number;
}

const MON = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const SEASON = "spring|summer|autumn|fall|winter";
const YEAR = "(?:19[5-9]\\d|20[0-4]\\d)";
const monthNumber = (name: string) => ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(name.slice(0, 3).toLowerCase()) + 1;
const pad = (n: number) => String(n).padStart(2, "0");

interface Atom {
  value: string;
  approx: boolean;
  index: number;
  end: number;
}

/** One date: a month and year, a numeric month/year, a full date, a season or a bare year. */
const ATOM = new RegExp(
  [
    `\\b(?<mon1>${MON})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+(?<y1>${YEAR})\\b`, // May 21, 2020
    `\\b(?<mon2>${MON})\\.?,?\\s*(?<y2>${YEAR})\\b`, // May 2020, May, 2020
    `\\b(?<mon3>${MON})\\.?\\s*['’](?<yy3>\\d{2})\\b`, // May '20
    `\\b(?<season>${SEASON})\\s+(?<y4>${YEAR})\\b`, // Summer 2019
    `(?<![\\d/.-])(?<d5>\\d{1,2})[/.](?<m5>\\d{1,2})[/.](?<y5>${YEAR})\\b`, // 01/09/2019
    `(?<![\\d/.-])(?<m6>0?[1-9]|1[0-2])[/.-](?<y6>${YEAR})\\b`, // 09/2019
    `(?<![\\d/.-])(?<y7>${YEAR})[/.-](?<m7>0[1-9]|1[0-2])\\b(?![/.-]?\\d)`, // 2019-09
    `(?<![\\d£$€#,.])(?<y8>${YEAR})(?!\\d|%|[.,]\\d)`, // 2019
  ].join("|"),
  "gi",
);

const PRESENT = /^\s*(?:present|current(?:ly)?|now|to\s?date|till\s?date|ongoing|today|date)\b/i;
const SEPARATOR = /^\s*(?:[-–—−→]+|to|until|till|through|thru|up to)\s*/i;
const SHORT_YEAR = /^(\d{2})(?!\d|[/.]\d)/;
const OPEN_START = /\b(?:since|from)\s*$/i;

function atoms(text: string): Atom[] {
  const out: Atom[] = [];
  for (const m of text.matchAll(ATOM)) {
    const g = m.groups ?? {};
    let value = "";
    let approx = false;
    if (g.mon1) value = `${g.y1}-${pad(monthNumber(g.mon1))}`;
    else if (g.mon2) value = `${g.y2}-${pad(monthNumber(g.mon2))}`;
    else if (g.mon3) value = `${Number(g.yy3) > 45 ? "19" : "20"}${g.yy3}-${pad(monthNumber(g.mon3))}`;
    else if (g.season) {
      value = g.y4;
      approx = true;
    } else if (g.y5) {
      // 01/09/2019: day first in the UK, month first in the US. Keep the month only when it can be read one way.
      const a = Number(g.d5);
      const b = Number(g.m5);
      if (a > 12 && b <= 12) value = `${g.y5}-${pad(b)}`;
      else if (b > 12 && a <= 12) value = `${g.y5}-${pad(a)}`;
      else if (a === b && a <= 12) value = `${g.y5}-${pad(a)}`;
      else {
        value = g.y5;
        approx = true;
      }
    } else if (g.y6) value = `${g.y6}-${pad(Number(g.m6))}`;
    else if (g.y7) value = `${g.y7}-${g.m7}`;
    else if (g.y8) value = g.y8;
    if (value) out.push({ value, approx, index: m.index, end: m.index + m[0].length });
  }
  return out;
}

/** The first date range in a line, or failing that its first single date. Null when the line has no date. */
export function findDates(text: string): FoundDates | null {
  const list = atoms(text);
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const after = text.slice(a.end);
    const sep = after.match(SEPARATOR);
    if (sep) {
      const rest = after.slice(sep[0].length);
      const restAt = a.end + sep[0].length;
      const present = rest.match(PRESENT);
      if (present) return { start: a.value, end: "", current: true, single: false, approx: a.approx, index: a.index, length: restAt + present[0].length - a.index };
      const b = list[i + 1];
      const lead = rest.match(/^\s*(?:(?:expected|anticipated|projected|est\.?|due)\s+)?/i)?.[0].length ?? 0;
      if (b && b.index === restAt + lead) {
        return { start: a.value, end: b.value, current: false, single: false, approx: a.approx || b.approx, index: a.index, length: b.end - a.index };
      }
      const short = rest.match(SHORT_YEAR);
      if (short && /^\d{4}$/.test(a.value)) {
        const end = `${a.value.slice(0, 2)}${short[1]}`;
        if (Number(end) >= Number(a.value)) return { start: a.value, end, current: false, single: false, approx: false, index: a.index, length: restAt + 2 - a.index };
      }
    }
    // "2019/2020" and "2019/20": an academic or financial year.
    const slash = after.match(/^\/(\d{4}|\d{2})(?!\d)/);
    if (slash && /^\d{4}$/.test(a.value)) {
      const end = slash[1].length === 4 ? slash[1] : `${a.value.slice(0, 2)}${slash[1]}`;
      if (Number(end) === Number(a.value) + 1) return { start: a.value, end, current: false, single: false, approx: false, index: a.index, length: a.end + slash[0].length - a.index };
    }
  }
  const a = list[0];
  if (!a) return null;
  if (OPEN_START.test(text.slice(0, a.index))) return { start: a.value, end: "", current: true, single: false, approx: a.approx, index: a.index, length: a.end - a.index };
  return { start: a.value, end: a.value, current: false, single: true, approx: a.approx, index: a.index, length: a.end - a.index };
}

/** How long something lasted, which CVs and LinkedIn add after dates: "(3 years 9 months)", "seven months". */
const NUMBER_WORD = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|eighteen";
const DURATION = new RegExp(`[(\\[]?\\s*\\b(?:\\d{1,2}|${NUMBER_WORD})\\+?\\s*(?:years?|yrs?|months?|mos?|weeks?)\\b(?:,?\\s*(?:and\\s*)?(?:\\d{1,2}|${NUMBER_WORD})\\s*(?:months?|mos?)\\b)?\\s*[)\\]]?`, "gi");
const DATE_LEAD = /(?:\b(?:since|from|expected|graduat(?:ed|ing|ion)|completed|completion|class of|due)\b[\s:]*)$/i;

/**
 * The line with its dates taken out, along with the brackets, separators and
 * "(3 years)" durations that travel with them. Used to read the title and
 * employer from what is left.
 */
export function withoutDates(text: string, found: FoundDates): string {
  let before = text.slice(0, found.index).replace(DATE_LEAD, "");
  let after = text.slice(found.index + found.length);
  after = after.replace(new RegExp(`^\\s*[,;:]?\\s*${DURATION.source}`, "i"), " ");
  before = before.replace(/[\s([,;:|·•–—-]+$/, "");
  after = after.replace(/^[\s)\],;:|·•–—-]+/, "");
  return [before.trim(), after.trim()].filter(Boolean).join("\t").replace(/\(\s*\)|\[\s*\]/g, "").trim();
}

/** Takes "(3 years 9 months)" style durations out of a line. */
export const withoutDurations = (text: string) => text.replace(DURATION, " ").replace(/\(\s*\)/g, "").replace(/ {2,}/g, " ").trim();

/** True when the line is nothing but dates (and perhaps a duration): a line of its own in many layouts. */
export function isOnlyDates(text: string): boolean {
  const found = findDates(text);
  if (!found) return false;
  return withoutDates(text, found).replace(/[\s·|,;:()–—-]/g, "") === "";
}

/** Words that belong to dates, for checking that nothing else on a line was lost. */
export const DATE_WORD = new RegExp(`^(?:${MON}|${SEASON}|present|current|currently|now|date|to|until|till|through|ongoing|today|since|from|expected|yrs?|years?|mos?|months?|weeks?|and|${NUMBER_WORD}|\\d{1,4}|\\d{2}(?:st|nd|rd|th))$`, "i");
