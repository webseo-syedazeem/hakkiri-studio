import type { FocusCategoryKey } from "./settings";

/**
 * Reads a job advert for what the interview will actually assess, so the
 * suggested question focus follows the advert rather than a guess from the
 * sector. Safe in the browser: the set-up form runs it as the person types.
 *
 * A Civil Service advert says it outright ("This vacancy is using Success
 * Profiles, and will assess your Behaviours and Experience") and lists the
 * behaviours ("We'll assess you against these behaviours… Changing and
 * Improving, Seeing the Big Picture…"). Other adverts often say
 * "competency-based interview", "strengths-based", "technical test" or
 * "case study". Only when an advert says nothing does the job title decide.
 */

export const ALL_FOCUS_KEYS: FocusCategoryKey[] = [
  "competency",
  "strengths",
  "technical",
  "experience",
  "motivation",
  "situational",
  "caseStudy",
  "leadership",
  "curveball",
  "valuesCulture",
];

export const zeroWeights = (): Record<FocusCategoryKey, number> =>
  Object.fromEntries(ALL_FOCUS_KEYS.map((k) => [k, 0])) as Record<FocusCategoryKey, number>;

/** The Civil Service Success Profiles behaviours, as adverts name them. */
export const CIVIL_SERVICE_BEHAVIOURS = [
  "Seeing the Big Picture",
  "Changing and Improving",
  "Making Effective Decisions",
  "Leadership",
  "Communicating and Influencing",
  "Working Together",
  "Developing Self and Others",
  "Managing a Quality Service",
  "Delivering at Pace",
] as const;
export type CivilServiceBehaviour = (typeof CIVIL_SERVICE_BEHAVIOURS)[number];

export interface AssessmentRead {
  /** Question types the advert says it assesses, in the order found. Empty when it doesn't say. */
  assessed: FocusCategoryKey[];
  /** Named behaviours the advert lists (Civil Service Success Profiles). */
  behaviours: CivilServiceBehaviour[];
  /** True for the Civil Service and wider UK public sector. */
  publicSector: boolean;
  /** True when it uses Success Profiles. */
  successProfiles: boolean;
  /** Where the focus came from, for the form to say why. */
  source: "advert" | "job-title";
  /** One line the form can show: "The advert says it will assess Behaviours and Experience." */
  reason: string;
}

const PUBLIC_SECTOR = /\b(civil service|civil servants?|hmrc|dwp|nhs|council|gds|government digital service|home office|cabinet office|ministry of|department for|public sector|gov\.uk|success profiles?)\b/i;

const flat = (s: string) => s.replace(/\s+/g, " ").trim();

/** Sentences that talk about how candidates are selected or assessed. */
function assessmentSentences(text: string): string[] {
  const sentences = flat(text).split(/(?<=[.!?:])\s+|\n+/);
  return sentences.filter((s) => /\b(assess|assessed|assessing|selection process|success profiles?|interview will|at interview|interview(?:s)? will|you will be (?:asked|tested)|based interview|interview format)\b/i.test(s));
}

/** Behaviours the advert lists, wherever they appear (they are often a bare list under "Behaviours"). */
function behavioursIn(text: string): CivilServiceBehaviour[] {
  const t = flat(text).toLowerCase();
  // "Leadership" on its own is too common a word: it counts only when it sits in the list of other named behaviours.
  const found: CivilServiceBehaviour[] = CIVIL_SERVICE_BEHAVIOURS.filter((b) => b !== "Leadership" && t.includes(b.toLowerCase()));
  if (found.length) {
    const at = found.map((b) => t.indexOf(b.toLowerCase()));
    const listArea = t.slice(Math.max(0, Math.min(...at) - 40), Math.max(...at) + 60);
    if (/\bleadership\b/.test(listArea)) found.push("Leadership");
  }
  return CIVIL_SERVICE_BEHAVIOURS.filter((b) => found.includes(b));
}

/** What the advert says the interview assesses. */
export function readAssessment(title: string, jobText = ""): AssessmentRead {
  const text = `${title}\n${jobText}`;
  const publicSector = PUBLIC_SECTOR.test(text);
  const successProfiles = /\bsuccess profiles?\b/i.test(text);
  const behaviours = behavioursIn(jobText);
  const assessed: FocusCategoryKey[] = [];
  const add = (k: FocusCategoryKey) => {
    if (!assessed.includes(k)) assessed.push(k);
  };

  for (const s of assessmentSentences(jobText)) {
    const low = s.toLowerCase();
    // Success Profiles elements, and the everyday names for interview types.
    if (/\bbehaviou?rs?\b|\bbehavioural\b|\bcompetenc(?:y|ies)\b|\bcompetency[- ]based\b/.test(low)) add("competency");
    if (/\bstrengths?\b|\bstrengths[- ]based\b/.test(low)) add("strengths");
    if (/\bexperience\b/.test(low)) add("experience");
    if (/\btechnical\b/.test(low)) add("technical");
    if (/\bcase stud(?:y|ies)\b|\bproblem[- ]solving exercise\b/.test(low)) add("caseStudy");
    if (/\bsituational\b|\bscenario\b/.test(low)) add("situational");
    if (/\bvalues\b/.test(low)) add("valuesCulture");
    if (/\bmotivation\b|\bwhy you want\b/.test(low)) add("motivation");
  }
  // A list of named behaviours means behaviour questions, even if no sentence says "assess".
  if (behaviours.length && !assessed.includes("competency")) assessed.unshift("competency");

  const names: Record<FocusCategoryKey, string> = {
    competency: "Behaviours",
    strengths: "Strengths",
    experience: "Experience",
    technical: "Technical",
    caseStudy: "Case study",
    situational: "Situational",
    valuesCulture: "Values",
    motivation: "Motivation",
    leadership: "Leadership",
    curveball: "Curveball",
  };
  const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  const reason = assessed.length
    ? `The advert says it will assess ${list(assessed.map((k) => names[k]))}${behaviours.length ? `, including the behaviours ${list(behaviours)}` : ""}.`
    : "The advert doesn’t say how you’ll be assessed, so this is suggested from the job title.";
  return { assessed, behaviours, publicSector, successProfiles, source: assessed.length ? "advert" : "job-title", reason };
}

/** How much of the interview each assessed type gets, before rounding. Behaviour questions lead when they are assessed. */
const SHARE: Record<FocusCategoryKey, number> = {
  competency: 4,
  strengths: 2,
  technical: 2,
  experience: 1,
  caseStudy: 2,
  situational: 1,
  valuesCulture: 1,
  motivation: 1,
  leadership: 2,
  curveball: 1,
};

/** Shares rounded to steps of ten that add up to exactly 100 (largest remainder). Zero stays zero. */
export function toHundred(raw: Partial<Record<FocusCategoryKey, number>>, step = 10): Record<FocusCategoryKey, number> {
  const keys = ALL_FOCUS_KEYS.filter((k) => (raw[k] ?? 0) > 0);
  const out = zeroWeights();
  if (!keys.length) return out;
  const total = keys.reduce((s, k) => s + (raw[k] ?? 0), 0);
  const units = 100 / step;
  const exact = keys.map((k) => ({ k, v: ((raw[k] ?? 0) / total) * units }));
  for (const e of exact) out[e.k] = Math.floor(e.v);
  let left = units - keys.reduce((s, k) => s + out[k], 0);
  for (const e of [...exact].sort((a, b) => b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)) || keys.indexOf(a.k) - keys.indexOf(b.k))) {
    if (left <= 0) break;
    out[e.k] += 1;
    left -= 1;
  }
  // Everything the person switched on keeps at least one step when there is room.
  for (const k of keys) {
    if (out[k] > 0) continue;
    const donor = [...keys].sort((a, b) => out[b] - out[a])[0];
    if (out[donor] > 1) {
      out[donor] -= 1;
      out[k] = 1;
    }
  }
  for (const k of ALL_FOCUS_KEYS) out[k] *= step;
  return out;
}

/** The question focus to suggest for a job: from the advert when it says, otherwise from the title. */
export function suggestWeights(title: string, jobText = ""): Record<FocusCategoryKey, number> {
  const read = readAssessment(title, jobText);
  if (read.assessed.length) {
    return toHundred(Object.fromEntries(read.assessed.map((k) => [k, SHARE[k]])));
  }
  const t = `${title} ${jobText}`.toLowerCase();
  const w = (x: Partial<Record<FocusCategoryKey, number>>) => ({ ...zeroWeights(), ...x });
  if (read.publicSector) return w({ competency: 60, experience: 20, motivation: 20 });
  if (/\b(engineer|developer|software|full[- ]stack|backend|frontend|devops|sre|architect|programmer|data scientist|data engineer)\b/.test(t)) {
    return w({ technical: 40, caseStudy: 20, competency: 20, experience: 20 });
  }
  if (/\b(nurse|nursing|clinical|care assistant|carer|midwife|paramedic|healthcare)\b/.test(t)) {
    return w({ competency: 30, situational: 30, valuesCulture: 20, motivation: 20 });
  }
  if (/\b(teacher|teaching|lecturer|tutor|school)\b/.test(t)) {
    return w({ competency: 30, situational: 30, valuesCulture: 20, motivation: 20 });
  }
  if (/\b(director|head of|vp|chief|manager|executive|principal)\b/.test(title.toLowerCase())) {
    return w({ competency: 40, leadership: 30, experience: 30 });
  }
  if (/\b(product manager|product owner|ux|designer)\b/.test(t)) {
    return w({ competency: 30, technical: 30, caseStudy: 20, experience: 20 });
  }
  return w({ competency: 40, experience: 20, technical: 20, motivation: 20 });
}

/** A focus line the question writer can follow, with the behaviours named. */
export function focusBrief(weights: Partial<Record<FocusCategoryKey, number>>, read: Pick<AssessmentRead, "behaviours">, labels: Record<FocusCategoryKey, string>): string {
  const on = ALL_FOCUS_KEYS.filter((k) => (weights[k] ?? 0) > 0);
  const off = ALL_FOCUS_KEYS.filter((k) => (weights[k] ?? 0) === 0);
  const lines = [`Question focus chosen for this interview: ${on.map((k) => `${labels[k]} ${weights[k]}%`).join(", ") || "balanced"}.`];
  if (off.length && on.length) lines.push(`Do not write ${off.map((k) => labels[k]).join(", ")} questions: they were switched off.`);
  if (read.behaviours.length && (weights.competency ?? 0) > 0) {
    lines.push(`The advert assesses these behaviours: ${read.behaviours.join(", ")}. Each competency question must test one of them, by name in the short title, spread across them, in the Civil Service Success Profiles style (“Tell me about a time…”, evidence of what YOU did and the outcome).`);
  }
  return lines.join(" ");
}
