import { type Requirement, newId } from "../schema";
import { oneLine, sentences, terms } from "../write/facts";
import { askedFor, namedTerms } from "../write/skills";

/**
 * Reads what a job advert asks for, by rule. Each requirement is a passage of
 * the advert in its own words: nothing is paraphrased. Benefits, boilerplate
 * and repeats are left out. The person can then correct the reading: change
 * required to preferred, split or merge, add what was missed.
 */

type Mood = "required" | "preferred" | "duty" | "skip" | "";

const HEAD_SKIP = /benefit|we offer|what we offer|perks|salary|package|about us|who we are|our (?:story|values|mission|culture)|how to apply|to apply|equal opportunit|diversity|inclusion|location|hours|contract type|closing date|safeguarding statement/i;
const HEAD_PREF = /desirable|preferred|nice to have|bonus|ideally|advantage|would be (?:great|good|helpful)|\bplus\b|\ba plus\b|\ba big plus\b/i;
const HEAD_REQ = /require|essential|must[- ]have|what you(?:['’]ll)? need|you(?:['’]ll| will) (?:need|have|bring)|about you|who you are|what we(?:['’]re| are) looking for|person specification|skills|experience|qualifications|criteria|requirements/i;
/** Duties: what the job involves. They can be matched against, but the advert does not say they are required. */
const HEAD_DUTY = /responsibilit|the role|what you(?:['’]ll| will) (?:do|be doing)|key duties|duties|day to day|your role/i;

const CUE = /\bmust\b|\brequired\b|\bessential\b|experience (?:of|with|in|using|working)|experienced in|ability to|able to|knowledge of|understanding of|proficien|familiar|you (?:will|must|should|can) (?:have|be|hold)|you have|you are|must (?:have|be|hold)|degree|qualification|qualified|certif|licen[cs]e|fluent|track record|comfortable (?:with|using)|skilled in|skills? in|confident|background in|expertise|competen|right to work|years['’]?/i;
const PREFERRED = /desirable|preferred|preferably|nice to have|ideally|bonus|an advantage|advantageous|\ba big plus\b|\ba plus\b|\bplus\b|would be (?:great|good|helpful|beneficial)|not essential/i;
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

/** Splits comma or slash separated skill lists when a line lists multiple skills. */
function splitSkillList(text: string): string[] {
  // If the text has commas or slashes and looks like a list of skills or short tools
  if (!/[,/]/.test(text)) return [text];
  // Don't split if it's a full complex clause with verbs and sub-clauses
  const parts = text.split(/[,/]\s*(?:and\s+)?|\s+and\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => p.split(/\s+/).length <= 4)) {
    return parts;
  }
  return [text];
}

/** What an advert asks for, in the advert's own words, in the order it says them. */
export function extractRequirements(advert: string, limit = 24): Requirement[] {
  const out: Requirement[] = [];
  const seen = new Set<string>();
  let mood: Mood = "";
  const add = (quote: string, priority: "required" | "preferred") => {
    const q = oneLine(quote).replace(/[;,]$/, "").trim();
    if (!q) return;

    // Check if quote contains an "ideally" clause: "4+ years of paid search, ideally in travel"
    const idealMatch = q.match(/^(.*?)(?:,\s*|\s+)\bideally\b\s+(.+)$/i);
    if (idealMatch && idealMatch[1].trim() && idealMatch[2].trim()) {
      add(idealMatch[1].trim(), priority);
      add(idealMatch[2].trim(), "preferred");
      return;
    }

    // Split comma/slash lists of skills
    const subSkills = splitSkillList(q);
    if (subSkills.length > 1) {
      for (const s of subSkills) add(s, priority);
      return;
    }

    const k = keyOf(q);
    // Keep one-word skills (terms(q).length >= 1)
    if (terms(q).length < 1 || q.length > 400 || seen.has(k) || BOILER.test(q)) return;
    seen.add(k);
    out.push({ id: newId("r_"), quote: q, text: q.replace(/[.]$/, ""), priority, evidence: [], uncovered: "", gap: false });
  };

  for (const raw of advert.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    // Check inline headings like "Essential: Google Ads, Tableau. Desirable: SQL, French"
    const inlineSecs = line.split(/(?<=\.)\s+(?=(?:Essential|Desirable|Requirements?|Preferred)[:：])/i);
    if (inlineSecs.length > 1) {
      for (const sec of inlineSecs) {
        const mReq = /^Essential[:：]\s*(.+)$/i.exec(sec);
        const mPref = /^Desirable[:：]\s*(.+)$/i.exec(sec);
        if (mReq) {
          for (const item of splitSkillList(mReq[1])) add(item, "required");
        } else if (mPref) {
          for (const item of splitSkillList(mPref[1])) add(item, "preferred");
        } else {
          // Process as normal line
          processLine(sec, mood, add);
        }
      }
      continue;
    }

    // Check single line with "Essential: ..." or "Desirable: ..."
    const mReqSingle = /^Essential[:：]\s*(.+)$/i.exec(line);
    const mPrefSingle = /^Desirable[:：]\s*(.+)$/i.exec(line);
    if (mReqSingle) {
      for (const item of splitSkillList(mReqSingle[1])) add(item, "required");
      continue;
    }
    if (mPrefSingle) {
      for (const item of splitSkillList(mPrefSingle[1])) add(item, "preferred");
      continue;
    }

    if (!BULLET.test(line) && isHeading(line)) {
      mood = moodOf(line);
      continue;
    }
    if (mood === "skip") continue;

    processLine(line, mood, add);
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

function processLine(line: string, mood: Mood, add: (quote: string, priority: "required" | "preferred") => void) {
  const bullet = BULLET.test(line);
  const body = line.replace(BULLET, "");
  const parts = bullet ? [body] : sentences(body).flatMap((x) => (x.length > 200 ? x.split(NEXT_THING).map((c) => c.trim().replace(/^and\s+/i, "")).filter(Boolean) : [x]));
  for (const part of parts) {
    const asked = CUE.test(part);
    const duty = !asked && DUTY.test(part);
    if (mood !== "duty" && !bullet && !asked && !duty) {
      continue;
    }
    const lighter = PREFERRED.test(part) || mood === "preferred" || mood === "duty" || duty || (bullet && !mood && !asked);
    add(part, lighter ? "preferred" : "required");
  }
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
