import type { ContextType, QuestionGroup } from "@/lib/types";
import type { FocusCategoryKey } from "@/lib/interviews/settings";

/**
 * General practice: the industries, professions and question types the
 * Practice Hub offers, and how a session is planned from them. Safe in the
 * browser (the hub's preview uses the same plan the server builds).
 */

export type CategoryKey =
  | "behaviour"
  | "strengths"
  | "technical"
  | "experience"
  | "motivational"
  | "situational"
  | "case"
  | "leadership"
  | "challenging"
  | "values";

export type IndustryKey = "any" | "government" | "healthcare" | "technology" | "finance" | "education";

export const CATEGORY_KEYS: CategoryKey[] = ["behaviour", "strengths", "technical", "experience", "motivational", "situational", "case", "leadership", "challenging", "values"];

export const CATEGORY_NAME: Record<CategoryKey, string> = {
  behaviour: "Competency & Behavioural",
  strengths: "Strengths",
  technical: "Technical",
  experience: "Experience",
  motivational: "Motivational",
  situational: "Situational",
  case: "Case Study & Problem-solving",
  leadership: "Leadership & Management",
  challenging: "Challenging & Curveball",
  values: "Values & Culture",
};

/** What each type assesses (doc: "the interview type determines how it is assessed"). */
export const CATEGORY_ASSESSES: Record<CategoryKey, string> = {
  behaviour: "past behaviour and competencies valued in this industry, with evidence of what the candidate did and the outcome (STAR)",
  strengths: "natural abilities, preferences and what energises the candidate in this industry's work; answered spontaneously, never STAR",
  technical: "industry or profession knowledge, methods, tools and practices",
  experience: "previous responsibilities and experience relevant to this industry",
  motivational: "genuine interest in this industry, its purpose, challenges and career opportunities",
  situational: "judgement in realistic hypothetical situations common in this industry",
  case: "structured analysis, judgement and recommendations on a realistic industry problem",
  leadership: "leadership challenges, team dynamics and decision-making in this industry",
  challenging: "thinking on the spot about unexpected questions grounded in this industry's challenges and trade-offs",
  values: "professional ethics, integrity, values and cultural expectations in this industry",
};

/** Where each type sits in the app's question groups, and how its answers are scored. */
export const CATEGORY_SLOT: Record<CategoryKey, { group: QuestionGroup; type: ContextType; focus: FocusCategoryKey }> = {
  behaviour: { group: "competency", type: "competency", focus: "competency" },
  strengths: { group: "competency", type: "strengths", focus: "strengths" },
  technical: { group: "technical", type: "technical", focus: "technical" },
  experience: { group: "cv", type: "competency", focus: "experience" },
  motivational: { group: "motivation", type: "why-us", focus: "motivation" },
  situational: { group: "curveball", type: "situational", focus: "situational" },
  case: { group: "technical", type: "technical", focus: "caseStudy" },
  leadership: { group: "competency", type: "competency", focus: "leadership" },
  challenging: { group: "curveball", type: "situational", focus: "curveball" },
  values: { group: "motivation", type: "why-us", focus: "valuesCulture" },
};

export interface SectorSpec {
  name: string;
  /** The Recommended Mix for the industry. */
  mix: CategoryKey[];
  roles: string[];
}

export const SECTORS: Record<IndustryKey, SectorSpec> = {
  any: { name: "Any industry", mix: ["behaviour", "strengths", "motivational", "situational"], roles: [] },
  government: { name: "Government & Public Services", mix: ["behaviour", "strengths", "situational", "values"], roles: ["Policy & Strategy", "Operational Delivery", "Digital Product Management", "Commercial & Procurement"] },
  healthcare: { name: "Healthcare & Social Care", mix: ["situational", "values", "strengths", "behaviour"], roles: ["Nursing", "Clinical Support", "Healthcare Operations", "Allied Health"] },
  technology: { name: "Technology & Digital", mix: ["technical", "case", "behaviour", "strengths"], roles: ["Software Engineering", "Product Management", "Data & AI", "Cloud & DevOps"] },
  finance: { name: "Banking & Finance", mix: ["technical", "situational", "case", "challenging"], roles: ["Financial Analysis", "Risk & Compliance", "Accounting", "Investment Operations"] },
  education: { name: "Education & Training", mix: ["behaviour", "values", "motivational", "situational"], roles: ["Teaching", "Academic Support", "Education Management", "Instructional Design"] },
};

export const INDUSTRY_KEYS = Object.keys(SECTORS) as IndustryKey[];

/** Every profession the hub lists, for "Any industry" (a profession that applies across industries). */
export const ALL_ROLES: string[] = [...new Set(INDUSTRY_KEYS.flatMap((k) => SECTORS[k].roles))];

export const isIndustry = (v: unknown): v is IndustryKey => typeof v === "string" && v in SECTORS;
export const isCategory = (v: unknown): v is CategoryKey => typeof v === "string" && (CATEGORY_KEYS as string[]).includes(v);

export type PracticeDuration = 5 | 10 | 20 | 30 | 45;
export const DURATIONS: PracticeDuration[] = [5, 10, 20, 30, 45];

/** How many main questions fit the session. */
export function targetCount(duration: number, focus: "mix" | CategoryKey): number {
  const pick = (t: Record<number, number>, d: number) => t[duration] ?? d;
  if (focus === "strengths") return pick({ 5: 2, 10: 4, 20: 6, 30: 9, 45: 13 }, 8);
  if (focus === "case") return pick({ 5: 1, 10: 2, 20: 3, 30: 5, 45: 7 }, 5);
  if (focus === "behaviour" || focus === "leadership" || focus === "experience") return pick({ 5: 1, 10: 2, 20: 4, 30: 6, 45: 9 }, 6);
  if (focus === "technical") return pick({ 5: 1, 10: 2, 20: 4, 30: 7, 45: 10 }, 7);
  return pick({ 5: 1, 10: 3, 20: 5, 30: 8, 45: 11 }, 8);
}

/** The question type of each question in the session, in the order they are asked. */
export function planCategories(industry: IndustryKey, focus: "mix" | CategoryKey, duration: number): CategoryKey[] {
  const n = targetCount(duration, focus);
  if (focus !== "mix") return Array.from({ length: n }, () => focus);
  const mix = SECTORS[industry].mix;
  return Array.from({ length: n }, (_, i) => mix[i % mix.length]);
}

/** "Competency & Behavioural × 2", in the order first asked. */
export function planBreakdown(plan: CategoryKey[]): { key: CategoryKey; name: string; count: number }[] {
  const out: { key: CategoryKey; name: string; count: number }[] = [];
  for (const k of plan) {
    const row = out.find((r) => r.key === k);
    if (row) row.count += 1;
    else out.push({ key: k, name: CATEGORY_NAME[k], count: 1 });
  }
  return out;
}
