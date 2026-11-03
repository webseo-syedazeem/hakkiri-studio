import { describe, expect, it } from "vitest";
import { answerTells, missingParts, themesOf } from "./themes";
import { completeStory, storyBank, storyKey } from "./bank";
import { halden, roadmapAnswer } from "@/lib/mock-data";
import { londonToday } from "@/lib/dates";

const story = (title: string) => halden.stories!.find((s) => s.title === title)!;

describe("story themes", () => {
  it("says which kinds of question a story covers", () => {
    expect(themesOf(story("Disagreeing with engineering on fraud rules"))).toContain("conflict");
    expect(themesOf(story("Growing checkout conversion by 17%"))).toContain("results");
    expect(themesOf(story("A launch that missed its date"))).toContain("failure");
    expect(themesOf(story("Leading a team of five through a reorg"))).toEqual(expect.arrayContaining(["leadership", "change"]));
  });

  it("finds a story in an answer from two of its title words", () => {
    expect(answerTells(story("Pausing onboarding to fix payments"), roadmapAnswer.words)).toBe(true);
    expect(answerTells(story("Disagreeing with engineering on fraud rules"), roadmapAnswer.words)).toBe(false);
  });

  it("lists the missing parts in order", () => {
    expect(missingParts(story("Moving from design into product"))).toEqual(["action", "result"]);
  });
});

describe("the story bank", () => {
  it("gathers the demo's stories while you have no interview of your own", () => {
    const bank = storyBank(londonToday());
    expect(bank.demo).toBe(true);
    expect(bank.stories).toHaveLength(halden.stories!.length);
    // Complete stories first.
    expect(bank.stories[0].missing).toEqual([]);
    const uncovered = bank.themes.filter((t) => t.stories.length === 0).map((t) => t.id);
    expect(uncovered).toEqual(expect.arrayContaining(["pressure"]));
    expect(bank.stories.find((s) => s.title === "Pausing onboarding to fix payments")?.uses).toBeGreaterThan(0);
    expect(bank.stories.find((s) => s.title === "Pausing onboarding to fix payments")?.practise).not.toBeNull();
  });

  it("fills in a story's gaps from your words, result first", async () => {
    const key = storyKey("Moving from design into product");
    const s = await completeStory(key, { situation: "", task: "", action: "I asked to own the checkout metrics and ran the first experiments myself", result: "Checkout conversion grew 17% in a year" }, londonToday());
    expect(s?.missing).toEqual([]);
    expect(s?.text?.startsWith("Checkout conversion grew 17% in a year.")).toBe(true);
  });
});
