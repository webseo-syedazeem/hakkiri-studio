import type { PromptModel } from "./catalog";

export interface FourPillarsScore {
  executiveScore: number;     // 1 to 5: Fluency & Presence
  clarityScore: number;       // 1 to 5: Clarity & Structure
  impactScore: number;        // 1 to 5: Conciseness & Impact
  engagementScore: number;    // 1 to 5: Engagement & Tone
  crutchCount: number;
  powerPauseCount: number;
  pacingWpm: number;
  intelligibilityPercentage: number;
  actionVerbPercentage: number;
  detectedCrutches: string[];
}

export interface HighlightedPhrase {
  timestampRange: string;
  phrase: string;
  critique: string;
}

export interface EvaluationFeedback {
  overallScore: number;
  pillars: FourPillarsScore;
  oneStrength: string;
  oneSpecificImprovement: string;
  highlightedPhrase: HighlightedPhrase;
  retryInstruction: string;
  exemplarResponse: string;
  transcript: string;
  durationSeconds: number;
  timestamp: string;
}

export const CORPORATE_CRUTCHES = [
  "basically",
  "you know",
  "kind of",
  "sort of",
  "like",
  "literally",
  "obviously",
  "to be honest",
  "at the end of the day",
  "if that makes sense",
  "i mean",
  "actually",
  "right?",
  "does that make sense",
  "you know what i mean",
];

export function evaluateSpeechFeedback({
  prompt,
  transcript,
  durationSeconds = 45,
  isRetry = false,
}: {
  prompt: PromptModel;
  transcript: string;
  durationSeconds?: number;
  isRetry?: boolean;
}): EvaluationFeedback {
  const lower = transcript.toLowerCase();

  // 1. Detect corporate crutch phrases
  const detectedCrutches: string[] = [];
  for (const crutch of CORPORATE_CRUTCHES) {
    if (lower.includes(crutch)) {
      detectedCrutches.push(crutch);
    }
  }

  // 2. Count words and words per minute
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  const minutes = (durationSeconds > 0 ? durationSeconds : 60) / 60.0;
  const wpm = Math.round(wordCount / minutes) || 135;

  // 3. Acoustic simulation metrics
  const powerPauseCount = durationSeconds > 25 ? (detectedCrutches.length === 0 ? 3 : 2) : 1;
  const uptalk = lower.endsWith("?") || lower.includes("right?") || lower.includes("makes sense");
  const isMonotone = wordCount < 25;

  // 4. Calculate Pillar Scores (1 to 5)
  let execScore = 4;
  if (detectedCrutches.length > 2 || uptalk) {
    execScore = 3;
  } else if (detectedCrutches.length === 0 && powerPauseCount >= 2) {
    execScore = 5;
  }

  let clarityScore = 4;
  if (wpm > 175 || wpm < 110) {
    clarityScore = 3;
  } else if (wpm >= 130 && wpm <= 160) {
    clarityScore = 5;
  }

  let impactScore = 4;
  if (prompt.activitySlug === "cut_it_in_half" && prompt.secondaryText) {
    const origCount = prompt.secondaryText.split(/\s+/).length;
    const compressionPct = Math.round(((origCount - wordCount) / origCount) * 100);
    if (compressionPct >= 45) {
      impactScore = 5;
    } else if (compressionPct < 25) {
      impactScore = 3;
    }
  } else if (detectedCrutches.length > 1) {
    impactScore = 3;
  }

  const engagementScore = isMonotone ? 3 : 4;
  const overall = Math.round(
    Math.max(1, Math.min(5, (execScore + clarityScore + impactScore + engagementScore) / 4))
  );

  // 5. Actionable feedback derivation
  let strength = "Composed baseline cadence with clear vocal projection and steady pacing.";
  if (powerPauseCount >= 2 && detectedCrutches.length <= 1) {
    strength = `Commanded executive authority by utilizing ${powerPauseCount} deliberate silent pauses before critical recommendations.`;
  }

  let improvement = "Reduce subtle permission-seeking phrases at sentence transitions.";
  let retryInstruction = "Lead with the bottom-line conclusion in the first 5 seconds and maintain flat statement tone.";
  let highlight: HighlightedPhrase = {
    timestampRange: "00:14 - 00:20",
    phrase: "...so basically, if that makes sense...",
    critique: "Uptalk and crutch words dilute executive presence and authority.",
  };

  if (detectedCrutches.length > 0) {
    const firstCrutch = detectedCrutches[0];
    improvement = `Eliminate the crutch phrase "${firstCrutch}" to project unwavering executive conviction.`;
    retryInstruction = `Replace "${firstCrutch}" with a 1-second silent power pause before stating your proposal.`;
    highlight = {
      timestampRange: "00:18 - 00:24",
      phrase: `...${firstCrutch}...`,
      critique: "Crutch word signals cognitive hesitation during unscripted delivery.",
    };
  }

  if (isRetry) {
    strength = "Coached Retry: Noticeable reduction in filler words and crisper sentence closures.";
  }

  const pillars: FourPillarsScore = {
    executiveScore: execScore,
    clarityScore: clarityScore,
    impactScore: impactScore,
    engagementScore: engagementScore,
    crutchCount: detectedCrutches.length,
    powerPauseCount,
    pacingWpm: wpm,
    intelligibilityPercentage: 94,
    actionVerbPercentage: 72,
    detectedCrutches,
  };

  return {
    overallScore: overall,
    pillars,
    oneStrength: strength,
    oneSpecificImprovement: improvement,
    highlightedPhrase: highlight,
    retryInstruction,
    exemplarResponse: prompt.exemplarResponse,
    transcript,
    durationSeconds,
    timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}
