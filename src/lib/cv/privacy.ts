import { type Achievement, type CvDoc, type Locator, isEntrySection } from "./schema";

/**
 * Achievements a person has marked private are kept for their own reference
 * and stay out of what they send. A line already on a CV that was taken from
 * one is named here, so the file is not made until the line is removed or
 * reworded, or the achievement is no longer private.
 */

export interface PrivateLine {
  at: Locator;
  text: string;
  /** The role it is under: "Paid Media Manager · Northlight Agency". */
  where: string;
}

/** The lines on this CV, switched on, that come from an achievement marked private. */
export function privateLines(cv: Pick<CvDoc, "sections">, achievements: Pick<Achievement, "id" | "private">[]): PrivateLine[] {
  const hidden = new Set(achievements.filter((a) => a.private).map((a) => a.id));
  if (!hidden.size) return [];
  const out: PrivateLine[] = [];
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      for (const b of e.bullets) if (b.visible && b.bankId && hidden.has(b.bankId)) out.push({ at: { section: s.id, entry: e.id, field: b.id }, text: b.text, where: [e.title, e.org].map((x) => x.trim()).filter(Boolean).join(" · ") });
    }
  }
  return out;
}

/** The lines among those that a cover letter rests on. */
export function privateInLetter(cv: Pick<CvDoc, "letter">, lines: PrivateLine[]): PrivateLine[] {
  const used = (cv.letter?.paragraphs ?? []).flatMap((p) => p.sentences.flatMap((s) => s.sources));
  return lines.filter((l) => used.some((u) => u.kind === "cv" && u.at?.section === l.at.section && u.at?.entry === l.at.entry && u.at?.field === l.at.field));
}

/** What the person is told when a file is held back for this. */
export function privateMessage(lines: PrivateLine[], what: string): string {
  const named = lines.slice(0, 3).map((l) => `“${l.text}”${l.where ? ` (${l.where})` : ""}`).join("; ");
  return `This ${what} uses ${lines.length === 1 ? "a line" : `${lines.length} lines`} from ${lines.length === 1 ? "an achievement" : "achievements"} you marked private: ${named}. Remove or reword ${lines.length === 1 ? "it" : "them"}, or make the achievement not private, and then download.`;
}
