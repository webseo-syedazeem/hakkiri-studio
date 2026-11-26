import { describe, expect, it } from "vitest";
import { fernCv } from "../render/testing";
import { type CvDoc, type EntrySection, type Requirement, type SkillsSection, newBullet } from "../schema";
import { assess, fitMaths, jobFit, keyTerms, keywords } from "./fit";
import { extractRequirements, manualRequirement } from "./requirements";

const ADVERT = `Collections Officer
Example Museum, York

About us
We are a small museum with big plans. We offer 28 days holiday and a pension.

The role
You will catalogue new acquisitions and answer enquiries from researchers.

Essential
- Experience cataloguing paper collections
- Knowledge of condition reporting
- Experience training volunteers
- A degree in history or equivalent experience

Desirable
- Experience with Spectrum
- Fluent French

How to apply
Send your CV and a cover letter by 1 December. We are an equal opportunities employer.`;

/** The sample CV, without its "Volunteer Trainer of the Year" line, so the tests below decide what shows volunteer training. */
const base = (requirements: Requirement[] = [], advert = ADVERT): CvDoc => {
  const cv = fernCv() as CvDoc;
  return { ...cv, sections: cv.sections.filter((s) => s.kind !== "achievements"), level: "experienced", accepted: [], changes: [], requirements, target: { title: "Collections officer", employer: "Example Museum", advert } };
};
const exp = (cv: CvDoc) => cv.sections.find((s) => s.kind === "experience") as EntrySection;
const req = (text: string, more: Partial<Requirement> = {}): Requirement => ({ ...manualRequirement(text), ...more });

describe("reading what an advert asks for", () => {
  const found = extractRequirements(ADVERT);

  it("keeps each requirement in the advert's own words", () => {
    for (const r of found) expect(ADVERT).toContain(r.quote);
    expect(found.map((r) => r.quote)).toEqual([
      "You will catalogue new acquisitions and answer enquiries from researchers.",
      "Experience cataloguing paper collections",
      "Knowledge of condition reporting",
      "Experience training volunteers",
      "A degree in history or equivalent experience",
      "Experience with Spectrum",
      "Fluent French",
    ]);
  });

  it("tells required from preferred by the heading it is under, and leaves duties unweighted", () => {
    expect(found.map((r) => r.priority)).toEqual(["preferred", "required", "required", "required", "required", "preferred", "preferred"]);
  });

  it("leaves out benefits, how to apply and the equal-opportunities line", () => {
    const all = found.map((r) => r.quote).join(" ");
    expect(all).not.toMatch(/holiday|pension|cover letter|equal opportunities|small museum/);
  });

  it("keeps “a degree or equivalent experience” as one requirement", () => {
    expect(found.filter((r) => /degree/.test(r.quote))).toHaveLength(1);
  });

  it("reads requirements out of running text, by what the sentence asks for", () => {
    const out = extractRequirements("We are hiring. You must have experience with Google Ads and a full driving licence. Ideally you will have knowledge of SQL. Our office has a dog.");
    expect(out.map((r) => [r.quote, r.priority])).toEqual([
      ["You must have experience with Google Ads and a full driving licence.", "required"],
      ["Ideally you will have knowledge of SQL.", "preferred"],
    ]);
  });

  it("does not repeat a requirement the advert says twice", () => {
    const out = extractRequirements("Essential\n- Experience training volunteers\n- Experience training volunteers.\n- Volunteers training experience");
    expect(out).toHaveLength(1);
  });

  it("finds nothing in an advert that asks for nothing", () => {
    expect(extractRequirements("Come and join us! We have a great team and free fruit.")).toEqual([]);
    expect(extractRequirements("")).toEqual([]);
  });
});

describe("whether the CV shows a requirement", () => {
  it("takes the words that say what is wanted, not the words every advert uses", () => {
    expect(keyTerms("Strong experience of cataloguing paper collections").map((t) => t.text)).toEqual(["cataloguing", "paper", "collections"]);
    expect(keyTerms("At least 5 years’ experience managing budgets over £1m").map((t) => t.text)).toEqual(["managing", "budgets"]);
  });

  it("is met when one line of the CV shows all of it", () => {
    const cv = base([req("Experience training volunteers")]);
    exp(cv).entries[0].bullets.push(newBullet("Trained 40 volunteers to handle paper safely each term"));
    const [row] = assess(cv);
    expect(row.status).toBe("met");
    expect(row.lines[0]).toMatchObject({ by: "match", kind: "bullet", text: "Trained 40 volunteers to handle paper safely each term" });
    expect(row.earned).toBe(2);
  });

  it("is partly met when the CV shows only some of it, and says which part is not covered", () => {
    const cv = base([req("Experience cataloguing photographs")]);
    const [row] = assess(cv);
    expect(row.status).toBe("partly");
    expect(row.covered).toEqual(["cataloguing"]);
    expect(row.uncovered).toEqual(["photographs"]);
    expect(row.note).toBe("Not covered: photographs");
    expect(row.earned).toBe(1);
    // Less than half of it shown is not "partly": it is missing.
    expect(assess(base([req("Experience cataloguing photographs and film")]))[0].status).toBe("missing");
  });

  it("is not met by words scattered across different lines", () => {
    const cv = base([req("Wrote reading-room guidance for volunteers")]);
    // "Wrote", "reading-room", "guidance" and "volunteers" are all on the CV, in different lines.
    expect(assess(cv)[0].status).toBe("partly");
    expect(assess(cv)[0].note).toBe("No single line shows all of this.");
  });

  it("a skill listed on its own is only partly met: nothing shows where it was used", () => {
    const cv = base([req("Experience with Excel")]);
    const [row] = assess(cv);
    expect(row.status).toBe("partly");
    expect(row.note).toBe("Listed as a skill. No line shows where you used it.");
    exp(cv).entries[0].bullets.push(newBullet("Tracked 3,200 catalogue records in Excel"));
    expect(assess(cv)[0].status).toBe("met");
  });

  it("is missing when nothing on the CV shows it", () => {
    const [row] = assess(base([req("Fluent Japanese")]));
    expect(row).toMatchObject({ status: "missing", earned: 0, lines: [], note: "No evidence in this version" });
  });

  it("stops counting a line once it is switched off", () => {
    const cv = base([req("Experience training volunteers")]);
    const b = newBullet("Trained 40 volunteers to handle paper safely each term");
    exp(cv).entries[0].bullets.push(b);
    expect(assess(cv)[0].status).toBe("met");
    b.visible = false;
    expect(assess(cv)[0].status).not.toBe("met");
  });

  it("takes the person's word for a line they linked, in different words from the advert", () => {
    const cv = base();
    const b = exp(cv).entries[0].bullets[0];
    const at = { section: exp(cv).id, entry: exp(cv).entries[0].id, field: b.id };
    cv.requirements = [req("Stakeholder management", { evidence: [at], judged: "met" })];
    const [row] = assess(cv);
    expect(row.status).toBe("met");
    expect(row.lines[0]).toMatchObject({ by: "you", text: b.text });
    cv.requirements = [req("Stakeholder management", { evidence: [at], judged: "partly", uncovered: "senior stakeholders" })];
    expect(assess(cv)[0]).toMatchObject({ status: "partly", note: "Not covered: senior stakeholders" });
    // The linked line is switched off: their judgement no longer has anything to stand on.
    b.visible = false;
    expect(assess(cv)[0].status).toBe("missing");
  });

  it("“No, I don’t have this” records a gap that stays in the total", () => {
    const cv = base([req("Experience training volunteers", { gap: true })]);
    exp(cv).entries[0].bullets.push(newBullet("Trained 40 volunteers to handle paper safely each term"));
    expect(assess(cv)[0]).toMatchObject({ status: "missing", earned: 0, weight: 2 });
  });
});

describe("job fit", () => {
  it("is earned weight over total weight: required 2, preferred 1; met full, partly half, missing nothing", () => {
    // The worked example in the design: two required met (4), one required partly met (1), two preferred missing (0): 5 of 8, shown as 63.
    const cv = base();
    const e = exp(cv).entries[0];
    e.bullets = [newBullet("Trained 40 volunteers to handle paper safely each term"), newBullet("Catalogued 3,200 paper maps in two years"), newBullet("Reported on the condition of new acquisitions")];
    cv.requirements = [req("Experience training volunteers"), req("Experience cataloguing paper maps"), req("Condition reporting for photographs"), req("Fluent Japanese", { priority: "preferred" }), req("Experience with Spectrum", { priority: "preferred" })];
    const fit = jobFit(cv);
    expect(fit.rows.map((r) => r.status)).toEqual(["met", "met", "partly", "missing", "missing"]);
    expect([fit.earned, fit.total, fit.score]).toEqual([5, 8, 63]);
    expect(fit.counts).toEqual({ met: 2, partly: 1, missing: 2 });
    expect(fitMaths(fit)).toBe("5 of 8 points: 2 required met (4), 1 required partly met (1), 2 preferred missing (0)");
  });

  it("has no floor: a CV that shows none of it scores 0", () => {
    const cv = base([req("Fluent Japanese"), req("Experience with Spectrum"), req("A pilot’s licence", { priority: "preferred" })]);
    expect(jobFit(cv).score).toBe(0);
  });

  it("has no score when the advert has nothing to assess", () => {
    expect(jobFit(base([]))).toMatchObject({ score: null, total: 0 });
  });

  it("is not raised by saying the same word many times", () => {
    const cv = base([req("Experience with Spectrum")]);
    const once = { ...cv, sections: structuredClone(cv.sections) };
    (once.sections.find((s) => s.kind === "experience") as EntrySection).entries[0].bullets.push(newBullet("Moved 3,200 records into Spectrum"));
    const many = { ...cv, sections: structuredClone(once.sections) };
    (many.sections.find((s) => s.kind === "experience") as EntrySection).entries[0].bullets.push(newBullet("Spectrum Spectrum Spectrum"), newBullet("Used Spectrum daily with Spectrum"));
    expect(jobFit(many).score).toBe(jobFit(once).score);
  });

  it("goes down, not just up: switching off the only evidence costs the points", () => {
    const cv = base([req("Experience training volunteers")]);
    const b = newBullet("Trained 40 volunteers to handle paper safely each term");
    exp(cv).entries[0].bullets = [b];
    expect(jobFit(cv).score).toBe(100);
    b.visible = false;
    expect(jobFit(cv).score).toBeLessThan(100);
  });
});

describe("the advert's own terms", () => {
  it("lists which are on the CV and which are not", () => {
    const cv = base([], "We need experience with Excel, Spectrum and condition reporting. Knowledge of TMS is desirable.");
    const k = keywords(cv);
    const by = Object.fromEntries(k.map((x) => [x.term, x.matched]));
    expect(by).toMatchObject({ Excel: true, Spectrum: false, "condition reporting": true, TMS: false });
  });

  it("does not count a skill that is switched off", () => {
    const cv = base([], "Experience with Excel.");
    for (const g of (cv.sections.find((s) => s.kind === "skills") as SkillsSection).groups) for (const s of g.skills) if (s.name === "Excel") s.visible = false;
    expect(keywords(cv).find((x) => x.term === "Excel")).toMatchObject({ matched: false, count: 0 });
  });

  it("is empty with no advert", () => {
    expect(keywords({ ...base(), target: undefined })).toEqual([]);
  });

  describe("CV-1: accurate advert extraction, priorities, and evidence ladder", () => {
    it("extracts 4 requirements from 'Essential: Google Ads, Tableau. Desirable: SQL, French' and fit is not 100 without Tableau", () => {
      const advert = "Essential: Google Ads, Tableau. Desirable: SQL, French";
      const reqs = extractRequirements(advert);
      expect(reqs).toHaveLength(4);
      expect(reqs.map((r) => r.text)).toEqual(["Google Ads", "Tableau", "SQL", "French"]);
      expect(reqs.filter((r) => r.priority === "required")).toHaveLength(2);
      expect(reqs.filter((r) => r.priority === "preferred")).toHaveLength(2);

      // CV has Google Ads, SQL, French, but NO Tableau
      const cv = base(reqs);
      exp(cv).entries[0].bullets = [
        newBullet("Managed Google Ads accounts driving £200k ARR"),
        newBullet("Wrote complex SQL queries to analyse relational datasets"),
        newBullet("Fluent French speaker handling EMEA partner discussions"),
      ];
      const fit = jobFit(cv);
      expect(fit.score).toBeLessThan(100);
      expect(fit.rows.find((r) => r.requirement.text === "Tableau")?.status).toBe("missing");
    });

    it("meets '3+ years of PPC' from role titles and dates using synonyms (Paid Search)", () => {
      const reqs = extractRequirements("Must have 3+ years of PPC experience.");
      expect(reqs.length).toBeGreaterThanOrEqual(1);

      const cv = base(reqs);
      // Maya's experience: 2 roles totalling 4 years
      exp(cv).entries = [
        {
          id: "e1",
          visible: true,
          title: "Paid Search Manager",
          org: "Agency A",
          orgInfo: "",
          location: "",
          subject: "",
          grade: "",
          link: "",
          start: "2022-01",
          end: "2024-01",
          current: false,
          bullets: [newBullet("Led client search strategy across Google Ads")],
        },
        {
          id: "e2",
          visible: true,
          title: "PPC Specialist",
          org: "Agency B",
          orgInfo: "",
          location: "",
          subject: "",
          grade: "",
          link: "",
          start: "2020-01",
          end: "2022-01",
          current: false,
          bullets: [newBullet("Managed search campaigns")],
        },
      ];
      const fit = jobFit(cv);
      expect(fit.score).toBeGreaterThanOrEqual(60);
      const ppcRow = fit.rows.find((r) => r.requirement.text.toLowerCase().includes("ppc"));
      expect(ppcRow?.status).toBe("met");
    });

    it("never shows stop words under uncovered", () => {
      const reqs = extractRequirements("You will have experience with nice clean code and solid testing.");
      const cv = base(reqs);
      const fit = jobFit(cv);
      for (const row of fit.rows) {
        expect(row.uncovered).not.toContain("you");
        expect(row.uncovered).not.toContain("you'll");
        expect(row.uncovered).not.toContain("nice");
        expect(row.uncovered).not.toContain("have");
      }
    });
  });
});
