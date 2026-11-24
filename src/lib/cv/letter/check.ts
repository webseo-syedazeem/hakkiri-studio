import { type CvDoc, type Letter, type LetterSentence, type LetterSource, newId } from "../schema";
import { type Problem, checkGrounded } from "../write/check";
import { figures, negated, oneLine, stem, terms } from "../write/facts";
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

/** Words a letter needs that carry no claim: asking, thanking, naming the role, joining sentences. They need no source. */
export const LETTER_GLUE = `apply applying applied application role position post job vacancy advert advertisement advertised opportunity
interest interested keen want wanted like hope welcome chance discuss discussion talk speak meet interview forward hearing hear
thank thanks time consideration consider considering attached enclosed attach enclose cv resume résumé letter available contact reach
team company organisation organization employer please believe think feel experience experienced skills skill background
work worked working career example examples show shows shown showed demonstrate demonstrates demonstrated bring offer contribute
contribution contributing help asks ask asked asking need needs looking look seek seeks seeking says say said mention mentions
mentioned describe describes described require requires required requirement requirements essential desirable part recently
currently previously now today already still own further detail details information happy glad pleased convenient soon reply
response reading read see saw noticed way ways particular particularly especially because reason reasons first also addition
additionally finally lastly too together year years month months date dates level levels
however therefore moreover furthermore although though meanwhile indeed overall firstly secondly thirdly instead otherwise
nevertheless similarly likewise thus hence grateful appreciate appreciated kind kindly hesitate convenience earliest take taking
let know live living based graduated graduate studied study studying completed complete gained obtained hold received start
starting begin immediately notice responsible able confirm note regarding candidate person someone learn learning develop
developing understand understood if whether unless once anything something everything nothing else other others another same
many much few several ever often always sometimes usually even quite rather perhaps`.split(/\s+/);

/** "I'm", "I'd", "don't": the short forms of words that carry no claim, with either kind of apostrophe. */
const CONTRACTIONS = "i'm i've i'd i'll you're you've you'll you'd we're we've we'd we'll it's that's there's what's who's let's don't doesn't didn't isn't wasn't weren't aren't can't won't couldn't wouldn't shouldn't haven't hasn't hadn't".split(" ");
const ALLOWED = [...LETTER_GLUE, ...CONTRACTIONS, ...CONTRACTIONS.map((c) => c.replace("'", "’"))];
const GLUE_STEMS = new Set(ALLOWED.map(stem));
/** Words for saying when the person can start. They are allowed only in a sentence that is about that. */
const WHEN = "january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday immediately notice period week weeks day days full-time part-time remote remotely hybrid office short spring summer autumn winter end beginning middle early late next travel relocate attend interview".split(" ");

const SUBJECT = String.raw`(?<![\p{L}\p{N}'’])I(?:['’](?:m|ve|d|ll))?(?![\p{L}\p{N}'’])`;
const FIRST = /(?<![\p{L}\p{N}])(?:I|I['’](?:m|ve|d|ll)|[Mm]y|[Mm]e|[Mm]yself|[Mm]ine)(?![\p{L}\p{N}])/u;
const SECOND = /(?<![\p{L}\p{N}])(?:you|your|yours|you['’](?:re|ve|ll|d))(?![\p{L}\p{N}])/iu;
const JOB_REF = /\b(?:the|this) (?:role|post|position|job|advert|advertisement|vacancy|opportunity|team|company|organisation|organization|department)\b/i;

const ADV = String.raw`(?:(?:very|really|particularly|especially|also|now|still|always|truly|genuinely)\s+)?`;
/**
 * Saying what the person wants, or a courtesy: applying, hoping, thanking,
 * enclosing a CV. Such a clause claims nothing about what they have done, and
 * a wish may name what the advert describes ("I would welcome the chance to
 * catalogue new acquisitions").
 */
const INTENT = new RegExp(
  [
    String.raw`\bI(?:['’]m| am| was)\s+${ADV}(?:applying|keen|interested|excited|pleased|delighted|drawn|eager|looking|attracted|writing|happy|glad|grateful)\b`,
    String.raw`\bI(?:['’]d| would)\s+(?:very much\s+)?${ADV}(?:like|love|welcome|be glad|be happy|be pleased|be delighted|be grateful|value|enjoy|relish|appreciate)\b`,
    String.raw`\bI\s+${ADV}(?:want|hope|wish|look forward|enclose|attach|admire|noticed|saw|read|understand|apply|appreciate)\b`,
    String.raw`\bI(?:['’]ve| have)\s+${ADV}(?:attached|enclosed|included|applied|read|seen|noticed)\b`,
    String.raw`\bI (?:could|can|might|would) (?:contribute|help|support)\b`,
    String.raw`\bthank you\b`,
    String.raw`\bappeals? to me\b`,
    String.raw`\bmy (?:application|interest|cv|resume|résumé|covering letter|cover letter|letter|details|portfolio|references)\b`,
    String.raw`\b(?:drew|draws|attracted|attracts|brought|brings) me to\b`,
    String.raw`\bwhy I(?:['’]m| am)? (?:applying|want)\b`,
    String.raw`^\W*please\b`,
    String.raw`\blet me know\b`,
    String.raw`\b(?:contact|reach|call|email) me\b`,
    String.raw`\bI can be (?:reached|contacted)\b`,
  ].join("|"),
  "i",
);
/** Saying when the person can start, travel or come to an interview. */
const AVAILABLE = new RegExp(
  [
    String.raw`\bI (?:can|could|am able to|will be able to|would be able to)\s+(?:start|begin|attend|relocate|travel|interview)\b`,
    String.raw`\bI(?:['’]m| am| will be|['’]ll be)\s+(?:available|free|able to (?:start|begin|attend|relocate|travel))\b`,
    String.raw`\bmy notice period\b`,
    String.raw`\bI(?:['’]m| am) (?:happy|willing|able) to (?:relocate|travel|start)\b`,
  ].join("|"),
  "i",
);
/** Saying what the person has done, knows or is: this must be theirs, never the advert's, however it is led into. */
const EXPERIENCE = new RegExp(
  [
    String.raw`\b(?:experience|experienced|background|expertise|expert|skilled|skills?|proficient|proficiency|fluent|qualified|qualifications?|trained|knowledge|familiar|familiarity|track record|career|certified|certificate|degree|years?|months?)\b`,
    String.raw`\b(?:continue|continuing|again|build on|building on|deepen|extend my)\b`,
    String.raw`\bI(?:['’]ve| have| had)\s+(?:(?:also|already|recently|previously)\s+)?\p{L}+(?:ed|en)\b`,
    String.raw`\bI\s+(?:(?:also|then|recently|previously)\s+)?(?:used|worked|led|ran|built|managed|trained|taught|wrote|made|did|know|can)\b`,
  ].join("|"),
  "iu",
);
/** A clause that says nothing itself and only points back: "which I have", "I am one", "I do too". */
const POINTER = /^\W*(?:(?:which|that|as|so|and|but)\s+)?I(?:['’]ve|['’]m)?\s*(?:also\s+)?(?:have|am|do|did|can|was|will|would)?(?:\s+(?:one|it|this|that|them|these|those|both|too|also|as well|done|been|got|all(?: of (?:this|these|that|it|them))?))*[\s.!,;]*$/i;

export type About = "me" | "employer" | "both" | "neither";

export interface Clause {
  text: string;
  about: About;
  /** The clause has its own "I" or "my": it is a statement by the person, not a part carried by the one beside it. */
  own: boolean;
}

/** Small words that lead into a new statement and travel with it: "because I use…", "which I have". */
const LEAD_IN = "which|that|as|so|and|because|since|but|when|where|while|how|why|if|although|though|whereas|what|whether";
/** Where the employer becomes the subject: "…you are looking for", "…your advert mentions". */
const THEIR_SUBJECT = String.raw`(?<![\p{L}\p{N}'’])(?:you\s+(?:are|were|need|want|ask|asked|have|require|seek|use|look|value|describe|mention|say|expect)|your\s+(?:advert|advertisement|job description|posting|listing|website))(?![\p{L}\p{N}])`;
const NEW_SUBJECT = new RegExp(String.raw`(?:(?<![\p{L}\p{N}])(?:${LEAD_IN})\s+)?(?:${SUBJECT}(?=\s+[\p{Ll}])|${THEIR_SUBJECT})`, "giu");

/**
 * Splits a part of a sentence before every "I" after its first words, so each
 * thing the person says about themselves stands alone, and before the employer
 * as a new subject ("I understand you are looking for…"), so what the advert
 * asks for is read as the advert's.
 */
function atEachSubject(part: string): string[] {
  const cuts: number[] = [];
  for (const m of part.matchAll(NEW_SUBJECT)) {
    const lead = part.slice(cuts[cuts.length - 1] ?? 0, m.index);
    if (m.index === 0 || !/[\p{L}\p{N}]/u.test(lead)) continue;
    // A few words that set the scene ("At Folio House, I…", "However, I…") are part of the statement they lead into.
    const setsTheScene = !FIRST.test(lead) && !SECOND.test(lead) && !JOB_REF.test(lead) && lead.trim().split(/\s+/).length <= 6;
    if (!setsTheScene) cuts.push(m.index);
  }
  if (!cuts.length) return [part];
  const out: string[] = [];
  let from = 0;
  for (const cut of [...cuts, part.length]) {
    out.push(part.slice(from, cut));
    from = cut;
  }
  return out;
}

/**
 * A sentence in the parts that can be judged apart. It is cut where the
 * punctuation separates statements, and again before every "I" after the
 * first: "I want this role because I use Spectrum" is a wish and then a claim,
 * and "…experience of managing volunteers, which I have" is the advert's ask
 * and then a claim. A part that names nobody belongs with the part beside it.
 */
export function clausesOf(sentence: string, employerName = ""): Clause[] {
  const parts = sentence
    .split(/\s*;\s+|\s+[–—]\s+|:\s+|,\s+(?=(?:and|but|so|which|where|while|whereas|because)\s)/)
    .flatMap(atEachSubject)
    .map((p) => p.trim())
    .filter((p) => /[\p{L}\p{N}]/u.test(p));
  const name = employerName.trim().toLowerCase();
  const raw = parts.map((text) => {
    const first = FIRST.test(text);
    const second = SECOND.test(text) || JOB_REF.test(text) || (name.length >= 3 && text.toLowerCase().includes(name));
    return { text, about: (first && second ? "both" : first ? "me" : second ? "employer" : "neither") as About, own: first };
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
const KIND_SAYS: Record<PoolSource["kind"], string> = { cv: "Your CV says", reason: "Your reason says", note: "Your note says", advert: "The advert says", job: "The job is" };
/** "one" is nearly always a pronoun in a letter ("one that…", "no one"), not a count. */
const letterFigures = (text: string) => figures(text).filter((f) => f.text.toLowerCase() !== "one");
/** Stock openings whose words would otherwise read as claims: "I am writing to apply" says nothing about writing. */
const neutral = (text: string) => text.replace(/\bwriting to (apply|express|ask|enquire|inquire|introduce)\b/gi, "$1").replace(/\bplease find\b/gi, "please");
const wordsIn = (text: string) => new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
/**
 * A line with the parts that say "not" taken out. "I have not managed a
 * budget, but I ran the till" backs "I ran the till"; it does not lend
 * "managed" or "budget" to a sentence that says the person did.
 */
const whatItAffirms = (text: string) =>
  negated(text)
    ? text
        .split(/[,;]\s+|\s+(?:but|and|although|though|while|whereas)\s+/i)
        .filter((part) => !negated(part))
        .join(", ")
    : text;

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
  const clauses = clausesOf(text, pool.employerName);
  /** Something in this sentence is only the advert's: a clause that points back ("which I have") would be claiming it. */
  const advertOnly = terms(neutral(text)).some((t) => !GLUE_STEMS.has(t.stem) && has(employer, t.stem) && !has(personal, t.stem) && !has(job, t.stem));

  for (const clause of clauses) {
    const words = neutral(clause.text);
    const mine = clause.about === "me" || clause.about === "both";
    const available = AVAILABLE.test(words);
    // "I have not used Spectrum" claims nothing: saying what you do not have is honest, and may name what the advert names.
    const denies = mine && negated(words.replace(/\bnot only\b/gi, ""));
    const courtesy = available || denies || INTENT.test(words);
    const wish = denies || (INTENT.test(words) && !EXPERIENCE.test(words));
    // What this clause may rest on, in the order its sources are named.
    const allowed: Indexed[] = clause.about === "employer" ? [...employer, ...job] : mine ? [...job, ...personal, ...(wish ? employer : [])] : EXPERIENCE.test(words) ? [...job, ...personal] : [...job, ...personal, ...employer];
    const whose = clause.about === "employer" ? THEIRS : MINE;
    // Only a line that shares a word or a figure with this clause can bear on it.
    const stems = new Set(terms(words).map((t) => t.stem));
    const keys = new Set(figures(words).map((f) => f.key));
    const near = allowed.filter((a) => [...stems].some((x) => a.stems.has(x)) || [...keys].some((k) => a.figures.has(k)));
    // What this clause claims: its words of substance, and its figures, that the allowed lines hold.
    const claims = new Set([...stems].filter((x) => !GLUE_STEMS.has(x) && has(allowed, x)));
    const needFigures = new Set(letterFigures(words).map((f) => f.key).filter((k) => hasFigure(allowed, k)));
    const before = problems.length;

    // "Not" is meaning. Where the line this rests on says the person has NOT done something, the sentence may not say they have.
    const affirms = !negated(words);
    if (claims.size && affirms) {
      const mineWords = wordsIn(words);
      const overlap = (a: Indexed) => [...wordsIn(a.source.text)].filter((w) => mineWords.has(w)).length;
      const holding = near.filter((a) => [...claims].every((c) => a.stems.has(c)));
      const best = Math.max(0, ...holding.map(overlap));
      const denied = holding.find((a) => overlap(a) === best && negated(a.source.text));
      if (denied) {
        problems.push({ kind: "negation", original: denied.source.text, say: `${KIND_SAYS[denied.source.kind]} ${q(denied.source.text)} This sentence leaves out the “not”.` });
        continue;
      }
    }

    // When the person can start is theirs to say: a date or "four weeks" there is not a claim about their work.
    // A sentence that says the person did something rests only on what their lines affirm, not on what they deny.
    const read = (a: Indexed) => (affirms ? whatItAffirms(a.source.text) : a.source.text);
    // "We" in the person's own lines is them and their team. "We" in the advert is the employer speaking: a sentence
    // that names the employer has not dropped anybody's share of the work.
    const verdict = checkGrounded(words, near.map(read), { allow: available ? [...ALLOWED, ...WHEN] : ALLOWED, allowFigures: available ? keys : [], whose, mayHedge: true, own: near.filter((a) => personal.includes(a)).map(read) });
    const other = clause.about === "employer" ? personal : employer;
    for (const p of verdict.problems) {
      const word = p.proposed ?? "";
      if (p.kind === "added-figure" && word.toLowerCase() === "one") continue;
      // "Responsible for" in a letter is a way of saying what the work was, not a claim to have led it.
      if (p.kind === "ownership" && word === "responsible for" && !p.original) continue;
      // A figure that is there, about something else: said as the check says it.
      if (p.kind === "added-figure" && p.say.includes("about something else")) {
        problems.push(p);
        continue;
      }
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


    // A statement the person makes about themselves must rest on something of theirs. Words that carry no claim
    // are not enough: "I have years of experience in this role" names nothing, and "…, which I have" claims what
    // the advert asks for. Wishes, courtesies and when they can start are not such statements.
    if (clause.own && mine && !courtesy && problems.length === before) {
      const backed = [...claims].some((c) => has(personal, c)) || [...needFigures].some((k) => hasFigure(personal, k));
      if (!backed) {
        const pointing = POINTER.test(words) && (advertOnly || clauses.some((c) => c.about === "employer"));
        problems.push(
          pointing
            ? { kind: "unsourced", proposed: clause.text, say: `${q(clause.text.replace(/[\s.,;!]+$/, ""))} claims what the advert asks for as your own. Say it with a line of your CV, or take it out.` }
            : { kind: "unsourced", proposed: clause.text, say: `${q(clause.text.replace(/[\s.,;!]+$/, ""))} says something about you, but names nothing from ${MINE}. Say what you did, in the words of a line on your CV, or add a note.` },
        );
      }
    }
    if (problems.length > before) continue;

    // Name the fewest lines that between them hold everything this clause claims.
    // A line already named for an earlier part of the sentence covers what it holds here too.
    for (const u of used) {
      if (!allowed.includes(u)) continue;
      for (const c of [...claims]) if (u.stems.has(c)) claims.delete(c);
      for (const k of [...needFigures]) if (u.figures.has(k)) needFigures.delete(k);
    }
    let guard = 0;
    while ((claims.size || needFigures.size) && guard++ < 4) {
      let best: Indexed | null = null;
      let bestN = 0;
      for (const a of allowed) {
        if (used.includes(a)) continue;
        const n = [...claims].filter((c) => a.stems.has(c)).length + [...needFigures].filter((k) => a.figures.has(k)).length * 2;
        if (n > bestN) {
          best = a;
          bestN = n;
        }
      }
      // Nothing new to name: what is left is held by a line already named for an earlier clause.
      if (!best) break;
      used.push(best);
      for (const c of [...claims]) if (best.stems.has(c)) claims.delete(c);
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

/** How much a paragraph of a letter holds. The letter screen says so the moment either is passed. */
export const PARAGRAPH_SENTENCES = 12;
export const SENTENCE_CHARS = 700;

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
    .slice(0, PARAGRAPH_SENTENCES)
    .map((t) => {
      const at = left.findIndex((s) => s.text === t);
      if (at >= 0) return left.splice(at, 1)[0];
      return { id: newId("ls_"), text: [...t].slice(0, SENTENCE_CHARS).join(""), origin: "typed" as const, sources: [] };
    });
}

/** A paragraph as the text in its box. */
export const paragraphText = (p: { sentences: { text: string }[] }) => p.sentences.map((s) => s.text).join(" ");

/** True when the letter has no words in it yet. */
export const letterIsEmpty = (letter?: Pick<CvDoc, "letter">["letter"]) => !letter || !letter.paragraphs.some((p) => p.sentences.some((s) => s.text.trim()));
