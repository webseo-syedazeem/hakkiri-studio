import type { CvRegion } from "../schema";
import { figures, terms } from "../write/facts";

/**
 * What the score looks for in a line of writing. Each detector is a pattern
 * in code, with no AI call, and returns the exact phrase it found so the
 * finding can point at it. A detector that is a judgement (a weak verb, a
 * likely passive) feeds a suggestion; one that is a fact (no email) feeds an issue.
 */

/** A phrase found in a text: where it starts and ends, and what it says. */
export interface Hit {
  start: number;
  end: number;
  text: string;
}

const hit = (m: RegExpExecArray, group = 0): Hit => {
  const text = m[group];
  const start = m.index + m[0].indexOf(text);
  return { start, end: start + text.length, text };
};
const first = (re: RegExp, text: string, group = 0): Hit | null => {
  const m = re.exec(text);
  return m ? hit(m, group) : null;
};
const all = (re: RegExp, text: string): Hit[] => [...text.matchAll(re)].map((m) => hit(m as RegExpExecArray));
const words = (list: string) => list.trim().split(/\s*,\s*/).join("|");

/* ------------------------------------------------------------------ clarity */

const WEAK = words("helped, worked, did, made, handled, assisted, used, got, dealt, was, were, had, tried, participated, involved, took part, looked after, carried out, undertook");
/** A bullet that opens with a verb that says little about what was done. */
export const weakLead = (t: string) => first(new RegExp(`^\\s*(${WEAK})\\b`, "i"), t, 1);

const DUTY = "responsible for|duties includ(?:ed|e|ing)|responsibilities includ(?:ed|e|ing)|tasked with|in charge of|my role (?:was|is|involved|included)|role involved|job was to|accountable for|day-to-day (?:duties|responsibilities|tasks)|was required to|expected to";
/** A bullet that describes the job, not what the person did in it. */
export const dutyLead = (t: string) => first(new RegExp(`^\\s*(?:was |were |i was |i am |i'm )?(${DUTY})\\b`, "i"), t, 1);

const FILL = "in order to|a number of|a wide range of|a variety of|various|successfully|basically|essentially|actually|really|very|quite|on a (?:daily|weekly|monthly|regular) basis|etc\\.?|and so on|as well as|at the end of the day|in terms of|with regards? to|due to the fact that|was able to|were able to";
/** Words that take up room without adding a fact. */
export const filler = (t: string) => all(new RegExp(`(?<![\\p{L}-])(?:${FILL})(?![\\p{L}-])`, "giu"), t);

const BUZZ = "synergy|synergies|results[- ]driven|results[- ]oriented|team player|hard[- ]working|detail[- ]oriented|go[- ]getter|think(?:ing)? outside the box|dynamic|passionate|self[- ]starter|self[- ]motivated|highly motivated|motivated individual|strategic thinker|best of breed|go[- ]to person|thought leader|rockstar|ninja|guru|value[- ]add|win[- ]win|game[- ]chang(?:er|ing)|proven track record|excellent communication skills|strong work ethic|fast[- ]paced environment|wear(?:s|ing)? many hats|bring(?:s|ing)? to the table";
/** Phrases that sound like a CV and say nothing an interviewer can check. */
export const buzzwords = (t: string) => all(new RegExp(`(?<![\\p{L}-])(?:${BUZZ})(?![\\p{L}-])`, "giu"), t);

const PARTICIPLE = "\\p{L}{3,}ed|built|made|done|given|taken|written|run|led|held|sent|set up|won|sold|taught|kept|brought|chosen|grown|shown|drawn|paid|put|cut";
/** Likely passive phrasing: "was managed", "were given". A judgement, not a certainty. */
export const passive = (t: string) => first(new RegExp(`(?<![\\p{L}])(?:was|were|been|being|is|are|got)\\s+(?:\\p{L}+ly\\s+)?(?:${PARTICIPLE})(?![\\p{L}])`, "iu"), t);

/** "I", "my", "we", "our": a CV is written without them. */
export const firstPerson = (t: string) => first(/(?<![\p{L}'’])(I|I[’']m|I[’']ve|I[’']d|my|me|myself|we|our|us)(?![\p{L}'’])/u, t, 1);

/** A bullet too short to say what was done. */
export const fragment = (t: string) => terms(t).length + figures(t).length < 3;

/** An opening verb in the present tense, for a role that has ended. */
const PRESENT = words(
  "manage, run, lead, write, build, create, develop, support, train, catalogue, catalog, prepare, handle, coordinate, co-ordinate, organise, organize, maintain, deliver, design, plan, monitor, report, review, work, oversee, supervise, ensure, provide, assist, help, liaise, conduct, perform, produce, analyse, analyze, process, serve, teach, sell, answer, deal, advise, implement, test, research, draft, edit, schedule, track, update, operate, present, negotiate, recruit, mentor, coach, audit, budget, forecast, order, stock, clean, cook, drive, greet, pack, resolve, respond, set, take, make, keep, use",
);
export const presentLead = (t: string) => first(new RegExp(`^\\s*((?:${PRESENT})(?:s|es)?)(?![\\p{L}-])`, "iu"), t, 1);

/* ----------------------------------------------------------------- spelling */

/** Spellings that differ between the UK and the US: UK form first. */
const PAIRS: [string, string][] = [
  ["colour", "color"], ["favour", "favor"], ["behaviour", "behavior"], ["labour", "labor"], ["honour", "honor"], ["neighbour", "neighbor"], ["flavour", "flavor"],
  ["centre", "center"], ["metre", "meter"], ["theatre", "theater"], ["litre", "liter"], ["fibre", "fiber"],
  ["licence", "license"], ["defence", "defense"], ["offence", "offense"], ["practise", "practice"],
  ["catalogue", "catalog"], ["dialogue", "dialog"], ["analogue", "analog"], ["programme", "program"],
  ["travelled", "traveled"], ["travelling", "traveling"], ["modelled", "modeled"], ["modelling", "modeling"], ["cancelled", "canceled"], ["labelled", "labeled"], ["counselling", "counseling"],
  ["fulfil", "fulfill"], ["enrol", "enroll"], ["skilful", "skillful"], ["enquiry", "inquiry"], ["grey", "gray"], ["cheque", "check"], ["tyre", "tire"], ["jewellery", "jewelry"], ["aluminium", "aluminum"], ["ageing", "aging"], ["judgement", "judgment"], ["storey", "story"], ["kerb", "curb"], ["plough", "plow"], ["sceptical", "skeptical"], ["maths", "math"],
];
/** Verbs spelt -ise in the UK and -ize in the US, by their stem. */
const ISE = "organ, real, recogn, optim, priorit, standard, summar, special, final, util, maxim, minim, anal, custom, modern, emphas, categor, central, character, computer, digit, familiar, general, harmon, initial, local, memor, mobil, monet, normal, personal, popular, rational, reorgan, revital, stabil, subsid, synchron, visual, apolog, author, capital, critic, econom, formal, legal, material, neutral, public, social, sympath, catal".split(/,\s*/);
const ISE_RE = new RegExp(`(?<![\\p{L}])(?:${ISE.join("|")})(i[sz]|y[sz])(?:e|es|ed|ing|ation|ations|er|ers)(?![\\p{L}])`, "giu");
// Words where the pair is not a spelling difference in every sense: left alone.
const AMBIGUOUS = new Set(["practice", "practise", "program", "check", "tire", "story", "meter", "license", "curb", "math"]);

/**
 * Words spelt the other region's way: US spellings in a UK CV, or UK spellings
 * in a US resume. Words the person has accepted are left alone.
 */
export function wrongRegionSpelling(text: string, region: CvRegion, accepted: Iterable<string> = []): (Hit & { suggest: string })[] {
  const ok = new Set([...accepted].map((w) => w.toLowerCase()));
  const out: (Hit & { suggest: string })[] = [];
  const keep = (m: RegExpMatchArray, suggest: string) => {
    if (ok.has(m[0].toLowerCase())) return;
    const cased = /^\p{Lu}/u.test(m[0]) ? suggest.charAt(0).toUpperCase() + suggest.slice(1) : suggest;
    out.push({ start: m.index!, end: m.index! + m[0].length, text: m[0], suggest: cased });
  };
  for (const [uk, us] of PAIRS) {
    const [wrong, right] = region === "uk" ? [us, uk] : [uk, us];
    if (AMBIGUOUS.has(wrong)) continue;
    for (const m of text.matchAll(new RegExp(`(?<![\\p{L}])${wrong}(?:s|ed|ing)?(?![\\p{L}])`, "giu"))) keep(m, m[0].toLowerCase().replace(wrong, right));
  }
  for (const m of text.matchAll(ISE_RE)) {
    const z = /z/i.test(m[1]);
    if (region === "uk" ? z : !z) keep(m, m[0].toLowerCase().replace(m[1].toLowerCase(), m[1].toLowerCase().replace(region === "uk" ? "z" : "s", region === "uk" ? "s" : "z")));
  }
  return out.sort((a, b) => a.start - b.start);
}

/* ----------------------------------------------------------------- acronyms */

/** Short forms most readers know. Others should be spelt out the first time. */
const KNOWN = new Set(
  "UK US USA EU UN NHS BBC GCSE GCSES GPA CEO CFO CTO COO MD HR IT PR PDF CV PA VAT FAQ BA BSC MA MSC MBA PHD LLB LLM MENG BENG PGCE NVQ BTEC HND HNC DBS ID TV AI API URL HTML CSS SQL OK AM PM GMT KPI KPIS ROI B2B B2C SME SMES NGO UX UI QA PC USB WIFI CRM SEO GDPR ISO NHS RAF MP DIY ATM GP II III IV".split(" "),
);

/** Acronyms used without being spelt out on first use, unless well known or accepted by the person. */
export function unexplainedAcronyms(texts: string[], accepted: Iterable<string> = []): { at: number; hit: Hit }[] {
  const ok = new Set([...accepted].map((w) => w.toUpperCase()));
  const seen = new Set<string>();
  const out: { at: number; hit: Hit }[] = [];
  const everything = texts.join("\n");
  texts.forEach((text, at) => {
    for (const m of text.matchAll(/(?<![\p{L}\p{N}])[A-Z][A-Z0-9&]{1,5}(?![\p{L}\p{N}])/gu)) {
      const a = m[0];
      if (seen.has(a) || KNOWN.has(a) || ok.has(a) || /^\d|^[IVX]+$/.test(a)) continue;
      seen.add(a);
      // Spelt out beside it somewhere: "pay per click (PPC)" or "PPC (pay per click)".
      const explained = new RegExp(`\\(\\s*${a}\\s*\\)|${a}\\s*\\([^)]{4,}\\)`).test(everything);
      if (!explained) out.push({ at, hit: { start: m.index!, end: m.index! + a.length, text: a } });
    }
  });
  return out;
}

/* ----------------------------------------------------------------- evidence */

const SUPPORT_LEAD = "helped|assisted|supported|contributed to|participated in|involved in|worked (?:with|on|alongside|as part of)|part of (?:a|the)|member of|we\\b|our team|the team|team (?:effort|project)|shadowed|took part in|collaborated (?:with|on)";
/** A bullet that says the work was shared without saying what the person's own part was. */
export const unclearContribution = (t: string) => first(new RegExp(`^\\s*(?:i )?(${SUPPORT_LEAD})`, "i"), t, 1) ?? dutyLead(t);

const DELIVERED = words("built, created, wrote, designed, launched, delivered, published, produced, developed, introduced, implemented, set up, established, founded, won, secured, completed, achieved, opened, shipped, released, installed, drafted, compiled, catalogued, cataloged, digitised, digitized, translated, organised, organized, hosted, presented, trained, taught, recruited, hired, negotiated, sold, raised, saved, cut, reduced, increased, improved, grew, doubled, halved, resolved, fixed, migrated, automated, mapped, audited, restored, repaired");
const OUTCOME = "resulting in|which (?:led|meant|cut|saved|reduced|increased|improved|helped|allowed|stopped|gave)|so that|leading to|led to|that (?:cut|saved|reduced|increased|improved|stopped|allowed)|now used|still in use|used (?:by|at|in|every)|adopted by|rolled out|on time|under budget|ahead of schedule|without (?:a|any) |first time|from \\S+ to \\S+";
/** A concrete outcome or a thing that was made: a figure, a result, or a deliverable. */
export const hasOutcome = (t: string) => figures(t).length > 0 || new RegExp(`(?<![\\p{L}])(?:${DELIVERED})(?![\\p{L}])`, "iu").test(t) || new RegExp(`(?<![\\p{L}])(?:${OUTCOME})`, "iu").test(t);

const BOUNDED = "each (?:day|week|month|year|term|shift|morning)|every (?:day|week|month|year|term|shift|morning|\\p{L}+)|daily|weekly|monthly|quarterly|annual(?:ly)?|all (?:the |of the |our |new )?\\p{L}+|whole (?:team|site|company|school|department)|company-wide|site-wide|nationwide|national|regional|across (?:the |all |every )?\\p{L}+|team of|a team|both|dozens|hundreds|thousands|full[- ]time|part[- ]time|per (?:day|week|month|year|shift)|single-handed";
/** How big the work was: a number, or a description with clear edges ("every new starter", "across the Leeds site"). */
export const hasScale = (t: string) => figures(t).length > 0 || new RegExp(`(?<![\\p{L}])(?:${BOUNDED})(?![\\p{L}])`, "iu").test(t);

const BIG = "first|best|top|only|leading|award|awarded|record|number one|#1|100%|doubled|tripled|quadrupled|significant(?:ly)?|dramatic(?:ally)?|transformed|revolutionised|revolutionized|expert|world[- ]class|outstanding|exceptional|unprecedented|highest|fastest|largest|biggest|every|always|never|all";
/** A claim an interviewer is likely to push on: a superlative, an absolute, or a large change. */
export function bigClaim(t: string): Hit | null {
  const word = first(new RegExp(`(?<![\\p{L}#])(${BIG})(?![\\p{L}])`, "iu"), t, 1);
  if (word && !/^(every|all|only|first|top)$/i.test(word.text)) return word;
  for (const f of figures(t)) {
    const pct = /^(\d+(?:\.\d+)?)%$/.exec(f.key);
    if (pct && Number(pct[1]) >= 50) return { start: f.index, end: f.index + f.text.length, text: f.text };
    const money = /^[£$€](\d+(?:\.\d+)?)$/.exec(f.key);
    if (money && Number(money[1]) >= 1_000_000) return { start: f.index, end: f.index + f.text.length, text: f.text };
  }
  return word && /^(only|first|top)$/i.test(word.text) ? word : null;
}

const CONTEXT = "by (?:\\p{L}+ing)|through|using|with (?:a|the|an) |after|over (?:\\d|a |the |two|three|four|five|six)|in (?:\\d|a |the |two|three|four|five|six|under)|within|from \\S+ to \\S+|against|compared (?:with|to)|measured|according to|as (?:shown|reported|measured)|out of|among|judged by|voted by";
/** Something that backs a big claim up: how it was done, over what time, against what. */
export const hasContext = (t: string) => new RegExp(`(?<![\\p{L}])(?:${CONTEXT})`, "iu").test(t);

/* ---------------------------------------------------------------- structure */

export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
/** A phone number someone could dial: 7 to 15 digits, with the usual marks between them. */
export const validPhone = (s: string) => /^[+()\d\s.-]+$/.test(s.trim()) && (s.match(/\d/g) ?? []).length >= 7 && (s.match(/\d/g) ?? []).length <= 15;
/** A link that will open: a host with a dot, no spaces. */
export const validLink = (s: string) => /^(?:https?:\/\/)?(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,}(?:[/?#]\S*)?$/u.test(s.trim());

export const countWords = (texts: string[]) => texts.join(" ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
export const countSentences = (text: string) => text.split(/(?<=[.!?])\s+|\n+/).filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
