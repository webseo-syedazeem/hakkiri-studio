/**
 * Reads the facts out of a piece of writing: the figures, whether each is an
 * estimate, the words that say how much of the work was the person's own, and
 * the words that carry the content. The checks in `check.ts` compare these
 * between what a person wrote and what a draft says, so a draft can be refused
 * for a reason that can be shown: "it dropped 18%", "it replaced helped with led".
 */

/* ------------------------------------------------------------------ figures */

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, dozen: 12,
};
const SCALES: Record<string, number> = { hundred: 100, thousand: 1000, k: 1000, million: 1e6, mn: 1e6, m: 1e6, billion: 1e9, bn: 1e9 };
/** Words that are a figure without being a count. */
const FRACTIONS: Record<string, string> = { half: "1/2", halved: "1/2", double: "x2", doubled: "x2", twice: "x2", triple: "x3", tripled: "x3", quarter: "1/4" };
const isNumberWord = (w: string) => w in UNITS || w in SCALES || w in FRACTIONS;
/** A number as a key: 1200000 for "1.2m", "1.2 million" and "1,200,000" alike. */
const plain = (n: number) => String(Math.round(n * 1000) / 1000);

/** How a figure is hedged in the text: an estimate, a floor or a ceiling. A draft must keep the hedge. */
export type Hedge = "about" | "over" | "under" | "";

const HEDGES: [RegExp, Hedge][] = [
  [/(?:roughly|about|around|approximately|approx\.?|circa|c\.|nearly|almost|an estimated|estimated|some|~|≈)\s*$/i, "about"],
  [/(?:over|more than|at least|upwards of|above|a minimum of|>|≥)\s*$/i, "over"],
  [/(?:under|less than|fewer than|up to|at most|below|a maximum of|<|≤)\s*$/i, "under"],
];

export interface Figure {
  /** As written: "£1.2m", "18%", "six". */
  text: string;
  /** The same figure however it is written: "£1.2m" for "£1.2 million", "6" for "six", "18%" for "18 percent". */
  key: string;
  hedge: Hedge;
  /** With its hedge, as written: "roughly 40". */
  phrase: string;
  index: number;
}

const DIGITS = /(?<![A-Za-z])([£$€])?\s?(\d[\d,]*(?:\.\d+)?)(\s?(?:%|percent\b|per cent\b|pc\b)|\s?(?:million|billion|thousand|hundred|bn|mn|m|k)\b(?!\s?(?:²|2\b)))?(\+)?/gi;
const PERCENT = /^(?:%|percent|per cent|pc)$/i;

function hedgeBefore(text: string, index: number): { hedge: Hedge; from: number } {
  const before = text.slice(Math.max(0, index - 24), index);
  for (const [re, hedge] of HEDGES) {
    const m = re.exec(before);
    if (m) return { hedge, from: index - (before.length - m.index) };
  }
  return { hedge: "", from: index };
}

/** Every figure in a text: digits with their currency, percent or scale, and numbers written as words. */
export function figures(text: string): Figure[] {
  const out: Figure[] = [];
  const taken: [number, number][] = [];
  for (const m of text.matchAll(DIGITS)) {
    const [whole, currency = "", digits, unit = "", plus = ""] = m;
    const index = m.index + (whole.length - whole.trimStart().length);
    // A year or a date is a fact too: it is kept as a plain number.
    const u = unit.trim().toLowerCase();
    const value = Number(digits.replace(/,/g, "")) * (SCALES[u] ?? 1);
    const key = `${currency}${plain(value)}${PERCENT.test(u) ? "%" : ""}`;
    const h = hedgeBefore(text, index);
    out.push({ text: whole.trim(), key, hedge: plus ? "over" : h.hedge, phrase: text.slice(h.from, m.index + whole.length).trim(), index });
    taken.push([m.index, m.index + whole.length]);
  }
  const words = [...text.matchAll(/[A-Za-z]+/g)];
  for (let i = 0; i < words.length; i++) {
    const m = words[i];
    const w = m[0].toLowerCase();
    // "m" and "k" alone are letters, not numbers; they only count straight after digits.
    if (!isNumberWord(w) || (w in SCALES && w.length < 3)) continue;
    if (taken.some(([a, b]) => m.index >= a && m.index < b)) continue;
    // "one of the team", "a second one", "half-term": not a count.
    const after = text.slice(m.index + w.length);
    if (w === "one" && /^\s+(?:of|another|day)\b/i.test(after)) continue;
    if (w === "half" && /^\s*-?\s*(?:day|term)/i.test(after)) continue;
    let end = m.index + w.length;
    let key: string;
    if (w in FRACTIONS) key = FRACTIONS[w];
    else {
      // "two million", "five hundred", "twenty five": read together as one number.
      let value = UNITS[w] ?? SCALES[w];
      for (let next = words[i + 1]; next && /^[\s-]+$/.test(text.slice(end, next.index)); next = words[i + 1]) {
        const n = next[0].toLowerCase();
        if (n in SCALES && n.length > 2) value *= SCALES[n];
        else if (n in UNITS && UNITS[n] < 10 && value >= 20 && value < 100 && value % 10 === 0) value += UNITS[n];
        else break;
        end = next.index + n.length;
        i++;
      }
      key = plain(value);
    }
    const h = hedgeBefore(text, m.index);
    out.push({ text: text.slice(m.index, end), key, hedge: h.hedge, phrase: text.slice(h.from, end).trim(), index: m.index });
  }
  return out.sort((a, b) => a.index - b.index);
}

/* ---------------------------------------------------------------- ownership */

/**
 * Words that say the person supported the work, and words that say they were
 * in charge of it. "Helped", "owned" and "led" are different claims: a draft
 * may not drop the first kind or add the second.
 */
const SUPPORT = ["helped", "help", "helping", "assisted", "assist", "assisting", "supported", "support", "supporting", "contributed", "contribute", "contributing", "participated", "shadowed", "collaborated", "co-led", "co-wrote", "co-authored", "co-ordinated with", "worked with", "worked alongside", "worked on", "part of", "member of", "took part", "involved in", "alongside", "under the direction of", "under supervision"];
const LEAD = ["led", "lead", "leading", "owned", "own", "owning", "managed", "manage", "managing", "headed", "directed", "ran", "run", "running", "oversaw", "oversee", "overseeing", "supervised", "supervise", "supervising", "spearheaded", "chaired", "founded", "in charge of", "responsible for", "accountable for", "sole", "solely", "single-handedly", "pioneered", "drove", "championed", "orchestrated"];

const found = (text: string, phrases: string[]) => {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9-]+/g, " ")} `;
  return phrases.filter((p) => t.includes(` ${p} `));
};

/** Words in the text that say the person supported the work. */
export const supportWords = (text: string) => found(text, SUPPORT);
/** Words in the text that say the person was in charge of the work. */
export const leadWords = (text: string) => found(text, LEAD);

/** The same word in its other forms: "managing" and "managed" are one claim. */
const FAMILY: string[][] = [
  ["led", "lead", "leading"],
  ["ran", "run", "running"],
  ["owned", "own", "owning"],
  ["oversaw", "oversee", "overseeing"],
  ["drove", "drive", "driving"],
  ["wrote", "write", "writing", "written"],
  ["built", "build", "building"],
  ["grew", "grow", "growing", "grown"],
  ["cut", "cutting"],
  ["won", "win", "winning"],
  ["sold", "sell", "selling"],
  ["taught", "teach", "teaching"],
  ["made", "make", "making"],
  ["took", "take", "taking", "taken"],
  ["gave", "give", "giving", "given"],
  ["held", "hold", "holding"],
  ["kept", "keep", "keeping"],
  ["brought", "bring", "bringing"],
  ["set", "setting"],
  ["began", "begin", "beginning", "begun"],
  ["chose", "choose", "choosing", "chosen"],
  ["spoke", "speak", "speaking", "spoken"],
  ["met", "meet", "meeting"],
  ["found", "find", "finding"],
  ["sent", "send", "sending"],
  ["spent", "spend", "spending"],
  ["rose", "rise", "rising", "risen"],
  ["fell", "fall", "falling", "fallen"],
  ["rebuilt", "rebuild", "rebuilding"],
  ["rewrote", "rewrite", "rewriting", "rewritten"],
  ["undertook", "undertake", "undertaking", "undertaken"],
  ["shrank", "shrink", "shrinking", "shrunk"],
  ["dealt", "deal", "dealing"],
  ["paid", "pay", "paying"],
  ["bought", "buy", "buying"],
  ["understood", "understand", "understanding"],
  ["came", "come", "coming"],
  ["became", "become", "becoming"],
  ["saw", "see", "seeing", "seen"],
  ["knew", "know", "knowing", "known"],
  ["got", "get", "getting"],
  ["broke", "break", "breaking", "broken"],
  ["withdrew", "withdraw", "withdrawing", "withdrawn"],
  ["overcame", "overcome", "overcoming"],
  ["stood", "stand", "standing"],
  ["lost", "lose", "losing"],
  ["shot", "shoot", "shooting"],
  ["drew", "draw", "drawing", "drawn"],
  ["flew", "fly", "flying", "flown"],
];
const FAMILY_OF = new Map<string, string>();
for (const f of FAMILY) for (const w of f) FAMILY_OF.set(w, f[0]);

/* ---------------------------------------------------------------- the words */

/** Words that carry no claim of their own: a draft may add or drop them freely. */
const GLUE = new Set(
  `a an the and or but nor so yet of to in on at by for from with without within into onto over under across through throughout between among during before after since until while as than then that which who whom whose this these those it its their his her our my your i we you he she they me us them am is are was were be been being do does did done doing have has had having will would can could should may might must shall not no also both each every all any some such per via using used use including included include resulting where when what how why there here up down out off about around roughly approximately nearly almost over more less fewer least most very really just only`.split(/\s+/),
);

/** Words a tidy-up may cut without losing anything the person claimed. */
export const FILLER = new Set(
  `successfully various responsible responsibility responsibilities tasked duties duty day-to-day basically essentially actually really very quite order effectively efficiently proactively actively utilised utilized utilise utilize leveraged leverage role job position included involved involving etc highly strong strongly extensive extensively numerous multiple several key main mainly primarily generally overall basis able range variety wide well`.split(/\s+/),
);

/** A word reduced to the part that stays the same when its ending changes: "managing", "managed" and "manages" all give "manag". */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/^[^\p{L}\p{N}£$€]+|[^\p{L}\p{N}%+#]+$/gu, "").replace(/['’]s$/, "");
  if (!w) return "";
  const family = FAMILY_OF.get(w);
  if (family) return family;
  if (/\d/.test(w)) return w;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 4 && w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) w = w.slice(0, -1);
  for (const suffix of ["isation", "ization", "ations", "ation", "ments", "ment", "ingly", "edly", "ing", "ed", "er", "ly"]) {
    if (w.length - suffix.length >= 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  // "running" → "runn" → "run"; "manage" and "manag" meet at "manag".
  if (w.length > 3 && w[w.length - 1] === w[w.length - 2] && !/[aeiouls]/.test(w[w.length - 1])) w = w.slice(0, -1);
  if (w.length > 3 && (w.endsWith("e") || w.endsWith("y"))) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith("is")) w = `${w.slice(0, -2)}`;
  // "meetings" has come down to "meet": the same word as "met" and "meeting".
  return FAMILY_OF.get(w) ?? w;
}

export interface Term {
  /** As written. */
  text: string;
  stem: string;
}

/** The words of a text that carry its content, in order, with the glue words left out. Figures are left to `figures`. */
export function terms(text: string): Term[] {
  const out: Term[] = [];
  for (const m of text.matchAll(/\p{L}[\p{L}\p{N}'’+#.&/-]*[\p{L}\p{N}+#]|\p{L}/gu)) {
    const word = m[0].replace(/[.,;:]+$/, "");
    const lower = word.toLowerCase();
    if (GLUE.has(lower) || isNumberWord(lower)) continue;
    // "year-on-year", "client-facing": the parts are checked, so a hyphen added or dropped is not a new word.
    const parts = lower.includes("-") && !FILLER.has(lower) ? lower.split("-") : [lower];
    for (const p of parts) {
      if (!p || GLUE.has(p) || isNumberWord(p)) continue;
      const s = stem(p);
      if (s) out.push({ text: parts.length > 1 ? p : word, stem: s });
    }
  }
  return out;
}

/** Text as one line with tidy spacing. */
export const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** Splits notes into sentences, keeping each exactly as written. */
export function sentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9£$€“"'])/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z0-9]/.test(s));
}
