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

/**
 * Text as it is kept: without characters that cannot be seen or cannot be
 * written to a file. A soft hyphen or a zero-width space pasted in from a web
 * page would sit inside a word unseen and make the downloaded file read
 * differently from the page; a few characters are not allowed in a Word file
 * at all.
 */
export function storable(s: string): string {
  return s
    .replace(/[\u00ad\u200b-\u200f\u2060\ufeff]/g, "")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/[\u0080-\u009f]/g, " ")
    .replace(/\p{Noncharacter_Code_Point}/gu, "")
    .replace(/[\uD800-\uDFFF]/gu, "");
}

/** A short single-line string: trimmed, no control characters, capped. */
const line = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((s) => [...storable(s).replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim()].slice(0, max).join(""))
    .default("");
/** Longer text that may keep its line breaks. */
const prose = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((s) =>
      storable(s)
        .replace(/\r/g, "")
        .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    )
    // Cut by whole characters: half of an emoji is not a character any file can hold.
    .transform((s) => (s.length > max ? [...s].slice(0, max).join("") : s))
    .default("");
const id = z.string().regex(/^[A-Za-z0-9_-]{4,40}$/);

/**
 * How much a CV can hold. The form's fields use the same numbers, so the
 * screen can never hold more than is saved and a file can never differ from
 * the page beside it.
 */
export const LIMITS = {
  name: 120,
  email: 160,
  phone: 40,
  location: 120,
  link: 200,
  bullet: 600,
  /** Lines under one role. */
  bullets: 30,
  /** Roles, qualifications or other entries in one section. */
  entries: 40,
  title: 400,
  org: 160,
  orgInfo: 240,
  subject: 120,
  grade: 120,
  summary: 2000,
  skill: 80,
  skills: 40,
  groups: 12,
  groupName: 60,
  item: 120,
  itemLevel: 60,
  items: 40,
  /** Across the whole CV: more than any CV needs, and few enough to check and draw quickly. */
  totalLines: 400,
  totalSkills: 200,
  totalEntries: 120,
} as const;

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

export const PHOTO_SHAPES = ["circle", "rounded", "square"] as const;
export type PhotoShape = (typeof PHOTO_SHAPES)[number];

export const ContactSchema = z.object({
  /** The name the person uses professionally. */
  fullName: line(120),
  email: line(160),
  phone: line(40),
  /** Town or city only: no street address. */
  location: line(120),
  /** Relevant links: LinkedIn, a portfolio, GitHub. */
  links: z.array(line(200)).max(4).default([]),
  /** Optional profile photo (HTTPS URL or data:image/... URI). */
  photo: z.string().max(600000).optional(),
  /** Shape of the profile photo on the CV page. */
  photoShape: z.enum(PHOTO_SHAPES).optional(),
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

export const CV_TEMPLATES = [
  "standard", "graduate", "compact", "executive", "portfolio", "research", "career-change", "technical", "modern", "minimal", "creative", "consulting",
  "ledger", "linen", "chancery", "meridian", "harbour", "slate", "quartz", "arcadia", "vellum", "hairline", "tern", "clearwater",
  "tally", "docket", "index", "marginalia", "boardroom", "crest", "regent", "atlas", "campus", "first-light", "ladder", "sapling",
  "terminal", "circuit", "lattice", "kernel", "ward", "chalkboard", "canvas", "atelier", "palette",
] as const;
export type TemplateId = (typeof CV_TEMPLATES)[number];
export const CV_ACCENTS = ["indigo", "navy", "teal", "copper", "plum", "slate", "emerald", "crimson", "royal", "forest", "burgundy", "charcoal"] as const;
export type AccentId = (typeof CV_ACCENTS)[number];
export const CV_DENSITIES = ["tighter", "default", "looser"] as const;
/** The font families a CV can be set in (see render/fonts.ts, which holds the files). */
export const CV_FONT_FAMILIES = ["inter", "lora", "plex", "serif", "sans3", "work", "franklin", "manrope", "garamond", "crimson", "mono"] as const;
export type FontFamilyId = (typeof CV_FONT_FAMILIES)[number];
/** The mark before each bullet: •, –, › or none (the line is still indented as a list item). */
export const CV_BULLETS = ["disc", "dash", "arrow", "none"] as const;
export type BulletStyle = (typeof CV_BULLETS)[number];
/**
 * What goes between the contact details: “·”, “|” or “•”. Always a visible mark: with only spaces between them,
 * software reading the file can't tell where the town ends and the phone number begins.
 */
export const CV_SEPARATORS = ["dot", "bar", "bullet"] as const;
export type ContactSeparator = (typeof CV_SEPARATORS)[number];
/** The top of the page: the name as text, or the name on a band of the accent colour. */
export const CV_HEADERS = ["plain", "band"] as const;
export type HeaderStyle = (typeof CV_HEADERS)[number];
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
  /** Custom hex colour (#RRGGBB) chosen by the person for headings and rules. */
  customAccent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  /** The order of sections on the paper, by section id, when the person has changed it from the template's own. */
  order: z.array(z.string().max(40)).max(24).optional(),
  /** The person's own file name for downloads, without the extension. Empty uses "[Name] - [Role] - CV". */
  fileName: line(120).optional(),
  /** Fine-grained font size for body text in points (range 6 to 16, default 10.5). */
  fontSize: z.number().min(6).max(16).default(10.5).optional(),
  /** Fine-grained line spacing multiplier (range 0.7 to 1.8, default 1.0). */
  lineSpacing: z.number().min(0.7).max(1.8).default(1.0).optional(),
  /** Margin width preset or points ("compact", "normal", "relaxed", or 20-72pt). */
  margin: z.union([z.enum(["compact", "normal", "relaxed"]), z.number().min(15).max(72)]).default("normal").optional(),
  /** Section divider line style ("solid", "dashed", "dots", "none", "accent-bar"). */
  dividerStyle: z.enum(["solid", "dashed", "dots", "none", "accent-bar"]).default("solid").optional(),
  /** Kept for CVs saved with it; icons are not drawn (they can be read as stray characters by screening software). */
  sectionIcons: z.boolean().default(false).optional(),
  /** Fonts chosen one at a time, in place of the pairing: for headings and the name, and for everything else. */
  headingFont: z.enum(CV_FONT_FAMILIES).optional(),
  bodyFont: z.enum(CV_FONT_FAMILIES).optional(),
  /** The mark before each bullet, when changed from the template's own. */
  bullet: z.enum(CV_BULLETS).optional(),
  /** How far each entry's lines sit in from its section heading, in points (0 to 24). */
  entryIndent: z.number().min(0).max(24).optional(),
  /** What goes between the contact details, when changed from the template's own. */
  contactSeparator: z.enum(CV_SEPARATORS).optional(),
  /** The size of the name in points (16 to 40), when changed from the template's own. */
  nameSize: z.number().min(16).max(40).optional(),
  /** Section headings in capitals, when changed from the template's own. */
  headingCaps: z.boolean().optional(),
  /** The top of the page, when changed from the template's own. */
  header: z.enum(CV_HEADERS).optional(),
  /** Bullet indentation in points (range 0 to 24, default 13). */
  indentation: z.number().min(0).max(24).default(13).optional(),
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

/* ------------------------------------------------------------- tailoring */

/**
 * One thing a job advert asks for. `quote` is the advert's own wording, kept
 * exactly; `text` is how the person reads it. Whether it is met is worked out
 * from the CV each time, from the lines linked here and the lines that match:
 * it is never stored, so it cannot go stale.
 */
export const RequirementSchema = z.object({
  id,
  quote: prose(600),
  text: line(300),
  /** Required weighs 2 in job fit. Preferred, or not stated, weighs 1. */
  priority: z.enum(["required", "preferred"]).default("required"),
  /** Lines of the CV the person has said show this. */
  evidence: z.array(LocatorSchema).max(8).default([]),
  /** The person's own judgement of the lines they linked. */
  judged: z.enum(["met", "partly"]).optional(),
  /** For "partly": the part of the requirement their evidence does not cover. */
  uncovered: line(300),
  /** "No, I don't have this." It stays in the total and earns nothing. */
  gap: z.boolean().default(false),
});
export type Requirement = z.infer<typeof RequirementSchema>;

/** One change made while tailoring, with why. Together these are the report of what changed. */
export const ChangeRecordSchema = z.object({
  id,
  at: z.string(),
  kind: z.enum(["included", "off", "moved", "reworded"]),
  /** The role or section it happened in, by name. */
  where: line(200),
  before: prose(700),
  after: prose(700),
  reason: line(300),
  /** The requirement it was made for, if any. */
  requirementId: z.string().max(40).optional(),
});
export type ChangeRecord = z.infer<typeof ChangeRecordSchema>;

/* ------------------------------------------------------------ cover letter */

/**
 * What a sentence of the letter rests on: a line of the CV, a sentence of the
 * person's reason for applying, a note they added, a clause of the advert or
 * the job's own title and employer. `text` is the wording as it was when the
 * sentence was last checked against it, so a later change can be noticed.
 */
export const LETTER_SOURCE_KINDS = ["cv", "reason", "note", "advert", "job"] as const;
export const LetterSourceSchema = z.object({
  kind: z.enum(LETTER_SOURCE_KINDS),
  /** For a line of the CV: where it is. */
  at: LocatorSchema.optional(),
  /** For a note: which one. */
  noteId: z.string().max(40).optional(),
  text: prose(900),
});
export type LetterSource = z.infer<typeof LetterSourceSchema>;

export const LetterSentenceSchema = z.object({
  id,
  text: line(700),
  /** "drafted" sentences were assembled from the person's words; "typed" ones they wrote here. Both are checked the same way. */
  origin: z.enum(["typed", "drafted"]).default("typed"),
  sources: z.array(LetterSourceSchema).max(6).default([]),
});
export type LetterSentence = z.infer<typeof LetterSentenceSchema>;

export const LETTER_ROLES = ["opening", "evidence", "close"] as const;
export const LetterParagraphSchema = z.object({
  id,
  role: z.enum(LETTER_ROLES).default("evidence"),
  sentences: z.array(LetterSentenceSchema).max(12).default([]),
});
export type LetterParagraph = z.infer<typeof LetterParagraphSchema>;

/** Something the person has said, in their own words, to back a sentence of the letter. */
export const LetterNoteSchema = z.object({ id, text: prose(1200) });
export type LetterNote = z.infer<typeof LetterNoteSchema>;

/**
 * The cover letter of one version: it belongs to that version's job. What the
 * person gave to write it from (their reason, the lines of the CV to use, a
 * passage of their own writing for the tone), and the letter itself as
 * paragraphs of sentences, each sentence with what it rests on.
 */
export const LetterSchema = z.object({
  /** The person's answer to "Why do you want this role?", typed or spoken and corrected by them. */
  reason: prose(3000),
  /** The lines of the CV chosen as evidence: one or two. */
  evidence: z.array(LocatorSchema).max(3).default([]),
  /** A passage of the person's own writing. It guides the tone only: it is never used as a fact. */
  voice: prose(3000),
  /** Who the letter is to. Empty gives "Dear Hiring Manager". */
  recipient: line(120),
  /** The date on the letter, "2026-11-23". Empty means the day the file is made. */
  date: z.string().regex(/^(|\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/).default(""),
  /** The sign-off. Empty uses the usual one for the region and the greeting. */
  signoff: line(60),
  notes: z.array(LetterNoteSchema).max(20).default([]),
  paragraphs: z.array(LetterParagraphSchema).max(8).default([]),
  /** True once a letter has been started, by drafting or by "Write it myself". */
  started: z.boolean().default(false),
});
export type Letter = z.infer<typeof LetterSchema>;

export const emptyLetter = (): Letter => ({ reason: "", evidence: [], voice: "", recipient: "", date: "", signoff: "", notes: [], paragraphs: [], started: false });

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
  /** Words the person has told the checks to leave alone: a name, a specialist term, an acronym they chose not to spell out. */
  accepted: z.array(line(60)).max(200).default([]),
  /** What the target advert asks for, as the person has confirmed it. */
  requirements: z.array(RequirementSchema).max(40).default([]),
  /** What was changed while tailoring this version, and why. */
  changes: z.array(ChangeRecordSchema).max(200).default([]),
  /** The cover letter for this version's job, once one has been started. */
  letter: LetterSchema.optional(),
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
  /** That upload could not be read: there is nothing to check, only a reason and another way to try. */
  importFailed?: boolean;
  /** A cover letter has been started for this version. */
  letter?: boolean;
  /** True when nothing has been entered yet. */
  empty: boolean;
  /** The CV score: the same number the builder shows for the CV as it was last saved. Absent for an empty CV. */
  score?: number;
  /** Job fit, where the CV has an advert with something to assess. */
  fit?: number;
  roles: number;
  updatedAt: string;
}

/* ----------------------------------------------------------- export records */

/**
 * A record of one download: the CV exactly as it was when the file was made,
 * so the person can later reopen what they sent. The file itself is not kept;
 * it is made again from this copy, at the same time stamp, and is the same file.
 */
export const ExportRecordSchema = z.object({
  id: z.string().regex(/^exp_[a-f0-9]{16}$/),
  userId: z.string().min(1),
  versionId: z.string(),
  /** The revision of the CV the file was made from. */
  rev: z.number().int().min(1),
  format: z.enum(["pdf", "docx"]),
  /** What the file holds: the CV, the cover letter, or the letter followed by the CV. */
  what: z.enum(["cv", "letter", "both"]).default("cv"),
  /** The file's name. */
  name: line(200),
  /** When it was downloaded: also the time written into the file. */
  at: z.string(),
  /** True when the file read back the same as the CV. False when it was downloaded as "unchecked". */
  checked: z.boolean(),
  pages: z.number().int().min(0).default(0),
  cv: z.object({ name: line(120), level: z.enum(CV_LEVELS), region: z.enum(CV_REGIONS), target: TargetSchema.optional(), contact: ContactSchema, sections: z.array(SectionSchema).max(24), design: DesignSchema, letter: LetterSchema.optional() }),
});
export type ExportRecord = z.infer<typeof ExportRecordSchema>;

/** How one file of a CV read back when it was last made and checked. */
export const FileCheckSchema = z.object({
  status: z.enum(["checked", "loss", "failed"]),
  /** For "failed": the file was made, and it was the reading of it that failed. */
  made: z.boolean().optional(),
  name: line(200).optional(),
  pages: z.number().int().min(0).optional(),
  words: z.number().int().min(0).optional(),
  size: z.number().int().min(0).optional(),
  missing: z.array(line(300)).max(60).optional(),
  unexpected: z.array(line(300)).max(60).optional(),
  unsupported: z.array(line(40)).max(60).optional(),
});
export type StoredFileCheck = z.infer<typeof FileCheckSchema>;

/**
 * The file checks for one revision of one CV, kept beside the CV (never in
 * it, so recording a check can never overwrite an edit). It is why the score
 * is the same number in the builder, after a reload and in the list. Once the
 * CV changes, the record is out of date and is ignored.
 */
export const FileCheckRecordSchema = z.object({
  /** The CV's id: one record a CV. */
  id: z.string().min(1),
  userId: z.string().min(1),
  rev: z.number().int().min(1),
  pdf: FileCheckSchema.optional(),
  docx: FileCheckSchema.optional(),
  at: z.string(),
});
export type FileCheckRecord = z.infer<typeof FileCheckRecordSchema>;

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
    letter: cv.letter?.started || undefined,
    empty: cvIsEmpty(cv),
    roles: exp && isEntrySection(exp) ? exp.entries.length : 0,
    updatedAt: cv.updatedAt,
  };
}
