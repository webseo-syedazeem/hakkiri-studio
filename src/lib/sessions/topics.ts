import type { Interview, Question, QuestionGroup } from "@/lib/types";
import type { Difficulty } from "@/lib/interviews/settings";
import { matchesDifficulty } from "./pick";

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
        id: "topic-sm-e1",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "How do you keep engineering and commercial stakeholders updated when timelines shift slightly?",
        short: "Keeping stakeholders aligned",
        drillOnly: true,
      },
      {
        id: "topic-sm-e2",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "Tell me about a time you partnered smoothly with an engineer to clarify requirements.",
        short: "Partnering with engineers",
        drillOnly: true,
      },
      {
        id: "topic-sm-e3",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "How do you prepare before a prioritisation meeting with competing stakeholder requests?",
        short: "Preparing for stakeholder reviews",
        drillOnly: true,
      },
      {
        id: "topic-sm-1",
        group: "competency",
        type: "competency",
        difficulty: "medium",
        text: "Tell me about a time you disagreed with a senior engineer or tech lead on scope or approach.",
        short: "Disagreeing with engineering",
        drillOnly: true,
      },
      {
        id: "topic-sm-2",
        group: "competency",
        type: "competency",
        difficulty: "medium",
        text: "Tell me about a time you had to align conflicting priorities across engineering, compliance, and commercial teams.",
        short: "Aligning conflicting teams",
        drillOnly: true,
      },
      {
        id: "topic-sm-3",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "How do you influence senior stakeholders who disagree with your product direction without relying on formal authority?",
        short: "Influencing without authority",
        drillOnly: true,
      },
      {
        id: "topic-sm-4",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Describe a time you had to push back on an urgent commercial or executive request using customer and risk evidence.",
        short: "Pushing back on senior asks",
        drillOnly: true,
      },
      {
        id: "topic-sm-h3",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Tell me about a time competing executive stakeholders deadlocked your launch — how did you force alignment and handle the dissenters?",
        short: "Breaking stakeholder deadlocks",
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
        id: "topic-pf-e1",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "In simple terms, what is the difference between payment authorisation and settlement?",
        short: "Authorisation vs settlement",
        drillOnly: true,
      },
      {
        id: "topic-pf-e2",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "What basic steps happen when a customer enters card details and completes checkout?",
        short: "Basic checkout flow",
        drillOnly: true,
      },
      {
        id: "topic-pf-e3",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "Why do small businesses care closely about payout timing and chargebacks?",
        short: "Payouts & chargeback basics",
        drillOnly: true,
      },
      {
        id: "topic-pf-1",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "Explain card authorisation to a new hire in plain language.",
        short: "Card authorisation basics",
        drillOnly: true,
      },
      {
        id: "topic-pf-2",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "Walk me through what happens from the moment a customer taps Pay to when funds settle in a merchant’s account.",
        short: "Payment to settlement flow",
        drillOnly: true,
      },
      {
        id: "topic-pf-3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "How would you reduce involuntary card declines and chargebacks without adding unnecessary friction at checkout?",
        short: "Reducing declines & chargebacks",
        drillOnly: true,
      },
      {
        id: "topic-pf-h2",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "If soft-decline retries jump on debit cards from one issuing bank, how would you diagnose network tokens vs 3DS challenges?",
        short: "Issuer soft-decline diagnosis",
        drillOnly: true,
      },
      {
        id: "topic-pf-h3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "How do you structure dispute evidence automation and scheme fee recovery for high-frequency SMB chargebacks?",
        short: "Chargeback & scheme strategy",
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
        id: "topic-pm-e1",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "What are the main funnel metrics you track from starting checkout to payment completion?",
        short: "Checkout funnel metrics",
        drillOnly: true,
      },
      {
        id: "topic-pm-e2",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "If checkout conversion dipped slightly this week, what first two slices of data would you check?",
        short: "First conversion checks",
        drillOnly: true,
      },
      {
        id: "topic-pm-e3",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "How do you communicate key product metrics clearly to non-technical teammates?",
        short: "Sharing metrics clearly",
        drillOnly: true,
      },
      {
        id: "topic-pm-1",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "A key payments metric drops 15% overnight. How do you diagnose the root cause in the first hour?",
        short: "Diagnosing a metric drop",
        drillOnly: true,
      },
      {
        id: "topic-pm-2",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "How would you measure the end-to-end success of a redesigned checkout and first-payment flow?",
        short: "Measuring checkout success",
        drillOnly: true,
      },
      {
        id: "topic-pm-3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "Which guardrail metrics would you pair with conversion rate to ensure short-term growth doesn’t hurt merchant trust or losses?",
        short: "Conversion & guardrails",
        drillOnly: true,
      },
      {
        id: "topic-pm-h2",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "An A/B test raises first-payment completion by 4% but nudges 60-day dispute rate up 12bps — how do you model the go/no-go call?",
        short: "LTV vs dispute experiment call",
        drillOnly: true,
      },
      {
        id: "topic-pm-h3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "Your headline payment success rate looks green all month, yet active SMB cohort volume is shrinking — where is the measurement blind spot?",
        short: "Blind spots in green KPIs",
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
        id: "topic-cj-e1",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "Why do payments companies have to balance faster merchant onboarding with fraud checks?",
        short: "Onboarding vs risk balance",
        drillOnly: true,
      },
      {
        id: "topic-cj-e2",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "What simple pros and cons would you compare before buying a third-party tool versus building it?",
        short: "Simple build vs buy pros/cons",
        drillOnly: true,
      },
      {
        id: "topic-cj-e3",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "Tell me about a time customer value and delivery cost had to be weighed carefully on a feature.",
        short: "Value vs delivery cost",
        drillOnly: true,
      },
      {
        id: "topic-cj-1",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "How would you balance checkout conversion against fraud risk if chargeback losses start creeping above target?",
        short: "Conversion vs fraud risk",
        drillOnly: true,
      },
      {
        id: "topic-cj-2",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "When deciding whether to build or buy a fraud and risk capability, what commercial and operational factors drive your decision?",
        short: "Build vs buy trade-offs",
        drillOnly: true,
      },
      {
        id: "topic-cj-3",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Tell me about a time you evaluated competing commercial outcomes and made a tough product trade-off.",
        short: "Evaluating commercial trade-offs",
        drillOnly: true,
      },
      {
        id: "topic-cj-h2",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "Our card scheme fees rise 35bps on micro-transactions — would you absorb the margin hit, re-tier pricing, or steer merchants to bank-to-bank rails?",
        short: "Scheme fee margin response",
        drillOnly: true,
      },
      {
        id: "topic-cj-h3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "Where do you cap manual underwriting cost per SMB merchant when projected first-year revenue barely covers KYC review?",
        short: "KYC unit economics",
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
        id: "topic-star-e1",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "Tell me about a milestone you delivered on time and the personal steps you took to keep it on track.",
        short: "Delivering on time",
        drillOnly: true,
      },
      {
        id: "topic-star-e2",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "Give an example of a customer pain point you spotted and turned into a simple product improvement.",
        short: "Fixing a customer pain point",
        drillOnly: true,
      },
      {
        id: "topic-star-e3",
        group: "competency",
        type: "competency",
        difficulty: "easy",
        text: "Describe a time you took ownership of an unclear task and saw it through to completion.",
        short: "Owning an unclear task",
        drillOnly: true,
      },
      {
        id: "topic-star-1",
        group: "competency",
        type: "competency",
        difficulty: "medium",
        text: "Tell me about a time you changed a product roadmap midway through because of new evidence.",
        short: "Changing a roadmap",
        drillOnly: true,
      },
      {
        id: "topic-star-2",
        group: "competency",
        type: "competency",
        difficulty: "medium",
        text: "Describe a project or launch that failed to hit its goal, what you did personally, and what changed afterwards.",
        short: "A project that failed",
        drillOnly: true,
      },
      {
        id: "topic-star-3",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Walk me through your highest-impact product delivery from problem discovery to measurable result.",
        short: "Highest-impact delivery",
        drillOnly: true,
      },
      {
        id: "topic-star-h2",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Tell me about a multi-quarter turnaround where early metrics looked bad — what did you kill, change, and measure?",
        short: "Turning around a failing bet",
        drillOnly: true,
      },
      {
        id: "topic-star-h3",
        group: "competency",
        type: "competency",
        difficulty: "hard",
        text: "Describe a time you made an unpopular irreversible product call under time pressure and owned the aftermath.",
        short: "Unpopular high-stakes call",
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
        id: "topic-tech-e1",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "Why do payments teams use webhooks alongside synchronous API responses when confirming transactions?",
        short: "Webhooks vs API responses",
        drillOnly: true,
      },
      {
        id: "topic-tech-e2",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "How do you translate an engineering constraint like API latency into user experience goals?",
        short: "Latency & user experience",
        drillOnly: true,
      },
      {
        id: "topic-tech-e3",
        group: "technical",
        type: "technical",
        difficulty: "easy",
        text: "What happens from a merchant’s point of view when a mobile payment times out briefly during submission?",
        short: "Payment timeouts cleanly",
        drillOnly: true,
      },
      {
        id: "topic-tech-1",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "How do you design payment flows to handle retries, idempotency, and provider latency without double-charging users?",
        short: "Idempotency & reliability",
        drillOnly: true,
      },
      {
        id: "topic-tech-2",
        group: "technical",
        type: "technical",
        difficulty: "medium",
        text: "How do you work with engineering to weigh short-term product speed against payment reliability and technical debt?",
        short: "Reliability vs delivery speed",
        drillOnly: true,
      },
      {
        id: "topic-tech-3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "How would you architect webhook handling and reconciliation so merchant balances always stay accurate after provider outages?",
        short: "Webhooks & reconciliation",
        drillOnly: true,
      },
      {
        id: "topic-tech-h2",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "If your primary acquirer degrades with 12s p99 latency at peak checkout, how do you design failover without double-auths or ledger drift?",
        short: "Multi-acquirer failover",
        drillOnly: true,
      },
      {
        id: "topic-tech-h3",
        group: "technical",
        type: "technical",
        difficulty: "hard",
        text: "How do you evaluate eventual consistency versus double-entry ACID guarantees when designing instant SMB merchant payouts?",
        short: "Ledger consistency & payouts",
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
        id: "topic-curv-e1",
        group: "curveball",
        type: "situational",
        difficulty: "easy",
        text: "What motivates you when a project scope shifts unexpectedly during a sprint?",
        short: "Adapting to scope shifts",
        drillOnly: true,
      },
      {
        id: "topic-curv-e2",
        group: "curveball",
        type: "situational",
        difficulty: "easy",
        text: "How do you frame your move across roles or companies positively in two clear sentences?",
        short: "Explaining career transitions",
        drillOnly: true,
      },
      {
        id: "topic-curv-e3",
        group: "curveball",
        type: "situational",
        difficulty: "easy",
        text: "What is one area of your craft you have deliberately improved over the past year?",
        short: "Intentional skill growth",
        drillOnly: true,
      },
      {
        id: "topic-curv-1",
        group: "curveball",
        type: "situational",
        difficulty: "medium",
        text: "What would your last manager say is the biggest skill you need to sharpen next?",
        short: "Growth areas",
        drillOnly: true,
      },
      {
        id: "topic-curv-2",
        group: "curveball",
        type: "situational",
        difficulty: "medium",
        text: "If our engineering lead told you two weeks before launch that a core payments dependency is delayed, what would you do?",
        short: "Late launch slip",
        drillOnly: true,
      },
      {
        id: "topic-curv-3",
        group: "curveball",
        type: "situational",
        difficulty: "hard",
        text: "Tell me about a financial or consumer product you think is poorly designed, and how you would fix it.",
        short: "Product critique",
        drillOnly: true,
      },
      {
        id: "topic-curv-h2",
        group: "curveball",
        type: "situational",
        difficulty: "hard",
        text: "Two executives give you contradictory targets for Q1 — revenue growth vs compliance hardening — with equal authority. What do you do tomorrow?",
        short: "Conflicting executive mandates",
        drillOnly: true,
      },
      {
        id: "topic-curv-h3",
        group: "curveball",
        type: "situational",
        difficulty: "hard",
        text: "Critique our pitch as if you were a sceptical competitor trying to win Halden’s best merchants away this quarter.",
        short: "Competitor tear-down",
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

export interface TopicPickOptions {
  limit?: number;
  lastAsked?: Map<string, string>;
  difficulty?: Difficulty;
}

/**
 * Selects up to `limit` questions specifically relevant to `topicId`.
 * Filters strictly by difficulty when provided (so Easy never mixes into Hard),
 * puts unseen questions first based on `lastAsked`, and only recycles older
 * questions if every unseen question in that topic & difficulty has been used.
 */
export function topicQuestions(topicId: string, bank: Question[] = [], optsOrLimit: number | TopicPickOptions = 4): Question[] {
  const spec = getTopic(topicId);
  if (!spec) return [];

  const opts: TopicPickOptions = typeof optsOrLimit === "number" ? { limit: optsOrLimit } : optsOrLimit;
  const limit = opts.limit ?? 4;
  const { lastAsked, difficulty } = opts;

  const pool = bank.filter(
    (q) => !q.slot && !q.retired && !q.pay && !q.drillOnly && (!difficulty || matchesDifficulty(q, difficulty)),
  );
  const curated = spec.questions.filter((q) => !difficulty || matchesDifficulty(q, difficulty));

  const preferred = spec.preferredBankIds
    .map((id) => pool.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));
  const matched = pool.filter((q) => spec.matchPattern.test(`${q.text} ${q.short}`));
  const allCandidates = [...preferred, ...matched, ...curated];

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

  // Pass 1: unseen questions first
  for (const q of allCandidates) {
    if (chosen.length >= limit) break;
    if (lastAsked?.has(q.id)) continue;
    add(q);
  }

  // Pass 2: if all unseen questions in this topic & difficulty are exhausted, bring back oldest-asked
  if (chosen.length < limit && lastAsked) {
    const heard = allCandidates
      .filter((q) => lastAsked.has(q.id))
      .sort((a, b) => (lastAsked.get(a.id) ?? "").localeCompare(lastAsked.get(b.id) ?? ""));
    for (const q of heard) {
      if (chosen.length >= limit) break;
      add(q);
    }
  }

  return chosen.slice(0, limit);
}
