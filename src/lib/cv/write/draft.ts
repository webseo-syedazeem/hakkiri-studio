import { type CvDoc, type Entry, isEntrySection } from "../schema";
import { checkMerge, checkProfile } from "./check";
import { figures, oneLine, sentences, stem, supportWords, terms } from "./facts";

/**
 * Drafting by rule. These do the same jobs as the AI writing help using only
 * the person's own sentences: they move words, cut filler and join facts, and
 * never add a word that carries a claim. They are what runs in test mode, and
 * what is offered when the AI service does not answer.
 */

export interface DraftBullet {
  text: string;
  /** The exact passages of the person's notes this bullet was made from. */
  quotes: string[];
}

/** The three answers on "Tell me what you did". */
export interface Capture {
  /** What were you responsible for? */
  did: string;
  /** What changed because of your work? */
  changed: string;
  /** Is there a number you can stand behind? */
  number: string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const END = /[.;,\s]+$/;

const SUBJECT = /^(I|We)(?:['’]ve|['’]d| have| had)?\s+(?:also\s+)?/i;
/** Said on a CV in place of "we": the work was shared, and the bullet keeps saying so. */
const AS_A_TEAM = ", as part of the team";

/**
 * A sentence as a CV bullet: no "I", no list mark, no full stop, a capital
 * first. "We did" becomes "Did …, as part of the team": dropping the "we"
 * would make a team's work read as the person's alone.
 */
export function asBullet(sentence: string): string {
  const start = oneLine(sentence)
    .replace(/^(?:[-•*·–]\s*|\d+[.)]\s+)/, "")
    .replace(/^(?:And|Also|Then)\s+/i, "");
  const team = /^we/i.test(SUBJECT.exec(start)?.[1] ?? "");
  const t = start.replace(SUBJECT, "").replace(/^(?:And|Also|Then)\s+/i, "").replace(END, "");
  return cap(team && !supportWords(t).length ? `${t}${AS_A_TEAM}` : t);
}

/** The words a number can be introduced by: lower-cased when a detail is set inside a sentence. */
const LEADING = /^(?:About|Around|Roughly|Approximately|Nearly|Almost|Over|Under|Up|At|More|Less|Fewer|A|An|The|In|Per|Each|Every|Some|Within|For)\b/;

/**
 * Puts a detail the person gave ("about 40 volunteers") into their bullet. If
 * the detail names something the bullet already mentions, it takes that
 * word's place; otherwise it is added at the end. Both are kept word for word.
 */
export function mergeDetail(bullet: string, detail: string): string {
  const base = oneLine(bullet).replace(END, "");
  let d = oneLine(detail).replace(END, "");
  if (!d) return base;
  if (LEADING.test(d)) d = d.charAt(0).toLowerCase() + d.slice(1);
  // The thing the detail counts is its last words ("about 40 new starters" counts "new starters"). If the bullet
  // has exactly those words, the detail takes their place.
  const words = [...base.matchAll(/[\p{L}\p{N}'’+#&/-]+/gu)].map((m) => ({ text: m[0].toLowerCase(), from: m.index, to: m.index + m[0].length }));
  const counted = terms(d).map((t) => t.text.toLowerCase());
  for (let len = counted.length; len >= 1; len--) {
    const run = counted.slice(counted.length - len);
    for (let i = 0; i + len <= words.length; i++) {
      if (!run.every((w, k) => words[i + k].text === w)) continue;
      const merged = cap(`${base.slice(0, words[i].from)}${d}${base.slice(words[i + len - 1].to)}`);
      if (checkMerge(base, d, merged).ok) return merged;
    }
  }
  return `${base}, ${d}`;
}

/**
 * Bullets from the three answers, by rule: each sentence the person wrote
 * becomes a bullet, in their words. A number given in the third answer goes
 * into the bullet it is about, if one shares its words; otherwise it stands
 * as its own line for the person to place.
 */
export function bulletsByRule(c: Capture): DraftBullet[] {
  const out: DraftBullet[] = [];
  for (const s of [...sentences(c.did), ...sentences(c.changed)]) {
    const text = asBullet(s);
    if (terms(text).length >= 2 && !out.some((b) => b.text.toLowerCase() === text.toLowerCase())) out.push({ text, quotes: [s] });
  }
  const detail = oneLine(c.number);
  if (detail && figures(detail).length) {
    const stems = new Set(terms(detail).map((t) => t.stem));
    const target = out.find((b) => !figures(b.text).length && terms(b.text).some((t) => stems.has(t.stem)));
    if (target) {
      target.text = mergeDetail(target.text, detail);
      target.quotes.push(c.number.trim());
    } else if (terms(detail).length) out.push({ text: asBullet(detail), quotes: [c.number.trim()] });
  }
  return out.slice(0, 8);
}

const TIDY: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\bon an? (daily|weekly|monthly|quarterly|yearly|annual) basis\b/gi, "$1"],
  [/\bon a regular basis\b/gi, "regularly"],
  [/\b(?:successfully|effectively|efficiently|proactively|actively|basically|essentially|actually|really|very)\s+/gi, ""],
  [/\butili[sz]ed\b/gi, "used"],
  [/\butili[sz]ing\b/gi, "using"],
  [/\butili[sz]e\b/gi, "use"],
  [/\bwas able to\s+/gi, ""],
  [/\ba (?:wide )?(?:range|variety) of\s+/gi, ""],
  [/\bas well as\b/gi, "and"],
];

/**
 * A bullet tidied by rule: "I" and filler out, nothing else touched. Returns
 * the same text when there is nothing to tidy.
 */
export function tidyByRule(text: string): string {
  const start = oneLine(text);
  const team = /^we/i.test(SUBJECT.exec(start)?.[1] ?? "");
  let t = start.replace(SUBJECT, "");
  for (const [re, to] of TIDY) t = t.replace(re, to);
  t = t.replace(/\s+([,.;])/g, "$1").replace(/\s{2,}/g, " ").replace(END, "").trim();
  return cap(team && !supportWords(t).length ? `${t}${AS_A_TEAM}` : t);
}

/* ------------------------------------------------------------------ profile */

type Printable = Pick<CvDoc, "contact" | "sections" | "region">;

/** The entries of the experience section that are switched on. */
export function visibleRoles(cv: Pick<CvDoc, "sections">): Entry[] {
  return cv.sections.filter((s) => s.kind === "experience" && s.visible && isEntrySection(s)).flatMap((s) => (isEntrySection(s) ? s.entries.filter((e) => e.visible) : []));
}

/**
 * Whole years of work, from the earliest start to the latest end among the
 * roles that are switched on. Worked out from the person's own dates; left
 * undefined when the dates cannot give it.
 */
export function yearsOfExperience(cv: Pick<CvDoc, "sections">, now: Date): number | undefined {
  const roles = visibleRoles(cv).filter((e) => /^\d{4}/.test(e.start));
  if (!roles.length) return undefined;
  const month = (d: string) => Number(d.slice(0, 4)) * 12 + (d.length > 4 ? Number(d.slice(5, 7)) - 1 : 0);
  const today = now.getFullYear() * 12 + now.getMonth();
  const start = Math.min(...roles.map((e) => month(e.start)));
  const end = Math.max(...roles.map((e) => (e.current || !e.end ? (e.current ? today : month(e.start)) : month(e.end))));
  const years = Math.floor((end - start) / 12);
  return years >= 1 ? years : undefined;
}

/** The role the dates show to be the latest: the current one, or the one that ended last. Roles with no dates cannot be placed. */
export function latestRole<T extends { id: string; start: string; end: string; current: boolean }>(roles: T[]): T | undefined {
  const month = (d: string) => Number(d.slice(0, 4)) * 12 + (d.length > 4 ? Number(d.slice(5, 7)) - 1 : 0);
  const dated = roles.filter((e) => /^\d{4}/.test(e.start) || /^\d{4}/.test(e.end));
  const ended = (e: T) => (e.current ? Infinity : month(/^\d{4}/.test(e.end) ? e.end : e.start));
  const began = (e: T) => (/^\d{4}/.test(e.start) ? month(e.start) : month(e.end));
  return [...dated].sort((a, b) => (ended(b) === ended(a) ? began(b) - began(a) : ended(b) > ended(a) ? 1 : -1))[0];
}

/** Everything on the CV that is switched on, as plain strings: what a profile may draw on. */
export function visibleText(cv: Pick<CvDoc, "sections">): string[] {
  const out: string[] = [];
  for (const s of cv.sections) {
    if (!s.visible || s.kind === "summary") continue;
    if (s.kind === "skills") for (const g of s.groups) if (g.visible) out.push(g.name, ...g.skills.filter((k) => k.visible).map((k) => k.name));
    if (isEntrySection(s)) for (const e of s.entries) if (e.visible) out.push(e.title, e.org, e.orgInfo, e.subject, e.location, ...e.bullets.filter((b) => b.visible).map((b) => b.text));
    if ("items" in s) for (const i of s.items) if (i.visible) out.push(i.name, i.level);
  }
  return out.filter((t) => t.trim());
}

const sentence = (bullet: string) => `${cap(oneLine(bullet).replace(END, ""))}.`;
const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

export interface ProfileDraft {
  /** "experience": who you are first. "contribution": what you did first. */
  style: "experience" | "contribution";
  text: string;
}

/**
 * Two profiles assembled from the CV by rule, with a clear difference in
 * emphasis: one opens with the role and years, the other with the strongest
 * result. Every word is the person's own, joined with plain connecting words.
 * Returns fewer than two when the CV does not yet hold enough to tell them apart.
 */
export function profilesByRule(cv: Printable, pick: { entryId?: string; skills: string[] }, now: Date): { versions: ProfileDraft[]; years?: number } {
  const roles = visibleRoles(cv);
  const role = roles.find((e) => e.id === pick.entryId) ?? roles[0];
  if (!role || !role.title.trim()) return { versions: [] };
  // The years, and the words "most recently", are said only of the role the dates show to be the latest. Of a role
  // with no dates, or an earlier one, neither is known to be true: "7 years' experience, most recently at X" would
  // then be a claim the CV does not make.
  const years = latestRole(roles)?.id === role.id ? yearsOfExperience(cv, now) : undefined;
  const title = cap(role.title.trim());
  const org = role.org.trim();
  const skills = pick.skills.map((s) => s.trim()).filter(Boolean).slice(0, 4);
  // The strongest lines: a figure first, then the person's own share of the work, then the order they wrote them in.
  const bullets = role.bullets
    .filter((b) => b.visible && b.text.trim())
    .map((b, i) => ({ text: b.text, score: (figures(b.text).length ? 2 : 0) + (supportWords(b.text).length ? 0 : 1) - i / 100 }))
    .sort((a, b) => b.score - a.score)
    .map((b) => sentence(b.text));
  const exp = years ? ` with ${years} ${years === 1 ? "year’s" : "years’"} experience` : "";
  const skilled = skills.length ? `Skilled in ${list(skills)}.` : "";

  const experience = [`${title}${exp}${org ? `${exp ? ", most recently" : ""} at ${org}` : ""}.`, skilled, bullets[0] ?? "", bullets[1] && figures(bullets[1]).length ? bullets[1] : ""].filter(Boolean).join(" ");
  const versions: ProfileDraft[] = [{ style: "experience", text: experience }];
  if (bullets.length) {
    const closing = `${title}${org ? ` at ${org}` : ""}${exp ? `,${exp}` : ""}${skills.length ? `${exp ? " in" : ", skilled in"} ${list(skills)}` : ""}.`;
    versions.push({ style: "contribution", text: [bullets[0], bullets[1] ?? "", closing].filter(Boolean).join(" ") });
  }
  const text = visibleText(cv);
  return { versions: versions.filter((v) => checkProfile(v.text, text, { years }).ok), years };
}

/* ----------------------------------------------------------------- practice */

/**
 * A question an interviewer may ask about a claim, chosen by rule from what
 * the claim says. With nothing to go on, the fixed question is used.
 */
export function questionFor(claim: string): string {
  const fig = figures(claim)[0];
  if (supportWords(claim).length) return "What was your own part in this work?";
  if (fig) return `How did you arrive at ${fig.phrase}, and what did you do to get there?`;
  const m = /^(\p{L}+ed|Led|Ran|Built|Wrote|Won|Cut|Grew|Made|Set up|Set)\s+(.+)$/u.exec(oneLine(claim).replace(END, ""));
  if (m) return `Tell me about how you ${m[1].toLowerCase()} ${m[2]}. What was your part in it?`;
  return "What was your part in this work?";
}

export { stem };
