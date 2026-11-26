import { type TemplateDef, type TemplateFamily, catalogue } from "../render/templates";
import type { CvLevel, CvRegion } from "../schema";
import { pick, pickList } from "./build";
import { EXAMPLES } from "./index";
import { INDUSTRIES, industryById } from "./industries";
import type { ExampleSpec, IndustryId } from "./types";

/**
 * Finding an example or a template by the job someone wants. People type the
 * everyday word ("pilot", "nurse", "teacher") and our titles don't always use
 * it ("First Officer", "Staff Nurse", "Primary School Teacher"), so each
 * everyday word is listed here with the industries it means. The rest comes
 * from the examples and industries themselves: role titles in both regions,
 * industry names, the roles each industry lists and the words its adverts use.
 */
const EVERYDAY: Record<string, IndustryId[]> = {
  pilot: ["aviation"], airline: ["aviation"], flight: ["aviation"], aircraft: ["aviation"], airport: ["aviation"], steward: ["aviation"], stewardess: ["aviation"], hostess: ["aviation"],
  nurse: ["healthcare"], nursing: ["healthcare"], nhs: ["healthcare"], hospital: ["healthcare"], doctor: ["healthcare"], medical: ["healthcare"], clinical: ["healthcare", "science"], health: ["healthcare", "care"],
  carer: ["care"], caregiver: ["care"], care: ["care"], social: ["care"],
  teacher: ["education"], teaching: ["education"], school: ["education"], tutor: ["education"], lecturer: ["education"], classroom: ["education"],
  developer: ["software"], programmer: ["software"], coder: ["software"], coding: ["software"], software: ["software"], it: ["software"], tech: ["software", "data", "cyber"], devops: ["software"],
  data: ["data"], analytics: ["data"], scientist: ["data", "science"], security: ["cyber"], cyber: ["cyber"], hacker: ["cyber"],
  marketer: ["marketing"], marketing: ["marketing"], advertising: ["marketing"], seo: ["marketing"], social_media: ["marketing", "media"],
  accountant: ["finance"], accounting: ["finance"], finance: ["finance"], bookkeeper: ["finance"], banker: ["banking"], bank: ["banking"], mortgage: ["banking"], loan: ["banking"], insurance: ["banking"],
  sales: ["sales"], salesperson: ["sales"], seller: ["sales"], shop: ["retail"], store: ["retail"], retail: ["retail"], cashier: ["retail"],
  chef: ["hospitality"], cook: ["hospitality"], kitchen: ["hospitality"], restaurant: ["hospitality"], hotel: ["hospitality"], bar: ["hospitality"], waiter: ["hospitality"], waitress: ["hospitality"],
  admin: ["admin"], administrator: ["admin"], secretary: ["admin", "legal"], pa: ["admin"], receptionist: ["admin", "hospitality"],
  hr: ["hr"], recruiter: ["hr"], recruitment: ["hr"], people: ["hr"], lawyer: ["legal"], solicitor: ["legal"], attorney: ["legal"], legal: ["legal"], law: ["legal"],
  engineer: ["engineering", "software"], engineering: ["engineering"], mechanic: ["manufacturing"], technician: ["manufacturing", "science"], builder: ["construction"], construction: ["construction"], electrician: ["construction"], plumber: ["construction"],
  warehouse: ["logistics"], driver: ["logistics"], logistics: ["logistics"], delivery: ["logistics"], factory: ["manufacturing"], production: ["manufacturing"],
  manager: ["projects", "business"], pm: ["projects"], product: ["projects"], project: ["projects"], consultant: ["business", "energy"], analyst: ["business", "data", "finance"],
  designer: ["design"], design: ["design"], graphic: ["design"], ux: ["design"], creative: ["design", "media"], journalist: ["media"], pr: ["media"], communications: ["media"], writer: ["media", "design"],
  government: ["public-sector"], council: ["public-sector"], civil: ["public-sector"], policy: ["public-sector"], public: ["public-sector"],
  lab: ["science"], laboratory: ["science"], research: ["science"], researcher: ["science"], environmental: ["energy"], renewable: ["energy"], energy: ["energy"],
  property: ["property"], estate: ["property"], realtor: ["property"], letting: ["property"],
  graduate: ["early-career"], student: ["early-career"], intern: ["early-career"], apprentice: ["early-career"], school_leaver: ["early-career"],
  customer: ["customer-service"], support: ["customer-service"],
};

/** Everyday words for one particular job, where the industry has several. */
const ROLE_WORDS: Record<string, string[]> = {
  pilot: ["first-officer"], captain: ["first-officer"], steward: ["cabin-crew"], stewardess: ["cabin-crew"], hostess: ["cabin-crew"], attendant: ["cabin-crew"],
  realtor: ["estate-agent"], lawyer: ["paralegal"], solicitor: ["paralegal"], attorney: ["paralegal"], carer: ["care-worker"], caregiver: ["care-worker"],
  developer: ["software-engineer"], programmer: ["software-engineer"], coder: ["software-engineer"], accountant: ["finance-analyst"], marketer: ["marketing-lead"],
  recruiter: ["hr-adviser"], cook: ["chef"], builder: ["site-manager"], mechanic: ["maintenance-technician"],
};

/** Words that say nothing about the job and are left out of a search. */
const NOISE = new Set("a an and the of for in to cv cvs resume resumes example examples template templates job jobs role roles with my".split(" "));

/** "Nurses," → "nurse". Lower case, no punctuation, a plain plural made singular. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter((w) => w && !NOISE.has(w))
    .map((w) => (w.length > 3 && /[^s]s$/.test(w) && !/(ss|us|is)$/.test(w) ? w.slice(0, -1) : w));
}

/** Everything an example can be found by, in both regions. Role words count most. */
function exampleIndex(spec: ExampleSpec) {
  const ind = industryById(spec.industry);
  const both = (v: Parameters<typeof pick>[0]) => `${pick(v, "uk")} ${pick(v, "us")}`;
  return {
    role: new Set(words(`${both(spec.role)} ${spec.id}`)),
    industry: new Set(words(`${both(ind.name)} ${ind.roles.map((r) => both(r.title)).join(" ")}`)),
    other: new Set(words(`${both(spec.blurb)} ${pickList(ind.keywords, "uk").join(" ")} ${spec.skills.map((s) => both(s)).join(" ")}`)),
  };
}

export interface CatalogueQuery {
  q: string;
  industry?: IndustryId | "";
  level?: CvLevel | "";
  look?: TemplateFamily | "";
}

/** The industries a search names, through their own words or the everyday ones. */
export function industriesFor(q: string): Set<IndustryId> {
  const out = new Set<IndustryId>();
  const ws = words(q);
  ws.forEach((w, i) => {
    for (const id of EVERYDAY[w] ?? EVERYDAY[`${w}_${ws[i + 1] ?? ""}`] ?? []) out.add(id);
  });
  for (const ind of INDUSTRIES) {
    const name = new Set(words(`${pick(ind.name, "uk")} ${pick(ind.name, "us")} ${ind.roles.map((r) => `${pick(r.title, "uk")} ${pick(r.title, "us")}`).join(" ")}`));
    if (ws.length && ws.every((w) => name.has(w))) out.add(ind.id);
  }
  return out;
}

/** The examples that fit, best first: every word of the search must be found, in the example or its industry. */
export function findExamples(query: CatalogueQuery): ExampleSpec[] {
  const ws = words(query.q);
  const named = industriesFor(query.q);
  const scored = EXAMPLES.filter((e) => (!query.industry || e.industry === query.industry) && (!query.level || e.level === query.level)).map((spec) => {
    if (!ws.length) return { spec, score: 1 };
    const ix = exampleIndex(spec);
    let score = 0;
    for (const w of ws) {
      const hit = ix.role.has(w) || (ROLE_WORDS[w] ?? []).includes(spec.id) ? 6 : ix.industry.has(w) ? 3 : ix.other.has(w) ? 1 : (EVERYDAY[w] ?? []).includes(spec.industry) ? 3 : 0;
      if (!hit) return { spec, score: 0 };
      score += hit;
    }
    if (named.has(spec.industry)) score += 1;
    return { spec, score };
  });
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.spec);
}

/**
 * The templates that suit, best first. A template is found by its own name,
 * style and who it is good for; and the industries a search names bring the
 * templates whose "good for" line names them, and the one each industry
 * starts its examples in.
 */
export function findTemplates(query: CatalogueQuery): TemplateDef[] {
  const ws = words(query.q);
  const industries = new Set(industriesFor(query.q));
  if (query.industry) industries.add(query.industry);
  const industryWords = [...industries].flatMap((id) => words(`${pick(industryById(id).name, "uk")}`));
  const homes = new Set([...industries].map((id) => industryById(id).template));
  const levelWords: Record<CvLevel, string[]> = { student: ["student", "graduate", "school", "first"], early: ["graduate", "first", "early", "short"], experienced: ["experienced", "professional"], senior: ["senior", "leader", "director", "executive", "board"] };
  const scored = catalogue()
    .filter((t) => !query.look || t.family === query.look)
    .map((t) => {
      const name = new Set(words(t.name));
      const own = new Set(words(`${t.name} ${t.suits} ${t.tags.join(" ")} ${t.family}`));
      let score = 0;
      // Its own name counts most: "formal serif" is No. 04 · Formal Serif before any other formal serif design.
      for (const w of ws) score += name.has(w) ? 5 : own.has(w) ? 3 : 0;
      score += industryWords.filter((w) => own.has(w)).length * 2;
      if (homes.has(t.id)) score += 2;
      if (query.level) score += levelWords[query.level].filter((w) => own.has(w)).length;
      return { t, score };
    });
  const anyAsked = ws.length > 0 || industries.size > 0 || !!query.level;
  const list = anyAsked ? scored.filter((x) => x.score > 0) : scored;
  return list.sort((a, b) => b.score - a.score || a.t.no - b.t.no).map((x) => x.t);
}

/** For the example cards: the role and its industry in the region's words. */
export function exampleCard(spec: ExampleSpec, region: CvRegion) {
  return { id: spec.id, role: pick(spec.role, region), industry: pick(industryById(spec.industry).name, region), level: spec.level, blurb: pick(spec.blurb, region), letter: !!spec.letter, template: spec.template };
}

/**
 * The example a template is shown with when there is no CV of the person's
 * own: one written for that kind of job (the same choice the preview images
 * are drawn with, scripts/template-previews.cjs).
 */
const FAMILY_EXAMPLE: Record<TemplateFamily, string> = { technical: "software-engineer", "early-career": "cs-graduate", executive: "customer-success", condensed: "project-manager", specialist: "business-analyst", expressive: "marketing-lead", contemporary: "marketing-lead", classic: "product-manager", minimal: "data-scientist" };
const OWN_EXAMPLE: Partial<Record<string, string>> = { ward: "staff-nurse", research: "data-scientist", index: "devops-engineer", kernel: "software-engineer", chalkboard: "primary-teacher" };
export function exampleForTemplate(t: TemplateDef): ExampleSpec {
  const id = OWN_EXAMPLE[t.id] ?? FAMILY_EXAMPLE[t.family];
  return EXAMPLES.find((e) => e.id === id) ?? EXAMPLES[0];
}
