import { describe, expect, it } from "vitest";
import { demoPresentation, demoQaSession, demoRuns } from "./demo";
import { pitchNextStep, pitchReadiness } from "./plan";
import { DEMO_TODAY, addDays, londonIso } from "@/lib/dates";
import type { Run } from "./types";

const today = "2026-10-25";
const p = { ...demoPresentation, date: londonIso(addDays(today, 6), "09:30") };

describe("demo runs (design screen 13)", () => {
  it("are scored like real runs: 13:05 at 3.0, 12:10 at 3.4, 11:20 at 3.6", () => {
    expect(demoRuns.map((r) => [r.totalSec, r.overall])).toEqual([
      [785, 3],
      [730, 3.4],
      [680, 3.6],
    ]);
    const last = demoRuns[2];
    expect(last.focus).toEqual({ kind: "cut", slide: 4, overSec: 100 });
    expect(last.fix.title).toBe("Cut slide 4 back to its point. That alone saves about 1:40.");
  });
});

describe("pitch readiness", () => {
  it("is not ready while the last run is over time", () => {
    const r = pitchReadiness(p, demoRuns, [demoQaSession]);
    expect(r.ready).toBe(false);
    expect(r.status).toBe("Over time by 1:20");
    expect(r.rows.map((x) => x.label)).toEqual(["Opening", "Message and ask", "Timing", "Q&A"]);
  });

  it("is ready after two runs in a row at 4 or more, on time", () => {
    const good = (n: number): Run => ({
      ...demoRuns[2],
      id: `g${n}`,
      number: 3 + n,
      totalSec: 590,
      overall: 4.2,
      finishedAt: londonIso(addDays(DEMO_TODAY, n), "14:00"),
    });
    expect(pitchReadiness(p, [...demoRuns, good(3)], []).ready).toBe(false);
    expect(pitchReadiness(p, [...demoRuns, good(3), good(4)], []).ready).toBe(true);
  });
});

describe("next step", () => {
  it("starts with a first full run, then the slide your last run flagged", () => {
    expect(pitchNextStep(p, [], []).label).toBe("First full run");
    const step = pitchNextStep(p, demoRuns, [demoQaSession]);
    expect(step.href).toMatch(/^\/rehearse\/q1-roadmap/);
  });
});
