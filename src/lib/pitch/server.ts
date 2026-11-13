import "server-only";
import { randomUUID } from "node:crypto";
import type { Answer, FollowUpKind, Word } from "@/lib/types";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { scoreAnswer } from "@/lib/ai/score";
import { buildAnswer, buildFollowUp } from "@/lib/answers/build-answer";
import { saveRecordings, type Recording } from "@/lib/answers/audio";
import { profileFor } from "@/lib/scoring/profiles";
import { decidePress, generateQuestions, planSlides, scoreRun } from "@/lib/ai/pitch/calls";
import { mockQaPressScores, mockQaScore, mockRunModel, mockRunTranscript } from "@/lib/ai/pitch/mock";
import { cutInQuestion, pressesRemaining, rulePress, ruleQuestions } from "@/lib/ai/pitch/qa";
import { codeWarnings, estimateWeights, fallbackPoint, findAskSlide, fitToLimit, type SlideText } from "./timing";
import { cutPlan } from "./measure";
import { assembleRun, measureRun, preliminaryFocus, qaOverall } from "./run";
import { AUDIENCE_TO, personaFor, QA_QUESTIONS, QA_STYLE_LABEL } from "./labels";
import { latestFullRun, nextRunNumber, saveQa, saveRun } from "./store";
import { deleteQaDraft, saveQaDraft, type QaDraft } from "./qa-drafts";
import type { Audience, Mark, Presentation, QaSession, QaStyle, Run, RunMode } from "./types";

/**
 * The presentation pipelines, shared by the API routes:
 * planning a new deck, scoring a run, and running a Q&A session.
 */

const modelAvailable = () => !mockAiEnabled() && Boolean(aiConfig.anthropicKey || aiConfig.geminiKey);

// ---------------------------------------------------------------- planning

export interface PlanResult {
  slides: { plannedSec: number; point: string }[];
  askSlide: number;
  warnings: string[];
  planBy: "model" | "estimate";
}

/**
 * Suggested timing for each slide, the point each needs to land, and what
 * to watch for (design screen 11). Code always fits the times to the limit.
 */
export async function suggestPlan(input: { title: string; audience: Audience; ask: string; limitSec: number; slides: SlideText[] }): Promise<PlanResult> {
  let askSlide = findAskSlide(input.slides, input.ask);
  let weights = estimateWeights(input.slides, askSlide);
  let points = input.slides.map(fallbackPoint);
  let modelWarning: string | null = null;
  let planBy: PlanResult["planBy"] = "estimate";
  if (modelAvailable()) {
    const r = await planSlides(input);
    if (r) {
      weights = r.slides.map((s) => s.weight);
      points = r.slides.map((s) => s.point.trim());
      askSlide = r.askSlide;
      modelWarning = r.warning?.trim() || null;
      planBy = "model";
    }
  }
  const secs = fitToLimit(weights, input.limitSec);
  const planned = input.slides.map((s, i) => ({ ...s, plannedSec: secs[i] }));
  const fromCode = codeWarnings(planned, input.limitSec, input.ask);
  // The model's warning first; skip a code warning about the same slide.
  const slideOf = (w: string) => w.match(/^Slide (\d+)/)?.[1];
  const warnings = [...(modelWarning ? [modelWarning] : []), ...fromCode.filter((w) => !modelWarning || !slideOf(w) || slideOf(w) !== slideOf(modelWarning))].slice(0, 2);
  return { slides: secs.map((plannedSec, i) => ({ plannedSec, point: points[i] })), askSlide, warnings, planBy };
}

// --------------------------------------------------------------------- runs

export interface RecordRunInput {
  presentation: Presentation;
  userId?: string;
  mode: RunMode;
  from: number;
  to: number;
  marks: Mark[];
  startedAt: string;
  totalSec: number;
  audio: Blob;
  transcribe: (audio: Blob, mock: () => Word[]) => Promise<Word[]>;
}

/**
 * Scores a rehearsal run: speech-to-text, the measures, the model's
 * judgement (with the focus chosen in code), then the run is saved with its
 * recording. If the model can't score it, the run is still saved with the
 * measured parts, so a ten-minute run is never lost.
 */
export async function recordRun(input: RecordRunInput): Promise<Run | { error: "no-speech" }> {
  const p = input.presentation;
  const words = await input.transcribe(input.audio, () => mockRunTranscript(p, input.marks, input.totalSec));
  if (words.length < 5) return { error: "no-speech" };

  const m = measureRun(p, input.mode, input.from, input.to, input.marks, words, input.totalSec);
  const focus = preliminaryFocus(p, input.mode, m, input.totalSec);
  const cutSlides = cutPlan(m.slides, input.totalSec - m.budget).map((c) => c.n);
  const scoreInput = {
    presentation: p,
    mode: input.mode,
    slides: m.slides.map((s) => {
      const slide = m.scope.find((x) => x.n === s.n)!;
      return { n: s.n, title: slide.title, lines: slide.lines, point: slide.point, planned: s.planned, seconds: s.seconds, words: s.words };
    }),
    totalSec: input.totalSec,
    focus,
    cutSlides,
  };
  const model = mockAiEnabled() ? mockRunModel(scoreInput, focus) : await scoreRun(scoreInput, focus);

  const id = randomUUID();
  const run = assembleRun({
    id,
    presentation: p,
    number: nextRunNumber(p.id, input.userId || p.userId),
    mode: input.mode,
    from: input.from,
    to: input.to,
    startedAt: input.startedAt,
    finishedAt: new Date().toISOString(),
    totalSec: input.totalSec,
    marks: input.marks,
    words,
    model,
    hasAudio: true,
  });
  run.userId = input.userId || p.userId;
  saveRecordings(`run-${id}`, [{ data: await input.audio.arrayBuffer(), type: input.audio.type || "audio/webm" }]);
  saveRun(run, input.userId || p.userId);
  return run;
}

// ---------------------------------------------------------------------- Q&A

/** Starts a Q&A session: the persona, and questions from your slides and your last full run. */
export async function startQa(p: Presentation, style: QaStyle, userId?: string): Promise<QaDraft> {
  const persona = personaFor(p.audience, style);
  const last = latestFullRun(p.id, userId || p.userId);
  const said = last ? last.slides.map((s) => ({ n: s.n, words: s.words })) : [];
  const count = QA_QUESTIONS;
  const input = { title: p.title, audience: p.audience, ask: p.ask, style, persona, slides: p.slides, said, count };
  const questions = (modelAvailable() ? await generateQuestions(input) : null) ?? ruleQuestions(input);
  const draft: QaDraft = {
    id: randomUUID(),
    userId: userId || p.userId,
    presentationId: p.id,
    style,
    persona,
    questions,
    turns: questions.map(() => []),
    audio: questions.map(() => []),
    pending: questions.map(() => null),
    scoring: questions.map(() => null),
    startedAt: new Date().toISOString(),
    createdAt: Date.now(),
  };
  saveQaDraft(draft);
  return draft;
}

/**
 * One answer (or the reply to a press). Decides whether to ask again: a
 * time-pressed exec who cut in always asks for the short answer; otherwise
 * the fast model decides, with the follow-up engine's checks and limit.
 */
export async function answerQa(
  draft: QaDraft,
  p: Presentation,
  k: number,
  words: Word[],
  audio: Recording,
  cutIn: boolean,
): Promise<{ kind: "challenge" | "clarify"; question: string } | null> {
  const q = draft.questions[k];
  const turns = draft.turns[k];
  const pending = draft.pending[k];
  turns.push(turns.length === 0 ? { asked: q.text, kind: "main", words } : { asked: pending?.question ?? "", kind: (pending?.kind ?? "clarify") as FollowUpKind, words });
  draft.audio[k].push(audio);
  draft.pending[k] = null;
  if (pressesRemaining(turns) === 0) return null;
  let press: { kind: "challenge" | "clarify"; question: string } | null;
  if (cutIn) press = { kind: "clarify", question: cutInQuestion(draft.persona.name) };
  else {
    const input = { persona: draft.persona, style: draft.style, audience: p.audience, question: q, turns };
    press = modelAvailable() ? await decidePress(input) : rulePress(input);
  }
  draft.pending[k] = press;
  return press;
}

/** Scores question k (answer and any press) in the background; the session waits for it at the end. */
export function scoreQaQuestion(draft: QaDraft, p: Presentation, k: number): Promise<Answer | null> {
  if (draft.scoring[k]) return draft.scoring[k]!;
  const turns = draft.turns[k];
  if (!turns.length) return Promise.resolve(null);
  const q = draft.questions[k];
  const context = [
    `Talk: ${p.title}, to ${AUDIENCE_TO[p.audience]}`,
    `The speaker's ask: ${p.ask || "(not given)"}`,
    `Asked by: ${draft.persona.name}, ${draft.persona.title} (${QA_STYLE_LABEL[draft.style].toLowerCase()} audience)`,
  ];
  const slideText = p.slides.flatMap((s) => [s.title, ...s.lines]);
  const mock = mockAiEnabled();
  const work = (async () => {
    // The answer and any time they were asked again, scored in one call.
    const { result, followUps: presses } = mock
      ? { result: mockQaScore(k), followUps: turns.length < 2 ? null : mockQaPressScores(k) }
      : await scoreAnswer(
          {
            question: q.text,
            type: "presentation-qa",
            role: "",
            seniority: "",
            jobSummary: "",
            words: turns[0].words,
            examples: [],
            setting: { coach: "You are Hakkiri's presentation coach. You score one spoken answer to a question from the audience after a talk, and the replies when they asked again.", context },
            followUps: turns.slice(1).map((t) => ({ asked: t.asked, words: t.words })),
            asker: draft.persona.name,
          },
          slideText,
        );
    const answer = buildAnswer({
      id: `${draft.id}-q${k + 1}`,
      interviewId: p.id,
      questionId: `qa-${k + 1}`,
      questionNumber: k + 1,
      questionsInMock: draft.questions.length,
      words: turns[0].words,
      result,
      profile: profileFor("presentation-qa"),
      followUps: presses ? turns.slice(1).map((t, i) => buildFollowUp({ kind: t.kind as FollowUpKind, asked: t.asked, words: t.words }, presses.followUps[i])) : [],
    });
    return { ...answer, createdAt: new Date().toISOString() };
  })().catch((err) => {
    console.warn(`[qa] question ${k + 1} couldn't be scored:`, err instanceof Error ? err.message : err);
    draft.scoring[k] = null; // allow one more try at the end
    return null;
  });
  draft.scoring[k] = work;
  return work;
}

/** Ends the session: waits for every answered question's score (one more try for any that failed), then saves it. */
export async function finishQa(draft: QaDraft, p: Presentation, userId?: string): Promise<QaSession | null> {
  const answered = draft.turns.map((t, k) => (t.length ? k : -1)).filter((k) => k >= 0);
  let results = await Promise.all(answered.map((k) => scoreQaQuestion(draft, p, k)));
  if (results.some((r) => !r)) results = await Promise.all(answered.map((k, i) => results[i] ?? scoreQaQuestion(draft, p, k)));
  const answers = results.filter((a): a is Answer => a != null);
  if (!answers.length) return null;
  answered.forEach((k, i) => {
    const a = results[i];
    if (a) saveRecordings(a.id, draft.audio[k]);
  });
  const effectiveUserId = userId || draft.userId || p.userId;
  const session: QaSession = {
    id: draft.id,
    userId: effectiveUserId,
    presentationId: p.id,
    style: draft.style,
    persona: draft.persona,
    startedAt: draft.startedAt,
    finishedAt: new Date().toISOString(),
    questions: draft.questions,
    answers,
    overall: qaOverall(answers),
  };
  saveQa(session, effectiveUserId);
  deleteQaDraft(draft.id);
  return session;
}
