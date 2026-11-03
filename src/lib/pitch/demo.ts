import type { Answer, FollowUp, Word } from "@/lib/types";
import type { ScoreResult } from "@/lib/ai/score-answer";
import { buildAnswer, buildFollowUp } from "@/lib/answers/build-answer";
import { profileFor } from "@/lib/scoring/profiles";
import { speakBetween } from "@/lib/demo-words";
import { DEMO_TODAY, addDays, londonIso } from "@/lib/dates";
import { assembleRun, qaOverall, type RunModelResult } from "./run";
import type { Mark, Presentation, QaSession, Run, Slide, Verdict } from "./types";

/**
 * Demo data for presentations: Priya's Q1 roadmap for the leadership team
 * (design screens 11 to 14), three runs so far, and one Q&A round with a
 * sceptical finance director. Built with the same functions as real runs,
 * so the demo report is worked out exactly like yours.
 */

const day = (n: number) => addDays(DEMO_TODAY, n);

type DemoSlide = Omit<Slide, "n">;

const SLIDES: DemoSlide[] = [
  { title: "Q1 roadmap", lines: ["Payments team · Leadership review"], layout: "title", plannedSec: 30, point: "This is the Q1 plan for payments, and I need a decision today." },
  { title: "Where we are", lines: ["41% → 58%", "Payment completion, six weeks after the fix"], layout: "stat", plannedSec: 60, point: "Payment completion went from 41% to 58% after the fix." },
  { title: "What customers told us", lines: ["“I gave up when my card failed twice.”", "From 40 support calls in December"], layout: "quote", plannedSec: 45, point: "Customers leave when a payment fails, not before." },
  { title: "Three bets for Q1", lines: ["Instant refunds", "Smarter fraud rules", "One-tap repeat payments"], layout: "cards", plannedSec: 60, point: "Three bets for Q1, one sentence each." },
  { title: "Bet 1: instant refunds", lines: ["Refund in seconds, not days", "Covers 92% of disputes", "Live in February"], layout: "bullets", plannedSec: 60, point: "Instant refunds settle 92% of disputes in seconds." },
  { title: "Bet 2: smarter fraud rules", lines: ["False declines, % of good payments", "Oct 3.1", "Nov 2.9", "Dec 2.6", "Jan 1.4"], layout: "chart", plannedSec: 60, point: "Smarter rules cut false declines without more fraud." },
  { title: "Bet 3: one-tap repeat payments", lines: ["Saved cards for returning customers", "Two taps become one", "Pilot with 3 merchants in March"], layout: "bullets", plannedSec: 60, point: "Repeat payments go from two taps to one." },
  { title: "What we’re not doing", lines: ["New onboarding flow (moves to Q2)", "Crypto payouts", "A second card scheme"], layout: "bullets", plannedSec: 30, point: "We’re saying no to three things to protect focus." },
  { title: "Team and hires", lines: ["Seven people across product and engineering", "Two hires: a payments engineer and a risk analyst", "Both can start in January"], layout: "bullets", plannedSec: 45, point: "Two hires are what makes the plan possible." },
  { title: "Risks", lines: ["Fraud losses rise while rules bed in", "Card scheme sign-off may slip", "Hiring takes longer than planned"], layout: "bullets", plannedSec: 45, point: "The biggest risk is fraud while the rules bed in, and it’s capped." },
  { title: "Timeline", lines: ["January: Build instant refunds and the first rules", "February: Refunds live, rules on 10% of traffic", "March: Full fraud roll-out and the one-tap pilot"], layout: "timeline", plannedSec: 45, point: "Everything ships by the end of March." },
  { title: "The ask", lines: ["Approve the Q1 roadmap and two new hires."], layout: "ask", plannedSec: 60, point: "Approve the Q1 roadmap and the two hires today." },
];

export const DEMO_PRESENTATION_ID = "q1-roadmap";

export const demoPresentation: Presentation = {
  id: DEMO_PRESENTATION_ID,
  title: "Q1 roadmap",
  audience: "leadership",
  ask: "Approve the Q1 roadmap and two new hires",
  date: londonIso(day(6), "09:30"),
  timeLimitSec: 600,
  qaStyle: "sceptical",
  source: { kind: "demo", fileName: "Q1-roadmap-leadership.pptx" },
  slides: SLIDES.map((s, i) => ({ ...s, n: i + 1 })),
  askSlide: 12,
  warnings: ["Slide 4 has three ideas on it. Rehearse it with one sentence per bet, or it will run long."],
  planBy: "model",
  createdAt: londonIso(day(-4), "18:20"),
};

// What Priya said on each slide in her runs ({braces} mark fillers).
const SCRIPTS: string[] = [
  "Good morning, everyone, and thanks for the time. This is the plan for payments in Q1, and I’ll be asking for a decision at the end: approval for the roadmap and for two new hires. I’ll keep it to ten minutes, so there’s time for questions.",
  "So, where we are. Six weeks ago we fixed the first payment step, and payment completion went from 41% to 58%. That’s the biggest jump the team has had all year. {Um}, it also means fewer people calling support, because, {you know}, a failed first payment was the top reason people got in touch. Disputes are down too, about a fifth since October. So the foundation is in much better shape than it was in the autumn. The question for Q1 is what we build on top of it, and that’s really what the rest of this is about. And I’d say 58% isn’t the ceiling. There’s more to get, but it’s a different kind of problem now.",
  "We spoke to customers to work out where to go next. One line came up again and again: I gave up when my card failed twice. People don’t leave during sign-up. They leave when a payment goes wrong, and they don’t come back. So everything in Q1 is about payments that work first time, and fixing things fast when they don’t.",
  "So, {um}, we’ve got three bets for Q1. The first one is instant refunds, the second one is smarter fraud rules, and the third is one-tap repeat payments. And, {um}, just to give you a bit of background on how we got to these three, we actually started with a much longer list. I think it was about eleven ideas at one point, and we ran a couple of workshops with engineering and with the risk team. And, {you know}, there was a lot of debate about whether fraud rules should come first or refunds should come first. {Um}, in the end we decided that refunds go first because they’re the most visible to customers, but, {like}, the fraud work actually started in December, so it’s already in flight. And then the third one, one-tap, is probably the least certain, because it depends on the card schemes, and I’ll come back to that in the risks. But the reason I think these three hang together is that they’re all about the moment of paying, which is, {you know}, what customers told us matters. Refunds fix what happens when it goes wrong. Fraud rules stop us declining good customers. And one-tap makes the second payment as easy as possible. {Um}, each of them has its own slide coming up, and I’ll go through what each one is, what it costs, and when it lands. It’s also worth saying that, {like}, we looked at whether we could do all three with the team we have now, and the honest answer is not quite, which is why the hires come up later. So, yeah, those are the three bets.",
  "Bet one, instant refunds. Today a refund takes three to five days, and most disputes start because people can’t see their money coming back. With instant refunds, the money is back in seconds. We looked at the last three months, and this would have settled 92% of disputes before they were raised. {Um}, it goes live in February. The cost is mostly engineering time, two people for six weeks, and we’ve agreed limits with the risk team so large refunds still get checked first.",
  "Bet two, smarter fraud rules. Right now our rules decline about 3.1% of good payments, which is a lot of customers we’re turning away. The new rules use what we know about returning customers, and in testing they brought false declines down to 1.4%, without letting more fraud through. {Uh}, that’s the drop you can see in January, which is the test group. We’ll roll it out in stages, starting with ten percent of traffic in February.",
  "Bet three is one-tap repeat payments. {Um}, this one is still early. We’re talking to three merchants about a pilot in March, and the card schemes need to sign off on how we store the details. {You know}, if that sign-off slips, the pilot moves. I’ll say more about that in the risks.",
  "We’re also saying no to a few things. The new onboarding flow moves to Q2, we’re not doing crypto payouts, and we’re not adding a second card scheme. That keeps the team on the three bets.",
  "The team today is seven people across product and engineering. To deliver all three bets, we need two hires: a payments engineer and a risk analyst. {Um}, the engineer unblocks refunds and one-tap, and the analyst owns the fraud rules once they’re live. If we approve them this week, both can start in January.",
  "The risks. The biggest one is fraud losses going up while the new rules bed in. We’re capping that with a limit on instant refunds and a daily review for the first month. The second risk is the card scheme sign-off for one-tap, which could slip. And third, {uh}, hiring could take longer than we’d like, in which case one-tap moves to Q2 and the other two bets still land.",
  "On timing. January is the build for instant refunds and the first fraud rules. In February, refunds go live and the rules reach ten percent of traffic. March is the full fraud roll-out and the one-tap pilot. So everything lands by the end of March.",
  "So, {um}, that’s really it. We’d like you to approve the roadmap. Thanks.",
];

/** Script for a slide (demo deck), used by the demo runs and by mock transcription in tests. */
export function demoScript(n: number): string | undefined {
  return SCRIPTS[n - 1];
}

/** Words for a run: each slide's script spoken while that slide was showing (first visit only). */
export function speakRun(marks: Mark[], totalSec: number, scriptFor: (n: number) => string | undefined): Word[] {
  const seen = new Set<number>();
  return marks.flatMap((m, i) => {
    if (seen.has(m.n)) return [];
    seen.add(m.n);
    const until = i + 1 < marks.length ? marks[i + 1].at : totalSec;
    const text = scriptFor(m.n);
    return text ? speakBetween(text, m.at, until) : [];
  });
}

function marksFor(durations: number[]): { marks: Mark[]; total: number } {
  let t = 0;
  const marks = durations.map((d, i) => {
    const m = { n: i + 1, at: t };
    t += d;
    return m;
  });
  return { marks, total: t };
}

const VERDICT = { y: "yes", p: "partly", n: "no" } as const;

interface DemoRunSpec {
  id: string;
  number: number;
  dayOffset: number;
  at: string;
  durations: number[];
  verdicts: string;
  parts: { opening: number; message: number; structure: number; audience: number };
}

const RUN_SPECS: DemoRunSpec[] = [
  { id: "demo-run-1", number: 1, dayOffset: -3, at: "18:30", durations: [40, 90, 55, 190, 80, 75, 65, 35, 60, 45, 40, 10], verdicts: "yppp yyny pp yp", parts: { opening: 3, message: 3, structure: 3, audience: 4 } },
  { id: "demo-run-2", number: 2, dayOffset: -2, at: "12:10", durations: [35, 80, 50, 175, 75, 70, 60, 30, 55, 50, 40, 10], verdicts: "yypp yyny yp yp", parts: { opening: 4, message: 3, structure: 4, audience: 4 } },
  { id: "demo-run-3", number: 3, dayOffset: -1, at: "12:40", durations: [32, 75, 40, 160, 70, 65, 50, 25, 50, 55, 48, 10], verdicts: "yyyp yyny yy yp", parts: { opening: 4, message: 3, structure: 4, audience: 4 } },
];

const QUOTES: Record<number, string> = {
  1: "This is the plan for payments in Q1",
  2: "payment completion went from 41% to 58%.",
  3: "They leave when a payment goes wrong,",
  4: "Refunds fix what happens when it goes wrong.",
  5: "this would have settled 92% of disputes before they were raised.",
  6: "in testing they brought false declines down to 1.4%,",
  8: "We’re also saying no to a few things.",
  9: "we need two hires: a payments engineer and a risk analyst.",
  10: "The biggest one is fraud losses going up while the new rules bed in.",
  11: "So everything lands by the end of March.",
  12: "We’d like you to approve the roadmap.",
};

function demoModel(spec: DemoRunSpec): RunModelResult {
  const verdicts: Verdict[] = spec.verdicts
    .replace(/\s/g, "")
    .split("")
    .map((c) => VERDICT[c as keyof typeof VERDICT]);
  return {
    opening: { score: spec.parts.opening, evidence: "I’ll be asking for a decision at the end: approval for the roadmap and for two new hires." },
    message: { score: spec.parts.message, evidence: "We’d like you to approve the roadmap." },
    structure: { score: spec.parts.structure, evidence: "Refunds fix what happens when it goes wrong." },
    audience: { score: spec.parts.audience, evidence: "which is a lot of customers we’re turning away." },
    slides: verdicts.map((c, i) => ({ n: i + 1, covered: c, quote: c === "no" ? null : (QUOTES[i + 1] ?? null) })),
    fixFor: "cut",
    fixBody: "Say slide 4 in three sentences, one per bet. The story of how you chose them can wait for a question. Then give the ask its full minute, with both hires in it.",
    cuts: [
      { n: 4, text: "Drop the eleven ideas and the workshops. Keep one sentence per bet." },
      { n: 2, text: "Stop after the 41% to 58% and the drop in support calls." },
      { n: 5, text: "Leave the cost detail for questions." },
    ],
    openingRewrite:
      "Good morning. In Q1 we want every payment to work first time, and today I’m asking you to approve the roadmap and two new hires to deliver it. Six weeks ago we took payment completion from 41% to 58%. Here’s how we build on that.",
  };
}

export const demoRuns: Run[] = RUN_SPECS.map((spec) => {
  const { marks, total } = marksFor(spec.durations);
  const words = speakRun(marks, total, demoScript);
  const startedAt = londonIso(day(spec.dayOffset), spec.at);
  return assembleRun({
    id: spec.id,
    presentation: demoPresentation,
    number: spec.number,
    mode: "full",
    from: 1,
    to: 12,
    startedAt,
    finishedAt: new Date(Date.parse(startedAt) + total * 1000 + 20_000).toISOString(),
    totalSec: total,
    marks,
    words,
    model: demoModel(spec),
    hasAudio: false,
  });
});

// ---------------------------------------------------------------------------
// One Q&A round: Dana, finance director, sceptical (design screen 14).
// ---------------------------------------------------------------------------

export interface DemoQa {
  question: string;
  slide: number;
  pressIf: string;
  script: string;
  result: ScoreResult;
  press?: { question: string; kind: "challenge" | "clarify"; script: string; content: number; structure: number; tripped: string | null; note: { tone: "fix" | "strength"; title: string; body: string; quote: string } };
}

const sr = (r: Omit<ScoreResult, "content" | "structure"> & { content: number; structure: number; evidence: [string, string] }): ScoreResult => ({
  content: { score: r.content, evidence: [r.evidence[0]] },
  structure: { score: r.structure, evidence: [r.evidence[1]] },
  pointSentence: r.pointSentence,
  fillerPhrases: r.fillerPhrases,
  strength: r.strength,
  oneFix: r.oneFix,
  notes: r.notes,
  strongerVersion: r.strongerVersion,
});

const QA: DemoQa[] = [
  {
    question: "You’re asking for two hires. What happens to the plan if we only approve one?",
    slide: 9,
    pressIf: "the answer doesn’t say which bet slips",
    script:
      "Then one-tap moves to Q2. The engineer is the one I’d keep, because refunds and one-tap both need them, and the fraud rules can run for a quarter with the team we have. So with one hire, we’d still land refunds and fraud rules by March, and the pilot would start in April.",
    result: sr({
      content: 4,
      structure: 5,
      evidence: ["The engineer is the one I’d keep,", "Then one-tap moves to Q2."],
      pointSentence: "Then one-tap moves to Q2.",
      fillerPhrases: [],
      strength: "The answer comes first, then the reason, then what still lands.",
      oneFix: "Link back to the ask: one hire still means a yes today.",
      notes: [
        { tone: "strength", title: "Answer first", body: "You said what slips in the first five words. That’s exactly what a finance director wants.", quote: "Then one-tap moves to Q2." },
        { tone: "fix", title: "Link back to your ask", body: "End by asking for the decision: approve the roadmap, and the engineer at least.", quote: "the pilot would start in April." },
      ],
      strongerVersion:
        "Then one-tap moves to Q2. I’d keep the engineer, because refunds and one-tap both need them, and the fraud rules can run with the team we have. So with one hire, refunds and fraud rules still land by March, and the pilot starts in April. If two is a stretch, approving the engineer today keeps the plan on track.",
    }),
  },
  {
    question: "Instant refunds sound expensive. What happens to fraud losses if we refund before we’ve checked?",
    slide: 5,
    pressIf: "the answer doesn’t give a number or a limit",
    script:
      "{Um}, so, that’s a really good question. We’ve worked closely with the risk team on this, and, {you know}, they’re comfortable with the approach. Most refunds are small, and the customers asking for them are mostly people we already know, so we don’t expect it to be a big problem. And we’ll be watching it closely when it goes live.",
    result: sr({
      content: 2,
      structure: 2,
      evidence: ["we don’t expect it to be a big problem.", "that’s a really good question."],
      pointSentence: "so we don’t expect it to be a big problem.",
      fillerPhrases: ["you know"],
      strength: "You named who signed it off: the risk team.",
      oneFix: "Lead with the limit and the cost, in numbers.",
      notes: [
        { tone: "fix", title: "Give the number first", body: "Dana asked what happens to losses. “Not a big problem” isn’t an answer a finance director can use.", quote: "so we don’t expect it to be a big problem." },
        { tone: "fix", title: "Skip the warm-up", body: "“That’s a really good question” spends your first seconds. Start with the answer.", quote: "that’s a really good question." },
      ],
      strongerVersion:
        "Losses stay small, because large refunds are still checked first. The risk team has agreed the approach with us, and most refunds come from customers we already know. We’ll review the numbers daily when it goes live, and that’s why it’s safe to approve the refunds bet now.",
    }),
    press: {
      kind: "challenge",
      question: "You said “we don’t expect it to be a big problem”. What’s the limit, in pounds, before a refund gets checked?",
      script: "Refunds over £50 still get checked first, and that covers about 80% of the value. {Um}, the rest we’d expect to cost under £4,000 a month, and we review it daily for the first month.",
      content: 4,
      structure: 5,
      tripped: null,
      note: { tone: "strength", title: "That’s the answer", body: "A limit, a share and a monthly cost, in the first sentence. Lead with this next time, before Dana has to ask.", quote: "Refunds over £50 still get checked first," },
    },
  },
  {
    question: "Completion jumped from 41 to 58%. How much of that was your fix, and how much was the time of year?",
    slide: 2,
    pressIf: "the answer doesn’t separate the fix from other causes",
    script:
      "Most of it was the fix. We compared the same six weeks with last year, and the time of year explained about three points. The rest came after the change to the first payment step, and the jump happened in the week it shipped, not gradually.",
    result: sr({
      content: 4,
      structure: 5,
      evidence: ["the time of year explained about three points.", "Most of it was the fix."],
      pointSentence: "Most of it was the fix.",
      fillerPhrases: [],
      strength: "A direct answer, backed by a comparison with last year.",
      oneFix: "Say the size of the fix’s effect as a number: about fourteen points.",
      notes: [
        { tone: "strength", title: "Evidence, not opinion", body: "Comparing with last year answers the doubt directly.", quote: "We compared the same six weeks with last year," },
      ],
      strongerVersion:
        "Most of it was the fix. We compared the same six weeks with last year, and the time of year explained about three points. The rest came in the week the change to the first payment step shipped, not gradually.",
    }),
  },
  {
    question: "If the fraud rules slip to Q2, what does that cost us?",
    slide: 10,
    pressIf: "no cost or date is given",
    script:
      "It would cost us the false declines for another quarter. Right now that’s about 3.1% of good payments being turned away. {Um}, I haven’t worked out the exact revenue figure, but I can send it to you this afternoon. The refunds bet doesn’t depend on it, so that would still go live in February.",
    result: sr({
      content: 3,
      structure: 4,
      evidence: ["about 3.1% of good payments being turned away.", "It would cost us the false declines for another quarter."],
      pointSentence: "It would cost us the false declines for another quarter.",
      fillerPhrases: [],
      strength: "Honest about what you don’t know, with a promise to follow up.",
      oneFix: "Work out the revenue figure before the meeting. Dana will ask.",
      notes: [
        { tone: "strength", title: "Honest and specific", body: "Saying you’ll send the figure is better than guessing it.", quote: "but I can send it to you this afternoon." },
        { tone: "fix", title: "Know this number", body: "A slipped quarter in money is the first thing finance will ask. Have it ready.", quote: "I haven’t worked out the exact revenue figure," },
      ],
      strongerVersion:
        "Another quarter of false declines: about 3.1% of good payments turned away. I’ll send you the revenue figure this afternoon. Refunds don’t depend on the fraud rules, so they still go live in February.",
    }),
  },
];

/** Demo Q&A answers, used by mock transcription and mock scoring in tests (question k, 0-based). */
export function demoQaTurn(k: number, turn: number): { script: string; result: ScoreResult | null; press: DemoQa["press"] | null } {
  const q = QA[k % QA.length];
  if (turn === 0) return { script: q.script, result: q.result, press: q.press ?? null };
  const press = q.press ?? QA[1].press!;
  return { script: press.script, result: null, press };
}

function demoQaAnswers(start: number): Answer[] {
  return QA.map((q, k) => {
    const words = speakBetween(q.script, 0, q.script.split(/\s+/).length / 2.5 + 2);
    const followUps: FollowUp[] = q.press
      ? [
          buildFollowUp(
            { kind: q.press.kind, asked: q.press.question, words: speakBetween(q.press.script, 0, q.press.script.split(/\s+/).length / 2.5 + 2) },
            { content: q.press.content, structure: q.press.structure, tripped: q.press.tripped, fillerPhrases: [], note: q.press.note },
          ),
        ]
      : [];
    return {
      ...buildAnswer({
        id: `demo-qa-${k + 1}`,
        interviewId: DEMO_PRESENTATION_ID,
        questionId: `qa-${k + 1}`,
        questionNumber: k + 1,
        questionsInMock: QA.length,
        words,
        result: q.result,
        profile: profileFor("presentation-qa"),
        followUps,
      }),
      createdAt: new Date(start + k * 120_000).toISOString(),
    };
  });
}

const qaStart = londonIso(day(-1), "13:05");
const qaAnswers = demoQaAnswers(Date.parse(qaStart));

export const demoQaSession: QaSession = {
  id: "demo-qa",
  presentationId: DEMO_PRESENTATION_ID,
  style: "sceptical",
  persona: { name: "Dana", title: "finance director" },
  startedAt: qaStart,
  finishedAt: londonIso(day(-1), "13:14"),
  questions: QA.map((q) => ({ text: q.question, slide: q.slide, pressIf: q.pressIf })),
  answers: qaAnswers,
  overall: qaOverall(qaAnswers),
};
