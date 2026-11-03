import type { Answer, Interview, Question } from "@/lib/types";
import type { Fix, MockRow } from "@/lib/mocks/report";
import { scoreAnswerView } from "@/lib/answers/view";
import { HABIT_FOR_FIX, HABIT_INSTRUCTION } from "@/lib/sessions/drills";
import { PAY_TIPS, payStage } from "@/lib/sessions/pay";

/**
 * The one-page prep sheet, built from your own practice: it appears after
 * your first interview and gets better each time you practise. Everything
 * here comes from your documents, the set-up and your scored answers.
 */

export interface PrepSheet {
  company: { name: string; whatTheyDo: string | null; jobSummary: string; skills: string[]; toKnow: string[]; whyYou: string[] };
  /** Your best answer to each key question, in its stronger version (your facts, point first). */
  bestAnswers: { questionId: string; question: string; score: number; text: string; answerId: string }[];
  stories: { title: string; source: string; useFor: string[]; text?: string }[];
  probes: { ask: string; handle: string }[];
  questionsToAsk: string[];
  /** Your best answer to "What are your salary expectations?" (from the pay drill), and a tip for the round. */
  pay: { answer: string | null; tip: string };
  /** Three short reminders, from the fixes your interviews keep showing. */
  remember: string[];
  basedOn: { interviews: number; answers: number };
}

/** Questions that matter most on the day come first. */
function priority(q: Question): number {
  if (q.slot === "opening") return 0;
  if (q.type === "why-us") return 1;
  if (q.group === "competency") return 2;
  if (q.group === "technical") return 3;
  if (q.group === "cv") return 4;
  return 5;
}

const REMEMBER: Record<Fix["id"], string> = {
  lead: "Answer first: your decision or result in the first sentence.",
  ownership: "Say “I” for your part. Keep “we” for the team’s.",
  result: "End every story with what changed, and a number.",
  over: "Keep to time: one sentence of background is enough.",
  fillers: "Pause instead of “um”. Pauses sound confident.",
  under: "Say more: a reason, then an example.",
};

export function buildPrepSheet(interview: Interview, input: { answers: Answer[]; interviews: number; fixes: Fix[]; rows: MockRow[] }): PrepSheet {
  // Your best scored answer to each question, across every interview, re-run and drill.
  const best = new Map<string, { answer: Answer; score: number }>();
  for (const a of input.answers) {
    const q = interview.questions.find((x) => x.id === a.questionId);
    if (!q || q.pay) continue;
    const score = scoreAnswerView(a, q.type).overall;
    if (score == null) continue;
    const prev = best.get(q.id);
    if (!prev || score > prev.score) best.set(q.id, { answer: a, score });
  }
  const bestAnswers = [...best.entries()]
    .map(([id, b]) => ({ q: interview.questions.find((x) => x.id === id)!, ...b }))
    .sort((a, b) => priority(a.q) - priority(b.q) || b.score - a.score)
    .slice(0, 5)
    .map(({ q, answer, score }) => ({ questionId: q.id, question: q.text, score, text: answer.strongerVersion.map((s) => s.text).join(" "), answerId: answer.id }));

  // Your best "salary expectations" answer, from the pay drill.
  let payBest: { text: string; score: number } | null = null;
  for (const a of input.answers) {
    const q = interview.questions.find((x) => x.id === a.questionId);
    if (q?.id !== "pay1") continue;
    const score = scoreAnswerView(a, q.type).overall ?? 0;
    if (!payBest || score > payBest.score) payBest = { text: a.strongerVersion.map((x) => x.text).join(" "), score };
  }

  const remember = input.fixes.map((f) => REMEMBER[f.id]);
  for (const k of interview.brief?.toKnow ?? []) if (remember.length < 3) remember.push(k);
  if (remember.length < 3) remember.push(HABIT_INSTRUCTION[HABIT_FOR_FIX.result].replace(/^This time, /, "").replace(/^./, (c) => c.toUpperCase()));

  return {
    company: {
      name: interview.company,
      whatTheyDo: interview.brief?.whatTheyDo || null,
      jobSummary: interview.jobSummary,
      skills: interview.skills,
      toKnow: interview.brief?.toKnow ?? [],
      whyYou: interview.brief?.whyYou ?? [],
    },
    bestAnswers,
    stories: (interview.stories ?? []).filter((s) => s.useFor?.length || s.text).map((s) => ({ title: s.title, source: s.source, useFor: s.useFor ?? [], text: s.text })),
    probes: interview.probes ?? interview.likelyAsks.map((ask) => ({ ask, handle: "" })),
    questionsToAsk: interview.questionsToAsk ?? [],
    pay: { answer: payBest?.text ?? null, tip: PAY_TIPS[payStage(interview.round)].when },
    remember: [...new Set(remember)].slice(0, 3),
    basedOn: { interviews: input.interviews, answers: input.answers.length + input.rows.filter((r) => !r.answerId).length },
  };
}
