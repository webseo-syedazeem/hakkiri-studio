import { z } from "zod";

/**
 * The CV document: one self-contained record per version. A base CV and each
 * tailored version of it are separate records with their own ids. Everything in it was
 * typed, spoken or uploaded by its owner; nothing is filled in for them.
 *
 * Shape: contact details, then an ordered list of sections. The order of the
 * list is the order on the page, so reordering is moving an item in the list.
 * Every section, entry, bullet and skill has an id and can be switched off
 * without being deleted (a tailored version hides what a job doesn't need).
 */

/* ------------------------------------------------------------------ basics */

export const CV_LEVELS = ["student", "early", "experienced", "senior"] as const;
export type CvLevel = (typeof CV_LEVELS)[number];
export const LEVEL_LABELS: Record<CvLevel, string> = {
  student: "Student or graduate",
  early: "Early career",
  experienced: "Experienced",
  senior: "Senior",
};

export const CV_REGIONS = ["uk", "us"] as const;
export type CvRegion = (typeof CV_REGIONS)[number];

/** A short single-line string: trimmed, no control characters, capped. */
const line = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max))
    .default("");
/** Longer text that may keep its line breaks. */
const prose = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((s) =>
      s
        .replace(/\r/g, "")
        .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max),
    )
    .default("");
const id = z.string().regex(/^[A-Za-z0-9_-]{4,40}$/);

/** A date as the person gave it: "", a year ("2021") or a month ("2021-03"). */
export const PartialDateSchema = z.string().regex(/^(|\d{4}|\d{4}-(0[1-9]|1[0-2]))$/).default("");

/** Where a line of the CV came from. "assisted" lines were drafted from the person's own notes. */
export const BULLET_ORIGINS = ["typed", "upload", "spoken", "assisted"] as const;

/**
 * Where the words of a line came from: something the person typed, a passage
 * of a file they uploaded, a transcript they reviewed or a story from their
 * story bank. Kept so that every claim on the CV can be traced back to them.
 */
export const EXCERPT_KINDS = ["typed", "upload", "spoken", "story"] as const;
export const ExcerptSchema = z.object({
  kind: z.enum(EXCERPT_KINDS),
  /** The import, capture or story the words are in. */
  ref: z.string().max(60).optional(),
  /** For an upload: which lines of the file's text, and the page. */
  lines: z.array(z.number().int().min(0)).max(20).optional(),
  page: z.number().int().min(0).optional(),
  /** The person's own words, as they were. */
  text: prose(1200),
});
export type Excerpt = z.infer<typeof ExcerptSchema>;

export const BulletSchema = z.object({
  id,
  text: line(600),
  visible: z.boolean().default(true),
  origin: z.enum(BULLET_ORIGINS).default("typed"),
  sources: z.array(ExcerptSchema).max(6).default([]),
  /** The saved achievement this line was taken from, if any. */
  bankId: z.string().regex(/^ach_[a-f0-9]{16}$/).optional(),
});
export type Bullet = z.infer<typeof BulletSchema>;

/**
 * A saved achievement: something the person did, in wording they approved,
 * kept so it can be used again in any CV. `original` holds their own words
 * when the wording was drafted from them.
 */
export const AchievementSchema = z.object({
  id: z.string().regex(/^ach_[a-f0-9]{16}$/),
  userId: z.string().min(1),
  text: line(600),
  original: prose(4000),
  sources: z.array(ExcerptSchema).max(8).default([]),
  /** The role and employer it belongs to, as the person names them. */
  role: line(160),
  org: line(160),
  skills: z.array(line(80)).max(12).default([]),
  /** Private: kept for the person's own reference and left out of drafting and suggestions. */
  private: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Achievement = z.infer<typeof AchievementSchema>;

/* ----------------------------------------------------------------- contact */

export const ContactSchema = z.object({
  /** The name the person uses professionally. */
  fullName: line(120),
  email: line(160),
  phone: line(40),
  /** Town or city only: no street address. */
  location: line(120),
  /** Relevant links: LinkedIn, a portfolio, GitHub. */
  links: z.array(line(200)).max(4).default([]),
});
export type Contact = z.infer<typeof ContactSchema>;

/* ---------------------------------------------------------------- sections */

/** Sections made of dated or titled entries. One field set covers them all; each kind uses the fields it needs. */
export const ENTRY_KINDS = ["experience", "education", "projects", "volunteering", "certificates", "awards", "publications", "courses", "achievements", "custom"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];
/** Sections that are simple lists. */
export const LIST_KINDS = ["languages", "interests"] as const;
export type ListKind = (typeof LIST_KINDS)[number];
export const SECTION_KINDS = ["summary", "skills", ...ENTRY_KINDS, ...LIST_KINDS] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

export const EntrySchema = z.object({
  id,
  visible: z.boolean().default(true),
  /** Job title, qualification, project name, certificate, award, publication (a whole citation) or course. */
  title: line(400),
  /** Employer, institution, organisation, issuing body, publisher or provider. */
  org: line(160),
  /** One line on what the employer does and how big it is (context for writing help; not printed). */
  orgInfo: line(240),
  location: line(120),
  start: PartialDateSchema,
  end: PartialDateSchema,
  /** Still doing this: the end date reads "Present". */
  current: z.boolean().default(false),
  /** The subject of a qualification (education): "Economics". */
  subject: line(120),
  /** Degree class, grade or GPA (education). */
  grade: line(120),
  link: line(200),
  bullets: z.array(BulletSchema).max(30).default([]),
});
export type Entry = z.infer<typeof EntrySchema>;

export const SkillSchema = z.object({ id, name: line(80), visible: z.boolean().default(true) });
export type Skill = z.infer<typeof SkillSchema>;
export const SkillGroupSchema = z.object({
  id,
  /** "Tools", "Languages"… Empty for a single ungrouped list. */
  name: line(60),
  visible: z.boolean().default(true),
  skills: z.array(SkillSchema).max(40).default([]),
});
export type SkillGroup = z.infer<typeof SkillGroupSchema>;

export const ListItemSchema = z.object({
  id,
  name: line(120),
  /** For languages: "Native", "Fluent", "B2"… */
  level: line(60),
  visible: z.boolean().default(true),
});
export type ListItem = z.infer<typeof ListItemSchema>;

const sectionBase = {
  id,
  visible: z.boolean().default(true),
  /** The person's own heading for this section. Empty uses the standard one for the kind and region. */
  title: line(60),
};

export const SummarySectionSchema = z.object({ ...sectionBase, kind: z.literal("summary"), text: prose(2000) });
export const SkillsSectionSchema = z.object({ ...sectionBase, kind: z.literal("skills"), groups: z.array(SkillGroupSchema).max(12).default([]) });
export const EntrySectionSchema = z.object({ ...sectionBase, kind: z.enum(ENTRY_KINDS), entries: z.array(EntrySchema).max(40).default([]) });
export const ListSectionSchema = z.object({ ...sectionBase, kind: z.enum(LIST_KINDS), items: z.array(ListItemSchema).max(40).default([]) });

export const SectionSchema = z.discriminatedUnion("kind", [SummarySectionSchema, SkillsSectionSchema, EntrySectionSchema, ListSectionSchema]);
export type SummarySection = z.infer<typeof SummarySectionSchema>;
export type SkillsSection = z.infer<typeof SkillsSectionSchema>;
export type EntrySection = z.infer<typeof EntrySectionSchema>;
export type ListSection = z.infer<typeof ListSectionSchema>;
export type Section = z.infer<typeof SectionSchema>;

export const isEntrySection = (s: Section): s is EntrySection => (ENTRY_KINDS as readonly string[]).includes(s.kind);
export const isListSection = (s: Section): s is ListSection => (LIST_KINDS as readonly string[]).includes(s.kind);

/* ----------------------------------------------------- target job, design */

/** The job this CV is aimed at. Optional; once given, tailoring and the fit score use it. */
export const TargetSchema = z.object({
  title: line(160),
  employer: line(160),
  advert: prose(20000),
});
export type Target = z.infer<typeof TargetSchema>;

export const CV_TEMPLATES = ["standard", "graduate", "compact", "executive", "portfolio", "research", "career-change", "technical"] as const;
export type TemplateId = (typeof CV_TEMPLATES)[number];
export const CV_ACCENTS = ["indigo", "navy", "teal", "copper", "plum", "slate"] as const;
export type AccentId = (typeof CV_ACCENTS)[number];
export const CV_DENSITIES = ["tighter", "default", "looser"] as const;
export type Density = (typeof CV_DENSITIES)[number];

export const DesignSchema = z.object({
  template: z.enum(CV_TEMPLATES).default("standard"),
  pageSize: z.enum(["a4", "letter"]).default("a4"),
  /** One control: tighter (85% of the template's spacing), default, or looser (115%). Type size is never changed. */
  density: z.preprocess((v) => (typeof v === "number" ? (v < 0 ? "tighter" : v > 0 ? "looser" : "default") : v), z.enum(CV_DENSITIES).default("default")),
  /** How many whole pages the CV should fill. */
  pageTarget: z.union([z.literal(1), z.literal(2)]).default(2),
  /** The font pairing, when the person has changed it from the template's own: the id of the template whose fonts to use. */
  fonts: z.enum(CV_TEMPLATES).optional(),
  /** The accent colour, when changed from the template's own. */
  accent: z.enum(CV_ACCENTS).optional(),
  /** The order of sections on the paper, by section id, when the person has changed it from the template's own. */
  order: z.array(z.string().max(40)).max(24).optional(),
  /** The person's own file name for downloads, without the extension. Empty uses "[Name] - [Role] - CV". */
  fileName: line(120).optional(),
});
export type Design = z.infer<typeof DesignSchema>;

/* ------------------------------------------------------- pointing at a line */

/**
 * Points at one place in the CV: a contact field, a section, an entry in it,
 * a field of that entry or one bullet. Upload questions use it now; score
 * findings use the same pointer to link a finding to its line.
 */
export const LocatorSchema = z.object({
  /** "contact", or a section id. */
  section: z.string().max(40),
  entry: z.string().max(40).optional(),
  /** A field name ("title", "start", "phone"…) or a bullet, skill or list item id. */
  field: z.string().max(40).optional(),
});
export type Locator = z.infer<typeof LocatorSchema>;

/* -------------------------------------------------------------- the CV doc */

export const CvDocSchema = z.object({
  id: z.string().regex(/^cv_[a-f0-9]{16}$/),
  userId: z.string().min(1),
  /** Goes up by one on every save; a save from an out-of-date copy is refused. */
  rev: z.number().int().min(1).default(1),
  /** The name of the last save applied, so the same save sent twice is applied once. */
  lastSaveId: z.string().max(40).optional(),
  name: line(120),
  kind: z.enum(["base", "tailored"]).default("base"),
  /** For a tailored version: the base CV it was made from, and that CV's revision at the time. */
  parentId: z.string().optional(),
  parentRev: z.number().int().min(1).optional(),
  level: z.enum(CV_LEVELS).default("experienced"),
  region: z.enum(CV_REGIONS).default("uk"),
  target: TargetSchema.optional(),
  contact: ContactSchema,
  sections: z.array(SectionSchema).max(24).default([]),
  design: DesignSchema,
  /** The upload this CV was started from, if any. */
  importId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CvDoc = z.infer<typeof CvDocSchema>;

/** What the list page needs: no CV content beyond counts. */
export interface CvSummary {
  id: string;
  name: string;
  kind: "base" | "tailored";
  parentId?: string;
  level: CvLevel;
  region: CvRegion;
  targetTitle: string;
  targetEmployer: string;
  /** An upload for this CV is waiting to be checked: the import to reopen. */
  pendingImportId?: string;
  /** True when nothing has been entered yet. */
  empty: boolean;
  roles: number;
  updatedAt: string;
}

/* ----------------------------------------------------------------- helpers */

/** A short random id for sections, entries, bullets and skills. Works in the browser and on the server. */
export function newId(prefix = ""): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const emptyContact = (): Contact => ({ fullName: "", email: "", phone: "", location: "", links: [] });

export const emptyEntry = (): Entry => ({ id: newId("e_"), visible: true, title: "", org: "", orgInfo: "", location: "", start: "", end: "", current: false, subject: "", grade: "", link: "", bullets: [] });

export const newBullet = (text = "", origin: Bullet["origin"] = "typed", sources: Excerpt[] = []): Bullet => ({ id: newId("b_"), text, visible: true, origin, sources });

/** An empty section of the given kind. */
export function emptySection(kind: SectionKind, title = ""): Section {
  const base = { id: newId("s_"), visible: true, title };
  if (kind === "summary") return { ...base, kind, text: "" };
  if (kind === "skills") return { ...base, kind, groups: [] };
  if (kind === "languages" || kind === "interests") return { ...base, kind, items: [] };
  return { ...base, kind, entries: [] };
}

/** The core sections of a new CV, in the order that suits the level: education first for students and graduates. */
export function coreSections(level: CvLevel): Section[] {
  const order: SectionKind[] = level === "student" ? ["summary", "education", "experience", "skills"] : ["summary", "experience", "education", "skills"];
  return order.map((k) => emptySection(k));
}

/** True when a section holds nothing the person has entered. */
export function sectionIsEmpty(s: Section): boolean {
  if (s.kind === "summary") return !s.text.trim();
  if (s.kind === "skills") return s.groups.every((g) => g.skills.length === 0);
  if (isListSection(s)) return s.items.length === 0;
  if (isEntrySection(s)) return s.entries.length === 0;
  return true;
}

export function cvIsEmpty(cv: Pick<CvDoc, "contact" | "sections">): boolean {
  const c = cv.contact;
  const contactEmpty = !c.fullName && !c.email && !c.phone && !c.location && c.links.length === 0;
  return contactEmpty && cv.sections.every(sectionIsEmpty);
}

/** Every piece of text the person has in the CV, field by field: for word counts and for checking nothing was lost or added. */
export function cvStrings(cv: Pick<CvDoc, "contact" | "sections">): string[] {
  const out: string[] = [cv.contact.fullName, cv.contact.email, cv.contact.phone, cv.contact.location, ...cv.contact.links];
  for (const s of cv.sections) {
    out.push(s.title);
    if (s.kind === "summary") out.push(s.text);
    else if (s.kind === "skills") for (const g of s.groups) out.push(g.name, ...g.skills.map((k) => k.name));
    else if (isListSection(s)) for (const i of s.items) out.push(i.name, i.level);
    else if (isEntrySection(s)) for (const e of s.entries) out.push(e.title, e.org, e.orgInfo, e.location, e.subject, e.grade, e.link, ...e.bullets.map((b) => b.text));
  }
  return out.filter(Boolean);
}

export function summarise(cv: CvDoc, pendingImportId?: string): CvSummary {
  const exp = cv.sections.find((s) => s.kind === "experience");
  return {
    id: cv.id,
    name: cv.name,
    kind: cv.kind,
    parentId: cv.parentId,
    level: cv.level,
    region: cv.region,
    targetTitle: cv.target?.title ?? "",
    targetEmployer: cv.target?.employer ?? "",
    pendingImportId,
    empty: cvIsEmpty(cv),
    roles: exp && isEntrySection(exp) ? exp.entries.length : 0,
    updatedAt: cv.updatedAt,
  };
}
