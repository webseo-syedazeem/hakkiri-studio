import { describe, expect, it } from "vitest";
import { codeWarnings, estimateWeights, findAskSlide, fitToLimit, stepFor } from "./timing";
import {
  chooseFocus,
  coverageScore,
  cutPlan,
  readOutShare,
  runOverall,
  secondsPerSlide,
  slideAt,
  slideFlags,
  talkDelivery,
  timingScore,
  wordsBySlide,
} from "./measure";
import type { Word } from "@/lib/types";

const deck = [
  { title: "Q1 roadmap", lines: ["Product leadership, January review"] },
  { title: "Where we are", lines: ["Payment completion 41% to 58%", "Fewer disputes since October"] },
  { title: "Three bets for Q1", lines: ["Instant refunds", "Smarter fraud rules", "One-tap repeat payments"] },
  { title: "Team and hires", lines: ["Two hires: a payments engineer and a risk analyst"] },
  { title: "The ask", lines: ["Approve the Q1 roadmap and two new hires"] },
];

describe("suggested timing", () => {
  it("adds up to the limit exactly, in 15-second steps", () => {
    const secs = fitToLimit(estimateWeights(deck, 5), 600);
    expect(secs.reduce((a, b) => a + b, 0)).toBe(600);
    expect(secs.every((s) => s % 15 === 0 && s >= 15)).toBe(true);
  });

  it("uses 5-second steps when there are many slides for the time", () => {
    expect(stepFor(20, 300)).toBe(5);
    const secs = fitToLimit(Array(20).fill(1), 300);
    expect(secs.reduce((a, b) => a + b, 0)).toBe(300);
    expect(secs.every((s) => s >= 5)).toBe(true);
  });

  it("gives the title slide little and the ask a proper share", () => {
    const secs = fitToLimit(estimateWeights(deck, 5), 600);
    expect(secs[0]).toBeLessThan(secs[4]);
    expect(secs[4]).toBeGreaterThanOrEqual(120);
  });

  it("finds the slide that makes the ask", () => {
    expect(findAskSlide(deck, "Approve the Q1 roadmap and two new hires")).toBe(5);
    expect(findAskSlide([{ title: "Intro", lines: [] }, { title: "Ideas", lines: ["Some ideas"] }], "")).toBe(2);
  });

  it("warns about a slide with several ideas and a missing ask", () => {
    const planned = deck.map((s) => ({ ...s, plannedSec: 60 }));
    expect(codeWarnings(planned, 600, "Approve it")[0]).toMatch(/^Slide 3 has three ideas on it/);
    const noAsk = deck.slice(0, 4).map((s) => ({ ...s, plannedSec: 60 }));
    expect(codeWarnings(noAsk, 600, "Sign the contract by Friday").join(" ")).toMatch(/None of your slides states the ask/);
  });
});

const w = (text: string, start: number, end = start + 0.4): Word => ({ text, start, end });

describe("slide timing", () => {
  const marks = [
    { n: 1, at: 0 },
    { n: 2, at: 30 },
    { n: 1, at: 50 },
    { n: 2, at: 60 },
  ];

  it("adds up time across visits", () => {
    const s = secondsPerSlide(marks, 100);
    expect(s.get(1)).toBe(40);
    expect(s.get(2)).toBe(60);
  });

  it("splits words by the slide showing", () => {
    expect(slideAt(marks, 55)).toBe(1);
    const by = wordsBySlide([w("a", 1), w("b", 31), w("c", 51), w("d", 70)], marks);
    expect(by.get(1)!.map((x) => x.text)).toEqual(["a", "c"]);
    expect(by.get(2)!.map((x) => x.text)).toEqual(["b", "d"]);
  });

  it("spots a slide read out word for word", () => {
    const slide = { title: "Risks", lines: ["Fraud losses may rise while the new rules bed in over the first month"] };
    const read = "fraud losses may rise while the new rules bed in over the first month".split(" ").map((t, i) => w(t, i));
    const own = "the main risk is that we lose a bit more to fraud for a few weeks".split(" ").map((t, i) => w(t, i));
    expect(readOutShare(slide, read)).toBeGreaterThan(0.9);
    expect(readOutShare(slide, own)).toBeLessThan(0.2);
  });
});

describe("run scores", () => {
  const slides = [
    { n: 1, planned: 30, actual: 32, isAsk: false },
    { n: 2, planned: 60, actual: 75, isAsk: false },
    { n: 4, planned: 60, actual: 160, isAsk: false },
    { n: 12, planned: 60, actual: 10, isAsk: true },
  ];

  it("timing: over the limit, a slide badly over and a rushed ask", () => {
    expect(timingScore("full", slides, 680, 600)).toBe(2);
    expect(timingScore("full", slides.map((s) => ({ ...s, actual: s.planned })), 590, 600)).toBe(5);
    expect(timingScore("opening", slides, 60, 600)).toBeNull();
  });

  it("coverage: share of points made, less one for reading slides out", () => {
    const yes = { covered: "yes" as const, readOut: 0 };
    expect(coverageScore(Array(12).fill(yes))).toBe(5);
    expect(coverageScore([...Array(9).fill(yes), { covered: "no", readOut: 0 }, { covered: "partly", readOut: 0 }, { covered: "partly", readOut: 0 }])).toBe(3);
    expect(coverageScore([...Array(10).fill(yes), { covered: "yes", readOut: 0.8 }, { covered: "yes", readOut: 0.7 }])).toBe(4);
    expect(coverageScore([{ covered: null, readOut: 0 }])).toBeNull();
  });

  it("overall uses the spec's weights and skips parts not scored", () => {
    expect(runOverall({ opening: 4, message: 3, structure: 4, coverage: 3, timing: 2, audience: 4, delivery: 4 })).toBe(3.4);
    expect(runOverall({ opening: 4, message: null, structure: null, coverage: null, timing: null, audience: null, delivery: 2 })).toBe(3.2);
    expect(runOverall({ opening: null, message: null, structure: null, coverage: null, timing: null, audience: null, delivery: null })).toBeNull();
  });

  it("delivery ignores the pause while you change slides", () => {
    const words: Word[] = [];
    for (let t = 0; t < 60; t += 0.4) words.push(w("word", t, t + 0.35));
    for (let t = 70; t < 120; t += 0.4) words.push(w("word", t, t + 0.35));
    const withChange = talkDelivery(words, [{ n: 1, at: 0 }, { n: 2, at: 65 }]);
    const without = talkDelivery(words, [{ n: 1, at: 0 }]);
    expect(withChange.longPauses).toBe(0);
    expect(without.longPauses).toBe(1);
  });
});

describe("report flags and the one fix", () => {
  it("flags the slide to cut, a missed point and a rushed ask", () => {
    expect(slideFlags({ seconds: 160, covered: "yes", readOut: 0 }, 60, false)).toEqual({ chip: "1:40 over, cut here", note: null });
    expect(slideFlags({ seconds: 75, covered: "yes", readOut: 0 }, 60, false)).toEqual({ chip: null, note: "15 sec over" });
    expect(slideFlags({ seconds: 50, covered: "no", readOut: 0 }, 60, false).chip).toBe("Key point missed");
    expect(slideFlags({ seconds: 10, covered: "yes", readOut: 0 }, 60, true).chip).toBe("Ask rushed");
    expect(slideFlags({ seconds: 1, covered: null, readOut: 0 }, 60, false).note).toBe("Skipped");
  });

  it("fixes the biggest cost first: running over, then a missed point, then the ask", () => {
    const base = { mode: "full" as const, limitSec: 600, fillersPerMinute: 1, opening: 4 };
    const over = chooseFocus({
      ...base,
      totalSec: 680,
      slides: [
        { n: 4, seconds: 160, planned: 60, covered: "yes", isAsk: false },
        { n: 7, seconds: 50, planned: 60, covered: "no", isAsk: false },
        { n: 12, seconds: 10, planned: 60, covered: "yes", isAsk: true },
      ],
    });
    expect(over).toEqual({ kind: "cut", slide: 4, overSec: 100 });
    const onTimeMissed = chooseFocus({
      ...base,
      totalSec: 590,
      slides: [
        { n: 7, seconds: 50, planned: 60, covered: "no", isAsk: false },
        { n: 12, seconds: 10, planned: 60, covered: "yes", isAsk: true },
      ],
    });
    expect(onTimeMissed).toEqual({ kind: "missed", slide: 7 });
    expect(chooseFocus({ ...base, totalSec: 590, slides: [{ n: 12, seconds: 10, planned: 60, covered: "yes", isAsk: true }] }).kind).toBe("ask");
    expect(chooseFocus({ ...base, totalSec: 590, slides: [{ n: 2, seconds: 60, planned: 60, covered: "yes", isAsk: false }] }).kind).toBe("keep");
  });

  it("suggests cuts from the slides most over, until the overrun is covered", () => {
    const cuts = cutPlan(
      [
        { n: 2, seconds: 75, planned: 60 },
        { n: 4, seconds: 160, planned: 60 },
        { n: 5, seconds: 70, planned: 60 },
      ],
      80,
    );
    expect(cuts).toEqual([{ n: 4, saveSec: 100 }]);
    expect(cutPlan([{ n: 2, seconds: 61, planned: 60 }], 3)).toEqual([]);
  });
});
