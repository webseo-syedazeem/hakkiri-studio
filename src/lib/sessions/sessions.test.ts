import { describe, expect, it } from "vitest";
import { pickQuestions, questionsNeeded } from "./pick";
import { drillQuestions, habitLine, rowHabit, suggestDrills } from "./drills";
import { compareRuns } from "./compare";
import { mergeRules, rulesFromSkips } from "./rules";
import { buildPrepSheet } from "@/lib/interviews/prep";
import { demoMock, halden, roadmapAnswer } from "@/lib/mock-data";
import { buildReport, rowFromAnswer, type MockRow } from "@/lib/mocks/report";
import { PRESETS, DEFAULT_SETTINGS } from "@/lib/interviews/settings";
import { soundsLikeCorrection } from "@/lib/ai/follow-up";
import { wordsFromScript } from "@/lib/demo-words";

const c1 = halden.questions.find((q) => q.id === "c1")!;
const rows: MockRow[] = [...demoMock.rows, rowFromAnswer(roadmapAnswer, c1, 3)].sort((a, b) => a.number - b.number);
const heardInDemo = new Map(demoMock.questionIds.map((id) => [id, demoMock.startedAt]));

describe("choosing an interview's questions", () => {
  it("opens with “Tell me about yourself”, follows the mix, and closes with your questions for them", () => {
    const p = pickQuestions(halden.questions, { ...DEFAULT_SETTINGS, minutes: 30 }, new Map());
    expect(p.questionIds[0]).toBe("open");
    expect(p.questionIds.at(-1)).toBe("close");
    // 30 minutes, Medium, Balanced: six from the mix, Motivation first, Situational last.
    expect(p.questionIds).toEqual(["open", "m1", "v1", "v2", "c1", "t1", "b1", "close"]);
  });

  it("never repeats a question you've had, and keeps two spares per category for skips", () => {
    const p = pickQuestions(halden.questions, { ...DEFAULT_SETTINGS, minutes: 30 }, heardInDemo);
    expect(p.questionIds.some((id) => heardInDemo.has(id))).toBe(false);
    expect(p.spareIds.filter((id) => id.startsWith("c"))).toHaveLength(2);
    expect(p.spareIds.every((id) => !p.questionIds.includes(id))).toBe(true);
  });

  it("says how many more each category needs, so the server can write them", () => {
    const heardAll = new Map(halden.questions.filter((q) => q.group === "technical").map((q) => [q.id, "2026-10-01"]));
    const p = pickQuestions(halden.questions, { ...DEFAULT_SETTINGS, minutes: 45, mix: PRESETS.technical.mix }, heardAll);
    expect(p.short.technical).toBeGreaterThan(0);
    expect(questionsNeeded(p).technical).toBe(p.short.technical + 2);
    // Without a way to write more, the ones heard longest ago come back.
    const again = pickQuestions(halden.questions, { ...DEFAULT_SETTINGS, minutes: 45, mix: PRESETS.technical.mix }, heardAll, { allowRepeats: true });
    expect(again.short.technical).toBe(1); // Halden has only four technical questions to bring back
    expect(again.short.technical).toBeLessThan(p.short.technical);
  });

  it("leaves out the closing question in a 10-minute interview, and set-aside questions always", () => {
    const retired = halden.questions.map((q) => (q.id === "m1" ? { ...q, retired: true } : q));
    const p = pickQuestions(retired, { ...DEFAULT_SETTINGS, minutes: 10 }, new Map());
    expect(p.questionIds).not.toContain("close");
    expect(p.questionIds).not.toContain("m1");
  });
});

describe("drills", () => {
  const report = buildReport(rows, "Sam");

  it("suggests up to three, the biggest gain first", () => {
    const d = suggestDrills({ sessionId: "demo-full", rows, fixes: report.fixes, categories: report.categories, gaps: halden.gaps!, technicalLabel: "Technical", shortOf: (id) => halden.questions.find((q) => q.id === id)!.short });
    expect(d.length).toBe(3);
    expect(d[0].spec.kind).toBe("category");
    expect(d[0].title).toBe("Technical drill");
    expect(d.map((x) => x.spec.kind)).toContain("fix");
    expect(d.reduce((n, x) => n + x.minutes, 0)).toBeLessThanOrEqual(20);
  });

  it("checks one habit on an answer, in code", () => {
    const roadmap = rows.find((r) => r.questionId === "c1")!;
    expect(rowHabit(roadmap, "lead")).toBe(false);
    expect(rowHabit(roadmap, "ownership")).toBe(false);
    expect(rowHabit(roadmap, "numbers")).toBe(true);
    expect(habitLine(roadmap, "ownership")).toMatch(/^“I” \d+ times, “we” \d+ times\.$/);
  });

  it("picks the questions: the same one then a new one on the same skill, or three from a category", () => {
    expect(drillQuestions({ kind: "fix", questionId: "c1" }, halden.questions, heardInDemo, [])).toEqual(["c1", "c2"]);
    expect(drillQuestions({ kind: "category", group: "technical" }, halden.questions, heardInDemo, [])).toEqual(["t2", "t3", "t4"]);
    const habit = drillQuestions({ kind: "habit", habit: "lead" }, halden.questions, heardInDemo, ["competency", "technical"]);
    expect(habit).toHaveLength(5);
    expect(habit.every((id) => /^[ct]/.test(id))).toBe(true);
  });
});

describe("run it again", () => {
  it("shows each answer before and after, and whether you made the fix", () => {
    const after = rows.map((r) => (r.questionId === "c1" ? { ...r, overall: 4.3, pointFirst: true, we: 1, i: 8, followUps: [] } : r));
    const c = compareRuns(rows, after, ["lead", "ownership"]);
    const row = c.rows.find((r) => r.questionId === "c1")!;
    expect([row.before, row.after]).toEqual([3.7, 4.3]);
    expect(row.checks.map((x) => [x.habit, x.before, x.after])).toEqual([
      ["lead", false, true],
      ["ownership", false, true],
    ]);
    expect(c.score.after!).toBeGreaterThan(c.score.before!);
    expect(c.categories.find((x) => x.group === "competency")?.after).toBe(4.3);
  });
});

describe("rules from skips", () => {
  it("turns skip reasons into rules for the next questions", () => {
    const rules = rulesFromSkips(
      [
        { questionId: "t2", reason: "not-relevant" },
        { questionId: "v1", reason: "not-true" },
        { questionId: "b1", reason: "already-asked" },
      ],
      (id) => halden.questions.find((q) => q.id === id)?.text,
    );
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatch(/No questions like “Would you build or buy a fraud-detection tool\?”/);
    expect(mergeRules(["a"], ["a", " b ", ""])).toEqual(["a", "b"]);
  });
});

describe("the prep sheet", () => {
  it("is built from your best answers, stories, CV probes and the fixes your interviews keep showing", () => {
    const report = buildReport(rows, "Sam");
    const sheet = buildPrepSheet(halden, { answers: [roadmapAnswer], interviews: 1, fixes: report.fixes, rows });
    expect(sheet.bestAnswers[0]).toMatchObject({ questionId: "c1", answerId: "a-roadmap" });
    expect(sheet.bestAnswers[0].text).toMatch(/^I paused a quarter’s roadmap/);
    expect(sheet.stories.find((s) => s.title.startsWith("Pausing"))?.useFor).toContain("Changing the roadmap");
    expect(sheet.probes[0].handle).toMatch(/delivered/);
    expect(sheet.questionsToAsk).toHaveLength(3);
    expect(sheet.remember).toHaveLength(3);
    expect(sheet.remember[0]).toMatch(/Answer first/);
  });
});

describe("saying a question doesn't apply", () => {
  const said = (text: string, end = 4) => wordsFromScript([{ start: 0, end, text }]);
  it("hears a short correction as a skip, not an answer", () => {
    expect(soundsLikeCorrection(said("I've never worked at Google, so I can't speak to that."))).toBe(true);
    expect(soundsLikeCorrection(said("Sorry, that's not on my CV."))).toBe(true);
    expect(soundsLikeCorrection(said("I don't have experience with that."))).toBe(true);
  });
  it("lets a caveat followed by a real answer through", () => {
    const long = "I haven't worked in fintech, but at Brightline I owned the billing data, and when I found an error worth a lot of money I traced it to a rounding rule, fixed it with the finance team, and we added checks that caught two more errors that quarter.";
    expect(soundsLikeCorrection(said(long, 30))).toBe(false);
    expect(soundsLikeCorrection(said("Yes, I led that project from start to finish."))).toBe(false);
  });
});

describe("the story builder without Claude", () => {
  it("puts the result first, in your words, with a title from what you did", async () => {
    const { templateStory } = await import("@/lib/interviews/stories");
    const s = templateStory({
      skill: "SQL",
      question: "Tell me about a time you used SQL to solve a real problem.",
      role: "Data Analyst",
      parts: { situation: "Reports kept missing errors", task: "I had to find out why", action: "I rebuilt the SQL checks, and walked finance through it", result: "Errors caught went from 3 in 10 to 9 in 10" },
    });
    expect(s.title).toBe("Rebuilt the SQL checks");
    expect(s.text.startsWith("Errors caught went from 3 in 10 to 9 in 10.")).toBe(true);
    expect(s.useFor[0]).toBe("Questions on SQL");
  });
});

describe("story titles without Claude", () => {
  it("cuts a long first action to a short title", async () => {
    const { templateStory } = await import("@/lib/interviews/stories");
    const s = templateStory({ skill: "Pressure or a deadline", question: "Tell me about a time you worked to a tight deadline.", role: "PM", parts: { situation: "", task: "", action: "I set up a daily call with their finance team, found the bad card rule", result: "They renewed" } });
    expect(s.title).toBe("Set up a daily call");
  });
});
