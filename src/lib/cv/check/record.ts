import crypto from "node:crypto";
import { z } from "zod";
import type { ReadCv } from "../import";
import { CV_REGIONS, ContactSchema, SectionSchema } from "../schema";

/**
 * "Check my CV or cover letter", made while signed in. What was checked is
 * kept with the person's account for 30 days so the report can be opened
 * again, then removed. The report itself is worked out again from these
 * fields each time it is opened, by the same code as the builder, so it never
 * goes out of step with the score the builder shows.
 */

export const DOC_CHECK_ID = /^chk_[a-f0-9]{16}$/;
export const isDocCheckId = (id: unknown): id is string => typeof id === "string" && DOC_CHECK_ID.test(id);
export const newDocCheckId = () => `chk_${crypto.randomBytes(8).toString("hex")}`;

export const DOC_CHECK_DAYS = 30;
export const MAX_CV_TEXT = 25_000;
export const MAX_LETTER_TEXT = 12_000;
export const MAX_ADVERT_TEXT = 20_000;

/** What software read from an uploaded file: the person sees it, so they know what an applicant tracking system would see. */
export const FileReadSchema = z.object({
  name: z.string().max(200),
  kind: z.enum(["pdf", "docx"]),
  pages: z.number().int().min(0).max(100),
  words: z.number().int().min(0),
  /** The contact details found, by name: "Name", "Email", "Phone", "Location", "Links". */
  contact: z.array(z.string().max(20)).max(5).default([]),
  /** The section headings it recognised, in the file's order. */
  sections: z.array(z.string().max(80)).max(30).default([]),
  /** Lines it read but could not place anywhere in a CV. */
  unplaced: z.array(z.string().max(300)).max(20).default([]),
  /** Lines it left out on purpose, and why ("Date of birth: not needed on a CV"). */
  omitted: z.array(z.object({ text: z.string().max(300), reason: z.string().max(200) })).max(20).default([]),
  /** Things it was not sure of, in plain words. */
  doubts: z.array(z.string().max(300)).max(20).default([]),
});
export type FileRead = z.infer<typeof FileReadSchema>;

export const LetterReadSchema = z.object({ name: z.string().max(200), kind: z.enum(["pdf", "docx"]), pages: z.number().int().min(0).max(100) });
export type LetterRead = z.infer<typeof LetterReadSchema>;

export const DocCheckSchema = z.object({
  id: z.string().regex(DOC_CHECK_ID),
  userId: z.string().min(1),
  docType: z.enum(["cv", "cover", "both"]),
  region: z.enum(CV_REGIONS),
  /** The CV's text as read, kept so the person can open it in the builder. */
  cvText: z.string().max(MAX_CV_TEXT).default(""),
  /** The CV as it was read into its parts. */
  cv: z.object({ contact: ContactSchema, sections: z.array(SectionSchema).max(24) }).optional(),
  cvRead: FileReadSchema.optional(),
  letterText: z.string().max(MAX_LETTER_TEXT).default(""),
  letterRead: LetterReadSchema.optional(),
  jobText: z.string().max(MAX_ADVERT_TEXT).default(""),
  /** The numbers when it was made, for lists. The report works them out again. */
  cvScore: z.number().min(0).max(100).optional(),
  letterScore: z.number().min(0).max(100).optional(),
  matchScore: z.number().min(0).max(100).nullable().optional(),
  /** The CV a letter-only check was opened in, so opening it again goes back there instead of making another. */
  versionId: z.string().max(60).optional(),
  createdAt: z.string(),
  expiresAt: z.string(),
});
export type DocCheck = z.infer<typeof DocCheckSchema>;

export const docCheckExpired = (c: Pick<DocCheck, "expiresAt">, now = new Date()) => !c.expiresAt || Number.isNaN(Date.parse(c.expiresAt)) || Date.parse(c.expiresAt) <= now.getTime();

const CONTACT_NAMES: [keyof ReadCv["contact"], string][] = [
  ["fullName", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["location", "Location"],
  ["links", "Links"],
];

/** What the reader took from an uploaded CV, in the terms the report shows it. */
export function fileReadOf(read: ReadCv, name: string): FileRead {
  const words = read.lines.reduce((n, l) => n + l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length, 0);
  const contact = CONTACT_NAMES.filter(([k]) => {
    const v = read.contact[k];
    return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "";
  }).map(([, label]) => label);
  const filled = (s: ReadCv["sections"][number]) => (s.kind === "summary" ? s.text.trim() !== "" : s.kind === "skills" ? s.groups.some((g) => g.skills.length > 0) : "entries" in s ? s.entries.length > 0 : s.items.length > 0);
  const sections = read.sections.filter(filled).map((s) => s.title.slice(0, 80));
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  return FileReadSchema.parse({
    name: cut(name || "Your file", 200),
    kind: read.source === "docx" ? "docx" : "pdf",
    pages: Math.min(100, read.pages),
    words,
    contact,
    sections: sections.slice(0, 30),
    unplaced: read.unassigned.slice(0, 20).map((u) => cut(u.text, 300)),
    omitted: read.omitted.slice(0, 20).map((o) => ({ text: cut(o.text, 300), reason: cut(o.reason, 200) })),
    doubts: [...new Set(read.flags.map((f) => f.message))].slice(0, 20).map((m) => cut(m, 300)),
  });
}

/** The text of an uploaded CV, line by line, with its bullet marks: what "Open in the builder" reads again. */
export const cvTextOf = (read: ReadCv) => read.lines.map((l) => `${l.bullet ? "• " : ""}${l.text}`).join("\n").slice(0, MAX_CV_TEXT);
