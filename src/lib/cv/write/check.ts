import { FILLER, type Figure, figures, leadWords, sentences, stem, supportWords, terms } from "./facts";

/**
 * The checks every piece of drafted writing must pass before a person sees it
 * as a suggestion. They are code, not judgement: a draft either says only what
 * the person said, or it is refused with the exact difference.
 *
 *  - `checkGrounded`: a draft adds nothing to its sources (bullets from notes,
 *    a profile from the CV).
 *  - `checkRewrite`: a rewrite also loses nothing (every figure, the outcome,
 *    the level of ownership and every estimate survive).
 *  - `checkMerge`: a detail the person supplied ("about 40") is in the result,
 *    as they gave it.
 */

export type ProblemKind = "added-figure" | "dropped-figure" | "estimate" | "ownership" | "added-word" | "dropped-word" | "replaced" | "first-person" | "length";

export interface Problem {
  kind: ProblemKind;
  /** The wording in the person's own text. */
  original?: string;
  /** The wording in the draft. */
  proposed?: string;
  /** One sentence saying exactly what differed. */
  say: string;
}

export interface Verdict {
  ok: boolean;
  problems: Problem[];
}

const q = (s: string) => `“${s}”`;
const HEDGE_WORD = { about: "an estimate", over: "a minimum", under: "a maximum", "": "exact" } as const;

interface GroundOptions {
  /** Words the draft may use although they are not in the sources (the joining words of a profile, say). */
  allow?: Iterable<string>;
  /** Figures the draft may use although they are not written in the sources (years of experience worked out from the dates). */
  allowFigures?: Iterable<string>;
  /** What the sources are called in messages: "your words", "your notes", "your CV". */
  whose?: string;
  /** The draft is a new wording of the sources as a whole (a rewrite), so every supporting word in them must stay. */
  sameClaim?: boolean;
}

/** A draft says nothing that its sources do not: no new figure, no new word that carries a claim, no bigger share of the credit, no estimate made exact. */
export function checkGrounded(draft: string, sources: string[], opts: GroundOptions = {}): Verdict {
  const whose = opts.whose ?? "your words";
  const problems: Problem[] = [];
  const sourceFigures = sources.flatMap(figures);
  const allowedFigures = new Set(opts.allowFigures ?? []);

  for (const f of figures(draft)) {
    const same = sourceFigures.filter((s) => s.key === f.key);
    if (!same.length) {
      if (!allowedFigures.has(f.key)) problems.push({ kind: "added-figure", proposed: f.text, say: `It added ${q(f.text)}, which isn’t in ${whose}.` });
      continue;
    }
    // An estimate stays an estimate; a floor stays a floor.
    if (!same.some((s) => s.hedge === f.hedge)) {
      const s = same[0];
      problems.push({ kind: "estimate", original: s.phrase, proposed: f.phrase, say: `${cap(whose)} say ${q(s.phrase)} (${HEDGE_WORD[s.hedge]}); the draft says ${q(f.phrase)} (${HEDGE_WORD[f.hedge]}).` });
    }
  }

  // "Helped", "owned" and "led" are different claims.
  const family = (words: string[]) => new Set(words.map((w) => stem(w.split(" ")[0])));
  const sourceLead = family(sources.flatMap(leadWords));
  const sourceText = ` ${sources.join(" ").toLowerCase()} `;
  const raised = leadWords(draft).filter((w) => !sourceLead.has(stem(w.split(" ")[0])) && !sourceText.includes(` ${w} `));
  // A supporting word must stay when the draft is built on the sentence it came from; other sentences of the notes are not its business.
  const draftSupport = family(supportWords(draft));
  const draftStems = new Set(terms(draft).map((t) => t.stem));
  const droppedSupport: string[] = [];
  for (const sentence of sources.flatMap(sentences)) {
    const support = supportWords(sentence).filter((w) => !draftSupport.has(stem(w.split(" ")[0])));
    if (!support.length) continue;
    const skip = new Set(supportWords(sentence).flatMap((w) => w.split(" ").map(stem)));
    const content = terms(sentence).filter((t) => !skip.has(t.stem));
    const shared = content.filter((t) => draftStems.has(t.stem)).length;
    if (opts.sameClaim || (content.length && shared / content.length >= 0.5)) droppedSupport.push(...support);
  }
  if (raised.length && droppedSupport.length) problems.push({ kind: "ownership", original: droppedSupport[0], proposed: raised[0], say: `It replaced ${q(droppedSupport[0])} with ${q(raised[0])}, which claims more than ${whose} do.` });
  else if (raised.length) problems.push({ kind: "ownership", proposed: raised[0], say: `It says ${q(raised[0])}, which ${whose} don’t.` });
  else if (droppedSupport.length) problems.push({ kind: "ownership", original: droppedSupport[0], say: `It dropped ${q(droppedSupport[0])}, so it claims more of the work than ${whose} do.` });

  const known = new Set(sources.flatMap(terms).map((t) => t.stem));
  for (const w of opts.allow ?? []) known.add(stem(w));
  const flagged = new Set<string>(problems.flatMap((p) => [p.proposed ?? "", p.original ?? ""]).flatMap((p) => p.toLowerCase().split(" ")));
  const added = terms(draft).filter((t) => !known.has(t.stem) && !flagged.has(t.text.toLowerCase()));
  for (const t of dedupe(added)) problems.push({ kind: "added-word", proposed: t.text, say: `It added ${q(t.text)}, which isn’t in ${whose}.` });

  return { ok: problems.length === 0, problems };
}

/**
 * A rewrite keeps the meaning: everything `checkGrounded` asks, and nothing
 * lost either. Every figure, and every word that carries content, is still
 * there. Only filler may go. `extra` holds anything else the person has said
 * that the rewrite may draw on (a detail they just supplied).
 */
export function checkRewrite(original: string, proposed: string, extra: string[] = []): Verdict {
  const grounded = checkGrounded(proposed, [original, ...extra], { whose: "your words", sameClaim: true });
  const problems = [...grounded.problems];

  const kept = new Set(figures(proposed).map((f) => f.key));
  const droppedFigures: Figure[] = [];
  for (const f of figures(original)) if (!kept.has(f.key) && !droppedFigures.some((d) => d.key === f.key)) droppedFigures.push(f);
  for (const f of droppedFigures) problems.push({ kind: "dropped-figure", original: f.text, say: `It dropped ${q(f.text)}.` });

  const there = new Set(terms(proposed).map((t) => t.stem));
  const flagged = new Set(problems.flatMap((p) => (p.original ?? "").toLowerCase().split(" ")));
  const dropped = dedupe(terms(original).filter((t) => !there.has(t.stem) && !FILLER.has(t.text.toLowerCase()) && !flagged.has(t.text.toLowerCase())));
  const added = problems.filter((p) => p.kind === "added-word");
  if (dropped.length === 1 && added.length === 1) {
    // One word out and one word in: say it as a replacement.
    const at = problems.indexOf(added[0]);
    problems[at] = { kind: "replaced", original: dropped[0].text, proposed: added[0].proposed, say: `It replaced ${q(dropped[0].text)} with ${q(added[0].proposed!)}.` };
  } else for (const t of dropped) problems.push({ kind: "dropped-word", original: t.text, say: `It dropped ${q(t.text)}.` });

  return { ok: problems.length === 0, problems };
}

/** A detail the person supplied has gone into the bullet: the bullet still says what it said, and the detail is there as they gave it. */
export function checkMerge(original: string, detail: string, proposed: string): Verdict {
  const base = checkRewrite(original, proposed, [detail]);
  const problems = [...base.problems];
  const there = new Set(figures(proposed).map((f) => f.key));
  for (const f of figures(detail)) if (!there.has(f.key)) problems.push({ kind: "dropped-figure", original: f.text, say: `It left out ${q(f.text)}, the detail you gave.` });
  return { ok: problems.length === 0, problems };
}

/** The joining words a profile needs that a CV's own text may not contain. They carry no claim. */
export const PROFILE_GLUE = ["experience", "experienced", "year", "years", "recent", "recently", "currently", "background", "skilled", "skills", "skill", "work", "working", "worked", "role", "roles", "career", "professional", "based", "now", "previously", "specialising", "specializing", "focus", "focused", "strengths", "known", "across", "track", "record"];

/** A profile says only what the CV says, in the third person without "I", and is short enough to be a profile. */
export function checkProfile(text: string, cvText: string[], opts: { years?: number } = {}): Verdict {
  const grounded = checkGrounded(text, cvText, { allow: PROFILE_GLUE, allowFigures: opts.years ? [String(opts.years)] : [], whose: "your CV" });
  const problems = [...grounded.problems];
  const first = /\b(I|I’m|I'm|I’ve|I've|my|me|myself)\b/.exec(text);
  if (first) problems.push({ kind: "first-person", proposed: first[0], say: `It uses ${q(first[0])}. A profile is written without “I”.` });
  const count = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim()).length;
  if (count > 5 || text.length > 700) problems.push({ kind: "length", say: `It runs to ${count} sentences. A profile is three to four.` });
  return { ok: problems.length === 0, problems };
}

/** The refusal shown to the person when a rewrite did not keep their claim. */
export function refusalMessage(v: Verdict): string {
  const said = v.problems.slice(0, 3).map((p) => p.say).join(" ");
  const more = v.problems.length > 3 ? ` And ${v.problems.length - 3} more ${v.problems.length - 3 === 1 ? "difference" : "differences"}.` : "";
  return `This rewrite changed your claim. ${said}${more} Your original bullet is still in place.`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function dedupe<T extends { stem: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((t) => (seen.has(t.stem) ? false : (seen.add(t.stem), true)));
}
