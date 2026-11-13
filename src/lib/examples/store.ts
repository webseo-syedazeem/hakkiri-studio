"use client";

export interface InterviewExample {
  id: string;
  title: string;
  question: string;
  answer: string;
  competency: string;
  role: string;
  interviewType: string;
  tags: string[];
  isFavorite: boolean;
  isStarStructure: boolean;
  createdAt: string;
}

const STORAGE_KEY = "hk_interview_examples";

export const DEFAULT_EXAMPLES: InterviewExample[] = [
  {
    id: "ex-1",
    title: "Led a cross-functional project to launch a digital service",
    question: "Tell me about a time you led a complex project from conception through delivery.",
    answer: "Situation: Our department faced delays in public-facing submissions. Task: I was tasked with leading a cross-functional team of 12 across policy, tech, and operations to deliver a digital workflow. Action: I established daily standups, aligned roadmaps with senior stakeholders, and resolved inter-team bottlenecks. Result: We launched 3 weeks ahead of schedule, reducing processing time by 42%.",
    competency: "Leadership",
    role: "Senior Adviser / Product Lead",
    interviewType: "Competency",
    tags: ["Leadership", "Stakeholder management", "Delivery"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "ex-2",
    title: "Resolved a high-risk issue under time pressure",
    question: "Describe an urgent, high-stakes situation where you had to act with incomplete data.",
    answer: "Situation: A critical compliance discrepancy emerged 48 hours before a ministerial briefing. Task: I had to isolate root causes and formulate mitigation options without delaying the announcement. Action: I formed a rapid response team, conducted triage on data feeds, and established risk guardrails. Result: Delivered verified briefings on time, avoiding public misstatements and establishing a permanent automated validation check.",
    competency: "Problem-solving",
    role: "Strategy & Policy Adviser",
    interviewType: "Situational",
    tags: ["Problem-solving", "Risk management", "Decision-making"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-03T14:30:00.000Z",
  },
  {
    id: "ex-3",
    title: "Influenced stakeholders to agree a change in approach",
    question: "Give an example of persuading sceptical senior stakeholders to alter course.",
    answer: "Situation: Senior leadership preferred an outdated manual consultation model with high recurring costs. Task: I needed to build consensus around an iterative digital consultative model. Action: Prepared an evidence dossier comparing pilot outcomes, ran an interactive workshop addressing risk concerns, and negotiated staged milestones. Result: Secured unanimous approval from 5 executive directors, saving £340k annually.",
    competency: "Influencing",
    role: "Senior Adviser, Policy & Strategy",
    interviewType: "Competency",
    tags: ["Influencing", "Communication", "Collaboration"],
    isFavorite: true,
    isStarStructure: true,
    createdAt: "2026-11-05T09:15:00.000Z",
  },
  {
    id: "ex-4",
    title: "Improved a customer process and reduced costs",
    question: "Tell me about an initiative where you drove efficiency and measurable bottom-line impact.",
    answer: "Situation: The user onboarding journey had a 28% drop-off rate at the verification stage. Task: Streamline identity verification without compromising risk guardrails. Action: Analyzed step-by-step telemetry, removed redundant form fields, and integrated instant document verification. Result: Drop-off decreased to 11%, operational support tickets dropped by 35%, delivering £180k in annual productivity savings.",
    competency: "Impact & Results",
    role: "Product Manager",
    interviewType: "Technical & Operational",
    tags: ["Continuous improvement", "Data-driven", "Impact"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-06T16:00:00.000Z",
  },
  {
    id: "ex-5",
    title: "Delivered key policy recommendations for senior leadership review",
    question: "Describe a time you synthesised dense, conflicting evidence into a strategic recommendation.",
    answer: "Situation: Differing academic, industry, and departmental forecasts created deadlock on a major infrastructure policy. Task: Synthesise conflicting data into actionable options for the Secretary of State. Action: Created a clear trade-off matrix weighing economic return vs delivery risk, with stress-tested sensitivity models. Result: Selected option was adopted as central policy white paper baseline with cross-party backing.",
    competency: "Strategic thinking",
    role: "Senior Adviser, Policy & Strategy",
    interviewType: "Panel",
    tags: ["Strategic thinking", "Policy", "Stakeholder management"],
    isFavorite: true,
    isStarStructure: true,
    createdAt: "2026-11-08T11:20:00.000Z",
  },
  {
    id: "ex-6",
    title: "Managed competing deadlines across three parallel workstreams",
    question: "How do you maintain quality when multiple urgent priorities land simultaneously?",
    answer: "Situation: Three statutory consultation deadlines overlapped within a 10-day window during a team reorganisation. Task: Prioritise resources to ensure no legal breaches occurred. Action: Reallocated capacity based on regulatory risk, automated response collation, and set up transparent blocker escalations. Result: All three reports delivered on time with zero compliance infractions.",
    competency: "Prioritisation",
    role: "Programme Lead",
    interviewType: "Hiring manager",
    tags: ["Prioritisation", "Organisation", "Delivery"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-09T13:45:00.000Z",
  },
  {
    id: "ex-7",
    title: "Built consensus across conflicting departmental incentives",
    question: "Tell me about a time you worked with a difficult partner team to deliver a shared goal.",
    answer: "Situation: Finance and Delivery teams had diametrically opposed priorities regarding vendor contracts. Task: Formulate a compromise agreement satisfying both cost controls and delivery SLAs. Action: Hosted structured alignment sessions to define shared non-negotiables, establishing joint governance. Result: Final contract signed within 2 weeks, reducing delivery risk by 30% and locking in a 15% volume discount.",
    competency: "Collaboration",
    role: "Strategy Adviser",
    interviewType: "Competency",
    tags: ["Negotiation", "Cross-functional", "Collaboration"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-10T15:10:00.000Z",
  },
  {
    id: "ex-8",
    title: "Overcame data gaps to forecast critical quarterly metrics",
    question: "Walk me through how you solve an analytical problem when baseline data is missing.",
    answer: "Situation: A new policy programme lacked historic user engagement data for forecasting. Task: Produce a 12-month adoption and budget forecast for the Treasury. Action: Synthesized proxy benchmarks from 4 comparable public sector deployments and built conservative monte-carlo confidence intervals. Result: Budget was approved in full; actual 6-month adoption landed within 4% of my projected midpoint.",
    competency: "Analytical thinking",
    role: "Analytics & Strategy",
    interviewType: "Technical round",
    tags: ["Analytical thinking", "Data-driven", "Problem-solving"],
    isFavorite: false,
    isStarStructure: true,
    createdAt: "2026-11-11T17:00:00.000Z",
  },
];

export function loadExamples(): InterviewExample[] {
  if (typeof window === "undefined") return DEFAULT_EXAMPLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EXAMPLES));
      return DEFAULT_EXAMPLES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EXAMPLES;
  } catch {
    return DEFAULT_EXAMPLES;
  }
}

export function saveExample(example: Omit<InterviewExample, "id" | "createdAt">): InterviewExample {
  const current = loadExamples();
  const newEx: InterviewExample = {
    ...example,
    id: `ex-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newEx, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("hk_examples_updated"));
  } catch {}
  return newEx;
}

export function saveExamplesBatch(
  newExamples: Omit<InterviewExample, "id" | "createdAt">[]
): InterviewExample[] {
  const current = loadExamples();
  const created: InterviewExample[] = newExamples.map((ex, i) => ({
    ...ex,
    id: `ex-cv-${Date.now()}-${i}`,
    createdAt: new Date().toISOString(),
  }));
  const updated = [...created, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("hk_examples_updated"));
  } catch {}
  return created;
}

export function toggleExampleFavorite(id: string): void {
  const current = loadExamples();
  const updated = current.map((ex) => (ex.id === id ? { ...ex, isFavorite: !ex.isFavorite } : ex));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("hk_examples_updated"));
  } catch {}
}

export function deleteExample(id: string): void {
  const current = loadExamples();
  const updated = current.filter((ex) => ex.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("hk_examples_updated"));
  } catch {}
}
