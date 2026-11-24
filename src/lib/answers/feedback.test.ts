import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Answer, Word } from "@/lib/types";
import { answerFeedback } from "./feedback";

const words = (text: string): Word[] => text.split(" ").map((t, i) => ({ text: t, start: i * 0.4, end: i * 0.4 + 0.3 }));
const answer = (over: Partial<Answer> = {}): Answer => ({
  id: "ans-1",
  interviewId: "iv-1",
  questionId: "q-1",
  questionNumber: 1,
  questionsInMock: 4,
  words: words("We were losing clients to late payroll runs. I rebuilt the checks in SQL and cut errors by a third."),
  pointWordIndex: 8,
  highlights: [{ kind: "good", from: 8, to: 13 }],
  notes: [
    { id: 1, tone: "strength", title: "A real number", body: "“Cut errors by a third” is specific.", pinAfter: 18 },
    { id: 2, tone: "fix", title: "Your part came late", body: "Open with what you did.", pinAfter: 7 },
  ],
  scores: { content: 4, structure: 3, delivery: null },
  strength: "You gave a measured result.",
  oneFix: "Lead with your own action.",
  strongerVersion: [
    { start: 0, text: "I rebuilt our payroll checks in SQL." },
    { start: 4, text: "Errors fell by a third.", highlight: true },
  ],
  strongerLengthSec: 9,
  followUps: [],
  ...over,
});

describe("what the feedback screen says about an answer", () => {
  it("is the answer's own words, strengths, fixes and stronger version", () => {
    const f = answerFeedback(answer());
    expect(f.transcript).toBe("We were losing clients to late payroll runs. I rebuilt the checks in SQL and cut errors by a third.");
    expect(f.strengths).toEqual([{ body: "You gave a measured result." }, { title: "A real number", body: "“Cut errors by a third” is specific." }]);
    expect(f.fixes).toEqual([{ body: "Lead with your own action." }, { title: "Your part came late", body: "Open with what you did." }]);
    expect(f.stronger).toBe("I rebuilt our payroll checks in SQL. Errors fell by a third.");
  });

  it("marks the extract exactly where the answer was marked", () => {
    const f = answerFeedback(answer());
    expect(f.extract).toEqual([
      { text: "We were losing clients to late payroll runs.", kind: null },
      { text: "I rebuilt the checks in SQL", kind: "good" },
      { text: "and cut errors by a third.", kind: null },
    ]);
    expect(f.extractCut).toBe(false);
    const short = answerFeedback(answer(), 10);
    expect(short.extract.map((r) => r.text).join(" ")).toBe("We were losing clients to late payroll runs. I rebuilt");
    expect(short.extractCut).toBe(true);
  });

  it("is empty where the answer holds nothing: no stand-in is ever supplied", () => {
    const f = answerFeedback(answer({ words: [], highlights: [], notes: [], strength: "", oneFix: "  ", strongerVersion: [] }));
    expect(f).toEqual({ transcript: "", corrected: false, extract: [], extractCut: false, strengths: [], fixes: [], stronger: "" });
    // An older answer saved without some fields is read the same way.
    const old = answerFeedback({ ...answer(), notes: undefined, highlights: undefined, strongerVersion: undefined, strength: undefined, oneFix: undefined } as unknown as Answer);
    expect(old.strengths).toEqual([]);
    expect(old.fixes).toEqual([]);
    expect(old.stronger).toBe("");
    expect(old.extract).toEqual([{ text: old.transcript, kind: null }]);
  });

  it("shows the person's correction in place of what was heard, without the marks made on the original words", () => {
    const f = answerFeedback(answer({ correctedText: "We were losing clients to late payroll runs. I rebuilt the checks in SQL and cut errors by 31%." }));
    expect(f.corrected).toBe(true);
    expect(f.transcript).toBe("We were losing clients to late payroll runs. I rebuilt the checks in SQL and cut errors by 31%.");
    expect(f.extract).toEqual([{ text: f.transcript, kind: null }]);
    // The strengths, fixes and stronger version are still those written for the answer as it was heard.
    expect(f.strengths[0]).toEqual({ body: "You gave a measured result." });
    expect(answerFeedback(answer({ correctedText: "   " })).corrected).toBe(false);
    expect(answerFeedback(answer({ correctedText: "one two three four five six" }), 3)).toMatchObject({ extract: [{ text: "one two three", kind: null }], extractCut: true });
  });

  it("doesn't list the same point twice when a note repeats the lead line", () => {
    const f = answerFeedback(answer({ strength: "A real number", notes: [{ id: 1, tone: "strength", title: "A real number", body: "", pinAfter: 3 }, { id: 2, tone: "strength", title: "", body: "a real  NUMBER", pinAfter: 4 }] }));
    expect(f.strengths).toEqual([{ body: "A real number" }]);
  });
});

describe("the feedback screen itself", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../components/feedback/QuestionFeedbackView.tsx"), "utf8");

  it("holds none of the stock feedback an earlier build showed for every answer", () => {
    for (const stock of [
      "I explained a new digital process",
      "walked them through how it worked",
      "digital triage",
      "Rubric Match",
      "72%",
      "3 / 4 parts",
      "Communicating & Influencing",
      "Working Together & Collaboration",
      "Delivering at Pace",
      "public value",
      "composed delivery",
      "walk stakeholders through a process",
      "specify what the process was",
      "Provide concrete metrics",
      "Senior Role",
    ]) {
      expect(source.includes(stock), stock).toBe(false);
    }
  });

  it("never plays a computer voice in place of a recording, and never reports a failed save as saved", () => {
    expect(source).not.toMatch(/speechSynthesis|SpeechSynthesisUtterance/);
    expect(source).not.toMatch(/saved locally|Response saved!/i);
    expect(source).not.toMatch(/return 124|\?\? 3\.5|\|\| 124/);
  });
});
