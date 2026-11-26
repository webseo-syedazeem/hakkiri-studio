import { profilesByRule } from "../write/draft";
import { asBullet } from "../write/draft";
import { oneLine, sentences, terms } from "../write/facts";
import { type Editable, type Op, findBullet, findEntry } from "./ops";
import type { StepKey } from "./plan";

/**
 * The assistant without a model: what it can do by rule from the person's own
 * sentences. It picks out contact details, a job title and employer, dates,
 * study, skills and languages, and turns every other sentence about a job
 * into a line under that job, in the person's words. It runs in test mode and
 * whenever the AI service doesn't answer, so the conversation never stops,
 * and it never adds a word that carries a claim.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH = "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const YEAR = "((?:19|20)\\d\\d)";
const NOW = "(now|present|today|the present|date)";
/** Up to four words of a name or a place, stopping at the words that start the next part of a sentence. */
const NAME = "([A-Z][\\p{L}'’-]+(?:\\s+(?!(?:and|from|in|i|my|but|based|living|live|at|with|since|for|as|to)\\b)[A-Z][\\p{L}'’-]+){0,3})";
const ORG = "([A-Z0-9][\\p{L}\\d&'’.-]*(?:\\s+(?:[A-Z0-9&][\\p{L}\\d&'’.-]*|of|and|the|de|for))*)";

const date = (month: string | undefined, year: string) => {
  const m = month ? MONTHS.indexOf(month.slice(0, 3).toLowerCase()) : -1;
  return m >= 0 ? `${year}-${String(m + 1).padStart(2, "0")}` : year;
};
const titleCase = (s: string) => oneLine(s).replace(/(^|\s)(\p{Ll})/gu, (_m, a: string, b: string) => a + b.toUpperCase());
const list = (s: string) =>
  s
    .split(/,|;|\band\b|\bor\b|\//)
    .map((x) => oneLine(x).replace(/^(?:also|some|a bit of|basic|advanced)\s+/i, "").replace(/[.!?]+$/, ""))
    .filter((x) => x.length >= 2 && x.split(" ").length <= 4);

/** A pasted job advert, rather than something the person said about themselves. */
export function looksLikeAdvert(text: string): boolean {
  if (text.length < 200) return false;
  // Someone talking about their own work says "I" and "my"; an advert talks to "you" about "us".
  const mine = text.match(/(?<![\p{L}'’])(?:I|I['’]m|I['’]ve|my|me)(?![\p{L}'’])/gu)?.length ?? 0;
  if (mine > 2) return false;
  const cues = new Set((text.match(/\b(?:responsibilities|requirements|you will|you['’]ll|we are looking|we['’]re looking|about the role|about you|what you['’]ll do|essential|desirable|the ideal candidate|to apply|salary|benefits|job description|person specification)\b/gi) ?? []).map((c) => c.toLowerCase()));
  return cues.size >= 2;
}

/** Dates said about a job or a course: "since March 2021", "from 2018 to 2020", "2019 - now". */
function datesIn(s: string): { start?: string; end?: string; current?: boolean } {
  const range = new RegExp(`\\b(?:from\\s+|between\\s+)?(?:${MONTH}\\s+)?${YEAR}\\s*(?:to|until|till|through|and|-|–)\\s*(?:(?:${MONTH}\\s+)?${YEAR}|${NOW})`, "iu").exec(s);
  if (range) {
    const [, m1, y1, m2, y2, now] = range;
    return now ? { start: date(m1, y1), current: true } : { start: date(m1, y1), end: date(m2, y2!) };
  }
  const since = new RegExp(`\\b(?:since|started(?: in)?|from)\\s+(?:${MONTH}\\s+)?${YEAR}`, "iu").exec(s);
  if (since) return { start: date(since[1], since[2]), current: /\bsince\b|\bstill\b|\bcurrently\b|\bnow\b/i.test(s) || !/\bleft\b|\buntil\b/i.test(s) };
  const ended = new RegExp(`\\b(?:graduat\\w*|finish\\w*|left|until|in|class of)\\s+(?:${MONTH}\\s+)?${YEAR}`, "iu").exec(s);
  if (ended) return { end: date(ended[1], ended[2]) };
  return {};
}

const SWAP = /^\s*use\s+["“'‘]?([\p{L}][\p{L}'’-]*)["”'’]?\s+instead\s+of\s+["“'‘]?([\p{L}][\p{L}'’-]*)["”'’]?[.!]?\s*$/iu;

/**
 * "Use “used” instead of “leveraged”": the one word swapped in every line that has it, keeping each
 * line's capital letter. Null when the message isn't asking for a swap. The swap is still checked like
 * any other rewording: it may not bring in anything the person hasn't said.
 */
export function swapWord(cv: Editable, message: string): Op[] | null {
  const m = SWAP.exec(message);
  if (!m) return null;
  const [, to, from] = m;
  const find = new RegExp(`(?<![\\p{L}-])${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}-])`, "giu");
  const ops: Op[] = [];
  for (const s of cv.sections) {
    if (!("entries" in s)) continue;
    for (const e of s.entries)
      for (const b of e.bullets) {
        if (!b.visible || !find.test(b.text)) continue;
        find.lastIndex = 0;
        const text = b.text.replace(find, (w) => (w[0] === w[0].toUpperCase() ? to.charAt(0).toUpperCase() + to.slice(1) : to.toLowerCase()));
        ops.push({ op: "reword_bullet", bullet: b.id, text });
      }
  }
  return ops;
}

export interface RulesTurn {
  ops: Op[];
  /** The entry the person is now talking about: an id, or "new1" for one added this turn. */
  about?: string;
}

/** Edits read by rule from one message. `step` is the question the person was answering. */
export function rulesTurn(cv: Editable, message: string, opts: { about?: string; step?: StepKey; now: Date }): RulesTurn {
  const ops: Op[] = [];
  let about = opts.about && findEntry(cv.sections, opts.about) ? opts.about : undefined;
  let refs = 0;
  const msg = message.trim();

  if (looksLikeAdvert(msg)) return { ops: [{ op: "set_advert", text: msg }], about };

  const lead = (s: string) => s.replace(/^(?:hi|hello|hey|ok|okay|so|well|right|um|erm|yes|yeah|sure)[,!.\s]+/i, "");
  const short = msg.split(/\s+/).length <= 8;

  // A bare answer to the question that was asked: a name, a job title, a list of skills.
  if (opts.step === "name" && short && /^[\p{L}'’ -]+$/u.test(lead(msg))) {
    ops.push({ op: "set_contact", field: "fullName", value: titleCase(lead(msg)) });
    return { ops, about };
  }
  if (opts.step === "target" && short && !/\b(?:skip|no|not sure)\b/i.test(msg)) {
    const m = new RegExp(`^(?:an?\\s+)?(.+?)(?:\\s+(?:role|job|position))?(?:\\s+at\\s+${ORG})?[.!]?$`, "u").exec(lead(msg).replace(/^(?:i'?m |i am )?(?:going for|applying for|looking for)\s+/i, ""));
    if (m) ops.push({ op: "set_target", title: titleCase(m[1]), employer: m[2] ?? "" });
    return { ops, about };
  }
  if (opts.step === "skills" && !/[.!?].+[.!?]/.test(msg)) {
    const names = list(lead(msg).replace(/^(?:i (?:use|know|work with)|mostly|mainly)\s+/i, ""));
    if (names.length) ops.push({ op: "add_skills", names: names.slice(0, 12) });
    return { ops, about };
  }

  for (const raw of sentences(msg)) {
    const s = lead(raw);
    let used = false;

    const email = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.exec(s);
    if (email) {
      ops.push({ op: "set_contact", field: "email", value: email[0] });
      used = true;
    }
    const phone = /(?:\+?\d[\d ()-]{7,}\d)/.exec(s.replace(email?.[0] ?? "\u0000", ""));
    if (phone && phone[0].replace(/\D/g, "").length >= 9) {
      ops.push({ op: "set_contact", field: "phone", value: oneLine(phone[0]) });
      used = true;
    }
    const link = /\b(?:https?:\/\/\S+|(?:www\.)?(?:linkedin\.com|github\.com)\/\S+)/i.exec(s);
    if (link) {
      ops.push({ op: "add_link", value: link[0].replace(/[.,;]+$/, "") });
      used = true;
    }
    const name = new RegExp(`\\b(?:my name is|my name's|i'?m called|call me)\\s+${NAME}`, "iu").exec(s) ?? new RegExp(`^(?:[Ii]'?m|[Ii] am)\\s+${NAME}(?=[,.]|\\s+and\\b|$)`, "u").exec(s);
    if (name && !/\b(?:at|as)\b/.test(name[1])) {
      ops.push({ op: "set_contact", field: "fullName", value: titleCase(name[1]) });
      used = true;
    }
    const place = new RegExp(`\\b(?:i live in|i'?m based in|based in|living in|i'?m in|i am in|i'?m from)\\s+${NAME}`, "iu").exec(s);
    if (place) {
      ops.push({ op: "set_contact", field: "location", value: titleCase(place[1]) });
      used = true;
    }
    if (used) continue;

    const target = new RegExp(`\\b(?:applying for|going for|aiming for|i want to (?:be|become|work as))\\s+(?:a |an |the )?(?:job as (?:a |an )?|role as (?:a |an )?)?(.{2,60}?)(?:\\s+(?:role|job|position))?(?:\\s+at\\s+${ORG})?(?=[.,;!]|$)`, "iu").exec(s);
    if (target) {
      ops.push({ op: "set_target", title: titleCase(target[1]), employer: target[2] ?? "" });
      continue;
    }

    const role = new RegExp(`\\b(?:[Ii](?:'m| am)?\\s+(?:currently\\s+|now\\s+)?(?:work(?:ing)?|worked|employed)\\s+as|[Ii](?:'m| am| was)|[Mm]y (?:job|role) (?:is|was))\\s+(?:a |an |the )?(.{2,60}?)\\s+(?:at|for|with)\\s+${ORG}`, "u").exec(s);
    const isRole = role && !/^(?:part|one|responsible|in charge|able|the person)\b/i.test(role[1]) && terms(role[1]).length <= 5;
    if (role && isRole) {
      const ref = `new${++refs}`;
      ops.push({ op: "add_entry", ref, section: "experience", title: titleCase(role[1]), org: role[2].replace(/\s+(?:since|from|between|in|for|until)$/i, ""), location: "", current: false, subject: "", grade: "", start: "", end: "", ...datesIn(s) });
      about = ref;
      continue;
    }

    const study = new RegExp(`\\b(?:[Ii] studied|[Ii]'?m studying|[Ii] am studying|[Ii] did|[Ii] have|[Ii]'ve got|[Ii] got|[Ii] hold)\\s+(?:a |an )?(.{2,60}?)\\s+(?:at|from)\\s+(?:the )?${ORG}`, "u").exec(s);
    if (study) {
      const what = study[1].replace(/\s+degree$/i, "");
      const qualification = /\b(?:bsc|ba|msc|ma|mba|phd|meng|beng|llb|degree|diploma|a[- ]levels?|gcses?|hnd|btec|certificate)\b/i.test(what);
      const subject = /\bin\s+(.+)$/i.exec(what)?.[1];
      ops.push({ op: "add_entry", ref: `new${++refs}`, section: "education", title: qualification ? oneLine(what).replace(/^(\p{Ll})/u, (c) => c.toUpperCase()) : titleCase(what), org: study[2].replace(/\s+(?:in|from|until)$/i, ""), location: "", current: /\bstudying\b/i.test(s), subject: subject ? titleCase(subject) : "", grade: "", start: "", end: "", ...datesIn(s) });
      continue;
    }

    const skills = /\b(?:my skills (?:are|include)|skills:|i (?:use|know|can use|work with|am good at)|tools:)\s+(.+)$/i.exec(s);
    if (skills && list(skills[1]).length && !/\bto\b/.test(skills[1])) {
      ops.push({ op: "add_skills", names: list(skills[1]).slice(0, 12) });
      continue;
    }
    const speaks = /\bi speak\s+(.+)$/i.exec(s);
    if (speaks) {
      const items = list(speaks[1]).map((x) => {
        const m = /^(.+?)\s*\((.+)\)$|^(\p{L}+)\s+(?:to\s+)?(native|fluent|basic|conversational|intermediate|advanced|[abc][12])(?:\s+level)?$/iu.exec(x);
        return m ? { name: titleCase(m[1] ?? m[3]), level: m[2] ?? m[4] } : { name: titleCase(x), level: "" };
      });
      if (items.length) ops.push({ op: "add_items", kind: "languages", items: items.slice(0, 10) });
      continue;
    }

    if (/\b(?:write|draft|do|make|redo)\s+(?:me\s+)?(?:my|a|the)\s+(?:profile|summary|personal statement)\b/i.test(s)) {
      const skillNames = cv.sections.flatMap((x) => (x.kind === "skills" ? x.groups.flatMap((g) => g.skills.filter((k) => k.visible).map((k) => k.name)) : []));
      const profile = profilesByRule(cv, { skills: skillNames.slice(0, 3) }, opts.now).versions[0];
      if (profile) ops.push({ op: "set_profile", text: profile.text });
      continue;
    }

    const hide = /\b(?:remove|delete|take out|hide|switch off|drop)\s+(?:the\s+)?(first|last|second|third)?\s*(?:line|bullet|point)(?:\s+about\s+(.+))?/i.exec(s);
    const entry = about ? findEntry(cv.sections, about) : null;
    if (hide && entry) {
      const on = entry.entry.bullets.filter((b) => b.visible);
      const which = hide[2] ? on.find((b) => b.text.toLowerCase().includes(hide[2].toLowerCase().replace(/[.!]+$/, ""))) : hide[1] === "last" ? on[on.length - 1] : on[["first", "second", "third"].indexOf(hide[1]?.toLowerCase() ?? "first")];
      if (which && findBullet(cv.sections, which.id)) ops.push({ op: "hide_bullet", bullet: which.id });
      continue;
    }

    // Anything else said about a job is a line under it, in the person's words.
    const line = asBullet(raw);
    if (about && terms(line).length >= 3 && !/\?$/.test(raw)) ops.push({ op: "add_bullet", entry: about, text: line, quotes: [oneLine(raw)] });
  }
  return { ops, about };
}
