import { describe, expect, it } from "vitest";
import { computeDelivery, deliveryScore, isFiller, MIN_SPEECH } from "./delivery";
import { overallScore, readinessFor, scoreLabel } from "./combine";
import { PROFILES } from "./profiles";
import { roadmapAnswer } from "@/lib/mock-data";
import type { Word } from "@/lib/types";

/** Builds evenly spaced words: each word 0.3 s long with a 0.1 s gap. */
function speak(text: string, startAt = 0, wordSec = 0.3, gapSec = 0.1): Word[] {
  return text.split(" ").map((t, i) => {
    const start = startAt + i * (wordSec + gapSec);
    return { text: t, start, end: start + wordSec };
  });
}

describe("isFiller", () => {
  it("always counts um and uh", () => {
    expect(isFiller({ text: "um,", start: 0, end: 0.2 })).toBe(true);
    expect(isFiller({ text: "Uh", start: 0, end: 0.2 })).toBe(true);
  });
  it("only counts 'like' when the model marks it", () => {
    expect(isFiller({ text: "like", start: 0, end: 0.2 })).toBe(false);
    expect(isFiller({ text: "like", start: 0, end: 0.2, filler: true })).toBe(true);
  });
});

describe("computeDelivery", () => {
  const target: [number, number] = [90, 120];

  it("returns empty measures for no speech", () => {
    const m = computeDelivery([], { targetSec: target });
    expect(m.lengthSec).toBe(0);
    expect(m.wordsPerMinute).toBeNull();
    expect(m.pointFirst).toBeNull();
  });

  it("does not show pace for very short answers", () => {
    const m = computeDelivery(speak("Yes I can start in January"), { targetSec: target });
    expect(m.lengthSec).toBeLessThan(MIN_SPEECH.paceSec);
    expect(m.wordsPerMinute).toBeNull();
  });

  it("measures pace, excluding fillers", () => {
    // 150 words at 0.4 s each = about 60 s of steady speech.
    const words = speak(Array.from({ length: 150 }, (_, i) => (i % 25 === 0 ? "um" : "word")).join(" "));
    const m = computeDelivery(words, { targetSec: target });
    expect(m.fillerCount).toBe(6);
    expect(m.wordsPerMinute).toBe(144);
    expect(m.pauses).toHaveLength(0);
  });

  it("shows the filler count but not a rate under two minutes", () => {
    const m = computeDelivery(speak("so um I think uh we should"), { targetSec: target });
    expect(m.fillerCount).toBe(2);
    expect(m.fillersPerMinute).toBeNull();
  });

  it("finds pauses and long pauses", () => {
    const words = [...speak("first part of the answer"), ...speak("after a long pause", 6)];
    const m = computeDelivery(words, { targetSec: target });
    expect(m.pauses).toHaveLength(1);
    expect(m.longPauses).toHaveLength(1);
    expect(m.pauses[0].beforeWord).toBe(5);
  });

  it("flags a late point and the length status", () => {
    const words = speak(Array.from({ length: 300 }, () => "word").join(" ")); // 120 s
    const late = computeDelivery(words, { targetSec: [90, 110], pointWordIndex: 130, pointWithinSec: 10 });
    expect(late.pointArrivesAt).toBe(52);
    expect(late.pointFirst).toBe(false);
    expect(late.lengthStatus).toBe("over");
    const early = computeDelivery(words, { targetSec: target, pointWordIndex: 0 });
    expect(early.pointFirst).toBe(true);
    expect(early.lengthStatus).toBe("in");
  });
});

describe("the demo answer", () => {
  const p = PROFILES.competency;
  const m = computeDelivery(roadmapAnswer.words, { targetSec: p.targetSec, pointWordIndex: roadmapAnswer.pointWordIndex, pointWithinSec: p.pointWithinSec });

  it("matches the designs: 1:48 long, 4 fillers, point at 0:52", () => {
    expect(m.lengthSec).toBeCloseTo(108, 0);
    expect(m.fillerCount).toBe(4);
    expect(m.pointArrivesAt).toBe(52);
    expect(m.pointFirst).toBe(false);
    expect(m.lengthStatus).toBe("in");
    expect(m.wordsPerMinute).toBeGreaterThan(120);
    expect(m.wordsPerMinute).toBeLessThan(160);
  });

  it("scores delivery 4 and 3.7 overall", () => {
    const d = deliveryScore(m, p);
    expect(d).toBe(4);
    expect(overallScore({ ...roadmapAnswer.scores, delivery: d }, p.weights)).toBe(3.7);
  });
});

describe("overallScore", () => {
  it("weights the parts by profile", () => {
    expect(overallScore({ content: 4, structure: 3, delivery: 4 }, PROFILES.competency.weights)).toBe(3.7);
  });
  it("removes parts that don't apply instead of scoring them low", () => {
    expect(overallScore({ content: 4, structure: 4, delivery: null }, PROFILES.competency.weights)).toBe(4);
    // "Questions for us" doesn't score delivery at all.
    expect(overallScore({ content: 5, structure: 3, delivery: 1 }, PROFILES["questions-for-us"].weights)).toBe(4.6);
  });
});

describe("labels", () => {
  it("maps scores to the spec's labels", () => {
    expect(scoreLabel(3.7)).toBe("Effective");
    expect(scoreLabel(2.1)).toBe("Emerging");
    expect(readinessFor(4.4)).toBe("ready");
    expect(readinessFor(3.2)).toBe("getting-there");
    expect(readinessFor(2.4)).toBe("not-ready");
  });
});
