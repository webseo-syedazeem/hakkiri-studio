import { fileBaseName } from "../render/filename";
import { cannotDrawAdvice } from "../render/fonts";
import { type Bullet, type CvDoc, type Entry, type Locator, type Section, cvIsEmpty, isEntrySection, isListSection, sectionIsEmpty } from "../schema";
import { SECTION_DEFS, sectionHeading } from "../sections";
import { figures, oneLine, stem, terms } from "../write/facts";
import {
  type Hit,
  badOutcomeDirection,
  bigClaim,
  buzzwords,
  countSentences,
  countWords,
  doubledWords,
  dutyLead,
  filler,
  firstPerson,
  fragment,
  hasContext,
  hasOutcome,
  hasScale,
  longBullet,
  openingWord,
  passive,
  presentLead,
  unclearContribution,
  unexplainedAcronyms,
  validEmail,
  validLink,
  validPhone,
  weakLead,
  wrongRegionSpelling,
} from "./detect";
import { jobFit } from "../tailor/fit";

/**
 * The CV score: one number out of 100 in four groups, from 35 checks and one
 * unscored prompt. Every check is code, with no AI call. Every finding points
 * at the line it is about and, where it can, at the phrase.
 *
 * How points are worked out:
 *  - A per-item check earns its weight in proportion to the visible items that pass.
 *  - A check that truly does not apply (no phone given, no links) hands its weight to the rest of its group.
 *  - A missing essential field earns nothing. A group with nothing to judge earns nothing.
 *  - A file check that has not run is pending: its points are neither earned nor lost yet.
 *  - Lines that say the same thing count once. The second and later copies are flagged, and are left out of every
 *    other check, so a strong line pasted twenty times is worth what it is worth once.
 *  - A check that a CV with almost nothing in it passes without trying ("no bullet is repeated", "one column")
 *    earns in proportion to how many different lines the CV has, up to the number a CV needs (LINES_NEEDED).
 *    With no lines it earns nothing.
 *  - "Good enough to apply" needs the score AND real substance: see `whatIsMissing`.
 *  - There is no floor, and nothing here ever blocks a download.
 */

export type GroupId = "evidence" | "clarity" | "structure" | "software";
export type Severity = "issue" | "suggestion";
export const GROUPS: { id: GroupId; name: string; points: number }[] = [
  { id: "evidence", name: "Evidence", points: 45 },
  { id: "clarity", name: "Clarity", points: 20 },
  { id: "structure", name: "Structure", points: 20 },
  { id: "software", name: "Readable by software", points: 15 },
];
/** At this score the CV is good enough to apply with, if it also has what `whatIsMissing` asks for. */
export const GOOD_ENOUGH = 85;
/** How many different lines saying what the person did a CV needs, by level, before it is judged as a whole CV. */
export const LINES_NEEDED: Record<CvDoc["level"], number> = { student: 3, early: 3, experienced: 6, senior: 6 };

export interface Finding {
  /** The same finding has the same id wherever it is shown: rule and place. */
  id: string;
  rule: string;
  group: GroupId;
  severity: Severity;
  at: Locator;
  /** Where in the field's text the phrase is. */
  span?: [number, number];
  /** The words the finding is about. */
  excerpt: string;
  reason: string;
  action: string;
  /** What putting it right would add to the score. */
  points: number;
  /** A fix the builder can offer in place. */
  fix?: "add-number" | "accept" | "finish" | "files";
  /** For "accept": the word to leave alone from now on. */
  word?: string;
}

export interface Check {
  id: string;
  group: GroupId;
  title: string;
  /** Its weight before anything is handed on. */
  weight: number;
  /** What it is worth in this CV (more, if another check in its group did not apply). */
  points: number;
  earned: number;
  state: "scored" | "na" | "pending";
  /** How many of what passed: "5 of 7 bullets". */
  passed: number;
  total: number;
  unit: string;
  /** True when this check earned only a share of its points because the CV has too few lines to judge it by. */
  thin?: boolean;
  findings: Finding[];
}

export interface Gap {
  /** "2019-04" to "2020-06". */
  from: string;
  to: string;
  months: number;
  after: Locator;
}

export interface Score {
  /** Nothing to score yet. */
  empty: boolean;
  /** Points earned, to one decimal place. The number shown is `shown`. */
  total: number;
  shown: number;
  /** Points that depend on file checks which have not run. */
  pending: number;
  groups: { id: GroupId; name: string; points: number; earned: number; pending: number; checks: Check[] }[];
  findings: Finding[];
  /** Gaps in work of more than six months: a prompt, never a deduction. */
  gaps: Gap[];
  /** The score is high enough AND nothing a CV needs is missing. */
  goodEnough: boolean;
  /** Score >= 85, nothing missing, and 0 open issues. */
  wellWritten: boolean;
  /** Well written + advert present + job fit >= 70 + all required items met or recorded as gap. */
  readyForJob: boolean;
  verdict: "well-written" | "ready-for-job" | "not-ready" | null;
  verdictLabel: string;
  verdictMessage: string;
  /** Set when the CV has fewer different lines than a CV needs: how many it has, and how many it needs. */
  thin: { have: number; need: number } | null;
  /** What a CV needs before it is sent that this one does not have yet, each said in a few words. Empty when nothing is. */
  missing: string[];
}

export interface ScoreInput {
  cv: Pick<CvDoc, "contact" | "sections" | "design" | "region" | "level" | "target" | "accepted"> & {
    requirements?: CvDoc["requirements"];
  };
  /** Pages in the laid-out CV, when known. */
  pages?: number;
  /** Characters the fonts cannot draw, when known. */
  missingGlyphs?: string[];
  /** The result of reading each file back, for the CV as it is now. Absent: not checked yet. */
  files?: { pdf?: "checked" | "loss" | "failed"; docx?: "checked" | "loss" | "failed" };
  /**
   * False when the text came from somewhere else (the free public check), so nothing is known about how its
   * file is laid out. In the builder the file is ours: one column of real text in readable type, by construction.
   */
  ownFile?: boolean;
  now: Date;
}

interface Line {
  text: string;
  at: Locator;
  kind: Section["kind"];
  entry: Entry;
  bullet: Bullet;
}

type Draft = Omit<Check, "points" | "earned" | "group" | "weight" | "findings"> & { findings: Omit<Finding, "id" | "rule" | "group" | "points">[] };
/** `thin`: a CV with almost nothing in it passes this without trying, so it earns by how much there is to judge. */
type Rule = { id: string; group: GroupId; weight: number; title: string; severity: Severity; thin?: true };

const RULES: Rule[] = [
  { id: "sources", group: "evidence", weight: 10, title: "Claims trace to your own words", severity: "issue", thin: true },
  { id: "contribution", group: "evidence", weight: 9, title: "Your own contribution is clear", severity: "suggestion", thin: true },
  { id: "outcome", group: "evidence", weight: 8, title: "The outcome or deliverable is concrete", severity: "suggestion", thin: true },
  { id: "scale", group: "evidence", weight: 5, title: "Scale has a number or clear edges", severity: "suggestion", thin: true },
  { id: "skills-shown", group: "evidence", weight: 6, title: "Listed skills have examples", severity: "suggestion" },
  { id: "challenge", group: "evidence", weight: 5, title: "Big claims have supporting context", severity: "suggestion", thin: true },
  { id: "repeat", group: "evidence", weight: 2, title: "No bullet is repeated", severity: "issue", thin: true },
  { id: "weak-verb", group: "clarity", weight: 2, title: "Bullets open with a strong verb", severity: "suggestion", thin: true },
  { id: "duty", group: "clarity", weight: 2, title: "Bullets say what you did, not what the job was", severity: "suggestion", thin: true },
  { id: "filler", group: "clarity", weight: 2, title: "No filler", severity: "suggestion", thin: true },
  { id: "buzzword", group: "clarity", weight: 2, title: "No buzzwords", severity: "suggestion", thin: true },
  { id: "passive", group: "clarity", weight: 2, title: "Active phrasing", severity: "suggestion", thin: true },
  { id: "fragment", group: "clarity", weight: 2, title: "Bullets are complete", severity: "suggestion", thin: true },
  { id: "spelling", group: "clarity", weight: 2, title: "Spelling matches the region", severity: "suggestion", thin: true },
  { id: "first-person", group: "clarity", weight: 2, title: "No “I”", severity: "suggestion", thin: true },
  { id: "tense", group: "clarity", weight: 2, title: "Past roles are in the past tense", severity: "suggestion", thin: true },
  { id: "acronym", group: "clarity", weight: 1, title: "Acronyms are spelt out on first use", severity: "suggestion", thin: true },
  { id: "punctuation", group: "clarity", weight: 1, title: "Bullets end the same way", severity: "suggestion", thin: true },
  { id: "name", group: "structure", weight: 2, title: "Name", severity: "issue" },
  { id: "email", group: "structure", weight: 2, title: "A valid email address", severity: "issue" },
  { id: "phone", group: "structure", weight: 1, title: "Phone number format", severity: "issue" },
  { id: "dates", group: "structure", weight: 3, title: "Dates are consistent and plausible", severity: "issue" },
  { id: "bullets-per-role", group: "structure", weight: 3, title: "3 to 6 bullets a role", severity: "suggestion" },
  { id: "profile-length", group: "structure", weight: 1, title: "Profile is 3 to 4 sentences", severity: "suggestion" },
  { id: "skills-count", group: "structure", weight: 1, title: "8 to 10 skills", severity: "suggestion" },
  { id: "word-count", group: "structure", weight: 2, title: "400 to 1,600 words", severity: "suggestion" },
  { id: "page-count", group: "structure", weight: 4, title: "Page count suits your level", severity: "issue", thin: true },
  { id: "links", group: "structure", weight: 1, title: "Links are well formed", severity: "issue" },
  { id: "one-column", group: "software", weight: 2, title: "One column", severity: "issue", thin: true },
  { id: "headings", group: "software", weight: 2, title: "Standard section headings", severity: "suggestion", thin: true },
  { id: "body-type", group: "software", weight: 2, title: "Readable body type", severity: "issue", thin: true },
  { id: "file-name", group: "software", weight: 1, title: "A usable file name", severity: "suggestion" },
  { id: "real-text", group: "software", weight: 2, title: "Real, visible text", severity: "issue", thin: true },
  { id: "pdf-readback", group: "software", weight: 3, title: "The PDF reads back correctly", severity: "issue", thin: true },
  { id: "docx-readback", group: "software", weight: 3, title: "The Word file reads back correctly", severity: "issue", thin: true },
];
export const CHECKS = RULES;

const key = (at: Locator) => [at.section, at.entry ?? "", at.field ?? ""].join(":");
const spanOf = (h: Hit | null | undefined): [number, number] | undefined => (h ? [h.start, h.end] : undefined);
const cut = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const monthOf = (d: string) => Number(d.slice(0, 4)) * 12 + (d.length > 4 ? Number(d.slice(5, 7)) - 1 : 0);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Every visible bullet with text, in the order printed, with where it is. */
function linesOf(cv: ScoreInput["cv"]): Line[] {
  const out: Line[] = [];
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s)) continue;
    for (const e of s.entries) if (e.visible) for (const b of e.bullets) if (b.visible && b.text.trim()) out.push({ text: b.text, at: { section: s.id, entry: e.id, field: b.id }, kind: s.kind, entry: e, bullet: b });
  }
  return out;
}

/** The words a line is made of, without its numbers. */
const wordsOf = (text: string) => [...new Set(terms(text).map((t) => t.stem))].sort();

/**
 * Whether two lines say the same thing: the same words, or four in five of
 * them. A line that differs from another only in a figure, a full stop or a
 * word or two adds no new evidence.
 */
function sameWords(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const inB = new Set(b);
  const shared = a.filter((w) => inB.has(w)).length;
  if (shared === a.length && shared === b.length) return true;
  return shared >= 3 && shared >= 0.8 * Math.max(a.length, b.length);
}

/** Pattern of a line with numbers stripped, for detecting near-duplicates with swapped numbers. */
const patternOf = (text: string) => oneLine(text).toLowerCase().replace(/\b\d+(?:[.,]\d+)?%?\b/g, "#").replace(/[.!\s]+$/, "");

/** Each line that repeats an earlier one, with the line it repeats and whether the two are word for word the same. */
function repeatsIn(lines: Line[]): Map<Line, { before: Line; exact: boolean }> {
  const firsts: { l: Line; words: string[]; figs: string; plain: string; pattern: string }[] = [];
  const out = new Map<Line, { before: Line; exact: boolean }>();
  for (const l of lines) {
    const words = wordsOf(l.text);
    const figs = figures(l.text).map((f) => f.key).sort().join(" ");
    const plain = oneLine(l.text).toLowerCase().replace(/[.!\s]+$/, "");
    const pattern = patternOf(l.text);
    const hit = firsts.find((f) => f.plain === plain || f.pattern === pattern || sameWords(words, f.words));
    if (hit) out.set(l, { before: hit.l, exact: hit.plain === plain || (hit.figs === figs && hit.words.join(" ") === words.join(" ")) });
    else firsts.push({ l, words, figs, plain, pattern });
  }
  return out;
}

/** A check made by testing each item: it passes for the items with no finding. */
function each<T>(items: T[], unit: string, test: (item: T) => Draft["findings"][number] | null): Omit<Draft, "id" | "title"> {
  const findings = items.map(test).filter((f): f is Draft["findings"][number] => !!f);
  return { state: "scored", passed: items.length - findings.length, total: items.length, unit, findings };
}
/** A check that is one yes or no for the whole CV. */
const whole = (pass: boolean, finding: Draft["findings"][number] | null, unit = ""): Omit<Draft, "id" | "title"> => ({ state: "scored", passed: pass ? 1 : 0, total: 1, unit, findings: pass || !finding ? [] : [finding] });
const notApplicable = (unit = ""): Omit<Draft, "id" | "title"> => ({ state: "na", passed: 0, total: 0, unit, findings: [] });
const pending = (finding: Draft["findings"][number]): Omit<Draft, "id" | "title"> => ({ state: "pending", passed: 0, total: 1, unit: "", findings: [finding] });

export function scoreCv(input: ScoreInput): Score {
  const { cv } = input;
  const region = cv.region;
  const word = region === "us" ? "resume" : "CV";
  const every = linesOf(cv);
  // A line that says the same as an earlier one counts once: the copies are flagged below and judged by nothing else.
  const repeats = repeatsIn(every);
  const lines = every.filter((l) => !repeats.has(l));
  const repeated = new Set([...repeats.keys()].map((l) => l.bullet));
  const need = LINES_NEEDED[cv.level] ?? LINES_NEEDED.experienced;
  // How much of a CV there is to judge: 1 when it has the lines a CV needs, less in proportion when it has fewer.
  const share = Math.min(1, lines.length / need);
  const summary = cv.sections.find((s) => s.kind === "summary" && s.visible && s.text.trim());
  const summaryAt: Locator | null = summary ? { section: summary.id, field: "text" } : null;
  const prose = [...lines.map((l) => ({ text: l.text, at: l.at })), ...(summary && summary.kind === "summary" && summaryAt ? [{ text: summary.text, at: summaryAt }] : [])];
  const roles = cv.sections.filter((s) => s.visible && isEntrySection(s) && (s.kind === "experience" || (cv.level === "student" && (s.kind === "projects" || s.kind === "volunteering")))).flatMap((s) => (isEntrySection(s) ? s.entries.filter((e) => e.visible).map((e) => ({ e, s })) : []));
  const skills = cv.sections.flatMap((s) => (s.kind === "skills" && s.visible ? s.groups.filter((g) => g.visible).flatMap((g) => g.skills.filter((k) => k.visible && k.name.trim()).map((k) => ({ k, g, s }))) : []));
  const visibleSections = cv.sections.filter((s) => s.visible && !sectionIsEmpty(s));
  const out: Record<string, Omit<Draft, "id" | "title">> = {};

  // Identify compromised roles where >= 50% of bullets are near-duplicates
  const nearDupCountByRole = new Map<Entry, number>();
  for (const [l, r] of repeats) {
    if (!r.exact) {
      nearDupCountByRole.set(l.entry, (nearDupCountByRole.get(l.entry) ?? 0) + 1);
    }
  }
  const compromisedRoles = new Set<Entry>();
  for (const r of roles) {
    const roleBullets = r.e.bullets.filter((b) => b.visible && b.text.trim());
    const nearDups = nearDupCountByRole.get(r.e) ?? 0;
    if (roleBullets.length >= 2 && nearDups >= roleBullets.length * 0.5) {
      compromisedRoles.add(r.e);
    }
  }

  // Consecutive same opening verbs within a role
  const consecutiveSameVerb = new Set<Bullet>();
  for (const r of roles) {
    const roleBullets = r.e.bullets.filter((b) => b.visible && b.text.trim());
    for (let i = 2; i < roleBullets.length; i++) {
      const v1 = openingWord(roleBullets[i - 2].text);
      const v2 = openingWord(roleBullets[i - 1].text);
      const v3 = openingWord(roleBullets[i].text);
      if (v1 && v1 === v2 && v2 === v3) {
        consecutiveSameVerb.add(roleBullets[i]);
      }
    }
  }

  /* ----------------------------------------------------------- evidence */
  out.sources = each(lines, "bullets", (l) => {
    if (compromisedRoles.has(l.entry)) {
      return { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This role contains templated near-duplicate bullets.", action: "Replace repeated patterns with unique achievements." };
    }
    return l.bullet.origin === "assisted" && l.bullet.sources.length === 0 ? { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This line was drafted for you and has no record of the words it came from.", action: "Rewrite it in your own words, or remove it." } : null;
  });
  out.contribution = each(lines, "bullets", (l) => {
    if (compromisedRoles.has(l.entry)) {
      return { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This role contains templated near-duplicate bullets.", action: "Replace repeated patterns with unique achievements." };
    }
    const h = unclearContribution(l.text);
    return h ? { severity: "suggestion", at: l.at, span: spanOf(h), excerpt: cut(l.text), reason: `“${h.text}” doesn’t say what your own part was.`, action: "Start with what you did yourself." } : null;
  });
  out.outcome = each(lines, "bullets", (l) => {
    if (compromisedRoles.has(l.entry)) {
      return { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This role contains templated near-duplicate bullets.", action: "Replace repeated patterns with unique achievements." };
    }
    const bad = badOutcomeDirection(l.text);
    if (bad) {
      return { severity: "issue", at: l.at, span: spanOf(bad), excerpt: cut(l.text), reason: `“${bad.text}”: check this says what you meant.`, action: "Outcome should describe a positive result (e.g. reduced waste or increased revenue)." };
    }
    return hasOutcome(l.text) ? null : { severity: "suggestion", at: l.at, excerpt: cut(l.text), reason: "This says what you did, but not what came of it.", action: "Add what changed, or what you produced." };
  });
  out.scale = each(lines, "bullets", (l) => {
    if (compromisedRoles.has(l.entry)) {
      return { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This role contains templated near-duplicate bullets.", action: "Replace repeated patterns with unique achievements." };
    }
    return hasScale(l.text) ? null : { severity: "suggestion", at: l.at, excerpt: cut(l.text), reason: "There is nothing here to show how big this was.", action: "Add the number, or say how far it reached (“every new starter”, “across the Leeds site”).", fix: "add-number" };
  });
  // The words of each line are worked out once, however many skills are listed.
  const proseWords = prose.map((p) => new Set(terms(p.text).map((t) => t.stem)));
  const proseText = prose.map((p) => p.text).join("\n");
  const shown = (name: string) => {
    const want = terms(name).map((t) => t.stem);
    if (!want.length) return new RegExp(`(?<![\\p{L}\\p{N}])${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu").test(proseText);
    return proseWords.some((have) => want.every((w) => have.has(w)));
  };
  out["skills-shown"] = each(skills, "skills", ({ k, g, s }) => (shown(k.name) ? null : { severity: "suggestion", at: { section: s.id, entry: g.id, field: k.id }, excerpt: k.name, reason: `Nothing else on your ${word} shows “${k.name}”.`, action: "Add a line that uses it, or leave it out. Only list what you could explain in an interview." }));
  const claims = lines.map((l) => ({ l, h: bigClaim(l.text) })).filter((x) => x.h);
  out.challenge = claims.length
    ? each(claims, "claims", ({ l, h }) => {
        if (compromisedRoles.has(l.entry)) {
          return { severity: "issue", at: l.at, excerpt: cut(l.text), reason: "This role contains templated near-duplicate bullets.", action: "Replace repeated patterns with unique achievements." };
        }
        return hasContext(l.text) || l.entry.orgInfo.trim() ? null : { severity: "suggestion", at: l.at, span: spanOf(h), excerpt: cut(l.text), reason: `An interviewer is likely to ask about “${h!.text}”.`, action: "Say how you did it, over what time, or compared with what." };
      })
    : notApplicable("claims");
  out.repeat = each(every, "bullets", (l) => {
    const r = repeats.get(l);
    if (!r) return null;
    const where = r.before.entry === l.entry ? "another bullet in this entry" : `a bullet under ${r.before.entry.title || r.before.entry.org || "another entry"}`;
    return r.exact
      ? { severity: "issue", at: l.at, excerpt: cut(l.text), reason: `This says the same as ${where}. It is counted once.`, action: "Keep it where it is strongest and change or remove the other." }
      : { severity: "issue", at: l.at, excerpt: cut(l.text), reason: `This says almost the same as ${where}. The two are counted as one.`, action: "If it was a different piece of work, say what was different about it. If not, keep one." };
  });

  /* ------------------------------------------------------------ clarity */
  const phrase = (id: string, find: (t: string) => Hit | Hit[] | null, reason: (h: Hit) => string, action: string, over = lines.map((l) => ({ text: l.text, at: l.at }))) => {
    out[id] = each(over, "bullets", (l) => {
      const found = find(l.text);
      const h = Array.isArray(found) ? found[0] : found;
      return h ? { severity: "suggestion", at: l.at, span: spanOf(h), excerpt: cut(l.text), reason: reason(h), action } : null;
    });
  };
  out["weak-verb"] = each(lines, "bullets", (l) => {
    const h = weakLead(l.text);
    if (h) return { severity: "suggestion", at: l.at, span: spanOf(h), excerpt: cut(l.text), reason: `“${h.text}” is a weak way to open.`, action: "Open with the verb for what you actually did." };
    if (consecutiveSameVerb.has(l.bullet)) {
      return { severity: "suggestion", at: l.at, excerpt: cut(l.text), reason: "This is the third bullet in this role opening with the same verb.", action: "Vary your opening verbs." };
    }
    return null;
  });
  phrase("duty", dutyLead, (h) => `“${h.text}” describes the job, not what you did in it.`, "Say what you did and what came of it.");
  phrase("filler", filler, (h) => `“${h.text}” adds length without adding a fact.`, "Cut it.", prose);
  phrase("buzzword", buzzwords, (h) => `“${h.text}” is a phrase an interviewer can’t check.`, "Replace it with something you did that shows it.", prose);
  phrase("passive", passive, (h) => `“${h.text}” reads as if it happened to you.`, "Say who did it: start with your verb.");
  out.fragment = each(lines, "bullets", (l) => {
    const d = doubledWords(l.text);
    if (d) return { severity: "issue", at: l.at, span: spanOf(d), excerpt: cut(l.text), reason: `“${d.text}”: doubled word.`, action: "Remove the repeated word." };
    const long = longBullet(l.text);
    if (long) return { severity: "suggestion", at: l.at, excerpt: cut(l.text), reason: `This bullet is ${l.text.trim().length} characters. Aim for under 200 characters.`, action: "Split or shorten it." };
    return fragment(l.text) ? { severity: "suggestion", at: l.at, excerpt: cut(l.text), reason: "This is too short to say what you did.", action: "Finish the thought: what you did, and what came of it." } : null;
  });
  const misspelt = prose.flatMap((p) => wrongRegionSpelling(p.text, region, cv.accepted).map((h) => ({ p, h })));
  out.spelling = prose.length
    ? {
        state: "scored",
        passed: misspelt.length ? 0 : 1,
        total: 1,
        unit: "",
        findings: misspelt.map(({ p, h }) => ({
          severity: (h.isTypo ? "issue" : "suggestion") as Severity,
          at: p.at,
          span: spanOf(h),
          excerpt: h.text,
          reason: h.isTypo ? `“${h.text}” is a spelling mistake.` : `“${h.text}” is the ${region === "uk" ? "US" : "UK"} spelling.`,
          action: h.isTypo ? `Change to “${h.suggest}”.` : `Use “${h.suggest}” in a ${region === "uk" ? "UK CV" : "US resume"}, or accept it if it is a name.`,
          fix: "accept" as const,
          word: h.text,
        })),
      }
    : each([], "", () => null);
  phrase("first-person", firstPerson, (h) => `“${h.text}”: a ${word} is written without it.`, "Drop it and start with the verb.", prose);
  const ended = lines.filter((l) => !l.entry.current && (l.entry.end || l.entry.start) && l.kind !== "education");
  out.tense = ended.length
    ? each(ended, "bullets in past roles", (l) => {
        const h = presentLead(l.text);
        return h ? { severity: "suggestion", at: l.at, span: spanOf(h), excerpt: cut(l.text), reason: `“${h.text}” is in the present tense, and this role has ended.`, action: "Put it in the past tense." } : null;
      })
    : notApplicable("bullets in past roles");
  const all = prose.map((p) => p.text);
  const acronyms = (all.join(" ").match(/(?<![\p{L}\p{N}])[A-Z][A-Z0-9&]{1,5}(?![\p{L}\p{N}])/gu) ?? []).length;
  const unexplained = unexplainedAcronyms(all, cv.accepted);
  out.acronym = acronyms
    ? { state: "scored", passed: unexplained.length ? 0 : 1, total: 1, unit: "", findings: unexplained.map(({ at, hit }) => ({ severity: "suggestion" as const, at: prose[at].at, span: spanOf(hit), excerpt: hit.text, reason: `“${hit.text}” isn’t spelt out anywhere.`, action: "Write it in full the first time, with the short form in brackets. We won’t guess what it stands for.", fix: "accept" as const, word: hit.text })) }
    : notApplicable();
  const stops = lines.filter((l) => /[.!]$/.test(l.text.trim()));
  const odd = stops.length * 2 > lines.length ? lines.filter((l) => !/[.!]$/.test(l.text.trim())) : stops;
  out.punctuation = lines.length > 1 ? { state: "scored", passed: odd.length ? 0 : 1, total: 1, unit: "", findings: odd.slice(0, 6).map((l) => ({ severity: "suggestion" as const, at: l.at, excerpt: cut(l.text), reason: stops.length * 2 > lines.length ? "Most of your bullets end with a full stop; this one doesn’t." : "Most of your bullets have no full stop; this one does.", action: "End every bullet the same way." })) } : each(lines, "bullets", () => null);

  /* ---------------------------------------------------------- structure */
  const c = cv.contact;
  out.name = whole(!!c.fullName.trim(), { severity: "issue", at: { section: "contact", field: "fullName" }, excerpt: "", reason: `Your ${word} has no name on it.`, action: "Add the name you use professionally." });
  out.email = whole(validEmail(c.email), { severity: "issue", at: { section: "contact", field: "email" }, excerpt: c.email, reason: c.email.trim() ? `“${c.email.trim()}” is not a complete email address.` : "There is no email address, so an employer cannot reply.", action: "Add an email address you check." });
  out.phone = c.phone.trim() ? whole(validPhone(c.phone), { severity: "issue", at: { section: "contact", field: "phone" }, excerpt: c.phone, reason: `“${c.phone.trim()}” doesn’t look like a phone number.`, action: "Check the number, with its area or country code." }) : notApplicable();
  const dated = cv.sections.filter((s) => s.visible && isEntrySection(s) && (SECTION_DEFS[s.kind].fields ?? []).some((f) => f.date)).flatMap((s) => (isEntrySection(s) ? s.entries.filter((e) => e.visible).map((e) => ({ e, s })) : []));
  const today = input.now.getFullYear() * 12 + input.now.getMonth();
  const work = dated.filter(({ s }) => s.kind === "experience");
  const mixed = work.some(({ e }) => /^\d{4}$/.test(e.start)) && work.some(({ e }) => /^\d{4}-\d{2}$/.test(e.start));
  out.dates = each(dated, "dated entries", ({ e, s }) => {
    const at = (field: string): Locator => ({ section: s.id, entry: e.id, field });
    const name = e.title || e.org || "This entry";
    const needsStart = s.kind === "experience" || s.kind === "volunteering";
    if (!e.start && !e.end && !e.current) return needsStart || s.kind === "education" ? { severity: "issue", at: at(needsStart ? "start" : "end"), excerpt: name, reason: `${name} has no dates.`, action: "Add when it started and ended. A year is enough if you don’t remember the month." } : null;
    if (needsStart && !e.start) return { severity: "issue", at: at("start"), excerpt: name, reason: `${name} has no start date.`, action: "Add when it started." };
    if (e.start && e.end && monthOf(e.end) < monthOf(e.start)) return { severity: "issue", at: at("end"), excerpt: name, reason: `${name} ends before it starts.`, action: "Check the two dates." };
    if (e.start && monthOf(e.start) > today + 1) return { severity: "issue", at: at("start"), excerpt: name, reason: `${name} starts in the future.`, action: "Check the start date." };
    if (e.end && !e.current && monthOf(e.end) > today + 60) return { severity: "issue", at: at("end"), excerpt: name, reason: `${name} ends more than five years from now.`, action: "Check the end date." };
    if ((e.start && Number(e.start.slice(0, 4)) < 1950) || (e.end && Number(e.end.slice(0, 4)) < 1950)) return { severity: "issue", at: at("start"), excerpt: name, reason: `${name} has a date before 1950.`, action: "Check the year." };
    if (s.kind === "experience" && mixed && /^\d{4}$/.test(e.start)) return { severity: "suggestion", at: at("start"), excerpt: name, reason: `${name} gives only a year, and your other roles give the month.`, action: "Add the month if you know it, so every role is dated the same way." };
    return null;
  });
  out["bullets-per-role"] = each(roles, "roles", ({ e, s }) => {
    const all = e.bullets.filter((b) => b.visible && b.text.trim());
    // Copies of a line are not more bullets: the least a role needs is counted in different ones.
    const n = all.filter((b) => !repeated.has(b)).length;
    const short = !!e.start && !!e.end && !e.current && monthOf(e.end) - monthOf(e.start) < 6;
    if (all.length > 6) return { severity: "suggestion", at: { section: s.id, entry: e.id, field: "title" }, excerpt: e.title || e.org, reason: `${e.title || "This role"} has ${all.length} bullets.`, action: "Keep the strongest six. Switch the rest off; they stay in your master copy." };
    if (n < (short ? 1 : 3)) return { severity: "suggestion", at: { section: s.id, entry: e.id, field: "title" }, excerpt: e.title || e.org, reason: `${e.title || "This role"} has ${n === 0 ? "no bullets" : plural(n, "bullet")}${n < all.length ? " that say different things" : ""}.`, action: short ? "Add at least one line about what you did." : "Aim for three to six. Use “Tell me what you did” to add more from your own words." };
    return null;
  });
  if (summary && summary.kind === "summary" && summaryAt) {
    const n = countSentences(summary.text);
    out["profile-length"] = whole(n >= 3 && n <= 4, { severity: "suggestion", at: summaryAt, excerpt: cut(summary.text), reason: `Your profile is ${plural(n, "sentence")}.`, action: "A profile is three to four sentences: who you are, what you are good at, and one result." });
  } else out["profile-length"] = notApplicable();
  const skillsSection = cv.sections.find((s) => s.kind === "skills");
  out["skills-count"] = whole(skills.length >= 8 && skills.length <= 10, { severity: "suggestion", at: { section: skillsSection?.id ?? "contact" }, excerpt: "", reason: skills.length ? `You list ${plural(skills.length, "skill")}.` : "You list no skills.", action: skills.length > 10 ? "Keep the eight to ten that matter most for this job." : "Aim for eight to ten, hard skills first." });
  const count = countWords([c.fullName, c.email, c.phone, c.location, ...c.links, ...visibleSections.flatMap(sectionWords)]);
  const [low, high] = cv.level === "student" || cv.level === "early" ? [250, 1600] : [400, 1600];
  // Repeated bullets make a CV longer without saying more: they count towards "too long", never towards "long enough".
  const said = count - countWords([...repeats.keys()].map((l) => l.text));
  out["word-count"] = whole(said >= low && count <= high, { severity: "suggestion", at: { section: "finish" }, excerpt: "", reason: said < count && said < low ? `Your ${word} is ${said.toLocaleString("en-GB")} words once repeated bullets are counted once.` : `Your ${word} is ${count.toLocaleString("en-GB")} words.`, action: said < low ? `${low} to ${high.toLocaleString("en-GB")} is the usual range. Add what you did in each role.` : `${low} to ${high.toLocaleString("en-GB")} is the usual range. Switch off what matters least for this job.` });
  const allowed = cv.level === "student" || cv.level === "early" ? 1 : 2;
  out["page-count"] =
    input.pages === undefined
      ? pending({ severity: "issue", at: { section: "finish" }, excerpt: "", reason: "The page count isn’t known until the page has been laid out.", action: "Open the builder to see it.", fix: "finish" })
      : whole(input.pages <= allowed, { severity: "issue", at: { section: "finish" }, excerpt: "", reason: `Your ${word} runs to ${plural(input.pages, "page")}. At your level, ${allowed === 1 ? "one page" : "one or two pages"} is expected.`, action: "Fit it to the page, or switch off what matters least.", fix: "finish" });
  out.links = c.links.filter((l) => l.trim()).length ? each(c.links.filter((l) => l.trim()), "links", (l) => (validLink(l) ? null : { severity: "issue", at: { section: "contact", field: "links" }, excerpt: l, reason: `“${l}” won’t open as a link.`, action: "Check the address. Leave out spaces." })) : notApplicable("links");

  /* ----------------------------------------------- readable by software */
  const ours = input.ownFile !== false;
  const unknown = (what: string) => pending({ severity: "suggestion", at: { section: "finish" }, excerpt: "", reason: `${what} can’t be told from pasted text.`, action: "Build the file here and it is checked for you.", fix: "files" });
  out["one-column"] = ours ? whole(true, null) : unknown("Whether the file is one column");
  out.headings = each(visibleSections, "sections", (s) => (s.kind === "custom" || (s.title.trim() && s.title.trim().toLowerCase() !== SECTION_DEFS[s.kind].heading[region].toLowerCase()) ? { severity: "suggestion", at: { section: s.id }, excerpt: sectionHeading(s, region), reason: `“${sectionHeading(s, region)}” is not a heading software looks for.`, action: "Software sorts a CV by its headings. A standard one is safer if this section matters." } : null));
  out["body-type"] = ours ? whole(true, null) : unknown("The size of the type");
  const base = fileBaseName({ contact: c, target: cv.target, region, design: cv.design });
  out["file-name"] = !ours ? unknown("The file’s name") : whole(!!c.fullName.trim() && base.length <= 80, { severity: "suggestion", at: { section: "finish" }, excerpt: base, reason: c.fullName.trim() ? "The file name is very long." : "With no name on it, the file would be called just “CV”.", action: c.fullName.trim() ? "Shorten it on the Finish tab." : "Add your name.", fix: "finish" });
  const boxes = input.missingGlyphs ?? [];
  if (!ours) out["real-text"] = unknown("Whether the text is real text");
  else if (!boxes.length) out["real-text"] = whole(true, null);
  else {
    // Said on the field that holds them, so it is seen as they are typed, and not only at the moment of download.
    const held = (t: string) => boxes.filter((b) => t.includes(b));
    const places: { at: Locator; chars: string[] }[] = [];
    const look = (at: Locator, t: string) => {
      const chars = held(t ?? "");
      if (chars.length) places.push({ at, chars });
    };
    look({ section: "contact", field: "fullName" }, c.fullName);
    look({ section: "contact", field: "email" }, c.email);
    look({ section: "contact", field: "phone" }, c.phone);
    look({ section: "contact", field: "location" }, c.location);
    look({ section: "contact", field: "links" }, c.links.join(" "));
    if (summary && summary.kind === "summary" && summaryAt) look(summaryAt, summary.text);
    for (const s of visibleSections) {
      if (!isEntrySection(s)) continue;
      for (const e of s.entries) {
        if (!e.visible) continue;
        look({ section: s.id, entry: e.id, field: "title" }, e.title);
        look({ section: s.id, entry: e.id, field: "org" }, e.org);
        for (const b of e.bullets) if (b.visible) look({ section: s.id, entry: e.id, field: b.id }, b.text);
      }
    }
    const say = (chars: string[]) => `${chars.length === 1 ? "This character" : "These characters"} can’t be drawn by the fonts, so the PDF can’t be made with ${chars.length === 1 ? "it" : "them"}: ${chars.join(" ")}`;
    const findings = places.length
      ? places.slice(0, 6).map((p) => ({ severity: "issue" as const, at: p.at, excerpt: p.chars.join(" "), reason: say(p.chars), action: cannotDrawAdvice(p.chars) }))
      : [{ severity: "issue" as const, at: { section: "finish" }, excerpt: boxes.join(" "), reason: say(boxes), action: cannotDrawAdvice(boxes), fix: "finish" as const }];
    out["real-text"] = { state: "scored", passed: 0, total: 1, unit: "", findings };
  }
  for (const [id, format, label] of [["pdf-readback", "pdf", "PDF"], ["docx-readback", "docx", "Word file"]] as const) {
    const state = input.files?.[format];
    out[id] =
      state === undefined || state === "failed"
        ? pending({ severity: "issue", at: { section: "finish" }, excerpt: "", reason: state === "failed" ? `The ${label} was made but could not be read back, so it has not been checked.` : `The ${label} has not been checked since your last change.`, action: "Check the files on the Finish tab.", fix: "files" })
        : whole(state === "checked", { severity: "issue", at: { section: "finish" }, excerpt: "", reason: `The ${label} did not read back the same as your ${word}.`, action: "See what was lost, then rebuild the file.", fix: "files" });
  }

  /* ----------------------------------------------------------- the sums */
  const empty = cvIsEmpty(cv);
  const groups = GROUPS.map((g) => {
    const rules = RULES.filter((r) => r.group === g.id);
    const live = rules.filter((r) => out[r.id].state !== "na").reduce((n, r) => n + r.weight, 0);
    // A check that does not apply hands its weight to the rest of its group.
    const factor = live ? g.points / live : 0;
    let rawEarned = 0;
    let rawPending = 0;
    const checks: Check[] = rules.map((r) => {
      const d = out[r.id];
      const points = d.state === "na" ? 0 : r.weight * factor;
      // What the check can earn in this CV as it is: all of its points, or a share of them while the CV is too short to judge.
      const reach = points * (r.thin ? share : 1);
      const earned = empty || d.state !== "scored" || !d.total ? 0 : (reach * d.passed) / d.total;
      rawEarned += earned;
      if (d.state === "pending") rawPending += reach;
      const each = d.findings.length ? Math.max(0, reach - earned) / d.findings.length : 0;
      return {
        id: r.id,
        group: g.id,
        title: r.title,
        weight: r.weight,
        points: round(points),
        earned: round(earned),
        state: d.state,
        passed: d.passed,
        total: d.total,
        unit: d.unit,
        thin: (r.thin && share < 1 && d.state !== "na") || undefined,
        findings: d.findings.map((f) => ({ ...f, id: `${r.id}:${key(f.at)}${f.word ? `:${f.word}` : ""}`, rule: r.id, group: g.id, points: round(d.state === "pending" ? reach : each) })),
      };
    });
    // Sums are taken before rounding, so a group can never show more than it is worth.
    return { ...g, earned: round(rawEarned), pending: round(rawPending), raw: rawEarned, checks };
  });
  const total = round(groups.reduce((n, g) => n + g.raw, 0));
  const findings = empty ? [] : groups.flatMap((g) => g.checks.flatMap((x) => x.findings)).sort((a, b) => (a.severity === b.severity ? b.points - a.points : a.severity === "issue" ? -1 : 1));
  const missing = empty ? [] : whatIsMissing(cv, lines.length);
  const issues = findings.filter((f) => f.severity === "issue");
  const wellWritten = !empty && Math.round(total) >= GOOD_ENOUGH && missing.length === 0 && issues.length === 0;

  let readyForJob = false;
  let verdict: "well-written" | "ready-for-job" | "not-ready" | null = null;
  let verdictLabel = "";
  let verdictMessage = "";

  const hasAdvert = !!cv.target?.advert?.trim();
  const fitResult = hasAdvert ? jobFit(cv as any) : null;
  const fitScore = fitResult?.score ?? null;

  if (!empty) {
    if (hasAdvert && fitResult) {
      const requiredRows = fitResult.rows.filter((r) => r.requirement.priority === "required");
      const allRequiredMetOrGap = requiredRows.length > 0 && requiredRows.every((r) => r.status === "met" || r.requirement.gap);
      if (wellWritten && (fitScore ?? 0) >= 70 && allRequiredMetOrGap) {
        readyForJob = true;
        verdict = "ready-for-job";
        verdictLabel = "Ready for this job";
        verdictMessage = "Your CV is well written and ready for this job.";
      } else if (wellWritten) {
        verdict = "well-written";
        verdictLabel = "Well written";
        verdictMessage = (fitScore ?? 0) < 70 ? `Well written, but job fit is ${fitScore ?? 0}/100. Tailor it to close open gaps.` : "Well written, but some required items have open gaps.";
      } else {
        verdict = "not-ready";
        verdictLabel = "";
        verdictMessage = issues.length > 0 ? `${issues.length} open issue${issues.length === 1 ? "" : "s"} must be resolved.` : "";
      }
    } else {
      if (wellWritten) {
        verdict = "well-written";
        verdictLabel = "Well written";
        verdictMessage = "Add the job advert to check it's ready for a specific job.";
      } else {
        verdict = "not-ready";
        verdictLabel = "";
        verdictMessage = issues.length > 0 ? `${issues.length} open issue${issues.length === 1 ? "" : "s"} must be resolved.` : "";
      }
    }
  }

  return {
    empty,
    total,
    shown: Math.round(total),
    pending: round(groups.reduce((n, g) => n + g.pending, 0)),
    groups: groups.map(({ raw: _raw, ...g }) => g),
    findings,
    gaps: empty ? [] : gapsIn(cv),
    goodEnough: readyForJob || (wellWritten && !hasAdvert),
    wellWritten,
    readyForJob,
    verdict,
    verdictLabel,
    verdictMessage,
    thin: !empty && share < 1 ? { have: lines.length, need } : null,
    missing,
  };
}

/**
 * What a CV needs before it is worth sending, whatever its score: who it is
 * from, somewhere the person worked or studied, enough different lines saying
 * what they did, and a qualification or course. A CV missing any of these is
 * never called "good enough to apply". Each is said in a few words, to finish
 * the sentence "It still needs …".
 */
export function whatIsMissing(cv: ScoreInput["cv"], differentLines: number): string[] {
  const out: string[] = [];
  const newer = cv.level === "student" || cv.level === "early";
  const named = (kinds: Section["kind"][]) => cv.sections.some((s) => s.visible && isEntrySection(s) && kinds.includes(s.kind) && s.entries.some((e) => e.visible && (e.title.trim() || e.org.trim())));
  if (!cv.contact.fullName.trim() || !validEmail(cv.contact.email)) out.push("your name and an email address that works");
  if (!named(newer ? ["experience", "projects", "volunteering", "education"] : ["experience"])) out.push(newer ? "a role, a project or a course of study" : "at least one role");
  const need = LINES_NEEDED[cv.level] ?? LINES_NEEDED.experienced;
  if (differentLines < need) out.push(`${need} different lines saying what you did (it has ${differentLines})`);
  if (!named(["education", "certificates", "courses"])) out.push("a qualification, certificate or course");
  return out;
}

const round = (n: number) => Math.round(n * 10) / 10;

function sectionWords(s: Section): string[] {
  if (s.kind === "summary") return [s.text];
  if (s.kind === "skills") return s.groups.filter((g) => g.visible).flatMap((g) => [g.name, ...g.skills.filter((k) => k.visible).map((k) => k.name)]);
  if (isListSection(s)) return s.items.filter((i) => i.visible).flatMap((i) => [i.name, i.level]);
  if (isEntrySection(s)) return s.entries.filter((e) => e.visible).flatMap((e) => [e.title, e.org, e.orgInfo, e.subject, e.location, e.grade, ...e.bullets.filter((b) => b.visible).map((b) => b.text)]);
  return [];
}

/**
 * Gaps in work. Overlapping roles are merged first; a gap is reported only
 * when the dates establish more than six whole months with nothing in them.
 * It is something to be ready to explain, and never costs a point.
 */
export function gapsIn(cv: Pick<CvDoc, "sections">): Gap[] {
  const spans: { from: number; to: number; e: Entry; s: Section }[] = [];
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s) || (s.kind !== "experience" && s.kind !== "education" && s.kind !== "volunteering")) continue;
    for (const e of s.entries) {
      if (!e.visible || !/^\d{4}/.test(e.start) || (!e.current && !/^\d{4}/.test(e.end))) continue;
      // A year alone could be any month of it: the span is taken at its widest, so a gap is never claimed that the dates do not prove.
      const from = monthOf(e.start);
      const to = e.current ? Infinity : monthOf(e.end) + (e.end.length === 4 ? 11 : 0);
      if (to >= from) spans.push({ from, to, e, s });
    }
  }
  spans.sort((a, b) => a.from - b.from);
  const out: Gap[] = [];
  let reach = -Infinity;
  let last: (typeof spans)[number] | null = null;
  const ym = (m: number) => `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}`;
  for (const sp of spans) {
    // Whole months with nothing in them, between the month after one ends and the month before the next starts.
    if (last && sp.from - reach - 1 > 6) out.push({ from: ym(reach + 1), to: ym(sp.from - 1), months: sp.from - reach - 1, after: { section: last.s.id, entry: last.e.id, field: "end" } });
    if (sp.to > reach) {
      reach = sp.to;
      last = sp;
    }
  }
  return out;
}

export { oneLine, stem };
