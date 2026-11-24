import { describe, expect, it } from "vitest";
import { fernCv } from "../render/testing";
import { type CvDoc, type EntrySection, type Requirement, type SummarySection, newBullet } from "../schema";
import { assess, jobFit, keywords } from "./fit";
import { extractRequirements, manualRequirement, readingNote } from "./requirements";

/**
 * Job fit, attacked: it must not rise because the advert's words were pasted
 * into the profile or written into lines that say the person does NOT have
 * them. And ordinary adverts (one long paragraph, bullets with no headings)
 * must be read well enough to give an honest number.
 */

const req = (text: string, more: Partial<Requirement> = {}): Requirement => ({ ...manualRequirement(text), ...more });
/** The sample CV with nothing the museum advert asks for in its lines. */
function plain(requirements: Requirement[], advert = ""): CvDoc {
  const cv = fernCv() as CvDoc;
  const sections = cv.sections.filter((s) => s.kind === "summary" || s.kind === "experience" || s.kind === "education" || s.kind === "skills");
  const exp = sections.find((s) => s.kind === "experience") as EntrySection;
  exp.entries = [exp.entries[1]];
  exp.entries[0].bullets = [newBullet("Served customers and handled the till")];
  (sections.find((s) => s.kind === "summary") as SummarySection).text = "";
  // No skills listed either: nothing on this CV has anything to do with the advert.
  const skills = sections.find((s) => s.kind === "skills");
  if (skills?.kind === "skills") skills.groups = [{ id: "g_plain001", name: "", visible: true, skills: [] }];
  return { ...cv, sections, level: "experienced", accepted: [], changes: [], requirements, target: { title: "Collections officer", employer: "Example Museum", advert } };
}
const summary = (cv: CvDoc) => cv.sections.find((s) => s.kind === "summary") as SummarySection;
const experience = (cv: CvDoc) => cv.sections.find((s) => s.kind === "experience") as EntrySection;

const ASKS = [req("Experience cataloguing museum collections using Spectrum"), req("Experience managing a team of volunteers"), req("Fluent French", { priority: "preferred" })];

describe("job fit cannot be raised by stuffing", () => {
  it("starts honest: a CV that shows none of it scores 0", () => {
    expect(jobFit(plain(ASKS)).score).toBe(0);
  });

  it("the advert's words pasted into the profile do not make anything Met", () => {
    const cv = plain(ASKS);
    summary(cv).text = "Experience cataloguing museum collections using Spectrum. Experience managing a team of volunteers. Fluent French.";
    const fit = jobFit(cv);
    expect(fit.rows.map((r) => r.status)).toEqual(["partly", "partly", "partly"]);
    expect(fit.rows[0].note).toBe("Said in your profile. No line shows where you did it.");
    expect(fit.score).toBe(50);
    // And all of it in one run-on profile sentence is no better.
    summary(cv).text = "Cataloguing museum collections using Spectrum, managing a team of volunteers, fluent French";
    expect(jobFit(cv).rows.every((r) => r.status !== "met")).toBe(true);
  });

  it("lines that say the person does NOT have something show nothing", () => {
    const cv = plain(ASKS);
    experience(cv).entries[0].bullets.push(newBullet("No experience of cataloguing museum collections using Spectrum"), newBullet("Have not managed a team of volunteers"), newBullet("Never learned fluent French"));
    expect(jobFit(cv).score).toBe(0);
    expect(assess(cv).map((r) => r.status)).toEqual(["missing", "missing", "missing"]);
  });

  it("a real line that shows it still counts in full", () => {
    const cv = plain(ASKS);
    experience(cv).entries[0].bullets.push(newBullet("Catalogued museum collections using Spectrum for two years"));
    expect(assess(cv)[0].status).toBe("met");
  });
});

describe("a qualification is evidence", () => {
  it("a degree on the CV shows “a degree in … or a related subject”", () => {
    const cv = plain([req("A degree in marine biology, ecology or a related subject")]);
    const edu = cv.sections.find((s) => s.kind === "education") as EntrySection;
    edu.entries[0] = { ...edu.entries[0], title: "BSc (Hons)", subject: "Marine Biology" };
    const [row] = assess(cv);
    expect(row.status).toBe("met");
    expect(row.lines[0]).toMatchObject({ kind: "item", by: "match" });
    expect(row.lines[0].text).toContain("Marine Biology");
    // A degree in something else is only part of it.
    edu.entries[0] = { ...edu.entries[0], subject: "History" };
    expect(assess(cv)[0].status).not.toBe("met");
  });

  it("any one of the choices an advert offers is enough", () => {
    const cv = plain([req("Experience with Google Ads or Meta")]);
    experience(cv).entries[0].bullets.push(newBullet("Ran Meta campaigns for six retail clients"));
    expect(assess(cv)[0].status).toBe("met");
  });
});

describe("ordinary adverts are read", () => {
  const PARAGRAPH =
    "Procurement Manager – Northfield Furniture Ltd, Leeds. We are a growing maker of café and restaurant furniture and we are looking for a Procurement Manager to join our operations team; you will manage supplier contracts across Europe and you will lead a team of three buyers, and the successful candidate must have experience renegotiating supplier contracts and at least five years' experience in manufacturing procurement, you should also have experience with SAP and strong Excel skills, a CIPS qualification would be an advantage as would fluent German, we offer 25 days holiday, a pension and free parking, salary £55,000 – £60,000 depending on experience, to apply send your CV and a cover letter to jobs@northfield.example by 12 December, we are an equal opportunities employer & welcome applications from everyone.";

  it("an advert that is one long paragraph, a clause at a time", () => {
    const found = extractRequirements(PARAGRAPH);
    const quotes = found.map((r) => r.quote);
    for (const q of quotes) expect(PARAGRAPH).toContain(q);
    expect(quotes).toContain("the successful candidate must have experience renegotiating supplier contracts and at least five years' experience in manufacturing procurement");
    expect(quotes).toContain("you should also have experience with SAP and strong Excel skills");
    expect(found.find((r) => r.quote.startsWith("a CIPS qualification"))?.priority).toBe("preferred");
    // What the job involves is offered at the lighter weight.
    expect(found.find((r) => r.quote === "you will manage supplier contracts across Europe")?.priority).toBe("preferred");
    expect(quotes.join(" ")).not.toMatch(/holiday|pension|parking|salary|cover letter|equal opportunities/);
    expect(found.length).toBeGreaterThanOrEqual(5);
  });

  const BULLETS = `• Plan and schedule daily routes for 60 drivers
• Reduce late deliveries and report on-time performance weekly
• Train and supervise a team of transport coordinators
• Strong Microsoft Excel
• Experience with Paragon routing software
• Full UK driving licence
• CPC qualification preferred
• 33 days holiday including bank holidays
• Free on-site parking`;

  it("an advert that is only bullet points, with no headings", () => {
    const found = extractRequirements(BULLETS);
    expect(found.map((r) => r.quote)).toEqual(["Plan and schedule daily routes for 60 drivers", "Reduce late deliveries and report on-time performance weekly", "Train and supervise a team of transport coordinators", "Strong Microsoft Excel", "Experience with Paragon routing software", "Full UK driving licence", "CPC qualification preferred"]);
    // What it plainly asks for is required; the rest is offered at the lighter weight for the person to correct.
    expect(found.find((r) => r.quote === "Experience with Paragon routing software")?.priority).toBe("required");
    expect(found.find((r) => r.quote === "Plan and schedule daily routes for 60 drivers")?.priority).toBe("preferred");
  });

  it("says when the reading may be incomplete", () => {
    expect(readingNote(BULLETS, 7)).toContain("no headings");
    expect(readingNote(PARAGRAPH, 6)).toContain("no headings");
    expect(readingNote("Essential\n- Experience training volunteers\n- Knowledge of condition reporting\n- A degree in history", 3)).toBe("");
    expect(readingNote("", 0)).toBe("");
  });
});

describe("the advert's own terms", () => {
  it("leave out the employer, the place it is in and the words “CV” and “cover letter”", () => {
    const cv = plain([], "Procurement Manager\nNorthfield Furniture Ltd, Leeds\n\nEssential\n- Experience with SAP and Tableau\n- Strong Microsoft Excel\n\nSend your CV and a Cover Letter to us.");
    cv.target = { ...cv.target!, employer: "Northfield Furniture Ltd" };
    const terms = keywords(cv).map((k) => k.term);
    expect(terms).toContain("SAP");
    for (const not of ["Northfield Furniture", "Northfield Furniture Ltd", "Leeds", "CV", "Cover Letter"]) expect(terms).not.toContain(not);
  });

  it("“Strong Microsoft Excel” is matched by “Microsoft Excel” on the CV", () => {
    const cv = plain([], "Essential\n- Strong Microsoft Excel\n- Experience with Paragon");
    const skills = cv.sections.find((s) => s.kind === "skills");
    if (skills?.kind !== "skills") throw new Error("no skills");
    skills.groups[0].skills.push({ id: "k_msexcel01", name: "Microsoft Excel", visible: true });
    const found = keywords(cv);
    expect(found.find((k) => /Microsoft Excel/.test(k.term))).toMatchObject({ term: "Microsoft Excel", matched: true });
  });
});
