import { describe, expect, it } from "vitest";
import { claimHash, claimQuestion, claimTopic, cvClaims, parseClaimQuestionId, claimQuestionId } from "./claims";

const cv = (lines: string[]) => ({
  sections: [{ id: "s1", kind: "experience", visible: true, title: "", entries: [{ id: "e1", visible: true, title: "Marketing Manager", org: "Kinetix Home", orgInfo: "", location: "", start: "2021-05", end: "", current: true, subject: "", grade: "", link: "", bullets: lines.map((text, i) => ({ id: `b${i}x`, text, visible: true, origin: "typed", sources: [] })) }] }],
}) as never;

describe("Questions your CV will get (design spec v3 §04)", () => {
  it("quotes each claim exactly and asks only about what it says", () => {
    const lines = [
      "Manage a £1.5 million yearly budget for Google Ads, returning £4.10 in sales for every £1 spent",
      "Grew qualified leads by 52% in a year by rebuilding the 6 main landing pages",
      "Lead a team of 3 marketers and 2 agencies, with campaigns reviewed every week",
      "Raised the checkout conversion rate from 2.1% to 3.4% through 40 tests",
      "Answered the phones",
    ];
    const claims = cvClaims(cv(lines));
    expect(claims.map((c) => c.text)).not.toContain("Answered the phones");
    for (const c of claims) expect(lines).toContain(c.text);
    expect(claimQuestion(lines[0])).toBe("How did you decide where the £1.5 million went, and how did you measure what it returned?");
    expect(claimQuestion(lines[1])).toBe("What did you change to get 52%, and how did you establish that your work drove it?");
    expect(claimQuestion(lines[2])).toMatch(/^How do you lead the team of 3 marketers and 2 agencies/);
    expect(claimTopic(lines[3])).toBe("Conversion improvement");
  });

  it("shows only the claims there are (at most five), strongest first", () => {
    expect(cvClaims(cv(["Ran email campaigns that added £240,000 in revenue."])).length).toBe(1);
    expect(cvClaims(cv(Array.from({ length: 8 }, (_, i) => `Grew sales by ${10 + i}% across ${i + 2} regions`))).length).toBe(5);
  });

  it("ties practice to the line's exact wording", () => {
    const id = claimQuestionId("cv_0123456789abcdef", { id: "b_9_x", hash: claimHash("Grew leads by 52%") }, 3);
    expect(parseClaimQuestionId(id)).toEqual({ cvId: "cv_0123456789abcdef", claimId: "b_9_x", hash: claimHash("grew   leads by 52%") });
    expect(claimHash("Grew leads by 52%")).not.toBe(claimHash("Grew leads by 50%"));
  });
});
