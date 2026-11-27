import { describe, expect, it } from "vitest";
import { checkReply, fromBank, superficial, tooSimilar } from "./generate";
import { planCategories, SECTORS, INDUSTRY_KEYS, CATEGORY_KEYS } from "./catalogue";
import { BANK, PROFESSION_BANK } from "./knowledge";

describe("industry-specific General practice", () => {
  it("gives materially different Strengths questions when only the industry changes", () => {
    const plan = planCategories("government", "strengths", 10);
    const pick = (industry: "government" | "finance" | "healthcare" | "technology" | "education") => fromBank({ industry, profession: "", difficulty: "medium" }, plan, []).map((q) => q.text);
    const sets = (["government", "finance", "healthcare", "technology", "education"] as const).map(pick);
    for (let i = 0; i < sets.length; i++)
      for (let j = i + 1; j < sets.length; j++) for (const a of sets[i]) for (const b of sets[j]) expect(tooSimilar(a, b)).toBe(false);
  });

  it("uses the developer note's example questions for Strengths", () => {
    expect(BANK.finance.strengths).toContain("What do you enjoy about analysing numerical information to identify risks or opportunities?");
    expect(BANK.government.strengths).toContain("What energises you about balancing competing priorities to deliver better public outcomes?");
    expect(BANK.healthcare.strengths).toContain("What do you find rewarding about supporting people in vulnerable circumstances?");
    expect(BANK.technology.strengths).toContain("What excites you about investigating the root cause of complex technical problems?");
    expect(BANK.education.strengths).toContain("What do you enjoy about adapting your communication style to different learning needs?");
  });

  it("puts the profession's own questions first", () => {
    const [q] = fromBank({ industry: "healthcare", profession: "Nursing", difficulty: "medium" }, ["behaviour"], []);
    expect(q.text).toBe(PROFESSION_BANK.Nursing.behaviour![0]);
  });

  it("never repeats a question from an earlier session while fresh ones remain", () => {
    const spec = { industry: "finance" as const, profession: "", difficulty: "medium" as const };
    const first = fromBank(spec, ["technical", "technical"], []).map((q) => q.text);
    const second = fromBank(spec, ["technical", "technical"], first).map((q) => q.text);
    for (const a of second) for (const b of first) expect(tooSimilar(a, b)).toBe(false);
  });

  it("has four questions for every type in every industry, all distinct", () => {
    for (const ind of INDUSTRY_KEYS) {
      for (const k of CATEGORY_KEYS) {
        const qs = BANK[ind][k];
        expect(qs, `${ind}/${k}`).toHaveLength(4);
        for (const q of qs) expect(q, `${ind}/${k}`).toMatch(/[?.]$/);
      }
      expect(SECTORS[ind].name.length).toBeGreaterThan(2);
    }
  });

  it("rejects superficial personalisation and reworded repeats", () => {
    expect(superficial("What are your greatest strengths in banking and finance?")).toBe(true);
    expect(superficial("How naturally do you identify inconsistencies in financial information, and what do you enjoy about this process?")).toBe(false);
    expect(tooSimilar("Tell me about a time you influenced a senior stakeholder.", "Tell me about a time when you influenced a senior stakeholder?")).toBe(true);
    const problems = checkReply(
      { questions: [{ category: "strengths", text: "Tell me about a time you used your strengths in finance.", short: "Strengths" }] },
      ["strengths"],
      [],
    );
    expect(problems.some((p) => /strengths question/.test(p))).toBe(true);
  });

  it("follows the industry's Recommended Mix", () => {
    expect(planCategories("technology", "mix", 10)).toEqual(["technical", "case", "behaviour"]);
    expect(planCategories("healthcare", "mix", 20).slice(0, 4)).toEqual(SECTORS.healthcare.mix);
  });
});
