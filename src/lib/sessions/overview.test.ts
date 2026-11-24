import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { overviewCategories } from "./overview";

describe("the category scores on an interview's workspace", () => {
  it("are empty until one of the person's interviews has been scored", () => {
    expect(overviewCategories([])).toEqual([]);
    expect(overviewCategories([{}, {}])).toEqual([]);
  });

  it("show each category's latest score, and a change only when an earlier interview scored it too", () => {
    const got = overviewCategories([{ cv: 4.2, technical: 2.9 }, { cv: 3.7, competency: 3.1 }, { cv: 3.0 }]);
    expect(got).toEqual([
      { key: "cv", name: "Experience", score: 4.2, delta: 0.5 },
      { key: "competency", name: "Skills", score: 3.1, delta: null },
      { key: "technical", name: "Technical", score: 2.9, delta: null },
    ]);
  });

  it("a fall is a negative change, and no change is zero", () => {
    expect(overviewCategories([{ motivation: 3.2, curveball: 3.5 }, { motivation: 3.9, curveball: 3.5 }]).map((c) => [c.key, c.delta])).toEqual([
      ["motivation", -0.7],
      ["curveball", 0],
    ]);
  });
});

describe("the workspace screen and its page", () => {
  const read = (p: string) => fs.readFileSync(path.join(__dirname, "../..", p), "utf8");
  const sources = [read("components/interview/InterviewOverviewClient.tsx"), read("app/(studio)/interviews/[id]/page.tsx")].join("\n");

  it("hold none of the fixed scores, sessions, stages or employer wording an earlier build showed for every interview", () => {
    for (const stock of [
      'delta: "+0.4"',
      "score: 4.0, delta",
      "halden-m1",
      "Wed 5 Nov",
      "Fri 13 Nov",
      "A payments metric drops",
      "hk_recent_practice",
      "Civil Service / HMRC",
      "Why HMRC",
      "GDS standards",
      '"Senior Product Manager, Payments"',
      '|| "Halden"',
      "defaultHaldenStages",
      "Practice session · Completed",
    ]) {
      expect(sources.includes(stock), stock).toBe(false);
    }
  });
});
