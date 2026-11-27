import { describe, expect, it } from "vitest";
import type { MockRow } from "@/lib/mocks/report";
import type { Question } from "@/lib/types";
import { focusOf, focusResults } from "./focus-results";

const row = (questionId: string, group: MockRow["group"], overall: number): MockRow => ({
  number: 1, questionId, question: "", group, lengthSec: 90, overall, pointFirst: true, lengthStatus: "in", fillerCount: 0, we: 0, i: 3, followUps: [],
});
const Q: Record<string, Pick<Question, "group" | "type" | "focus">> = {
  c1: { group: "competency", type: "competency" },
  c2: { group: "competency", type: "strengths" },
  t1: { group: "technical", type: "technical" },
  v1: { group: "cv", type: "competency" },
};

describe("latest practice results in the practice settings' categories", () => {
  it("scores each focus category out of 5 with its weighting and change", () => {
    const older = [row("c1", "competency", 3), row("c2", "competency", 4)];
    const latest = [row("c1", "competency", 3.4), row("c2", "competency", 2), row("t1", "technical", 4)];
    const out = focusResults([latest, older], (id) => Q[id], { competency: 40, strengths: 20, technical: 30, experience: 10 });
    expect(out.map((c) => [c.name, c.score, c.delta, c.weight])).toEqual([
      ["Competency & Behavioural", 3.4, 0.4, 40],
      ["Technical", 4, null, 30],
      ["Strengths", 2, -2, 20],
      ["Experience", null, null, 10],
    ]);
  });

  it("keeps a practised category that is outside the focus", () => {
    const out = focusResults([[row("v1", "cv", 2)]], (id) => Q[id], { competency: 100 });
    expect(out.map((c) => [c.key, c.score, c.weight])).toEqual([["competency", null, 100], ["experience", 2, 0]]);
  });

  it("uses the focus a question was written for when it has one", () => {
    expect(focusOf({ group: "technical", type: "technical", focus: "caseStudy" })).toBe("caseStudy");
    expect(focusOf({ group: "curveball", type: "strengths" })).toBe("strengths");
  });
});
