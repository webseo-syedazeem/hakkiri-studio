import { describe, expect, it } from "vitest";
import { halden } from "@/lib/mock-data";
import { drillQuestions, drillTitle } from "./drills";
import { pickQuestions } from "./pick";
import { PRESETS } from "@/lib/interviews/settings";
import { CHECKLIST_TOPICS, DRILL_TOPICS, getTopic, resolveInterviewQuestion, topicQuestions } from "./topics";

describe("topic-specific practice drills", () => {
  it("picks stakeholder management questions instead of generic interview questions", () => {
    const qs = topicQuestions("stakeholder-management", halden.questions);
    expect(qs.length).toBeGreaterThanOrEqual(3);
    const ids = qs.map((q) => q.id);
    expect(ids).toContain("c2");
    expect(ids).not.toContain("open");
    expect(ids).not.toContain("close");
    expect(ids).not.toContain("m1");
    expect(qs.every((q) => /engineer|stakeholder|align|influence|push back|competing/i.test(`${q.text} ${q.short}`))).toBe(true);
  });

  it("provides domain-relevant questions for every checklist and hub topic", () => {
    for (const id of Object.keys(DRILL_TOPICS)) {
      const spec = getTopic(id);
      expect(spec).toBeDefined();
      const qs = topicQuestions(id, halden.questions);
      expect(qs.length).toBeGreaterThanOrEqual(3);
    }
    for (const id of CHECKLIST_TOPICS) {
      expect(getTopic(id)).toBeDefined();
    }
  });

  it("integrates with drillQuestions, drillTitle and resolveInterviewQuestion", () => {
    const spec = { kind: "topic" as const, topic: "stakeholder-management" };
    expect(drillTitle(spec, (id) => id)).toBe("Stakeholder management");
    const ids = drillQuestions(spec, halden.questions, new Map(), ["competency"]);
    expect(ids.length).toBeGreaterThanOrEqual(3);
    for (const id of ids) {
      expect(resolveInterviewQuestion(halden, id)).toBeDefined();
    }
    expect(resolveInterviewQuestion({ questions: [] }, "topic-sm-2")?.short).toBe("Aligning conflicting teams");
  });

  it("starts technical drills and technical stage interviews with technical questions rather than Tell me about yourself", () => {
    const drillQs = topicQuestions("technical", halden.questions);
    expect(drillQs.map((q) => q.id)).not.toContain("open");
    expect(drillQs[0]?.group).toBe("technical");

    const picked = pickQuestions(
      halden.questions,
      { minutes: 20, difficulty: "medium", preset: "technical", mix: PRESETS.technical.mix },
      new Map(),
    );
    expect(picked.questionIds).not.toContain("open");
    const firstQ = halden.questions.find((q) => q.id === picked.questionIds[0]);
    expect(firstQ?.group).toBe("technical");
  });

  it("separates easy and hard topic questions cleanly and avoids repeating already answered ones", () => {
    for (const id of Object.keys(DRILL_TOPICS)) {
      const easy = topicQuestions(id, halden.questions, { difficulty: "easy", limit: 4 });
      const hard = topicQuestions(id, halden.questions, { difficulty: "hard", limit: 4 });
      expect(easy.length).toBeGreaterThanOrEqual(3);
      expect(hard.length).toBeGreaterThanOrEqual(3);
      const easyIds = new Set(easy.map((q) => q.id));
      expect(hard.some((q) => easyIds.has(q.id))).toBe(false);
    }

    const firstRun = topicQuestions("stakeholder-management", halden.questions, { difficulty: "hard", limit: 2 });
    const seen = new Map(firstRun.map((q) => [q.id, "2026-11-12T20:00:00.000Z"]));
    const secondRun = topicQuestions("stakeholder-management", halden.questions, {
      difficulty: "hard",
      limit: 2,
      lastAsked: seen,
    });
    expect(secondRun).toHaveLength(2);
    expect(secondRun.some((q) => seen.has(q.id))).toBe(false);
  });
});
