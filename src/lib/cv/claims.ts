import { type CvDoc, type Locator, isEntrySection } from "./schema";
import { figures, supportWords } from "./write/facts";

/**
 * "Questions your CV will get" (design spec v3 §04): the strongest claims on
 * the CV, each with the question an interviewer is likely to ask about it.
 * Chosen by rule from the person's own lines; the question only uses the
 * claim's own words, so it never adds a premise the CV doesn't make.
 */

export interface CvClaim {
  /** The bullet's own id: stable across edits. */
  id: string;
  at: Locator;
  /** The line exactly as it is on the CV. */
  text: string;
  question: string;
  /** "Marketing Manager · Kinetix Home" */
  role: string;
  /** What the claim is about, in two or three words: "Budget and return", "Leadership". */
  topic: string;
  /** A short fingerprint of the line's words: practice counts only while the line still says this. */
  hash: string;
}

/** A short, stable fingerprint of a line's words (whitespace and case ignored). */
export function claimHash(text: string): string {
  const t = text.replace(/\s+/g, " ").trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * The question an interviewer is likely to ask about a claim. It names the claim's own strongest figure
 * (money, then a percentage, then any number) and asks how it was achieved and measured, so it never adds
 * a premise the line doesn't make.
 */
/** A number as written, never cut at a thousands comma: "4,000", "£1.5m", "52%". */
const NUM = String.raw`[£$€]?\d{1,3}(?:,\d{3})+(?:\.\d+)?(?:\s?(?:per ?cent|million|billion|bn|k|m)\b|%)?|[£$€]?\d+(?:\.\d+)?(?:\s?(?:per ?cent|million|billion|bn|k|m)\b|%)?`;
/** Words that are not a unit after a figure ("4 minutes by…", "60 students an event"). */
const NOT_UNIT = /^(?:a|an|the|by|in|on|at|for|of|to|with|and|or|per|each|every|while|across|over|from|through|after|before|within|since|during)$/i;

const valueOf = (n: string) => {
  const v = Number(n.replace(/[^\d.]/g, ""));
  return /bn|billion/i.test(n) ? v * 1e9 : /\dm\b|million/i.test(n) ? v * 1e6 : /\dk\b/i.test(n) ? v * 1e3 : v;
};

/** "from 6 to 4 minutes": both figures as written, the unit after them, and whether it went down. */
export function fromTo(text: string): { from: string; to: string; unit: string; down: boolean } | null {
  const m = new RegExp(String.raw`\bfrom\s+(${NUM})\s+to\s+(${NUM})(?:\s+([A-Za-z][A-Za-z-]*))?`, "i").exec(text);
  if (!m) return null;
  const unit = m[3] && !NOT_UNIT.test(m[3]) ? m[3] : "";
  return { from: m[1].trim(), to: m[2].trim(), unit, down: valueOf(m[2]) < valueOf(m[1]) };
}

/** "team of 6 customer assistants": who, without the rest of the line, and never cut inside a number like 4,000. */
function teamOf(text: string): string | undefined {
  const m = /\b(?:an? (?:[a-z-]+ )?)?team of (?:[^,.;]|[,.](?=\d))+/i.exec(text)?.[0];
  if (!m) return undefined;
  return `the ${m.split(/\s+(?:on|in|at|across|serving|for|to|with|while|who|through|during)\s+/i)[0].trim().replace(/^an? /i, "")}`;
}

export function claimQuestion(text: string): string {
  const figs = figures(text);
  const money = figs.find((f) => /[£$€]/.test(f.text));
  const pct = figs.find((f) => /%|per ?cent/i.test(f.text));
  const fig = money ?? pct ?? figs.find((f) => /\d/.test(f.text)) ?? figs[0];
  const topic = claimTopic(text);
  const team = teamOf(text);
  const change = fromTo(text);
  if (topic === "Budget and return" && money) return `How did you decide where the ${money.text} went, and how did you measure what it returned?`;
  if (topic === "Leadership" && team) return `How do you lead ${team.replace(/^a /i, "the ").trim()}, and how do you handle competing priorities?`;
  // "from X to Y": ask about the change, quoting both figures as the CV gives them, never the starting figure alone.
  if (change) {
    const span = `from ${change.from} to ${change.to}${change.unit ? ` ${change.unit}` : ""}`;
    return change.down
      ? `How did you bring it down ${span}, and how did you check the change held?`
      : `What did you change to go ${span}, and how did you establish that your work drove it?`;
  }
  if (topic === "Cost and savings" && fig) return `How did you achieve the ${fig.text} saving, and how did you check it held?`;
  if ((topic === "Growth" || topic === "Improvement" || topic === "Conversion improvement") && fig) return `What did you change to get ${fig.text}, and how did you establish that your work drove it?`;
  if (topic === "Revenue" && fig) return `How did your work lead to ${fig.text}, and how is that figure measured?`;
  if (fig) return `How did you arrive at ${fig.text}, and what did you personally do to get there?`;
  if (team) return `How do you lead ${team.replace(/^a /i, "the ").trim()}?`;
  return "What was your own part in this, and what changed because of it?";
}

/** A short name for what a claim is about, from its own words. */
export function claimTopic(text: string): string {
  const t = text.toLowerCase();
  if (/\b(budget|spend|spent|return on|roi)\b/.test(t)) return "Budget and return";
  if (/\b(lead|led|manag\w*) (a )?team\b|\bteam of\b|\bline manag/.test(t)) return "Leadership";
  if (/\b(conversion|checkout)\b/.test(t)) return "Conversion improvement";
  if (/\b(revenue|sales|income)\b/.test(t)) return "Revenue";
  if (/\b(cut|reduc\w*|sav\w*|lower\w*)\b/.test(t)) return "Cost and savings";
  if (/\b(leads|customers|users|traffic|sign-?ups|followers)\b/.test(t) && /\b(grew|grow|increas\w*|rais\w*|doubl\w*)/.test(t)) return "Growth";
  if (/\b(grew|grow|increas\w*|rais\w*|doubl\w*|improv\w*)/.test(t)) return "Improvement";
  if (/\b(launch\w*|built|set up|introduc\w*|design\w*)/.test(t)) return "Something you built";
  return "Your result";
}

const DECIDING = /\b(led|lead|managed|manage|ran|launched|built|grew|cut|raised|reduced|increased|won|delivered|decided|negotiated|introduced|rebuilt|designed|set up)\b/i;

/** Up to `max` claims, strongest first: a number the person stands behind, then a decision or result. */
export function cvClaims(cv: Pick<CvDoc, "sections">, max = 5): CvClaim[] {
  const found: (CvClaim & { score: number; order: number })[] = [];
  let order = 0;
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s) || !["experience", "volunteering", "projects", "achievements"].includes(s.kind)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      for (const b of e.bullets) {
        const text = b.text.trim();
        order += 1;
        if (!b.visible || text.length < 20) continue;
        const nums = figures(text).length;
        // A line that rests on others ("helped", "supported") is still practised, but a line the person owns comes first.
        const score = nums * 3 + (DECIDING.test(text) ? 2 : 0) - (supportWords(text).length ? 1 : 0);
        if (score <= 0) continue;
        found.push({ id: b.id, at: { section: s.id, entry: e.id, field: b.id }, text, question: claimQuestion(text), topic: claimTopic(text), role: [e.title, e.org].filter(Boolean).join(" · "), hash: claimHash(text), score, order });
      }
    }
  }
  return found
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, max)
    .map(({ score: _s, order: _o, ...c }) => c);
}

/** The id a practice question carries, so a finished session can be matched back to its claim and wording. */
export const claimQuestionId = (cvId: string, claim: Pick<CvClaim, "id" | "hash">, n: number) => `cq_${cvId}_${claim.id}_${claim.hash}_${n}`;

export function parseClaimQuestionId(id: string): { cvId: string; claimId: string; hash: string } | null {
  const m = /^cq_(cv_[A-Za-z0-9]+)_(.+)_([a-z0-9]+)_\d+$/.exec(id);
  return m ? { cvId: m[1], claimId: m[2], hash: m[3] } : null;
}
