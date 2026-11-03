import type { CompanyBrief, ContextType, Question, QuestionGroup, RoleUnderstanding, Story } from "@/lib/types";
import { GROUP_ORDER } from "@/lib/labels";
import { shortTitle } from "@/lib/questions/store";
import { TYPES_FOR_GROUP, normText } from "@/lib/ai/interview/build-plan";
import { isTechRole } from "./settings";
import { withArticle } from "@/lib/format";

/**
 * Turning a built plan into the interview's question bank, and the template
 * plan used when there's no Claude key (or in tests): standard questions with
 * the company and role filled in.
 */

export interface BuiltPlan {
  company: string;
  role: string;
  seniority: string;
  interviewerTitle: string;
  jobSummary: string;
  skills: string[];
  understanding: RoleUnderstanding;
  brief: CompanyBrief;
  probes: { ask: string; handle: string }[];
  questionsToAsk: string[];
  stories: Omit<Story, "id">[];
  gaps: { skill: string; question: string }[];
  questions: { group: QuestionGroup; type: ContextType; text: string; short: string }[];
}

export const PREFIX: Record<QuestionGroup, string> = { motivation: "m", competency: "c", technical: "t", cv: "v", curveball: "b" };

export const OPENING_TEXT = "Tell me about yourself.";
export const CLOSING_TEXT = "That’s everything from me. What questions do you have for us?";

export const openingQuestion = (): Question => ({ id: "open", group: "motivation", type: "tell-me-about-yourself", text: OPENING_TEXT, short: "Tell me about yourself", slot: "opening" });
export const closingQuestion = (): Question => ({ id: "close", group: "curveball", type: "questions-for-us", text: CLOSING_TEXT, short: "Your questions for them", slot: "closing" });

/** The next free number for a category's ids (c1, c2… then c3 for the next one added). */
function nextNumber(existing: Question[], g: QuestionGroup): number {
  const re = new RegExp(`^${PREFIX[g]}(\\d+)$`);
  return existing.reduce((n, q) => Math.max(n, Number(q.id.match(re)?.[1] ?? 0)), 0) + 1;
}

/**
 * New questions in the shape the app uses: grouped in order, at most `counts`
 * per category, ids continuing after the bank's (m1, c1, t1, v1, b1…), each type
 * one its category allows, and nothing that repeats a question already in the bank.
 */
export function toQuestions(qs: BuiltPlan["questions"], counts: Record<QuestionGroup, number>, existing: Question[] = []): Question[] {
  const out: Question[] = [];
  const seen = new Set(existing.map((q) => normText(q.text)));
  for (const g of GROUP_ORDER) {
    let n = nextNumber(existing, g);
    const fresh = qs.filter((q) => q.group === g && !/tell me about yourself/i.test(q.text));
    for (const q of fresh) {
      if (out.filter((x) => x.group === g).length >= counts[g]) break;
      const text = q.text.trim();
      if (seen.has(normText(text))) continue;
      seen.add(normText(text));
      const type = TYPES_FOR_GROUP[g].includes(q.type) ? q.type : TYPES_FOR_GROUP[g][0];
      out.push({ id: `${PREFIX[g]}${n++}`, group: g, type, text, short: q.short.trim() || shortTitle(text) });
    }
  }
  return out;
}

const SKILL_WORDS = [
  "SQL", "Python", "Excel", "JavaScript", "TypeScript", "React", "Java", "AWS", "Cloud", "Machine learning", "Data analysis", "Analytics",
  "Stakeholder management", "Roadmaps", "Product strategy", "User research", "Design", "Experimentation", "Leadership", "Project management",
  "Sales", "Marketing", "Negotiation", "Finance", "Budgeting", "Risk", "Compliance", "Operations", "Customer service", "Communication", "Writing", "Testing",
];

/** Names that keep their capitals mid-sentence. */
const PROPER = new Set(["SQL", "Python", "Excel", "JavaScript", "TypeScript", "React", "Java", "AWS"]);

/** "SQL", "Python", but "stakeholder management": a skill as it reads in the middle of a sentence. */
export function skillInSentence(skill: string): string {
  return PROPER.has(skill) || skill === skill.toUpperCase() ? skill : skill.charAt(0).toLowerCase() + skill.slice(1);
}

/** Key skills the job spec mentions, from a common list (the template plan's stand-in for the model). */
export function skillsIn(text: string): string[] {
  const t = text.toLowerCase();
  const found = SKILL_WORDS.filter((w) => {
    const stem = w.toLowerCase().replace(/ (management|analysis|strategy|research)$/, "");
    return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t);
  });
  return (found.length >= 3 ? found : [...found, "Communication", "Problem solving", "Ownership"]).slice(0, 6);
}

const firstSentences = (text: string, max: number) => {
  const flat = text.replace(/\s+/g, " ").trim();
  const sentences = flat.match(/[^.!?]+[.!?]/g) ?? [flat];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max) break;
    out += s;
  }
  return out.trim() || flat.slice(0, max);
};

/** "Senior Data Analyst" → "Senior"; no level word → "Mid-level". */
export function levelFrom(title: string): string {
  const t = title.toLowerCase();
  if (/\b(intern|graduate|grad|apprentice|trainee|entry)\b/.test(t)) return "Graduate";
  if (/\bjunior\b/.test(t)) return "Junior";
  if (/\b(head|director|vp|chief)\b/.test(t)) return "Head";
  if (/\b(lead|principal|staff)\b/.test(t)) return "Lead";
  if (/\bsenior|sr\.?\b/.test(t)) return "Senior";
  return "Mid-level";
}

/** What each category means for this job, without a model. */
export function templateUnderstanding(input: { company: string; role: string; skills: string[] }): RoleUnderstanding {
  const role = input.role.trim() || "this role";
  const tech = isTechRole(role);
  const skills = input.skills.slice(0, 3);
  return {
    role,
    level: levelFrom(role),
    field: `working at ${input.company}`,
    technicalLabel: tech ? "Technical" : "Role knowledge",
    meanings: {
      cv: `Your path to ${role}: your roles, moves, gaps and the claims on your CV.`,
      competency: skills.length ? `Times you used the skills the job asks for, such as ${skills.map(skillInSentence).join(", ")}.` : "Times you used the skills the job asks for.",
      technical: tech ? `The tools, methods and decisions ${withArticle(role)} works with day to day.` : `The work itself: what ${withArticle(role)} needs to know and do, and how you’d handle it.`,
      motivation: `Why ${input.company}, why this role, and what you know about their market.`,
      curveball: "What you’d do if…, quick-fire questions and fair curveballs.",
    },
  };
}

/** Standard questions for each category, with the company and role filled in. */
export function templateBank(company: string, role: string): Record<QuestionGroup, [ContextType, string][]> {
  const c = company.trim();
  const r = role.trim() || "this role";
  return {
    motivation: [
      ["why-us", `Why do you want to work at ${c}?`],
      ["why-us", "Why this role, and why now?"],
      ["why-us", `What do you know about ${c} and what we do?`],
      ["why-us", `Who do you see as ${c}’s main competitors, and why would a customer pick us?`],
      ["tell-me-about-yourself", "Where do you want to be in three years?"],
      ["why-us", `What would make you turn down an offer from ${c}?`],
      ["why-us", "What are you looking for in your next manager?"],
    ],
    competency: [
      ["competency", "Tell me about a time you had to change your plan because of something you learned late."],
      ["competency", "Tell me about a disagreement with a colleague, and how you resolved it."],
      ["competency", "How do you prioritise when everything feels urgent?"],
      ["competency", "Describe a project that didn’t go to plan. What did you do?"],
      ["competency", "Tell me about a time you led people who didn’t report to you."],
      ["competency", "Give an example of a decision you made without all the data."],
      ["competency", "Tell me about a time you got difficult feedback. What did you do with it?"],
      ["competency", "Tell me about something you improved without being asked."],
    ],
    technical: [
      ["technical", "Walk me through a piece of work you’re proud of, and the trade-offs you made."],
      ["technical", `How would you measure success in your first 90 days as ${/^[aeiou]/i.test(r) ? "an" : "a"} ${r}?`],
      ["technical", "A key number you’re responsible for drops sharply overnight. What do you do first?"],
      ["situational", "What would you do if a senior stakeholder asked for something you thought was wrong?"],
      ["technical", "Explain something complex from your work to someone new to it."],
      ["technical", `Which numbers would you watch most closely in this role, and why?`],
      ["technical", "Talk me through how you’d approach a typical problem in this job, step by step."],
    ],
    cv: [
      ["competency", "What’s the achievement on your CV you’re proudest of, and what was your part in it?"],
      ["competency", "Talk me through the biggest move on your CV. Why did you make it?"],
      ["competency", "Why are you looking to leave your current role?"],
      ["competency", "Which of your past jobs taught you the most, and what did you learn?"],
      ["competency", "Tell me about a gap or a change of direction on your CV."],
      ["competency", "What did your last manager rely on you for?"],
    ],
    curveball: [
      ["situational", "What would your last manager say you need to work on?"],
      ["situational", `Sell me ${c} in 30 seconds.`],
      ["situational", "What would you do if you were given a deadline you knew you couldn’t meet?"],
      ["situational", "What’s one thing you’d change about how your current team works?"],
      ["situational", "What would you do in your first week here?"],
      ["situational", "What’s a strength of yours that sometimes gets you into trouble?"],
      ["situational", "What would you do if two senior people gave you opposite instructions?"],
    ],
  };
}

/** Up to `n` template questions in a category that aren't already in `avoid`. */
export function templateQuestions(company: string, role: string, group: QuestionGroup, n: number, avoid: string[]): BuiltPlan["questions"] {
  const seen = new Set(avoid.map(normText));
  return templateBank(company, role)
    [group].filter(([, text]) => !seen.has(normText(text)))
    .slice(0, n)
    .map(([type, text]) => ({ group, type, text, short: shortTitle(text) }));
}

/** Standard questions and a plain understanding of the job, with the company and role filled in. */
export function templatePlan(input: { company: string; role: string; counts: Record<QuestionGroup, number>; interviewerTitle: string; job?: string; site?: string }): BuiltPlan {
  const c = input.company.trim();
  const job = input.job?.trim() ?? "";
  const skills = skillsIn(job);
  const questions = GROUP_ORDER.flatMap((g) => templateQuestions(c, input.role, g, input.counts[g], []));
  return {
    company: c,
    role: input.role.trim(),
    seniority: levelFrom(input.role),
    interviewerTitle: input.interviewerTitle,
    jobSummary: job ? firstSentences(job, 200) : `${input.role.trim() || "A role"} at ${c}. Expect questions on why ${c}, your experience and how you’d approach the work.`,
    skills,
    understanding: templateUnderstanding({ company: c, role: input.role, skills }),
    brief: {
      whatTheyDo: input.site ? firstSentences(input.site, 300) : "",
      whyYou: [],
      toKnow: [],
    },
    probes: [],
    questionsToAsk: [
      "What would you want me to have achieved in my first six months?",
      "What does a great person in this role do differently from a good one?",
      `What’s the biggest challenge the team is facing at ${c} this year?`,
    ],
    stories: [],
    gaps: skills.slice(0, 2).map((s) => ({ skill: s, question: `Tell me about a time you used ${skillInSentence(s)} to solve a real problem.` })),
    questions,
  };
}
