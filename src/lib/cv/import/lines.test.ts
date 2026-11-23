import { describe, expect, it } from "vitest";
import { findHeadings, knownHeading, standardHeading } from "./headings";
import { cleanText, linesFromText, makeLine, splitBullet, splitNumbered, titleCase } from "./lines";

describe("lines of a file", () => {
  it.each(["• Ran the account", "- Ran the account", "– Ran the account", "* Ran the account", "▪ Ran the account", "➢ Ran the account", "o Ran the account", " Ran the account", "· Ran the account"])("takes the bullet mark off: %s", (raw) => {
    expect(splitBullet(raw)).toEqual({ bullet: true, text: "Ran the account" });
  });

  it("does not mistake ordinary starts for bullets", () => {
    expect(splitBullet("on-site support for 40 users").bullet).toBe(false);
    expect(splitBullet("-5% churn in a year").bullet).toBe(false);
    expect(splitBullet("Operations Coordinator").bullet).toBe(false);
    expect(splitBullet("of the year").bullet).toBe(false);
  });

  it("reads numbered lists", () => {
    expect(splitNumbered("1. Ran the account")).toEqual({ bullet: true, text: "Ran the account" });
    expect(splitNumbered("2) Ran the account")).toEqual({ bullet: true, text: "Ran the account" });
    expect(splitNumbered("2019 was a good year").bullet).toBe(false);
  });

  it("tidies text without changing what it says", () => {
    expect(cleanText("efﬁcient workﬂow")).toBe("efficient workflow");
    expect(cleanText("budget of £1.2m")).toBe("budget of £1.2m");
    expect(cleanText("co­ordinator​")).toBe("coordinator");
    expect(cleanText("  Café   Zoë – naïve  ")).toBe("Café Zoë – naïve");
    expect(cleanText("“quoted” and ‘single’")).toBe("\"quoted\" and 'single'");
    expect(cleanText("€40k / £35k / $50k / 18%")).toBe("€40k / £35k / $50k / 18%");
  });

  it("writes a name in capitals the usual way", () => {
    expect(titleCase("MAYA CHEN")).toBe("Maya Chen");
    expect(titleCase("ANNE-MARIE O'NEIL")).toBe("Anne-Marie O'Neil");
  });

  it("turns pasted text into lines, dropping blank ones and marking bullets", () => {
    const lines = linesFromText("Maya Chen\n\n  • Ran the account\r\n1. Second\nTitle      2019 – 2021\n");
    expect(lines.map((l) => [l.text, l.bullet])).toEqual([
      ["Maya Chen", false],
      ["Ran the account", true],
      ["Second", true],
      ["Title\t2019 – 2021", false],
    ]);
  });
});

describe("section headings", () => {
  it.each([
    ["EXPERIENCE", "experience"],
    ["Work Experience", "experience"],
    ["Employment History:", "experience"],
    ["Career History", "experience"],
    ["Education & Qualifications", "education"],
    ["Key Skills", "skills"],
    ["Core Competencies", "skills"],
    ["Personal Statement", "summary"],
    ["Profile", "summary"],
    ["About Me", "summary"],
    ["Certifications", "certificates"],
    ["Licences & Certifications", "certificates"],
    ["Voluntary Work", "volunteering"],
    ["Positions of Responsibility", "volunteering"],
    ["Honors & Awards", "awards"],
    ["Hobbies and Interests", "interests"],
    ["Languages", "languages"],
    ["Publications", "publications"],
    ["Relevant Coursework", "courses"],
    ["Projects", "projects"],
    ["Contact Details", "contact"],
    ["References", "references"],
    ["Curriculum Vitae", "title"],
    ["Additional Information", "custom"],
  ])("%s → %s", (text, kind) => expect(knownHeading(text)).toBe(kind));

  it.each(["Education Officer", "Experienced in SQL", "Skills for Care Ltd", "Managed projects", "Summary of the year’s results for the board"])("is not a heading: %s", (text) => expect(knownHeading(text)).toBeNull());

  it("reads “Skills: SQL, Python” as a heading with its content", () => {
    expect(standardHeading(makeLine("Skills: SQL, Python"))).toMatchObject({ kind: "skills", inline: "SQL, Python" });
    // A sentence is not a heading, even if it starts with a heading word.
    expect(standardHeading(makeLine("Experience: five years in retail"))).toBeNull();
    expect(standardHeading(makeLine("Education", { bullet: true }))).toBeNull();
  });

  it("an ordinary word that is also a heading name counts only when it looks like the other headings", () => {
    const plainList = linesFromText("Jo Bloggs\nSKILLS\nLeadership\nResearch\nTraining\nEDUCATION\nBSc Maths");
    expect([...findHeadings(plainList).values()].map((h) => h.title)).toEqual(["SKILLS", "EDUCATION"]);
    const styled = linesFromText("Jo Bloggs\nSKILLS\nSQL\nLEADERSHIP\nCaptain of the hockey club\nEDUCATION\nBSc Maths");
    expect([...findHeadings(styled).values()].map((h) => h.kind)).toEqual(["skills", "volunteering", "education"]);
  });

  it("inside a skills section, “Tools: Excel” is a group of skills, not a new section", () => {
    const lines = linesFromText("Jo Bloggs\nSKILLS\nTools: Excel, SQL\nLanguages: French, German\nEDUCATION\nBSc Maths");
    expect([...findHeadings(lines).values()].map((h) => h.title)).toEqual(["SKILLS", "EDUCATION"]);
  });

  it("takes an unfamiliar heading as a section when it looks exactly like the standard ones", () => {
    const lines = [makeLine("Jo Bloggs", { size: 20, bold: true }), makeLine("Experience", { size: 14, bold: true }), makeLine("Analyst, Acme Ltd, 2019 – 2021", { size: 11 }), makeLine("Security Clearance", { size: 14, bold: true }), makeLine("SC cleared until 2027", { size: 11 }), makeLine("Education", { size: 14, bold: true }), makeLine("BSc Maths, University of York, 2019", { size: 11 })];
    const found = [...findHeadings(lines).values()];
    expect(found.map((h) => [h.kind, h.title, h.known])).toEqual([
      ["experience", "Experience", true],
      ["custom", "Security Clearance", false],
      ["education", "Education", true],
    ]);
  });
});
