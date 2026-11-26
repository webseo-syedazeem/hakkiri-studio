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
}

/** "No. 07 · Harbour": how a template is named everywhere it is shown. */
export const templateLabel = (t: Pick<TemplateDef, "no" | "name">) => `No. ${String(t.no).padStart(2, "0")} · ${t.name}`;

/** The template's web address part: "07-harbour". */
export const templateSlug = (t: Pick<TemplateDef, "no" | "name">) => `${String(t.no).padStart(2, "0")}-${t.name.toLowerCase().replace(/\s+/g, "-")}`;
/** The template's preview image, drawn by the renderer with an example CV (scripts/template-previews.cjs): 1098 by 1552 pixels, or 550 wide when small. */
export const templatePreview = (t: Pick<TemplateDef, "no" | "id">, size: "large" | "small" = "large") => `/cv-templates/${String(t.no).padStart(2, "0")}-${t.id}${size === "small" ? "-small" : ""}.webp`;
/** Every template, by number. */
export const catalogue = (): TemplateDef[] => (Object.values(TEMPLATES) as TemplateDef[]).sort((a, b) => a.no - b.no);
export const templateBySlug = (slug: string): TemplateDef | undefined => catalogue().find((t) => templateSlug(t) === slug);

/** The page title, description and addresses for a template's page in the UK (CV) or US (resume) gallery. */
export function templateMeta(t: TemplateDef, region: "uk" | "us") {
  const word = region === "us" ? "resume" : "CV";
  const slug = templateSlug(t);
  const suits = t.suits.charAt(0).toLowerCase() + t.suits.slice(1);
  // Suits lines are written to read the same in both regions (checked in catalogue.test.ts).
  return {
    title: `${templateLabel(t)} ${word} template | Hakkiri`,
    description: `${templateLabel(t)}: an ATS-friendly ${word} template for ${suits}. One column of real text, PDF and Word downloads, and every font, ${region === "us" ? "color" : "colour"} and spacing yours to change.`,
    alternates: { canonical: `/${region === "us" ? "resume" : "cv"}-templates/${slug}`, languages: { "en-GB": `/cv-templates/${slug}`, "en-US": `/resume-templates/${slug}` } },
  };
}

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  standard: {
    id: "standard",
    no: 1,
    name: "Hallmark",
    family: "classic",
    tags: ["serif-free", "accent headings"],
    suits: "General applications",
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
    name: "Springboard",
    family: "early-career",
    tags: ["education first", "centred"],
    suits: "A first professional role",
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
    name: "Keystone",
    family: "condensed",
    tags: ["compact spacing", "fits more on a page"],
    suits: "A long work history",
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
    name: "Sterling",
    family: "executive",
    tags: ["large name", "serif headings"],
    suits: "Senior leaders",
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
    name: "Showcase",
    family: "expressive",
    tags: ["projects first", "accent rules"],
    suits: "Project-led applicants",
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
    name: "Scholar",
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
    name: "Crossroads",
    family: "specialist",
    tags: ["skills first", "capital headings"],
    suits: "Transferable experience",
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
    name: "Blueprint",
    family: "technical",
    tags: ["skills first", "accent bars"],
    suits: "Skills and qualifications first",
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
    name: "Northline",
    family: "contemporary",
    tags: ["accent name", "accent bars"],
    suits: "Clean contemporary layout",
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
    name: "Fieldnote",
    family: "minimal",
    tags: ["whitespace", "serif name"],
    suits: "Crisp editorial whitespace",
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
    name: "Prism",
    family: "expressive",
    tags: ["accent name", "serif headings"],
    suits: "Design, product & media roles",
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
    name: "Compass",
    family: "specialist",
    tags: ["education first", "centred"],
    suits: "Strategy, finance & advisory",
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
    name: "Ledger",
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
    name: "Linen",
    family: "classic",
    tags: ["serif", "quiet"],
    suits: "A calm, readable page for any role",
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
    name: "Chancery",
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
    name: "Meridian",
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
    name: "Harbour",
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
    name: "Slate",
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
    name: "Quartz",
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
    name: "Arcadia",
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
    name: "Vellum",
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
    name: "Hairline",
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
    name: "Tern",
    family: "minimal",
    tags: ["centred", "whitespace"],
    suits: "Any role, with room to breathe",
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
    name: "Clearwater",
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
    name: "Tally",
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
    name: "Docket",
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
    name: "Index",
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
    name: "Marginalia",
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
    name: "Boardroom",
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
    name: "Crest",
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
    name: "Regent",
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
    name: "Atlas",
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
    name: "Campus",
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
    name: "First Light",
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
    name: "Ladder",
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
    name: "Sapling",
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
    name: "Terminal",
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
    name: "Circuit",
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
    name: "Lattice",
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
    name: "Kernel",
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
    name: "Ward",
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
    name: "Chalkboard",
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
    name: "Canvas",
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
    name: "Atelier",
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
    name: "Palette",
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
  fonts: { heading: FamilyId; body: FamilyId };
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

  // Custom margin calculations (in pt)
  let marginX = 50;
  let marginY = 46;
  if (typeof design.margin === "number") {
    marginX = Math.max(15, Math.min(72, design.margin));
    marginY = Math.round(marginX * 0.92);
  } else if (design.margin === "compact") {
    marginX = 36;
    marginY = 34;
  } else if (design.margin === "relaxed") {
    marginX = 64;
    marginY = 58;
  }

  // Spacing density multiplier
  const densityMultiplier = design.lineSpacing
    ? design.lineSpacing
    : DENSITY_FACTOR[design.density] ?? 1;

  const pairing = TEMPLATES[design.fonts ?? base.id]?.fonts ?? base.fonts;
  const accentHex = customHex ?? ACCENTS[design.accent ?? template.accent].hex;
  return {
    template,
    fonts: { heading: design.headingFont ?? pairing.heading, body: design.bodyFont ?? pairing.body },
    accent: accentHex,
    density: densityMultiplier,
    fontSize: design.fontSize ? Math.max(6, Math.min(16, design.fontSize)) : BODY_SIZE,
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
