import { type CvDoc, type Letter, type LetterSentence, type LetterSource, newId } from "../schema";
import { type Problem, checkGrounded } from "../write/check";
import { figures, oneLine, stem, terms } from "../write/facts";
import { type LetterCv, type Pool, type PoolSource, poolOf, sourceState } from "./sources";

/**
 * The review every sentence of a cover letter goes through, whoever wrote it:
 * drafted for the person or typed by them. It is code, not judgement.
 *
 *  - What a sentence says about the person (experience, results, motivation)
 *    must be in their CV, their reason for applying or a note they added.
 *  - What it says about the employer must be in the advert.
 *  - Words from the advert do not become the person's experience by being
 *    repeated in the first person.
 *
 * A sentence that passes carries the lines it rests on. One that does not is
 * marked with the exact words that have no source.
 */

/** Words a letter needs that carry no claim: asking, thanking, naming the role. They need no source. */
export const LETTER_GLUE = `apply applying applied application role position post job vacancy advert advertisement advertised opportunity
interest interested keen want wanted like hope welcome chance discuss discussion talk speak meet interview forward hearing hear
thank thanks time consideration consider considering attached enclosed attach enclose cv resume résumé letter available contact reach
team company organisation organization employer please believe think feel experience experienced skills skill background
work worked working career example examples show shows shown showed demonstrate demonstrates demonstrated bring offer contribute
contribution contributing help asks ask asked asking need needs looking look seek seeks seeking says say said mention mentions
mentioned describe describes described require requires required requirement requirements essential desirable part recently
currently previously now today already still own further detail details information happy glad pleased convenient soon reply
response reading read see saw noticed way ways particular particularly especially because reason reasons first also addition
additionally finally lastly too together year years month months date dates level levels`.split(/\s+/);

/** "I'm", "I'd", "don't": the short forms of words that carry no claim, with either kind of apostrophe. */
const CONTRACTIONS = "i'm i've i'd i'll you're you've you'll you'd we're we've we'd we'll it's that's there's what's who's let's don't doesn't didn't isn't wasn't weren't aren't can't won't couldn't wouldn't shouldn't haven't hasn't hadn't".split(" ");
const ALLOWED = [...LETTER_GLUE, ...CONTRACTIONS, ...CONTRACTIONS.map((c) => c.replace("'", "’"))];
const GLUE_STEMS = new Set(ALLOWED.map(stem));

const FIRST = /(?<![\p{L}\p{N}])(?:I|I['’](?:m|ve|d|ll)|[Mm]y|[Mm]e|[Mm]yself|[Mm]ine)(?![\p{L}\p{N}])/u;
const SECOND = /(?<![\p{L}\p{N}])(?:you|your|yours|you['’](?:re|ve|ll|d))(?![\p{L}\p{N}])/iu;
const JOB_REF = /\b(?:the|this) (?:role|post|position|job|advert|advertisement|vacancy|opportunity|team|company|organisation|organization|department)\b/i;

/** Saying what the person wants, or thanking: a wish may name what the advert describes. */
const INTENT = new RegExp(
  [
    String.raw`\bI(?:['’]m| am| was)\s+(?:(?:very|really|particularly|especially|also|now)\s+)?(?:applying|keen|interested|excited|pleased|delighted|drawn|eager|looking|attracted|writing)\b`,
    String.raw`\bI(?:['’]d| would)\s+(?:(?:very much|really|also|particularly)\s+)?(?:like|love|welcome|be glad|be happy|be pleased|be delighted|value|enjoy|relish)\b`,
    String.raw`\bI\s+(?:(?:also|really|particularly)\s+)?(?:want|hope|wish|look forward|enclose|attach|admire|noticed|saw|read|understand|apply)\b`,
    String.raw`\bhow I (?:could|can|might|would) (?:contribute|help|support)\b`,
    String.raw`\bI could contribute\b`,
    String.raw`\bthank you\b`,
    String.raw`\bappeals? to me\b`,
    String.raw`\bmy (?:application|interest)\b`,
    String.raw`\b(?:drew|draws|attracted|attracts|brought|brings) me to\b`,
    String.raw`\bwhy I(?:['’]m| am)? (?:applying|want)\b`,
  ].join("|"),
  "i",
);
/** Saying what the person has done, knows or is: this must be theirs, never the advert's. */
const EXPERIENCE = new RegExp(
  [
    String.raw`\b(?:experience|experienced|background|expertise|expert|skilled|skills?|proficient|proficiency|fluent|qualified|qualifications?|trained|knowledge|familiar|familiarity|track record|career|certified|certificate|degree|years?|months?)\b`,
    String.raw`\bI(?:['’]ve| have| had)\s+(?:(?:also|already|recently|previously)\s+)?\p{L}+(?:ed|en)\b`,
    String.raw`\bI\s+(?:(?:also|then|recently|previously)\s+)?(?:used|worked|led|ran|built|managed|trained|taught|wrote|made|did|know|can)\b`,
  ].join("|"),
  "iu",
);

export type About = "me" | "employer" | "both" | "neither";

export interface Clause {
  text: string;
  about: About;
}

/**
 * A sentence in the parts that can be about different people: "Your advert
 * asks for volunteer training; I trained 40 volunteers" is one clause about
 * the employer and one about the person. A part that names nobody belongs
 * with the part before it.
 */
export function clausesOf(sentence: string, employerName = ""): Clause[] {
  const parts = sentence
    .split(/\s*;\s+|\s+[–—]\s+|:\s+|,\s+(?=(?:and|but|so|which|where|while|whereas|because)\s)/)
    .map((p) => p.trim())
    .filter((p) => /[\p{L}\p{N}]/u.test(p));
  const name = employerName.trim().toLowerCase();
  const raw = parts.map((text) => {
    const first = FIRST.test(text);
    const second = SECOND.test(text) || JOB_REF.test(text) || (name.length >= 3 && text.toLowerCase().includes(name));
    return { text, about: (first && second ? "both" : first ? "me" : second ? "employer" : "neither") as About };
  });
  // "…, which I did for three years": a part with no subject of its own follows the one before, or the one after if it comes first.
  for (let i = 0; i < raw.length; i++) if (raw[i].about === "neither" && i > 0) raw[i].about = raw[i - 1].about;
  for (let i = raw.length - 2; i >= 0; i--) if (raw[i].about === "neither") raw[i].about = raw[i + 1].about;
  return raw;
}

export type SentenceStatus = "sourced" | "plain" | "unsupported";

export interface Checked {
  status: SentenceStatus;
  problems: Problem[];
  /** The lines this sentence rests on, as they read now. Empty for a sentence that claims nothing. */
  sources: PoolSource[];
}

const q = (s: string) => `“${s}”`;
const MINE = "your CV, your reason or your notes";
const THEIRS = "the advert’s words";
/** "one" is nearly always a pronoun in a letter ("one that…", "no one"), not a count. */
const letterFigures = (text: string) => figures(text).filter((f) => f.text.toLowerCase() !== "one");
/** Stock openings whose words would otherwise read as claims: "I am writing to apply" says nothing about writing. */
const neutral = (text: string) => text.replace(/\bwriting to (apply|express|ask|enquire|inquire|introduce)\b/gi, "$1").replace(/\bplease find\b/gi, "please");

interface Indexed {
  source: PoolSource;
  stems: Set<string>;
  figures: Set<string>;
}
const index = (list: PoolSource[]): Indexed[] => list.map((source) => ({ source, stems: new Set(terms(source.text).map((t) => t.stem)), figures: new Set(letterFigures(source.text).map((f) => f.key)) }));
/** The words and figures of every source, read once for each pool: a letter is checked on every keystroke. */
const indexed = new WeakMap<Pool, { personal: Indexed[]; employer: Indexed[]; job: Indexed[] }>();
function indexOf(pool: Pool) {
  let x = indexed.get(pool);
  if (!x) indexed.set(pool, (x = { personal: index(pool.personal), employer: index(pool.employer), job: index(pool.job) }));
  return x;
}

/** Checks one sentence against what the letter may rest on. */
export function checkSentence(sentence: string, pool: Pool): Checked {
  const text = oneLine(sentence);
  const problems: Problem[] = [];
  const used: Indexed[] = [];
  const { personal, employer, job } = indexOf(pool);
  const has = (list: Indexed[], s: string) => list.some((x) => x.stems.has(s));
  const hasFigure = (list: Indexed[], key: string) => list.some((x) => x.figures.has(key));

  for (const clause of clausesOf(text, pool.employerName)) {
    const words = neutral(clause.text);
    const mine = clause.about === "me" || clause.about === "both";
    const wish = INTENT.test(words) && !EXPERIENCE.test(words);
    // What this clause may rest on, in the order its sources are named.
    const allowed: Indexed[] = clause.about === "employer" ? [...employer, ...job] : mine ? [...job, ...personal, ...(wish ? employer : [])] : EXPERIENCE.test(words) ? [...job, ...personal] : [...job, ...personal, ...employer];
    const whose = clause.about === "employer" ? THEIRS : MINE;
    // Only a line that shares a word or a figure with this clause can bear on it.
    const stems = new Set(terms(words).map((t) => t.stem));
    const keys = new Set(figures(words).map((f) => f.key));
    const near = allowed.filter((a) => [...stems].some((x) => a.stems.has(x)) || [...keys].some((k) => a.figures.has(k)));
    const verdict = checkGrounded(words, near.map((a) => a.source.text), { allow: ALLOWED, whose });
    const other = clause.about === "employer" ? personal : employer;
    for (const p of verdict.problems) {
      const word = p.proposed ?? "";
      if (p.kind === "added-figure" && word.toLowerCase() === "one") continue;
      const key = p.kind === "added-figure" ? (figures(word)[0]?.key ?? "") : "";
      const elsewhere = p.kind === "added-word" ? has(other, stem(word)) : p.kind === "added-figure" ? hasFigure(other, key) : false;
      if ((p.kind === "added-word" || p.kind === "added-figure") && elsewhere) {
        problems.push(
          clause.about === "employer"
            ? { ...p, say: `This says ${q(word)} about the employer. That is in your own CV or notes, not in the advert.` }
            : { ...p, say: `${q(word)} is in the advert, not in ${MINE}. As written, this says it is yours.` },
        );
      } else if (p.kind === "added-word" || p.kind === "added-figure") {
        problems.push({ ...p, say: `This says ${q(word)}, which isn’t in ${clause.about === "employer" ? "the advert" : MINE}.` });
      } else problems.push(p);
    }
    // A figure counts something: it must come from a line that has it about the same thing. "Six pupils" in one
    // line does not back "six new starters" in a sentence.
    for (const f of letterFigures(words)) {
      const holders = allowed.filter((a) => a.figures.has(f.key));
      if (!holders.length) continue;
      const after = terms(words.slice(f.index + f.text.length)).slice(0, 2);
      const about = after.length ? after : terms(words.slice(0, f.index)).slice(-2);
      if (!about.length || holders.some((a) => about.some((t) => a.stems.has(t.stem)))) continue;
      const phrase = after.length ? `${f.text} ${after.map((t) => t.text).join(" ")}` : `${about.map((t) => t.text).join(" ")} ${f.text}`;
      problems.push({ kind: "added-figure", proposed: f.text, say: `No line in ${clause.about === "employer" ? "the advert" : MINE} says ${q(phrase)}: the figure ${q(f.text)} is there about something else.` });
    }
    if (!verdict.ok || problems.length) continue;
    // Name the fewest lines that between them hold everything this clause claims.
    // Glue words ("apply", "role", "thank") need no source of their own.
    const claims = new Set(terms(words).map((t) => t.stem).filter((s) => !GLUE_STEMS.has(s) && has(allowed, s)));
    const needFigures = new Set(letterFigures(words).map((f) => f.key).filter((k) => hasFigure(allowed, k)));
    // A line already named for an earlier part of the sentence covers what it holds here too.
    for (const u of used) {
      if (!allowed.includes(u)) continue;
      for (const s of [...claims]) if (u.stems.has(s)) claims.delete(s);
      for (const k of [...needFigures]) if (u.figures.has(k)) needFigures.delete(k);
    }
    let guard = 0;
    while ((claims.size || needFigures.size) && guard++ < 4) {
      let best: Indexed | null = null;
      let bestN = 0;
      for (const a of allowed) {
        if (used.includes(a)) continue;
        const n = [...claims].filter((s) => a.stems.has(s)).length + [...needFigures].filter((k) => a.figures.has(k)).length * 2;
        if (n > bestN) {
          best = a;
          bestN = n;
        }
      }
      // Nothing new to name: what is left is held by a line already named for an earlier clause.
      if (!best) break;
      used.push(best);
      for (const s of [...claims]) if (best.stems.has(s)) claims.delete(s);
      for (const k of [...needFigures]) if (best.figures.has(k)) needFigures.delete(k);
    }
  }

  if (problems.length) return { status: "unsupported", problems: dedupe(problems), sources: [] };
  return { status: used.length ? "sourced" : "plain", problems: [], sources: used.slice(0, 6).map((u) => u.source) };
}

function dedupe(list: Problem[]): Problem[] {
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.say) ? false : (seen.add(p.say), true)));
}

/* ------------------------------------------------------------ whole letter */

export interface SourceChange {
  was: LetterSource;
  state: "changed" | "off" | "gone";
  /** How the line reads now, when it is still there. */
  now?: string;
}

export interface SentenceReview extends Checked {
  paragraphId: string;
  sentenceId: string;
  text: string;
  /** "review": something this sentence was checked against has changed since. */
  state: SentenceStatus | "review";
  changed: SourceChange[];
}

export interface LetterReview {
  sentences: SentenceReview[];
  /** Sentences that must be dealt with before the letter can be downloaded. */
  open: SentenceReview[];
  words: number;
}

const asSource = (s: PoolSource): LetterSource => ({ kind: s.kind, at: s.at, noteId: s.noteId, text: s.text });

/** Reviews every sentence of the letter against the CV, the reason, the notes and the advert as they are now. */
export function reviewLetter(cv: LetterCv, now: Date): LetterReview {
  const letter = cv.letter;
  if (!letter) return { sentences: [], open: [], words: 0 };
  const pool = poolOf(cv, now);
  const out: SentenceReview[] = [];
  for (const p of letter.paragraphs) {
    for (const s of p.sentences) {
      if (!s.text.trim()) continue;
      const checked = checkSentence(s.text, pool);
      const changed: SourceChange[] = [];
      for (const was of s.sources) {
        const st = sourceState(was, cv, pool);
        if (st.state !== "same") changed.push({ was, state: st.state, now: st.now });
      }
      out.push({ ...checked, paragraphId: p.id, sentenceId: s.id, text: s.text, state: changed.length ? "review" : checked.status, changed });
    }
  }
  const words = letter.paragraphs.reduce((n, p) => n + p.sentences.reduce((m, s) => m + s.text.split(/\s+/).filter(Boolean).length, 0), 0);
  return { sentences: out, open: out.filter((s) => s.state === "unsupported" || s.state === "review"), words };
}

/**
 * Notes, for each sentence that has just been written or changed, the lines it
 * passed against: that is what a later change is compared with. Sentences that
 * already have their lines noted are left alone, so a change to one of those
 * lines still shows as "Review source".
 */
export function recordSources(letter: Letter, cv: LetterCv, now: Date): Letter {
  const pool = poolOf({ ...cv, letter }, now);
  let touched = false;
  const paragraphs = letter.paragraphs.map((p) => ({
    ...p,
    sentences: p.sentences.map((s) => {
      if (s.sources.length || !s.text.trim()) return s;
      const c = checkSentence(s.text, pool);
      if (c.status !== "sourced") return s;
      touched = true;
      return { ...s, sources: c.sources.map(asSource) };
    }),
  }));
  return touched ? { ...letter, paragraphs } : letter;
}

/** "It still holds": the sentence is checked against its lines as they read now, and those are noted in place of the old ones. Null when it no longer passes. */
export function acceptSources(letter: Letter, sentenceId: string, cv: LetterCv, now: Date): Letter | null {
  const pool = poolOf({ ...cv, letter }, now);
  let ok = false;
  const paragraphs = letter.paragraphs.map((p) => ({
    ...p,
    sentences: p.sentences.map((s) => {
      if (s.id !== sentenceId) return s;
      const c = checkSentence(s.text, pool);
      if (c.status === "unsupported") return s;
      ok = true;
      return { ...s, sources: c.sources.map(asSource) };
    }),
  }));
  return ok ? { ...letter, paragraphs } : null;
}

/* ------------------------------------------------------- editing sentences */

const ABBREVIATION = /(?:\b(?:e\.g|i\.e|etc|approx|vs|no|mr|mrs|ms|dr|prof|st|inc|ltd|co|dept)\.|\b[A-Z]\.)$/i;

/** A paragraph's text as its sentences, each kept exactly as typed. */
export function splitSentences(text: string): string[] {
  const pieces = oneLine(text).split(/(?<=[.!?…]["”’)]?)\s+(?=["“‘(]?[A-Z0-9£$€])/);
  const out: string[] = [];
  for (const piece of pieces) {
    const last = out[out.length - 1];
    // "e.g. Spectrum" and "Dr. Lee" are not the end of a sentence.
    if (last !== undefined && ABBREVIATION.test(last)) out[out.length - 1] = `${last} ${piece}`;
    else if (piece.trim()) out.push(piece.trim());
  }
  return out;
}

/**
 * A paragraph after its text was edited. A sentence that reads exactly as it
 * did keeps its id and the lines it rests on; one that was changed or added is
 * a new sentence, to be checked afresh.
 */
export function reflow(old: LetterSentence[], text: string): LetterSentence[] {
  const left = [...old];
  return splitSentences(text)
    .slice(0, 12)
    .map((t) => {
      const at = left.findIndex((s) => s.text === t);
      if (at >= 0) return left.splice(at, 1)[0];
      return { id: newId("ls_"), text: t.slice(0, 700), origin: "typed" as const, sources: [] };
    });
}

/** A paragraph as the text in its box. */
export const paragraphText = (p: { sentences: { text: string }[] }) => p.sentences.map((s) => s.text).join(" ");

/** True when the letter has no words in it yet. */
export const letterIsEmpty = (letter?: Pick<CvDoc, "letter">["letter"]) => !letter || !letter.paragraphs.some((p) => p.sentences.some((s) => s.text.trim()));
