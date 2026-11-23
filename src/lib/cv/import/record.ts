import { z } from "zod";
import { type CvDoc, type Section, ContactSchema, LocatorSchema, SectionSchema, coreSections, isEntrySection, newId, sectionIsEmpty } from "../schema";
import type { ImportErrorCode } from "./errors";
import type { ReadCv } from "./index";

/**
 * An upload being checked. The file itself is not kept: this holds the text
 * read from it, the CV that was made of that text, and what the person still
 * has to look at. Nothing reaches the CV until they open it in the builder.
 */

const idPattern = /^[A-Za-z0-9_-]{4,40}$/;

export const ImportFlagSchema = z.object({
  id: z.string().regex(idPattern),
  at: LocatorSchema,
  /** A short machine name for the kind of doubt ("no-dates", "title-or-employer"…). */
  code: z.string().max(40),
  /** What the person should check, in plain words. */
  message: z.string().max(300),
  /** The lines of the file the doubt is about. */
  lines: z.array(z.number().int().min(0)).max(60).default([]),
  /** "open" until the person confirms the value, edits it or chooses to leave it blank. */
  state: z.enum(["open", "confirmed", "edited", "blank"]).default("open"),
});
export type ImportFlag = z.infer<typeof ImportFlagSchema>;

export const UnassignedSchema = z.object({
  id: z.string().regex(idPattern),
  line: z.number().int().min(0),
  text: z.string().max(1000),
  /** "open" until the person has put the text somewhere or said it is not needed. */
  state: z.enum(["open", "assigned", "dismissed"]).default("open"),
});
export type Unassigned = z.infer<typeof UnassignedSchema>;

export const DraftSchema = z.object({ contact: ContactSchema, sections: z.array(SectionSchema).max(24) });
export type ImportDraft = z.infer<typeof DraftSchema>;

export const IMPORT_STATUSES = ["needs-review", "failed", "confirmed"] as const;

export const CvImportSchema = z.object({
  id: z.string().regex(/^imp_[a-f0-9]{16}$/),
  userId: z.string().min(1),
  /** The CV this upload is for. */
  versionId: z.string(),
  /** "failed": the file could not be read (the reason is in `error`). "confirmed": the person has opened it in the builder. */
  status: z.enum(IMPORT_STATUSES),
  source: z.enum(["pdf", "docx", "linkedin-pdf", "text"]).optional(),
  fileName: z.string().max(200).default(""),
  pages: z.number().int().min(0).max(100).default(0),
  error: z.object({ code: z.string().max(30), message: z.string().max(300) }).optional(),
  /** The file's text, line by line. The file itself is never stored. */
  lines: z.array(z.object({ text: z.string().max(1000), page: z.number().int().min(0), bullet: z.boolean(), heading: z.boolean() })).max(1500).default([]),
  draft: DraftSchema,
  flags: z.array(ImportFlagSchema).max(200).default([]),
  /** Which lines of the file each field came from: "section/entry/field" → line numbers. */
  where: z.record(z.string().max(140), z.array(z.number().int().min(0)).max(80)).default({}),
  unassigned: z.array(UnassignedSchema).max(200).default([]),
  /** Lines deliberately not brought in (date of birth, "references on request"), each with the reason. */
  omitted: z.array(z.object({ text: z.string().max(1000), reason: z.string().max(200), line: z.number().int().min(0) })).max(50).default([]),
  /** The review steps the person has confirmed, by step key. */
  reviewed: z.array(z.string().max(40)).max(40).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CvImport = z.infer<typeof CvImportSchema>;

export const newImportId = () => newId("imp_").slice(0, 20);

const emptyDraft = (cv: Pick<CvDoc, "level">): ImportDraft => ({ contact: { fullName: "", email: "", phone: "", location: "", links: [] }, sections: coreSections(cv.level) });

/** The record for a file that was read. */
export function importFromRead(base: Pick<CvImport, "id" | "userId" | "versionId" | "createdAt">, read: ReadCv, fileName: string, now: string): CvImport {
  return {
    ...base,
    status: "needs-review",
    source: read.source,
    fileName: fileName.slice(0, 200),
    pages: read.pages,
    lines: read.lines,
    draft: { contact: read.contact, sections: read.sections },
    flags: read.flags.map((f) => ({ ...f, state: "open" as const })),
    where: read.where,
    unassigned: read.unassigned.map((u) => ({ id: newId("u_"), line: u.line, text: u.text, state: "open" as const })),
    omitted: read.omitted,
    reviewed: [],
    updatedAt: now,
  };
}

/** The record for a file that could not be read: it keeps the reason, so the person is offered the right way forward. */
export function importFromFailure(base: Pick<CvImport, "id" | "userId" | "versionId" | "createdAt">, cv: Pick<CvDoc, "level">, code: ImportErrorCode, message: string, fileName: string, now: string): CvImport {
  return { ...base, status: "failed", fileName: fileName.slice(0, 200), pages: 0, error: { code, message }, lines: [], draft: emptyDraft(cv), flags: [], where: {}, unassigned: [], omitted: [], reviewed: [], updatedAt: now };
}

/* ------------------------------------------------------------ the review steps */

export interface ReviewStep {
  /** The step's place in the address: "contact", a section kind, a custom section's id, or "unassigned". */
  key: string;
  /** The section it shows, for all but contact and unassigned. */
  sectionId?: string;
}

/**
 * The steps of the check, in order: contact, then each section that holds
 * something, then the text that could not be placed. The last step is always
 * there, even when nothing was left over, so the person sees that for themselves.
 */
export function reviewSteps(imp: Pick<CvImport, "draft">): ReviewStep[] {
  const steps: ReviewStep[] = [{ key: "contact" }];
  const seen = new Set<string>();
  for (const s of imp.draft.sections) {
    if (sectionIsEmpty(s)) continue;
    const key = seen.has(s.kind) || s.kind === "custom" ? s.id : s.kind;
    seen.add(s.kind);
    steps.push({ key, sectionId: s.id });
  }
  steps.push({ key: "unassigned" });
  return steps;
}

/** How many things on a step still need the person's attention. */
export function openFlags(imp: Pick<CvImport, "flags" | "unassigned">, step: ReviewStep): number {
  if (step.key === "unassigned") return imp.unassigned.filter((u) => u.state === "open").length;
  const section = step.key === "contact" ? "contact" : step.sectionId;
  return imp.flags.filter((f) => f.state === "open" && f.at.section === section).length;
}

/* -------------------------------------------------------- into the CV itself */

/**
 * Puts a checked upload into its CV. Each bullet keeps a pointer to the upload
 * and the lines it was read from, so its source can be shown later. Core
 * sections the file did not have are added, empty.
 */
export function applyImport(cv: CvDoc, imp: CvImport, now: string): CvDoc {
  const sections: Section[] = imp.draft.sections.map((s) => {
    if (!isEntrySection(s)) return s;
    return { ...s, entries: s.entries.map((e) => ({ ...e, bullets: e.bullets.map((b) => ({ ...b, sources: b.sources.map((x) => (x.kind === "upload" ? { ...x, ref: imp.id } : x)) })) })) };
  });
  for (const core of coreSections(cv.level)) if (!sections.some((s) => s.kind === core.kind)) sections.push(core);
  return { ...cv, contact: imp.draft.contact, sections, importId: imp.id, rev: cv.rev + 1, updatedAt: now };
}
