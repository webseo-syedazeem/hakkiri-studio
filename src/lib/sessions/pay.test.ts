import { describe, expect, it } from "vitest";
import { payChecks, payQuestions, payStage } from "./pay";
import { ensurePayQuestions, planDrill } from "./server";
import { pickQuestions } from "./pick";
import { drillQuestions } from "./drills";
import { getInterview, updateInterview } from "@/lib/interviews/store";
import { wordsFromScript } from "@/lib/demo-words";
import { DEFAULT_SETTINGS } from "@/lib/interviews/settings";

const words = (s: string) => wordsFromScript([{ start: 0, end: 20, text: s }]);
const ok = (checks: { ok: boolean | null }[]) => checks.map((c) => c.ok);

describe("talking about pay", () => {
  it("changes with the round: recruiter, hiring manager, final", () => {
    expect(payStage("screening")).toBe("recruiter");
    expect(payStage("competency")).toBe("manager");
    expect(payStage("not-sure")).toBe("manager");
    expect(payStage("final")).toBe("final");
    expect(payQuestions("recruiter", "Acme")[3].text).toMatch(/pay or the package/);
    expect(payQuestions("final", "Acme")[3].text).toMatch(/offer.*Acme/);
  });

  it("marks a researched range, said plainly, with room for the package", () => {
    const good = words("Based on my research into similar roles, I'm looking for between 55,000 and 60,000, and I'm open to discussing the whole package.");
    expect(ok(payChecks("pay1", good, "recruiter"))).toEqual([true, true, true, true]);
    const weak = words("Sorry, I don't know really, whatever you think is fair I guess.");
    expect(ok(payChecks("pay1", weak, "recruiter"))).toEqual([false, false, false, false]);
  });

  it("treats sharing your current pay as your choice, not a mistake", () => {
    const shared = payChecks("pay2", words("I'm on 48,000 at the moment, but I'm looking for 55,000 to 60,000 for this role."), "manager");
    expect(shared[0].ok).toBe(true);
    expect(shared[1]).toMatchObject({ label: "You shared your current pay", ok: null });
    const kept = payChecks("pay2", words("I'd rather focus on what I'm looking for, which is in line with the market for this role."), "manager");
    expect(kept[1]).toMatchObject({ label: "Kept your current pay to yourself", ok: null });
  });

  it("checks your question about the package against the round", () => {
    const bonus = words("Could you tell me how the bonus is structured, and what the pension contribution is?");
    expect(ok(payChecks("pay4", bonus, "final"))).toEqual([true, true, true]);
    // With the hiring manager, ask how pay is decided or when you'll discuss it.
    expect(payChecks("pay4", bonus, "manager")[1].ok).toBe(false);
    expect(payChecks("pay4", words("At what stage would we discuss the package, and how is pay reviewed here?"), "manager")[1].ok).toBe(true);
  });

  it("adds four pay questions once, never asks them in an interview, and plans the drill", async () => {
    const interview = ensurePayQuestions("halden")!;
    const pay = interview.questions.filter((q) => q.pay);
    expect(pay.map((q) => q.id)).toEqual(["pay1", "pay2", "pay3", "pay4"]);
    expect(interview.questions.at(-1)?.slot).toBe("closing");
    expect(ensurePayQuestions("halden")!.questions.filter((q) => q.pay)).toHaveLength(4);
    const picked = pickQuestions(interview.questions, { ...DEFAULT_SETTINGS, minutes: 60 }, new Map(), { allowRepeats: true });
    expect(picked.questionIds.some((id) => id.startsWith("pay"))).toBe(false);
    expect(drillQuestions({ kind: "pay" }, interview.questions, new Map(), [])).toEqual(["pay1", "pay2", "pay3", "pay4"]);
    const session = await planDrill("halden", { kind: "pay" });
    expect(session.questionIds).toEqual(["pay1", "pay2", "pay3", "pay4"]);
    // A different round rewrites the last question for it.
    updateInterview("halden", (i) => ({ ...i, round: "screening" }));
    expect(ensurePayQuestions("halden")!.questions.find((q) => q.id === "pay4")?.text).toMatch(/pay or the package/);
    expect(getInterview("halden")!.groupCounts.motivation).toBe(interview.groupCounts.motivation);
  });
});
