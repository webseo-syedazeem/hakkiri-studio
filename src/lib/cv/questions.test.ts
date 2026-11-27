import { describe, expect, it } from "vitest";
import { isEntrySection } from "./schema";
import { instantiateTemplate } from "./templates/examples";
import { probedClaims, questionAbout } from "./questions";

const chloe = () => instantiateTemplate({ id: "marketing-lead", title: "Chloe", region: "uk" }, "usr_q");

describe("Questions your CV will get", () => {
  it("picks five lines from the CV, as written, most likely to be asked about first", () => {
    const cv = chloe();
    const claims = probedClaims(cv);
    expect(claims).toHaveLength(5);
    const lines = cv.sections.filter(isEntrySection).flatMap((s) => s.entries.flatMap((e) => e.bullets.map((b) => b.text)));
    for (const c of claims) expect(lines).toContain(c.text);
    expect(new Set(claims.map((c) => c.text)).size).toBe(5);
    // A number is what an interviewer asks about first.
    expect(claims[0].question).toMatch(/£|%|\d/);
  });

  it("asks only about what the line says: its own number, its own work", () => {
    expect(questionAbout("Grew qualified leads by 52% in a year by rebuilding the 6 main landing pages")).toContain("52%");
    expect(questionAbout("Manage a £1.5 million yearly budget for Google Ads")).toContain("£1.5 million");
    expect(questionAbout("Lead a team of 3 marketers and 2 agencies")).toMatch(/leading/);
    expect(questionAbout("Worked with the design team to rebuild the checkout")).toMatch(/own part/);
  });

  it("leaves out lines switched off in this version, and has nothing to ask of an empty CV", () => {
    const cv = chloe();
    const first = probedClaims(cv)[0];
    for (const s of cv.sections) if (isEntrySection(s)) for (const e of s.entries) for (const b of e.bullets) if (b.id === first.at.field) b.visible = false;
    expect(probedClaims(cv).map((c) => c.text)).not.toContain(first.text);
    expect(probedClaims({ sections: [] })).toEqual([]);
  });
});
