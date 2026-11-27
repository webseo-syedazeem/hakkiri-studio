import type { CompanyBrief, ContextType, Question, QuestionGroup, RoleUnderstanding, Story } from "@/lib/types";
import { GROUP_ORDER } from "@/lib/labels";
import { shortTitle } from "@/lib/questions/store";
import { TYPES_FOR_GROUP, normText } from "@/lib/ai/interview/build-plan";
import { isTechRole, type Difficulty } from "./settings";
import { withArticle } from "@/lib/format";
import { readAssessment, type CivilServiceBehaviour } from "./focus-detect";

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
  questions: { group: QuestionGroup; type: ContextType; text: string; short: string; difficulty?: Difficulty }[];
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
export function toQuestions(qs: BuiltPlan["questions"], counts: Record<QuestionGroup, number>, existing: Question[] = [], difficulty?: Difficulty): Question[] {
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
      const level = q.difficulty ?? difficulty;
      out.push({ id: `${PREFIX[g]}${n++}`, group: g, type, text, short: q.short.trim() || shortTitle(text), ...(level ? { difficulty: level } : {}) });
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

const clipTo = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/[\s,;:]+\S*$/, "")}…`);
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** The first real line after a heading such as "Job description" or "Essential experience". */
export function lineAfter(text: string, heading: RegExp): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (!heading.test(lines[i])) continue;
    // The heading may carry its text on the same line ("Job summary: We are…").
    const same = lines[i].replace(heading, "").replace(/^[\s:–-]+/, "").trim();
    if (same.split(/\s+/).length >= 6) return same;
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
      if (lines[j].split(/\s+/).length >= 6) return lines[j].replace(/^[•*\-–\d.)\s]+/, "");
    }
  }
  return "";
}

/** The first sentence of a line, without its full stop. */
const firstSentence = (line: string) => (line.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? line).replace(/[.!?]$/, "").trim();

/** What the job is, in one line from the advert. */
function workFrom(job: string, company: string): string {
  const line =
    lineAfter(job, /^(job description|about the role|the role|role purpose|main purpose|overview of the role|what you(?:'|’)ll do)\b/i) ||
    lineAfter(job, /^(job summary|summary|about the job)\b/i);
  if (!line) return `working at ${company}`;
  return clipTo(firstSentence(line), 118);
}

/** What each category means for this job, without a model, taken from the advert where it says. */
export function templateUnderstanding(input: { company: string; role: string; skills: string[]; job?: string }): RoleUnderstanding {
  const role = input.role.trim() || "this role";
  const job = input.job?.trim() ?? "";
  const tech = isTechRole(role);
  const skills = input.skills.slice(0, 3);
  const read = readAssessment(role, job);
  const essential = lineAfter(job, /^(essential (experience|criteria|skills)|you(?:'|’)ll need|requirements|what we(?:'|’)re looking for)\b/i);
  const duty = lineAfter(job, /^(person specification|key responsibilities|responsibilities|main duties|duties|what you(?:'|’)ll do)\b/i);
  const behaviourList = read.behaviours.join(", ");
  const meaning = (s: string) => clipTo(s, 158);
  return {
    role: clipTo(role, 80),
    level: levelFrom(role),
    field: workFrom(job, input.company),
    technicalLabel: tech ? "Technical" : "Role knowledge",
    meanings: {
      cv: meaning(essential ? `Your experience against the essential criteria, e.g. ${lowerFirst(firstSentence(essential).replace(/^(have|be)\s+/i, ""))}.` : `Your path to ${role}: your roles, moves, gaps and the claims on your CV.`),
      competency: meaning(
        behaviourList
          ? `Evidence of the behaviours the advert assesses: ${behaviourList}. What you did and the result.`
          : skills.length
            ? `Times you used the skills the job asks for, such as ${skills.map(skillInSentence).join(", ")}.`
            : "Times you used the skills the job asks for.",
      ),
      technical: meaning(
        duty
          ? `The work itself, e.g. ${lowerFirst(firstSentence(duty))}, and how you’d handle it.`
          : tech
            ? `The tools, methods and decisions ${withArticle(role)} works with day to day.`
            : `The work itself: what ${withArticle(role)} needs to know and do, and how you’d handle it.`,
      ),
      motivation: meaning(read.publicSector ? `Why ${input.company}, why this role and why public service: what it delivers and for whom.` : `Why ${input.company}, why this role, and what you know about their market.`),
      curveball: "What you’d do if…, quick-fire questions and fair curveballs.",
    },
  };
}

/** Success Profiles behaviour questions, three for each behaviour: a core one, then deeper. */
export const BEHAVIOUR_QUESTIONS: Record<CivilServiceBehaviour, string[]> = {
  "Seeing the Big Picture": [
    "Tell me about a time you made sure your work supported wider organisational or government priorities.",
    "Describe a time you used your understanding of the wider context to change the direction of a piece of work.",
    "Tell me about a time you anticipated a long-term issue and planned for it before it became a problem.",
  ],
  "Changing and Improving": [
    "Tell me about a time you identified a better way of doing something and made the change happen.",
    "Describe a time you led or supported a change that people were resistant to. How did you bring them with you?",
    "Tell me about a process improvement you delivered. How did you measure whether it worked?",
  ],
  "Making Effective Decisions": [
    "Tell me about a time you made a decision using evidence from a range of sources.",
    "Describe a difficult decision you made with incomplete information. How did you weigh up the risks?",
    "Tell me about a time you had to explain or defend a decision to people who disagreed with it.",
  ],
  Leadership: [
    "Tell me about a time you set a clear direction for a team and motivated them to deliver it.",
    "Describe a time you championed inclusion or made sure different views in your team were heard.",
    "Tell me about a time you led a team through uncertainty or a difficult period.",
  ],
  "Communicating and Influencing": [
    "Tell me about a time you influenced a senior stakeholder to change their view.",
    "Describe a time you had to communicate complex information to people with different levels of understanding.",
    "Tell me about a time you built consensus between groups with competing priorities.",
  ],
  "Working Together": [
    "Tell me about a time you built a strong working relationship with a team or organisation outside your own.",
    "Describe a time you worked with others to resolve a conflict that was holding up delivery.",
    "Tell me about a time you shared your knowledge or resources to help colleagues achieve a shared goal.",
  ],
  "Developing Self and Others": [
    "Tell me about a time you invested in developing someone in your team.",
    "Describe a time you identified a gap in your own skills and took action to close it.",
    "Tell me about a time you created a learning culture or encouraged others to develop.",
  ],
  "Managing a Quality Service": [
    "Tell me about a time you made sure a service met the needs of the people using it.",
    "Describe a time you improved the quality of a service while working within limited resources.",
    "Tell me about a time you handled a service failure and what you did to stop it happening again.",
  ],
  "Delivering at Pace": [
    "Tell me about a time you delivered high-quality work to a tight deadline.",
    "Describe a time you managed several competing priorities and still delivered what mattered most.",
    "Tell me about a time you kept a project on track when it hit a significant setback.",
  ],
};

/** Strengths questions: what energises you and comes naturally (never STAR). */
export const STRENGTHS_QUESTIONS: string[] = [
  "What kind of work energises you most, and why?",
  "What do you find yourself doing well without having to try too hard?",
  "How do you feel when plans change at the last minute?",
  "Do you prefer to start new things or to finish things off? Why?",
  "What does a really good day at work look like for you?",
  "How do you feel about being responsible for other people’s work?",
  "What tasks do you tend to put off, and why do you think that is?",
];

/** Behaviour and strengths questions to use first in the competency category, round-robin across the named behaviours. */
export function focusedCompetency(n: number, opts: { behaviours?: string[]; strengthsShare?: number }, avoid: string[], difficulty: Difficulty = "medium"): BuiltPlan["questions"] {
  const seen = new Set(avoid.map(normText));
  const out: BuiltPlan["questions"] = [];
  const strengthsN = Math.round(n * Math.min(1, Math.max(0, opts.strengthsShare ?? 0)));
  const tier = difficulty === "easy" ? 0 : difficulty === "hard" ? 2 : 1;
  const behaviours = (opts.behaviours ?? []).filter((b): b is CivilServiceBehaviour => b in BEHAVIOUR_QUESTIONS);
  // Start at the question for this difficulty, then the others, so harder sessions get the deeper questions first.
  const order = [tier, ...[0, 1, 2].filter((x) => x !== tier)];
  for (const k of order) {
    for (const b of behaviours) {
      if (out.length >= n - strengthsN) break;
      const text = BEHAVIOUR_QUESTIONS[b][k];
      if (!text || seen.has(normText(text))) continue;
      seen.add(normText(text));
      out.push({ group: "competency", type: "competency", text, short: clipTo(b, 48), difficulty });
    }
  }
  for (const text of STRENGTHS_QUESTIONS) {
    if (out.filter((q) => q.type === "strengths").length >= strengthsN) break;
    if (seen.has(normText(text))) continue;
    seen.add(normText(text));
    out.push({ group: "competency", type: "strengths", text, short: shortTitle(text), difficulty });
  }
  return out;
}

/** Standard questions for each category and difficulty, with the company and role filled in. */
export function templateBank(company: string, role: string, difficulty: Difficulty = "medium"): Record<QuestionGroup, [ContextType, string][]> {
  const c = company.trim();
  const r = role.trim() || "this role";
  const aRole = `${/^[aeiou]/i.test(r) ? "an" : "a"} ${r}`;
  if (difficulty === "easy") {
    return {
      motivation: [
        ["why-us", `What initially drew you to apply at ${c}?`],
        ["why-us", `Which aspect of being ${aRole} excites you most?`],
        ["why-us", `How would you describe ${c}’s mission to a friend?`],
        ["why-us", "What kind of team culture brings out your best work?"],
        ["tell-me-about-yourself", "What are you hoping to learn in your next role?"],
        ["why-us", `What caught your attention in the ${r} job description?`],
        ["why-us", "What motivates you day to day in this type of work?"],
      ],
      competency: [
        ["competency", "Tell me about a project that went smoothly and what helped it succeed."],
        ["competency", "How do you keep colleagues updated when priorities shift slightly?"],
        ["competency", "Describe a time you helped a teammate solve a tricky problem."],
        ["competency", "Tell me about a piece of feedback you applied straight away."],
        ["competency", "How do you organise your week when several smaller tasks land together?"],
        ["competency", "Tell me about a goal you hit and how you tracked progress."],
        ["competency", "Give an example of working closely with people outside your immediate team."],
      ],
      technical: [
        ["technical", `In plain English, what are the core responsibilities of ${aRole} day to day?`],
        ["technical", "Walk me through a straightforward piece of work you delivered recently."],
        ["technical", "Which simple checks do you run to make sure your work is accurate before sharing it?"],
        ["situational", "How would you explain a key part of your work to someone joining the team this week?"],
        ["technical", "What tools or methods do you rely on most in this area, and why?"],
        ["technical", "How do you verify a customer problem before jumping to a solution?"],
        ["technical", "What is one metric you always check first in a routine weekly review?"],
      ],
      cv: [
        ["competency", "Which role on your CV did you enjoy the most, and why?"],
        ["competency", "Walk me through your most recent role from start to finish."],
        ["competency", "What core strength from your CV would you lean on most at " + c + "?"],
        ["competency", "Tell me about a skill on your CV that you built on the job."],
        ["competency", "What kind of projects have made up most of your recent work?"],
        ["competency", "What are you proudest of achieving in your last role?"],
      ],
      curveball: [
        ["situational", `What would you focus on learning in your first two weeks at ${c}?`],
        ["situational", "If a colleague asked you for help while you were busy, how would you respond?"],
        ["situational", "What is one habit that keeps you calm on a busy day?"],
        ["situational", "How do you prefer to receive constructive feedback from your manager?"],
        ["situational", "What is a product or service you admire, and why does it work well?"],
        ["situational", "If you spotted a small mistake just before a release, what would you do first?"],
        ["situational", "What motivates you when a routine week feels repetitive?"],
      ],
    };
  }
  if (difficulty === "hard") {
    return {
      motivation: [
        ["why-us", `Where is ${c} most exposed competitively over the next two years, and why join knowing that?`],
        ["why-us", `If ${c}’s leadership asked you to bet against a current priority, where would you push back first?`],
        ["why-us", `Why is this ${r} role the highest-leverage move for you right now, rather than a broader remit elsewhere?`],
        ["why-us", `What hard trade-off inside ${c}’s business model will matter most for this team this year?`],
        ["tell-me-about-yourself", "What kind of ambiguity or organisational friction usually breaks strong hires in this role?"],
        ["why-us", `What would make you seriously question taking an offer from ${c} at final stage?`],
        ["why-us", `How do you distinguish sustainable advantage from short-term growth at ${c}?`],
      ],
      competency: [
        ["competency", "Tell me about a flagship decision where senior stakeholders disagreed sharply — what evidence settled it, and what did you give up?"],
        ["competency", "Describe an initiative you shut down despite heavy sunk cost and vocal sponsorship. How did you manage the fallout?"],
        ["competency", "Give an example where you owned an outcome with zero formal authority across conflicting incentives."],
        ["competency", "Tell me about a high-stakes failure where you were directly accountable. What second-order changes did you ship?"],
        ["competency", "Describe a time your numbers contradicted executive intuition. How did you win or adapt without stalling delivery?"],
        ["competency", "Tell me about the hardest performance or boundary conversation you had with a key partner."],
        ["competency", "Walk me through a complex multi-quarter bet where the constraints changed mid-flight."],
      ],
      technical: [
        ["technical", `Diagnose a sudden 15% drop in a critical ${r} metric while top-line volume stays flat: what isolates cause from noise in hour one?`],
        ["technical", "When short-term conversion conflicts with reliability, compliance or margin guardrails, how do you model the net trade-off?"],
        ["technical", "Walk me through a high-risk technical or operational architecture call you owned, including failure modes you accepted."],
        ["situational", "Two urgent regulatory and commercial demands collide 48 hours before launch. What do you delay, ring-fence, or cut?"],
        ["technical", "What leading indicator in your work detects silent degradation before lagging KPIs move?"],
        ["technical", "How do you decide between building in-house capability versus buying or partnering when switching costs are high?"],
        ["technical", "Stress-test your end-to-end measurement design: how could your primary metric look green while customer value drops?"],
      ],
      cv: [
        ["competency", "Take the biggest metric on your CV: separate baseline growth, team luck, and what broke without your intervention."],
        ["competency", "Looking critically at your CV moves, what pattern could make a sceptical panel question your staying power?"],
        ["competency", "Which claim on your CV would be hardest to defend under an audit of the underlying data?"],
        ["competency", "When have you outgrown a role fastest, and what tension did that create before you left?"],
        ["competency", "Tell me about a gap, pivot, or short chapter on your CV in candid detail — no spin."],
        ["competency", "What guardrail or teammate cost paid the price for your biggest CV win?"],
      ],
      curveball: [
        ["situational", "Compliance or engineering flags a structural flaw 48 hours before our biggest launch. What exact call do you make?"],
        ["situational", `A top customer threatens to churn unless we ship a one-off change that breaks ${c}’s core roadmap. How do you handle them?`],
        ["situational", "Every dashboard KPI is green this quarter, yet retention is sliding silently. Where do you investigate first?"],
        ["situational", "You realise three months in that the strategy you endorsed at hiring is flawed. How do you pivot credibly?"],
        ["situational", "Two senior leaders issue mutually exclusive mandates by Friday. Walk me through your next 24 hours."],
        ["situational", `Challenge ${c}’s flagship product right now: what would you rip out and rebuild first?`],
        ["situational", "What blind spot of yours has actually cost a team time or results in the past?"],
      ],
    };
  }
  return {
    motivation: [
      ["why-us", `Why do you want to work at ${c}?`],
      ["why-us", "Why this role, and why now?"],
      ["why-us", `What do you know about ${c} and what we do?`],
      ["why-us", `Who do you see as ${c}’s main competitors, and why would a customer pick us?`],
      ["why-us", "Where do you want to be in three years?"],
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
      ["technical", `How would you measure success in your first 90 days as ${aRole}?`],
      ["technical", "A key number you’re responsible for drops sharply overnight. What do you do first?"],
      ["situational", "What would you do if a senior stakeholder asked for something you thought was wrong?"],
      ["technical", "Explain something complex from your work to someone new to it."],
      ["technical", "Which numbers would you watch most closely in this role, and why?"],
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

/** Up to `n` template questions in a category that aren't already in `avoid`, calibrated for `difficulty`. */
export function templateQuestions(
  company: string,
  role: string,
  group: QuestionGroup,
  n: number,
  avoid: string[],
  difficulty: Difficulty = "medium",
  focus: { behaviours?: string[]; strengthsShare?: number } = {},
): BuiltPlan["questions"] {
  const first = group === "competency" && n > 0 ? focusedCompetency(n, focus, avoid, difficulty) : [];
  const seen = new Set([...avoid, ...first.map((q) => q.text)].map(normText));
  const rest = templateBank(company, role, difficulty)
    [group].filter(([, text]) => !seen.has(normText(text)))
    .slice(0, Math.max(0, n - first.length))
    .map(([type, text]) => ({ group, type, text, short: shortTitle(text), difficulty }));
  return [...first, ...rest];
}

/** Standard questions and a plain understanding of the job, with the company and role filled in. */
export function templatePlan(input: { company: string; role: string; counts: Record<QuestionGroup, number>; interviewerTitle: string; job?: string; site?: string; difficulty?: Difficulty; strengthsShare?: number }): BuiltPlan {
  const c = input.company.trim();
  const job = input.job?.trim() ?? "";
  const skills = skillsIn(job);
  const difficulty = input.difficulty ?? "medium";
  const focus = { behaviours: readAssessment(input.role, job).behaviours, strengthsShare: input.strengthsShare };
  const questions = GROUP_ORDER.flatMap((g) => templateQuestions(c, input.role, g, input.counts[g], [], difficulty, focus));
  return {
    company: c,
    role: input.role.trim(),
    seniority: levelFrom(input.role),
    interviewerTitle: input.interviewerTitle,
    jobSummary: job ? firstSentences(job, 200) : `${input.role.trim() || "A role"} at ${c}. Expect questions on why ${c}, your experience and how you’d approach the work.`,
    skills,
    understanding: templateUnderstanding({ company: c, role: input.role, skills, job }),
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
