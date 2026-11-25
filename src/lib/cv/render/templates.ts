import type { AccentId, Density, SectionKind, TemplateId } from "../schema";
import type { FamilyId } from "./fonts";

/**
 * The eight templates. Every one is a single column of real text with
 * standard headings and the contact details in the body, so it reads the same
 * to software as it does to a person. A template sets the order of sections,
 * the look of the name and headings, and the spacing. What a person may change
 * is limited to the font pairing, the accent, the density and the order.
 */

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
  name: string;
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
}

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  standard: {
    id: "standard",
    name: "Standard",
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
    name: "Graduate",
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
    name: "Compact",
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
    name: "Executive",
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
    name: "Portfolio",
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
    name: "Research",
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
    name: "Career Change",
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
    name: "Technical",
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
    name: "Modern",
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
    name: "Minimal",
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
    name: "Creative",
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
    name: "Consulting",
    suits: "Strategy, finance & advisory",
    order: ["education", "experience", "achievements", "skills"],
    fonts: { heading: "serif", body: "inter" },
    accent: "forest",
    space: { section: 13, entry: 7 },
    title: { size: 25, weight: 700, align: "center", ruleBelow: true },
    contact: { align: "center", tight: true },
    heading: { size: 11.5, weight: 700, caps: true, tracking: 0.04, align: "left", accent: true, rule: "hairline-below", ruleAccent: true },
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

/** What is drawn: the template with the person's own font pairing, accent and density applied. */
export interface PaperStyle {
  template: TemplateDef;
  fonts: { heading: FamilyId; body: FamilyId };
  accent: string;
  /** The multiplier on the template's spacing: 0.85, 1 or 1.15. */
  density: number;
  page: { width: number; height: number; marginX: number; marginY: number };
}

const PAGES = { a4: { width: 595.28, height: 841.89 }, letter: { width: 612, height: 792 } };

export function paperStyle(design: { template: TemplateId; pageSize: "a4" | "letter"; density: Density; fonts?: TemplateId; accent?: AccentId; customAccent?: string }): PaperStyle {
  const template = TEMPLATES[design.template] ?? TEMPLATES.standard;
  const customHex = design.customAccent && /^#[0-9A-Fa-f]{6}$/.test(design.customAccent) ? design.customAccent : undefined;
  return {
    template,
    fonts: TEMPLATES[design.fonts ?? template.id]?.fonts ?? template.fonts,
    accent: customHex ?? ACCENTS[design.accent ?? template.accent].hex,
    density: DENSITY_FACTOR[design.density] ?? 1,
    // The same safe margins on every template: wide enough for any printer, and never changed by fitting.
    page: { ...PAGES[design.pageSize], marginX: 50, marginY: 46 },
  };
}

/** The eight font pairings a person can choose from, named by the template they come from. */
export const PAIRINGS = (Object.values(TEMPLATES) as TemplateDef[]).map((t) => ({ id: t.id, fonts: t.fonts }));
