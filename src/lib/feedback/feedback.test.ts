import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/disk", () => ({
  loadJson: () => [],
  saveJson: () => {},
  savingToDisk: false,
}));
const report = vi.fn(async (_input: unknown) => null);
vi.mock("@/lib/alerts/store", () => ({
  reportProblem: (input: unknown) => report(input),
}));

import { addFeedback, clearFeedback, recentFeedback } from "./store";

describe("beta feedback", () => {
  beforeEach(() => {
    clearFeedback();
    report.mockClear();
  });

  it("keeps a note, trimmed and without the query string, and forwards it as an alert", async () => {
    const f = await addFeedback({
      page: "/interviews/abc?tab=2",
      mood: "bad",
      text: "  The score felt harsh.  ",
      screen: "Answer feedback",
      lead: "Was this score fair?",
    });
    expect(f.page).toBe("/interviews/abc");
    expect(f.text).toBe("The score felt harsh.");
    expect(recentFeedback()).toHaveLength(1);
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "feedback",
        where: "Answer feedback · /interviews/abc",
        message: expect.stringMatching(
          /^Was this score fair\? No\.\nThe score felt harsh\./,
        ),
      }),
    );
  });

  it("gives each note its own alert key so they aren't grouped", async () => {
    const a = await addFeedback({ page: "/", mood: "good", text: "Nice" });
    const b = await addFeedback({ page: "/", mood: "good", text: "Nice" });
    const [[m1], [m2]] = report.mock.calls as unknown as [
      { message: string },
    ][];
    expect(a.id).not.toBe(b.id);
    expect(m1.message).not.toBe(m2.message);
  });

  it("caps the note length", async () => {
    const f = await addFeedback({
      page: "/",
      mood: "ok",
      text: "x".repeat(5000),
    });
    expect(f.text).toHaveLength(2000);
  });
});

import { feedbackPrompt } from "./prompts";

describe("feedback prompts", () => {
  it("asks about the screen the tester is on", () => {
    expect(feedbackPrompt("/interviews/x1/answers/a9").screen).toBe(
      "Answer feedback",
    );
    expect(feedbackPrompt("/interviews/x1/mocks/m2").lead).toMatch(/verdict/);
    expect(feedbackPrompt("/mock/s3").screen).toBe("Live interview");
    expect(feedbackPrompt("/presentations/p1/runs/r1").screen).toBe(
      "Run report",
    );
    expect(feedbackPrompt("/qa/q1").screen).toBe("Audience Q&A");
    expect(feedbackPrompt("/").screen).toBe("Home");
    expect(feedbackPrompt("/somewhere-else").screen).toBe("General");
  });
  it("every prompt has a lead and at least two asks", () => {
    for (const p of [
      "/",
      "/interviews/a",
      "/interviews/a/prep",
      "/rehearse/r",
      "/settings",
      "/story-bank",
    ]) {
      const f = feedbackPrompt(p);
      expect(f.lead.length).toBeGreaterThan(5);
      expect(f.asks.length).toBeGreaterThanOrEqual(2);
    }
  });
});
