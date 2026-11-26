import { cvStrings } from "../schema";
import { checkGrounded, checkProfile, checkRewrite } from "../write/check";
import { visibleText, yearsOfExperience } from "../write/draft";
import { figures, oneLine, terms } from "../write/facts";
import { type Editable, type Op, type Skipped, applyOps, describeOp, findBullet, findEntry } from "./ops";
import { styleProblems, tidyLine } from "./style";

/**
 * Whether an edit says only what the person has said. These are the same
 * checks as the rest of the writing help (`write/check.ts`): a line may
 * reorder the person's words, cut filler and fix grammar, and may not add a
 * number, a name, a tool, a result or a bigger share of the credit. A field
 * (a job title, an employer, a skill, an email address) must be something the
 * person said or something already on their CV.
 */

export interface Context {
  /** Everything the person has said in this conversation, newest last. */
  words: string[];
  /** What they said this turn. */
  latest: string;
  now: Date;
}

/**
 * The person asked for a change to the wording (something taken out, a word swapped), so a rewrite may lose
 * words. It still may not add anything they haven't said.
 */
const ASKED_TO_CHANGE = /\b(?:remove|cut|drop|shorten|shorter|trim|take out|leave out|get rid|delete|without|less about|no need for|too long|replace|instead|change|swap|use|say|reword|rephrase|simpler|plainer)\b/i;
const FIRST_PERSON = /(?<![\p{L}'’])(?:I|I['’]m|I['’]ve|I['’]d|my|me|myself|we|our|us)(?![\p{L}'’])/u;
/** Words that are part of how qualifications and employers are named, not claims. */
const NAMING = ["university", "uni", "college", "school", "academy", "institute", "ltd", "limited", "plc", "inc", "llc", "group", "company", "co", "bsc", "ba", "msc", "ma", "mba", "phd", "degree", "diploma", "certificate", "hons", "honours", "honors", "first", "class", "upper", "lower", "second", "gcse", "gcses", "levels", "level"];

const normal = (s: string) => oneLine(s).toLowerCase().replace(/[“”"‘’']/g, "'");
const has = (haystack: string[], needle: string) => haystack.some((h) => normal(h).includes(normal(needle)));
const digits = (s: string) => s.replace(/[^\d]/g, "");

/** Every word of a short value (a title, an employer, a skill) is in the sources. */
function namedIn(value: string, sources: string[], allow: string[] = []): string | null {
  if (!value.trim() || has(sources, value)) return null;
  const known = new Set([...sources.flatMap(terms).map((t) => t.stem), ...allow.flatMap(terms).map((t) => t.stem)]);
  const missing = terms(value).filter((t) => !known.has(t.stem));
  if (missing.length) return `“${missing[0].text}” isn’t in what you said.`;
  const sourceFigures = new Set(sources.flatMap(figures).map((f) => f.key));
  const fig = figures(value).find((f) => !sourceFigures.has(f.key));
  return fig ? `“${fig.text}” isn’t in what you said.` : null;
}

/** A year in a date is one the person said, or one already on the CV. A month may be added to it only if they said the month too. */
function dateSaid(date: string, sources: string[]): string | null {
  if (!date) return null;
  const year = date.slice(0, 4);
  const said = sources.join(" ");
  if (!new RegExp(`(?<!\\d)${year}(?!\\d)|['’]${year.slice(2)}(?!\\d)`).test(said)) return `You haven’t said ${year}.`;
  return null;
}

/** The problems with one edit, against the CV as it stands before it. Empty when the edit can be made. */
export function checkOp(cv: Editable, op: Op, ctx: Context): string[] {
  const said = ctx.words;
  const onCv = cvStrings(cv);
  const both = [...said, ...onCv];
  switch (op.op) {
    case "set_contact": {
      if (op.field === "email") return has(said, op.value) ? [] : [`The email address “${op.value}” isn’t in what you said.`];
      if (op.field === "phone") {
        const d = digits(op.value);
        return d.length >= 6 && said.some((w) => digits(w).includes(d)) ? [] : [`The phone number “${op.value}” isn’t in what you said.`];
      }
      const p = namedIn(op.value, said);
      return p ? [p] : [];
    }
    case "add_link": {
      const bare = op.value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
      return has(said, bare) ? [] : [`The link “${op.value}” isn’t in what you said.`];
    }
    case "set_target": {
      const sources = [...said, cv.target?.advert ?? "", cv.target?.title ?? "", cv.target?.employer ?? ""];
      return [namedIn(op.title, sources), namedIn(op.employer, sources)].filter((p): p is string => !!p);
    }
    case "set_advert":
      // Only ever the person's own message, as they pasted it.
      return said.some((w) => w.replace(/\r/g, "").trim() === op.text) ? [] : ["The advert must be text the person pasted, as they pasted it."];
    case "add_entry":
    case "update_entry": {
      const problems: string[] = [];
      for (const key of ["title", "org", "location", "subject", "grade"] as const) {
        const v = op[key];
        if (typeof v === "string" && v) {
          const p = namedIn(v, both, NAMING);
          if (p) problems.push(p);
        }
      }
      for (const key of ["start", "end"] as const) {
        const v = op[key];
        if (typeof v === "string" && v) {
          const p = dateSaid(v, both);
          if (p) problems.push(p);
        }
      }
      if (op.op === "update_entry" && !findEntry(cv.sections, op.entry)) problems.push("That entry isn’t on the CV.");
      return problems;
    }
    case "add_bullet": {
      const found = findEntry(cv.sections, op.entry);
      if (!found) return ["The entry for that line isn’t on the CV yet. Add the entry first, in the same reply."];
      const line = tidyLine(op.text);
      const problems: string[] = [];
      const real = op.quotes.filter((s) => has(said, s));
      for (const s of op.quotes.filter((s) => !has(said, s))) problems.push(`The quote “${s.slice(0, 80)}” isn’t in what the person said, word for word.`);
      const context = [found.entry.title, found.entry.org];
      const verdict = checkGrounded(line, [...(real.length ? real : said), ...context], { whose: "your words", own: real.length ? real : said });
      problems.push(...verdict.problems.map((p) => p.say));
      if (FIRST_PERSON.test(line)) problems.push(`“${line.slice(0, 60)}” uses “I” or “we”. A CV line has no “I”.`);
      problems.push(...styleProblems(line, said));
      return problems;
    }
    case "reword_bullet": {
      const found = findBullet(cv.sections, op.bullet);
      if (!found) return ["That line isn’t on the CV."];
      const line = tidyLine(op.text);
      const original = found.bullet.text;
      const extra = [...said, ...found.bullet.sources.map((s) => s.text), found.entry.title, found.entry.org];
      const verdict = ASKED_TO_CHANGE.test(ctx.latest) ? checkGrounded(line, [original, ...extra], { whose: "your words", own: [original, ...said] }) : checkRewrite(original, line, extra);
      const problems = verdict.problems.map((p) => p.say);
      if (FIRST_PERSON.test(line)) problems.push(`“${line.slice(0, 60)}” uses “I” or “we”. A CV line has no “I”.`);
      problems.push(...styleProblems(line, [original, ...said]));
      return problems;
    }
    case "hide_bullet":
    case "show_bullet":
    case "move_bullet":
      return findBullet(cv.sections, op.bullet) ? [] : ["That line isn’t on the CV."];
    case "add_skills":
      return op.names.map((n) => (namedIn(n, both) ? `You haven’t said you use “${n}”.` : null)).filter((p): p is string => !!p);
    case "set_profile": {
      const years = yearsOfExperience(cv, ctx.now);
      const verdict = checkProfile(op.text, [...visibleText(cv), ...said], { years });
      return [...verdict.problems.map((p) => p.say), ...styleProblems(op.text, said).filter((p) => !p.includes("words. A line"))];
    }
    case "add_items":
      return op.items.flatMap((i) => [namedIn(i.name, both), i.level ? namedIn(i.level, both, ["native", "fluent", "basic", "conversational", "intermediate", "advanced", "beginner", "a1", "a2", "b1", "b2", "c1", "c2"]) : null]).filter((p): p is string => !!p);
  }
}

export interface Checked {
  /** The edits that passed, in order. */
  ops: Op[];
  /** The edits that didn't, each with what was wrong, for the person and for the retry. */
  left: Skipped[];
}

/**
 * Checks a reply's edits one at a time, each against the CV as the edits
 * before it left it (so a line may go under an entry the same reply added).
 * An edit that fails is left out; the rest are kept.
 */
export function checkOps(cv: Editable, ops: Op[], ctx: Context): Checked {
  let state: Editable = cv;
  const refs: Record<string, string> = {};
  const kept: Op[] = [];
  const left: Skipped[] = [];
  for (const op of ops) {
    // Names given to new entries earlier in the reply stand for their ids while checking.
    const resolved = ("entry" in op && refs[op.entry] ? { ...op, entry: refs[op.entry] } : op) as Op;
    const problems = checkOp(state, resolved, ctx);
    if (problems.length) {
      left.push({ op, why: problems[0] });
      continue;
    }
    const applied = applyOps(state, [resolved]);
    if (applied.skipped.length) {
      left.push({ op, why: applied.skipped[0].why });
      continue;
    }
    if (op.op === "add_entry") refs[op.ref] = applied.refs[op.ref];
    state = { ...state, contact: applied.contact, sections: applied.sections, target: applied.target };
    kept.push(op);
  }
  return { ops: kept, left };
}

/** The retry note for the model: each edit that was refused, and why. */
export function problemsFor(left: Skipped[]): string[] {
  return left.map((l) => `${describeOp(l.op)} was refused: ${l.why}`);
}
