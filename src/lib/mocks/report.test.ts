import { describe, expect, it } from "vitest";
import { buildReport, categoryScores, countsLine, mockScore, openingCloseScore, questionList, rowFromAnswer, topFixes, verdictFor, type MockRow } from "./report";
import { demoMock, halden, roadmapAnswer } from "@/lib/mock-data";

const c1 = halden.questions.find((q) => q.id === "c1")!;
const rows: MockRow[] = [...demoMock.rows, rowFromAnswer(roadmapAnswer, c1, 3)].sort((a, b) => a.number - b.number);

describe("rowFromAnswer", () => {
  it("measures the saved answer the same way the feedback screen does", () => {
    const r = rows[2];
    expect(r).toMatchObject({ number: 3, questionId: "c1", group: "competency", overall: 3.7, pointFirst: false, answerId: "a-roadmap" });
    expect(r.we).toBeGreaterThan(r.i);
    expect(r.followUps).toHaveLength(1);
    expect(r.followUps[0]).toMatchObject({ kind: "ownership", structure: 2, tripped: "Back to “we” again" });
  });
});

describe("interview score and verdict", () => {
  it("averages every answer, with follow-ups at half weight", () => {
    expect(mockScore(rows)).toBe(3.5);
    expect(mockScore([])).toBeNull();
  });

  it("scores each category in the interview, and leaves out the ones it didn't have", () => {
    const c = categoryScores(rows);
    expect(c.motivation).toBe(4.4);
    expect(c.technical).toBeLessThan(2.6);
    expect(c.cv).toBe(4);
    expect(categoryScores([rows[3]])).toEqual({ technical: c.technical });
  });

  it("keeps “Tell me about yourself” and your questions for them out of the categories", () => {
    const opening: MockRow = { ...rows[0], number: 0, questionId: "open", slot: "opening", overall: 2 };
    expect(categoryScores([opening, ...rows]).motivation).toBe(4.4);
    expect(openingCloseScore([opening, ...rows])).toBe(2);
  });

  it("gives a verdict: Ready at 4+ with no category under 3.5, Nearly from 3.2", () => {
    expect(verdictFor(4.2, { motivation: 4.4, technical: 3.6 })).toBe("ready");
    expect(verdictFor(4.2, { motivation: 4.4, technical: 3.1 })).toBe("nearly");
    expect(verdictFor(3.4, {})).toBe("nearly");
    expect(verdictFor(2.9, {})).toBe("not-yet");
    expect(verdictFor(null, {})).toBe("not-yet");
  });
});

describe("top fixes", () => {
  it("finds the patterns that repeat across the mock, most repeated first", () => {
    const fixes = topFixes(rows, 2, "Sam");
    expect(fixes.map((f) => [f.title, f.detail])).toEqual([
      ["Lead with your decision or first step", "Late in questions 3 and 4, and in both follow-ups."],
      ["Say “I”, not “we”, for your part", "The follow-up on question 3 asked for this, and it came back as “we”."],
    ]);
    expect(fixes[0].practiseQuestionId).toBe("c1");
  });

  it("says when the interviewer had to ask for the result", () => {
    const r: MockRow = { ...rows[1], number: 2, followUps: [{ question: "What was the outcome?", kind: "result", lengthSec: 30, overall: 4, structure: 4, tripped: null, we: 0, i: 2 }] };
    expect(topFixes([r], 3, "Sam").map((f) => f.detail)).toContain("Sam had to ask for the result in question 2.");
  });

  it("says “every question” instead of listing them all", () => {
    const all = [1, 2, 3].map((n) => ({ ...rows[2], number: n, followUps: [] }));
    expect(topFixes(all, 2, "Sam")[0].detail).toBe("Late in every question.");
  });

  it("returns nothing when there's no pattern", () => {
    const clean: MockRow = { ...rows[1], lengthStatus: "in", followUps: [] };
    expect(topFixes([clean])).toEqual([]);
  });
});

describe("buildReport", () => {
  it("puts the report together", () => {
    const report = buildReport(rows, "Sam");
    expect(report).toMatchObject({ score: 3.5, verdict: "nearly", questionCount: 6, followUpCount: 2 });
    expect(report.fixes.length).toBeLessThanOrEqual(3);
  });
  it("writes counts and question lists in plain words", () => {
    expect(countsLine(6, 2)).toBe("6 questions and 2 follow-ups");
    expect(countsLine(1, 0)).toBe("1 question, no follow-ups");
    expect(questionList([4, 3])).toBe("questions 3 and 4");
    expect(questionList([1, 3, 6])).toBe("questions 1, 3 and 6");
  });
});
