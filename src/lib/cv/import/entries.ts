import { type Bullet, type Entry, type EntryKind, emptyEntry, newBullet } from "../schema";
import type { FlagDraft, Sources } from "./contact";
import { tidyUrl } from "./contact";
import { type FoundDates, findDates, isOnlyDates, withoutDates, withoutDurations } from "./dates";
import { GRADE, INSTITUTION, ORG_STRONG, ORG_WORD, QUALIFICATION, TITLE_HINT, TITLE_WORD, looksLikePlace } from "./lexicon";
import { type DocLine, isAllCaps, plain, wordCount } from "./lines";

export interface EntriesResult {
  entries: Entry[];
  /** Flags carry the entry id; the caller fills in the section. */
  flags: FlagDraft[];
  /** Which lines of the file each field and bullet came from, keyed "entryId/field" or "entryId/bulletId". */
  sources: Sources;
}

/** A bullet read from one line of the file, carrying that line as its source. */
const uploaded = (text: string, l: DocLine): Bullet => newBullet(text, "upload", [{ kind: "upload", lines: [l.n], page: l.page, text: plain(l) }]);
const note = (sources: Sources, e: Entry, field: string, lines: number[]) => {
  const key = `${e.id}/${field}`;
  sources[key] = [...new Set([...(sources[key] ?? []), ...lines])];
};

export interface EntryContext {
  /** LinkedIn's own PDF has a fixed layout: employer, then title, then dates, then place. */
  linkedin: boolean;
}

/* ------------------------------------------------------- telling lines apart */

const SMALL_WORD = /^(?:of|and|the|for|in|at|to|a|an|on|with|by|&|de|la|le|du|van|von)$/i;
const IRREGULAR_VERB = /^(?:led|ran|built|won|grew|cut|wrote|made|took|set|drove|oversaw|taught|sold|bought|brought|kept|held|began|chose|dealt|drew|gave|met|sent|spoke|spent|saw|did|was|were|had|am|is|helped|worked|responsible)$/i;
const URL_IN_TEXT = /(?<![@\w.-])(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|co\.uk|org|net|io|dev|me|uk|co|ai|app)(?![a-z0-9-])(?:\/[^\s,;|<>()]*)?/i;

function capitalRatio(text: string): number {
  const ws = text.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ]/.test(w) && !SMALL_WORD.test(w));
  if (!ws.length) return 0;
  return ws.filter((w) => /^[^A-Za-zÀ-ÿ]*[A-ZÀ-Þ]/.test(w)).length / ws.length;
}

const startsWithVerb = (text: string) => {
  const first = text.split(/\s+/)[0] ?? "";
  return /^[A-Za-z]+(?:ed|ing)$/.test(first) || IRREGULAR_VERB.test(first);
};

const endsLikeSentence = (text: string) => /[a-zà-ÿ]{3}[.!?]$/.test(text);

/** The dates on a line that could head an entry. A year inside a sentence does not count. */
function headerDates(l: DocLine): FoundDates | null {
  if (l.bullet) return null;
  const text = plain(l);
  const d = findDates(text);
  if (!d) return null;
  const rest = withoutDates(text, d).replace(/\t/g, " ");
  if (wordCount(rest) > 14 || endsLikeSentence(rest)) return null;
  if (d.single && (wordCount(rest) > 10 || (startsWithVerb(rest) && wordCount(rest) > 4))) return null;
  return d;
}

/** A line with no dates that still reads as part of an entry's heading: a title, an employer or a place. */
function isHeaderText(l: DocLine): boolean {
  if (l.bullet) return false;
  const t = plain(l);
  const n = wordCount(t);
  if (n > 12 || endsLikeSentence(t)) return false;
  if (l.bold || l.heading > 0 || isAllCaps(t)) return true;
  if (looksLikePlace(t)) return true;
  const cap = capitalRatio(t);
  if (n <= 4 && cap >= 0.5) return true;
  if (startsWithVerb(t) && n >= 4) return false;
  if (TITLE_WORD.test(t) || ORG_WORD.test(t) || TITLE_HINT.test(t) || INSTITUTION.test(t)) return cap >= 0.5 || n <= 6;
  return cap >= 0.7;
}

/* ----------------------------------------------------------------- grouping */

interface Group {
  header: DocLine[];
  body: DocLine[];
  /** How many heading lines came before the dated line. */
  pre: number;
}

/**
 * Splits a section into entries: runs of heading lines (title, employer,
 * dates, place) each followed by the lines that describe them. Several dated
 * headings in a row, with nothing between, are separate entries.
 */
function groupEntries(lines: DocLine[]): Group[] {
  type Kind = "D" | "H" | "B";
  const kinds: Kind[] = lines.map((l) => (headerDates(l) ? "D" : isHeaderText(l) ? "H" : "B"));
  const groups: Group[] = [];
  let layoutPre: number | null = null;
  let i = 0;
  while (i < lines.length) {
    // A run of heading lines…
    const head: number[] = [];
    while (i < lines.length && kinds[i] !== "B") head.push(i++);
    // …then the lines under it.
    const body: DocLine[] = [];
    while (i < lines.length && kinds[i] === "B") body.push(lines[i++]);

    const dated = head.filter((k) => kinds[k] === "D");
    if (head.length === 0) {
      // Text before any heading: keep it with the previous entry, or as an entry of its own.
      if (groups.length) groups[groups.length - 1].body.push(...body);
      else groups.push({ header: [], body, pre: 0 });
      continue;
    }
    if (dated.length === 0) {
      const first = lines[head[0]];
      const strong = first.bold || first.heading > 0 || TITLE_WORD.test(plain(first)) || ORG_WORD.test(plain(first)) || INSTITUTION.test(plain(first));
      if (groups.length && !strong) {
        // Short undated lines after an entry's bullets are more of its text, not a new entry.
        groups[groups.length - 1].body.push(...head.map((k) => lines[k]), ...body);
      } else {
        groups.push({ header: head.map((k) => lines[k]), body, pre: head.length });
      }
      continue;
    }
    if (dated.length === 1) {
      const pre = head.indexOf(dated[0]);
      layoutPre ??= pre;
      groups.push({ header: head.map((k) => lines[k]), body, pre });
      continue;
    }
    // Several dated headings in one run. Lines before the first belong to it; between two dated
    // lines, the ones nearest the later date belong to that later entry, as many as the layout uses.
    const firstPre = head.indexOf(dated[0]);
    const pre = layoutPre ?? firstPre;
    layoutPre ??= firstPre;
    let from = 0;
    dated.forEach((d, n) => {
      const at = head.indexOf(d);
      const nextAt = n + 1 < dated.length ? head.indexOf(dated[n + 1]) : head.length;
      // Lines between this date and the next: places stay with this entry, then the rest go to the next.
      let to = nextAt;
      if (n + 1 < dated.length) {
        const between = head.slice(at + 1, nextAt);
        let give = Math.min(pre, between.length);
        while (give > 0 && looksLikePlace(plain(lines[between[between.length - give]]))) give--;
        to = nextAt - give;
      }
      groups.push({ header: head.slice(from, to).map((k) => lines[k]), body: n + 1 === dated.length ? body : [], pre: at - from });
      from = to;
    });
  }
  return groups;
}

/* ------------------------------------------------------------- body → bullets */

const SENTENCE_BREAK = /(?<=[a-zà-ÿ0-9%)][.!?])\s+(?=[A-Z0-9£$€"'(])/;

/** The lines under a heading as bullets. A paragraph is split into its sentences; that is reported so the person can check. */
function toBullets(body: DocLine[]): { bullets: Bullet[]; paragraph: boolean } {
  const bullets: Bullet[] = [];
  let paragraph = false;
  let lastWasBullet = false;
  for (const l of body) {
    const text = plain(l);
    if (!text) continue;
    if (l.bullet) {
      bullets.push(uploaded(text, l));
      lastWasBullet = true;
    } else if (lastWasBullet && /^[a-zà-ÿ(]/.test(text) && bullets.length) {
      // A wrapped line that lost its place: it carries on the bullet above.
      const last = bullets[bullets.length - 1];
      last.text += ` ${text}`;
      const src = last.sources[0];
      if (src) {
        src.lines = [...(src.lines ?? []), l.n];
        src.text += ` ${text}`;
      }
    } else {
      const sentences = text.split(SENTENCE_BREAK).map((s) => s.trim()).filter(Boolean);
      for (const s of sentences) bullets.push(uploaded(s, l));
      if (wordCount(text) > 12 || sentences.length > 1) paragraph = true;
      lastWasBullet = false;
    }
  }
  return { bullets: bullets.slice(0, 30), paragraph };
}

/* ------------------------------------------------------------ heading → fields */

interface Token {
  text: string;
  line: number;
}

const STRONG_SEP = /\t|\s+[|·•●▪∙⋅]\s+|\s+[–—-]\s+|\s+@\s+/;
const AT_SEP = /\s+at\s+(?=[A-Z0-9])/;

function splitTokens(header: DocLine[], dateLineIndex: number, dates: FoundDates | null): Token[] {
  const tokens: Token[] = [];
  header.forEach((l, li) => {
    let text = l.text;
    if (li === dateLineIndex && dates) text = withoutDates(plain(l), dates);
    text = withoutDurations(text.replace(/\t/g, " \t "));
    for (const piece of text.split(STRONG_SEP)) {
      const at = piece.split(AT_SEP);
      const bits = at.length === 2 && (TITLE_WORD.test(at[0]) || TITLE_HINT.test(at[0])) ? at : [piece];
      for (const b of bits) {
        const t = b.replace(/^[\s,;:()–—-]+|[\s,;:(–—-]+$/g, "").trim();
        if (t) tokens.push({ text: t, line: li });
      }
    }
  });
  return tokens;
}

/** Takes a place off the end of a comma-separated token: "Northlight Agency, London" → ["Northlight Agency", "London"]. */
function splitPlace(text: string): { rest: string; place: string } {
  const bits = text.split(/\s*,\s*/);
  for (const take of [3, 2, 1]) {
    if (bits.length > take) {
      const place = bits.slice(-take).join(", ");
      if (looksLikePlace(place)) return { rest: bits.slice(0, -take).join(", "), place };
    }
  }
  return { rest: text, place: "" };
}

/** Above zero reads as a job title, below zero as an employer. "Software" counts against a title only when no title word is there. */
function titleScore(s: string): number {
  const title = TITLE_WORD.test(s);
  return (title ? 2 : 0) + (TITLE_HINT.test(s) ? 1 : 0) - (ORG_STRONG.test(s) ? 3 : !title && ORG_WORD.test(s) ? 2 : 0) - (INSTITUTION.test(s) ? 2 : 0);
}

interface HeaderFields {
  title: string;
  org: string;
  location: string;
  link: string;
  dates: FoundDates | null;
  /** The title and employer could be the other way round. */
  unsure: boolean;
  /** Which came first in the file when both were found: used to settle unsure entries the same way. */
  order: "title-first" | "org-first" | "";
  extras: string[];
  /** The lines of the file each field was read from. */
  from: { title: number[]; org: number[]; location: number[]; dates: number[]; link: number[] };
}

function readHeader(header: DocLine[], ctx: EntryContext): HeaderFields {
  const out: HeaderFields = { title: "", org: "", location: "", link: "", dates: null, unsure: false, order: "", extras: [], from: { title: [], org: [], location: [], dates: [], link: [] } };
  const dateLineIndex = header.findIndex((l) => headerDates(l));
  out.dates = dateLineIndex >= 0 ? headerDates(header[dateLineIndex]) : null;
  if (dateLineIndex >= 0) out.from.dates = [header[dateLineIndex].n];
  const at = (t: Token) => [header[t.line].n];
  let tokens = splitTokens(header, dateLineIndex, out.dates);

  // Links (projects, publications).
  tokens = tokens.flatMap((t) => {
    const url = t.text.match(URL_IN_TEXT);
    if (!url) return [t];
    if (!out.link) out.from.link = at(t);
    out.link ||= tidyUrl(url[0]);
    const rest = t.text.replace(url[0], " ").replace(/^[\s,;:()|–-]+|[\s,;:(|–-]+$/g, "").trim();
    return rest ? [{ ...t, text: rest }] : [];
  });
  for (const l of header) for (const target of l.links) if (/^https?:/i.test(target)) out.link ||= tidyUrl(target);

  // Places.
  const texts: Token[] = [];
  for (const t of tokens) {
    if (looksLikePlace(t.text)) {
      if (!out.location) out.from.location = at(t);
      out.location ||= t.text;
      if (out.location !== t.text && !out.location.includes(t.text)) out.extras.push(t.text);
      continue;
    }
    const { rest, place } = splitPlace(t.text);
    if (place && !out.location) {
      out.location = place;
      out.from.location = at(t);
      if (rest) texts.push({ ...t, text: rest });
    } else texts.push(t);
  }

  // "Analyst, Brightline Energy" on its own is a title and an employer.
  let parts = texts;
  if (texts.length === 1 && /,\s/.test(texts[0].text)) {
    const bits = texts[0].text.split(/\s*,\s+/).filter(Boolean);
    if (bits.length === 2 || (bits.length === 3 && titleScore(bits[0]) !== titleScore(bits[1]))) parts = bits.map((b) => ({ text: b, line: texts[0].line }));
  }

  if (ctx.linkedin) {
    // LinkedIn: the employer line comes first, then the title. A lone line is a further title at the same employer.
    if (parts.length >= 2) {
      out.org = parts[0].text;
      out.title = parts[1].text;
      out.from.org = at(parts[0]);
      out.from.title = at(parts[1]);
      out.extras.push(...parts.slice(2).map((p) => p.text));
    } else if (parts.length === 1) {
      out.title = parts[0].text;
      out.from.title = at(parts[0]);
    }
    return out;
  }

  if (parts.length === 1) {
    const s = titleScore(parts[0].text);
    if (s < 0) {
      out.org = parts[0].text;
      out.from.org = at(parts[0]);
    } else {
      out.title = parts[0].text;
      out.from.title = at(parts[0]);
      out.unsure = s === 0;
    }
  } else if (parts.length >= 2) {
    // The two pieces that most look like a title and an employer; anything else is kept with the employer.
    const scored = parts.map((p, idx) => ({ p, idx, s: titleScore(p.text) }));
    const best = [...scored].sort((a, b) => b.s - a.s || a.idx - b.idx)[0];
    const others = scored.filter((x) => x !== best);
    const worst = [...others].sort((a, b) => a.s - b.s || a.idx - b.idx)[0];
    if (best.s === worst.s) {
      // No clue either way: take them in the order written, title first, and ask.
      out.title = parts[0].text;
      out.org = parts[1].text;
      out.from.title = at(parts[0]);
      out.from.org = at(parts[1]);
      out.unsure = true;
      out.extras.push(...parts.slice(2).map((p) => p.text));
    } else {
      out.title = best.p.text;
      out.org = worst.p.text;
      out.from.title = at(best.p);
      out.from.org = at(worst.p);
      out.order = best.idx < worst.idx ? "title-first" : "org-first";
      out.extras.push(...others.filter((x) => x !== worst).map((x) => x.p.text));
    }
  }
  return out;
}

function applyDates(e: Entry, d: FoundDates | null, endOnly = false) {
  if (!d) return;
  if (d.single && endOnly) e.end = d.end;
  else {
    e.start = d.start;
    e.end = d.current ? "" : d.end;
    e.current = d.current;
  }
}

/* --------------------------------------------------- experience, volunteering */

const MSG = {
  swap: "Check we’ve put the job title and the employer the right way round.",
  noTitle: "We couldn’t find a job title here. Please add it.",
  noOrg: "We couldn’t find the employer here. Please add it.",
  carried: (org: string) => `We’ve assumed this role was also at ${org}. Check that’s right.`,
  noDates: "We couldn’t find dates here. Please add them.",
  approx: "Check these dates. The file gave a season or a date that can be read two ways, so we kept only the year.",
  paragraph: "This was a paragraph in your file. We’ve split it into bullets. Check each one.",
  extra: "This line had more parts than we could place. We’ve kept the extra text with the employer. Check it.",
  noHeading: "These lines had no job title or employer above them. Please add them.",
};

function noteHeader(sources: Sources, e: Entry, f: HeaderFields) {
  if (f.from.title.length) note(sources, e, "title", f.from.title);
  if (f.from.org.length) note(sources, e, "org", f.from.org);
  if (f.from.location.length) note(sources, e, "location", f.from.location);
  if (f.from.link.length) note(sources, e, "link", f.from.link);
  if (f.from.dates.length) {
    note(sources, e, "start", f.from.dates);
    note(sources, e, "end", f.from.dates);
  }
}
const noteBullets = (sources: Sources, e: Entry) => {
  for (const b of e.bullets) note(sources, e, b.id, b.sources[0]?.lines ?? []);
};
const headerLines = (g: Group) => g.header.map((l) => l.n);

/** Roles: experience and volunteering. */
export function parseRoles(lines: DocLine[], ctx: EntryContext): EntriesResult {
  const flags: FlagDraft[] = [];
  const sources: Sources = {};
  const entries: Entry[] = [];
  const meta: { fields: HeaderFields; pre: number; lines: number[] }[] = [];
  const groups = groupEntries(ctx.linkedin ? lines.filter((l) => !isOnlyDuration(plain(l))) : lines);

  for (const g of groups) {
    const e = emptyEntry();
    const f = readHeader(g.header, ctx);
    e.title = f.title;
    e.org = [f.org, ...f.extras].filter(Boolean).join(", ");
    e.location = f.location;
    e.link = f.link;
    applyDates(e, f.dates);
    noteHeader(sources, e, f);
    const { bullets, paragraph } = toBullets(g.body);
    e.bullets = bullets;
    noteBullets(sources, e);
    const at = headerLines(g);
    note(sources, e, "", [...at, ...g.body.map((l) => l.n)]);
    if (paragraph) flags.push({ section: "", entry: e.id, code: "paragraph", message: MSG.paragraph, lines: g.body.map((l) => l.n) });
    if (f.extras.length) flags.push({ section: "", entry: e.id, field: "org", code: "extra-text", message: MSG.extra, lines: at });
    if (f.dates?.approx) flags.push({ section: "", entry: e.id, field: "start", code: "approx-date", message: MSG.approx, lines: f.from.dates });
    entries.push(e);
    meta.push({ fields: f, pre: g.pre, lines: at });
  }

  // An employer on a line of its own above several titles: carry it down, and drop the empty banner entry.
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const next = entries[i + 1];
    if (e.org && !e.title && e.bullets.length === 0 && next && next.title && !next.org) {
      let j = i + 1;
      while (j < entries.length && entries[j].title && !entries[j].org) {
        entries[j].org = e.org;
        entries[j].location ||= e.location;
        meta[j].fields.org = e.org;
        note(sources, entries[j], "org", meta[i].fields.from.org);
        note(sources, entries[j], "", meta[i].lines);
        j++;
      }
      entries.splice(i, 1);
      meta.splice(i, 1);
      i--;
    }
  }

  // Settle unsure title/employer pairs the way the rest of the file does it.
  const votes = meta.reduce((n, m) => n + (m.fields.order === "org-first" ? 1 : m.fields.order === "title-first" ? -1 : 0), 0);
  entries.forEach((e, i) => {
    const f = meta[i].fields;
    const at = meta[i].lines;
    if (f.unsure && e.title && e.org && votes > 0) {
      [e.title, e.org] = [e.org, e.title];
      const k = { t: `${e.id}/title`, o: `${e.id}/org` };
      [sources[k.t], sources[k.o]] = [sources[k.o] ?? [], sources[k.t] ?? []];
    }
    // A later role with the title only, where earlier ones had the employer on its own line above.
    const prev = entries[i - 1];
    if (!e.org && e.title && prev?.org && meta[i].pre < meta[i - 1].pre) {
      e.org = prev.org;
      flags.push({ section: "", entry: e.id, field: "org", code: "employer-carried", message: MSG.carried(prev.org), lines: at });
    } else if (ctx.linkedin && !e.org && e.title && prev?.org) {
      e.org = prev.org;
    }
    const empty = !e.title && !e.org;
    if (empty && e.bullets.length) flags.push({ section: "", entry: e.id, field: "title", code: "no-heading", message: MSG.noHeading });
    else {
      if (f.unsure && e.title && e.org) flags.push({ section: "", entry: e.id, field: "title", code: "title-or-employer", message: MSG.swap, lines: at });
      if (!e.title) flags.push({ section: "", entry: e.id, field: "title", code: "no-title", message: MSG.noTitle, lines: at });
      if (!e.org) flags.push({ section: "", entry: e.id, field: "org", code: "no-employer", message: MSG.noOrg, lines: at });
    }
    if (!e.start && !e.end && !e.current) flags.push({ section: "", entry: e.id, field: "start", code: "no-dates", message: MSG.noDates, lines: at });
  });

  const kept = entries.filter((e) => e.title || e.org || e.bullets.length);
  return { entries: kept, flags: flags.filter((fl) => kept.some((e) => e.id === fl.entry)), sources };
}

/** LinkedIn prints the total time at an employer on its own line: "5 years 3 months". */
const isOnlyDuration = (text: string) => withoutDurations(text).replace(/[\s()·-]/g, "") === "" && /\d|year|month/i.test(text);

/* ------------------------------------------------------------------ education */

/** Splits "BSc Economics (2:1)" into the qualification and its grade. "(predicted 2:1)" keeps its qualifier. */
function takeGrade(text: string): { rest: string; grade: string } {
  const m = text.match(GRADE);
  if (!m) return { rest: text, grade: "" };
  let from = m.index ?? 0;
  let to = from + m[0].length;
  let grade = m[0].trim();
  // A grade inside brackets takes the whole bracket: "(predicted 2:1)", "(First Class Honours)".
  const open = text.lastIndexOf("(", from);
  const close = text.indexOf(")", to);
  if (open >= 0 && close >= 0 && text.indexOf(")", open) === close && close - open <= 60) {
    grade = text.slice(open + 1, close).trim();
    from = open;
    to = close + 1;
  }
  const rest = (text.slice(0, from) + " " + text.slice(to))
    .replace(/\(\s*\)|\[\s*\]/g, " ")
    .replace(/\b(?:grade|result|classification|achieved|awarded|with)\s*[:\-–]?\s*$/i, " ")
    .replace(/\s*[,;:–-]\s*$/g, "")
    .replace(/^[\s,;:–-]+/, "")
    .replace(/ {2,}/g, " ")
    .trim();
  return { rest, grade };
}

const DEGREE = /^((?:B\.?Sc|B\.?A|B\.?Eng|B\.?Ed|LL\.?B|LL\.?M|M\.?Sc|M\.?A|M\.?Eng|M\.?Res|M\.?Phil|M\.?B\.?A|M\.?Sci|M\.?Ed|B\.?S|M\.?S|B\.?F\.?A|M\.?F\.?A|B\.?B\.?A|Ph\.?D|D\.?Phil|PGCE|PGDip|PGCert|HND|HNC|BTEC(?: (?:National|Extended|Higher))?(?: Diploma| Certificate)?|(?:Bachelor|Master|Doctor)(?:'s|s)?(?: degree)?(?: of (?:Science|Arts|Engineering|Laws|Education|Business Administration|Philosophy|Fine Arts|Research))?|Foundation Degree|Diploma|Higher National Diploma|Associate(?:'s)? Degree|MBA)\.?(?:\s*\((?:Hons|Honours)\))?(?:\s+(?:Hons|Honours))?)(?:\s+in\s+|\s*[,:–-]\s*|\s+)(?=\S)(.+)$/i;

/** "BSc (Hons) Economics" → the qualification and its subject. Left whole when it does not split cleanly. */
export function splitSubject(title: string): { title: string; subject: string } {
  const m = title.match(DEGREE);
  if (!m) return { title, subject: "" };
  const subject = m[2].replace(/^\(?(?:Hons|Honours)\)?\s*/i, "").trim();
  // "Master of Science" on its own is all qualification.
  if (!subject || subject.length > 80 || /^\(|^(?:of|in|degree)\b/i.test(subject)) return { title, subject: "" };
  return { title: m[1].trim(), subject };
}

/** LinkedIn's PDF: the school on one line, then "Degree, Field of study · (2013 - 2015)". */
function parseLinkedInEducation(lines: DocLine[]): EntriesResult {
  const entries: Entry[] = [];
  const sources: Sources = {};
  for (const l of lines) {
    const text = plain(l);
    const dates = findDates(text);
    const last = entries[entries.length - 1];
    if (dates && last && !last.title && !last.end) {
      applyDates(last, dates.single ? { ...dates, start: "" } : dates);
      const degree = withoutDates(text, dates).replace(/\t/g, " ").replace(/[\s·]+$/, "").trim();
      const comma = degree.indexOf(", ");
      last.title = comma > 0 ? degree.slice(0, comma) : degree;
      last.subject = comma > 0 ? degree.slice(comma + 2) : "";
      for (const field of ["title", "subject", "start", "end"]) note(sources, last, field, [l.n]);
      note(sources, last, "", [l.n]);
    } else if (last && (l.bullet || wordCount(text) > 12)) {
      last.bullets.push(uploaded(text, l));
      note(sources, last, "", [l.n]);
    } else {
      const e = emptyEntry();
      e.org = text;
      note(sources, e, "org", [l.n]);
      note(sources, e, "", [l.n]);
      entries.push(e);
    }
  }
  for (const e of entries) noteBullets(sources, e);
  return { entries, flags: [], sources };
}

export function parseEducation(lines: DocLine[], ctx: EntryContext): EntriesResult {
  if (ctx.linkedin) return parseLinkedInEducation(lines);
  const flags: FlagDraft[] = [];
  const sources: Sources = {};
  const entries: Entry[] = [];
  const at = new Map<Entry, number[]>();
  let curHasDates = false;
  const current = (): Entry | null => entries[entries.length - 1] ?? null;
  const start = (): Entry => {
    const e = emptyEntry();
    curHasDates = false;
    entries.push(e);
    at.set(e, []);
    return e;
  };

  for (const l of lines) {
    const text = plain(l);
    if (l.bullet || (current() && !findDates(text) && !INSTITUTION.test(text) && !QUALIFICATION.test(text) && (wordCount(text) > 14 || endsLikeSentence(text)))) {
      // Detail under a qualification: modules, a dissertation, prizes.
      const e: Entry = current() ?? start();
      if (e.bullets.length < 30) e.bullets.push(uploaded(text, l));
      continue;
    }
    const dates = findDates(text);
    const body = withoutDurations(dates ? withoutDates(text, dates) : l.text);
    const hasInst = INSTITUTION.test(body);
    const hasQual = QUALIFICATION.test(body);
    // A new qualification starts when this line would fill a box that is already full.
    const e0 = current();
    const e = !e0 || e0.bullets.length > 0 || (hasInst && e0.org) || (hasQual && e0.title && !hasInst && e0.org) || (hasQual && e0.title && hasInst) || (dates && curHasDates && (hasInst || hasQual)) ? start() : e0;
    at.get(e)!.push(l.n);
    const put = (field: "title" | "org" | "location" | "grade", value: string) => {
      e[field] = value;
      note(sources, e, field, [l.n]);
    };
    if (dates) {
      if (dates.single) e.end = dates.end;
      else applyDates(e, dates);
      curHasDates = true;
      note(sources, e, "start", [l.n]);
      note(sources, e, "end", [l.n]);
      if (dates.approx) flags.push({ section: "", entry: e.id, field: "end", code: "approx-date", message: MSG.approx, lines: [l.n] });
    }

    let pieces = body.split(/\t|\s+[|·•●▪∙⋅]\s+|\s+[–—]\s+|\s+-\s+/).map((p) => p.trim()).filter(Boolean);
    // LinkedIn writes "Bachelor of Science, Economics" on one line: the comma is part of the qualification.
    if (!ctx.linkedin) pieces = pieces.flatMap((p) => (INSTITUTION.test(p) && QUALIFICATION.test(p) ? p.split(/\s*,\s+/) : [p]));
    pieces = pieces.flatMap((p) => {
      const { rest, place } = splitPlace(p);
      if (place && !e.location && (INSTITUTION.test(rest) || !rest)) {
        put("location", place);
        return rest ? [rest] : [];
      }
      return [p];
    });

    let afterOrg = false;
    for (let piece of pieces) {
      piece = piece.replace(/^[\s,;:()–-]+|[\s,;:(–-]+$/g, "").trim();
      if (!piece) continue;
      const followsOrg = afterOrg;
      afterOrg = false;
      if (looksLikePlace(piece) && !INSTITUTION.test(piece)) {
        if (!e.location) put("location", piece);
        continue;
      }
      // "University of California, Berkeley": a short capitalised piece straight after the institution is part of its name.
      if (followsOrg && wordCount(piece) <= 3 && /^[A-ZÀ-Þ]/.test(piece) && !/\d/.test(piece) && !QUALIFICATION.test(piece) && !GRADE.test(piece)) {
        e.org = `${e.org}, ${piece}`;
        continue;
      }
      // "A-Levels: Maths (A), Physics (B)": the subjects and grades go in the result box.
      const listed = piece.match(/^([^:]{2,40}):\s*(.+)$/);
      if (listed && QUALIFICATION.test(listed[1]) && !/\d\s*$/.test(listed[1]) && !e.title) {
        put("title", listed[1].trim());
        if (!e.grade) put("grade", listed[2].trim().slice(0, 120));
        continue;
      }
      if (INSTITUTION.test(piece) && !QUALIFICATION.test(piece.replace(INSTITUTION, ""))) {
        if (!e.org) {
          put("org", piece);
          afterOrg = true;
        } else e.bullets.push(uploaded(piece, l));
        continue;
      }
      const { rest, grade } = takeGrade(piece);
      if (grade && !e.grade) {
        put("grade", grade);
        piece = rest;
        if (!piece) continue;
      }
      if (QUALIFICATION.test(piece) || !e.title) {
        if (!e.title) put("title", piece);
        else if (!e.org && !QUALIFICATION.test(piece)) put("org", piece);
        else e.bullets.push(uploaded(piece, l));
      } else if (!e.org) put("org", piece);
      else e.bullets.push(uploaded(piece, l));
    }
  }

  const kept = entries.filter((e) => e.title || e.org || e.bullets.length);
  for (const e of kept) {
    // With only one of the two, work out which it is.
    if (e.title && !e.org && INSTITUTION.test(e.title) && !QUALIFICATION.test(e.title)) {
      [e.org, e.title] = [e.title, ""];
      sources[`${e.id}/org`] = sources[`${e.id}/title`] ?? [];
      delete sources[`${e.id}/title`];
    }
    const split = splitSubject(e.title);
    if (split.subject) {
      e.title = split.title;
      e.subject = split.subject;
      note(sources, e, "subject", sources[`${e.id}/title`] ?? []);
    }
    noteBullets(sources, e);
    note(sources, e, "", [...(at.get(e) ?? []), ...e.bullets.flatMap((b) => b.sources[0]?.lines ?? [])]);
    if (!e.title) flags.push({ section: "", entry: e.id, field: "title", code: "no-qualification", message: "We couldn’t find the qualification here. Please add it.", lines: at.get(e) });
    if (!e.org) flags.push({ section: "", entry: e.id, field: "org", code: "no-institution", message: "We couldn’t find the school, college or university here. Please add it.", lines: at.get(e) });
  }
  return { entries: kept, flags: flags.filter((f) => kept.some((e) => e.id === f.entry)), sources };
}

/* -------------------------------------------------------------------- projects */

export function parseProjects(lines: DocLine[], ctx: EntryContext): EntriesResult {
  const flags: FlagDraft[] = [];
  const sources: Sources = {};
  const entries: Entry[] = [];
  for (const g of groupEntries(lines)) {
    const e = emptyEntry();
    const f = readHeader(g.header, { ...ctx, linkedin: false });
    // A project's first piece is its name, whatever words it contains.
    const firstText = g.header.length ? plain(g.header[0]) : "";
    const titleFirst = !f.org || firstText.indexOf(f.org) < 0 || (firstText.indexOf(f.title) >= 0 && firstText.indexOf(f.title) <= firstText.indexOf(f.org));
    if (!titleFirst) {
      [f.title, f.org] = [f.org, f.title];
      [f.from.title, f.from.org] = [f.from.org, f.from.title];
    }
    e.title = f.title;
    e.org = [f.org, ...f.extras].filter(Boolean).join(", ");
    e.location = f.location;
    e.link = f.link;
    applyDates(e, f.dates);
    noteHeader(sources, e, f);
    const { bullets, paragraph } = toBullets(g.body);
    e.bullets = bullets;
    noteBullets(sources, e);
    note(sources, e, "", [...headerLines(g), ...g.body.map((l) => l.n)]);
    if (paragraph) flags.push({ section: "", entry: e.id, code: "paragraph", message: MSG.paragraph, lines: g.body.map((l) => l.n) });
    if (!e.title && e.bullets.length) flags.push({ section: "", entry: e.id, field: "title", code: "no-title", message: "We couldn’t find a name for this project. Please add it." });
    if (e.title || e.bullets.length) entries.push(e);
  }
  return { entries, flags: flags.filter((fl) => entries.some((e) => e.id === fl.entry)), sources };
}

/* ------------------------------------- certificates, awards, courses, publications */

/** One line per item: "Google Ads Search Certification – Google (2023)". */
export function parseSimple(lines: DocLine[], kind: EntryKind): EntriesResult {
  const entries: Entry[] = [];
  const sources: Sources = {};
  for (const l of lines) {
    const text = plain(l);
    if (!text) continue;
    const last = entries[entries.length - 1];
    if (last && isOnlyDates(text) && !last.end) {
      const d = findDates(text);
      if (d) {
        last.end = d.current ? "" : d.end;
        note(sources, last, "end", [l.n]);
      }
      continue;
    }
    const e = emptyEntry();
    const dates = findDates(text);
    // A publication is a citation: its year, commas and brackets are part of it, so the line is kept whole.
    let rest = dates && kind !== "publications" ? withoutDates(text, dates) : l.text;
    if (dates) e.end = dates.current ? "" : dates.end;
    const url = rest.match(URL_IN_TEXT);
    if (url) {
      e.link = tidyUrl(url[0]);
      rest = rest.replace(url[0], " ");
    }
    for (const target of l.links) if (/^https?:/i.test(target)) e.link ||= tidyUrl(target);
    // Publications are citations full of commas: keep the line whole.
    const sep = kind === "publications" ? /\t/ : /\t|\s+[|·•●▪∙⋅]\s+|\s+[–—-]\s+|\s*,\s+(?=[^,]*$)|\s+\((?=[^()]+\)\s*$)|\s+(?:by|from|issued by|awarded by)\s+(?=[A-Z])/i;
    const pieces = rest
      .split(sep)
      .map((p) => p.replace(/^[\s,;:()–-]+|[\s,;:()–-]+$/g, "").trim())
      .filter(Boolean);
    e.title = pieces[0] ?? "";
    e.org = pieces.slice(1).join(", ");
    if (!e.title) continue;
    for (const field of ["title", "org", "end", "link"] as const) if (e[field]) note(sources, e, field, [l.n]);
    note(sources, e, "", [l.n]);
    entries.push(e);
  }
  return { entries: entries.slice(0, 40), flags: [], sources };
}

/** A section the reader has no rules for: kept whole, one line per bullet, under the person's own heading. */
export function parseCustom(lines: DocLine[]): EntriesResult {
  const e = emptyEntry();
  const sources: Sources = {};
  for (const l of lines) {
    const text = plain(l);
    if (text && e.bullets.length < 30) e.bullets.push(uploaded(text, l));
  }
  noteBullets(sources, e);
  note(sources, e, "", e.bullets.flatMap((b) => b.sources[0]?.lines ?? []));
  return { entries: e.bullets.length ? [e] : [], flags: [], sources };
}
