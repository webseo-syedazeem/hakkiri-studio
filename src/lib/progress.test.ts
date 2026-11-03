import { afterEach, describe, expect, it } from "vitest";
import { progressFor } from "./progress";
import { halden, roadmapAnswer } from "@/lib/mock-data";
import { saveAnswer } from "@/lib/answers/store";

const store = (globalThis as unknown as { __hakkiriAnswers?: Map<string, unknown> }).__hakkiriAnswers;
afterEach(() => store?.clear());

describe("progressFor", () => {
  it("starts from earlier practice: each group is the average of its questions' latest scores", () => {
    const p = progressFor(halden);
    expect(p.groupScores.technical).toBe(2.4); // 2.1 and 2.6
    expect(p.groupScores.motivation).toBe(4.4); // 4.6, 4.3, 4.2
    expect(p.answersPractised).toBe(14);
  });

  it("moves when you practise: a new answer replaces that question's score", () => {
    // Record the roadmap answer as an answer to the first technical question.
    saveAnswer({ ...roadmapAnswer, id: "t-new", questionId: "t1" });
    const p = progressFor(halden);
    expect(p.questions.get("t1")).toMatchObject({ answerId: "t-new" });
    expect(p.groupScores.technical).toBeGreaterThan(2.4);
    expect(p.answersPractised).toBe(15);
    // Leaving a mock's own answers out gives the "earlier practice" the report blends with.
    expect(progressFor(halden, { excludeAnswerIds: ["t-new"] }).groupScores.technical).toBe(2.4);
  });
});
