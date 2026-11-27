import type { AccentId, BulletStyle, ContactSeparator, Density, FontFamilyId, HeaderStyle, SectionKind, TemplateId } from "../schema";
import type { FamilyId } from "./fonts";

/**
 * The templates: a numbered catalogue. Every one is a single column of real
 * text with standard headings and the contact details in the body, so it
 * reads the same to software as it does to a person. A template sets the
 * order of sections, the fonts, the look of the name, headings and bullets,
 * and the spacing. A person may change any of it on their own CV (fonts,
 * colour, sizes, indents, dividers); the template is where they start.
 *
 * A template's number never changes and is never given to another. Its id is
 * what a saved CV stores; its name and number are what people see.
 */

export const TEMPLATE_FAMILIES = ["classic", "contemporary", "minimal", "condensed", "executive", "early-career", "technical", "specialist", "expressive"] as const;
export type TemplateFamily = (typeof TEMPLATE_FAMILIES)[number];
export const FAMILY_NAMES: Record<TemplateFamily, string> = {
  classic: "Classic",
  contemporary: "Contemporary",
  minimal: "Minimal",
  condensed: "Condensed",
  executive: "Executive",
  "early-career": "Early career",
  technical: "Technical",
  specialist: "Specialist",
  expressive: "Expressive",
};

/** Each accent is dark enough on white for small text (contrast in brackets). */
export const ACCENTS: Record<AccentId, { name: string; hex: string }> = {
  indigo: { name: "Indigo", hex: "#3D4BD8" }, // 6.57:1
  navy: { name: "Navy", hex: "#174C73" }, // 9.06:1
  teal: { name: "Teal", hex: "#136157" }, // 7.30:1
  copper: { name: "Copper", hex: "#85441D" }, // 7.39:1
  plum: { name: "Plum", hex: "#673E83" }, // 8.10:1
  slate: { name: "Slate", hex: "#384352" }, // 10.03:1
  emerald: { name: "Emerald", hex: "#166534" }, // 7.15:1
  crimson: { name: "Crimson", hex: "#991B1B" }, // 8.28:1
  royal: { name: "Royal Blue", hex: "#1E40AF" }, // 8.59:1
  forest: { name: "Forest", hex: "#14532D" }, // 9.21:1
  burgundy: { name: "Burgundy", hex: "#701A46" }, // 9.54:1
  charcoal: { name: "Charcoal", hex: "#1F2937" }, // 14.6:1
  // The five v3 designs' own colours (TEMPLATES-v3, "Default accent text contrast on white").
  steel: { name: "Steel", hex: "#254B63" }, // 9.27:1
  pine: { name: "Pine", hex: "#275F51" }, // 7.39:1
  umber: { name: "Umber", hex: "#84512B" }, // 6.58:1
  mulberry: { name: "Mulberry", hex: "#5C426C" }, // 8.57:1
  lagoon: { name: "Lagoon", hex: "#285E68" }, // 7.26:1
};

export const INK = "#17181F";
export const MUTED = "#474851";
export const HAIRLINE = "#C9CCDB";

/** Body text is never smaller than this, whatever else changes. */
export const BODY_SIZE = 10.5;
export const DENSITY_FACTOR: Record<Density, number> = { tighter: 0.85, default: 1, looser: 1.15 };

export type Align = "left" | "center" | "right";
/** The decoration a section heading carries. Decoration is drawn, never text, and is marked as such in the PDF. */
export type HeadingRule = "none" | "hairline-below" | "short-below" | "short-above" | "bar-before";

/**
 * A page structure beyond one column (TEMPLATES-v3 §02). The reading order never changes with it: the name and
 * contact details, the profile, every main section, then the short items. A rail holds short items only, beside
 * the main text on a one-page CV; when it would not fit there, it follows the main text at full width.
 */
export type Grid =
  /** A column of short items (skills, languages…) beside the main text: 46 Clearline, 47 Fieldwork, 51 Framework. */
  | { kind: "rail"; side: "left" | "right"; width: number; gap: number; padX: number; padY: number; kinds: SectionKind[]; line?: string; fill?: string; outline?: string }
  /** Each section's heading in a narrow margin beside its own content: 49 Margin Notes. */
  | { kind: "margin-heads"; width: number; gap: number; rule: string }
  /** Each role's dates and place in a gutter beside it: 52 Chronicle. */
  | { kind: "date-gutter"; width: number; gap: number; rule: string };

export interface TemplateDef {
  id: TemplateId;
  /** Its number in the catalogue, 1 to 45: never changed, never reused. */
  no: number;
  name: string;
  family: TemplateFamily;
  /** Plain descriptions for filtering the gallery: "one page", "colour band", "serif"… */
  tags: string[];
  /** Who it suits, shown in the picker. */
  suits: string;
  /** The order of sections on the paper. Sections not named follow in a standard order; empty ones are left out. */
  order: SectionKind[];
  fonts: { heading: FamilyId; body: FamilyId };
  accent: AccentId;
  /** Points of space before a section and between entries, before density is applied. */
  space: { section: number; entry: number };
  title: { size: number; weight: 400 | 600 | 700; align: Align; accent?: boolean; ruleBelow?: boolean };
  contact: { align: Align; ruleBelow?: boolean; tight?: boolean };
  heading: { size: number; weight: 400 | 600 | 700; italic?: boolean; caps?: boolean; tracking?: number; align: Align; accent: boolean; rule: HeadingRule; ruleAccent?: boolean };
  /** The mark before each bullet. A disc unless said. */
  bullet?: BulletStyle;
  /** How far an entry's lines sit in from the heading, in points. None unless said. */
  entryIndent?: number;
  /** Between the contact details. A middle dot unless said. */
  separator?: ContactSeparator;
  /** The name on a band of the accent colour, or plain. Plain unless said. */
  header?: HeaderStyle;
  /* ---- Design v3 (TEMPLATES-v3 §02); none of these is set on the first 45. ---- */
  /** The name's own font, when it differs from the headings'. */
  titleFont?: FamilyId;
  /** The name's colour, when it is neither the ink nor the accent. */
  titleColor?: string;
  /** Margins on all sides, in points, when the person hasn't chosen their own. */
  margin?: number;
  /** Body text size in points, when not the standard 10.5. */
  bodySize?: number;
  /** Line height of body text, as a multiple of its size, when not the standard 1.38. */
  leading?: number;
  /** The colour of heading rules, when not the standard hairline grey. */
  ruleColor?: string;
  /** A rule of the accent colour under the name and contact details: its thickness and the space above it. */
  headerRule?: { height: number; gap: number };
  /** A bar of the accent colour across the top of the first page, and the space below it. */
  topBar?: { height: number; gap: number };
  /** A short upright bar of the accent colour beside the name, and how far the name sits in from it. */
  nameBar?: { width: number; inset: number };
  /** A thin outline around the profile, with its padding. */
  frame?: { color: string; padX: number; padY: number };
  grid?: Grid;
}

/** "No. 07 · Harbour": how a template is named everywhere it is shown. */
export const templateLabel = (t: Pick<TemplateDef, "no" | "name">) => `No. ${String(t.no).padStart(2, "0")} · ${t.name}`;

/** The template's web address part: "07-harbour". */
export const templateSlug = (t: Pick<TemplateDef, "no" | "name">) => `${String(t.no).padStart(2, "0")}-${t.name.toLowerCase().replace(/\s+/g, "-")}`;
/**
 * The public template galleries: CV templates for the UK, resume templates
 * for the US, and cover letter templates, each letter design matching the CV
 * template of the same number.
 */
export type GalleryKind = "cv" | "resume" | "letter";
export const GALLERIES: Record<GalleryKind, { region: "uk" | "us"; word: string; title: string; base: string }> = {
  cv: { region: "uk", word: "CV", title: "CV templates", base: "/cv-templates" },
  resume: { region: "us", word: "resume", title: "Resume templates", base: "/resume-templates" },
  letter: { region: "uk", word: "cover letter", title: "Cover letter templates", base: "/cover-letter-templates" },
};

/** The template's preview image, drawn by the renderer with an example (scripts/template-previews.cjs): 1098 by 1552 pixels, or 550 wide when small. */
export const templatePreview = (t: Pick<TemplateDef, "no" | "id">, size: "large" | "small" = "large", kind: GalleryKind = "cv") =>
  `/${kind === "letter" ? "cover-letter-templates" : "cv-templates"}/${String(t.no).padStart(2, "0")}-${t.id}${size === "small" ? "-small" : ""}.webp`;
/** Every template, by number, including those no longer offered for new CVs: a saved CV keeps its design. */
export const catalogue = (): TemplateDef[] => (Object.values(TEMPLATES) as TemplateDef[]).sort((a, b) => a.no - b.no);

/**
 * The 20 designs offered for new CVs (TEMPLATES-v3 §01): 15 of the first 45 and the five v3 designs. The other
 * 30 are merged into one of these for choosing; their own designs stay, for every CV and file already made in them.
 */
export const MERGED_INTO: Partial<Record<TemplateId, TemplateId>> = {
  linen: "minimal", chancery: "ledger", meridian: "minimal", slate: "modern", quartz: "modern", arcadia: "harbour", vellum: "minimal", hairline: "standard", tern: "ledger", clearwater: "modern",
  tally: "compact", docket: "compact", marginalia: "compact", boardroom: "executive", crest: "harbour", regent: "executive", atlas: "executive", campus: "graduate", "first-light": "harbour", ladder: "graduate",
  terminal: "index", circuit: "technical", lattice: "harbour", kernel: "index", consulting: "research", "career-change": "portfolio", creative: "portfolio", canvas: "harbour", atelier: "margin-notes", palette: "harbour",
};
export const isOffered = (t: Pick<TemplateDef, "id">) => !MERGED_INTO[t.id];
/** The designs offered for new CVs, by number. */
export const offered = (): TemplateDef[] => catalogue().filter(isOffered);
/** The designs to show someone choosing for a CV: those offered, and the CV's own if it is one no longer offered. */
export const offeredWith = (current?: TemplateId): TemplateDef[] => catalogue().filter((t) => isOffered(t) || t.id === current);
/** Text set beside text: some software reads such a page in a different order, and the gallery says so. */
export const COLUMNS_NOTE = "Text sits beside text in this design. Our files keep the reading order, but some applicant software reads side-by-side text in a different order. For the widest compatibility, choose a one-column design.";
export const templateBySlug = (slug: string): TemplateDef | undefined => catalogue().find((t) => templateSlug(t) === slug);

/** The page title, description and addresses for a template's page in one of the galleries. */
export function templateMeta(t: TemplateDef, kind: GalleryKind) {
  const { word, base, region } = GALLERIES[kind];
  const slug = templateSlug(t);
  // Suits lines are written to read the same in both regions (checked in catalogue.test.ts).
  const suits = t.suits.charAt(0).toLowerCase() + t.suits.slice(1);
  const colour = region === "us" ? "color" : "colour";
  return {
    title: `${templateLabel(t)} ${word} template | Hakkiri`,
    description:
      kind === "letter"
        ? `${templateLabel(t)}: a cover letter template that matches the CV template of the same number, for ${suits}. One page, PDF and Word downloads, and every sentence checked against your CV.`
        : `${templateLabel(t)}: an ATS-friendly ${word} template for ${suits}. One column of real text, PDF and Word downloads, and every font, ${colour} and spacing yours to change.`,
    alternates: { canonical: `${base}/${slug}`, ...(kind === "letter" ? {} : { languages: { "en-GB": `/cv-templates/${slug}`, "en-US": `/resume-templates/${slug}` } }) },
  };
}

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  standard: {
    id: "standard",
    no: 1,
    name: "Clean Sans",
    family: "classic",
    tags: ["serif-free", "accent headings"],
    suits: "Any role",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "inter", body: "inter" },
    accent: "indigo",
    space: { section: 14, entry: 8 },
    title: { size: 25, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 700, align: "left", accent: true, rule: "hairline-below" },
  },
  graduate: {
    id: "graduate",
    no: 26,
    name: "Graduate Serif",
    family: "early-career",
    tags: ["education first", "centred"],
    suits: "Graduates and first professional roles",
    order: ["education", "projects", "volunteering", "experience", "skills"],
    fonts: { heading: "lora", body: "inter" },
    accent: "teal",
    space: { section: 16, entry: 8 },
    title: { size: 27, weight: 700, align: "center" },
    contact: { align: "center" },
    heading: { size: 13, weight: 700, align: "center", accent: false, rule: "short-below", ruleAccent: true },
  },
  compact: {
    id: "compact",
    no: 16,
    name: "Compact Classic",
    family: "condensed",
    tags: ["compact spacing", "fits more on a page"],
    suits: "Long work histories in any field",
    order: ["experience", "skills", "education"],
    fonts: { heading: "plex", body: "plex" },
    accent: "navy",
    space: { section: 9, entry: 4 },
    title: { size: 21, weight: 600, align: "left" },
    contact: { align: "left", tight: true },
    heading: { size: 9.5, weight: 700, caps: true, tracking: 0.04, align: "left", accent: true, rule: "none" },
  },
  executive: {
    id: "executive",
    no: 21,
    name: "Executive Serif",
    family: "executive",
    tags: ["large name", "serif headings"],
    suits: "Senior leaders and heads of department",
    order: ["summary", "achievements", "experience", "education", "skills"],
    fonts: { heading: "serif", body: "inter" },
    accent: "slate",
    space: { section: 18, entry: 9 },
    title: { size: 34, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 13.5, weight: 700, align: "left", accent: false, rule: "hairline-below", ruleAccent: true },
  },
  portfolio: {
    id: "portfolio",
    no: 42,
    name: "Portfolio",
    family: "expressive",
    tags: ["projects first", "accent rules"],
    suits: "Project-led roles and freelancers",
    order: ["projects", "skills", "experience", "education"],
    fonts: { heading: "inter", body: "plex" },
    accent: "copper",
    space: { section: 15, entry: 10 },
    title: { size: 30, weight: 700, align: "left", ruleBelow: true },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 700, align: "left", accent: false, rule: "short-above", ruleAccent: true },
  },
  research: {
    id: "research",
    no: 36,
    name: "Academic Serif",
    family: "specialist",
    tags: ["publications", "serif"],
    suits: "Research and publishing roles",
    order: ["education", "publications", "projects", "experience", "skills"],
    fonts: { heading: "serif", body: "serif" },
    accent: "plum",
    space: { section: 13, entry: 7 },
    title: { size: 26, weight: 700, align: "center" },
    contact: { align: "center" },
    heading: { size: 13.5, weight: 400, italic: true, align: "left", accent: true, rule: "none" },
  },
  "career-change": {
    id: "career-change",
    no: 38,
    name: "Career Change",
    family: "specialist",
    tags: ["skills first", "capital headings"],
    suits: "People changing careers",
    order: ["summary", "skills", "projects", "experience", "education"],
    fonts: { heading: "lora", body: "plex" },
    accent: "teal",
    space: { section: 15, entry: 6 },
    title: { size: 29, weight: 400, align: "left", accent: true },
    contact: { align: "left", ruleBelow: true },
    // Letter-spacing is kept under a tenth of the type size: wider than that and PDF readers take each letter for a word.
    heading: { size: 10, weight: 600, caps: true, tracking: 0.08, align: "left", accent: false, rule: "none" },
  },
  technical: {
    id: "technical",
    no: 31,
    name: "Skills First",
    family: "technical",
    tags: ["skills first", "accent bars"],
    suits: "Trades, engineering and technical roles",
    order: ["skills", "certificates", "experience", "projects", "education"],
    fonts: { heading: "plex", body: "inter" },
    accent: "navy",
    space: { section: 12, entry: 7 },
    title: { size: 26, weight: 600, align: "right" },
    contact: { align: "right" },
    heading: { size: 12.5, weight: 700, align: "left", accent: false, rule: "bar-before", ruleAccent: true },
  },
  modern: {
    id: "modern",
    no: 6,
    name: "Modern Accent",
    family: "contemporary",
    tags: ["accent name", "accent bars"],
    suits: "Business, tech and office roles",
    order: ["summary", "experience", "skills", "projects", "education"],
    fonts: { heading: "inter", body: "inter" },
    accent: "royal",
    space: { section: 14, entry: 8 },
    title: { size: 28, weight: 700, align: "left", accent: true, ruleBelow: true },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, caps: true, tracking: 0.05, align: "left", accent: true, rule: "bar-before", ruleAccent: true },
  },
  minimal: {
    id: "minimal",
    no: 11,
    name: "Editorial",
    family: "minimal",
    tags: ["whitespace", "serif name"],
    suits: "Communications, policy and senior roles",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "lora", body: "inter" },
    accent: "charcoal",
    space: { section: 17, entry: 9 },
    title: { size: 26, weight: 400, align: "left" },
    contact: { align: "left", ruleBelow: true },
    heading: { size: 11, weight: 600, caps: true, tracking: 0.06, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
  },
  creative: {
    id: "creative",
    no: 41,
    name: "Creative Serif",
    family: "expressive",
    tags: ["accent name", "serif headings"],
    suits: "Design, product and media roles",
    order: ["summary", "projects", "experience", "skills", "education"],
    fonts: { heading: "lora", body: "plex" },
    accent: "burgundy",
    space: { section: 15, entry: 8 },
    title: { size: 31, weight: 700, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 13, weight: 700, align: "left", accent: true, rule: "short-above", ruleAccent: true },
  },
  consulting: {
    id: "consulting",
    no: 37,
    name: "Consulting Classic",
    family: "specialist",
    tags: ["education first", "centred"],
    suits: "Strategy, finance and advisory roles",
    order: ["education", "experience", "achievements", "skills"],
    fonts: { heading: "serif", body: "inter" },
    accent: "forest",
    space: { section: 13, entry: 7 },
    title: { size: 25, weight: 700, align: "center", ruleBelow: true },
    contact: { align: "center", tight: true },
    heading: { size: 11.5, weight: 700, caps: true, tracking: 0.04, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
  },
  ledger: {
    id: "ledger",
    no: 2,
    name: "Traditional",
    family: "classic",
    tags: ["centred", "serif", "traditional"],
    suits: "Traditional employers and formal sectors",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "garamond", body: "sans3" },
    accent: "navy",
    space: { section: 15, entry: 8 },
    title: { size: 28, weight: 600, align: "center" },
    contact: { align: "center" },
    heading: { size: 12, weight: 600, caps: true, tracking: 0.06, align: "center", accent: false, rule: "hairline-below" },
    separator: "bar",
  },
  linen: {
    id: "linen",
    no: 3,
    name: "Soft Serif",
    family: "classic",
    tags: ["serif", "quiet"],
    suits: "Admin, finance and office roles",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "crimson", body: "crimson" },
    accent: "slate",
    space: { section: 15, entry: 8 },
    title: { size: 27, weight: 600, align: "left" },
    contact: { align: "left", ruleBelow: true },
    heading: { size: 13, weight: 600, align: "left", accent: true, rule: "none" },
    bullet: "dash",
  },
  chancery: {
    id: "chancery",
    no: 4,
    name: "Formal Serif",
    family: "classic",
    tags: ["formal", "capital headings"],
    suits: "Law, finance and the public sector",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "serif", body: "franklin" },
    accent: "burgundy",
    space: { section: 14, entry: 7 },
    title: { size: 26, weight: 700, align: "center" },
    contact: { align: "center", tight: true },
    heading: { size: 11.5, weight: 700, caps: true, tracking: 0.05, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
  },
  meridian: {
    id: "meridian",
    no: 5,
    name: "Indented Classic",
    family: "classic",
    tags: ["indented entries", "accent rules"],
    suits: "Experienced professionals",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "lora", body: "sans3" },
    accent: "teal",
    space: { section: 14, entry: 8 },
    title: { size: 26, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 700, align: "left", accent: true, rule: "short-below", ruleAccent: true },
    separator: "bar",
    entryIndent: 8,
  },
  harbour: {
    id: "harbour",
    no: 7,
    name: "Header Band",
    family: "contemporary",
    tags: ["colour band", "sans serif"],
    suits: "Marketing, sales and client-facing roles",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "manrope", body: "manrope" },
    accent: "navy",
    space: { section: 14, entry: 8 },
    title: { size: 26, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, caps: true, tracking: 0.05, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
    separator: "bar",
    header: "band",
  },
  slate: {
    id: "slate",
    no: 8,
    name: "Accent Bars",
    family: "contemporary",
    tags: ["accent bars", "sans serif"],
    suits: "Operations, product and business roles",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "work", body: "work" },
    accent: "slate",
    space: { section: 14, entry: 8 },
    title: { size: 30, weight: 600, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 600, align: "left", accent: false, rule: "bar-before", ruleAccent: true },
    bullet: "arrow",
  },
  quartz: {
    id: "quartz",
    no: 9,
    name: "Bold Capitals",
    family: "contemporary",
    tags: ["accent name", "capital headings"],
    suits: "Creative industries and start-ups",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "franklin", body: "franklin" },
    accent: "royal",
    space: { section: 14, entry: 8 },
    title: { size: 28, weight: 700, align: "left", accent: true },
    contact: { align: "left", ruleBelow: true },
    heading: { size: 11, weight: 700, caps: true, tracking: 0.07, align: "left", accent: true, rule: "none" },
    bullet: "dash",
    separator: "bullet",
  },
  arcadia: {
    id: "arcadia",
    no: 10,
    name: "Serif Band",
    family: "contemporary",
    tags: ["colour band", "serif headings"],
    suits: "Charities, education and the arts",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "lora", body: "work" },
    accent: "emerald",
    space: { section: 15, entry: 8 },
    title: { size: 27, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 700, align: "left", accent: true, rule: "short-above", ruleAccent: true },
    header: "band",
  },
  vellum: {
    id: "vellum",
    no: 12,
    name: "Italic Minimal",
    family: "minimal",
    tags: ["whitespace", "italic headings"],
    suits: "Writers, editors and researchers",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "crimson", body: "sans3" },
    accent: "charcoal",
    space: { section: 18, entry: 9 },
    title: { size: 30, weight: 400, align: "left" },
    contact: { align: "left" },
    heading: { size: 13, weight: 400, italic: true, align: "left", accent: false, rule: "hairline-below" },
    bullet: "dash",
  },
  hairline: {
    id: "hairline",
    no: 13,
    name: "Plain Lines",
    family: "minimal",
    tags: ["no bullet marks", "capital headings"],
    suits: "Design-led and senior roles",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "inter", body: "inter" },
    accent: "charcoal",
    space: { section: 16, entry: 8 },
    title: { size: 24, weight: 600, align: "left" },
    contact: { align: "left" },
    heading: { size: 10.5, weight: 600, caps: true, tracking: 0.08, align: "left", accent: false, rule: "hairline-below" },
    bullet: "none",
    separator: "bar",
  },
  tern: {
    id: "tern",
    no: 14,
    name: "Airy Minimal",
    family: "minimal",
    tags: ["centred", "whitespace"],
    suits: "Any role with a short work history",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "manrope", body: "manrope" },
    accent: "slate",
    space: { section: 18, entry: 9 },
    title: { size: 26, weight: 600, align: "center" },
    contact: { align: "center" },
    heading: { size: 11, weight: 600, caps: true, tracking: 0.06, align: "center", accent: true, rule: "none" },
  },
  clearwater: {
    id: "clearwater",
    no: 15,
    name: "Calm Accent",
    family: "minimal",
    tags: ["accent name", "short rules"],
    suits: "Healthcare, education and public service",
    order: ["summary", "experience", "education", "skills"],
    fonts: { heading: "work", body: "sans3" },
    accent: "teal",
    space: { section: 16, entry: 8 },
    title: { size: 28, weight: 400, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 12, weight: 600, align: "left", accent: true, rule: "short-below", ruleAccent: true },
    bullet: "dash",
  },
  tally: {
    id: "tally",
    no: 17,
    name: "Compact Two-Page",
    family: "condensed",
    tags: ["compact spacing", "fits more on a page"],
    suits: "Long careers on two pages",
    order: ["summary", "experience", "skills", "education"],
    fonts: { heading: "sans3", body: "sans3" },
    accent: "navy",
    space: { section: 9, entry: 4 },
    title: { size: 21, weight: 700, align: "left" },
    contact: { align: "left", tight: true },
    heading: { size: 10, weight: 700, caps: true, tracking: 0.04, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
    separator: "bar",
  },
  docket: {
    id: "docket",
    no: 18,
    name: "Compact Bars",
    family: "condensed",
    tags: ["compact spacing", "accent bars"],
    suits: "Contractors and project-based work",
    order: ["summary", "experience", "projects", "skills", "education"],
    fonts: { heading: "franklin", body: "franklin" },
    accent: "crimson",
    space: { section: 10, entry: 4 },
    title: { size: 22, weight: 700, align: "left" },
    contact: { align: "left", tight: true },
    heading: { size: 11.5, weight: 700, align: "left", accent: true, rule: "bar-before", ruleAccent: true },
    bullet: "dash",
  },
  index: {
    id: "index",
    no: 19,
    name: "Compact Mono",
    family: "condensed",
    tags: ["monospace headings", "compact spacing"],
    suits: "Engineering and technical roles",
    order: ["summary", "skills", "experience", "projects", "education"],
    fonts: { heading: "mono", body: "plex" },
    accent: "navy",
    space: { section: 9, entry: 4 },
    title: { size: 20, weight: 600, align: "left" },
    contact: { align: "left", tight: true },
    heading: { size: 10, weight: 600, caps: true, tracking: 0.03, align: "left", accent: true, rule: "none" },
    bullet: "arrow",
    separator: "bar",
  },
  marginalia: {
    id: "marginalia",
    no: 20,
    name: "Compact Academic",
    family: "condensed",
    tags: ["indented entries", "compact spacing"],
    suits: "Academic and research careers",
    order: ["summary", "experience", "publications", "education", "skills"],
    fonts: { heading: "serif", body: "sans3" },
    accent: "plum",
    space: { section: 10, entry: 5 },
    title: { size: 22, weight: 700, align: "left" },
    contact: { align: "left", tight: true, ruleBelow: true },
    heading: { size: 11.5, weight: 700, align: "left", accent: true, rule: "hairline-below" },
    entryIndent: 10,
  },
  boardroom: {
    id: "boardroom",
    no: 22,
    name: "Executive Classic",
    family: "executive",
    tags: ["large name", "serif"],
    suits: "Directors and senior leaders",
    order: ["summary", "achievements", "experience", "education", "skills"],
    fonts: { heading: "garamond", body: "franklin" },
    accent: "charcoal",
    space: { section: 18, entry: 9 },
    title: { size: 36, weight: 600, align: "left" },
    contact: { align: "left" },
    heading: { size: 13, weight: 600, caps: true, tracking: 0.05, align: "left", accent: false, rule: "hairline-below" },
    separator: "bar",
  },
  crest: {
    id: "crest",
    no: 23,
    name: "Executive Band",
    family: "executive",
    tags: ["colour band", "serif headings"],
    suits: "Senior leaders in client-facing businesses",
    order: ["summary", "achievements", "experience", "education", "skills"],
    fonts: { heading: "serif", body: "sans3" },
    accent: "burgundy",
    space: { section: 17, entry: 9 },
    title: { size: 30, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 13, weight: 700, align: "left", accent: true, rule: "short-below", ruleAccent: true },
    header: "band",
  },
  regent: {
    id: "regent",
    no: 24,
    name: "Executive Statement",
    family: "executive",
    tags: ["centred", "large name"],
    suits: "Board, partner and chief officer roles",
    order: ["summary", "achievements", "experience", "education", "skills"],
    fonts: { heading: "crimson", body: "inter" },
    accent: "navy",
    space: { section: 17, entry: 9 },
    title: { size: 34, weight: 700, align: "center" },
    contact: { align: "center", ruleBelow: true },
    heading: { size: 12.5, weight: 700, caps: true, tracking: 0.05, align: "center", accent: true, rule: "none" },
  },
  atlas: {
    id: "atlas",
    no: 25,
    name: "Executive Indented",
    family: "executive",
    tags: ["accent name", "indented entries"],
    suits: "Senior managers across industries",
    order: ["summary", "experience", "achievements", "education", "skills"],
    fonts: { heading: "lora", body: "plex" },
    accent: "forest",
    space: { section: 17, entry: 8 },
    title: { size: 32, weight: 700, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 13, weight: 700, align: "left", accent: false, rule: "bar-before", ruleAccent: true },
    entryIndent: 8,
  },
  campus: {
    id: "campus",
    no: 27,
    name: "Graduate Modern",
    family: "early-career",
    tags: ["education first", "accent name"],
    suits: "Students and recent graduates",
    order: ["education", "projects", "experience", "volunteering", "skills"],
    fonts: { heading: "work", body: "work" },
    accent: "indigo",
    space: { section: 14, entry: 7 },
    title: { size: 27, weight: 700, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
  },
  "first-light": {
    id: "first-light",
    no: 28,
    name: "Graduate Band",
    family: "early-career",
    tags: ["colour band", "education first"],
    suits: "School leavers and apprentices",
    order: ["education", "experience", "projects", "skills"],
    fonts: { heading: "manrope", body: "sans3" },
    accent: "teal",
    space: { section: 14, entry: 7 },
    title: { size: 26, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 11.5, weight: 700, caps: true, tracking: 0.05, align: "left", accent: true, rule: "none" },
    header: "band",
  },
  ladder: {
    id: "ladder",
    no: 29,
    name: "Graduate Simple",
    family: "early-career",
    tags: ["centred", "education first"],
    suits: "Interns and graduate schemes",
    order: ["education", "experience", "volunteering", "skills"],
    fonts: { heading: "franklin", body: "inter" },
    accent: "royal",
    space: { section: 14, entry: 7 },
    title: { size: 25, weight: 700, align: "center" },
    contact: { align: "center" },
    heading: { size: 12, weight: 700, align: "center", accent: true, rule: "short-below", ruleAccent: true },
    bullet: "dash",
  },
  sapling: {
    id: "sapling",
    no: 30,
    name: "Graduate Projects",
    family: "early-career",
    tags: ["projects first", "serif headings"],
    suits: "Graduates with projects to show",
    order: ["education", "projects", "experience", "skills"],
    fonts: { heading: "lora", body: "manrope" },
    accent: "emerald",
    space: { section: 15, entry: 7 },
    title: { size: 28, weight: 600, align: "left" },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 600, align: "left", accent: true, rule: "short-above", ruleAccent: true },
    bullet: "arrow",
  },
  terminal: {
    id: "terminal",
    no: 32,
    name: "Tech Mono",
    family: "technical",
    tags: ["monospace headings", "skills first"],
    suits: "Developers and engineers",
    order: ["summary", "skills", "experience", "projects", "education", "certificates"],
    fonts: { heading: "mono", body: "plex" },
    accent: "emerald",
    space: { section: 13, entry: 7 },
    title: { size: 24, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
    bullet: "arrow",
    separator: "bar",
  },
  circuit: {
    id: "circuit",
    no: 33,
    name: "Tech Bars",
    family: "technical",
    tags: ["accent bars", "skills first"],
    suits: "Data, cloud and security roles",
    order: ["summary", "skills", "experience", "projects", "education", "certificates"],
    fonts: { heading: "plex", body: "plex" },
    accent: "indigo",
    space: { section: 13, entry: 7 },
    title: { size: 26, weight: 700, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 11, weight: 700, caps: true, tracking: 0.06, align: "left", accent: true, rule: "bar-before", ruleAccent: true },
    bullet: "dash",
  },
  lattice: {
    id: "lattice",
    no: 34,
    name: "Tech Band",
    family: "technical",
    tags: ["colour band", "indented entries"],
    suits: "Engineers and analysts",
    order: ["summary", "experience", "projects", "skills", "education", "certificates"],
    fonts: { heading: "sans3", body: "sans3" },
    accent: "teal",
    space: { section: 13, entry: 7 },
    title: { size: 25, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
    header: "band",
    entryIndent: 8,
  },
  kernel: {
    id: "kernel",
    no: 35,
    name: "Tech Projects",
    family: "technical",
    tags: ["monospace headings", "projects first"],
    suits: "Open-source and research engineers",
    order: ["summary", "skills", "projects", "experience", "education"],
    fonts: { heading: "mono", body: "inter" },
    accent: "charcoal",
    space: { section: 13, entry: 7 },
    title: { size: 23, weight: 600, align: "left" },
    contact: { align: "left", ruleBelow: true },
    heading: { size: 10.5, weight: 600, caps: true, tracking: 0.04, align: "left", accent: false, rule: "none" },
    bullet: "arrow",
    separator: "dot",
  },
  ward: {
    id: "ward",
    no: 39,
    name: "Healthcare",
    family: "specialist",
    tags: ["registrations shown", "healthcare"],
    suits: "Nurses, carers and allied health",
    order: ["summary", "experience", "certificates", "education", "skills"],
    fonts: { heading: "sans3", body: "sans3" },
    accent: "teal",
    space: { section: 14, entry: 8 },
    title: { size: 26, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
  },
  chalkboard: {
    id: "chalkboard",
    no: 40,
    name: "Teaching",
    family: "specialist",
    tags: ["qualifications shown", "teaching"],
    suits: "Teachers and teaching assistants",
    order: ["summary", "experience", "certificates", "education", "skills"],
    fonts: { heading: "crimson", body: "work" },
    accent: "royal",
    space: { section: 14, entry: 8 },
    title: { size: 28, weight: 700, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 12.5, weight: 700, align: "left", accent: true, rule: "short-below", ruleAccent: true },
    bullet: "dash",
  },
  canvas: {
    id: "canvas",
    no: 43,
    name: "Creative Band",
    family: "expressive",
    tags: ["colour band", "projects first"],
    suits: "Designers and content creators",
    order: ["summary", "projects", "experience", "skills", "education"],
    fonts: { heading: "work", body: "work" },
    accent: "plum",
    space: { section: 15, entry: 8 },
    title: { size: 30, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 13, weight: 700, align: "left", accent: true, rule: "short-above", ruleAccent: true },
    bullet: "arrow",
    header: "band",
  },
  atelier: {
    id: "atelier",
    no: 44,
    name: "Creative Italic",
    family: "expressive",
    tags: ["italic headings", "indented entries"],
    suits: "Architects, makers and the arts",
    order: ["summary", "projects", "experience", "education", "skills"],
    fonts: { heading: "garamond", body: "manrope" },
    accent: "copper",
    space: { section: 16, entry: 8 },
    title: { size: 34, weight: 400, align: "left", accent: true },
    contact: { align: "left" },
    heading: { size: 14, weight: 400, italic: true, align: "left", accent: true, rule: "none" },
    bullet: "dash",
    entryIndent: 10,
  },
  palette: {
    id: "palette",
    no: 45,
    name: "Bold Band",
    family: "expressive",
    tags: ["colour band", "centred"],
    suits: "Media, events and hospitality",
    order: ["summary", "experience", "projects", "skills", "education"],
    fonts: { heading: "manrope", body: "franklin" },
    accent: "crimson",
    space: { section: 15, entry: 8 },
    title: { size: 28, weight: 700, align: "center" },
    contact: { align: "center" },
    heading: { size: 12, weight: 700, caps: true, tracking: 0.06, align: "center", accent: true, rule: "short-below", ruleAccent: true },
    header: "band",
    separator: "bullet",
  },
  /* ------------------------------------------------ Design v3 (TEMPLATES-v3 §02) */
  clearline: {
    id: "clearline",
    no: 46,
    name: "Clearline",
    family: "contemporary",
    tags: ["side column", "short items on the right", "header rule"],
    suits: "Commercial and product roles",
    order: ["summary", "experience", "projects", "education", "volunteering", "skills", "certificates", "languages", "interests"],
    fonts: { heading: "inter", body: "inter" },
    accent: "steel",
    space: { section: 10, entry: 7 },
    title: { size: 26, weight: 700, align: "left", accent: true },
    contact: { align: "left", tight: true },
    // 11.5 pt, not the drawn 11: a heading at least 1 pt larger than a bold job title is not taken for one by software.
    heading: { size: 11.5, weight: 700, tracking: 0.02, align: "left", accent: true, rule: "hairline-below" },
    margin: 45.35,
    leading: 1.32,
    ruleColor: "#B9C3D3",
    headerRule: { height: 3, gap: 9 },
    grid: { kind: "rail", side: "right", width: 135, gap: 18, padX: 14, padY: 0, kinds: ["skills", "certificates", "languages", "awards", "courses", "interests"], line: "#A7BAC3" },
  },
  fieldwork: {
    id: "fieldwork",
    no: 47,
    name: "Fieldwork",
    family: "contemporary",
    tags: ["side column", "short items on the left", "top bar"],
    suits: "Operations and project roles",
    order: ["summary", "experience", "projects", "education", "volunteering", "skills", "certificates", "languages", "interests"],
    fonts: { heading: "inter", body: "inter" },
    accent: "pine",
    space: { section: 10, entry: 7 },
    title: { size: 26, weight: 700, align: "left", accent: true },
    contact: { align: "left", tight: true },
    heading: { size: 11.5, weight: 700, tracking: 0.02, align: "left", accent: true, rule: "hairline-below" },
    margin: 42.52,
    leading: 1.32,
    ruleColor: "#B9C3D3",
    topBar: { height: 6, gap: 12 },
    grid: { kind: "rail", side: "left", width: 132, gap: 20, padX: 11, padY: 10, kinds: ["skills", "certificates", "languages", "awards", "courses", "interests"], fill: "#F1F6F3" },
  },
  "margin-notes": {
    id: "margin-notes",
    no: 49,
    name: "Margin Notes",
    family: "contemporary",
    tags: ["headings in the margin", "centred serif name"],
    suits: "Consulting and editorial roles",
    order: ["summary", "experience", "projects", "education", "volunteering", "skills"],
    fonts: { heading: "inter", body: "inter" },
    titleFont: "serif",
    titleColor: "#503323",
    accent: "umber",
    space: { section: 10, entry: 7 },
    title: { size: 26, weight: 700, align: "center" },
    contact: { align: "center", tight: true },
    heading: { size: 10, weight: 700, caps: true, tracking: 0.06, align: "left", accent: true, rule: "none" },
    margin: 45.35,
    leading: 1.34,
    headerRule: { height: 1, gap: 7 },
    grid: { kind: "margin-heads", width: 91, gap: 12, rule: "#D8C8B6" },
  },
  framework: {
    id: "framework",
    no: 51,
    name: "Framework",
    family: "contemporary",
    tags: ["framed profile", "short items on the right"],
    suits: "Marketing, consulting and client-facing roles",
    order: ["summary", "experience", "projects", "education", "volunteering", "skills", "certificates", "languages", "interests"],
    fonts: { heading: "inter", body: "inter" },
    accent: "mulberry",
    space: { section: 10, entry: 8 },
    title: { size: 30, weight: 700, align: "left" },
    contact: { align: "left" },
    heading: { size: 11, weight: 700, caps: true, tracking: 0.065, align: "left", accent: true, rule: "hairline-below" },
    margin: 45.35,
    leading: 1.32,
    ruleColor: "#C5B6CE",
    nameBar: { width: 4, inset: 12 },
    frame: { color: "#C5B6CE", padX: 12, padY: 10 },
    grid: { kind: "rail", side: "right", width: 142, gap: 18, padX: 11, padY: 10, kinds: ["skills", "certificates", "languages", "awards", "courses", "interests"], outline: "#C5B6CE" },
  },
  chronicle: {
    id: "chronicle",
    no: 52,
    name: "Chronicle",
    family: "contemporary",
    tags: ["dates in a gutter", "serif name"],
    suits: "Experienced professionals and career progression",
    order: ["summary", "experience", "projects", "education", "volunteering", "skills"],
    fonts: { heading: "inter", body: "inter" },
    titleFont: "serif",
    accent: "lagoon",
    space: { section: 11, entry: 10 },
    title: { size: 28, weight: 600, align: "left" },
    contact: { align: "left" },
    heading: { size: 12, weight: 700, align: "left", accent: true, rule: "none" },
    margin: 45.35,
    bodySize: 11,
    leading: 1.35,
    headerRule: { height: 2, gap: 10 },
    grid: { kind: "date-gutter", width: 96, gap: 15, rule: "#B8CCD0" },
  },
};

/** Sections a template does not place go after the ones it does, in this order. */
const REST: SectionKind[] = ["achievements", "experience", "education", "skills", "projects", "certificates", "courses", "volunteering", "awards", "publications", "languages", "interests", "custom"];

/**
 * The order of section kinds on the paper for a template. A profile, where a
 * template does not place one, goes first: that is where a reader looks for it.
 */
export function kindOrder(template: TemplateDef): SectionKind[] {
  const lead: SectionKind[] = template.order.includes("summary") ? [] : ["summary"];
  return [...lead, ...template.order, ...REST.filter((k) => !template.order.includes(k))];
}

/** WCAG 2.1 relative luminance for contrast verification on white paper. */
export function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/** Contrast ratio of a hex colour against pure white (#ffffff) paper. */
export function contrastRatioOnWhite(hex: string): number {
  const l1 = 1.0; // White luminance
  const l2 = relativeLuminance(hex);
  return Number(((l1 + 0.05) / (l2 + 0.05)).toFixed(2));
}

/** What is drawn: the template with the person's own fonts, colour, sizes, spacing and decoration applied. */
export interface PaperStyle {
  template: TemplateDef;
  fonts: { heading: FamilyId; body: FamilyId; /** The name's font. */ title: FamilyId };
  accent: string;
  /** The multiplier on the template's spacing: 0.85, 1 or 1.15, or fine-grained. */
  density: number;
  page: { width: number; height: number; marginX: number; marginY: number };
  /** Body font size in pt (default 10.5, allows 6-16 pt). */
  fontSize: number;
  /** Fine line spacing multiplier (default 1.0). */
  lineSpacing: number;
  /** Section divider line style. */
  dividerStyle: "solid" | "dashed" | "dots" | "none" | "accent-bar";
  /** Whether to render section icons on headings. */
  sectionIcons: boolean;
  /** Bullet indentation in pt (default 13). */
  indentation: number;
  /** The mark drawn before each bullet ("" for none). */
  bullet: string;
  /** How far an entry's lines sit in from its heading, in points. */
  entryIndent: number;
  /** What is printed between the contact details. */
  separator: string;
  /** The name on a band of the accent colour, or plain. */
  header: HeaderStyle;
  /** Drawn lines as solid, dashed or dotted. */
  dash: "solid" | "dashed" | "dots";
}

export const BULLET_MARKS: Record<BulletStyle, string> = { disc: "•", dash: "–", arrow: "›", none: "" };
export const SEPARATORS: Record<ContactSeparator, string> = { dot: " · ", bar: " | ", bullet: "  •  " };

const PAGES = { a4: { width: 595.28, height: 841.89 }, letter: { width: 612, height: 792 } };

export function paperStyle(design: {
  template: TemplateId;
  pageSize: "a4" | "letter";
  density: Density;
  fonts?: TemplateId;
  accent?: AccentId;
  customAccent?: string;
  fontSize?: number;
  lineSpacing?: number;
  margin?: "compact" | "normal" | "relaxed" | number;
  dividerStyle?: "solid" | "dashed" | "dots" | "none" | "accent-bar";
  sectionIcons?: boolean;
  indentation?: number;
  headingFont?: FontFamilyId;
  bodyFont?: FontFamilyId;
  bullet?: BulletStyle;
  entryIndent?: number;
  contactSeparator?: ContactSeparator;
  nameSize?: number;
  headingCaps?: boolean;
  header?: HeaderStyle;
}): PaperStyle {
  const base = TEMPLATES[design.template] ?? TEMPLATES.standard;
  // The person's own changes are applied to a copy of the template, so everything that reads the template draws them.
  const divider = design.dividerStyle ?? "solid";
  const rule: HeadingRule = divider === "none" ? "none" : divider === "accent-bar" ? "bar-before" : (divider === "dashed" || divider === "dots") && base.heading.rule === "none" ? "hairline-below" : base.heading.rule;
  const template: TemplateDef = {
    ...base,
    title: { ...base.title, size: design.nameSize ? Math.max(16, Math.min(40, design.nameSize)) : base.title.size },
    heading: {
      ...base.heading,
      caps: design.headingCaps ?? base.heading.caps,
      rule,
      ruleAccent: divider === "accent-bar" ? true : base.heading.ruleAccent,
    },
  };
  const customHex = design.customAccent && /^#[0-9A-Fa-f]{6}$/.test(design.customAccent) ? design.customAccent : undefined;

  // Custom margin calculations (in pt). A v3 design has its own margins, used until the person chooses theirs.
  let marginX = base.margin ?? 50;
  let marginY = base.margin ?? 46;
  if (typeof design.margin === "number") {
    marginX = Math.max(15, Math.min(72, design.margin));
    // A v3 design has the same margin on every side. Otherwise the top and bottom are a little less, but never
    // under 12 mm while the sides are at least that (Fit to one page goes down to 12 mm on every side).
    marginY = base.margin ? marginX : Math.max(Math.round(marginX * 0.92), Math.min(marginX, 34.1));
  } else if (design.margin === "compact") {
    marginX = 36;
    marginY = 34;
  } else if (design.margin === "relaxed") {
    marginX = 64;
    marginY = 58;
  }

  // Section spacing (the space between sections and entries) comes from the density; the line spacing
  // sets the height of each line. They are separate, so "Fit to one page" can tighten the spacing
  // whatever line spacing has been chosen.
  const densityMultiplier = DENSITY_FACTOR[design.density] ?? 1;

  const pairing = TEMPLATES[design.fonts ?? base.id]?.fonts ?? base.fonts;
  const accentHex = customHex ?? ACCENTS[design.accent ?? template.accent].hex;
  return {
    template,
    fonts: { heading: design.headingFont ?? pairing.heading, body: design.bodyFont ?? pairing.body, title: design.headingFont ?? (design.fonts && design.fonts !== base.id ? pairing.heading : (base.titleFont ?? pairing.heading)) },
    accent: accentHex,
    density: densityMultiplier,
    fontSize: design.fontSize ? Math.max(6, Math.min(16, design.fontSize)) : (base.bodySize ?? BODY_SIZE),
    lineSpacing: design.lineSpacing ? Math.max(0.7, Math.min(1.8, design.lineSpacing)) : 1.0,
    page: { ...PAGES[design.pageSize], marginX, marginY },
    dividerStyle: design.dividerStyle ?? "solid",
    sectionIcons: Boolean(design.sectionIcons),
    indentation: typeof design.indentation === "number" ? design.indentation : 13,
    bullet: BULLET_MARKS[design.bullet ?? base.bullet ?? "disc"],
    entryIndent: Math.max(0, Math.min(24, design.entryIndent ?? base.entryIndent ?? 0)),
    separator: SEPARATORS[design.contactSeparator ?? base.separator ?? "dot"],
    // White text on the band needs the accent to be dark: a pale custom colour keeps the plain header.
    header: (design.header ?? base.header ?? "plain") === "band" && contrastRatioOnWhite(accentHex) >= 4.5 ? "band" : "plain",
    dash: divider === "dashed" ? "dashed" : divider === "dots" ? "dots" : "solid",
  };
}

/** The font pairings a person can choose from, named by the template they come from. */
export const PAIRINGS = (Object.values(TEMPLATES) as TemplateDef[])
  .sort((a, b) => a.no - b.no)
  .filter((t, i, all) => all.findIndex((u) => u.fonts.heading === t.fonts.heading && u.fonts.body === t.fonts.body) === i)
  .map((t) => ({ id: t.id, fonts: t.fonts }));
