import { describe, expect, it } from "vitest";
import { buildAnswer, findQuote, markFillers, timeStronger } from "./build-answer";
import { parseDeepgramWords } from "@/lib/ai/providers/deepgram";
import { extractJson } from "@/lib/ai/providers/claude";
import { PROFILES } from "@/lib/scoring/profiles";
import type { ScoreResult } from "@/lib/ai/score-answer";
import type { Word } from "@/lib/types";

/** A Deepgram-shaped response for "So um I like the team you know and I proposed a pause." */
const deepgramJson = {
  results: {
    channels: [
      {
        alternatives: [
          {
            words: [
              ["so", "So", 0.1],
              ["um", "um", 0.5],
              ["i", "I", 1.0],
              ["like", "like", 1.3],
              ["the", "the", 1.6],
              ["team", "team,", 1.8],
              ["you", "you", 2.3],
              ["know", "know,", 2.5],
              ["and", "and", 13.0],
              ["i", "I", 13.3],
              ["proposed", "proposed", 13.5],
              ["a", "a", 14.0],
              ["pause", "pause.", 14.2],
            ].map(([word, punctuated_word, start]) => ({ word, punctuated_word, start, end: (start as number) + 0.25, confidence: 0.98 })),
          },
        ],
      },
    ],
  },
};

describe("parseDeepgramWords", () => {
  it("keeps punctuation and timings", () => {
    const words = parseDeepgramWords(deepgramJson);
    expect(words).toHaveLength(13);
    expect(words[5]).toEqual({ text: "team,", start: 1.8, end: 2.05 });
  });
  it("copes with an empty or odd response", () => {
    expect(parseDeepgramWords({})).toEqual([]);
    expect(parseDeepgramWords(null)).toEqual([]);
  });
});

describe("markFillers", () => {
  const words = parseDeepgramWords(deepgramJson);
  it("merges a filler phrase into one word and leaves real uses of 'like' alone unless listed", () => {
    const out = markFillers(words, ["you know"]);
    expect(out).toHaveLength(12);
    expect(out[6]).toMatchObject({ text: "you know,", filler: true, start: 2.3 });
    expect(out[3].filler).toBeUndefined(); // "I like the team" is not a filler
  });
});

describe("findQuote", () => {
  const words = markFillers(parseDeepgramWords(deepgramJson), ["you know"]);
  it("finds a quote across punctuation and merged fillers", () => {
    expect(findQuote(words, "I proposed a pause.")).toEqual([8, 11]);
    expect(findQuote(words, "the team, you know")).toEqual([4, 6]);
    expect(findQuote(words, "something never said")).toBeNull();
  });
});

describe("timeStronger", () => {
  it("puts the first sentence on its own and times the rest at the speaker's pace", () => {
    const t = timeStronger("I paused the roadmap. Support flagged drop-offs. I moved two engineers. Completion rose.", 120);
    expect(t.paragraphs[0]).toEqual({ start: 0, text: "I paused the roadmap.", highlight: true });
    expect(t.paragraphs).toHaveLength(3);
    expect(t.paragraphs[1].start).toBe(2);
  });
});

describe("extractJson", () => {
  it("reads JSON inside a code fence or with words around it", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('Here you go: {"a":{"b":2}} Thanks')).toEqual({ a: { b: 2 } });
    expect(() => extractJson("no json here")).toThrow();
  });
});

describe("buildAnswer", () => {
  const words: Word[] = parseDeepgramWords(deepgramJson);
  const result: ScoreResult = {
    content: { score: 3, evidence: ["I proposed a pause."] },
    structure: { score: 2, evidence: ["So um I like the team,"] },
    pointSentence: "I proposed a pause.",
    fillerPhrases: ["you know"],
    strength: "Clear decision.",
    oneFix: "Lead with the decision.",
    notes: [
      { tone: "fix", title: "Lead with the decision", body: "It arrives at 0:13.", quote: "I proposed a pause." },
      { tone: "strength", title: "Clear ask", body: "Short and direct.", quote: "proposed a pause" },
    ],
    strongerVersion: "I proposed a pause. I like the team.",
  };

  it("marks the late point, pins the notes and keeps delivery for code", () => {
    const a = buildAnswer({ id: "x", interviewId: "halden", questionId: "c1", questionNumber: 1, questionsInMock: 1, words, result, profile: { ...PROFILES.competency, pointWithinSec: 10 } });
    expect(a.words.filter((w) => w.filler)).toHaveLength(1); // "you know"; "um" is counted by code
    expect(a.pointWordIndex).toBe(8);
    expect(a.notes[0].pinAfter).toBe(11);
    expect(a.scores).toEqual({ content: 3, structure: 2, delivery: null });
    expect(a.strongerVersion[0].highlight).toBe(true);
  });
});
