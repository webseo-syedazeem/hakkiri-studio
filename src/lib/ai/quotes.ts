import type { Word } from "@/lib/types";

/**
 * Matching what someone said against a quote of it. Spoken quotes usually
 * leave out the "um"s, so fillers are ignored on both sides; everything
 * else must match word for word.
 */

const HESITATIONS = new Set(["um", "umm", "uh", "uhh", "er", "erm", "ah", "hmm", "mm", "mhm"]);

/** "We, um, agreed." → ["we", "agreed"] */
export function spokenTokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9%'.\s-]/g, " ")
    .replace(/(\D)\.|\.(\D|$)/g, "$1 $2") // keep decimal points, drop full stops
    .replace(/-/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t && !HESITATIONS.has(t));
}

/** True when the quote appears in the words, in order, ignoring fillers and punctuation. */
export function quoteInWords(words: Word[], quote: string): boolean {
  const target = spokenTokens(quote);
  if (!target.length) return false;
  const toks = words.flatMap((w) => spokenTokens(w.text));
  outer: for (let i = 0; i <= toks.length - target.length; i++) {
    for (let k = 0; k < target.length; k++) if (toks[i + k] !== target[k]) continue outer;
    return true;
  }
  return false;
}
