import { type CvDoc, type Locator, type Requirement, isEntrySection, isListSection } from "../schema";
import { figures, negated, sentences, stem, terms } from "../write/facts";
import { askedFor, contains, namedTerms } from "../write/skills";

/**
 * Job fit: how much of what an advert asks for this version of the CV shows.
 * It is worked out from the CV as it is now. A requirement is met when a line
 * of the CV shows all of it, partly met when the CV shows some of it, and
 * missing otherwise. Required weighs 2, preferred or unstated weighs 1; met
 * earns the weight, partly met half, missing nothing. There is no floor, and
 * an advert with nothing to assess has no score at all.
 */

export type FitStatus = "met" | "partly" | "missing";

export interface CvLine {
  text: string;
  at: Locator;
  /** A listed skill names a thing without showing it being used. */
  kind: "bullet" | "skill" | "profile" | "item" | "title" | "contact";
  /** Words the line stands for without saying: "BSc (Hons) Marine Biology" is a degree. Used for matching, never shown. */
  also?: string;
  role?: any;
}

export interface Assessed {
  requirement: Requirement;
  status: FitStatus;
  weight: 1 | 2;
  earned: number;
  /** The CV lines that show it: those the person linked, then those that match. */
  lines: (CvLine & { by: "you" | "match" })[];
  /** Words of the requirement the CV shows, and words it does not. */
  covered: string[];
  uncovered: string[];
  /** Said beside the status: what part is not covered, or why it counts as it does. */
  note: string;
}

export interface JobFit {
  /** Null when the advert has nothing that can be assessed. */
  score: number | null;
  earned: number;
  total: number;
  rows: Assessed[];
  counts: { met: number; partly: number; missing: number };
}

/** Words every advert uses that say nothing about what is being asked for. */
const GENERIC = new Set(
  "experience experienced ability able knowledge strong excellent proven good great solid demonstrable demonstrated skill skills work working worked year years understanding track record including relevant similar role team teams environment high level levels excellent essential desirable required preferred must have ideally proficient proficiency familiar familiarity comfortable confident competent competence background expertise new least plus etc candidate successful someone related subject equivalent field discipline area full valid current you you'll you're we we'll nice with the a an and or to in of for on at by from also your our will need about looking criteria".split(" ").map(stem),
);

export const SYNONYMS: Record<string, string[]> = {
  ga4: ["google analytics 4", "google analytics", "ga"],
  "google analytics 4": ["ga4", "google analytics", "ga"],
  ppc: ["paid search", "pay per click", "paid ads", "sem", "google ads"],
  "paid search": ["ppc", "pay per click", "paid ads", "sem", "google ads"],
  excel: ["microsoft excel", "ms excel", "spreadsheets"],
  "microsoft excel": ["excel", "ms excel", "spreadsheets"],
  js: ["javascript"],
  javascript: ["js"],
  ts: ["typescript"],
  typescript: ["ts"],
  sql: ["relational database", "postgres", "mysql", "sql server"],
  tableau: ["data visualisation", "bi tool", "power bi"],
};

function expandSynonyms(text: string): string {
  const lower = text.toLowerCase();
  const extra: string[] = [];
  for (const [k, syns] of Object.entries(SYNONYMS)) {
    if (new RegExp(`\\b${k}\\b`, "i").test(lower)) {
      extra.push(...syns);
    }
  }
  return extra.join(" ");
}

type Printable = Pick<CvDoc, "sections" | "requirements" | "target">;

/** Every line on the CV that is switched on and could show a requirement. */
export function cvLines(cv: Pick<CvDoc, "sections">): CvLine[] {
  const out: CvLine[] = [];
  for (const s of cv.sections) {
    if (!s.visible) continue;
    if (s.kind === "summary") {
      // Sentence by sentence: a profile that lists every word of the advert is not one line that shows everything.
      for (const line of sentences(s.text)) out.push({ text: line, at: { section: s.id, field: "text" }, kind: "profile" });
    } else if (s.kind === "skills") {
      for (const g of s.groups) if (g.visible) for (const k of g.skills) if (k.visible && k.name.trim()) out.push({ text: k.name, at: { section: s.id, entry: g.id, field: k.id }, kind: "skill" });
    } else if (isListSection(s)) {
      for (const i of s.items) if (i.visible && i.name.trim()) out.push({ text: [i.name, i.level].filter(Boolean).join(" "), at: { section: s.id, field: i.id }, kind: "item" });
    } else if (isEntrySection(s)) {
      for (const e of s.entries) {
        if (!e.visible) continue;
        const head = [e.title, e.subject, e.grade].filter(Boolean).join(" ");
        if (head.trim() && (s.kind === "education" || s.kind === "certificates" || s.kind === "courses")) {
          out.push({ text: head, at: { section: s.id, entry: e.id, field: "title" }, kind: "item", also: s.kind === "education" && DEGREE.test(e.title) ? "degree graduate qualification" : s.kind === "education" ? "qualification" : "certificate certification qualification" });
        }
        if (s.kind === "experience" && e.title.trim()) {
          out.push({ text: e.title, at: { section: s.id, entry: e.id, field: "title" }, kind: "title", role: e });
        }
        for (const b of e.bullets) if (b.visible && b.text.trim()) out.push({ text: b.text, at: { section: s.id, entry: e.id, field: b.id }, kind: "bullet", role: e });
      }
    }
  }
  return out;
}

/** A qualification that is a degree, by its name: "BSc (Hons)", "Master of Arts", "PhD". */
const DEGREE = /\b(?:B\.?A|B\.?Sc|B\.?Eng|LL\.?B|M\.?A|M\.?Sc|M\.?Eng|M\.?B\.?A|M\.?Phil|Ph\.?D|D\.?Phil|Bachelor|Master|Doctor|Doctorate|Degree|Hons)\b/i;

const same = (a: Locator, b: Locator) => a.section === b.section && (a.entry ?? "") === (b.entry ?? "") && (a.field ?? "") === (b.field ?? "");

/** The words of a requirement that say what is wanted, as written, with the form used for matching. */
export function keyTerms(text: string): { text: string; stem: string }[] {
  const seen = new Set<string>();
  const out = terms(text).filter((t) => !GENERIC.has(t.stem) && (seen.has(t.stem) ? false : (seen.add(t.stem), true)));
  // A figure in a requirement ("5 years", "£1m") is not something a CV line can be matched on word for word.
  return out.filter((t) => !figures(t.text).length);
}

/**
 * A requirement that offers a choice ("a degree in marine biology, ecology or
 * a related subject", "Google Ads or Meta") is shown by any one of the
 * choices. Returns the words every choice shares (the "degree") and the words
 * of each choice; null when the requirement offers no choice.
 */
function choices(text: string): { head: string[]; any: string[][] } | null {
  if (!/\sor\s/i.test(text)) return null;
  const parts = text.split(/\s*,\s*(?:or\s+)?|\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  // In the first part, what comes before "in", "of" or "with" is common to every choice.
  const m = /^(.*?\s(?:in|of|with|as|using)\s)(.+)$/i.exec(parts[0]);
  const head = m ? keyTerms(m[1]).map((k) => k.stem) : [];
  const any = [m ? m[2] : parts[0], ...parts.slice(1)].map((part) => keyTerms(part).map((k) => k.stem)).filter((k) => k.length);
  return any.length >= 1 ? { head, any } : null;
}

export function assess(cv: Printable): Assessed[] {
  const lines = cvLines(cv);
  // A line that says the person does NOT have something ("No experience of cataloguing…") shows nothing.
  const stems = lines.map((l) => (negated(l.text) ? new Set<string>() : new Set(terms(`${l.text} ${l.also ?? ""} ${expandSynonyms(l.text)}`).map((t) => t.stem))));
  return cv.requirements.map((r) => {
    const weight = r.priority === "required" ? 2 : 1;
    const row = (status: FitStatus, more: Partial<Assessed>): Assessed => ({ requirement: r, status, weight, earned: status === "met" ? weight : status === "partly" ? weight / 2 : 0, lines: [], covered: [], uncovered: [], note: "", ...more });
    const keys = keyTerms(r.text || r.quote);
    if (r.gap) return row("missing", { uncovered: keys.map((k) => k.text), note: "You said you don’t have this. It stays in the total." });

    // Lines the person linked count while they are still on the page.
    const linked = r.evidence.map((at) => lines.find((l) => same(l.at, at))).filter((l): l is CvLine => !!l);
    if (linked.length && r.judged) {
      return row(r.judged, { lines: linked.map((l) => ({ ...l, by: "you" as const })), covered: keys.map((k) => k.text), uncovered: r.judged === "partly" && r.uncovered ? [r.uncovered] : [], note: r.judged === "partly" ? `Not covered: ${r.uncovered || "part of this"}` : "" });
    }
    if (!keys.length) return row("missing", { note: "No evidence in this version" });

    // "N+ years of X": check role dates where title or bullets name X
    const yearsMatch = (r.text || r.quote).match(/(\d+)\+?\s*years?(?:\s+(?:of|in))?\s+(.+)/i);
    if (yearsMatch) {
      const wantYears = parseInt(yearsMatch[1], 10);
      const skillWords = keyTerms(yearsMatch[2]).map((k) => k.stem);
      if (skillWords.length) {
        let totalMonths = 0;
        const matchingLines: CvLine[] = [];
        for (const s of cv.sections) {
          if (!s.visible || !isEntrySection(s) || s.kind !== "experience") continue;
          for (const e of s.entries) {
            if (!e.visible || !e.start) continue;
            const fullText = `${e.title} ${e.bullets.map((b) => b.text).join(" ")} ${expandSynonyms(e.title)}`;
            const eStems = new Set(terms(fullText).map((t) => t.stem));
            if (skillWords.every((w) => eStems.has(w))) {
              const startY = parseInt(e.start.slice(0, 4), 10);
              const startM = e.start.length > 4 ? parseInt(e.start.slice(5, 7), 10) - 1 : 0;
              const now = new Date();
              const endY = e.current || !e.end ? now.getFullYear() : parseInt(e.end.slice(0, 4), 10);
              const endM = e.current || !e.end ? now.getMonth() : e.end.length > 4 ? parseInt(e.end.slice(5, 7), 10) - 1 : 11;
              const dur = Math.max(1, (endY - startY) * 12 + (endM - startM));
              totalMonths += dur;
              const tLine = lines.find((l) => l.at.section === s.id && l.at.entry === e.id);
              if (tLine) matchingLines.push(tLine);
            }
          }
        }
        if (totalMonths >= wantYears * 12) {
          return row("met", {
            lines: matchingLines.map((l) => ({ ...l, by: "match" as const })),
            covered: keys.map((k) => k.text),
            uncovered: [],
            note: `Met from ${Math.round(totalMonths / 12)}+ years across ${matchingLines.length} roles.`,
          });
        }
      }
    }

    const hits = lines.map((l, i) => ({ l, n: keys.filter((k) => stems[i].has(k.stem)).length })).filter((h) => h.n > 0).sort((a, b) => b.n - a.n || (a.l.kind === "bullet" ? -1 : 1));
    const coveredStems = new Set(lines.flatMap((_, i) => keys.filter((k) => stems[i].has(k.stem)).map((k) => k.stem)));
    const covered = keys.filter((k) => coveredStems.has(k.stem)).map((k) => k.text);
    const uncovered = keys.filter((k) => !coveredStems.has(k.stem)).map((k) => k.text);
    const support = [...linked.map((l) => ({ ...l, by: "you" as const })), ...hits.filter((h) => !linked.includes(h.l)).slice(0, 2).map((h) => ({ ...h.l, by: "match" as const }))].slice(0, 3);
    // Met needs one line that shows the whole of it, where it was done: not a skill listed on its own, not a
    // sentence of the profile (which says, and does not show), and not words scattered across lines.
    const shows = (kind: CvLine["kind"]) => kind === "bullet" || kind === "item";
    const choice = choices(r.text || r.quote);
    const all = (i: number) => (choice ? choice.head.every((k) => stems[i].has(k)) && choice.any.some((alt) => alt.every((k) => stems[i].has(k))) : keys.every((k) => stems[i].has(k.stem)));
    const wholly = lines.map((l, i) => ({ l, i })).filter((x) => all(x.i));
    const whole = wholly.filter((x) => shows(x.l.kind));
    // For a met requirement, only the lines that show the whole of it are named as showing it.
    if (whole.length) return row("met", { lines: [...linked.map((l) => ({ ...l, by: "you" as const })), ...whole.filter((x) => !linked.includes(x.l)).slice(0, 2).map((x) => ({ ...x.l, by: "match" as const }))], covered, uncovered: [] });
    const said = wholly.find((x) => !shows(x.l.kind));
    if (said) {
      const note = said.l.kind === "title"
        ? "Named in your job title. No line shows where you used it."
        : said.l.kind === "skill"
        ? "Listed as a skill. No line shows where you used it."
        : "Said in your profile. No line shows where you did it.";
      return row("partly", { lines: [{ ...said.l, by: "match" as const }, ...support.filter((l) => l.text !== said.l.text)].slice(0, 3), covered, uncovered: [], note });
    }
    if (covered.length * 2 >= keys.length) return row("partly", { lines: support, covered, uncovered, note: uncovered.length ? `Not covered: ${uncovered.join(", ")}` : "No single line shows all of this." });
    return row("missing", { lines: [], covered, uncovered, note: "No evidence in this version" });
  });
}

export function jobFit(cv: Printable): JobFit {
  const rows = assess(cv);
  const total = rows.reduce((n, r) => n + r.weight, 0);
  const earned = rows.reduce((n, r) => n + r.earned, 0);
  const count = (s: FitStatus) => rows.filter((r) => r.status === s).length;
  return { score: total ? Math.round((earned / total) * 100) : null, earned, total, rows, counts: { met: count("met"), partly: count("partly"), missing: count("missing") } };
}

/** How the score was reached, in words: "5 of 8 points: 2 required met (4), 1 required partly met (1), 2 preferred missing (0)". */
export function fitMaths(fit: JobFit): string {
  if (!fit.total) return "";
  const parts: string[] = [];
  for (const priority of ["required", "preferred"] as const) {
    for (const status of ["met", "partly", "missing"] as const) {
      const rows = fit.rows.filter((r) => r.requirement.priority === priority && r.status === status);
      if (rows.length) parts.push(`${rows.length} ${priority} ${status === "partly" ? "partly met" : status} (${rows.reduce((n, r) => n + r.earned, 0)})`);
    }
  }
  return `${fit.earned} of ${fit.total} points: ${parts.join(", ")}`;
}

export interface Keyword {
  term: string;
  matched: boolean;
  /** How many times it appears on the CV. More than once earns nothing extra. */
  count: number;
}

/** The advert's own terms, and whether each is on the CV. Secondary to the requirements: a guide to wording, not the score. */
export function keywords(cv: Pick<CvDoc, "sections" | "target">): Keyword[] {
  const advert = cv.target?.advert ?? "";
  const text = cvLines(cv).map((l) => l.text);
  const seen = new Set<string>();
  const out: Keyword[] = [];
  // The employer's own name, the place and the words "CV" and "cover letter" are in every advert and on no CV.
  const employer = (cv.target?.employer ?? "").toLowerCase();
  const heading = advert.split("\n").find((l) => employer && l.toLowerCase().includes(employer)) ?? "";
  const notASkill = (term: string) => {
    const t = term.toLowerCase();
    return /^(?:cv|resume|résumé|cover letter|covering letter)$/.test(t) || (!!employer && (employer.includes(t) || t.includes(employer))) || (!!heading && heading.length <= 120 && heading.toLowerCase().includes(t));
  };
  for (const found of [...askedFor(advert), ...namedTerms(advert)]) {
    // "Strong Microsoft Excel" asks for Microsoft Excel.
    const term = found.replace(/^(?:strong|excellent|good|proven|advanced|solid|sound|confident|proficient|working|fluent in)\s+/i, "");
    const k = term.toLowerCase();
    if (seen.has(k) || term.split(/\s+/).length > 3 || notASkill(term)) continue;
    seen.add(k);
    const count = text.filter((t) => contains(t, term)).length;
    out.push({ term, matched: count > 0, count });
  }
  return out.slice(0, 40);
}
