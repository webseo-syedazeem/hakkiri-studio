import type { CvDoc, Locator } from "./schema";
import { isEntrySection } from "./schema";
import { figures, supportWords } from "./write/facts";

/**
 * "Questions your CV will get": the lines on a CV an interviewer is most likely
 * to ask about, and a question for each. Chosen by rule from the person's own
 * lines: a number, a team they led, money, a result. Nothing is scored here and
 * nothing is invented: the question only asks about what the line says.
 */

export type ClaimKind = "leadership" | "money" | "result" | "built" | "part";

export interface ProbedClaim {
  at: Locator;
  /** The line, as written on the CV. */
  text: string;
  /** The role it belongs to, for context: "Marketing Manager · Kinetix Home". */
  role: string;
  kind: ClaimKind;
  /** What the claim is about, in two or three words. */
  label: string;
  question: string;
}

/** Leading people: a leading word, then the people within a few words ("Led a team of 4", "managed two junior executives"). Not "qualified leads", not "managed a budget". */
const LEAD = /\b(?:led|lead|leads|leading|managed|manage|manages|managing|line[- ]managed|mentored|coached|supervised|headed)\b(?:\W+\w+){0,6}?\W+(?:team|teams|people|staff|reports|members|volunteers|executives|marketers|engineers|developers|agencies|nurses|colleagues|apprentices|students|trainees|analysts|designers)\b|\bteam of\b/i;
const MONEY_WORD = /\b(budget|budgets|revenue|profit|turnover|funding|spend|savings|saving|costs?)\b/i;
const CURRENCY = /[£$€]\s?\d/;
const UP = /\b(grew|grow|increased|increase|raised|improved|improve|doubled|tripled|lifted|boosted|added)\b/i;
const DOWN = /\b(cut|cutting|reduced|reduce|lowered|halved|saved|fewer)\b/i;
const BUILT = /^(built|launched|created|designed|set up|introduced|developed|delivered|wrote|rebuilt|redesigned|started|founded|opened)\b/i;

const LABEL: Record<ClaimKind, string> = {
  leadership: "Leading people",
  money: "Money and budget",
  result: "A result you claim",
  built: "Something you built",
  part: "Your part in the work",
};

const hasNumber = (t: string) => figures(t).some((f) => !/^(one|a|an)$/i.test(f.text));
const percent = (t: string) => figures(t).find((f) => f.key.endsWith("%"));
const money = (t: string) => figures(t).find((f) => /^[£$€]/.test(f.key));
/** "from 2.1% to 3.4%", "from £38 to £21", "from 15 to 5 working days". */
const fromTo = (t: string) => /\bfrom\s+([£$€]?[\d.,]+\s?(?:%|million|k|m)?)\s+to\s+([£$€]?[\d.,]+\s?(?:%|million|k|m|(?:working\s+)?(?:days|weeks|months|hours|minutes|seconds))?)/i.exec(t);

/** How likely an interviewer is to probe a line: numbers first, then leading people, money, results. */
function weight(text: string): number {
  let w = 0;
  if (hasNumber(text)) w += 3;
  if (LEAD.test(text)) w += 2;
  if (CURRENCY.test(text) || MONEY_WORD.test(text)) w += 2;
  if ((UP.test(text) || DOWN.test(text)) && (percent(text) || fromTo(text) || money(text))) w += 2;
  if (BUILT.test(text)) w += 1;
  // A line that already says it was shared work is asked about less sharply.
  if (supportWords(text).length) w -= 1;
  return w;
}

function kindOf(text: string): ClaimKind {
  if (LEAD.test(text)) return "leadership";
  if ((UP.test(text) || DOWN.test(text)) && (percent(text) || fromTo(text))) return "result";
  if (CURRENCY.test(text) || MONEY_WORD.test(text)) return "money";
  if (BUILT.test(text)) return "built";
  return "part";
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.;:,]+$/, "");
/** The people led, as the line names them: "a team of 4 engineers", "3 junior developers", "6 nurses". */
function people(text: string): string {
  const team = /\bteam of\s+[\w-]+(?:\s+[a-z-]+)?/i.exec(text);
  if (team) return `a ${team[0].toLowerCase()}`.replace(/^a a /, "a ");
  const n = /\b(\d+|two|three|four|five|six|seven|eight|nine|ten)\s+((?:junior|senior|new|trainee)\s+)?(team members|people|staff|engineers|developers|marketers|nurses|executives|analysts|designers|volunteers|apprentices|students|agencies|colleagues)\b/i.exec(text);
  return n ? n[0] : "the team";
}
/** What was built, short: up to the first "for", "to", "with", "that" or comma. */
function thing(text: string): string {
  const rest = clean(text).replace(BUILT, "").trim();
  return rest.split(/\s+(?:for|to|with|that|which|so|and)\s+|,/i)[0].split(/\s+/).slice(0, 7).join(" ");
}

/** A question about this line. It asks only about what the line says, and never repeats the whole line: the line is shown above it. */
const GENERAL = [
  "What did you do yourself here, and how would you show it was done well?",
  "What was the hardest part of this, and how did you handle it?",
  "What would your manager say about this part of your work?",
];

export function questionAbout(text: string, nth = 0): string {
  const line = clean(text);
  const shared = supportWords(line).length > 0;
  const range = fromTo(line);
  const pct = percent(line);
  const cash = money(line);
  switch (kindOf(line)) {
    case "leadership":
      return shared ? "Who did what in that team, and what was your own part?" : `Tell me about leading ${people(line)}. How did you keep the work on track, and what would they say about you?`;
    case "result":
      if (range) return `How did you get from ${range[1].trim()} to ${range[2].trim()}, and what did you do yourself to get there?`;
      return `How did you measure the ${pct!.text} ${DOWN.test(line) ? "fall" : "rise"}, and what did you do yourself to get it?`;
    case "money":
      if (cash && /\bbudget/i.test(line)) return `How did you manage the ${cash.phrase} budget, and how did you know it was well spent?`;
      if (cash) return `How did you work out the ${cash.text} figure, and what was your own part in it?`;
      return "How did you manage the money, and how did you know it was well spent?";
    case "built":
      return `Walk me through building ${thing(line)}. What was hard, and what would you change now?`;
    default:
      return shared ? "What was your own part in this work?" : GENERAL[nth % GENERAL.length];
  }
}

/** The lines most likely to be probed, most likely first, at most `max`, from the parts of the CV that are switched on. */
export function probedClaims(cv: Pick<CvDoc, "sections">, max = 5): ProbedClaim[] {
  const out: (ProbedClaim & { w: number; order: number })[] = [];
  let order = 0;
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s) || !["experience", "volunteering", "projects"].includes(s.kind)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      const role = [e.title, e.org].filter((x) => x && x.trim()).join(" · ");
      for (const b of e.bullets) {
        const text = b.text.trim();
        order++;
        if (!b.visible || text.split(/\s+/).length < 4) continue;
        const w = weight(text);
        if (w <= 0) continue;
        const kind = kindOf(text);
        out.push({ at: { section: s.id, entry: e.id, field: b.id }, text, role, kind, label: LABEL[kind], question: questionAbout(text), w, order });
      }
    }
  }
  // Most likely first; between equals, the order they appear on the CV (latest role first).
  out.sort((a, b) => b.w - a.w || a.order - b.order);
  // No more than two from one kind in the first five, so the set covers different things.
  const picked: typeof out = [];
  const perKind = new Map<ClaimKind, number>();
  for (const c of out) {
    if (picked.length >= max) break;
    if ((perKind.get(c.kind) ?? 0) >= 2 && out.length > max) continue;
    picked.push(c);
    perKind.set(c.kind, (perKind.get(c.kind) ?? 0) + 1);
  }
  for (const c of out) if (picked.length < max && !picked.includes(c)) picked.push(c);
  // The general question is worded differently each time it comes up.
  let general = 0;
  return picked.map(({ w: _w, order: _o, ...c }) => (c.kind === "part" ? { ...c, question: questionAbout(c.text, general++) } : c));
}
