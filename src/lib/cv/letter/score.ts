import { aiTells } from "../agent/style";
import { readCvText } from "../import";
import { type CvRegion, emptyLetter } from "../schema";
import { filler } from "../score/detect";
import { extractRequirements } from "../tailor/requirements";
import { sentences, terms } from "../write/facts";
import { reviewLetter, splitSentences } from "./check";
import type { LetterCv } from "./sources";

/**
 * A cover letter's own score out of 100, in four parts of 25: relevance,
 * clarity, structure and evidence. It is not the CV score: a letter is read for
 * different things. Every point comes from a check made in code, with its
 * reason. A check that needs something that was not given (the job advert, the
 * CV) is "not checked": its points are left out of the total, not counted as
 * failed, and the score is out of what could be checked.
 */
export type LetterPartId = "relevance" | "clarity" | "structure" | "evidence";
export interface LetterPart {
  id: LetterPartId;
  name: string;
  points: number;
  earned: number;
  /** Points that need the advert or the CV, which were not given. */
  pending: number;
}
export interface LetterFinding {
  part: LetterPartId;
  /** The exact words it is about, when it is about some. */
  quote: string;
  why: string;
  todo: string;
}
export type CheckState = "ok" | "review" | "not-checked";
export interface LetterCheck {
  id: "length" | "greeting" | "claims" | "copied" | "ai";
  name: string;
  state: CheckState;
  detail: string;
  /** The words concerned: sentences, copied runs or phrases. */
  items: string[];
}
export interface LetterScore {
  shown: number;
  parts: LetterPart[];
  checks: LetterCheck[];
  findings: LetterFinding[];
  words: number;
  paragraphs: string[];
  greeting: string | null;
  signoff: string | null;
}

const PART_NAMES: Record<LetterPartId, string> = { relevance: "Relevance", clarity: "Clarity", structure: "Structure", evidence: "Evidence" };
const GREETING = /^(?:dear\b.{1,60}|to whom it may concern|hello\b.{0,40}|hi\b.{0,40})[,:]?$/i;
const SIGNOFF = /^(?:yours (?:sincerely|faithfully|truly)|sincerely(?: yours)?|kind regards|best regards|warm regards|warmest regards|regards|best wishes|many thanks|with thanks|thank you|respectfully(?: yours)?)[,.]?$/i;
const FIGURE = /[£$€]\s?\d|\d+(?:[.,]\d+)?\s?(?:%|per ?cent)|\b\d{2,}\b|\b\d+\s+(?:hours?|days?|weeks?|months?|years?|people|staff|clients?|customers?|patients?|students?|pupils?|projects?|accounts?|stores?|sites?|teams?|beds?|cases?)\b/i;
const MOTIVE = /\b(?:because|so that|want to|would like to|keen to|drawn to|interested in|excited (?:by|about)|attracts? me|appeals? to me|why I|reason I)\b/i;
const APPLYING = /\b(?:apply|applying|application|role|position|post|job|vacancy|opportunity)\b/i;
const MINE = /(?<![\p{L}'’])(?:I|I['’](?:ve|m|d)|my|me)(?![\p{L}'’])/u;
/** A sentence that tells of the person's experience or results, rather than their wish to apply or their thanks. */
const EXPERIENCE = /(?<![\p{L}])(?:led|lead|managed|manage|ran|run|built|grew|cut|reduced|increased|raised|delivered|launched|created|designed|developed|trained|supervised|handled|achieved|won|improved|saved|wrote|taught|cared|supported|organised|organized|planned|introduced|set up|have (?:\d+|\w+) years?|years? of)(?![\p{L}])/iu;
/** Words that say nothing on their own about which requirement is meant. */
const GENERIC = new Set(["experience", "experienc", "skill", "abilit", "ability", "strong", "work", "team", "role", "excellent", "good", "knowledg", "understanding", "understand", "abl", "able", "requir", "essential", "desirabl", "including", "proven", "demonstrabl", "track", "record"]);

const wordCount = (text: string) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * Reads a letter into its greeting, its paragraphs and its sign-off. Address
 * and date lines above the greeting, and the name below the sign-off, are not
 * part of the body and do not count towards its length.
 */
export function letterParts(text: string): { greeting: string | null; signoff: string | null; paragraphs: string[] } {
  const clean = text.replace(/\r/g, "").trim();
  // Pasted without blank lines between paragraphs: each line is a paragraph.
  const blocks = (/\n\s*\n/.test(clean) ? clean.split(/\n\s*\n/) : clean.split("\n")).map((b) => b.trim()).filter(Boolean);
  let greeting: string | null = null;
  let signoff: string | null = null;
  const paragraphs: string[] = [];
  const before: string[] = [];
  for (const block of blocks) {
    if (signoff) break;
    const kept: string[] = [];
    for (const line of block.split("\n").map((l) => l.trim()).filter(Boolean)) {
      if (signoff) break;
      if (!greeting && !paragraphs.length && GREETING.test(line)) {
        greeting = line;
        before.length = 0;
        continue;
      }
      if (SIGNOFF.test(line)) {
        signoff = line;
        continue;
      }
      kept.push(line);
    }
    const prose = kept.join(" ").replace(/\s+/g, " ").trim();
    if (!prose) continue;
    // Above a greeting, only prose counts: a sentence of eight words or more that ends as a sentence does.
    const isProse = sentences(prose).some((s) => wordCount(s) >= (greeting || paragraphs.length ? 4 : 8) && (greeting ? true : /[.!?]["”’)]?$/.test(s)));
    if (isProse) paragraphs.push(prose);
    else if (!greeting && !paragraphs.length) before.push(prose);
  }
  return { greeting, signoff, paragraphs };
}

/** Runs of `n` or more words the letter shares, word for word, with the advert. */
export function copiedRuns(letter: string, advert: string, n = 8): string[] {
  const words = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s'’-]/gu, " ").split(/\s+/).filter(Boolean);
  const a = words(advert);
  const grams = new Set<string>();
  for (let i = 0; i + n <= a.length; i++) grams.add(a.slice(i, i + n).join(" "));
  const l = words(letter);
  const out: string[] = [];
  let i = 0;
  while (i + n <= l.length) {
    if (!grams.has(l.slice(i, i + n).join(" "))) {
      i++;
      continue;
    }
    let j = i + n;
    while (j < l.length && grams.has(l.slice(j - n + 1, j + 1).join(" "))) j++;
    out.push(l.slice(i, j).join(" "));
    i = j;
  }
  return out;
}

/** The things the advert asks for that the letter speaks to, by their distinctive words. */
export function requirementsCovered(letter: string, advert: string): { covered: number; total: number } {
  const reqs = extractRequirements(advert);
  const mine = new Set(terms(letter).map((t) => t.stem));
  const covered = reqs.filter((r) => {
    const key = [...new Set(terms(r.text || r.quote).filter((t) => t.text.length > 3 && !GENERIC.has(t.stem) && !GENERIC.has(t.text.toLowerCase())).map((t) => t.stem))];
    if (!key.length) return false;
    const hit = key.filter((k) => mine.has(k)).length;
    return hit >= Math.min(2, key.length) || hit / key.length >= 0.5;
  }).length;
  return { covered, total: reqs.length };
}

/**
 * The sentences about the person's experience or results that nothing on the
 * CV backs, found by the app's own letter check. Sentences about why they want
 * the job are not counted: a pasted letter comes without the reason the
 * builder would ask for.
 */
export function unsupportedClaims(paragraphs: string[], cvText: string, region: CvRegion, advert: string, now: Date): { sentence: string; why: string }[] {
  let read;
  try {
    read = readCvText(cvText);
  } catch {
    return [];
  }
  const cv: LetterCv = {
    contact: read.contact,
    sections: read.sections,
    region,
    requirements: [],
    target: advert ? { title: "", employer: "", advert } : undefined,
    letter: { ...emptyLetter(), paragraphs: paragraphs.map((p, i) => ({ id: `p_${i}`, role: "evidence" as const, sentences: splitSentences(p).map((t, j) => ({ id: `s_${i}_${j}`, text: t, origin: "typed" as const, sources: [] })) })) },
  };
  return reviewLetter(cv, now)
    .sentences.filter((s) => s.status === "unsupported" && EXPERIENCE.test(s.text) && !(MOTIVE.test(s.text) && !FIGURE.test(s.text)))
    .map((s) => ({ sentence: s.text, why: s.problems[0]?.say ?? "Nothing on your CV says this." }));
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function scoreLetter(text: string, opts: { region: CvRegion; cvText?: string; advert?: string; now?: Date }): LetterScore {
  const now = opts.now ?? new Date();
  const advert = (opts.advert ?? "").trim();
  const hasCv = (opts.cvText ?? "").replace(/\s/g, "").length >= 40;
  const { greeting, signoff, paragraphs } = letterParts(text);
  const body = paragraphs.join("\n\n");
  const all = paragraphs.flatMap((p) => splitSentences(p));
  const words = wordCount(body);
  const findings: LetterFinding[] = [];
  const find = (part: LetterPartId, quote: string, why: string, todo: string) => findings.push({ part, quote, why, todo });

  /* Structure: a greeting, an opening that says what is being applied for, three to six paragraphs, one page, a sign-off. */
  let structure = 0;
  if (greeting) structure += 4;
  else find("structure", "", "There is no greeting.", "Start with “Dear” and the person’s name, or “Dear Hiring Manager”.");
  if (signoff) structure += 4;
  else find("structure", "", "There is no sign-off.", opts.region === "us" ? "End with “Sincerely,” and your name." : "End with “Yours sincerely,” and your name (“Yours faithfully,” after “Dear Sir or Madam”).");
  if (paragraphs.length >= 3 && paragraphs.length <= 6) structure += 5;
  else find("structure", "", `The letter has ${plural(paragraphs.length, "paragraph")}.`, "Use three to six short paragraphs: why this job, what you have done that fits it, and a close.");
  if (words >= 250 && words <= 400) structure += 7;
  else if (words >= 180 && words <= 450) structure += 4;
  if (words < 250 || words > 400) find("structure", "", `The letter is ${plural(words, "word")} long.`, words < 250 ? "Aim for 250 to 400 words: add one or two examples from your CV." : "Keep it to one page, 250 to 400 words: cut the least specific sentences.");
  if (paragraphs[0] && APPLYING.test(paragraphs[0])) structure += 5;
  else if (paragraphs[0]) find("structure", splitSentences(paragraphs[0])[0] ?? "", "The opening doesn’t say what you are applying for.", "Name the job in the first sentence.");

  /* Clarity: sentences of a readable length, nothing that reads as a template, no filler. */
  let clarity = 0;
  const lengths = all.map(wordCount);
  const average = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const typical = Math.round(average);
  if (typical && typical <= 24) clarity += 8;
  else if (typical && typical <= 30) clarity += 4;
  if (typical > 24) find("clarity", "", `Sentences average ${typical} words.`, "Split long sentences: one idea each, under about 24 words.");
  const long = all.filter((s) => wordCount(s) > 40);
  if (all.length && !long.length) clarity += 4;
  for (const s of long.slice(0, 2)) find("clarity", s, "This sentence is over 40 words.", "Break it into two or three sentences.");
  const ai = [...new Set(all.flatMap((s) => aiTells(s)).map((w) => w.toLowerCase()))];
  if (all.length) clarity += Math.max(0, 8 - ai.length * 2);
  for (const p of ai.slice(0, 3)) find("clarity", p, "This phrase often reads as written by a template or a tool.", "Say it in your own plain words, or say what you did instead.");
  const fill = [...new Set(all.flatMap((s) => filler(s).map((h) => h.text.toLowerCase())))];
  if (all.length) clarity += Math.max(0, 5 - fill.length);
  if (fill.length) find("clarity", fill.slice(0, 4).join(", "), "These words add length but not meaning.", "Take them out.");

  /* Relevance: why this job, and what the advert asks for, in the person's own words. */
  let relevance = 0;
  let relevancePending = 0;
  if (MOTIVE.test(body)) relevance += 5;
  else find("relevance", "", "The letter doesn’t say why you want this job.", "Add one or two sentences on why this job and this employer, in your own words.");
  if (APPLYING.test(body)) relevance += 5;
  let copied: string[] = [];
  let coverage: { covered: number; total: number } | null = null;
  if (advert) {
    coverage = requirementsCovered(body, advert);
    relevance += coverage.total ? Math.round(10 * Math.min(1, coverage.covered / Math.max(1, Math.ceil(coverage.total * 0.5)))) : 0;
    if (coverage.total && coverage.covered < Math.ceil(coverage.total * 0.5)) find("relevance", "", `The letter speaks to ${coverage.covered} of the ${plural(coverage.total, "thing")} the advert asks for.`, "Pick two or three the advert stresses, and show each with an example from your CV.");
    copied = copiedRuns(body, advert);
    relevance += Math.max(0, 5 - copied.length * 2);
    for (const c of copied.slice(0, 2)) find("relevance", c, "These words are copied from the advert.", "Say how your own experience meets it, in your words.");
  } else relevancePending = 15;

  /* Evidence: specific figures and places, and claims the CV backs. */
  let evidence = 0;
  let evidencePending = 0;
  // A claim the CV doesn't back is not evidence, however specific it sounds.
  let claims: { sentence: string; why: string }[] = [];
  if (hasCv) claims = unsupportedClaims(paragraphs, opts.cvText!, opts.region, advert, now);
  const backed = (s: string) => !claims.some((c) => c.sentence === s);
  const aboutMe = all.filter((s) => MINE.test(s) && !MOTIVE.test(s) && backed(s));
  const specific = aboutMe.filter((s) => FIGURE.test(s));
  const share = aboutMe.length ? specific.length / aboutMe.length : 0;
  evidence += Math.round(10 * Math.min(1, share / 0.4));
  if (share < 0.25) find("evidence", "", "Few sentences about you say what changed, or how much.", "Add a number from your CV: how many, how much, how fast, or compared with what.");
  const named = /(?<![\p{L}])(?:at|for|with|in)\s+(?!I\b)\p{Lu}[\p{L}&'’-]+/u.test(all.filter(backed).join(" ").replace(/(?:^|[.!?]\s+)\p{Lu}/gu, " x"));
  if (named) evidence += 5;
  else find("evidence", "", "The letter doesn’t say where you did the work it describes.", "Name the employer, school or project: “At Kinetix Home I…”.");
  if (hasCv) {
    evidence += Math.max(0, 10 - claims.length * 5);
    for (const c of claims.slice(0, 3)) find("evidence", c.sentence, `Nothing on your CV backs this. ${c.why}`, "Say it in the words of a line on your CV, add that line to your CV, or take it out.");
  } else evidencePending = 10;

  const part = (id: LetterPartId, earned: number, pending: number): LetterPart => ({ id, name: PART_NAMES[id], points: 25, earned: Math.max(0, Math.min(25 - pending, earned)), pending });
  const parts = [part("relevance", relevance, relevancePending), part("clarity", clarity, 0), part("structure", structure, 0), part("evidence", evidence, evidencePending)];
  const checkable = parts.reduce((n, p) => n + p.points - p.pending, 0);
  const earned = parts.reduce((n, p) => n + p.earned, 0);
  const shown = paragraphs.length && checkable ? Math.round((earned / checkable) * 100) : 0;

  const checks: LetterCheck[] = [
    {
      id: "length",
      name: "Length",
      state: words >= 250 && words <= 400 && paragraphs.length >= 3 && paragraphs.length <= 6 ? "ok" : "review",
      detail: `${plural(words, "word")} in ${plural(paragraphs.length, "paragraph")}. One page is 250 to 400 words in three to six paragraphs.`,
      items: [],
    },
    {
      id: "greeting",
      name: "Greeting and sign-off",
      state: greeting && signoff ? "ok" : "review",
      detail: greeting && signoff ? `“${greeting}” and “${signoff}”.` : !greeting && !signoff ? "No greeting and no sign-off found." : !greeting ? "No greeting found." : "No sign-off found.",
      items: [greeting, signoff].filter((x): x is string => !!x),
    },
    {
      id: "claims",
      name: "Claims with no evidence",
      state: !hasCv ? "not-checked" : claims.length ? "review" : "ok",
      detail: !hasCv ? "CV not provided. Add your CV to check each claim against it." : claims.length ? `${plural(claims.length, "sentence")} about your experience that nothing on your CV backs.` : "Every claim about your experience is on your CV.",
      items: claims.map((c) => c.sentence),
    },
    {
      id: "copied",
      name: "Words copied from the advert",
      state: !advert ? "not-checked" : copied.length ? "review" : "ok",
      detail: !advert ? "Job advert not provided." : copied.length ? `${plural(copied.length, "run")} of eight or more words taken word for word from the advert.` : "No long runs of words copied from the advert.",
      items: copied,
    },
    {
      id: "ai",
      name: "AI-sounding phrases",
      state: ai.length ? "review" : "ok",
      detail: ai.length ? `${plural(ai.length, "phrase")} that often read as written by a template or a tool. This is a style check, not a judgement of who wrote it.` : "No stock phrases found.",
      items: ai,
    },
  ];
  return { shown, parts, checks, findings, words, paragraphs, greeting, signoff };
}

/**
 * Lines read from a PDF or Word letter, put back into paragraphs. A Word file
 * gives one line a paragraph; a PDF gives one line a printed line, so lines
 * are joined until one ends a sentence well short of the full width.
 */
export function linesToLetter(lines: string[]): string {
  const text = lines.map((l) => l.replace(/\t+/g, " ").trim());
  const widest = Math.max(0, ...text.map((l) => l.length));
  const out: string[] = [];
  let current = "";
  for (const line of text) {
    if (!line) {
      if (current) out.push(current);
      current = "";
      continue;
    }
    current = current ? `${current} ${line}` : line;
    const ends = /[.!?:,]["”’)]?$/.test(line) && line.length < widest * 0.85;
    if (GREETING.test(line) || SIGNOFF.test(line) || ends || line.length < 45) {
      out.push(current);
      current = "";
    }
  }
  if (current) out.push(current);
  return out.join("\n\n");
}
