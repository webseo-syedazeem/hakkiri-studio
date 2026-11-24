import { reviewLetter } from "./letter/check";
import type { LetterCv } from "./letter/sources";
import { type Achievement, type CvDoc, type Locator, type Section, isEntrySection } from "./schema";
import { oneLine, terms } from "./write/facts";

/**
 * Achievements a person has marked private are kept for their own reference
 * and stay out of what they send. A line already on a CV that was taken from
 * one is named here, so the file is not made until the line is removed or
 * reworded, or the achievement is no longer private. Private lines are also
 * left out of what drafting and suggestions work from.
 */

export interface PrivateLine {
  at: Locator;
  text: string;
  /** The role it is under: "Paid Media Manager · Northlight Agency". */
  where: string;
}

type Private = Pick<Achievement, "id" | "private" | "text">;
const same = (a: string, b: string) => oneLine(a).replace(/[.\s]+$/, "").toLowerCase() === oneLine(b).replace(/[.\s]+$/, "").toLowerCase();

/**
 * The lines on this CV, switched on, that still say what an achievement
 * marked private says. A line the person has reworded is theirs to send: the
 * link to the achievement it started from does not hold it back.
 */
export function privateLines(cv: Pick<CvDoc, "sections">, achievements: Private[]): PrivateLine[] {
  const hidden = new Map(achievements.filter((a) => a.private).map((a) => [a.id, a.text]));
  if (!hidden.size) return [];
  const out: PrivateLine[] = [];
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      for (const b of e.bullets) {
        if (!b.visible || !b.text.trim()) continue;
        // By the link while the words are unchanged, and by the words themselves wherever they are.
        const linked = b.bankId !== undefined && hidden.has(b.bankId) && same(b.text, hidden.get(b.bankId)!);
        const copied = [...hidden.values()].some((text) => same(b.text, text));
        if (linked || copied) out.push({ at: { section: s.id, entry: e.id, field: b.id }, text: b.text, where: [e.title, e.org].map((x) => x.trim()).filter(Boolean).join(" · ") });
      }
    }
  }
  return out;
}

/** The CV's sections with every private line switched off: what drafting and suggestions may work from. */
export function withoutPrivate<T extends Pick<CvDoc, "sections">>(cv: T, achievements: Private[]): T {
  const lines = privateLines(cv, achievements);
  if (!lines.length) return cv;
  const off = new Set(lines.map((l) => l.at.field));
  const sections: Section[] = cv.sections.map((s) => (isEntrySection(s) ? { ...s, entries: s.entries.map((e) => ({ ...e, bullets: e.bullets.map((b) => (off.has(b.id) ? { ...b, visible: false } : b)) })) } : s));
  return { ...cv, sections };
}

/**
 * The private lines a cover letter rests on. This is worked out here, from the
 * letter's own words: a sentence rests on a line if the check names that line
 * as its source, or if it says everything the line says. What the browser
 * noted as a sentence's sources is not trusted for this.
 */
export function privateInLetter(cv: LetterCv, lines: PrivateLine[], now: Date): PrivateLine[] {
  if (!lines.length || !cv.letter) return [];
  const review = reviewLetter(cv, now);
  const stemsOf = (text: string) => new Set(terms(text).map((t) => t.stem));
  return lines.filter((l) => {
    const need = [...stemsOf(l.text)];
    return review.sentences.some((s) => {
      const named = s.sources.some((u) => u.kind === "cv" && u.at?.section === l.at.section && u.at?.entry === l.at.entry && u.at?.field === l.at.field);
      const have = stemsOf(s.text);
      return named || (need.length >= 2 && need.every((x) => have.has(x)));
    });
  });
}

/** What the person is told when a file is held back for this. */
export function privateMessage(lines: PrivateLine[], what: string): string {
  const named = lines.slice(0, 3).map((l) => `“${l.text}”${l.where ? ` (${l.where})` : ""}`).join("; ");
  return `This ${what} uses ${lines.length === 1 ? "a line" : `${lines.length} lines`} from ${lines.length === 1 ? "an achievement" : "achievements"} you marked private: ${named}. Remove or reword ${lines.length === 1 ? "it" : "them"}, or make the achievement not private, and then download.`;
}
