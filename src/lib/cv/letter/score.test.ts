import { describe, expect, it } from "vitest";
import { copiedRuns, letterParts, linesToLetter, requirementsCovered, scoreLetter } from "./score";

const NOW = new Date("2026-11-01T10:00:00Z");

const CV = `Priya Shah
priya.shah@example.com · 07700 900123 · Leeds

Experience
Marketing Manager, Kinetix Home, Leeds
Mar 2021 – Present
- Grew qualified leads by 52% in a year by rebuilding the email programme
- Led a team of 4 across email, social and paid search
- Cut cost per lead from £38 to £21 by moving budget to search

Marketing Executive, Brightwater Foods, York
Jun 2018 – Feb 2021
- Ran 30 product launch campaigns across email and social
- Wrote the monthly newsletter for 40,000 customers

Education
BA Marketing, University of Leeds, 2018

Skills
Email marketing, Google Ads, HubSpot, copywriting, reporting`;

const ADVERT = `Head of Growth Marketing
Fernbrook Outdoor, Brighton (hybrid)

Fernbrook Outdoor makes camping and walking gear and sells online across the UK.

What you'll need
- Experience leading a small marketing team
- A track record of growing qualified leads through email marketing
- Confidence managing paid search budgets
- Strong reporting skills and comfort presenting results to the board
- Experience with HubSpot or a similar CRM`;

const GOOD = `Priya Shah
priya.shah@example.com

Dear Ms Patel,

I am applying for the Head of Growth Marketing role at Fernbrook Outdoor. I want to work for a brand whose gear I already use on the Yorkshire Dales, and I am keen to grow its online sales.

At Kinetix Home I lead a team of 4 across email, social and paid search. In a year we grew qualified leads by 52% by rebuilding the email programme in HubSpot. I report results to our directors each month.

I also cut our cost per lead from £38 to £21 by moving budget to paid search. Before that, at Brightwater Foods, I ran 30 product launch campaigns and wrote the newsletter for 40,000 customers.

I would bring the same habits to Fernbrook: test small, measure what changes, and keep what works. I would welcome the chance to talk about your plans for next season.

Thank you for your time and consideration of my application for this role.

Yours sincerely,
Priya Shah`;

const WEAK = `Dear Sir or Madam

I am writing to express my interest in this exciting opportunity. I am a results-driven, passionate professional who thrives in fast-paced environments and I leverage my extensive skill set in order to deliver very real value to all stakeholders across a wide range of different areas and functions in the business, which I believe makes me a strong fit.

I managed a team of 12 at Google and doubled revenue in six months.`;

describe("letterParts", () => {
  it("separates the greeting, the body and the sign-off, leaving out the address and the name", () => {
    const p = letterParts(GOOD);
    expect(p.greeting).toBe("Dear Ms Patel,");
    expect(p.signoff).toBe("Yours sincerely,");
    expect(p.paragraphs).toHaveLength(5);
    expect(p.paragraphs[0]).toMatch(/^I am applying/);
    expect(p.paragraphs.join(" ")).not.toMatch(/priya\.shah@example\.com|Priya Shah$/);
  });

  it("reads a letter pasted with no blank lines between paragraphs", () => {
    const p = letterParts(GOOD.replace(/\n\n/g, "\n"));
    expect(p.greeting).toBe("Dear Ms Patel,");
    expect(p.paragraphs.length).toBeGreaterThanOrEqual(5);
  });
});

describe("copiedRuns", () => {
  it("finds runs of eight or more words taken from the advert, and nothing shorter", () => {
    expect(copiedRuns("I have a track record of growing qualified leads through email marketing at Kinetix.", ADVERT)).toEqual(["a track record of growing qualified leads through email marketing"]);
    expect(copiedRuns("I grew qualified leads through email.", ADVERT)).toEqual([]);
  });
});

describe("requirementsCovered", () => {
  it("counts the requirements the letter speaks to by their own words", () => {
    const c = requirementsCovered(letterParts(GOOD).paragraphs.join(" "), ADVERT);
    expect(c.total).toBeGreaterThanOrEqual(5);
    expect(c.covered).toBeGreaterThanOrEqual(3);
  });
});

describe("scoreLetter", () => {
  it("scores a specific, grounded letter well, in four parts of 25", () => {
    const s = scoreLetter(GOOD, { region: "uk", cvText: CV, advert: ADVERT, now: NOW });
    expect(s.parts.map((p) => [p.name, p.points])).toEqual([
      ["Relevance", 25],
      ["Clarity", 25],
      ["Structure", 25],
      ["Evidence", 25],
    ]);
    expect(s.parts.every((p) => p.pending === 0)).toBe(true);
    expect(s.shown).toBeGreaterThanOrEqual(80);
    expect(s.checks.find((c) => c.id === "claims")!.state).toBe("ok");
    expect(s.checks.find((c) => c.id === "copied")!.state).toBe("ok");
    expect(s.checks.find((c) => c.id === "greeting")!.state).toBe("ok");
  });

  it("finds what is wrong with a vague letter and says where", () => {
    const s = scoreLetter(WEAK, { region: "uk", cvText: CV, advert: ADVERT, now: NOW });
    expect(s.shown).toBeLessThan(60);
    expect(s.checks.find((c) => c.id === "greeting")!.detail).toBe("No sign-off found.");
    expect(s.checks.find((c) => c.id === "ai")!.items.length).toBeGreaterThanOrEqual(2);
    // Google and doubling revenue are nowhere on the CV.
    expect(s.checks.find((c) => c.id === "claims")!.items).toContain("I managed a team of 12 at Google and doubled revenue in six months.");
    expect(s.findings.some((f) => f.part === "clarity" && /over 40 words/.test(f.why))).toBe(true);
    expect(s.findings.some((f) => f.part === "structure" && /paragraph/.test(f.why))).toBe(true);
  });

  it("leaves out what needs the advert or the CV when they are not given, instead of failing it", () => {
    const s = scoreLetter(GOOD, { region: "uk", now: NOW });
    expect(s.parts.find((p) => p.id === "relevance")!.pending).toBe(15);
    expect(s.parts.find((p) => p.id === "evidence")!.pending).toBe(10);
    expect(s.checks.find((c) => c.id === "copied")).toMatchObject({ state: "not-checked", detail: "Job advert not provided." });
    expect(s.checks.find((c) => c.id === "claims")!.state).toBe("not-checked");
    // Out of what could be checked: the same letter does not score lower for a missing advert.
    expect(s.shown).toBeGreaterThanOrEqual(80);
  });

  it("asks for a US sign-off on a US letter", () => {
    const s = scoreLetter(WEAK, { region: "us", now: NOW });
    expect(s.findings.find((f) => f.why === "There is no sign-off.")!.todo).toMatch(/Sincerely/);
  });

  it("gives nothing for text with no letter in it", () => {
    expect(scoreLetter("Priya Shah\n07700 900123", { region: "uk", now: NOW }).shown).toBe(0);
  });
});

describe("linesToLetter", () => {
  it("puts the printed lines of a PDF back into paragraphs", () => {
    const lines = [
      "Dear Ms Patel,",
      "I am applying for the Head of Growth Marketing role at Fernbrook Outdoor. I want to work",
      "for a brand whose gear I already use, and I am keen to grow its online sales across the",
      "country.",
      "At Kinetix Home I lead a team of 4 across email, social and paid search. In a year we grew",
      "qualified leads by 52% by rebuilding the email programme.",
      "Yours sincerely,",
      "Priya Shah",
    ];
    const p = letterParts(linesToLetter(lines));
    expect(p.greeting).toBe("Dear Ms Patel,");
    expect(p.paragraphs).toHaveLength(2);
    expect(p.signoff).toBe("Yours sincerely,");
  });
});
