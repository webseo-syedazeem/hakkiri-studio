import type { Interview, Question, QuestionGroup } from "@/lib/types";

/**
 * Topic-specific practice drills (e.g. Stakeholder management, Payment fundamentals,
 * Product metrics, Commercial judgement, STAR framework, Technical depth, Curveball).
 * Safe to import in both browser and server modules.
 */

export type TopicId =
  | "stakeholder-management"
  | "payment-fundamentals"
  | "product-metrics"
  | "commercial-judgement"
  | "star"
  | "technical"
  | "curveball";

export interface TopicSpec {
  id: TopicId;
  title: string;
  focusLabel: string;
  subtitle: string;
  instruction: string;
  group: QuestionGroup;
  minutes: number;
  matchPattern: RegExp;
  preferredBankIds: string[];
  questions: Question[];
}

export const DRILL_TOPICS: Record<TopicId, TopicSpec> = {
  "stakeholder-management": {
    id: "stakeholder-management",
    title: "Stakeholder management",
    focusLabel: "Stakeholders",
    subtitle: "Aligning engineering, compliance, operations & commercial teams.",
    instruction:
      "Practising stakeholder management: aligning engineering, compliance, operations and commercial teams, and influencing without authority. Feedback after every answer.",
    group: "competency",
    minutes: 6,
    matchPattern: /\b(stakeholder|engineer|disagree|align|executive|compliance|commercial|influence|push back|cross-functional|competing requests)\b/i,
    preferredBankIds: ["c2", "c3"],
    questions: [
      {
        id: "topic-sm-1",
        group: "competency",
        type: "competency",
        text: "Tell me about a time you disagreed with a senior engineer or tech lead on scope or approach.",
        short: "Disagreeing with engineering",
        drillOnly: true,
      },
      {
        id: "topic-sm-2",
        group: "competency",
        type: "competency",
        text: "Tell me about a time you had to align conflicting priorities across engineering, compliance, and commercial teams.",
        short: "Aligning conflicting teams",
        drillOnly: true,
      },
      {
        id: "topic-sm-3",
        group: "competency",
        type: "competency",
        text: "How do you influence senior stakeholders who disagree with your product direction without relying on formal authority?",
        short: "Influencing without authority",
        drillOnly: true,
      },
      {
        id: "topic-sm-4",
        group: "competency",
        type: "competency",
        text: "Describe a time you had to push back on an urgent commercial or executive request using customer and risk evidence.",
        short: "Pushing back on senior asks",
        drillOnly: true,
      },
    ],
  },
  "payment-fundamentals": {
    id: "payment-fundamentals",
    title: "Payment fundamentals",
    focusLabel: "Payments domain",
    subtitle: "Authorisation, checkout, settlement, chargebacks & fraud controls.",
    instruction:
      "Practising payment fundamentals: card authorisation, checkout flows, settlement, chargebacks and fraud controls. Feedback after every answer.",
    group: "technical",
    minutes: 6,
    matchPattern: /\b(authorisation|authorization|checkout|settlement|chargeback|acquirer|issuer|scheme|payment flow|card payment)\b/i,
    preferredBankIds: ["t4"],
    questions: [
      {
        id: "topic-pf-1",
        group: "technical",
        type: "technical",
        text: "Explain card authorisation to a new hire in plain language.",
        short: "Card authorisation basics",
        drillOnly: true,
      },
      {
        id: "topic-pf-2",
        group: "technical",
        type: "technical",
        text: "Walk me through what happens from the moment a customer taps Pay to when funds settle in a merchant’s account.",
        short: "Payment to settlement flow",
        drillOnly: true,
      },
      {
        id: "topic-pf-3",
        group: "technical",
        type: "technical",
        text: "How would you reduce involuntary card declines and chargebacks without adding unnecessary friction at checkout?",
        short: "Reducing declines & chargebacks",
        drillOnly: true,
      },
    ],
  },
  "product-metrics": {
    id: "product-metrics",
    title: "Product metrics",
    focusLabel: "Metrics & diagnosis",
    subtitle: "Conversion, payment success rate, transaction failures & fraud losses.",
    instruction:
      "Practising product metrics: diagnosing sudden drops, defining payment success metrics, and pairing conversion with risk guardrails. Feedback after every answer.",
    group: "technical",
    minutes: 6,
    matchPattern: /\b(metric|conversion|measure|kpi|funnel|failure rate|success rate|guardrail|drop)\b/i,
    preferredBankIds: ["t1", "t3"],
    questions: [
      {
        id: "topic-pm-1",
        group: "technical",
        type: "technical",
        text: "A key payments metric drops 15% overnight. How do you diagnose the root cause in the first hour?",
        short: "Diagnosing a metric drop",
        drillOnly: true,
      },
      {
        id: "topic-pm-2",
        group: "technical",
        type: "technical",
        text: "How would you measure the end-to-end success of a redesigned checkout and first-payment flow?",
        short: "Measuring checkout success",
        drillOnly: true,
      },
      {
        id: "topic-pm-3",
        group: "technical",
        type: "technical",
        text: "Which guardrail metrics would you pair with conversion rate to ensure short-term growth doesn’t hurt merchant trust or losses?",
        short: "Conversion & guardrails",
        drillOnly: true,
      },
    ],
  },
  "commercial-judgement": {
    id: "commercial-judgement",
    title: "Commercial judgement",
    focusLabel: "Commercial & risk",
    subtitle: "Balancing growth with risk, cost, regulation & customer experience.",
    instruction:
      "Practising commercial judgement: weighing conversion growth against fraud risk, unit economics, build-vs-buy trade-offs and regulation. Feedback after every answer.",
    group: "technical",
    minutes: 6,
    matchPattern: /\b(commercial|fraud|risk|build or buy|margin|revenue|cost|regulation|trade-?off|conversion)\b/i,
    preferredBankIds: ["t2"],
    questions: [
      {
        id: "topic-cj-1",
        group: "technical",
        type: "technical",
        text: "How would you balance checkout conversion against fraud risk if chargeback losses start creeping above target?",
        short: "Conversion vs fraud risk",
        drillOnly: true,
      },
      {
        id: "topic-cj-2",
        group: "technical",
        type: "technical",
        text: "When deciding whether to build or buy a fraud and risk capability, what commercial and operational factors drive your decision?",
        short: "Build vs buy trade-offs",
        drillOnly: true,
      },
      {
        id: "topic-cj-3",
        group: "competency",
        type: "competency",
        text: "Tell me about a time you evaluated competing commercial outcomes and made a tough product trade-off.",
        short: "Evaluating commercial trade-offs",
        drillOnly: true,
      },
    ],
  },
  star: {
    id: "star",
    title: "STAR framework workout",
    focusLabel: "STAR structure",
    subtitle: "Structure behavioural stories with Situation, Task, Action & measurable Result.",
    instruction:
      "Practising the STAR framework: open with concise context, isolate your personal actions (“I”), and finish with measurable impact. Feedback after every answer.",
    group: "competency",
    minutes: 5,
    matchPattern: /\b(tell me about a time|describe a|roadmap|failed|prioritise|ownership)\b/i,
    preferredBankIds: ["c1", "c3", "c4"],
    questions: [
      {
        id: "topic-star-1",
        group: "competency",
        type: "competency",
        text: "Tell me about a time you changed a product roadmap midway through because of new evidence.",
        short: "Changing a roadmap",
        drillOnly: true,
      },
      {
        id: "topic-star-2",
        group: "competency",
        type: "competency",
        text: "Describe a project or launch that failed to hit its goal, what you did personally, and what changed afterwards.",
        short: "A project that failed",
        drillOnly: true,
      },
      {
        id: "topic-star-3",
        group: "competency",
        type: "competency",
        text: "Walk me through your highest-impact product delivery from problem discovery to measurable result.",
        short: "Highest-impact delivery",
        drillOnly: true,
      },
    ],
  },
  technical: {
    id: "technical",
    title: "Technical depth & architecture",
    focusLabel: "Technical depth",
    subtitle: "Architecture choices, idempotency, latency & engineering trade-offs.",
    instruction:
      "Practising technical depth: payment architecture choices, idempotency, latency constraints, and systems trade-offs. Feedback after every answer.",
    group: "technical",
    minutes: 6,
    matchPattern: /\b(architecture|idempotency|latency|api|webhook|retry|build or buy|system|metric drops)\b/i,
    preferredBankIds: ["t1", "t2"],
    questions: [
      {
        id: "topic-tech-1",
        group: "technical",
        type: "technical",
        text: "How do you design payment flows to handle retries, idempotency, and provider latency without double-charging users?",
        short: "Idempotency & reliability",
        drillOnly: true,
      },
      {
        id: "topic-tech-2",
        group: "technical",
        type: "technical",
        text: "How do you work with engineering to weigh short-term product speed against payment reliability and technical debt?",
        short: "Reliability vs delivery speed",
        drillOnly: true,
      },
      {
        id: "topic-tech-3",
        group: "technical",
        type: "technical",
        text: "How would you architect webhook handling and reconciliation so merchant balances always stay accurate after provider outages?",
        short: "Webhooks & reconciliation",
        drillOnly: true,
      },
    ],
  },
  curveball: {
    id: "curveball",
    title: "Curveball & salary questions",
    focusLabel: "Situational & transitions",
    subtitle: "Unexpected scenarios, career transitions & tough closing questions.",
    instruction:
      "Practising curveball & situational questions: stay composed on career transitions, constructive weaknesses, and unexpected prompts. Feedback after every answer.",
    group: "curveball",
    minutes: 5,
    matchPattern: /\b(work on|sell me|badly designed|leave|transition|unexpected|slip)\b/i,
    preferredBankIds: ["v1", "b1", "b3"],
    questions: [
      {
        id: "topic-curv-1",
        group: "curveball",
        type: "situational",
        text: "What would your last manager say is the biggest skill you need to sharpen next?",
        short: "Growth areas",
        drillOnly: true,
      },
      {
        id: "topic-curv-2",
        group: "curveball",
        type: "situational",
        text: "If our engineering lead told you two weeks before launch that a core payments dependency is delayed, what would you do?",
        short: "Late launch slip",
        drillOnly: true,
      },
      {
        id: "topic-curv-3",
        group: "curveball",
        type: "situational",
        text: "Tell me about a financial or consumer product you think is poorly designed, and how you would fix it.",
        short: "Product critique",
        drillOnly: true,
      },
    ],
  },
};

export const CHECKLIST_TOPICS = [
  "payment-fundamentals",
  "product-metrics",
  "commercial-judgement",
  "stakeholder-management",
] as const satisfies readonly TopicId[];

const ALL_TOPIC_QUESTIONS: Question[] = Object.values(DRILL_TOPICS).flatMap((t) => t.questions);

export function getTopic(id: string | undefined | null): TopicSpec | undefined {
  if (!id) return undefined;
  return DRILL_TOPICS[id as TopicId];
}

export function findTopicQuestion(questionId: string): Question | undefined {
  return ALL_TOPIC_QUESTIONS.find((q) => q.id === questionId);
}

export function resolveInterviewQuestion(
  interview: Pick<Interview, "questions"> | undefined,
  questionId: string,
): Question | undefined {
  return interview?.questions.find((q) => q.id === questionId) ?? findTopicQuestion(questionId);
}

/**
 * Selects up to `limit` questions specifically relevant to `topicId`.
 * Picks matching questions from the interview's existing bank first (e.g. "Disagreeing with an engineer"
 * on Halden for Stakeholder management), then fills with curated topic-specific drill questions.
 */
export function topicQuestions(topicId: string, bank: Question[] = [], limit = 4): Question[] {
  const spec = getTopic(topicId);
  if (!spec) return [];

  const pool = bank.filter((q) => !q.slot && !q.retired && !q.pay && !q.drillOnly);
  const chosen: Question[] = [];
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  const add = (q: Question | undefined) => {
    if (!q || seenIds.has(q.id)) return;
    const norm = q.text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (seenTexts.has(norm)) return;
    seenIds.add(q.id);
    seenTexts.add(norm);
    chosen.push(q);
  };

  for (const id of spec.preferredBankIds) {
    if (chosen.length >= limit) break;
    add(pool.find((q) => q.id === id));
  }

  for (const q of pool) {
    if (chosen.length >= limit) break;
    if (spec.matchPattern.test(`${q.text} ${q.short}`)) add(q);
  }

  for (const q of spec.questions) {
    if (chosen.length >= limit) break;
    add(q);
  }

  return chosen.slice(0, limit);
}
