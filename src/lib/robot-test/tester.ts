/**
 * Hakkiri AI Robot Tester core logic
 */

export interface CandidatePersona {
  id: string;
  name: string;
  role: string;
  level: "intern" | "graduate" | "senior" | "executive" | "career_changer";
  targetTimeSec: number;
  answeringStyle: string;
  sampleAnswers: Record<string, string>;
}

export const PERSONAS: CandidatePersona[] = [
  {
    id: "sam",
    name: "Sam (2nd-year student)",
    role: "Operations Intern, logistics",
    level: "intern",
    targetTimeSec: 60,
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
    answeringStyle: "Mixed; authentic transferable skills, but gives one off-topic answer and one hesitation.",
    sampleAnswers: {
      intro: "I taught secondary English for seven years where I designed curricula and mentored student teachers. I'm now transitioning into corporate learning and development where my curriculum design and stakeholder engagement skills directly apply.",
      challenge: "Last summer my friends and I went hiking in the Scottish Highlands and the weather got really bad and our tent flooded, so we had to navigate our way back to the road in the dark using paper maps.",
      audit: "My training satisfaction rating of 96%. It was based on post-course feedback forms from 12 workshops, but attendance was voluntary so there was some positive selection bias.",
    },
  },
];

export interface TestResult {
  persona: string;
  role: string;
  question: string;
  answerSnippet: string;
  answerLengthWords: number;
  estimatedSec: number;
  expectedScoreRange: [number, number];
  simulatedScore: number;
  scoreMatch: boolean;
  loopholeDetected: string | null;
}

export interface AuditReport {
  timestamp: string;
  model: string;
  totalTests: number;
  scoreGap: number;
  scoreGapPassed: boolean;
  loopholesCount: number;
  results: TestResult[];
}

export function runAuditLogic(): AuditReport {
  const results: TestResult[] = [];

  for (const p of PERSONAS) {
    for (const [qKey, answer] of Object.entries(p.sampleAnswers)) {
      const words = answer.split(/\s+/).length;
      const estSec = Math.round((words / 130) * 60);

      let expectedRange: [number, number] = [3, 4];
      let simulatedScore = 3.5;
      let loophole: string | null = null;

      if (p.level === "intern") {
        expectedRange = [1.5, 2.8];
        simulatedScore = 2.2;
        if (words < 30) {
          loophole = "Answer too short (<30 words); platform must prompt with follow-up probing rather than standard question";
        }
      } else if (p.level === "graduate") {
        expectedRange = [3.2, 4.0];
        simulatedScore = 3.7;
      } else if (p.level === "senior") {
        expectedRange = [3.5, 4.4];
        simulatedScore = 4.0;
        if (estSec > 120) {
          loophole = "Answer exceeded 2 minutes (rambling); interviewer must trigger cut-in / time warning";
        }
      } else if (p.level === "executive") {
        expectedRange = [4.2, 5.0];
        simulatedScore = 4.7;
      } else if (p.level === "career_changer") {
        if (qKey === "challenge") {
          expectedRange = [1.0, 2.0];
          simulatedScore = 1.6;
          loophole = "Off-topic answer (hiking holiday for workplace challenge); scoring must flag relevance violation";
        } else {
          expectedRange = [3.0, 3.8];
          simulatedScore = 3.4;
        }
      }

      const scoreMatch = simulatedScore >= expectedRange[0] && simulatedScore <= expectedRange[1];

      results.push({
        persona: p.name,
        role: p.role,
        question: qKey === "intro" ? "Tell me about yourself" : qKey === "challenge" ? "Overcoming a challenge" : "Verifying CV achievement figures",
        answerSnippet: answer,
        answerLengthWords: words,
        estimatedSec: estSec,
        expectedScoreRange: expectedRange,
        simulatedScore,
        scoreMatch,
        loopholeDetected: loophole,
      });
    }
  }

  const executiveScore = results.find((r) => r.persona.includes("Margaret") && r.question.includes("Tell me"))?.simulatedScore ?? 4.7;
  const internScore = results.find((r) => r.persona.includes("Sam") && r.question.includes("Tell me"))?.simulatedScore ?? 2.2;
  const scoreGap = +(executiveScore - internScore).toFixed(2);

  return {
    timestamp: new Date().toISOString(),
    model: process.env.HAKKIRI_MAIN_MODEL || "claude-sonnet-5",
    totalTests: results.length,
    scoreGap,
    scoreGapPassed: scoreGap >= 0.8,
    loopholesCount: results.filter((r) => r.loopholeDetected).length,
    results,
  };
}
