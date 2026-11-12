import { describe, expect, it } from "vitest";
import { planInterview, planRerun, PlanError, retireSkipped } from "./server";
import { pickQuestions } from "./pick";
import { getInterview } from "@/lib/interviews/store";
import { findMock, lastAskedMap, recordAskedQuestionAsync, saveMock, type MockRecord } from "@/lib/mocks/store";
import type { MockRow } from "@/lib/mocks/report";
import { DEFAULT_SETTINGS } from "@/lib/interviews/settings";

const row = (number: number, questionId: string): MockRow => ({
  number,
  questionId,
  question: questionId,
  group: "competency",
  lengthSec: 90,
  overall: 3.4,
  pointFirst: false,
  lengthStatus: "in",
  fillerCount: 2,
  we: 1,
  i: 4,
  followUps: [],
});

const source = (id: string, extra: Partial<MockRecord> = {}): MockRecord => ({
  id,
  interviewId: "halden",
  kind: "interview",
  status: "done",
  settings: DEFAULT_SETTINGS,
  // c2 was skipped and the spare c5 asked in its place.
  questionIds: ["open", "c1", "c2", "close"],
  skipped: [{ questionId: "c2", reason: "not-relevant", replacedBy: "c5" }],
  rows: [row(1, "open"), row(2, "c1"), row(3, "c5"), row(4, "close")],
  startedAt: "2026-10-25T10:00:00.000Z",
  finishedAt: "2026-10-25T10:30:00.000Z",
  answerIds: [],
  planned: 4,
  ...extra,
});

describe("run it again", () => {
  it("asks the questions you answered, in order, with the spare that replaced a skip", () => {
    saveMock(source("src-1"));
    const rerun = planRerun("halden", "src-1");
    expect(rerun.kind).toBe("rerun");
    expect(rerun.questionIds).toEqual(["open", "c1", "c5", "close"]);
    expect(rerun.rerunOf).toBe("src-1");
    // Planning it twice opens the same re-run rather than a second one.
    expect(planRerun("halden", "src-1").id).toBe(rerun.id);
  });

  it("only once, and only for an interview with new questions", () => {
    saveMock(source("src-2"));
    const rerun = planRerun("halden", "src-2");
    saveMock({ ...findMock(rerun.id)!, status: "done" });
    expect(() => planRerun("halden", "src-2")).toThrow(PlanError);
    saveMock(source("src-3", { kind: "drill" }));
    expect(() => planRerun("halden", "src-3")).toThrow(/can’t be run again/);
  });
});

describe("skipped questions", () => {
  it("never come back, even when older questions are allowed again", () => {
    retireSkipped("halden", [{ questionId: "c2", reason: "not-relevant" }, { questionId: "open", reason: "not-relevant" }, { questionId: "c3", reason: "by-choice" }]);
    const halden = getInterview("halden")!;
    expect(halden.questions.find((q) => q.id === "c2")?.retired).toBe(true);
    // "Tell me about yourself" can't be set aside.
    expect(halden.questions.find((q) => q.id === "open")?.retired).toBeUndefined();
    // Skipping by choice (the opening, or your questions for them) sets nothing aside.
    expect(halden.questions.find((q) => q.id === "c3")?.retired).toBeUndefined();
    const heardAll = new Map(halden.questions.map((q) => [q.id, "2026-10-01"]));
    const p = pickQuestions(halden.questions, { ...DEFAULT_SETTINGS, minutes: 60 }, heardAll, { allowRepeats: true });
    expect(p.questionIds).not.toContain("c2");
  });
});

describe("no-repeat persistence across difficulty levels", () => {
  it("tracks asked questions in incomplete sessions and keeps Easy separate from Hard", async () => {
    const easyRun1 = await planInterview("halden", { ...DEFAULT_SETTINGS, minutes: 20, difficulty: "easy" });
    const firstNonSlot = (easyRun1.questionIds ?? []).filter((id) => id !== "open" && id !== "close");
    expect(firstNonSlot.length).toBeGreaterThan(0);

    // Simulate user answering questions mid-session and leaving before full mock completion
    for (const qid of firstNonSlot) {
      await recordAskedQuestionAsync(easyRun1.id, qid);
    }
    expect(lastAskedMap("halden").has(firstNonSlot[0])).toBe(true);

    const easyRun2 = await planInterview("halden", { ...DEFAULT_SETTINGS, minutes: 20, difficulty: "easy" });
    const secondNonSlot = (easyRun2.questionIds ?? []).filter((id) => id !== "open" && id !== "close");
    expect(secondNonSlot.some((id) => firstNonSlot.includes(id))).toBe(false);

    const hardRun = await planInterview("halden", { ...DEFAULT_SETTINGS, minutes: 20, difficulty: "hard" });
    const hardNonSlot = (hardRun.questionIds ?? []).filter((id) => id !== "open" && id !== "close");
    expect(hardNonSlot.some((id) => firstNonSlot.includes(id) || secondNonSlot.includes(id))).toBe(false);
    const bank = getInterview("halden")!.questions;
    for (const id of hardNonSlot) {
      expect(bank.find((q) => q.id === id)?.difficulty).toBe("hard");
    }
  });
});
