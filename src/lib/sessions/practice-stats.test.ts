import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { practiceStats, practiceTypeOf } from "./practice-stats";

const NOW = new Date("2026-11-23T12:00:00.000Z");
const ago = (days: number, minutes = 0) => new Date(NOW.getTime() - days * 86400000 + minutes * 60000).toISOString();
const session = (daysAgo: number, lengthMin: number | null, score: number | null) => ({ startedAt: ago(daysAgo), finishedAt: lengthMin == null ? undefined : ago(daysAgo, lengthMin), score });

describe("the Practice Hub's figures", () => {
  it("are all empty for someone who hasn't practised", () => {
    expect(practiceStats([], NOW)).toEqual({ sessionsThisWeek: 0, minutesThisWeek: 0, scoredSessions: 0, averageScore: null, changeOnLastWeek: null });
  });

  it("count this week's sessions and minutes, and average every scored session", () => {
    const got = practiceStats([session(1, 12, 3.4), session(3, 20.4, 4.0), session(10, 30, 3.0), session(40, 15, 2.0)], NOW);
    expect(got).toEqual({ sessionsThisWeek: 2, minutesThisWeek: 32, scoredSessions: 4, averageScore: 3.1, changeOnLastWeek: 0.7 });
  });

  it("show a change only when both this week and last week have a scored session", () => {
    expect(practiceStats([session(1, 10, 3.5)], NOW).changeOnLastWeek).toBeNull();
    expect(practiceStats([session(1, 10, 3.5), session(9, 10, null)], NOW).changeOnLastWeek).toBeNull();
    expect(practiceStats([session(1, 10, 3.0), session(9, 10, 3.6)], NOW).changeOnLastWeek).toBe(-0.6);
  });

  it("an unscored session counts as practice and not towards the average", () => {
    expect(practiceStats([session(2, 8, null)], NOW)).toMatchObject({ sessionsThisWeek: 1, minutesThisWeek: 8, scoredSessions: 0, averageScore: null });
  });

  it("ignore a session with no end, a bad date or a date in the future, and cap one left open for hours", () => {
    const got = practiceStats([session(1, null, 3.0), { startedAt: "not a date", score: 5 }, { startedAt: ago(-2), finishedAt: ago(-2, 10), score: 5 }, session(2, 600, 4.0)], NOW);
    expect(got).toEqual({ sessionsThisWeek: 2, minutesThisWeek: 120, scoredSessions: 2, averageScore: 3.5, changeOnLastWeek: null });
  });
});

describe("the kind of practice a topic is", () => {
  it("comes from the topic's own group", () => {
    expect(practiceTypeOf({ id: "civil-service-strengths", group: "curveball" })).toBe("strengths");
    expect(practiceTypeOf({ id: "technical", group: "technical" })).toBe("technical");
    expect(practiceTypeOf({ id: "curveball", group: "curveball" })).toBe("situational");
    expect(practiceTypeOf({ id: "motivation", group: "motivation" })).toBe("motivation");
    expect(practiceTypeOf({ id: "experience", group: "cv" })).toBe("experience");
    expect(practiceTypeOf({ id: "star", group: "competency" })).toBe("competency");
  });
});

describe("the Practice Hub's screen and page", () => {
  const read = (p: string) => fs.readFileSync(path.join(__dirname, "../..", p), "utf8");
  const sources = [read("components/practice/PracticeHubClient.tsx"), read("app/(studio)/practice/page.tsx")].join("\n");

  it("hold none of the fixed figures, dates, employers or demo fallbacks an earlier build showed to everyone", () => {
    for (const stock of [
      "45 mins",
      "3 sessions completed",
      "3.6 / 5.0",
      "+0.6 from last week",
      "Interview in 3 days",
      "Interview in 4 days",
      "Interview in 5 days",
      "Why Halden",
      "HMRC",
      "NEWS2",
      "Commercial judgement",
      "Success Profiles",
      "staff-nurse",
      "staffNurse",
      "q1-roadmap",
      "RECOMMENDED",
      "PRIORITY AREA",
    ]) {
      expect(sources.includes(stock), stock).toBe(false);
    }
  });
});
