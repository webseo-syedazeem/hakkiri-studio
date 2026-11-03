import { describe, expect, it } from "vitest";
import {
  adjustMix,
  allocate,
  CATEGORY_ORDER,
  isTechRole,
  leanTowards,
  mixIsValid,
  mixQuestionCount,
  presetFor,
  PRESETS,
  PRESET_ORDER,
  settingsLine,
  toggleMix,
  totalQuestionCount,
  type Mix,
} from "./settings";

const sum = (m: Mix) => CATEGORY_ORDER.reduce((s, g) => s + m[g], 0);

describe("question mix", () => {
  it("every preset adds up to 100 in steps of 10", () => {
    for (const p of PRESET_ORDER) expect(mixIsValid(PRESETS[p].mix)).toBe(true);
  });

  it("fits about one question per four minutes, fewer on Hard", () => {
    expect([10, 20, 30, 45, 60].map((m) => mixQuestionCount(m, "medium"))).toEqual([2, 4, 6, 10, 14]);
    expect(mixQuestionCount(30, "hard")).toBeLessThan(mixQuestionCount(30, "easy"));
    // Opening, plus a closing question from 20 minutes.
    expect(totalQuestionCount(10, "medium")).toBe(3);
    expect(totalQuestionCount(30, "medium")).toBe(8);
  });

  it("shares questions by percentage, and gives every category switched on at least one", () => {
    expect(allocate(PRESETS.balanced.mix, 6)).toEqual({ cv: 2, competency: 1, technical: 1, motivation: 1, curveball: 1 });
    const skills = allocate(PRESETS.skills.mix, 10);
    expect(skills.competency).toBe(4);
    expect(Object.values(skills).reduce((a, b) => a + b, 0)).toBe(10);
    expect(allocate(PRESETS.screening.mix, 4)).toEqual({ cv: 2, competency: 1, technical: 0, motivation: 1, curveball: 0 });
    // Too few questions to go round: the biggest shares win.
    expect(Object.values(allocate(PRESETS.balanced.mix, 2)).reduce((a, b) => a + b, 0)).toBe(2);
  });

  it("keeps the mix at 100 when you change one category", () => {
    let m = PRESETS.balanced.mix;
    m = adjustMix(m, "technical", 10);
    expect(m.technical).toBe(30);
    expect(sum(m)).toBe(100);
    m = adjustMix(m, "technical", -10);
    m = adjustMix(m, "technical", -10);
    expect(m.technical).toBe(10);
    expect(sum(m)).toBe(100);
    // Can't go below 10 while it's on.
    expect(adjustMix(m, "technical", -10).technical).toBe(10);
  });

  it("shares a category's points out when you switch it off, and takes 10 when you switch it back on", () => {
    const off = toggleMix(PRESETS.balanced.mix, "technical", false);
    expect(off.technical).toBe(0);
    expect(sum(off)).toBe(100);
    const on = toggleMix(off, "technical", true);
    expect(on.technical).toBe(10);
    expect(sum(on)).toBe(100);
    // The last category on can't be switched off.
    const only: Mix = { cv: 0, competency: 100, technical: 0, motivation: 0, curveball: 0 };
    expect(toggleMix(only, "competency", false)).toEqual(only);
  });

  it("names the preset a mix matches", () => {
    expect(presetFor(PRESETS.final.mix)).toBe("final");
    expect(presetFor(adjustMix(PRESETS.final.mix, "cv", 10))).toBe("custom");
    expect(settingsLine({ difficulty: "hard", minutes: 45, preset: "technical", mix: PRESETS.technical.mix })).toBe("Hard · 45 min · Technical-heavy");
  });

  it("leans the next interview towards your weakest category", () => {
    const lean = leanTowards(PRESETS.balanced.mix, { cv: 4.2, competency: 3.6, technical: 2.4, motivation: 4.5, curveball: 3.2 });
    expect(lean?.weakest).toBe("technical");
    expect(lean?.strongest).toBe("motivation");
    expect(lean?.mix.technical).toBe(30);
    expect(lean?.mix.motivation).toBe(10);
    // No clear gap, no change.
    expect(leanTowards(PRESETS.balanced.mix, { cv: 3.5, competency: 3.6 })).toBeNull();
  });

  it("tells technical jobs from the rest", () => {
    expect(isTechRole("Senior Data Analyst")).toBe(true);
    expect(isTechRole("Backend Engineer")).toBe(true);
    expect(isTechRole("Account Executive")).toBe(false);
    expect(isTechRole("Staff Nurse")).toBe(false);
  });
});
