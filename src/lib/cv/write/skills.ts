import { type CvDoc, type Locator, isEntrySection } from "../schema";
import { oneLine, sentences, stem } from "./facts";

/**
 * Skills worth adding, found by rule: tools and methods the person's own
 * bullets already name, and what the target advert asks for. Each comes with
 * the line of the CV that shows it, or none, in which case the person is
 * asked "Do you have this?" and nothing is added until they say where.
 * Nothing here is taken from a job title.
 */

export interface SkillSuggestion {
  name: string;
  /** Where the suggestion came from. */
  from: "cv" | "advert";
  /** The line of the CV that shows it. Without one, the skill starts unconfirmed. */
  evidence?: { text: string; at: Locator };
}

/** Capitalised words that are not skills. */
const NOT_SKILLS = new Set(
  `january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday i we you they the a an and or but for with our your their this that these those it he she uk us usa eu london england scotland wales ireland britain europe ltd limited plc inc llc company group team department head manager director senior junior lead assistant officer executive associate present current about role job responsibilities requirements essential desirable benefits salary location hybrid remote full part time permanent contract experience skills knowledge ability degree english who what why how when where please apply equal opportunities employer similar equivalent related relevant other others etc more both either range variety least one two three`.split(/\s+/),
);

const CUES = /(?:experience (?:with|in|of|using)|knowledge of|proficien(?:t|cy) (?:in|with)|skills? in|skilled in|familiar(?:ity)? with|understanding of|background in|expertise in|competen(?:t|ce) (?:in|with)|confident (?:with|using)|use of|working with)\s+([^.;:\n()]+)/gi;

const clean = (s: string) => oneLine(s).replace(/^(?:the|a|an|our|your|using|and|or)\s+/i, "").replace(/[\s,.;:!?)"”’']+$/, "").replace(/^[("“‘']+/, "");
const key = (s: string) => s.toLowerCase().split(/\s+/).map(stem).join(" ");

/** Names written with capitals inside a sentence ("Google Ads", "Looker Studio"), acronyms ("PPC") and names with a digit or symbol ("GA4", "C#"). */
export function namedTerms(text: string, opts: { firstWord: boolean } = { firstWord: true }): string[] {
  const out: string[] = [];
  // A name does not run across a comma or a bracket: each stretch between them is read on its own.
  const stretches = sentences(text).flatMap((sentence) => sentence.split(/[,;:()\[\]–—]|\s-\s/).map((part, i) => ({ part, opens: i === 0 })));
  for (const { part, opens } of stretches) {
    const words = [...part.matchAll(/[\p{L}\p{N}][\p{L}\p{N}+#.&/-]*[\p{L}\p{N}+#]|[\p{L}\p{N}]/gu)].map((m) => m[0]);
    let run: string[] = [];
    const flush = () => {
      if (run.length && run.length <= 3) out.push(run.join(" "));
      run = [];
    };
    words.forEach((w, i) => {
      const acronym = /^[A-Z][A-Z0-9+#&/]{1,7}$/.test(w);
      const symbol = /[A-Za-z]/.test(w) && /[\d+#]/.test(w) && w.length <= 12 && !/^\d/.test(w);
      const capital = /^\p{Lu}[\p{L}\p{N}.+#-]+$/u.test(w);
      const ordinary = NOT_SKILLS.has(w.toLowerCase());
      // The first word of a sentence has a capital whatever it is: it only counts as part of a longer name or as an acronym.
      if ((acronym || symbol) && !ordinary) run.push(w);
      else if (capital && !ordinary && (i > 0 || !opens || (opts.firstWord && /^\p{Lu}/u.test(words[1] ?? "")))) run.push(w);
      else flush();
    });
    flush();
  }
  return out;
}

/** What an advert says it wants, read from its own phrases: "experience with X, Y and Z". */
export function askedFor(advert: string): string[] {
  const out: string[] = [];
  for (const m of advert.matchAll(CUES)) {
    // "knowledge of SQL is desirable": the wish ends where the sentence turns to something else.
    const wanted = m[1].split(/\s+(?:is|are|would|will|preferred|desirable|essential|required|helpful|to|for|as|who|that|which|a plus|an advantage)\b/i)[0];
    for (const part of wanted.split(/,|\band\b|\bor\b|\/(?=\s)|&/)) {
      const term = clean(part);
      const count = term.split(/\s+/).length;
      if (term.length >= 2 && count <= 4 && !NOT_SKILLS.has(term.toLowerCase())) out.push(term);
    }
  }
  return out;
}

export const contains = (line: string, term: string) => new RegExp(`(?<![\\p{L}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu").test(line);

/** Suggestions for the Skills section: evidenced ones first, then what the advert asks for that the CV does not yet show. */
export function suggestSkills(cv: Pick<CvDoc, "sections" | "contact" | "target">, limit = 12): SkillSuggestion[] {
  const have = new Set<string>();
  const lines: { text: string; at: Locator; work: boolean }[] = [];
  const names = new Set<string>();
  for (const part of [cv.contact.fullName, cv.contact.location]) for (const w of part.split(/[\s,]+/)) if (w) names.add(w.toLowerCase());
  for (const s of cv.sections) {
    if (s.kind === "skills") for (const g of s.groups) for (const k of g.skills) have.add(key(k.name));
    if (!isEntrySection(s) || !s.visible) continue;
    for (const e of s.entries) {
      // Employers, schools and places are names, not skills.
      for (const part of [e.org, e.location]) for (const w of part.split(/[\s,]+/)) if (w) names.add(w.toLowerCase());
      if (!e.visible) continue;
      // Tools are looked for in lines about work done; a prize or a certificate has capitals without being a skill.
      const work = s.kind === "experience" || s.kind === "projects" || s.kind === "volunteering" || s.kind === "custom";
      for (const b of e.bullets) if (b.visible && b.text.trim()) lines.push({ text: b.text, at: { section: s.id, entry: e.id, field: b.id }, work });
    }
  }
  const advert = cv.target?.advert ?? "";
  const fromAdvert = [...askedFor(advert), ...namedTerms(advert)];
  const advertKeys = new Set(fromAdvert.map(key));
  // From the CV's own lines: names of more than one word, acronyms and names with a symbol. A single capitalised word counts only if the advert names it too.
  const fromCv = lines.filter((l) => l.work).flatMap((l) => namedTerms(l.text, { firstWord: false })).filter((t) => t.includes(" ") || /^[A-Z0-9+#&/]+$/.test(t) || /[\d+#]/.test(t) || advertKeys.has(key(t)));

  const seen = new Set<string>();
  const out: SkillSuggestion[] = [];
  const add = (name: string, from: "cv" | "advert") => {
    const k = key(name);
    if (!k || seen.has(k) || have.has(k) || name.toLowerCase().split(/\s+/).every((w) => names.has(w))) return;
    seen.add(k);
    const line = lines.find((l) => contains(l.text, name));
    if (from === "cv" && !line) return;
    out.push({ name, from, evidence: line && { text: line.text, at: line.at } });
  };
  for (const t of fromCv) add(t, "cv");
  for (const t of fromAdvert) add(t, "advert");
  return [...out.filter((s) => s.evidence), ...out.filter((s) => !s.evidence)].slice(0, limit);
}
