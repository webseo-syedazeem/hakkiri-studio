import type { Answer, FollowUp, Interview, Story, User, Word } from "@/lib/types";
import type { MockRow } from "@/lib/mocks/report";
import { inWords } from "@/lib/format";
import { indexOfPhrase, wordsFromScript } from "@/lib/demo-words";
import { DEMO_TODAY, addDays, londonIso } from "@/lib/dates";
import { PRESETS } from "@/lib/interviews/settings";

export { DEMO_TODAY };

/**
 * Demo data for the prototype: Priya preparing for a Halden interview.
 * Shaped like the real database records, so screens won't change when
 * this file is replaced by API calls (database next).
 */

const day = (n: number) => addDays(DEMO_TODAY, n);

export const user: User = {
  firstName: "Priya",
  initials: "PS",
  trial: { interviewSecondsLeft: 6 * 60, pitchSecondsLeft: 5 * 60 },
};

export const halden: Interview = {
  id: "halden",
  company: "Halden",
  companyInitial: "H",
  companyUrl: "halden.com",
  role: "Senior Product Manager, Payments",
  seniority: "Senior",
  round: "final",
  format: "video",
  date: londonIso(day(5), "10:00"),
  style: "realistic",
  interviewer: { name: "Sam", title: "hiring manager" },
  jobSummary: "A senior product role in payments. Expect technical questions on metrics, risk and trade-offs.",
  skills: ["Payments", "Experimentation", "Fraud and risk", "Stakeholders", "SQL", "Roadmaps"],
  likelyAsks: ["Eight months at Fernway before moving on", "Switching from design to product in 2021"],
  brief: {
    whatTheyDo: "Halden makes payments software for small businesses: card payments, invoices and payouts in one app. The payments team owns checkout and the first payment a new customer makes.",
    whyYou: [
      "At Fernway you fixed the first payment step and took completion from 41% to 58%. That is the problem this team works on.",
      "You grew checkout conversion by 17% at Brightpay, for customers much like Halden’s.",
      "Your move from design into product fits how much Halden talks about a simple app.",
    ],
    toKnow: [
      "Their customers are small businesses, so talk about merchants, not just shoppers.",
      "The job spec puts fraud and risk next to growth. Have a trade-off story ready.",
      "Small product teams own outcomes end to end, so expect questions about ownership.",
    ],
  },
  sources: { cv: "Priya_Shah_CV.pdf", job: "halden.com/careers/senior-product-manager-payments", company: "halden.com" },
  planBy: "demo",
  understanding: {
    role: "Senior Product Manager, Payments",
    level: "Senior",
    field: "payments software for small businesses",
    technicalLabel: "Technical",
    meanings: {
      cv: "Your move from design into product, the eight months at Fernway, and the numbers on your CV.",
      competency: "Times you changed a plan, disagreed with engineering, prioritised, and led without authority.",
      technical: "Payments metrics, fraud and risk trade-offs, build or buy, and how card payments work.",
      motivation: "Why Halden, why payments for small businesses, and why now.",
      curveball: "What you’d do if a launch slipped or a number dropped, plus quick-fire curveballs.",
    },
  },
  settings: { difficulty: "medium", minutes: 30, preset: "balanced", mix: PRESETS.balanced.mix },
  rules: [],
  rebuilds: 0,
  probes: [
    { ask: "Eight months at Fernway before moving on", handle: "Lead with what you delivered there, then why the next move made sense. Two sentences, no apology." },
    { ask: "Switching from design to product in 2021", handle: "Frame it as a step towards owning outcomes, with the Brightpay conversion work as the proof." },
  ],
  questionsToAsk: [
    "When growth and fraud risk pull in different directions, how does the payments team decide?",
    "What would a great first six months look like in this role?",
    "How do product and engineering share decisions on the payments roadmap?",
  ],
  gaps: [{ skill: "Balancing growth and risk", question: "Tell me about a time you had to balance growth against risk or compliance." }],
  /** Answers practised before this prototype's data starts. */
  answersPractised: 14,
  groupScores: { motivation: 4.4, competency: 3.6, technical: 2.4, cv: 4.1, curveball: 3.2 },
  groupCounts: { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 }, // counted from the questions below
  questions: [
    { id: "open", group: "motivation", type: "tell-me-about-yourself", text: "Tell me about yourself.", short: "Tell me about yourself", slot: "opening" },
    // Medium (standard hiring-manager baseline)
    { id: "m1", group: "motivation", type: "why-us", text: "Why do you want to work at Halden?", short: "Why Halden", lastScore: 4.6, difficulty: "medium" },
    { id: "m2", group: "motivation", type: "why-us", text: "Why this role, and why now?", short: "Why this role, why now", lastScore: 4.3, difficulty: "medium" },
    { id: "m3", group: "motivation", type: "why-us", text: "What do you know about our payments product?", short: "Halden’s payments product", lastScore: 4.2, difficulty: "medium" },
    { id: "m4", group: "motivation", type: "tell-me-about-yourself", text: "Where do you want to be in three years?", short: "Three years from now", difficulty: "medium" },
    { id: "c1", group: "competency", type: "competency", text: "Tell me about a time you changed a roadmap because of something you learned late.", short: "Changing the roadmap", lastScore: 3.7, difficulty: "medium" },
    { id: "c2", group: "competency", type: "competency", text: "Tell me about a disagreement with an engineer.", short: "Disagreeing with an engineer", lastScore: 3.4, difficulty: "medium" },
    { id: "c3", group: "competency", type: "competency", text: "How do you prioritise competing requests?", short: "Competing requests", lastScore: 3.8, difficulty: "medium" },
    { id: "c4", group: "competency", type: "competency", text: "Describe a project that failed.", short: "A project that failed", difficulty: "medium" },
    { id: "t1", group: "technical", type: "technical", text: "A key payments metric drops 15% overnight. What do you do first?", short: "A payments metric drops", lastScore: 2.1, difficulty: "medium" },
    { id: "t2", group: "technical", type: "technical", text: "Would you build or buy a fraud-detection tool?", short: "Build or buy fraud detection", lastScore: 2.6, difficulty: "medium" },
    { id: "t3", group: "technical", type: "technical", text: "How would you measure the success of a new payment flow?", short: "Measuring a payment flow", difficulty: "medium" },
    { id: "t4", group: "technical", type: "technical", text: "Explain card authorisation to a new hire.", short: "Card authorisation", difficulty: "medium" },
    { id: "v1", group: "cv", type: "competency", text: "Why did you leave Fernway after eight months?", short: "Leaving Fernway", lastScore: 4.0, difficulty: "medium" },
    { id: "v2", group: "cv", type: "competency", text: "You moved from design to product. Why?", short: "Design to product", lastScore: 4.4, difficulty: "medium" },
    { id: "v3", group: "cv", type: "competency", text: "Your CV says you grew conversion 17%. How?", short: "Growing conversion 17%", lastScore: 3.9, difficulty: "medium" },
    { id: "b1", group: "curveball", type: "situational", text: "What would your last manager say you need to work on?", short: "What to work on", lastScore: 3.1, difficulty: "medium" },
    { id: "b2", group: "curveball", type: "situational", text: "Sell me Halden in 30 seconds.", short: "Selling Halden", lastScore: 3.4, difficulty: "medium" },
    { id: "b3", group: "curveball", type: "situational", text: "What’s a product you think is badly designed?", short: "A badly designed product", difficulty: "medium" },
    // Easy (accessible, foundational, single-idea prompts)
    { id: "me1", group: "motivation", type: "why-us", text: "What caught your eye about helping small businesses with payments at Halden?", short: "Small business mission", difficulty: "easy" },
    { id: "me2", group: "motivation", type: "why-us", text: "What kind of product team environment do you do your best work in?", short: "Ideal team environment", difficulty: "easy" },
    { id: "me3", group: "motivation", type: "why-us", text: "Which part of Halden’s app would you be most excited to work on first?", short: "Area of interest", difficulty: "easy" },
    { id: "ce1", group: "competency", type: "competency", text: "Tell me about a product launch that went well and what made it smooth.", short: "Smooth product launch", difficulty: "easy" },
    { id: "ce2", group: "competency", type: "competency", text: "How do you usually keep engineering and design stakeholders aligned week to week?", short: "Weekly stakeholder alignment", difficulty: "easy" },
    { id: "ce3", group: "competency", type: "competency", text: "Tell me about a piece of customer feedback that shaped a feature you built.", short: "Using customer feedback", difficulty: "easy" },
    { id: "te1", group: "technical", type: "technical", text: "In plain terms, what happens between a customer tapping Pay and a small business getting settled?", short: "Checkout to settlement", difficulty: "easy" },
    { id: "te2", group: "technical", type: "technical", text: "What makes a merchant’s very first payment experience feel simple and trustworthy?", short: "First payment experience", difficulty: "easy" },
    { id: "te3", group: "technical", type: "technical", text: "How do you like to partner with data analysts or SQL when exploring a drop in activation?", short: "Working with payment data", difficulty: "easy" },
    { id: "ve1", group: "cv", type: "competency", text: "Which achievement across Brightpay and Fernway did you enjoy working on most?", short: "Favourite achievement", difficulty: "easy" },
    { id: "ve2", group: "cv", type: "competency", text: "How has your earlier background in design helped you as a product manager?", short: "Design background strengths", difficulty: "easy" },
    { id: "ve3", group: "cv", type: "competency", text: "What did you learn about small-business customers during your time at Brightpay?", short: "Learning from Brightpay", difficulty: "easy" },
    { id: "be1", group: "curveball", type: "situational", text: "What would you focus on learning in your very first two weeks at Halden?", short: "First two weeks", difficulty: "easy" },
    { id: "be2", group: "curveball", type: "situational", text: "If a launch looked slightly behind schedule, how would you communicate early with the team?", short: "Communicating timeline shifts", difficulty: "easy" },
    { id: "be3", group: "curveball", type: "situational", text: "What is one fintech or payments app you admire, and why?", short: "Admired payments product", difficulty: "easy" },
    // Hard (probing, multi-constraint, senior trade-off & CV-stress-test prompts)
    { id: "mh1", group: "motivation", type: "why-us", text: "Small-business payments is crowded and margin-compressed — where can Halden credibly win over the next three years?", short: "Halden’s defensible edge", difficulty: "hard" },
    { id: "mh2", group: "motivation", type: "why-us", text: "If Halden asked you to halve merchant onboarding drop-off without raising fraud losses, what would make you hesitate to take that bet?", short: "Sceptical view on onboarding", difficulty: "hard" },
    { id: "mh3", group: "motivation", type: "why-us", text: "What strategic risk in Halden’s core SMB payments model do you think leadership might be underestimating?", short: "Strategic risk at Halden", difficulty: "hard" },
    { id: "ch1", group: "competency", type: "competency", text: "Tell me about an executive escalation where commercial, risk and engineering stakeholders wanted incompatible outcomes — what metric broke the tie?", short: "Breaking an executive deadlock", difficulty: "hard" },
    { id: "ch2", group: "competency", type: "competency", text: "Give an example where you killed a flagship initiative despite heavy sunk cost and senior backing. How did you handle the pushback?", short: "Killing a flagship project", difficulty: "hard" },
    { id: "ch3", group: "competency", type: "competency", text: "Describe the toughest stakeholder conflict you owned personally when hard data contradicted your sponsor’s intuition.", short: "Data vs senior intuition", difficulty: "hard" },
    { id: "th1", group: "technical", type: "technical", text: "Auth rates fall 400bps for high-margin SMB cohorts while chargebacks spike in parallel — how do you isolate issuer declines from fraud rules in hour one?", short: "Auth drop vs fraud spike", difficulty: "hard" },
    { id: "th2", group: "technical", type: "technical", text: "Walk me through how you’d design idempotency, retry backoff and ledger reconciliation across two acquirers without double-settling merchants.", short: "Multi-acquirer reconciliation", difficulty: "hard" },
    { id: "th3", group: "technical", type: "technical", text: "When tuning 3DS step-up thresholds, how do you model the net LTV trade-off between false declines and recoverable chargeback cost?", short: "3DS vs LTV modelling", difficulty: "hard" },
    { id: "th4", group: "technical", type: "technical", text: "What architecture or webhook failure mode in first-payment activation is hardest to detect before merchants churn?", short: "Silent activation failures", difficulty: "hard" },
    { id: "vh1", group: "cv", type: "competency", text: "At Fernway, completion jumped from 41% to 58% during an eight-month stint — how much was seasonality or funnel mix versus your specific change?", short: "Stress-testing the 41%→58%", difficulty: "hard" },
    { id: "vh2", group: "cv", type: "competency", text: "Hold on: two roles of eight months to two years is brief for a Senior PM — why should Halden bet you’ll stay for a full multi-year cycle?", short: "Tenure & commitment probe", difficulty: "hard" },
    { id: "vh3", group: "cv", type: "competency", text: "At Brightpay you claim 17% checkout conversion lift — what guardrail metric degraded as a result, and how would you defend it to Finance?", short: "Trade-off behind the 17%", difficulty: "hard" },
    { id: "bh1", group: "curveball", type: "situational", text: "Compliance flags a settlement edge case 48 hours before our biggest seasonal peak. What do you delay, cap, or ship anyway?", short: "48h launch compliance call", difficulty: "hard" },
    { id: "bh2", group: "curveball", type: "situational", text: "A top-5 merchant threatens to churn unless we ship a bespoke payout flow that undermines our core multi-tenant roadmap. What’s your call?", short: "Key merchant ultimatum", difficulty: "hard" },
    { id: "bh3", group: "curveball", type: "situational", text: "You inherit a payments roadmap where every KPI is green on paper, yet net merchant retention is sliding. Where do you look first?", short: "Green KPIs, sliding NRR", difficulty: "hard" },
    { id: "close", group: "curveball", type: "questions-for-us", text: "That’s everything from me. What questions do you have for us?", short: "Your questions for them", slot: "closing" },
  ],
};

for (const q of halden.questions) if (!q.slot) halden.groupCounts[q.group] += 1;

export const stories: Story[] = [
  { id: "s1", title: "Pausing onboarding to fix payments", source: "Fernway, 2023", parts: { situation: true, task: true, action: true, result: true }, fits: 9, useFor: ["Changing the roadmap", "A payments metric drops"] },
  { id: "s2", title: "Disagreeing with engineering on fraud rules", source: "Fernway, 2023", parts: { situation: true, task: true, action: true, result: false }, fits: 6, useFor: ["Disagreeing with an engineer", "Build or buy fraud detection"] },
  { id: "s3", title: "Growing checkout conversion by 17%", source: "Brightpay, 2021", parts: { situation: true, task: true, action: true, result: true }, fits: 7, useFor: ["Growing conversion 17%", "Measuring a payment flow"] },
  { id: "s4", title: "Moving from design into product", source: "Brightpay, 2021", parts: { situation: true, task: true, action: false, result: false }, fits: 4, useFor: ["Design to product"] },
  { id: "s5", title: "A launch that missed its date", source: "Brightpay, 2022", parts: { situation: true, task: true, action: false, result: true }, fits: 5, useFor: ["A project that failed"] },
  { id: "s6", title: "Leading a team of five through a reorg", source: "Fernway, 2024", parts: { situation: true, task: true, action: true, result: true }, fits: 6, useFor: ["Competing requests"] },
];

halden.stories = stories;


// ---------------------------------------------------------------------------
// One recorded answer, with word timings as speech-to-text would return them.
// {braces} mark fillers; a filler phrase like {you know} counts once.
// ---------------------------------------------------------------------------



const roadmapWords = wordsFromScript([
  {
    start: 0,
    end: 22,
    text: "So, {um}, at my last company, Fernway, I was the product manager for onboarding, and we were about three months into building a completely new onboarding flow for new customers. We’d planned it for the whole quarter, and {like}, design had already finished most of the screens, and engineering had started on the first part.",
  },
  {
    start: 24,
    end: 50,
    text: "Then in the second month our support team flagged something odd. They said most of the drop-offs they were hearing about weren’t happening in onboarding at all. They were happening at the first payment, when people added a card and tried to pay for the first time. So we looked at the data together and it was true, about 60% of new users were dropping at the payment step.",
  },
  {
    start: 52,
    end: 78,
    text: "I took that to my director and we, {um}, agreed to pause onboarding and move two engineers onto payments for six weeks. It was hard, because {you know}, the design team had put a lot into it, and some of them felt we were throwing their work away, so there were a few difficult conversations along the way.",
  },
  {
    start: 80,
    end: 108,
    text: "In the end, payment completion went up from 41% to 58% in six weeks, which was the biggest jump the team had seen that year. We picked onboarding back up the next quarter, and because the payment step was fixed by then, the new onboarding flow actually performed better than we’d expected when it launched.",
  },
]);

const decisionStart = indexOfPhrase(roadmapWords, "I took that to my director");
const decisionEnd = indexOfPhrase(roadmapWords, "for six weeks.", decisionStart) + 2;
const resultStart = indexOfPhrase(roadmapWords, "payment completion went up");
const resultEnd = indexOfPhrase(roadmapWords, "six weeks", resultStart) + 1;
const hardEnd = indexOfPhrase(roadmapWords, "along the way.") + 2;
const weCount = roadmapWords.filter((w) => /^we('|’)?d?[,.]?$/i.test(w.text)).length;

// The reply to Sam's follow-up on the roadmap answer (design screens 5 and 7).
export const followUpWords = wordsFromScript([
  { start: 0, end: 14, text: "Support flagged it, but I was the one who, {um}, pulled the funnel data and found the drop at the payment step." },
  { start: 15, end: 29, text: "Then we wrote up the case together, and we took it to my director, and we agreed the plan in that meeting." },
  { start: 31, end: 41, text: "So I’d say I started it, but it was, {you know}, a team decision in the end." },
]);
const fuWeStart = indexOfPhrase(followUpWords, "we agreed the plan");
const fuWeEnd = indexOfPhrase(followUpWords, "that meeting.", fuWeStart) + 1;

export const roadmapFollowUp: FollowUp = {
  kind: "ownership",
  question: "You said “we agreed to pause onboarding”. What was your part in that decision?",
  words: followUpWords,
  scores: { content: 3, structure: 2, delivery: null },
  tripped: "Back to “we” again",
  note: {
    tone: "fix",
    title: "Keep it to your part",
    body: "You started with what you found, then the decision went back to “we”. Say what you proposed and who decided.",
  },
  highlight: { kind: "late", from: fuWeStart, to: fuWeEnd },
};

export const roadmapAnswer: Answer = {
  id: "a-roadmap",
  interviewId: "halden",
  questionId: "c1",
  questionNumber: 3,
  questionsInMock: 6,
  words: roadmapWords,
  pointWordIndex: decisionStart,
  highlights: [
    { kind: "late", from: decisionStart, to: decisionEnd },
    { kind: "good", from: resultStart, to: resultEnd },
  ],
  notes: [
    { id: 1, tone: "fix", title: "Lead with the decision", body: "It arrives at 0:52. Say what you did first, then why.", pinAfter: decisionEnd },
    { id: 2, tone: "fix", title: "Say what you did", body: `“We” ${inWords(weCount)} times. Interviewers listen for your part: “I proposed”, “I moved”.`, pinAfter: hardEnd },
    { id: 3, tone: "strength", title: "Strong result", body: "Numbers and a timeframe. Keep it exactly as it is.", pinAfter: resultEnd },
  ],
  scores: { content: 4, structure: 3, delivery: null },
  previousOverall: 3.1,
  strength: "A specific result with numbers and a timeframe.",
  oneFix: "Open with the decision, then the reason.",
  strongerLengthSec: 81,
  strongerVersion: [
    { start: 0, text: "I paused a quarter’s roadmap halfway through, because the data showed we were fixing the wrong problem.", highlight: true },
    { start: 8, text: "I was leading onboarding at Fernway, and we were two months into a redesign when support flagged that new users weren’t leaving during onboarding. They were leaving at their first payment. I checked the funnel myself: 60% dropped at that one step." },
    { start: 31, text: "I took the numbers to my director with a proposal: pause onboarding, move two engineers onto payments for six weeks, and keep the finished designs for next quarter. I also met the design team first, so they heard it from me." },
    { start: 58, text: "Payment completion went from 41% to 58% in those six weeks. We shipped the new onboarding the quarter after, on top of a payment step that worked." },
  ],
  followUps: [roadmapFollowUp],
};

export const answers = [roadmapAnswer];

export function getAnswer(id: string) {
  return answers.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Priya's last interview (design screen 7). Question 3 is the roadmap answer
// above; the other rows are summaries, as the report stores them.
// ---------------------------------------------------------------------------

export const demoMock = {
  id: "demo-full",
  interviewId: "halden",
  kind: "interview" as const,
  status: "done" as const,
  settings: { difficulty: "medium" as const, minutes: 30 as const, preset: "balanced" as const, mix: PRESETS.balanced.mix },
  questionIds: ["m1", "m2", "c1", "t1", "v1", "b1"],
  askedIds: ["m1", "m2", "c1", "t1", "v1", "b1"],
  style: "realistic" as const,
  startedAt: londonIso(day(-1), "11:05"),
  finishedAt: londonIso(day(-1), "11:29"),
  previous: { score: 3.2, label: "your first mock" },
  /** Rows 1, 2, 4, 5 and 6; row 3 comes from roadmapAnswer. */
  rows: [
    { number: 1, questionId: "m1", question: "Why do you want to work at Halden?", group: "motivation", lengthSec: 84, overall: 4.2, pointFirst: true, lengthStatus: "over", fillerCount: 2, we: 1, i: 9, followUps: [] },
    { number: 2, questionId: "m2", question: "Why this role, and why now?", group: "motivation", lengthSec: 65, overall: 4.5, pointFirst: true, lengthStatus: "in", fillerCount: 1, we: 0, i: 7, followUps: [] },
    {
      number: 4,
      questionId: "t1",
      question: "A key payments metric drops 15% overnight. What do you do first?",
      group: "technical",
      lengthSec: 172,
      overall: 2.6,
      pointFirst: false,
      lengthStatus: "in",
      fillerCount: 6,
      we: 1,
      i: 8,
      followUps: [{ question: "What if the data team says it’s a tracking bug?", kind: "technical", lengthSec: 70, overall: 2.2, structure: 2, tripped: "Changed your first step", we: 0, i: 4 }],
    },
    { number: 5, questionId: "v1", question: "Why did you leave Fernway after eight months?", group: "cv", lengthSec: 58, overall: 4.0, pointFirst: true, lengthStatus: "under", fillerCount: 1, we: 0, i: 6, followUps: [] },
    { number: 6, questionId: "b1", question: "What would your last manager say you need to work on?", group: "curveball", lengthSec: 75, overall: 3.1, pointFirst: true, lengthStatus: "in", fillerCount: 3, we: 1, i: 6, followUps: [] },
  ] satisfies MockRow[] as MockRow[],
};
