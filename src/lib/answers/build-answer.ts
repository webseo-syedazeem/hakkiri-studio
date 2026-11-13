import type { Answer, CoachNote, FollowUp, FollowUpKind, Highlight, Word } from "@/lib/types";
import type { ScoreResult } from "@/lib/ai/score-answer";
import type { FollowUpScores } from "@/lib/ai/score-follow-ups";
import type { ContextProfile } from "@/lib/scoring/profiles";
import { computeDelivery } from "@/lib/scoring/delivery";

/**
 * Turns a transcript plus the model's scoring into the Answer the feedback
 * screen shows. Pure functions only, so it's easy to test.
 */

const clean = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9%']/g, "");

/**
 * Marks filler phrases the model found ("like", "you know") on the words.
 * A multi-word phrase is merged into one word so it counts as one filler.
 */
export function markFillers(words: Word[], phrases: string[]): Word[] {
  const out = words.map((w) => ({ ...w }));
  const targets = [...new Set(phrases.map((p) => p.trim().toLowerCase()).filter(Boolean))]
    .map((p) => p.split(/\s+/).map(clean))
    .sort((a, b) => b.length - a.length);
  for (const t of targets) {
    for (let i = 0; i <= out.length - t.length; i++) {
      if (out[i].filler && t.length === 1) continue;
      if (!t.every((tok, k) => clean(out[i + k].text) === tok)) continue;
      if (t.length === 1) {
        out[i].filler = true;
      } else {
        const merged: Word = { text: out.slice(i, i + t.length).map((w) => w.text).join(" "), start: out[i].start, end: out[i + t.length - 1].end, filler: true };
        out.splice(i, t.length, merged);
      }
    }
  }
  return out;
}

const HESITATION = /^(um+|uh+|er|erm|ah|hmm|mm)$/;

/**
 * Word index range [from, to] of a quote in the transcript, or null.
 * Tries an exact match first, then one that ignores "um"s, since spoken
 * quotes usually leave them out.
 */
export function findQuote(words: Word[], quote: string): [number, number] | null {
  const target = quote.split(/\s+/).map(clean).filter(Boolean);
  if (!target.length) return null;
  const toks = words.map((w) => w.text.split(/\s+/).map(clean).filter(Boolean));
  // Flatten merged filler phrases back to tokens, remembering which word each came from.
  const flat: { tok: string; wi: number }[] = toks.flatMap((ts, wi) => ts.map((tok) => ({ tok, wi })));
  const match = (hay: { tok: string; wi: number }[], needle: string[]): [number, number] | null => {
    for (let i = 0; i <= hay.length - needle.length; i++) {
      if (needle.every((t, k) => hay[i + k].tok === t)) return [hay[i].wi, hay[i + needle.length - 1].wi];
    }
    return null;
  };
  return (
    match(flat, target) ??
    match(
      flat.filter((f) => !HESITATION.test(f.tok)),
      target.filter((t) => !HESITATION.test(t)),
    )
  );
}

/** Splits the stronger version into timed paragraphs at the speaker's own pace. */
export function timeStronger(text: string, wordsPerMinute: number): { paragraphs: { start: number; text: string; highlight?: boolean }[]; lengthSec: number } {
  const sentences = text.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const perSec = Math.max(1.6, wordsPerMinute / 60);
  const paragraphs: { start: number; text: string; highlight?: boolean }[] = [];
  let t = 0;
  // First sentence alone (it's the point); then groups of two or three.
  const groups: string[][] = [[sentences[0]]];
  for (let i = 1; i < sentences.length; i += 2) groups.push(sentences.slice(i, i + 2));
  groups.forEach((g, gi) => {
    const textOf = g.join(" ");
    paragraphs.push({ start: Math.round(t), text: textOf, ...(gi === 0 ? { highlight: true } : {}) });
    t += textOf.split(/\s+/).length / perSec;
  });
  return { paragraphs, lengthSec: Math.round(t) };
}

/** One follow-up and its reply, plus the model's scoring of that reply. */
export function buildFollowUp(turn: { kind: FollowUpKind; asked: string; words: Word[] }, scored: FollowUpScores["followUps"][number]): FollowUp {
  const words = markFillers(turn.words, scored.fillerPhrases);
  const span = findQuote(words, scored.note.quote);
  return {
    kind: turn.kind,
    question: turn.asked,
    words,
    scores: { content: scored.content, structure: scored.structure, delivery: null },
    tripped: scored.tripped?.trim() || null,
    note: { tone: scored.note.tone, title: scored.note.title, body: scored.note.body },
    highlight: span ? { kind: scored.note.tone === "strength" ? "good" : "late", from: span[0], to: span[1] } : null,
  };
}

export interface BuildAnswerInput {
  id: string;
  userId?: string;
  interviewId: string;
  questionId: string;
  questionNumber: number;
  questionsInMock: number;
  words: Word[];
  result: ScoreResult;
  profile: ContextProfile;
  previousOverall?: number;
  followUps?: FollowUp[];
}

export function buildAnswer(input: BuildAnswerInput): Answer {
  const { result, profile } = input;
  const words = markFillers(input.words, result.fillerPhrases);

  const point = findQuote(words, result.pointSentence);
  const metrics = computeDelivery(words, { targetSec: profile.targetSec, pointWordIndex: point?.[0] ?? null, pointWithinSec: profile.pointWithinSec });

  const highlights: Highlight[] = [];
  if (point && metrics.pointFirst === false) highlights.push({ kind: "late", from: point[0], to: point[1] });

  const notes: CoachNote[] = [];
  result.notes.forEach((n, i) => {
    const span = findQuote(words, n.quote);
    notes.push({ id: i + 1, tone: n.tone, title: n.title, body: n.body, pinAfter: span ? span[1] : -1 });
    if (span && n.tone === "strength" && !highlights.some((h) => h.kind === "good")) highlights.push({ kind: "good", from: span[0], to: span[1] });
  });

  const stronger = timeStronger(result.strongerVersion, metrics.wordsPerMinute ?? 140);

  return {
    id: input.id,
    userId: input.userId,
    interviewId: input.interviewId,
    questionId: input.questionId,
    questionNumber: input.questionNumber,
    questionsInMock: input.questionsInMock,
    words,
    pointWordIndex: point?.[0] ?? -1,
    highlights,
    notes,
    scores: { content: result.content.score, structure: result.structure.score, delivery: null },
    previousOverall: input.previousOverall,
    strength: result.strength,
    oneFix: result.oneFix,
    strongerVersion: stronger.paragraphs,
    strongerLengthSec: stronger.lengthSec,
    followUps: input.followUps ?? [],
  };
}
