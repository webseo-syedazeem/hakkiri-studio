import { z } from "zod";
import {
  type Bullet,
  type Contact,
  type CvDoc,
  ENTRY_KINDS,
  type Entry,
  type EntryKind,
  type EntrySection,
  type Excerpt,
  LIMITS,
  LIST_KINDS,
  type ListKind,
  type Locator,
  PartialDateSchema,
  type Section,
  type SkillsSection,
  type Target,
  emptyEntry,
  emptySection,
  isEntrySection,
  isListSection,
  newBullet,
  newId,
} from "../schema";
import { sectionHeading } from "../sections";
import { oneLine } from "../write/facts";
import { tidyLine, tidyProse } from "./style";

/**
 * The edits the CV assistant can make, as data. The assistant (a model, or
 * the rules that stand in for one) proposes a list of these each turn; the
 * server checks every one against the person's own words before it is sent
 * back; the builder applies the ones that passed, as one step of Undo.
 *
 * Nothing here deletes what the person wrote: a line is switched off, not
 * removed, so it can always be switched back on (rule 4 of the CV README).
 */

const text = (max: number) => z.string().max(max * 2).transform((s) => oneLine(s).slice(0, max));
/** An id from the CV, or the name given to an entry made earlier in the same reply ("new1"). */
const Ref = z.string().regex(/^[A-Za-z0-9_-]{2,40}$/);
const Id = z.string().regex(/^[A-Za-z0-9_-]{4,40}$/);
const NewRef = z.string().regex(/^new[1-9]$/);
const CONTACT_FIELDS = ["fullName", "email", "phone", "location"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

const entryFields = {
  title: text(LIMITS.title),
  org: text(LIMITS.org),
  location: text(LIMITS.location),
  start: PartialDateSchema,
  end: PartialDateSchema,
  current: z.boolean(),
  subject: text(LIMITS.subject),
  grade: text(LIMITS.grade),
};

export const OpSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("set_contact"), field: z.enum(CONTACT_FIELDS), value: text(LIMITS.email) }),
  z.object({ op: z.literal("add_link"), value: text(LIMITS.link).refine((s) => s.length >= 4) }),
  z.object({ op: z.literal("set_target"), title: text(160), employer: text(160).default("") }),
  /** A job advert the person pasted, kept word for word as the target's advert. */
  z.object({ op: z.literal("set_advert"), text: z.string().max(40000).transform((s) => s.replace(/\r/g, "").trim().slice(0, 20000)).refine((s) => s.length >= 80) }),
  z.object({
    op: z.literal("add_entry"),
    ref: NewRef,
    section: z.enum(ENTRY_KINDS),
    ...entryFields,
    title: text(LIMITS.title).refine((s) => s.length >= 2),
    org: entryFields.org.default(""),
    location: entryFields.location.default(""),
    current: z.boolean().default(false),
    subject: entryFields.subject.default(""),
    grade: entryFields.grade.default(""),
  }),
  z.object({
    op: z.literal("update_entry"),
    entry: Ref,
    title: entryFields.title.optional(),
    org: entryFields.org.optional(),
    location: entryFields.location.optional(),
    start: z.string().regex(/^(|\d{4}|\d{4}-(0[1-9]|1[0-2]))$/).optional(),
    end: z.string().regex(/^(|\d{4}|\d{4}-(0[1-9]|1[0-2]))$/).optional(),
    current: z.boolean().optional(),
    subject: entryFields.subject.optional(),
    grade: entryFields.grade.optional(),
  }),
  z.object({ op: z.literal("add_bullet"), entry: Ref, text: text(LIMITS.bullet).refine((s) => s.length >= 3), quotes: z.array(text(1200)).max(4).default([]) }),
  z.object({ op: z.literal("reword_bullet"), bullet: Id, text: text(LIMITS.bullet).refine((s) => s.length >= 3) }),
  z.object({ op: z.literal("hide_bullet"), bullet: Id }),
  z.object({ op: z.literal("show_bullet"), bullet: Id }),
  z.object({ op: z.literal("move_bullet"), bullet: Id, to: z.enum(["top", "bottom"]) }),
  z.object({ op: z.literal("add_skills"), names: z.array(text(LIMITS.skill).refine((s) => s.length >= 1)).min(1).max(12) }),
  z.object({ op: z.literal("set_profile"), text: z.string().max(LIMITS.summary * 2).transform((s) => tidyProse(s).slice(0, LIMITS.summary)).refine((s) => s.length >= 10) }),
  z.object({ op: z.literal("add_items"), kind: z.enum(LIST_KINDS), items: z.array(z.object({ name: text(LIMITS.item).refine((s) => s.length >= 1), level: text(LIMITS.itemLevel).default("") })).min(1).max(10) }),
]);
export type Op = z.infer<typeof OpSchema>;
export type OpName = Op["op"];

/** The parts of a CV the assistant can change. */
export type Editable = Pick<CvDoc, "contact" | "sections" | "region" | "level"> & { target?: Target };

/** One change as the person is told about it, and where it is on the paper. */
export interface Change {
  op: OpName;
  say: string;
  at: Locator;
}

/** An edit that could not be made, and why. */
export interface Skipped {
  op: Op;
  why: string;
}

export interface Applied {
  contact: Contact;
  sections: Section[];
  target?: Target;
  changes: Change[];
  skipped: Skipped[];
  /** The ids given to entries the reply named "new1", "new2"… */
  refs: Record<string, string>;
}

const CONTACT_WORDS: Record<ContactField, string> = { fullName: "name", email: "email address", phone: "phone number", location: "location" };
const q = (s: string) => `“${s.length > 70 ? `${s.slice(0, 67)}…` : s}”`;

/** Where an entry is: its section, and the entry itself. */
export function findEntry(sections: Section[], id: string): { section: EntrySection; entry: Entry } | null {
  for (const s of sections) if (isEntrySection(s)) for (const e of s.entries) if (e.id === id) return { section: s, entry: e };
  return null;
}

/** Where a bullet is: its section, its entry and the bullet. */
export function findBullet(sections: Section[], id: string): { section: EntrySection; entry: Entry; bullet: Bullet } | null {
  for (const s of sections) if (isEntrySection(s)) for (const e of s.entries) for (const b of e.bullets) if (b.id === id) return { section: s, entry: e, bullet: b };
  return null;
}

/** "Data Analyst at Acme Payroll", for telling the person where a change went. */
export function entryName(e: Pick<Entry, "title" | "org">): string {
  return [e.title.trim(), e.org.trim()].filter(Boolean).join(" at ") || "this entry";
}

/** Newest first: what is current, then by end date, then by start date. An entry with no dates sorts last. */
const recency = (e: Pick<Entry, "current" | "start" | "end">) => (e.current ? "9999" : e.end || e.start || "");

const replaceSection = (sections: Section[], next: Section) => sections.map((s) => (s.id === next.id ? next : s));
const replaceEntry = (section: EntrySection, next: Entry): EntrySection => ({ ...section, entries: section.entries.map((e) => (e.id === next.id ? next : e)) });

/** The section of a kind, made and put in a sensible place when the CV has none. */
function sectionOf(sections: Section[], kind: Section["kind"]): { sections: Section[]; section: Section } {
  const found = sections.find((s) => s.kind === kind && s.visible) ?? sections.find((s) => s.kind === kind);
  if (found) return { sections, section: found };
  const made = emptySection(kind);
  // A profile goes first; anything else goes at the end, where a new section is added in the builder too.
  const next = kind === "summary" ? [made, ...sections] : [...sections, made];
  return { sections: next, section: made };
}

/**
 * Applies the edits, in order, to a copy of the CV. An edit that names
 * something not in the CV, or would go past what a CV can hold, is skipped
 * with a reason; the others still apply. Pure: the same code runs on the
 * server (to check a reply) and in the browser (to make the change).
 */
export function applyOps(cv: Editable, ops: Op[], opts: { spoken?: boolean } = {}): Applied {
  let contact: Contact = { ...cv.contact, links: [...cv.contact.links] };
  let sections: Section[] = cv.sections;
  let target: Target | undefined = cv.target;
  const changes: Change[] = [];
  const skipped: Skipped[] = [];
  const refs: Record<string, string> = {};
  const kind: Excerpt["kind"] = opts.spoken ? "spoken" : "typed";
  const entryId = (ref: string) => refs[ref] ?? ref;

  for (const op of ops) {
    const skip = (why: string) => skipped.push({ op, why });
    switch (op.op) {
      case "set_contact": {
        if (!op.value) {
          skip("There was nothing to set.");
          break;
        }
        contact = { ...contact, [op.field]: op.value };
        changes.push({ op: op.op, say: `Set your ${CONTACT_WORDS[op.field]} to ${q(op.value)}`, at: { section: "contact", field: op.field } });
        break;
      }
      case "add_link": {
        if (contact.links.some((l) => l.toLowerCase() === op.value.toLowerCase())) {
          skip("That link is already on your CV.");
          break;
        }
        if (contact.links.length >= 4) {
          skip("A CV holds up to four links.");
          break;
        }
        contact = { ...contact, links: [...contact.links, op.value] };
        changes.push({ op: op.op, say: `Added the link ${q(op.value)}`, at: { section: "contact", field: "links" } });
        break;
      }
      case "set_target": {
        if (!op.title) {
          skip("There was no job title.");
          break;
        }
        target = { title: op.title, employer: op.employer, advert: target?.advert ?? "" };
        changes.push({ op: op.op, say: `Aimed this CV at ${q(entryName({ title: op.title, org: op.employer }))}`, at: { section: "contact" } });
        break;
      }
      case "set_advert": {
        target = { title: target?.title ?? "", employer: target?.employer ?? "", advert: op.text };
        changes.push({ op: op.op, say: "Saved the job advert, to match your CV to it", at: { section: "contact" } });
        break;
      }
      case "add_entry": {
        if (refs[op.ref]) {
          skip(`${op.ref} was used for two entries.`);
          break;
        }
        const got = sectionOf(sections, op.section);
        sections = got.sections;
        const section = got.section as EntrySection;
        if (section.entries.length >= LIMITS.entries) {
          skip("That section is full.");
          break;
        }
        const entry: Entry = { ...emptyEntry(), title: op.title, org: op.org, location: op.location, start: op.start, end: op.current ? "" : op.end, current: op.current, subject: op.subject, grade: op.grade };
        // Newest first, as a CV reads. An entry with no dates goes after the rest until it has some.
        const key = recency(entry);
        const at = key ? section.entries.findIndex((e) => recency(e) < key) : -1;
        const entries = [...section.entries];
        entries.splice(at < 0 ? entries.length : at, 0, entry);
        sections = replaceSection(sections, { ...section, entries });
        refs[op.ref] = entry.id;
        changes.push({ op: op.op, say: `Added ${q(entryName(entry))} to ${sectionHeading(section, cv.region)}`, at: { section: section.id, entry: entry.id, field: "title" } });
        break;
      }
      case "update_entry": {
        const found = findEntry(sections, entryId(op.entry));
        if (!found) {
          skip("That entry isn’t on your CV.");
          break;
        }
        const { op: _op, entry: _entry, ...fields } = op;
        const set = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) as Partial<Entry>;
        if (!Object.keys(set).length) {
          skip("There was nothing to change.");
          break;
        }
        const next: Entry = { ...found.entry, ...set };
        if (next.current) next.end = "";
        sections = replaceSection(sections, replaceEntry(found.section, next));
        changes.push({ op: op.op, say: `Updated ${q(entryName(next))}`, at: { section: found.section.id, entry: next.id, field: Object.keys(set)[0] } });
        break;
      }
      case "add_bullet": {
        const found = findEntry(sections, entryId(op.entry));
        if (!found) {
          skip("The entry for that line isn’t on your CV yet.");
          break;
        }
        const line = tidyLine(op.text);
        if (found.entry.bullets.some((b) => oneLine(b.text).toLowerCase() === line.toLowerCase())) {
          skip("That line is already there.");
          break;
        }
        if (found.entry.bullets.length >= LIMITS.bullets) {
          skip("That entry already has as many lines as a CV can hold.");
          break;
        }
        const quotes = op.quotes.filter(Boolean).slice(0, 6);
        const verbatim = quotes.some((s) => tidyLine(s).replace(/^(?:I|We)\s+/i, "").toLowerCase() === line.toLowerCase());
        const bullet = newBullet(line, quotes.length && verbatim ? kind : "assisted", quotes.map((s) => ({ kind, text: s })));
        sections = replaceSection(sections, replaceEntry(found.section, { ...found.entry, bullets: [...found.entry.bullets, bullet] }));
        changes.push({ op: op.op, say: `Added a line to ${entryName(found.entry)}: ${q(line)}`, at: { section: found.section.id, entry: found.entry.id, field: bullet.id } });
        break;
      }
      case "reword_bullet": {
        const found = findBullet(sections, op.bullet);
        if (!found) {
          skip("That line isn’t on your CV.");
          break;
        }
        const line = tidyLine(op.text);
        if (oneLine(found.bullet.text) === line) {
          skip("The new wording was the same as the old.");
          break;
        }
        // The line's sources stay: the new wording rests on the same words of the person's, and on what they just said.
        const next: Bullet = { ...found.bullet, text: line, origin: "assisted" };
        sections = replaceSection(sections, replaceEntry(found.section, { ...found.entry, bullets: found.entry.bullets.map((b) => (b.id === next.id ? next : b)) }));
        changes.push({ op: op.op, say: `Reworded a line in ${entryName(found.entry)}: ${q(line)}`, at: { section: found.section.id, entry: found.entry.id, field: next.id } });
        break;
      }
      case "hide_bullet":
      case "show_bullet": {
        const found = findBullet(sections, op.bullet);
        if (!found) {
          skip("That line isn’t on your CV.");
          break;
        }
        const visible = op.op === "show_bullet";
        if (found.bullet.visible === visible) {
          skip(visible ? "That line is already on." : "That line is already off.");
          break;
        }
        sections = replaceSection(sections, replaceEntry(found.section, { ...found.entry, bullets: found.entry.bullets.map((b) => (b.id === op.bullet ? { ...b, visible } : b)) }));
        changes.push({ op: op.op, say: visible ? `Switched a line back on: ${q(found.bullet.text)}` : `Switched off a line (it’s kept, and you can switch it back on): ${q(found.bullet.text)}`, at: { section: found.section.id, entry: found.entry.id, field: op.bullet } });
        break;
      }
      case "move_bullet": {
        const found = findBullet(sections, op.bullet);
        if (!found) {
          skip("That line isn’t on your CV.");
          break;
        }
        const rest = found.entry.bullets.filter((b) => b.id !== op.bullet);
        const bullets = op.to === "top" ? [found.bullet, ...rest] : [...rest, found.bullet];
        sections = replaceSection(sections, replaceEntry(found.section, { ...found.entry, bullets }));
        changes.push({ op: op.op, say: `Moved a line to the ${op.to} of ${entryName(found.entry)}: ${q(found.bullet.text)}`, at: { section: found.section.id, entry: found.entry.id, field: op.bullet } });
        break;
      }
      case "add_skills": {
        const got = sectionOf(sections, "skills");
        sections = got.sections;
        const section = got.section as SkillsSection;
        const have = new Set(section.groups.flatMap((g) => g.skills.map((k) => k.name.toLowerCase())));
        const fresh = [...new Set(op.names.map((n) => n.trim()).filter((n) => n && !have.has(n.toLowerCase())))];
        if (!fresh.length) {
          skip("Those skills are already on your CV.");
          break;
        }
        const groups = section.groups.length ? [...section.groups] : [{ id: newId("g_"), name: "", visible: true, skills: [] }];
        const group = groups[0];
        const room = Math.max(0, LIMITS.skills - group.skills.length);
        const added = fresh.slice(0, room);
        if (!added.length) {
          skip("Your skills list is full.");
          break;
        }
        groups[0] = { ...group, skills: [...group.skills, ...added.map((name) => ({ id: newId("k_"), name, visible: true }))] };
        sections = replaceSection(sections, { ...section, groups });
        changes.push({ op: op.op, say: `Added ${added.length === 1 ? "a skill" : `${added.length} skills`}: ${added.join(", ")}`, at: { section: section.id } });
        break;
      }
      case "set_profile": {
        const got = sectionOf(sections, "summary");
        sections = got.sections;
        const section = got.section;
        if (section.kind !== "summary") break;
        sections = replaceSection(sections, { ...section, text: op.text, visible: true });
        changes.push({ op: op.op, say: section.text.trim() ? "Rewrote your profile" : "Wrote your profile", at: { section: section.id } });
        break;
      }
      case "add_items": {
        const got = sectionOf(sections, op.kind as ListKind);
        sections = got.sections;
        const section = got.section;
        if (!isListSection(section)) break;
        const have = new Set(section.items.map((i) => i.name.toLowerCase()));
        const fresh = op.items.filter((i) => !have.has(i.name.toLowerCase())).slice(0, Math.max(0, LIMITS.items - section.items.length));
        if (!fresh.length) {
          skip("Those are already on your CV.");
          break;
        }
        sections = replaceSection(sections, { ...section, items: [...section.items, ...fresh.map((i) => ({ id: newId("i_"), name: i.name, level: i.level, visible: true }))] });
        changes.push({ op: op.op, say: `Added to ${sectionHeading(section, cv.region)}: ${fresh.map((i) => (i.level ? `${i.name} (${i.level})` : i.name)).join(", ")}`, at: { section: section.id } });
        break;
      }
    }
  }
  return { contact, sections, target, changes, skipped, refs };
}

/** Reads a list of proposed edits one by one: the ones that are well formed, and a reason for each one that isn't. */
export function parseOps(raw: unknown[]): { ops: Op[]; bad: string[] } {
  const ops: Op[] = [];
  const bad: string[] = [];
  raw.forEach((r, i) => {
    const got = OpSchema.safeParse(r);
    if (got.success) ops.push(got.data);
    else bad.push(`Operation ${i + 1} (${typeof r === "object" && r && "op" in r ? String((r as { op: unknown }).op) : "unknown"}) is not valid: ${got.error.issues.slice(0, 2).map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
  });
  return { ops, bad };
}

/** A short name for an edit, for telling the person what was left out. */
export function describeOp(op: Op): string {
  switch (op.op) {
    case "set_contact":
      return `your ${CONTACT_WORDS[op.field]} as ${q(op.value)}`;
    case "add_link":
      return `the link ${q(op.value)}`;
    case "set_target":
      return `the target job ${q(entryName({ title: op.title, org: op.employer }))}`;
    case "set_advert":
      return "the job advert";
    case "add_entry":
      return q(entryName(op));
    case "update_entry":
      return "a change to an entry";
    case "add_bullet":
    case "reword_bullet":
      return `the line ${q(op.text)}`;
    case "hide_bullet":
    case "show_bullet":
    case "move_bullet":
      return "a change to a line";
    case "add_skills":
      return op.names.length === 1 ? `the skill ${q(op.names[0])}` : `the skills ${op.names.join(", ")}`;
    case "set_profile":
      return "a profile";
    case "add_items":
      return op.items.map((i) => i.name).join(", ");
  }
}

export const isEntryKind = (k: string): k is EntryKind => (ENTRY_KINDS as readonly string[]).includes(k);
