import "server-only";
import { z } from "zod";
import { ask } from "@/lib/ai/ask";
import { aiConfig } from "@/lib/ai/config";
import type { CvDoc } from "../schema";
import { writingMode } from "../write/assist";
import { oneLine } from "../write/facts";
import { type Editable, type Op, applyOps, describeOp, findBullet, parseOps } from "./ops";
import { PASSING, type StepKey, nextStep, outline } from "./plan";
import { looksLikeAdvert, rulesTurn, swapWord } from "./rules";
import { aiTells, plainerWords, tidyProse } from "./style";
import { type Checked, checkOps, problemsFor } from "./validate";

/**
 * One turn of the CV conversation. The person says something; the assistant
 * proposes edits and a reply; every edit is checked against what the person
 * has said (`validate.ts`) and only the ones that pass are sent back. The CV
 * itself is not saved here: the builder applies the edits, shows them on the
 * paper, and saves them as one step that Undo takes back.
 */

export interface Said {
  who: "you" | "assistant";
  text: string;
}

export interface TurnInput {
  /** The CV as saved, with every line. */
  cv: CvDoc;
  /** Lines that come from achievements marked private: the model is not shown their words. */
  hidden: Set<string>;
  message: string;
  /** What the person said earlier in this conversation, oldest first. */
  words: string[];
  /** The conversation so far, for the model's context. */
  history: Said[];
  spoken: boolean;
  /** The entry being talked about. */
  about?: string;
  /** The question the person was answering, and the ones they have passed on. */
  step?: string;
  skipped: string[];
  now: Date;
}

/** A word the person used that reads as AI-written, and a plainer one they may choose instead. */
export interface Tip {
  word: string;
  plainer: string;
}

export interface Left {
  what: string;
  why: string;
}

export interface TurnResult {
  /** Who made the edits: the model, or the rules that stand in for it. */
  by: "ai" | "rules";
  say: string;
  ask: string;
  ops: Op[];
  /** Edits that were proposed and left out, with why. */
  left: Left[];
  /** Plainer words for AI-sounding ones the person used themselves. Suggestions only. */
  tips: Tip[];
  about?: string;
  step: StepKey;
  skipped: string[];
  /** Said when the AI service didn't answer and the rules were used instead. */
  note?: string;
}

const Reply = z.object({
  say: z.string().max(1200).default(""),
  ask: z.string().max(600).default(""),
  ops: z.array(z.unknown()).max(24).default([]),
});

const NO_MORE = /\bno (?:more|other) (?:jobs?|roles?|work)\b|\bthat'?s (?:all|it) for (?:jobs|work)\b/i;

const spelling = (region: CvDoc["region"]) => (region === "us" ? "US" : "UK");

function system(cv: CvDoc): string {
  const word = cv.region === "us" ? "resume" : "CV";
  return `You are the ${word} assistant in Hakkiri. You build the person's ${word} with them while they talk or type: they tell you about their work, and you edit their ${word} as they go. Their ${word} is read first by applicant tracking software and AI screeners, then by a person.

Truth (code checks every edit; an edit that breaks one of these is thrown away):
- Use only what the person has said in this conversation or what is already on their ${word}. Never add a number, tool, employer, date, result, skill or qualification they have not said.
- When a line would be stronger with a number, a result or a clearer verb, ask the person for it. Never supply it yourself.
- Keep the claim the same size. "helped" stays "helped". "about 40" stays "about 40". Where they say "we", end the line with "as part of the team".
- Reuse their words. You may reorder them, cut filler, fix grammar and change a word's ending. Do not swap in a different word that carries meaning.

Writing (for screeners and for people):
- Plain, specific words, the way a capable person talks about their work. No buzzwords and no AI phrasing. Never write: spearheaded, leveraged, utilised, orchestrated, synergy, seamless, robust, dynamic, passionate, results-driven, innovative, cutting-edge, showcase, foster, delve, pivotal, testament, navigate, landscape, elevate, empower, harness, holistic, world-class, proven track record.
- No dashes between clauses. No "I", "me", "my", "we" or "our" in the ${word}. No full stop at the end of a line.
- One point per line, under 30 words, starting with what they did. Keep the result and its number in the same line as the work that caused it.
- Name tools exactly as the person names them. Spell out an abbreviation once unless it is the name of a tool.
- ${spelling(cv.region)} spelling.

Talking:
- "say": one or two short sentences saying what you changed, in plain words. No praise, no exclamation marks, no "Great!".
- "ask": exactly one question, the next thing you need. Use the suggested next question unless a follow-up about what they just said would get a number, a result or their own part in the work.
- When they ask for a change, make it. When you cannot make it from their words, say what you need from them.
- Never remove their words. To take a line off, use hide_bullet: it is kept and can be switched back on.

Edits ("ops"). Use the ids in the outline. A new entry gets a ref ("new1", "new2"), and lines for it in the same reply use that ref as "entry":
{"op":"set_contact","field":"fullName|email|phone|location","value":"..."}
{"op":"add_link","value":"..."}
{"op":"set_target","title":"job title","employer":"..."}
{"op":"add_entry","ref":"new1","section":"experience|education|projects|volunteering|certificates|awards|courses","title":"...","org":"...","location":"","start":"YYYY or YYYY-MM","end":"","current":false,"subject":"","grade":""}
{"op":"update_entry","entry":"<id>","title":"...","org":"...","start":"...","end":"...","current":true}
{"op":"add_bullet","entry":"<id or ref>","text":"the line","quotes":["the person's exact words this line is made from"]}
{"op":"reword_bullet","bullet":"<line id>","text":"the new wording"}
{"op":"hide_bullet","bullet":"<line id>"}
{"op":"show_bullet","bullet":"<line id>"}
{"op":"move_bullet","bullet":"<line id>","to":"top|bottom"}
{"op":"add_skills","names":["..."]}
{"op":"set_profile","text":"three or four sentences, without I"}
{"op":"add_items","kind":"languages|interests","items":[{"name":"...","level":"..."}]}
For education, "title" is the qualification ("BSc Economics"), "org" the institution. Dates only as the person gave them: a year they said, or a year and month. "current": true for a job they still do.

Reply with one JSON object and nothing else: {"say":"...","ask":"...","ops":[...]}`;
}

/** The person's own words, once each, newest last, within what is sent. */
function wordsOf(input: TurnInput): string[] {
  const all = [...input.words, input.message].map((w) => w.trim()).filter(Boolean);
  const out: string[] = [];
  let size = 0;
  for (const w of [...new Set(all)].reverse()) {
    if (size + w.length > 40000) break;
    out.unshift(w);
    size += w.length;
  }
  return out;
}

/** What was changed, said plainly, when the model's own words can't be used (some of its edits were left out). */
function plainSay(cv: Editable, ops: Op[], left: Left[], spoken: boolean): string {
  const changes = applyOps(cv, ops, { spoken }).changes;
  const did = changes.length ? `${changes.length === 1 ? "I made one change" : `I made ${changes.length} changes`}.` : "";
  const out = left.length ? `I left out ${left[0].what}: ${left[0].why}${left.length > 1 ? ` (and ${left.length - 1} more)` : ""}` : "";
  return [did, out].filter(Boolean).join(" ") || "I didn’t change anything from that.";
}

/** The entry an edit is about, as an id or a ref. */
function entryOf(cv: Editable, op: Op): string | undefined {
  if (op.op === "add_entry") return op.section === "experience" ? op.ref : undefined;
  if ("entry" in op) return op.entry;
  if ("bullet" in op) return findBullet(cv.sections, op.bullet)?.entry.id;
  return undefined;
}

/** The model's proposal for this turn, or null when the service didn't answer. */
async function modelTurn(input: TurnInput, words: string[], step: { ask: string; about?: string }, pre: Op[]): Promise<{ say: string; ask: string; checked: Checked; bad: string[] } | null> {
  const cv = input.cv;
  const ctx = { words, latest: input.message, now: input.now };
  let last: { say: string; ask: string; checked: Checked; bad: string[] } | null = null;
  let calls = 0;
  const user = JSON.stringify({
    cv: outline({ ...cv, sections: cv.sections.map((s) => (s.kind === "summary" || s.kind === "skills" || !("entries" in s) ? s : { ...s, entries: s.entries.map((e) => ({ ...e, bullets: e.bullets.map((b) => (input.hidden.has(b.id) ? { ...b, text: "(private line, not shown)" } : b)) })) })) }),
    level: cv.level,
    advert: (cv.target?.advert || (pre.find((o) => o.op === "set_advert") as { text?: string } | undefined)?.text || "").slice(0, 6000),
    advert_just_pasted: pre.some((o) => o.op === "set_advert"),
    suggested_next_question: step.ask,
    talking_about_entry: input.about ?? null,
    conversation: input.history.slice(-12).map((h) => ({ [h.who === "you" ? "person" : "assistant"]: h.text.slice(0, 2000) })),
    person_now: input.spoken ? { said: input.message, note: "spoken, turned into text by speech recognition: allow for misheard words" } : { typed: input.message },
  });
  const value = await ask({
    model: aiConfig.mainModel,
    system: system(cv),
    user,
    maxTokens: 1600,
    temperature: 0.3,
    timeoutMs: 30000,
    schema: Reply,
    label: "cv-assistant",
    check: (v) => {
      calls++;
      const { ops, bad } = parseOps(v.ops);
      const checked = checkOps(cv, [...pre, ...ops], ctx);
      last = { say: v.say, ask: v.ask, checked, bad };
      // The first reply gets one more try with its problems listed. The second is taken as it is, with the failing edits left out.
      return calls === 1 ? [...bad, ...problemsFor(checked.left)] : [];
    },
  });
  return value ? last : null;
}

export async function runTurn(input: TurnInput): Promise<TurnResult> {
  const cv = input.cv;
  const words = wordsOf(input);
  // "No more jobs" passes on the question about this job and on adding another one.
  const done = NO_MORE.test(input.message) ? ["more-roles", ...(input.step ? [input.step] : [])] : [];
  const skipped = [...new Set([...input.skipped, ...(input.step && PASSING.test(input.message) ? [input.step] : []), ...done])].slice(-60);
  const ctx = { words, latest: input.message, now: input.now };
  const pre: Op[] = looksLikeAdvert(input.message) ? [{ op: "set_advert", text: input.message.replace(/\r/g, "").trim().slice(0, 20000) }] : [];
  const before = nextStep(cv, { skipped, about: input.about });

  let by: TurnResult["by"] = "rules";
  let note: string | undefined;
  let say = "";
  let question = "";
  let checked: Checked;

  const mode = writingMode();
  // The plain-word tip's button asks for one exact swap: it is made by rule, in every mode, and checked like any other edit.
  const swap = swapWord(cv, input.message);
  const fromModel = mode === "ai" && !swap && !PASSING.test(input.message) ? await modelTurn(input, words, before, pre) : null;
  if (swap) {
    checked = checkOps(cv, swap, ctx);
    if (!swap.length) say = "I couldn’t find that word on your CV.";
  } else if (fromModel) {
    by = "ai";
    checked = fromModel.checked;
    const left = checked.left.map((l) => ({ what: describeOp(l.op), why: l.why }));
    // The model's own words are kept only when everything it said it did was done.
    say = left.length || fromModel.bad.length ? plainSay(cv, checked.ops, left, input.spoken) : tidyProse(fromModel.say);
    question = tidyProse(fromModel.ask);
  } else {
    if (mode === "ai" && !PASSING.test(input.message)) note = "The AI service didn’t answer, so I’ve used your own sentences as they are.";
    const rules = rulesTurn(cv, input.message, { about: input.about, step: input.step as StepKey | undefined, now: input.now });
    checked = checkOps(cv, [...pre, ...rules.ops.filter((o) => o.op !== "set_advert")], ctx);
  }
  const left: Left[] = checked.left.map((l) => ({ what: describeOp(l.op), why: l.why }));

  // The CV as it will be once the edits are made: what to ask next is worked out from that.
  const applied = applyOps(cv, checked.ops, { spoken: input.spoken });
  const after: Editable = { ...cv, contact: applied.contact, sections: applied.sections, target: applied.target };
  const touched = [...checked.ops].reverse().map((o) => entryOf(cv, o)).find(Boolean);
  const real = (ref?: string) => (ref ? (applied.refs[ref] ?? ref) : undefined);
  const byId = Object.fromEntries(Object.entries(applied.refs).map(([ref, id]) => [id, ref]));
  const step = nextStep(after, { skipped, about: real(touched) ?? input.about });

  if (!say) {
    // The changes themselves are listed under the reply, so the reply only says how many.
    const n = applied.changes.length;
    say = n ? (n === 1 ? "I made one change." : `I made ${n} changes.`) : PASSING.test(input.message) ? "Fine, we’ll leave that." : "I didn’t find anything to add from that.";
    if (left.length) say += ` I left out ${left[0].what}: ${left[0].why}`;
  }
  const planned = !question || aiTells(question).length > 0;
  if (planned) question = step.ask;
  // The entry the next answer will be about: the one the question names, or the one just talked about.
  const about = planned && step.about ? (byId[step.about] ?? step.about) : (touched ?? input.about);

  // Words the person used themselves that read as AI-written: a plainer word is offered, never swapped in.
  const theirs = checked.ops.flatMap((o) => (o.op === "add_bullet" || o.op === "reword_bullet" ? [o.text] : []));
  const tips: Tip[] = [...new Map(theirs.flatMap(plainerWords).map((t) => [t.word.toLowerCase(), t])).values()].slice(0, 2);

  return { by, say: oneLine(say).slice(0, 1200), ask: oneLine(question).slice(0, 600), ops: checked.ops, left: left.slice(0, 6), tips, about, step: step.key, skipped, note };
}
