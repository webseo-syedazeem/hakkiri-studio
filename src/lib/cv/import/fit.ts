import { type Contact, LIMITS, type Section, isEntrySection, isListSection } from "../schema";
import type { ReadCv } from "./index";
import { whereKey } from "./parse";

/**
 * Makes what the reader produced fit what a CV and an upload record can hold.
 *
 * A file can hold more than a CV does: a role with 35 lines, 60 skills in one
 * list, a paragraph of 1,400 characters read as one bullet. None of that may
 * make the upload fail, and none of it may be dropped without a word. What
 * fits is kept where it was read; what does not is moved to "not placed",
 * where the person is shown it and decides what to do with it.
 */

/** What an upload record holds. The same numbers as its schema in `record.ts`. */
export const RECORD_LIMITS = { lines: 1500, lineText: 1000, flags: 200, flagLines: 60, whereLines: 80, unassigned: 200, omitted: 50, sections: 24, links: 4 } as const;

/** Cuts text to `max` characters at the last space that keeps most of it, and gives back what was cut off. */
function cutAt(text: string, max: number): [string, string] {
  const chars = [...text];
  if (chars.length <= max) return [text, ""];
  let head = chars.slice(0, max).join("");
  const space = head.lastIndexOf(" ");
  if (space > max * 0.6) head = head.slice(0, space);
  return [head.trimEnd(), text.slice(head.length).trim()];
}

export function fitRead(read: ReadCv): ReadCv {
  const spare: { line: number; text: string }[] = [];
  const lineOf = (section: string, entry = "", field = "") => read.where[whereKey(section, entry, field)]?.[0] ?? read.where[whereKey(section, entry)]?.[0] ?? 0;
  /** Keeps what fits of a piece of text; the rest goes to "not placed". */
  const fit = (text: string, max: number, at: number) => {
    const [head, rest] = cutAt(text ?? "", max);
    if (rest) spare.push({ line: at, text: `…${rest}` });
    return head;
  };
  /** Keeps the first `max` of a list; the rest is handed to `over` to be put aside. */
  const first = <T>(list: T[], max: number, over: (item: T) => void): T[] => {
    for (const item of list.slice(max)) over(item);
    return list.slice(0, max);
  };

  const c = read.contact;
  const contact: Contact = {
    fullName: fit(c.fullName, LIMITS.name, lineOf("contact", "", "fullName")),
    email: fit(c.email, LIMITS.email, lineOf("contact", "", "email")),
    phone: fit(c.phone, LIMITS.phone, lineOf("contact", "", "phone")),
    location: fit(c.location, LIMITS.location, lineOf("contact", "", "location")),
    links: first(c.links ?? [], RECORD_LIMITS.links, (l) => spare.push({ line: lineOf("contact", "", "links"), text: l })).map((l) => fit(l, LIMITS.link, lineOf("contact", "", "links"))),
  };

  // Across the whole CV there is a limit too: the same one a save is held to, so an upload can always be edited and saved.
  let linesLeft: number = LIMITS.totalLines;
  let skillsLeft: number = LIMITS.totalSkills;
  let entriesLeft: number = LIMITS.totalEntries;

  const sections: Section[] = first(read.sections, RECORD_LIMITS.sections, (s) => {
    const at = lineOf(s.id);
    if (s.kind === "summary") spare.push({ line: at, text: s.text });
    else if (s.kind === "skills") for (const g of s.groups) spare.push({ line: at, text: [g.name, ...g.skills.map((k) => k.name)].filter(Boolean).join(", ") });
    else if (isListSection(s)) spare.push({ line: at, text: s.items.map((i) => [i.name, i.level].filter(Boolean).join(" – ")).join(", ") });
    else if (isEntrySection(s)) for (const e of s.entries) spare.push({ line: at, text: [e.title, e.org].filter(Boolean).join(", ") }, ...e.bullets.map((b) => ({ line: at, text: b.text })));
  }).map((s): Section => {
    const title = fit(s.title, 60, lineOf(s.id));
    if (s.kind === "summary") return { ...s, title, text: fit(s.text, LIMITS.summary, lineOf(s.id, "", "text")) };
    if (s.kind === "skills") {
      const groups = first(s.groups, LIMITS.groups, (g) => spare.push({ line: lineOf(s.id, g.id), text: [g.name, ...g.skills.map((k) => k.name)].filter(Boolean).join(", ") })).map((g) => {
        const room = Math.max(0, Math.min(LIMITS.skills, skillsLeft));
        const over: string[] = [];
        const skills = first(g.skills, room, (k) => over.push(k.name)).map((k) => ({ ...k, name: fit(k.name, LIMITS.skill, lineOf(s.id, g.id, k.id)) }));
        skillsLeft -= skills.length;
        // The skills that did not fit are kept together, a line at a time, so they can be read and put back.
        for (let i = 0; i < over.length; i += 20) spare.push({ line: lineOf(s.id, g.id), text: over.slice(i, i + 20).join(", ") });
        return { ...g, name: fit(g.name, LIMITS.groupName, lineOf(s.id, g.id)), skills };
      });
      return { ...s, title, groups };
    }
    if (isListSection(s)) {
      const items = first(s.items, LIMITS.items, (i) => spare.push({ line: lineOf(s.id, i.id), text: [i.name, i.level].filter(Boolean).join(" – ") })).map((i) => ({ ...i, name: fit(i.name, LIMITS.item, lineOf(s.id, i.id)), level: fit(i.level, LIMITS.itemLevel, lineOf(s.id, i.id)) }));
      return { ...s, title, items };
    }
    if (!isEntrySection(s)) return s;
    const room = Math.max(0, Math.min(LIMITS.entries, entriesLeft));
    const entries = first(s.entries, room, (e) => {
      const at = lineOf(s.id, e.id, "title");
      spare.push({ line: at, text: [e.title, e.org, e.subject, e.location].filter(Boolean).join(", ") }, ...e.bullets.map((b) => ({ line: lineOf(s.id, e.id, b.id) || at, text: b.text })));
    }).map((e) => {
      const at = (field: string) => lineOf(s.id, e.id, field);
      const keep = Math.max(0, Math.min(LIMITS.bullets, linesLeft));
      const bullets = first(e.bullets, keep, (b) => spare.push({ line: at(b.id), text: b.text })).map((b) => ({ ...b, text: fit(b.text, LIMITS.bullet, at(b.id)), sources: b.sources.slice(0, 6).map((x) => ({ ...x, text: cutAt(x.text, 1200)[0], lines: x.lines?.slice(0, 20) })) }));
      linesLeft -= bullets.length;
      return {
        ...e,
        title: fit(e.title, LIMITS.title, at("title")),
        org: fit(e.org, LIMITS.org, at("org")),
        orgInfo: fit(e.orgInfo, LIMITS.orgInfo, at("orgInfo")),
        location: fit(e.location, LIMITS.location, at("location")),
        subject: fit(e.subject, LIMITS.subject, at("subject")),
        grade: fit(e.grade, LIMITS.grade, at("grade")),
        link: fit(e.link, LIMITS.link, at("link")),
        bullets,
      };
    });
    entriesLeft -= entries.length;
    return { ...s, title, entries };
  });

  // The file's own text, line by line. A line longer than the record holds is shown cut; its words are in the CV or under "not placed".
  const lines = read.lines.slice(0, RECORD_LIMITS.lines).map((l) => ({ ...l, text: [...l.text].length > RECORD_LIMITS.lineText ? `${[...l.text].slice(0, RECORD_LIMITS.lineText - 1).join("")}…` : l.text }));
  const real = (n: number) => Number.isInteger(n) && n >= 0 && n < lines.length;
  const where: ReadCv["where"] = {};
  for (const [k, v] of Object.entries(read.where)) if (k.length <= 140) where[k] = v.filter(real).slice(0, RECORD_LIMITS.whereLines);

  // "Not placed": what the reader could not place, then what did not fit. Each piece is short enough to show; none is dropped unsaid.
  const pieces: { line: number; text: string }[] = [];
  for (const u of [...read.unassigned, ...spare]) {
    let rest = u.text.trim();
    while (rest) {
      const [head, more] = cutAt(rest, 1000);
      if (!head) break;
      pieces.push({ line: real(u.line) ? u.line : 0, text: head });
      rest = more;
    }
  }
  const unassigned = pieces.length > RECORD_LIMITS.unassigned ? [...pieces.slice(0, RECORD_LIMITS.unassigned - 1), { line: 0, text: `And ${pieces.length - (RECORD_LIMITS.unassigned - 1)} more pieces that could not be placed. This file holds more than a CV does: paste just the text of your CV to have all of it read.` }] : pieces;

  return {
    ...read,
    contact,
    sections,
    lines,
    where,
    unassigned,
    pages: Math.max(0, Math.min(100, Math.round(read.pages) || 0)),
    flags: read.flags.slice(0, RECORD_LIMITS.flags).map((f) => ({ ...f, code: f.code.slice(0, 40), message: cutAt(f.message, 300)[0], lines: f.lines.filter(real).slice(0, RECORD_LIMITS.flagLines) })),
    omitted: read.omitted.slice(0, RECORD_LIMITS.omitted).map((o) => ({ ...o, text: cutAt(o.text, 1000)[0], reason: cutAt(o.reason, 200)[0], line: real(o.line) ? o.line : 0 })),
  };
}
