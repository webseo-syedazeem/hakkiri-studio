import { type Bullet, type CvDoc, type Entry, type EntrySection, type Locator, type Section, type SectionKind, emptyEntry, isEntrySection, isListSection } from "./schema";
import { sectionHeading } from "./sections";

/**
 * The rules of editing that do not depend on the screen: the order of the
 * form's tabs, moving an item, what one step of Undo is, where on the form a
 * line of the paper belongs, and how two copies of a CV differ.
 */

/* ------------------------------------------------------------------- moving */

/** Moves one item of a list to a new place and returns the new list. Out-of-range moves change nothing. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list];
  if (from === to || from < 0 || to < 0 || from >= out.length || to >= out.length) return out;
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/** Moves the item with one id to where another id sits. */
export function moveById<T extends { id: string }>(list: readonly T[], id: string, toId: string): T[] {
  return moveItem(
    list,
    list.findIndex((x) => x.id === id),
    list.findIndex((x) => x.id === toId),
  );
}

/* --------------------------------------------------------------------- tabs */

export interface FormTab {
  /** The last part of the address: "contact", "experience", a custom section's id, "profile", "finish". */
  key: string;
  label: string;
  section?: Section;
}

/** The form's own order: contact, the work, then the profile, which is written last, then Finish. */
const FORM_ORDER: SectionKind[] = ["experience", "education", "skills"];

/**
 * The tabs of the form, in order. Sections the person added sit after the core
 * ones and before the profile. This order is the form's: the order printed on
 * the paper is set separately.
 */
export function formTabs(cv: Pick<CvDoc, "sections" | "region">): FormTab[] {
  const find = (kind: SectionKind) => cv.sections.find((s) => s.kind === kind);
  const core = FORM_ORDER.map(find).filter((s): s is Section => !!s);
  const extra = cv.sections.filter((s) => !core.includes(s) && s.kind !== "summary");
  const summary = find("summary");
  const tab = (s: Section): FormTab => ({ key: tabKey(s, cv.sections), label: sectionHeading(s, cv.region), section: s });
  return [{ key: "contact", label: "Contact" }, ...core.map(tab), ...extra.map(tab), ...(summary ? [{ ...tab(summary), key: "profile" }] : []), { key: "finish", label: "Finish" }];
}

/** A section's tab: its kind when it is the only one of that kind, else its own id. */
function tabKey(s: Section, all: Section[]): string {
  if (s.kind === "custom") return s.id;
  return all.find((x) => x.kind === s.kind) === s ? s.kind : s.id;
}

/** The tab that holds a place in the CV. */
export function tabFor(cv: Pick<CvDoc, "sections" | "region">, at: Locator): string {
  if (at.section === "contact") return "contact";
  return formTabs(cv).find((t) => t.section?.id === at.section)?.key ?? "contact";
}

/* ------------------------------------------------------- paper ↔ form fields */

/**
 * Which field of the form a passage on the paper opens. The paper prints
 * several fields on one line (the dates, grade and place share a line), so a
 * click lands on the first of them.
 */
export function fieldFor(cv: Pick<CvDoc, "sections">, at: Locator): { entry: string; field: string } {
  if (at.section === "contact") return { entry: "", field: at.field ?? "fullName" };
  const s = cv.sections.find((x) => x.id === at.section);
  if (!s) return { entry: "", field: "" };
  if (s.kind === "summary") return { entry: "", field: "text" };
  if (s.kind === "skills") return { entry: at.entry ?? s.groups[0]?.id ?? "", field: "skills" };
  if (isListSection(s)) return { entry: "", field: at.field ?? s.items[0]?.id ?? "" };
  return { entry: at.entry ?? "", field: at.field ?? "title" };
}

/** Fields that are printed together on one line of the paper. */
const LINE_OF: Record<string, string> = { title: "title", org: "title", subject: "title", start: "start", end: "start", grade: "start", location: "start", link: "start", orgInfo: "orgInfo" };

/**
 * Whether a passage on the paper is the one being edited. `focus` is the field
 * the cursor is in; `at` is where a passage came from.
 */
export function samePassage(cv: Pick<CvDoc, "sections">, at: Locator, focus: Locator | null): boolean {
  if (!focus || at.section !== focus.section) return false;
  // A cover letter: a paragraph, or one of its fixed lines (the date, the greeting, the sign-off).
  if (at.section === "letter") return (at.entry ?? at.field ?? "") === (focus.entry ?? focus.field ?? "");
  if (at.section === "contact") return (at.field === "fullName") === (focus.field === "fullName");
  const s = cv.sections.find((x) => x.id === at.section);
  if (!s) return false;
  if (s.kind === "summary" || isListSection(s)) return true;
  if (s.kind === "skills") {
    // A skill belongs to its group's line.
    const group = (id?: string) => s.groups.find((g) => g.id === id || g.skills.some((k) => k.id === id))?.id;
    return (at.entry ?? group(at.field)) === (focus.entry || group(focus.field));
  }
  if (!isEntrySection(s) || at.entry !== focus.entry) return false;
  const line = (f?: string) => (f ? (LINE_OF[f] ?? f) : "title");
  if (line(at.field) === line(focus.field)) return true;
  // One-line kinds (a certificate, an award) print every field on the entry's single line.
  const e = s.entries.find((x) => x.id === at.entry);
  const oneLine = s.kind === "certificates" || s.kind === "awards" || s.kind === "courses" || s.kind === "publications";
  return oneLine && !!e && !e.bullets.some((b) => b.id === focus.field) && !e.bullets.some((b) => b.id === at.field);
}

/* ------------------------------------------------------------ switching off */

/**
 * Switches off the bullet, or the entry, that a passage on the paper came
 * from. Nothing is deleted: it is left off the paper and stays in the form.
 * Returns the new sections and what was switched off, or null when the
 * passage is not something that can be switched off on its own.
 */
export function switchOff(sections: Section[], at: Locator): { sections: Section[]; what: "bullet" | "entry" } | null {
  const s = sections.find((x) => x.id === at.section);
  if (!s || !isEntrySection(s) || !at.entry) return null;
  const e = s.entries.find((x) => x.id === at.entry);
  if (!e) return null;
  const isBullet = e.bullets.some((b) => b.id === at.field);
  const entry = isBullet ? { ...e, bullets: e.bullets.map((b) => (b.id === at.field ? { ...b, visible: false } : b)) } : { ...e, visible: false };
  return { what: isBullet ? "bullet" : "entry", sections: sections.map((x) => (x.id === s.id ? { ...s, entries: s.entries.map((y) => (y.id === e.id ? entry : y)) } : x)) };
}

/** How many repeatable items a section holds: entries, bullets, groups, skills, list items. Fewer after a change means something was removed. */
export function itemCount(s: Section): number {
  if (s.kind === "summary") return 0;
  if (s.kind === "skills") return s.groups.reduce((n, g) => n + 1 + g.skills.length, 0);
  if (isListSection(s)) return s.items.length;
  if (isEntrySection(s)) return s.entries.reduce((n, e) => n + 1 + e.bullets.length, 0);
  return 0;
}

/* ------------------------------------------------------------------ bullets */

/** The bullet a pointer names, with the entry and section it is in. */
export function bulletAt(sections: Section[], at: Locator | null): { section: EntrySection; entry: Entry; bullet: Bullet; index: number } | null {
  if (!at) return null;
  const section = sections.find((s) => s.id === at.section);
  if (!section || !isEntrySection(section)) return null;
  const entry = section.entries.find((e) => e.id === at.entry);
  const index = entry ? entry.bullets.findIndex((b) => b.id === at.field) : -1;
  return entry && index >= 0 ? { section, entry, bullet: entry.bullets[index], index } : null;
}

/** Changes one bullet and returns the new sections. Everything else is left exactly as it was. */
export function changeBullet(sections: Section[], at: Locator, change: Partial<Bullet>): Section[] {
  return sections.map((s) => (s.id === at.section && isEntrySection(s) ? { ...s, entries: s.entries.map((e) => (e.id === at.entry ? { ...e, bullets: e.bullets.map((b) => (b.id === at.field ? { ...b, ...change } : b)) } : e)) } : s));
}

/**
 * Adds bullets to an entry, after the ones already there. With `entry` given
 * and no entry of that id in the section, the entry is added first (a new
 * role started from notes). Returns the new sections and the entry's id.
 */
export function addBullets(sections: Section[], sectionId: string, entryId: string, bullets: Bullet[], entry?: Partial<Entry>): { sections: Section[]; entryId: string } {
  let id = entryId;
  const next = sections.map((s) => {
    if (s.id !== sectionId || !isEntrySection(s)) return s;
    if (s.entries.some((e) => e.id === entryId)) return { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...entry, id: e.id, bullets: [...e.bullets, ...bullets] } : e)) };
    const made = { ...emptyEntry(), ...entry, bullets };
    id = made.id;
    return { ...s, entries: [made, ...s.entries] };
  });
  return { sections: next, entryId: id };
}

/**
 * Whether the place a pointer names is on the page ("on"), kept but switched
 * off ("off"), or no longer in the CV ("gone"). A finding about a line that
 * was switched off is "excluded from this version", which is not the same as fixed.
 */
export function stateAt(sections: Section[], at: Locator): "on" | "off" | "gone" {
  if (at.section === "contact" || at.section === "finish") return "on";
  const s = sections.find((x) => x.id === at.section);
  if (!s) return "gone";
  if (!s.visible) return "off";
  if (!at.entry && !at.field) return "on";
  if (s.kind === "summary") return "on";
  if (s.kind === "skills") {
    const g = s.groups.find((x) => x.id === at.entry || x.skills.some((k) => k.id === at.field));
    if (!g) return "gone";
    const k = g.skills.find((x) => x.id === at.field);
    return !g.visible || (k && !k.visible) ? "off" : at.field && !k && at.field !== "name" && at.field !== "skills" ? "gone" : "on";
  }
  if (isListSection(s)) {
    const i = s.items.find((x) => x.id === at.field);
    return !i ? "gone" : i.visible ? "on" : "off";
  }
  if (!isEntrySection(s)) return "gone";
  const e = s.entries.find((x) => x.id === at.entry);
  if (!e) return at.entry ? "gone" : "on";
  if (!e.visible) return "off";
  const b = e.bullets.find((x) => x.id === at.field);
  if (b) return b.visible ? "on" : "off";
  return at.field && /^b_/.test(at.field) ? "gone" : "on";
}

/* --------------------------------------------------------------------- undo */

/** Everything a person can change about a CV. One of these is what Undo goes back to. */
export type Snapshot = Pick<CvDoc, "name" | "level" | "region" | "target" | "contact" | "sections" | "design" | "accepted" | "requirements" | "changes" | "letter">;
export const SNAPSHOT_KEYS = ["name", "level", "region", "target", "contact", "sections", "design", "accepted", "requirements", "changes", "letter"] as const;

export const snapshotOf = (cv: Snapshot): Snapshot => ({ name: cv.name, level: cv.level, region: cv.region, target: cv.target, contact: cv.contact, sections: cv.sections, design: cv.design, accepted: cv.accepted, requirements: cv.requirements, changes: cv.changes, letter: cv.letter });

export interface History {
  past: Snapshot[];
  future: Snapshot[];
  /** What the last change was to, and when: typing in the same field without a pause is one step. */
  lastKey: string;
  lastAt: number;
}

export const emptyHistory = (): History => ({ past: [], future: [], lastKey: "", lastAt: 0 });

/** Typing is one step until the person pauses this long or moves to another field. */
export const TYPING_PAUSE_MS = 1200;
const MAX_STEPS = 100;

/**
 * Notes a change that is about to be made. `before` is the CV as it was.
 * `key` names the field being typed in ("" for a click: a toggle, a move, a
 * removal), so that typing is grouped and every click is its own step.
 */
export function record(h: History, before: Snapshot, key: string, now: number): History {
  const sameTyping = !!key && key === h.lastKey && now - h.lastAt < TYPING_PAUSE_MS && h.past.length > 0;
  const past = sameTyping ? h.past : [...h.past, snapshotOf(before)].slice(-MAX_STEPS);
  // A new change after an undo: there is nothing left to redo.
  return { past, future: [], lastKey: key, lastAt: now };
}

/** Goes back one step. Returns the CV to show and the new history, or null when there is nothing to undo. */
export function undo(h: History, current: Snapshot): { history: History; snapshot: Snapshot } | null {
  const snapshot = h.past[h.past.length - 1];
  if (!snapshot) return null;
  return { snapshot, history: { past: h.past.slice(0, -1), future: [...h.future, snapshotOf(current)], lastKey: "", lastAt: 0 } };
}

export function redo(h: History, current: Snapshot): { history: History; snapshot: Snapshot } | null {
  const snapshot = h.future[h.future.length - 1];
  if (!snapshot) return null;
  return { snapshot, history: { past: [...h.past, snapshotOf(current)], future: h.future.slice(0, -1), lastKey: "", lastAt: 0 } };
}

/* ------------------------------------------------ two copies of the same CV */

export interface PartDiff {
  /** "Contact", "Experience", "Layout"… */
  label: string;
  mine: string[];
  theirs: string[];
}

function sectionLines(s: Section): string[] {
  const off = (visible: boolean) => (visible ? "" : " (off)");
  if (s.kind === "summary") return s.text.split(/\n+/).filter(Boolean);
  if (s.kind === "skills") return s.groups.map((g) => `${g.name ? `${g.name}: ` : ""}${g.skills.map((k) => k.name + off(k.visible)).join(", ")}${off(g.visible)}`);
  if (isListSection(s)) return s.items.map((i) => [i.name, i.level].filter(Boolean).join(" – ") + off(i.visible));
  if (isEntrySection(s))
    return s.entries.flatMap((e) => [[e.title, e.subject, e.org, e.orgInfo, e.location, e.start, e.current ? "Present" : e.end, e.grade, e.link].filter(Boolean).join(" · ") + off(e.visible), ...e.bullets.map((b) => `• ${b.text}${off(b.visible)}`)]);
  return [];
}

/**
 * The parts of a CV that differ between two copies, each with both wordings:
 * what is shown when the same CV was changed in two places, so the person can
 * choose and neither copy is overwritten unseen.
 */
export function diffParts(mine: Snapshot, theirs: Snapshot): PartDiff[] {
  const out: PartDiff[] = [];
  const add = (label: string, a: string[], b: string[]) => {
    if (a.join("\n") !== b.join("\n")) out.push({ label, mine: a, theirs: b });
  };
  add("CV name", [mine.name], [theirs.name]);
  const contact = (c: Snapshot["contact"]) => [c.fullName, c.email, c.phone, c.location, ...c.links].filter(Boolean);
  add("Contact", contact(mine.contact), contact(theirs.contact));
  const ids = [...new Set([...mine.sections, ...theirs.sections].map((s) => s.id))];
  for (const id of ids) {
    const a = mine.sections.find((s) => s.id === id);
    const b = theirs.sections.find((s) => s.id === id);
    const label = sectionHeading((a ?? b)!, mine.region);
    const lines = (s?: Section) => (s ? [...(s.visible ? [] : ["(section off)"]), ...sectionLines(s)] : ["(not in this copy)"]);
    add(label, lines(a), lines(b));
  }
  add("Order of sections in the form", [mine.sections.map((s) => s.id).join(",")], [theirs.sections.map((s) => s.id).join(",")].map((x) => x));
  const design = (d: Snapshot["design"]) => [`Template: ${d.template}`, `Page: ${d.pageSize}, ${d.pageTarget} page${d.pageTarget > 1 ? "s" : ""}`, `Spacing: ${d.density}`, `Fonts: ${d.fonts ?? "template's own"}`, `Colour: ${d.accent ?? "template's own"}`, `Order: ${d.order?.length ? "your own" : "template's own"}${d.order?.length ? ` (${d.order.join(",")})` : ""}`, `File name: ${d.fileName || "standard"}`];
  add("Layout", design(mine.design), design(theirs.design));
  const target = (t: Snapshot["target"]) => [t?.title ?? "", t?.employer ?? "", t?.advert ?? ""].filter(Boolean);
  add("Target job", target(mine.target), target(theirs.target));
  const letter = (l: Snapshot["letter"]) => (l ? [l.recipient ? `To: ${l.recipient}` : "", ...l.paragraphs.map((p) => p.sentences.map((x) => x.text).join(" ")), l.reason ? `Your reason: ${l.reason}` : "", ...l.notes.map((n) => `Note: ${n.text}`)].filter(Boolean) : []);
  add("Cover letter", letter(mine.letter), letter(theirs.letter));
  if (mine.level !== theirs.level || mine.region !== theirs.region) out.push({ label: "Level and region", mine: [mine.level, mine.region], theirs: [theirs.level, theirs.region] });
  // The form's own order is shown by name, not by id.
  return out.map((d) => (d.label === "Order of sections in the form" ? { ...d, mine: mine.sections.map((s) => sectionHeading(s, mine.region)), theirs: theirs.sections.map((s) => sectionHeading(s, mine.region)) } : d));
}
