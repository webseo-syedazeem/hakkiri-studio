import { type CvRegion, type Letter, type LetterParagraph, type LetterSentence, type Locator, isEntrySection, newId } from "../schema";
import { assess } from "../tailor/fit";
import { oneLine, sentences } from "../write/facts";
import { type SentenceReview, checkSentence, paragraphText } from "./check";
import { type LetterCv, type Pool, poolOf, sameAt } from "./sources";

/**
 * A cover letter assembled by rule from what the person gave: their reason,
 * in their words, opens it; each line of the CV they chose becomes a sentence
 * that says the same thing in the first person; a short close ends it. No
 * word that carries a claim is added. It is what runs in test mode, and what
 * the person gets when the AI draft does not pass the source check.
 */

/* -------------------------------------------------------------------- voice */

export interface Voice {
  /** The person writes "I'm" and "don't" rather than "I am" and "do not". */
  contractions: boolean;
  /** Their own word for it. */
  roleWord: "role" | "position" | "job" | "post";
  talkWord: "discuss" | "talk about";
}

const CONTRACTED = /\b(?:I['’](?:m|ve|d|ll)|(?:do|does|did|is|was|were|are|ca|wo|could|would|should|have|has|had)n['’]t|(?:it|that|there|what|he|she)['’]s|(?:we|you|they)['’](?:re|ve|ll|d))(?![\p{L}])/giu;
const EXPANDED = /\b(?:I am|I have|I would|I will|do not|does not|did not|is not|was not|cannot|can not|will not|could not|would not|it is|that is|we are|we have|you are|they are)\b/gi;

/** How the person writes, read from their own text: the reason they gave and any passage they pointed to. */
export function voiceOf(texts: string[]): Voice {
  const all = texts.join("\n");
  const count = (re: RegExp) => [...all.matchAll(re)].length;
  const contractions = count(CONTRACTED) > count(EXPANDED);
  const words = (["role", "position", "job", "post"] as const).map((w) => ({ w, n: count(new RegExp(`\\b${w}\\b`, "gi")) })).sort((a, b) => b.n - a.n);
  return { contractions, roleWord: words[0].n > 0 ? words[0].w : "role", talkWord: /\bdiscuss/i.test(all) ? "discuss" : contractions ? "talk about" : "discuss" };
}

/** The sign-off that goes with a greeting: by name, "Yours sincerely"; to nobody named, "Yours faithfully". "Sincerely" in the US. */
export function defaultSignoff(region: CvRegion, recipient: string): string {
  if (region === "us") return "Sincerely";
  return recipient.trim() ? "Yours sincerely" : "Yours faithfully";
}

export const greeting = (recipient: string) => `Dear ${recipient.trim() || "Hiring Manager"},`;

/* ---------------------------------------------------------------- sentences */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Lower-cases the first letter unless the word is a name or an acronym ("IT", "SQL", "iOS"). */
const lowerFirst = (s: string) => (/^\p{Lu}[\p{Ll}'’-]+(?:\s|$)/u.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const END = /[.;,\s]+$/;
/** Text as a sentence: a capital first and a full stop last, and nothing else touched. */
export const asSentence = (text: string) => {
  const t = oneLine(text);
  return /[.!?…]["”’)]?$/.test(t) ? cap(t) : `${cap(t)}.`;
};

const PAST = /^(?:\p{Lu}\p{L}+ed|Led|Ran|Built|Wrote|Won|Cut|Grew|Made|Set|Took|Gave|Held|Kept|Brought|Began|Taught|Sold|Drove|Oversaw|Rebuilt|Rewrote|Undertook|Dealt|Paid|Bought|Became|Got|Drew|Stood|Spoke|Met|Found|Sent|Spent|Chose|Did)\b/u;
/** Words ending "-ed" that open a line as a description, not as something done. */
const DESCRIBING = /^(?:Dedicated|Experienced|Skilled|Advanced|Detailed|Trusted|Qualified|Certified|Chartered|Registered|Accomplished|Motivated|Talented|Seasoned|Accredited|Licensed|Proven|Committed|Focused|Driven)\b|^\p{Lu}\p{L}+ed(?:,| and\b| or\b)/u;
const GERUND = /^\p{Lu}\p{L}+ing\b/u;
/**
 * Lines about a current role are often in the present: "Catalogue incoming
 * maps". Only verbs that are not also everyday job-title nouns are taken as
 * such ("Lead developer" and "Support for three teams" are not things done).
 */
const PRESENT = new RegExp(
  `^(?:${"Manage Catalogue Maintain Coordinate Co-ordinate Organise Organize Prepare Create Handle Analyse Analyze Monitor Oversee Supervise Teach Advise Assist Provide Produce Serve Sell Negotiate Draft Edit Implement Improve Operate Respond Resolve Translate Answer Collect Communicate Conduct Ensure Liaise Deliver Develop Build Write Run Train Mentor Coach Recruit Publish Compile Prioritise Prioritize Investigate Evaluate Assess Inspect Install Repair Arrange Host Facilitate Moderate Administer Reconcile Calculate Proofread Transcribe Digitise Digitize Restore Conserve Curate Greet Welcome Keep Make"
    .split(" ")
    .join("|")})\\s+(?!of\\b|for\\b|at\\b|in\\b|to\\b)`,
  "u",
);

interface Line {
  text: string;
  title: string;
  org: string;
  entryId: string;
}

function lineAt(cv: LetterCv, at: Locator): Line | null {
  for (const s of cv.sections) {
    if (s.id !== at.section || !s.visible || !isEntrySection(s)) continue;
    const e = s.entries.find((x) => x.id === at.entry && x.visible);
    const b = e?.bullets.find((x) => x.id === at.field && x.visible && x.text.trim());
    if (e && b) return { text: b.text, title: e.title.trim(), org: e.org.trim(), entryId: e.id };
  }
  return null;
}

/**
 * A line of the CV as a sentence of a letter: the same words, in the first
 * person, with where it happened. "Catalogued 3,200 maps" at Paper Kite
 * Archive becomes "At Paper Kite Archive, I catalogued 3,200 maps."
 */
export function lineSentence(cv: LetterCv, at: Locator, also = false): string | null {
  const line = lineAt(cv, at);
  if (!line) return null;
  const body = oneLine(line.text).replace(END, "");
  const where = line.org ? `At ${line.org}` : line.title ? `As ${lowerFirst(line.title)}` : "";
  const intro = also || !where ? "" : `${where}, `;
  const and = also ? "also " : "";
  let text: string;
  if (/^Responsible for\b/i.test(body)) text = `${intro}I was ${and}${lowerFirst(body)}`;
  else if ((PAST.test(body) && !DESCRIBING.test(body)) || PRESENT.test(body)) text = `${intro}I ${and}${lowerFirst(body)}`;
  else if (GERUND.test(body)) text = `${intro}${intro ? "my" : "My"} work ${and}included ${lowerFirst(body)}`;
  // Not something that can be turned into "I …" safely: it is quoted as it stands.
  else text = where && !also ? `${where}: ${body}` : body;
  return asSentence(text);
}

const ASKS = /^(?:experience|experienced|knowledge|ability|able|a |an |strong|excellent|good|proven|fluent|fluency|understanding|familiarity|skills?|confidence|confident|track record|demonstrable|working|practical|sound|solid|previous|prior|relevant|significant|some|at least)/i;

/** A sentence saying what the advert asks for, for the requirement a chosen line is evidence of. Null when the line is not evidence for any. */
function advertLead(cv: LetterCv, at: Locator, pool: Pool): string | null {
  const rows = assess(cv)
    .filter((r) => r.status !== "missing" && r.lines.some((l) => sameAt(l.at, at)))
    .sort((a, b) => b.earned - a.earned);
  for (const row of rows) {
    const text = oneLine(row.requirement.text || row.requirement.quote).replace(END, "");
    const quote = oneLine(row.requirement.quote);
    const tries = [ASKS.test(text) ? `Your advert asks for ${lowerFirst(text)}.` : "", quote.length <= 160 && !/[.!?]\s/.test(quote) ? `Your advert says: “${quote.replace(END, "")}”.` : ""];
    for (const t of tries) if (t && checkSentence(t, pool).status !== "unsupported") return t;
  }
  return null;
}

const made = (text: string, pool: Pool): LetterSentence => {
  const c = checkSentence(text, pool);
  return { id: newId("ls_"), text, origin: "drafted", sources: c.sources.map((s) => ({ kind: s.kind, at: s.at, noteId: s.noteId, text: s.text })) };
};
const para = (role: LetterParagraph["role"], sentences: LetterSentence[]): LetterParagraph => ({ id: newId("lp_"), role, sentences });

export interface RuleDraft {
  paragraphs: LetterParagraph[];
  signoff: string;
  /** Things left out, and why, in words for the person. */
  notes: string[];
}

/** The letter, assembled by rule. Every sentence in it has passed the source check. */
export function letterByRule(cv: LetterCv, now: Date): RuleDraft {
  const letter = cv.letter;
  const pool = poolOf(cv, now);
  const notes: string[] = [];
  const voice = voiceOf([letter?.reason ?? "", letter?.voice ?? ""]);
  const title = cv.target?.title.trim() ?? "";
  const employer = cv.target?.employer.trim() ?? "";
  const ok = (t: string) => checkSentence(t, pool).status !== "unsupported";

  // Opening: the role, then the person's reason in their own words.
  const applying = `${voice.contractions ? "I’m" : "I am"} applying for ${title ? `the ${title} ${voice.roleWord}` : `this ${voice.roleWord}`}${employer ? ` at ${employer}` : ""}.`;
  const opening = [made(applying, pool)];
  let words = 0;
  let left = 0;
  for (const s of sentences(letter?.reason ?? "")) {
    const text = asSentence(s);
    const n = text.split(/\s+/).length;
    if (opening.length >= 4 || words + n > 90) break;
    if (!ok(text)) {
      left++;
      continue;
    }
    opening.push(made(text, pool));
    words += n;
  }
  if (left) notes.push(`${left === 1 ? "One sentence" : `${left} sentences`} of your reason ${left === 1 ? "was" : "were"} left out: ${left === 1 ? "it says" : "they say"} something about the employer that isn’t in the advert.`);

  // Evidence: one paragraph for each role the chosen lines come from.
  const groups: { entryId: string; lines: Locator[] }[] = [];
  for (const at of (letter?.evidence ?? []).slice(0, 3)) {
    const line = lineAt(cv, at);
    if (!line) {
      notes.push("A line you chose is no longer on this version, so it was left out.");
      continue;
    }
    const g = groups.find((x) => x.entryId === line.entryId);
    if (g) g.lines.push(at);
    else groups.push({ entryId: line.entryId, lines: [at] });
  }
  const evidence = groups.map((g) => {
    const out: LetterSentence[] = [];
    const lead = advertLead(cv, g.lines[0], pool);
    if (lead) out.push(made(lead, pool));
    g.lines.forEach((at, i) => {
      const text = lineSentence(cv, at, i > 0);
      if (text && ok(text)) out.push(made(text, pool));
    });
    return para("evidence", out);
  });

  const close = [`${voice.contractions ? "I’d" : "I would"} welcome the chance to ${voice.talkWord} how I could contribute${employer ? ` to ${employer}` : ""}.`, "Thank you for considering my application."].filter(ok).map((t) => made(t, pool));

  return {
    paragraphs: [para("opening", opening), ...evidence.filter((p) => p.sentences.length), para("close", close)],
    signoff: voice.contractions ? "Kind regards" : defaultSignoff(cv.region, letter?.recipient ?? ""),
    notes,
  };
}

/** Three empty paragraphs to write in: an opening, the evidence and a close. */
export const blankParagraphs = (): LetterParagraph[] => [para("opening", []), para("evidence", []), para("close", [])];

/** Puts a line of the CV into the letter as a sentence: in the last evidence paragraph, or a new one before the close. */
export function insertEvidence(letter: Letter, cv: LetterCv, at: Locator, now: Date): Letter | null {
  const pool = poolOf({ ...cv, letter }, now);
  const last = [...letter.paragraphs].reverse().find((p) => p.role === "evidence");
  const lineHere = lineAt(cv, at);
  if (!lineHere) return null;
  // "I also …" only reads right after a sentence from the same role.
  const sameRole = !!last?.sentences.some((s) => s.sources.some((x) => x.kind === "cv" && x.at?.entry === lineHere.entryId));
  const text = lineSentence(cv, at, sameRole);
  if (!text) return null;
  const sentence = made(text, pool);
  if (last && last.sentences.length < 12) return { ...letter, paragraphs: letter.paragraphs.map((p) => (p.id === last.id ? { ...p, sentences: [...p.sentences, sentence] } : p)) };
  const closeAt = letter.paragraphs.findIndex((p) => p.role === "close");
  const at2 = closeAt < 0 ? letter.paragraphs.length : closeAt;
  return { ...letter, paragraphs: [...letter.paragraphs.slice(0, at2), para("evidence", [sentence]), ...letter.paragraphs.slice(at2)].slice(0, 8) };
}

/* --------------------------------------------------------------- shortening */

const TIDY: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\b(?:successfully|effectively|efficiently|proactively|actively|basically|essentially|actually|really|very|extremely|truly)\s+/gi, ""],
  [/\ba (?:wide )?(?:range|variety) of\s+/gi, ""],
  [/\bas well as\b/gi, "and"],
  [/\bat this (?:moment|point) in time\b/gi, "now"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bwith regards? to\b/gi, "about"],
  [/\bI am writing to apply\b/g, "I am applying"],
  [/\bI’m writing to apply\b/g, "I’m applying"],
];

/** A sentence with its filler cut. The same text when there is nothing to cut. */
export function tidySentence(text: string): string {
  let t = oneLine(text);
  for (const [re, to] of TIDY) t = t.replace(re, to);
  return cap(t.replace(/\s+([,.;])/g, "$1").replace(/\s{2,}/g, " ").trim());
}

export interface Shortening {
  id: string;
  label: string;
  /** The paragraph as it would read. */
  paragraph: LetterParagraph;
  /** Words saved. */
  saves: number;
}

const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;

/**
 * Ways to make a paragraph shorter that keep every source: cutting filler
 * words, or taking out one whole sentence. A sentence that stays is not
 * reworded, so it still rests on the same lines.
 */
export function shortenings(paragraph: LetterParagraph, reviews: SentenceReview[]): Shortening[] {
  const out: Shortening[] = [];
  const before = wordCount(paragraphText(paragraph));
  const tidied = paragraph.sentences.map((s) => {
    const t = tidySentence(s.text);
    // A reworded sentence is checked afresh against the same lines.
    return t === s.text ? s : { ...s, id: newId("ls_"), text: t, sources: [] };
  });
  const tidy = { ...paragraph, sentences: tidied };
  if (wordCount(paragraphText(tidy)) < before) out.push({ id: "tidy", label: "Cut filler words", paragraph: tidy, saves: before - wordCount(paragraphText(tidy)) });
  if (paragraph.sentences.length > 1) {
    // Sentences that claim nothing go first, then what the advert says, then the rest from the end.
    const rank = (s: LetterSentence) => {
      const r = reviews.find((x) => x.sentenceId === s.id);
      if (!r || r.state === "plain") return 0;
      if (r.sources.length && r.sources.every((x) => x.kind === "advert" || x.kind === "job")) return 1;
      return 2;
    };
    const order = paragraph.sentences.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s) - rank(b.s) || b.i - a.i);
    for (const { s } of order.slice(0, 3)) {
      // Cut at a word, never through one.
      const text = s.text.length > 70 ? `${s.text.slice(0, 68).replace(/\s+\S*$/, "")}…` : s.text;
      out.push({ id: `drop-${s.id}`, label: `Take out: “${text}”`, paragraph: { ...paragraph, sentences: paragraph.sentences.filter((x) => x.id !== s.id) }, saves: wordCount(s.text) });
    }
  }
  return out;
}
