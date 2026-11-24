import { stateAt } from "../edit";
import { type CvDoc, type LetterSource, type Locator, isEntrySection, isListSection } from "../schema";
import { formatDates, sectionHeading } from "../sections";
import { yearsOfExperience } from "../write/draft";
import { figures, oneLine, sentences, terms } from "../write/facts";

/**
 * What a cover letter may rest on. Two kinds, kept apart:
 *
 *  - the person's own: every line of the CV that is switched on, their reason
 *    for applying and any note they have added;
 *  - the employer's: the advert, clause by clause, and the job's title and
 *    employer as the person gave them.
 *
 * A sentence about the person needs one of the first kind. A sentence about
 * the employer needs one of the second. Nothing else counts as a source.
 */

export type LetterCv = Pick<CvDoc, "contact" | "sections" | "target" | "region" | "letter" | "requirements">;

export interface PoolSource extends LetterSource {
  /** Where it is, in words: "Archive assistant · Paper Kite Archive", "Your reason", "The advert". */
  label: string;
}

export interface Pool {
  personal: PoolSource[];
  employer: PoolSource[];
  /** The job's title and employer: neither a claim about the person nor a fact from the advert, and usable by both. */
  job: PoolSource[];
  employerName: string;
  /** Whole years of work, from the dates on the CV. */
  years?: number;
}

export const sameAt = (a?: Locator, b?: Locator) => !!a && !!b && a.section === b.section && (a.entry ?? "") === (b.entry ?? "") && (a.field ?? "") === (b.field ?? "");

const clean = (s: string) => oneLine(s);

/** Every line of the CV that is switched on, with where it is. */
export function cvSources(cv: Pick<CvDoc, "contact" | "sections" | "region">, now: Date): PoolSource[] {
  const out: PoolSource[] = [];
  const add = (text: string, at: Locator | undefined, label: string) => {
    const t = clean(text);
    if (t) out.push({ kind: "cv", at, text: t, label });
  };
  if (cv.contact.fullName.trim()) add(cv.contact.fullName, { section: "contact", field: "fullName" }, "Your name");
  if (cv.contact.location.trim()) add(cv.contact.location, { section: "contact", field: "location" }, "Your location");
  for (const s of cv.sections) {
    if (!s.visible) continue;
    const heading = sectionHeading(s, cv.region);
    if (s.kind === "summary") {
      for (const line of sentences(s.text)) add(line, { section: s.id, field: "text" }, heading);
    } else if (s.kind === "skills") {
      for (const g of s.groups) if (g.visible) for (const k of g.skills) if (k.visible) add(k.name, { section: s.id, entry: g.id, field: k.id }, g.name.trim() ? `${heading} · ${g.name.trim()}` : heading);
    } else if (isListSection(s)) {
      for (const i of s.items) if (i.visible) add([i.name, i.level].filter(Boolean).join(" "), { section: s.id, field: i.id }, heading);
    } else if (isEntrySection(s)) {
      for (const e of s.entries) {
        if (!e.visible) continue;
        const where = [e.title, e.org].map((x) => x.trim()).filter(Boolean).join(" · ") || heading;
        add([e.title, e.subject, e.org, e.location, formatDates(e), e.grade].filter((x) => x.trim()).join(" · "), { section: s.id, entry: e.id, field: "title" }, where);
        if (e.orgInfo.trim()) add(e.orgInfo, { section: s.id, entry: e.id, field: "orgInfo" }, where);
        for (const b of e.bullets) if (b.visible) add(b.text, { section: s.id, entry: e.id, field: b.id }, where);
      }
    }
  }
  const years = yearsOfExperience(cv, now);
  if (years) add(`${years} ${years === 1 ? "year" : "years"}, worked out from the dates of your roles`, undefined, "The dates on your CV");
  return out;
}

/** Everything a letter for this version may rest on. */
export function poolOf(cv: LetterCv, now: Date): Pool {
  const personal = cvSources(cv, now);
  const letter = cv.letter;
  for (const line of sentences(letter?.reason ?? "")) personal.push({ kind: "reason", text: clean(line), label: "Your reason for applying" });
  for (const n of letter?.notes ?? []) for (const line of sentences(n.text)) personal.push({ kind: "note", noteId: n.id, text: clean(line), label: "Your note" });
  const employer: PoolSource[] = [];
  const seen = new Set<string>();
  for (const line of sentences(cv.target?.advert ?? "")) {
    const text = clean(line.replace(/^[-•*·–]\s*/, ""));
    if (!text || seen.has(text)) continue;
    seen.add(text);
    employer.push({ kind: "advert", text, label: "The advert" });
  }
  const title = cv.target?.title.trim() ?? "";
  const name = cv.target?.employer.trim() ?? "";
  const job: PoolSource[] = title || name ? [{ kind: "job", text: [title, name].filter(Boolean).join(", "), label: "The job" }] : [];
  return { personal, employer, job, employerName: name, years: yearsOfExperience(cv, now) };
}

/**
 * Whether something a sentence was checked against still reads the same.
 * "changed": the line is there with different words. "off": it has been
 * switched off in this version. "gone": it is no longer there at all.
 */
export function sourceState(source: LetterSource, cv: LetterCv, pool: Pool): { state: "same" | "changed" | "off" | "gone"; now?: string } {
  const text = clean(source.text);
  if (source.kind === "cv") {
    const here = pool.personal.filter((p) => p.kind === "cv" && (source.at ? sameAt(p.at, source.at) : !p.at));
    if (here.some((p) => p.text === text)) return { state: "same" };
    if (here.length) return { state: "changed", now: here.map((p) => p.text).join(" ") };
    if (source.at && source.at.section !== "contact" && stateAt(cv.sections, source.at) === "off") return { state: "off" };
    // A line inside a section or entry that has been switched off is off too.
    const section = cv.sections.find((s) => s.id === source.at?.section);
    if (section && (!section.visible || (isEntrySection(section) && section.entries.some((e) => e.id === source.at?.entry && !e.visible)))) return { state: "off" };
    return { state: "gone" };
  }
  const list = source.kind === "advert" ? pool.employer : source.kind === "job" ? pool.job : pool.personal.filter((p) => p.kind === source.kind && (source.kind !== "note" || p.noteId === source.noteId));
  if (list.some((p) => p.text === text)) return { state: "same" };
  if (source.kind === "job" && list.length) return { state: "changed", now: list[0].text };
  if (source.kind === "note" && list.length) return { state: "changed", now: list.map((p) => p.text).join(" ") };
  return { state: "gone" };
}

/** The lines of the CV that can be used as evidence in a letter: what the person did, not headings or single skills. */
export function evidenceLines(cv: Pick<CvDoc, "contact" | "sections" | "region">, now: Date): PoolSource[] {
  return cvSources(cv, now).filter((s) => !!s.at?.entry && /^b_/.test(s.at.field ?? "") && terms(s.text).length >= 2);
}

/** How strong a line is as evidence, for the order suggestions are shown in: a figure first, then a fuller line. */
export const strength = (text: string) => (figures(text).length ? 2 : 0) + Math.min(1, terms(text).length / 8);
