import { buzzwords } from "../score/detect";
import { oneLine, stem, terms } from "../write/facts";

/**
 * Writing for the first reader of a CV, which is now usually software: an
 * applicant tracking system or an AI screener, then a person. Both read
 * plain, specific words best. Wording that sounds machine-written is a
 * warning sign to people who screen CVs, and it says nothing a screener can
 * match to a job. These rules are code, so the assistant is held to them on
 * every line it writes, whatever the model says.
 */

/**
 * Words and phrases that mark text as written by AI, or that claim without
 * saying anything. The CV score's own buzzword list (`buzzwords`) is checked
 * as well.
 */
const TELLS = [
  "spearhead",
  "spearheaded",
  "spearheading",
  "leverage",
  "leveraged",
  "leveraging",
  "utilise",
  "utilised",
  "utilising",
  "utilize",
  "utilized",
  "utilizing",
  "orchestrated",
  "orchestrating",
  "seamless",
  "seamlessly",
  "robust",
  "cutting-edge",
  "cutting edge",
  "state-of-the-art",
  "best-in-class",
  "world-class",
  "innovative",
  "showcase",
  "showcased",
  "showcasing",
  "foster",
  "fostered",
  "fostering",
  "delve",
  "delved",
  "tapestry",
  "testament",
  "pivotal",
  "paramount",
  "meticulous",
  "meticulously",
  "navigate",
  "navigated",
  "navigating",
  "landscape",
  "realm",
  "elevate",
  "elevated",
  "empower",
  "empowered",
  "empowering",
  "harness",
  "harnessed",
  "holistic",
  "transformative",
  "unparalleled",
  "unwavering",
  "visionary",
  "ever-evolving",
  "ever-changing",
  "impactful",
  "plethora",
  "myriad",
  "a passion for",
  "passion for",
  "commitment to excellence",
  "drive impact",
  "drove impact",
  "driving impact",
  "in today's",
  "in today’s",
  "go above and beyond",
  "went above and beyond",
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TELL = new RegExp(`(?<![\\p{L}-])(?:${TELLS.map(escape).join("|")})(?![\\p{L}-])`, "giu");

/** The AI-sounding words and buzzwords in a text, as written, once each. */
export function aiTells(text: string): string[] {
  const found = [...text.matchAll(TELL)].map((m) => m[0]);
  for (const h of buzzwords(text)) found.push(h.text);
  const seen = new Set<string>();
  return found.filter((w) => (seen.has(w.toLowerCase()) ? false : (seen.add(w.toLowerCase()), true)));
}

/** A line is one point. Past this many words it is two, and reads as a paragraph to a screener. */
export const MAX_LINE_WORDS = 32;

/**
 * Punctuation a model adds that a person rarely types, put back to what a CV
 * uses: a dash between clauses becomes a comma, curly flourishes go, and a
 * line has no full stop at its end.
 */
export function tidyLine(text: string): string {
  return oneLine(text)
    .replace(/\s+[—–]\s+|\s*—\s*/g, ", ")
    .replace(/^[-•*·]\s*/, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/[.;,\s]+$/, "")
    .trim();
}

/** The same for prose (a profile): dashes between clauses become commas; sentences keep their full stops. */
export function tidyProse(text: string): string {
  return oneLine(text)
    .replace(/\s+[—–]\s+|\s*—\s*/g, ", ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

/**
 * What is wrong with a line the assistant wrote, judged against the person's
 * own words: AI phrasing they did not use themselves, and length. A word they
 * used is theirs to keep, so it is never a reason to refuse their line; the
 * assistant may suggest a plainer one instead (see `plainerWords`).
 */
export function styleProblems(text: string, sources: string[]): string[] {
  const problems: string[] = [];
  const theirs = new Set(sources.flatMap(terms).map((t) => t.stem));
  const said = sources.join(" ").toLowerCase();
  for (const w of aiTells(text)) {
    const own = said.includes(w.toLowerCase()) || terms(w).every((t) => theirs.has(t.stem));
    if (!own) problems.push(`It uses “${w}”, which reads as AI-written or as a buzzword. Use the person’s own plain words.`);
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > MAX_LINE_WORDS) problems.push(`It runs to ${words} words. A line is one point, under ${MAX_LINE_WORDS} words: split it into two lines.`);
  return problems;
}

/** Plainer words for the ones that read as AI-written. Offered to the person as a choice; never swapped in for them. */
const PLAINER: Record<string, string> = {
  spearhead: "led",
  leverag: "used",
  utilis: "used",
  utiliz: "used",
  orchestr: "organised",
  showcas: "showed",
  foster: "built",
  navig: "handled",
  empow: "trained",
  harness: "used",
  elev: "improved",
};

/** For each AI-sounding word the person used themselves, a plainer one they might prefer. */
export function plainerWords(text: string): { word: string; plainer: string }[] {
  const out: { word: string; plainer: string }[] = [];
  for (const w of aiTells(text)) {
    const s = stem(w.toLowerCase());
    const key = Object.keys(PLAINER).find((k) => s.startsWith(k));
    if (key) out.push({ word: w, plainer: PLAINER[key] });
  }
  return out;
}
