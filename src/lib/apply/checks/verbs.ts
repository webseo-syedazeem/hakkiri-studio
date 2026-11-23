export interface VerbRank {
  verb: string;
  rank: number; // 1 to 5
}

export const RANKED_VERBS: Record<string, number> = {
  // Rank 5: Massive multiplier
  doubled: 5,
  tripled: 5,
  transformed: 5,
  overhauled: 5,

  // Rank 4: Direct Leadership & Creation
  led: 4,
  directed: 4,
  built: 4,
  launched: 4,
  architected: 4,
  delivered: 4,
  spearheaded: 4, // (banned, but tracked for scale)
  pioneered: 4,

  // Rank 3: Management & Ownership
  managed: 3,
  owned: 3,
  scaled: 3,
  negotiated: 3,
  established: 3,
  reduced: 3,
  increased: 3,
  drove: 3,
  executed: 3,

  // Rank 2: Operational / Execution
  coordinated: 2,
  designed: 2,
  implemented: 2,
  developed: 2,
  analysed: 2,
  analyzed: 2,
  created: 2,
  monitored: 2,
  improved: 2,

  // Rank 1: Supporting / Assist
  assisted: 1,
  helped: 1,
  supported: 1,
  contributed: 1,
  participated: 1,
  collaborated: 1,
};

export function getVerbRank(verb: string): number {
  return RANKED_VERBS[verb.toLowerCase()] || 2;
}

export function checkVerbScale(generatedSentence: string, sourceEvidence: string): { valid: boolean; problem?: string } {
  const genWords = generatedSentence.toLowerCase().split(/\s+/);
  const srcLower = sourceEvidence.toLowerCase();

  for (const word of genWords) {
    const clean = word.replace(/[^a-z]/g, "");
    const rank = RANKED_VERBS[clean];
    if (rank && rank >= 4) {
      // High-power verb used (e.g. "led", "doubled")
      // Check if source evidence only has helper verbs (assisted, helped)
      const hasHelperOnly =
        (srcLower.includes("helped") || srcLower.includes("assisted") || srcLower.includes("supported")) &&
        !srcLower.includes("led") &&
        !srcLower.includes("built") &&
        !srcLower.includes("directed");

      if (hasHelperOnly) {
        return {
          valid: false,
          problem: `Scale verb "${clean}" is not supported by source evidence, which only states helping/assisting.`,
        };
      }
    }
  }

  return { valid: true };
}
