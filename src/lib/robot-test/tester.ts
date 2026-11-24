/**
 * The "robot tester" page.
 *
 * It used to show the results of an automated audit: four "learning bots"
 * with accuracy figures, a score for each of fifteen scenarios, "loopholes
 * caught" and a log of passes. None of it was measured. No answer was sent to
 * the scoring model, no CV was parsed and no form was filled in: every score
 * was a constant chosen to fall inside its "expected range", nudged by the
 * run number so that it looked different each time.
 *
 * Nothing here is invented any more. The personas below are kept: they are
 * the written test cases a real evaluation would use. Until one is built (it
 * has to send each answer to the live scoring model, so it needs live keys
 * and costs money per run) the report says plainly that nothing was run, and
 * carries no scores, no bots and no passes.
 */

export interface LearningBotInfo {
  id: string;
  name: string;
  app: "Hakkiri Studio" | "Language App";
  role: string;
  status: "active" | "calibrated" | "monitoring";
  model: string;
  lastTrained: string;
  accuracy: string;
  capabilities: string[];
}

/** There are no such bots. (This list used to describe four, each with an accuracy figure nobody had measured.) */
export const LEARNING_BOTS: LearningBotInfo[] = [];

export interface CandidatePersona {
  id: string;
  name: string;
  role: string;
  level: "intern" | "graduate" | "senior" | "executive" | "career_changer";
  targetTimeSec: number;
  answeringStyle: string;
  cvSummary: string;
  sampleAnswers: Record<string, string>;
}

export const PERSONAS: CandidatePersona[] = [
  {
    id: "sam",
    name: "Sam (2nd-year student)",
    role: "Operations Intern, logistics",
    level: "intern",
    targetTimeSec: 60,
    cvSummary: "BSc Logistics & Supply Chain (Year 2) · Warehouse Inventory Group Project · 0 formal corporate experience",
    answeringStyle: "Short, vague, nervous. Uses filler words ('um', 'like'). Struggles with depth.",
    sampleAnswers: {
      intro: "Um, hi. I'm Sam. I study logistics at university and, like, I did a small group project on warehouse inventory last term.",
      challenge: "I'm not really sure, to be honest. We had a disagreement about who would make the slides, but we just split it evenly.",
      audit: "Probably the numbers from my course project, because it was just simulated data from a textbook.",
    },
  },
  {
    id: "priya",
    name: "Priya (New graduate)",
    role: "Graduate Analyst, consulting",
    level: "graduate",
    targetTimeSec: 90,
    cvSummary: "BSc Economics (First Class) · 10-week Consulting Summer Analyst · CV Claim: 'Automated weekly client KPI reporting in Python, cutting prep time by 35%'",
    answeringStyle: "Structured STAR framework, clear situation and result, measured pace.",
    sampleAnswers: {
      intro: "I recently completed my degree in Economics. During my final year, I interned with a regional consultancy where I automated weekly client reporting in Python, reducing prep time by 35%.",
      challenge: "In my internship, a client challenged our data source. I set up a reconciliation model, cross-referenced two external benchmarks, and presented an updated sensitivity table that resolved their concern within 24 hours.",
      audit: "The 35% time reduction claim on my CV. It was measured across 8 weekly report cycles, but client-side delays sometimes affected turnaround beyond our control.",
    },
  },
  {
    id: "daniel",
    name: "Daniel (11 years experience)",
    role: "Senior Operations Manager, freight",
    level: "senior",
    targetTimeSec: 150,
    cvSummary: "Senior Operations Director · 11 Years Freight & Cross-Dock Logistics · CV Claim: 'Cut terminal cross-dock dwell time by 42%'",
    answeringStyle: "Substantive, deep domain jargon, but heavily rambling and over the time limit (180s+).",
    sampleAnswers: {
      intro: "I've been in freight logistics for over 11 years now. Started out dispatching trucks in Chicago, then moved into cross-dock optimization and linehaul management across the Midwest. Over the last four years, I ran three regional distribution hubs overseeing about 140 team members and 85 contracted carriers, focusing heavily on reducing dwell times and driver detention penalties which were costing us hundreds of thousands annually.",
      challenge: "Back during the supply chain disruption in Q3 2024, our primary rail ramp in Dallas froze operations for four straight days. I had 42 intermodal containers sitting with perishable freight. I rerouted 28 loads via expedited over-the-road team drivers, renegotiated secondary spot rates with regional dry-van brokers on 2 hours notice, and set up a mobile staging yard. We lost zero contracts, though margin took a 4% hit that quarter.",
      audit: "My CV states we cut dwell time by 42%. In reality, that 42% was achieved specifically across our high-velocity cross-dock lanes during peak season; our secondary regional lanes only saw about a 18% improvement.",
    },
  },
  {
    id: "margaret",
    name: "Margaret (Deputy COO)",
    role: "Chief Operating Officer, NHS trust",
    level: "executive",
    targetTimeSec: 120,
    cvSummary: "Deputy Chief Operating Officer · Acute NHS Foundation Trust (£550m budget, 7,000 staff) · CV Claim: 'Reduced elective waiting backlog by 14,000 patients'",
    answeringStyle: "High-level executive clarity, governance, clinical risk metrics, board communication.",
    sampleAnswers: {
      intro: "I serve as Deputy Chief Operating Officer across an integrated acute trust with 7,000 staff and a £550m budget. My focus has been winter resilience, clinical quality compliance, and reducing elective waiting backlogs.",
      challenge: "We faced an acute 12-hour A&E breach spike last winter driven by discharge delays in adult social care. I convened a daily joint discharge cell with local authority commissioners, opened 24 temporary step-down beds in an adjacent community facility, and brought 4-hour performance from 61% to 78% within six weeks.",
      audit: "The backlog reduction figure of 14,000 patients. While that is accurate at the aggregate level, roughly 2,500 were pathway re-codings following clinical administrative validation rather than completed clinical interventions.",
    },
  },
  {
    id: "aleksandra",
    name: "Aleksandra (Career changer)",
    role: "L&D Coordinator",
    level: "career_changer",
    targetTimeSec: 90,
    cvSummary: "Secondary English Educator (7 Years) · Department Curriculum Lead · Transitioning to Corporate Learning & Development",
    answeringStyle: "Mixed; authentic transferable skills, but gives one off-topic answer and one hesitation.",
    sampleAnswers: {
      intro: "I taught secondary English for seven years where I designed curricula and mentored student teachers. I'm now transitioning into corporate learning and development where my curriculum design and stakeholder engagement skills directly apply.",
      challenge: "Last summer my friends and I went hiking in the Scottish Highlands and the weather got really bad and our tent flooded, so we had to navigate our way back to the road in the dark using paper maps.",
      audit: "My training satisfaction rating of 96%. It was based on post-course feedback forms from 12 workshops, but attendance was voluntary so there was some positive selection bias.",
    },
  },
];

export interface TestResult {
  id: string;
  section: 1 | 2 | 3;
  sectionTitle: string;
  persona: string;
  role: string;
  cvSummary: string;
  question: string;
  answerSnippet: string;
  answerLengthWords: number;
  estimatedSec: number;
  expectedScoreRange: [number, number];
  simulatedScore: number;
  scoreMatch: boolean;
  loopholeDetected: string | null;
  aiFollowUpAction: string;
  fullFlowNotes: {
    cvCheck: string;
    speechAnalysis: string;
    rubricEvaluation: string;
  };
}

export interface AuditReport {
  timestamp: string;
  formattedTime: string;
  iteration: number;
  model: string;
  /** False: no check was run, so there are no results. */
  ran: boolean;
  /** Why there are none, in words for the page. */
  note: string;
  totalTests: number;
  scoreGap: number;
  scoreGapPassed: boolean;
  loopholesCount: number;
  learningBots: LearningBotInfo[];
  results: TestResult[];
  logs: string[];
}

export const NOT_RUN =
  "No automated checks have been run. This page used to show scores and passes that were written into the code, not measured. A real evaluation has to send each test answer to the live scoring model, and has not been built yet.";

/**
 * The report for the robot tester page. Nothing is run, so it holds no
 * results: no scores, no bots, no passes, and a spread of zero that is not
 * marked as passed.
 */
export function runAuditLogic(runIteration = 1): AuditReport {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return {
    timestamp: now.toISOString(),
    formattedTime: timeStr,
    iteration: Number.isFinite(runIteration) && runIteration > 0 ? Math.floor(runIteration) : 1,
    model: "none: nothing was sent to a model",
    ran: false,
    note: NOT_RUN,
    totalTests: 0,
    scoreGap: 0,
    scoreGapPassed: false,
    loopholesCount: 0,
    learningBots: LEARNING_BOTS,
    results: [],
    logs: [`[${timeStr}] ${NOT_RUN}`],
  };
}
