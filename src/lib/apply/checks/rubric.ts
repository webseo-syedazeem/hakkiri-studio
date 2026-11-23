import { findBannedPhrases } from "./banned";
import type { Finding, InterviewerQuestion } from "../schema";

export interface RubricResult {
  score: number;
  subscores: {
    evidence: number;
    clarity: number;
    structure: number;
    software: number;
    fit?: number;
  };
  findings: Finding[];
  teaser: string[];
  interviewerQuestions: InterviewerQuestion[];
  isGoodEnough: boolean; // Score >= 85
}

/**
 * Computes deterministic CV audit score & line-linked findings entirely in code.
 * Same input produces byte-identical score on every run.
 */
export function auditCvText(
  cvText: string,
  region: "uk" | "us" = "uk",
  jobText?: string,
): RubricResult {
  const lines = cvText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const findings: Finding[] = [];
  let findingIdCounter = 1;

  // 1. Evidence Checks (Weight: 35%)
  let evidenceScore = 100;
  const bulletLines = lines.filter((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*") || /^[0-9]+\./.test(l));
  const activeBullets = bulletLines.length > 0 ? bulletLines : lines.filter((l) => l.length > 30);

  // Check for metrics/numbers in bullets
  const bulletsWithMetrics = activeBullets.filter((b) => /\d+(?:%|k|m|£|\$|x|\+)?/i.test(b));
  const metricRatio = activeBullets.length > 0 ? bulletsWithMetrics.length / activeBullets.length : 0;

  if (metricRatio < 0.3) {
    evidenceScore -= 35;
    const sampleLine = activeBullets.find((b) => !/\d/.test(b)) || lines[Math.min(3, lines.length - 1)];
    findings.push({
      id: `ev-${findingIdCounter++}`,
      area: "evidence",
      severity: "high",
      quote: sampleLine.slice(0, 80),
      problem: "Only a small fraction of your experience bullets contain quantified outcomes or metrics.",
      fix: "Add specific numbers, team sizes, revenue, or time saved (e.g., 'reduced turnaround by 24%').",
    });
  } else if (metricRatio < 0.6) {
    evidenceScore -= 15;
  }

  // Check for duty words ("responsible for", "duties included")
  const dutyLines = activeBullets.filter((b) => /responsible for|duties included|tasked with/i.test(b));
  if (dutyLines.length > 0) {
    evidenceScore -= dutyLines.length * 10;
    const quoted = dutyLines[0];
    findings.push({
      id: `ev-${findingIdCounter++}`,
      area: "evidence",
      severity: "high",
      quote: quoted.slice(0, 80),
      problem: "Bullet begins with a passive duty phrase ('responsible for') instead of a high-impact action verb.",
      fix: "Lead directly with what you achieved (e.g., replace 'Responsible for managing client projects' with 'Delivered 14 enterprise client migrations on schedule').",
    });
  }

  // Check for banned buzzwords
  const bannedHits = findBannedPhrases(cvText);
  if (bannedHits.length > 0) {
    evidenceScore -= bannedHits.length * 8;
    const hitWord = bannedHits[0];
    const lineWithHit = lines.find((l) => new RegExp(`\\b${hitWord}\\b`, "i").test(l)) || lines[0];
    findings.push({
      id: `ev-${findingIdCounter++}`,
      area: "evidence",
      severity: "medium",
      quote: lineWithHit.slice(0, 80),
      problem: `Contains overused cliché phrase "${hitWord}".`,
      fix: "Remove generic buzzwords and let specific achievements prove the competency instead.",
    });
  }

  evidenceScore = Math.max(20, Math.min(100, evidenceScore));

  // 2. Clarity Checks (Weight: 25%)
  let clarityScore = 100;
  const longBullets = activeBullets.filter((b) => b.split(/\s+/).length > 35);
  if (longBullets.length > 0) {
    clarityScore -= 20;
    findings.push({
      id: `cl-${findingIdCounter++}`,
      area: "clarity",
      severity: "medium",
      quote: longBullets[0].slice(0, 80),
      problem: "Bullet exceeds 35 words, making it harder for a hiring manager to scan in 10 seconds.",
      fix: "Split this into two crisp bullets or trim supporting context to focus solely on the action and result.",
    });
  }

  // Passive voice check
  const passivePhrases = cvText.match(/\b(?:was|were|been|being)\s+\w+ed\b/gi) || [];
  if (passivePhrases.length > 3) {
    clarityScore -= 15;
    const samplePassive = lines.find((l) => /\b(?:was|were|been)\s+\w+ed\b/i.test(l));
    if (samplePassive) {
      findings.push({
        id: `cl-${findingIdCounter++}`,
        area: "clarity",
        severity: "medium",
        quote: samplePassive.slice(0, 80),
        problem: "Sentence uses passive voice, obscuring your direct personal ownership.",
        fix: "Convert to active past tense (e.g. change 'Audits were conducted by our team' to 'Conducted quarterly audits').",
      });
    }
  }

  clarityScore = Math.max(30, Math.min(100, clarityScore));

  // 3. Structure Checks (Weight: 20%)
  let structureScore = 100;
  const lowerCv = cvText.toLowerCase();
  const hasExperience = lowerCv.includes("experience") || lowerCv.includes("employment") || lowerCv.includes("history");
  const hasEducation = lowerCv.includes("education") || lowerCv.includes("university") || lowerCv.includes("degree") || lowerCv.includes("school");
  const hasSkills = lowerCv.includes("skills") || lowerCv.includes("technologies") || lowerCv.includes("competencies");
  const hasContact = /@|[0-9]{5,}/.test(cvText);

  if (!hasExperience) {
    structureScore -= 30;
    findings.push({
      id: `st-${findingIdCounter++}`,
      area: "structure",
      severity: "high",
      quote: lines[0] || "CV Header",
      problem: "Missing standard 'Experience' or 'Employment History' section heading.",
      fix: "Add a clear 'Professional Experience' section header so ATS parsers can index your roles.",
    });
  }

  if (!hasEducation) {
    structureScore -= 20;
    findings.push({
      id: `st-${findingIdCounter++}`,
      area: "structure",
      severity: "medium",
      quote: lines[lines.length - 1] || "CV Footer",
      problem: "Education section is missing or unlabelled.",
      fix: "Include an 'Education' section with your degrees, institutions, and graduation years.",
    });
  }

  if (!hasContact) {
    structureScore -= 25;
    findings.push({
      id: `st-${findingIdCounter++}`,
      area: "structure",
      severity: "high",
      quote: lines[0] || "Header",
      problem: "Contact details (email address or phone number) appear missing or unparseable.",
      fix: "Ensure your email, phone, and location are prominent at the very top of page 1.",
    });
  }

  structureScore = Math.max(30, Math.min(100, structureScore));

  // 4. Software Readability / ATS Checks (Weight: 10%)
  let softwareScore = 100;
  if (cvText.includes("|") && cvText.split("|").length > 10) {
    softwareScore -= 20;
    const tableLine = lines.find((l) => l.includes("|")) || lines[0];
    findings.push({
      id: `sw-${findingIdCounter++}`,
      area: "software",
      severity: "low",
      quote: tableLine.slice(0, 80),
      problem: "ASCII tables or heavy pipe characters detected. Traditional ATS systems often jumble tabular text.",
      fix: "Use standard single-column text or clean bullet points without table formatting.",
    });
  }

  softwareScore = Math.max(40, Math.min(100, softwareScore));

  // 5. Fit to Job Advert (Optional 10%)
  let fitScore: number | undefined = undefined;
  if (jobText) {
    const jobWords = Array.from(new Set(jobText.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
    const commonMatches = jobWords.filter((w) => lowerCv.includes(w));
    const matchPct = Math.round((commonMatches.length / Math.max(jobWords.length, 1)) * 100);
    fitScore = Math.min(100, Math.max(20, matchPct * 2));

    if (fitScore < 60) {
      findings.push({
        id: `fit-${findingIdCounter++}`,
        area: "fit",
        severity: "medium",
        quote: lines[0] || "Target CV",
        problem: "Low keyword overlap with the attached job advert.",
        fix: "Incorporate primary skills and requirements from the job description directly into your summary and recent bullet points.",
      });
    }
  }

  // Calculate Weighted Total Score
  let totalScore: number;
  if (fitScore !== undefined) {
    totalScore = Math.round(
      evidenceScore * 0.35 +
      clarityScore * 0.25 +
      structureScore * 0.20 +
      softwareScore * 0.10 +
      fitScore * 0.10,
    );
  } else {
    // Re-scale without fit (35/90, 25/90, 20/90, 10/90)
    totalScore = Math.round(
      (evidenceScore * 0.35 +
        clarityScore * 0.25 +
        structureScore * 0.20 +
        softwareScore * 0.10) /
        0.9,
    );
  }

  // Interviewer's View questions (Bridge to practice)
  const interviewerQuestions: InterviewerQuestion[] = [];
  const actionBullets = activeBullets.filter((b) => /led|managed|launched|built|increased|reduced/i.test(b));
  const challengeBullets = actionBullets.length > 0 ? actionBullets : activeBullets;

  if (challengeBullets.length > 0) {
    const q1 = challengeBullets[0];
    interviewerQuestions.push({
      id: "iq-1",
      quote: q1.slice(0, 90),
      question: `You state: "${q1.slice(0, 60)}...". How many people were involved, and what specific decisions did you own versus the wider team?`,
      practiceTheme: "Leadership & Decision Making",
    });
  }

  if (challengeBullets.length > 1) {
    const q2 = challengeBullets[1];
    interviewerQuestions.push({
      id: "iq-2",
      quote: q2.slice(0, 90),
      question: `Regarding "${q2.slice(0, 60)}...": What was the biggest unexpected roadblock during this initiative, and how did you resolve it?`,
      practiceTheme: "Problem Solving Under Pressure",
    });
  }

  if (challengeBullets.length > 2) {
    const q3 = challengeBullets[2];
    interviewerQuestions.push({
      id: "iq-3",
      quote: q3.slice(0, 90),
      question: `What metrics did you track to verify that this delivered long-term value, and what would you do differently in retrospect?`,
      practiceTheme: "Impact & Retrospective",
    });
  }

  // Teaser findings: Top 3 most critical findings
  const highSeverities = findings.filter((f) => f.severity === "high");
  const medSeverities = findings.filter((f) => f.severity === "medium");
  const topFindings = [...highSeverities, ...medSeverities, ...findings].slice(0, 3);
  const teaser = topFindings.map((f) => f.id);

  return {
    score: totalScore,
    subscores: {
      evidence: evidenceScore,
      clarity: clarityScore,
      structure: structureScore,
      software: softwareScore,
      fit: fitScore,
    },
    findings,
    teaser,
    interviewerQuestions,
    isGoodEnough: totalScore >= 85,
  };
}
