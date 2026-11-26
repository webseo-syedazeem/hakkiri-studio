import { describe, expect, it } from "vitest";
import { band, bandOf } from "./band";

describe("score bands", () => {
  it("names each range of the score, with its colour key", () => {
    expect([0, 39, 40, 59, 60, 79, 80, 100].map(band)).toEqual(["Poor", "Poor", "Average", "Average", "Good", "Good", "Strong", "Strong"]);
    expect([12, 45, 70, 91].map((n) => bandOf(n).key)).toEqual(["poor", "average", "good", "strong"]);
  });
});
