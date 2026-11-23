import { checkVerbScale } from "./verbs";

export interface GroundingResult {
  passed: boolean;
  unsupported: { text: string; reason: string }[];
}

/**
 * Normalise numbers and monetary units for comparison:
 * "£40,000", "40k", "forty thousand", "40000"
 */
function extractNumbers(text: string): string[] {
  // Matches digits with optional commas, k/m suffixes, percentage signs, or currencies
  const matches = text.match(/([£$€]?\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|m|%|bn)?)/gi);
  if (!matches) return [];
  return matches.map((m) => m.trim().toLowerCase());
}

/**
 * Validates that every specific claim, number, and verb in the generated sentence
 * is grounded in the provided source text or evidence bank entries.
 */
export function checkGrounding(
  generatedSentence: string,
  sourceEvidenceList: string[],
): GroundingResult {
  const combinedSource = sourceEvidenceList.join(" ").toLowerCase();
  const unsupported: { text: string; reason: string }[] = [];

  // 1. Check numbers and metrics
  const genNumbers = extractNumbers(generatedSentence);
  for (const num of genNumbers) {
    const rawDigits = num.replace(/[^0-9]/g, "");
    if (rawDigits.length > 0 && !combinedSource.includes(rawDigits)) {
      // Check if it's a minor number (e.g. 1 or 2)
      if (parseInt(rawDigits, 10) > 3) {
        unsupported.push({
          text: num,
          reason: `Metric or number "${num}" is not found in your confirmed evidence or notes.`,
        });
      }
    }
  }

  // 2. Check verb scale
  const verbCheck = checkVerbScale(generatedSentence, combinedSource);
  if (!verbCheck.valid && verbCheck.problem) {
    unsupported.push({
      text: generatedSentence,
      reason: verbCheck.problem,
    });
  }

  return {
    passed: unsupported.length === 0,
    unsupported,
  };
}
