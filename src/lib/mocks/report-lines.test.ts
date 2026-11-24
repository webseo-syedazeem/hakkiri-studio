import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildReport, type MockRow } from "./report";
import { categoryLines, reportHeadline, reportSummary, rowFeedback, takeaways } from "./report-lines";

const row = (over: Partial<MockRow> = {}): MockRow => ({
  number: 1,
  questionId: "q1",
  question: "Tell me about a time you fixed a recurring error.",
  group: "competency",
  lengthSec: 95,
  overall: 3.4,
  pointFirst: true,
  lengthStatus: "in",
  fillerCount: 2,
  we: 1,
  i: 6,
  answerId: "a1",
  followUps: [],
  hasNumber: true,
  wordCount: 210,
  pointSec: 4,
  ...over,
});

describe("the report's category scores", () => {
  it("lists only the categories that have a scored answer", () => {
    const report = buildReport([row({ group: "competency", overall: 3.4 }), row({ number: 2, questionId: "q2", group: "cv", overall: 4.2 })]);
    expect(categoryLines(report)).toEqual([
      { key: "cv", label: "Experience", score: 4.2 },
      { key: "competency", label: "Skills", score: 3.4 },
    ]);
  });

  it("is empty when nothing was scored: no category borrows the overall score or a default", () => {
    const report = buildReport([row({ overall: null })]);
    expect(report.score).toBeNull();
    expect(categoryLines(report)).toEqual([]);
    expect(categoryLines(buildReport([]))).toEqual([]);
  });
});

describe("the report's headline and summary", () => {
  it("come from the session's own score and verdict", () => {
    const strong = buildReport([row({ overall: 4.4 }), row({ number: 2, questionId: "q2", group: "cv", overall: 4.1 })]);
    expect(reportHeadline(strong)).toBe("Ready for the real thing");
    expect(reportSummary(strong)).toBe("2 questions, no follow-ups, 4.3 out of 5 overall (ready). Strongest: skills (4.4). Weakest: experience (4.1).");
    const weak = buildReport([row({ overall: 2.6 })]);
    expect(reportHeadline(weak)).toBe("Not there yet");
    expect(reportSummary(weak)).toBe("1 question, no follow-ups, 2.6 out of 5 overall (not yet). Scored on skills questions only (2.6).");
  });

  it("say so plainly when nothing was scored or answered", () => {
    const unscored = buildReport([row({ overall: null })]);
    expect(reportHeadline(unscored)).toBe("Not scored");
    expect(reportSummary(unscored)).toBe("1 question, no follow-ups. None of the answers could be scored, so there is no overall score.");
    expect(reportSummary(buildReport([]))).toBe("No questions were answered in this session, so there is nothing to score.");
  });

  it("two different sessions never get the same summary by default", () => {
    const a = reportSummary(buildReport([row({ overall: 3.1 }), row({ number: 2, questionId: "q2", group: "technical", overall: 2.2 })]));
    const b = reportSummary(buildReport([row({ overall: 4.6 }), row({ number: 2, questionId: "q2", group: "motivation", overall: 3.9 })]));
    expect(a).not.toBe(b);
    expect(a).toContain("Weakest: technical (2.2)");
    expect(b).toContain("Strongest: skills (4.6)");
  });
});

describe("the report's takeaways", () => {
  it("are the session's own repeated patterns, with the strongest area first when it is 4 or more", () => {
    const rows = [row({ overall: 4.3, pointFirst: false, pointSec: 31 }), row({ number: 2, questionId: "q2", overall: 4.1, pointFirst: false, pointSec: 40, lengthStatus: "over", lengthSec: 200 })];
    const t = takeaways(buildReport(rows));
    expect(t[0]).toEqual({ tone: "good", title: "Strongest area: skills, 4.2 out of 5." });
    expect(t[1]).toMatchObject({ tone: "fix", title: "Lead with your decision or first step", detail: "Late in questions 1 and 2." });
    expect(t.length).toBeLessThanOrEqual(3);
  });

  it("say that nothing repeated, rather than supplying advice, when no pattern was found", () => {
    const t = takeaways(buildReport([row({ overall: 3.5 })]));
    expect(t).toEqual([{ tone: "none", title: "No pattern repeated across your answers, so there is no single thing to fix." }]);
    expect(takeaways(buildReport([row({ overall: null, lengthSec: 0, lengthStatus: "in", pointFirst: null })]))).toEqual([{ tone: "none", title: "Nothing could be measured in this session." }]);
  });
});

describe("the feedback beside each question", () => {
  it("states what was measured in that answer", () => {
    expect(rowFeedback(row())).toEqual({
      good: ["Your point came first, at 0:04.", "“I” 6 times, “we” once.", "You ended with a result.", "2 filler words in 1:35.", "1:35, inside the target."],
      improve: [],
    });
    expect(rowFeedback(row({ pointFirst: false, pointSec: 38, we: 7, i: 2, hasNumber: false, fillerCount: 14, lengthStatus: "over", lengthSec: 190 }))).toEqual({
      good: [],
      improve: ["Your point came late, at 0:38.", "“I” 2 times, “we” 7 times.", "No result or number at the end.", "14 filler words in 3:10.", "3:10, over the target."],
    });
  });

  it("leaves out what can't be told, and says nothing at all for an answer with no speech", () => {
    const short = rowFeedback(row({ pointFirst: null, lengthSec: 12, lengthStatus: "under", we: 0, i: 0, fillerCount: 0 }));
    expect(short.good).toEqual(["You ended with a result."]);
    expect(short.improve).toEqual(["0:12: too short to show much."]);
    expect(rowFeedback(row({ lengthSec: 0 }))).toEqual({ good: [], improve: [] });
  });

  it("differs between answers that were measured differently", () => {
    const a = rowFeedback(row());
    const b = rowFeedback(row({ pointFirst: false, pointSec: 50 }));
    expect(a).not.toEqual(b);
  });
});

describe("the report screen itself", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../components/interview/InterviewReportView.tsx"), "utf8");

  it("holds none of the stock summary, takeaways, feedback or default scores an earlier build showed", () => {
    for (const stock of [
      "Clear strengths in experience and motivation",
      "Strong, relevant examples and clear motivation",
      "Add more technical detail and first-step thinking",
      "Be more concise, especially in longer answers",
      "Described the issue and your actions",
      "Clear career interest and relevance",
      "Add stronger, role-specific reasons",
      "Add more detail on the outcome",
      "Build technical depth",
      "2.0 / 5",
      ": 3.5",
      "|| 6}",
      '"24 minutes"',
      '|| "Medium"',
      "#training",
    ]) {
      expect(source.includes(stock), stock).toBe(false);
    }
  });
});
