import { describe, expect, it } from "vitest";
import { buildPlanPrompt, checkPlan, PlanReplySchema } from "./plan-slides";
import { buildRunPrompt, checkRunReply, toRunModel, type RunReply, type RunScoreInput } from "./score-run";
import { buildQuestionsPrompt, checkPress, checkQuestions, cutInQuestion, pressesRemaining, rulePress, ruleQuestions } from "./qa";
import { demoPresentation, demoRuns } from "@/lib/pitch/demo";
import type { Word } from "@/lib/types";

const run = demoRuns[2];
const input: RunScoreInput = {
  presentation: demoPresentation,
  mode: "full",
  slides: run.slides.map((s) => {
    const slide = demoPresentation.slides[s.n - 1];
    return { n: s.n, title: slide.title, lines: slide.lines, point: slide.point, planned: slide.plannedSec, seconds: s.seconds, words: s.words };
  }),
  totalSec: run.totalSec,
  focus: run.focus,
  cutSlides: [4],
};

const goodReply: RunReply = {
  opening: { score: 4, evidence: "This is the plan for payments in Q1" },
  message: { score: 3, evidence: "We’d like you to approve the roadmap." },
  structure: { score: 4, evidence: null },
  audience: { score: 4, evidence: null },
  slides: input.slides.map((s) => ({ n: s.n, covered: s.n === 7 ? "no" : "yes", quote: null })),
  fix: "Say slide 4 in three sentences, one per bet.",
  cuts: [{ n: 4, cut: "Drop the story of the workshops." }],
  openingRewrite: "Good morning. Six weeks ago we took payment completion from 41% to 58%.",
};

describe("run scoring prompt", () => {
  it("gives the model each slide's words, plan and point, and the focus code chose", () => {
    const { user, system } = buildRunPrompt(input);
    expect(system).toMatch(/Never judge accent/);
    expect(user).toContain('<slide n="4" planned="1:00" actual="2:40">');
    expect(user).toContain("Point to land: Three bets for Q1, one sentence each.");
    expect(user).toMatch(/the slide ran long.*slide 4, 1:40 over plan/);
    expect(user).toContain("say what to cut on slides 4");
  });

  it("accepts a reply with real quotes and turns it into the run builder's shape", () => {
    expect(checkRunReply(goodReply, input)).toEqual([]);
    const m = toRunModel(goodReply, run.focus);
    expect(m.fixFor).toBe("cut");
    expect(m.slides.find((s) => s.n === 7)?.covered).toBe("no");
  });

  it("rejects invented quotes, missing slides and new numbers in the opening", () => {
    const bad: RunReply = {
      ...goodReply,
      opening: { score: 4, evidence: "We will triple revenue" },
      slides: goodReply.slides.slice(0, 10),
      openingRewrite: "Completion went from 41% to 75%.",
    };
    const problems = checkRunReply(bad, input).join(" | ");
    expect(problems).toMatch(/opening.evidence is not in the transcript/);
    expect(problems).toMatch(/Give a verdict for slides 11, 12/);
    expect(problems).toMatch(/adds a number the speaker never said: 75/);
  });
});

describe("planning prompt", () => {
  const slides = demoPresentation.slides.map((s) => ({ title: s.title, lines: s.lines }));
  const planInput = { title: "Q1 roadmap", audience: "leadership" as const, ask: demoPresentation.ask, limitSec: 600, slides };

  it("lists the slides and the ask", () => {
    const { user } = buildPlanPrompt(planInput);
    expect(user).toContain("4. Three bets for Q1 | Instant refunds | Smarter fraud rules | One-tap repeat payments");
    expect(user).toContain("What the speaker wants them to do: Approve the Q1 roadmap and two new hires");
  });

  it("checks one entry per slide and no invented numbers", () => {
    const reply = PlanReplySchema.parse({
      slides: slides.map((s, i) => ({ n: i + 1, weight: 1, point: i === 1 ? "Completion rose from 41% to 99%." : s.title })),
      askSlide: 12,
      warning: null,
    });
    expect(checkPlan(reply, planInput)).toEqual(["Slide 2's point uses a number that isn't on the slides: 99"]);
    expect(checkPlan({ ...reply, slides: reply.slides.slice(1) }, planInput)[0]).toMatch(/Expected 12 slides/);
  });
});

const words = (text: string, start = 0): Word[] => text.split(" ").map((t, i) => ({ text: t, start: start + i * 0.4, end: start + i * 0.4 + 0.3 }));

describe("audience questions", () => {
  const qInput = {
    title: "Q1 roadmap",
    audience: "leadership" as const,
    ask: demoPresentation.ask,
    style: "sceptical" as const,
    persona: { name: "Dana", title: "finance director" },
    slides: demoPresentation.slides,
    said: [{ n: 5, words: words("this would have settled 92% of disputes before they were raised.") }],
    count: 2,
  };

  it("are written in the persona's voice from the slides and what was said", () => {
    const { system, user } = buildQuestionsPrompt(qInput);
    expect(system).toMatch(/You are Dana, finance director/);
    expect(system).toMatch(/push on cost, risk and evidence/);
    expect(user).toContain("[slide 5]");
  });

  it("must quote only what was said, end with a question mark, and match the count", () => {
    const ok = { questions: [{ text: "You said “settled 92% of disputes”. Over what period?", slide: 5, pressIf: "no period is given" }, { text: "What does it cost?", slide: null, pressIf: "no number" }] };
    expect(checkQuestions(ok, qInput)).toEqual([]);
    const bad = { questions: [{ text: "You said “settled every dispute”. How", slide: 40, pressIf: "x".repeat(10) }] };
    const problems = checkQuestions(bad, qInput).join(" | ");
    expect(problems).toMatch(/exactly 2 questions/);
    expect(problems).toMatch(/question mark/);
    expect(problems).toMatch(/slide 40/);
    expect(problems).toMatch(/never said/);
  });

  it("fall back to rule questions for each style", () => {
    for (const style of ["curious", "sceptical", "time-pressed", "technical"] as const) {
      const qs = ruleQuestions({ slides: demoPresentation.slides, ask: demoPresentation.ask, style, count: 4 });
      expect(qs).toHaveLength(4);
      expect(qs.every((q) => q.text.endsWith("?"))).toBe(true);
    }
  });
});

describe("asking again", () => {
  const q = { text: "What happens to fraud losses?", slide: 5, pressIf: "the answer doesn’t give a number or a limit" };
  const base = { persona: { name: "Dana", title: "finance director" }, style: "sceptical" as const, audience: "leadership" as const, question: q };

  it("presses once when a number was wanted and none came", () => {
    const dodge = [{ asked: q.text, kind: "main" as const, words: words("we have worked closely with the risk team and they are comfortable with it") }];
    expect(rulePress({ ...base, turns: dodge })?.kind).toBe("challenge");
    const answered = [{ asked: q.text, kind: "main" as const, words: words("refunds over 50 pounds are still checked first so losses stay small") }];
    expect(rulePress({ ...base, turns: answered })).toBeNull();
    const pressedOnce = [...dodge, { asked: "What’s the number?", kind: "challenge" as const, words: words("about four thousand a month at most") }];
    expect(pressesRemaining(pressedOnce)).toBe(0);
  });

  it("checks a press like a follow-up: only real quotes", () => {
    const turns = [{ asked: q.text, kind: "main" as const, words: words("we do not expect it to be a big problem") }];
    expect(checkPress({ action: "press", kind: "challenge", quote: "a big problem", question: "You said “a big problem”. How big, in pounds?" }, turns)).toEqual([]);
    expect(checkPress({ action: "press", kind: "challenge", quote: "huge losses", question: "You said “huge losses”. How huge?" }, turns).length).toBeGreaterThan(0);
    expect(cutInQuestion("Morgan")).toMatch(/short answer\?$/);
  });
});
