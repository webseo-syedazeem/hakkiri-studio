import { describe, expect, it } from "vitest";
import { auditText } from "./audit";

const NOW = new Date("2026-11-23T12:00:00Z");
const STRONG = `Fern Example
York · fern@example.com · 07700 900456 · linkedin.com/in/fern-example

Profile
Archive assistant caring for paper maps. Catalogued 3,200 maps in two years. Trained 40 volunteers to handle paper safely.

Experience
Archive assistant, Paper Kite Archive
Sep 2023 – Present
- Catalogued 3,200 maps in two years by rebuilding the intake process
- Wrote a 40-page handling guide used at every induction since March 2024
- Trained 40 volunteers to handle paper safely each term

Reading room assistant, Example City Library
Jun 2021 – Aug 2023
- Cut retrieval time from 3 days to 1 by re-shelving the reading room
- Scanned 600 glass negatives for the online collection in one summer
- Ran the monthly conservation audit across both stores for two years

Education
BA (Hons) History, Example University, 2018 – 2021

Skills
Cataloguing, handling, maps, volunteers, induction, intake
`;
const WEAK = `Sam Example

Experience
Assistant, Some Shop
- Responsible for various tasks
- Helped the team
- I was a hard-working team player
`;

describe("the free public check", () => {
  it("scores pasted text with the builder's own checks, and leaves the file checks pending", () => {
    const a = auditText(STRONG, "uk", NOW);
    expect(a.detail.groups.flatMap((g) => g.checks)).toHaveLength(35);
    // What pasted text cannot show (the page count, the file's layout and how it reads back) is pending, not assumed.
    expect(a.detail.groups.flatMap((g) => g.checks).filter((c) => c.state === "pending").map((c) => c.id)).toEqual(["page-count", "one-column", "body-type", "file-name", "real-text", "pdf-readback", "docx-readback"]);
    expect(a.pending).toBeGreaterThan(12);
    for (const pct of Object.values(a.subscores)) expect(pct).toBeLessThanOrEqual(100);
    expect(a.score).toBe(a.detail.shown);
    expect(a.score).toBeGreaterThan(55);
    // No finding about a file that does not exist yet.
    expect(a.findings.some((f) => /PDF|Word file|page count/i.test(f.problem))).toBe(false);
  });

  it("a few lines are not judged as a whole CV, and are never called good enough", () => {
    const short = auditText(STRONG.replace(/Reading room assistant[\s\S]*?two years\n/, ""), "uk", NOW);
    expect(short.detail.thin).toEqual({ have: 3, need: 6 });
    expect(short.isGoodEnough).toBe(false);
    expect(short.score).toBeLessThan(auditText(STRONG, "uk", NOW).score);
    // One line of text is nearly nothing, in every group: "readable by software" is not 100% of nothing.
    const one = auditText("Sam Example worked in a shop for a while doing various things for people", "uk", NOW);
    expect(one.subscores).toEqual({ evidence: 0, clarity: 0, structure: expect.any(Number), software: 0 });
    expect(one.score).toBeLessThan(5);
  });

  it("has no floor: a weak CV gets a low score, group by group", () => {
    const a = auditText(WEAK, "uk", NOW);
    const strong = auditText(STRONG, "uk", NOW);
    expect(a.score).toBeLessThan(45);
    expect(a.score).toBeLessThan(strong.score - 25);
    expect(a.subscores.evidence).toBeLessThan(50);
    expect(a.isGoodEnough).toBe(false);
    // A few lines with almost nothing in them score almost nothing.
    expect(auditText("Sam Example\nI worked in a shop for a while doing various things for people.", "uk", NOW).score).toBeLessThan(20);
  });

  it("gives each finding with the line it is about, most important first", () => {
    const a = auditText(WEAK, "uk", NOW);
    expect(a.findings.length).toBeGreaterThan(4);
    const duty = a.findings.find((f) => f.id.startsWith("duty-"))!;
    expect(duty).toMatchObject({ area: "clarity", quote: "Responsible for various tasks" });
    expect(duty.problem).toBe("“Responsible for” describes the job, not what you did in it.");
    expect(a.teaser).toEqual(a.findings.slice(0, 3).map((f) => f.id));
    // An email that is missing is an issue, and issues come first.
    expect(a.findings[0].severity).toBe("high");
  });

  it("is the same every time for the same text", () => {
    const plain = ({ detail: _detail, ...rest }: ReturnType<typeof auditText>) => JSON.stringify(rest);
    expect(plain(auditText(STRONG, "uk", NOW))).toBe(plain(auditText(STRONG, "uk", NOW)));
    expect(plain(auditText(WEAK, "uk", NOW))).toBe(plain(auditText(WEAK, "uk", NOW)));
  });

  it("asks interview questions about the person's own lines, the ones with figures first", () => {
    const a = auditText(STRONG, "uk", NOW);
    expect(a.interviewerQuestions[0].quote).toMatch(/\d/);
    for (const q of a.interviewerQuestions) expect(STRONG).toContain(q.quote);
  });

  it("uses the region's spelling", () => {
    const text = STRONG.replace("Catalogued 3,200 maps in two years by rebuilding", "Organized 3,200 maps in two years by rebuilding");
    expect(auditText(text, "uk", NOW).findings.some((f) => f.id.startsWith("spelling-"))).toBe(true);
    expect(auditText(text, "us", NOW).findings.some((f) => f.id.startsWith("spelling-"))).toBe(false);
  });
});
