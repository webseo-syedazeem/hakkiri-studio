import { type Requirement, newId } from "../schema";
import { oneLine, sentences, terms } from "../write/facts";

/**
 * Reads what a job advert asks for, by rule. Each requirement is a passage of
 * the advert in its own words: nothing is paraphrased. Benefits, boilerplate
 * and repeats are left out. The person can then correct the reading: change
 * required to preferred, split or merge, add what was missed.
 */

type Mood = "required" | "preferred" | "duty" | "skip" | "";

const HEAD_SKIP = /benefit|we offer|what we offer|perks|salary|package|about us|who we are|our (?:story|values|mission|culture)|how to apply|to apply|equal opportunit|diversity|inclusion|location|hours|contract type|closing date|safeguarding statement/i;
const HEAD_PREF = /desirable|preferred|nice to have|bonus|ideally|advantage|would be (?:great|good|helpful)|\bplus\b/i;
const HEAD_REQ = /require|essential|must[- ]have|what you(?:['’]ll)? need|you(?:['’]ll| will) (?:need|have|bring)|about you|who you are|what we(?:['’]re| are) looking for|person specification|skills|experience|qualifications|criteria/i;
/** Duties: what the job involves. They can be matched against, but the advert does not say they are required. */
const HEAD_DUTY = /responsibilit|the role|what you(?:['’]ll| will) (?:do|be doing)|key duties|duties|day to day|your role/i;

const CUE = /experience (?:of|with|in|using|working)|experienced in|ability to|able to|knowledge of|understanding of|proficien|familiar|you (?:will|must|should|can) (?:have|be|hold)|you have|you are|must (?:have|be|hold)|degree|qualification|qualified|certif|licen[cs]e|fluent|track record|comfortable (?:with|using)|skilled in|skills? in|confident|background in|expertise|competen|right to work|years['’]?/i;
const PREFERRED = /desirable|preferred|preferably|nice to have|ideally|bonus|an advantage|advantageous|a plus|would be (?:great|good|helpful|beneficial)|not essential/i;
const BOILER = /equal opportunit|we (?:offer|are committed|welcome|value|believe)|salary|per annum|pension|holiday|annual leave|apply (?:now|by|via|online)|closing date|click|send your cv|cover letter|interviews will|start date|reference number|©|privacy|parking|gym membership|staff discount|cycle to work|private health|life assurance|sick pay|free (?:lunch|fruit|breakfast|tea|coffee)/i;
/** What the job involves, said in running text: "you will manage supplier contracts". */
const DUTY = /\byou(?:['’]ll| will) (?!have\b|be\b|need\b|hold\b)\p{L}+/iu;
/** Where a long run-on sentence moves from one thing to the next. */
const NEXT_THING = /\s*;\s*|,\s+(?=(?:and\s+)?(?:you|the successful|we|a\s|an\s|to apply|salary|must|should|ideally|experience|knowledge|strong|fluent|at least)\b)|\s+and\s+(?=(?:you|the successful candidate|we)\b)/i;
const BULLET = /^(?:[-•*·▪◦‣–]\s+|\d+[.)]\s+|[a-z][.)]\s+)/;

function isHeading(line: string): boolean {
  const t = line.replace(/[:：]\s*$/, "").trim();
  if (!t || t.length > 60 || /[.!?]$/.test(line.trim())) return false;
  const words = t.split(/\s+/);
  if (words.length > 7) return false;
  return /[:：]\s*$/.test(line) || t === t.toUpperCase() || words.every((w) => /^[\p{Lu}\d&(]/u.test(w) || /^(?:and|or|of|the|to|for|a|in|we|you|your|our|with)$/i.test(w)) || HEAD_REQ.test(t) || HEAD_PREF.test(t) || HEAD_SKIP.test(t) || HEAD_DUTY.test(t);
}

const moodOf = (heading: string): Mood => (HEAD_SKIP.test(heading) ? "skip" : HEAD_PREF.test(heading) ? "preferred" : HEAD_REQ.test(heading) ? "required" : HEAD_DUTY.test(heading) ? "duty" : "");
const keyOf = (text: string) => terms(text).map((t) => t.stem).sort().join(" ");

/** What an advert asks for, in the advert's own words, in the order it says them. */
export function extractRequirements(advert: string, limit = 24): Requirement[] {
  const out: Requirement[] = [];
  const seen = new Set<string>();
  let mood: Mood = "";
  const add = (quote: string, priority: "required" | "preferred") => {
    const q = oneLine(quote).replace(/[;,]$/, "");
    const k = keyOf(q);
    if (terms(q).length < 2 || q.length > 400 || seen.has(k) || BOILER.test(q)) return;
    seen.add(k);
    out.push({ id: newId("r_"), quote: q, text: q.replace(/[.]$/, ""), priority, evidence: [], uncovered: "", gap: false });
  };
  for (const raw of advert.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (!BULLET.test(line) && isHeading(line)) {
      mood = moodOf(line);
      continue;
    }
    if (mood === "skip") continue;
    const bullet = BULLET.test(line);
    const body = line.replace(BULLET, "");
    // A bullet is one requirement, whole. Running text is read sentence by sentence, and a sentence that runs on
    // through a whole advert ("…, you should also have…, we offer…") is read a clause at a time.
    const parts = bullet ? [body] : sentences(body).flatMap((x) => (x.length > 200 ? x.split(NEXT_THING).map((c) => c.trim().replace(/^and\s+/i, "")).filter(Boolean) : [x]));
    for (const part of parts) {
      const asked = CUE.test(part);
      const duty = !asked && DUTY.test(part);
      // Under "The role", every line is something the job involves. Elsewhere, running text must say it is asking for
      // something, or say what the person will do.
      if (mood !== "duty" && !bullet && !asked && !duty) continue;
      // A bullet in an advert with no headings is still something the job involves or asks for: it is offered at the
      // lighter weight, for the person to keep, correct or remove.
      const lighter = PREFERRED.test(part) || mood === "preferred" || mood === "duty" || duty || (bullet && !mood && !asked);
      add(part, lighter ? "preferred" : "required");
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

/** A requirement the person adds by hand, from words of the advert they have picked out. */
export const manualRequirement = (quote: string, priority: "required" | "preferred" = "required"): Requirement => ({ id: newId("r_"), quote: oneLine(quote), text: oneLine(quote).replace(/[.]$/, ""), priority, evidence: [], uncovered: "", gap: false });

/**
 * Said beside the list when the reading may have missed things: an advert with
 * no headings we recognise, or a long advert that gave very little. Empty when
 * there is nothing to say.
 */
export function readingNote(advert: string, found: number): string {
  const lines = advert.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const headed = lines.some((l) => !BULLET.test(l) && isHeading(l) && moodOf(l) !== "");
  const words = advert.split(/\s+/).filter(Boolean).length;
  if (!advert.trim()) return "";
  if (!headed) return "This advert has no headings such as “Essential” or “Desirable”, so we could not tell what is required from what is preferred, and may have missed things. Check the list against the advert: change a weight, or add what is missing.";
  if (words > 120 && found < 3) return "We found very little in this advert that can be checked against a CV. Read it through and add what it asks for.";
  return "";
}
