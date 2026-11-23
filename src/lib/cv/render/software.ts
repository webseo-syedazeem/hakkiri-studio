import "server-only";
import { readCvFile } from "../import";
import { type CvDoc, type Entry, type Section, isEntrySection, sectionIsEmpty } from "../schema";
import { formatDates, sectionHeading } from "../sections";
import { flowText } from "./flow";
import { type ExportFormat, exportCv } from "./server";

/**
 * The Software view: what a program reading the finished file gets from it,
 * set beside what the CV says. The file is the real one that would be
 * downloaded; it is read by the upload reader, which shares no code with the
 * writers. Two readings are compared: every word in order (the check that
 * decides "Checked"), and the fields a parser sorts those words into (name,
 * headings, each role's title, employer, dates and bullets).
 */

export interface FieldRow {
  /** "Name", "Role 2: dates"… */
  label: string;
  expected: string;
  read: string;
  ok: boolean;
}

export interface SoftwareView {
  format: ExportFormat;
  /** "checked": every word, in order, nothing extra. "loss": not so. "failed": the file was made but could not be read. */
  status: "checked" | "loss" | "failed";
  name: string;
  pages: number;
  rev: number;
  checkedAt: string;
  /** What the CV says, piece by piece in reading order. */
  expected: string[];
  /** What was read from the file, line by line. */
  read: string[];
  missing: string[];
  unexpected: string[];
  /** Characters the fonts cannot draw. */
  unsupported: string[];
  fields: FieldRow[];
  /** Earned only by a file that reads back word for word, with standard headings, real text and every field where a parser expects it. */
  atsReady: boolean;
  /** When not ATS-ready: each reason, in plain words. */
  why: string[];
}

const norm = (s: string) => s.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const row = (label: string, expected: string, read: string): FieldRow => ({ label, expected, read, ok: norm(expected) === norm(read) });

type Printable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target" | "rev">;
const shown = (sections: Section[]) => sections.filter((s) => s.visible && !sectionIsEmpty(s));
const entriesOf = (sections: Section[], kind: Section["kind"]): Entry[] => sections.filter((s) => s.kind === kind && isEntrySection(s)).flatMap((s) => (isEntrySection(s) ? s.entries : []));

export async function softwareView(cv: Printable, format: ExportFormat, now = new Date()): Promise<SoftwareView> {
  const out = await exportCv(cv, format, now);
  const base = { format, name: out.name, pages: out.pages, rev: cv.rev, checkedAt: now.toISOString(), unsupported: out.missing, expected: flowText(out.flow) };
  if (!out.check) return { ...base, status: "failed", read: [], missing: [], unexpected: [], fields: [], atsReady: false, why: ["The file was made, but it could not be read back, so nothing is known about it."] };

  let fields: FieldRow[] = [];
  let read: string[] = [];
  try {
    const file = await readCvFile(out.bytes);
    read = file.lines.map((l) => l.text.replace(/\t+/g, "   ")).filter((t) => t.trim());
    const mine = shown(cv.sections);
    const c = cv.contact;
    fields = [row("Name", c.fullName, file.contact.fullName), row("Email", c.email, file.contact.email), row("Phone", c.phone, file.contact.phone), row("Town or city", c.location, file.contact.location), row("Links", c.links.filter(Boolean).join(", "), file.contact.links.join(", "))].filter((r) => r.expected || r.read);
    fields.push(row("Section headings", mine.map((s) => sectionHeading(s, cv.region)).join(" · "), shown(file.sections).map((s) => sectionHeading(s, cv.region)).join(" · ")));
    for (const [kind, noun] of [["experience", "Role"], ["education", "Qualification"]] as const) {
      const want = entriesOf(mine, kind).filter((e) => e.visible);
      const got = entriesOf(file.sections, kind);
      for (let i = 0; i < Math.max(want.length, got.length); i++) {
        const [w, g] = [want[i], got[i]];
        const title = (e?: Entry) => (e ? [[e.title, kind === "education" ? e.subject : ""].filter(Boolean).join(" "), e.org].filter(Boolean).join(" · ") : "");
        const bullets = (e?: Entry, mineOnly = false) => (e ? e.bullets.filter((b) => (mineOnly ? b.visible : true) && b.text.trim()).map((b) => b.text.trim()) : []);
        fields.push(row(`${noun} ${i + 1}`, title(w), title(g)), row(`${noun} ${i + 1}: dates`, w ? formatDates(w) : "", g ? formatDates(g) : ""));
        if (kind === "experience") fields.push(row(`${noun} ${i + 1}: bullets`, bullets(w, true).join("\n"), bullets(g).join("\n")));
      }
    }
    const skills = (sections: Section[]) => sections.flatMap((s) => (s.kind === "skills" ? s.groups.filter((g) => g.visible).flatMap((g) => g.skills.filter((k) => k.visible).map((k) => k.name.trim())) : [])).filter(Boolean);
    if (skills(mine).length || skills(file.sections).length) fields.push(row("Skills", skills(mine).join(", "), skills(file.sections).join(", ")));
  } catch (err) {
    console.error(`[cv software view] the ${format} file could not be sorted into fields:`, err);
  }

  const why: string[] = [];
  if (out.check.status !== "checked") why.push("The file does not say exactly what your CV says.");
  if (out.missing.length) why.push(`These characters would print as empty boxes: ${out.missing.join(" ")}`);
  const odd = shown(cv.sections).filter((s) => s.kind === "custom" || (s.title.trim() && norm(s.title) !== norm(sectionHeading({ kind: s.kind, title: "" }, cv.region))));
  if (odd.length) why.push(`${odd.length === 1 ? "One heading is" : "Some headings are"} not standard: ${odd.map((s) => `“${sectionHeading(s, cv.region)}”`).join(", ")}.`);
  const wrong = fields.filter((f) => !f.ok);
  if (!fields.length) why.push("The file could not be sorted into fields.");
  else if (wrong.length) why.push(`A parser reads ${wrong.length === 1 ? "one field" : `${wrong.length} fields`} differently from your CV: ${wrong.slice(0, 4).map((f) => f.label).join(", ")}${wrong.length > 4 ? "…" : ""}.`);
  return { ...base, status: out.check.status, read, missing: out.check.missing, unexpected: out.check.unexpected, fields, atsReady: why.length === 0, why };
}
