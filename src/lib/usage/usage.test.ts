import { afterEach, describe, expect, it, vi } from "vitest";
import { costOf, dollars } from "./prices";
import {
  allUsage,
  byFeature,
  recordUsage,
  setUsageContext,
  totals,
  usageFor,
  withUsageContext,
} from "./store";
import { guard, limitReached, LIMITS, rateLimited } from "./limits";

describe("prices", () => {
  it("prices Claude by model, per million tokens", () => {
    expect(
      costOf({
        service: "claude",
        model: "claude-sonnet-5",
        inputTokens: 1_000_000,
        outputTokens: 100_000,
      }),
    ).toBeCloseTo(2 + 1, 6);
    expect(
      costOf({
        service: "claude",
        model: "claude-haiku-4-5-20251001",
        inputTokens: 1_000_000,
      }),
    ).toBeCloseTo(1, 6);
    expect(
      costOf({
        service: "claude",
        model: "claude-sonnet-5",
        cachedTokens: 1_000_000,
      }),
    ).toBeCloseTo(0.2, 6);
    expect(
      costOf({
        service: "claude",
        model: "claude-sonnet-5",
        cacheWriteTokens: 1_000_000,
      }),
    ).toBeCloseTo(2.5, 6);
  });

  it("prices speech by the minute and the voice by the character", () => {
    expect(costOf({ service: "deepgram", seconds: 600 })).toBeCloseTo(0.043, 6);
    expect(costOf({ service: "elevenlabs", characters: 2500 })).toBeCloseTo(
      0.125,
      6,
    );
    expect(
      costOf({
        service: "claude",
        model: "claude-haiku-5-5",
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
      }),
    ).toBeCloseTo(0.6, 6);
  });

  it("shows small amounts readably", () => {
    expect(dollars(0)).toBe("$0.00");
    expect(dollars(0.0004)).toBe("under $0.001");
    expect(dollars(0.0432)).toBe("$0.043");
    expect(dollars(1.234)).toBe("$1.23");
  });
});

describe("usage store", () => {
  it("links each call to the interview and session it was for", () => {
    withUsageContext({ interviewId: "iv-usage", feature: "questions" }, () => {
      recordUsage({
        service: "claude",
        label: "build-plan",
        model: "claude-sonnet-5",
        inputTokens: 1000,
        outputTokens: 500,
      });
      withUsageContext({ sessionId: "s-usage", feature: "interview" }, () =>
        recordUsage({
          service: "deepgram",
          label: "speech-to-text",
          seconds: 90,
        }),
      );
    });
    const forInterview = usageFor({ interviewId: "iv-usage" });
    expect(forInterview).toHaveLength(2);
    expect(usageFor({ sessionId: "s-usage" })[0]).toMatchObject({
      interviewId: "iv-usage",
      sessionId: "s-usage",
      feature: "interview",
      seconds: 90,
    });
    const t = totals(forInterview);
    expect(t.claudeCalls).toBe(1);
    expect(t.audioSeconds).toBe(90);
    expect(t.costUsd).toBeCloseTo(0.002 + 0.005 + 1.5 * 0.0043, 6);
    expect(
      byFeature(forInterview)
        .map((f) => f.feature)
        .sort(),
    ).toEqual(["interview", "questions"]);
  });

  it("keeps the context for the rest of a request once set", async () => {
    await withUsageContext({}, async () => {
      setUsageContext({ presentationId: "p-usage", feature: "presentation" });
      await Promise.resolve();
      recordUsage({
        service: "claude",
        label: "score-run",
        model: "claude-haiku-4-5",
        inputTokens: 10,
      });
    });
    expect(usageFor({ presentationId: "p-usage" })).toHaveLength(1);
    // Nothing leaks outside the request.
    expect(
      recordUsage({ service: "claude", label: "outside", inputTokens: 1 })
        .presentationId,
    ).toBeUndefined();
  });
});

describe("limits", () => {
  const standing = (
    o: Partial<{
      minutesToday: number;
      spentToday: number;
      spentMonth: number;
    }>,
  ) => ({ minutesToday: 0, spentToday: 0, spentMonth: 0, ...o });

  it("stops new practice at the daily minutes, but lets other work carry on", () => {
    const s = standing({ minutesToday: LIMITS.dailyMinutes + 1 });
    expect(limitReached({ practice: true }, s)).toMatch(/daily limit/);
    expect(limitReached({}, s)).toBeNull();
  });

  it("stops everything at the spending limits, with grace for something already started", () => {
    expect(limitReached({}, standing({ spentToday: LIMITS.dailyUsd }))).toMatch(
      /Today’s spending limit/,
    );
    expect(
      limitReached({}, standing({ spentMonth: LIMITS.monthlyUsd })),
    ).toMatch(/month’s spending limit/);
    expect(
      limitReached(
        { grace: 1.25 },
        standing({ spentToday: LIMITS.dailyUsd * 1.1 }),
      ),
    ).toBeNull();
  });

  it("uses plain words, not settings, once launched", () => {
    vi.stubEnv("HAKKIRI_LAUNCH", "1");
    const why =
      limitReached(
        { practice: true },
        standing({ minutesToday: LIMITS.dailyMinutes + 5 }),
      ) ?? "";
    expect(why).not.toMatch(/env/);
    expect(why).toMatch(/resets at midnight/);
    vi.unstubAllEnvs();
  });

  it("counts requests in a sliding window", () => {
    const t = 1_000_000;
    expect(rateLimited("k-test", 2, 1000, t)).toBe(false);
    expect(rateLimited("k-test", 2, 1000, t + 10)).toBe(false);
    expect(rateLimited("k-test", 2, 1000, t + 20)).toBe(true);
    expect(rateLimited("k-test", 2, 1000, t + 1500)).toBe(false);
  });

  it("guards a route with a 429 and a message", async () => {
    const req = () =>
      new Request("http://x/api", {
        headers: { "x-forwarded-for": "203.0.113.9" },
      });
    let res = null;
    for (let i = 0; i < 9 && !res; i++) res = guard(req(), "build");
    expect(res?.status).toBe(429);
    expect((await res!.json()).error).toBe("slow-down");
  });

  it("doesn't count test-mode samples towards spending", () => {
    for (let i = 0; i < 5; i++)
      recordUsage({
        service: "claude",
        label: "sample",
        model: "claude-sonnet-5",
        inputTokens: 10_000_000,
        simulated: true,
      });
    expect(allUsage().some((e) => e.simulated)).toBe(true);
    expect(limitReached()).toBeNull();
  });
});

afterEach(() => vi.unstubAllEnvs());

describe("beta mode", () => {
  it("gives each tester 5 hours in total and a daily cap", async () => {
    vi.resetModules();
    process.env.HAKKIRI_BETA = "1";
    delete process.env.HAKKIRI_DAILY_MINUTES;
    delete process.env.HAKKIRI_BETA_MINUTES;
    try {
      const { LIMITS: L, limitReached: reached } = await import("./limits");
      expect(L.totalMinutes).toBe(300);
      expect(L.dailyMinutes).toBe(120);
      expect(
        reached(
          { practice: true },
          { minutesToday: 10, spentToday: 0, spentMonth: 0, minutesTotal: 301 },
        ),
      ).toMatch(/5 h of beta practice/);
      expect(
        reached(
          { practice: true },
          {
            minutesToday: 121,
            spentToday: 0,
            spentMonth: 0,
            minutesTotal: 200,
          },
        ),
      ).toMatch(/daily cap during the beta/);
      expect(
        reached(
          { practice: true },
          { minutesToday: 30, spentToday: 0, spentMonth: 0, minutesTotal: 200 },
        ),
      ).toBeNull();
      expect(
        reached(
          {},
          { minutesToday: 30, spentToday: 0, spentMonth: 0, minutesTotal: 400 },
        ),
      ).toBeNull();
    } finally {
      delete process.env.HAKKIRI_BETA;
      vi.resetModules();
    }
  });
});
