import { describe, expect, it } from "vitest";
import { newCv } from "../access";
import { fernCv } from "../render/testing";
import { type CvDoc, type EntrySection, type SkillsSection, type SummarySection, emptySection, newBullet } from "../schema";
import { bigClaim, buzzwords, dutyLead, filler, firstPerson, fragment, hasContext, hasOutcome, hasScale, passive, presentLead, unclearContribution, unexplainedAcronyms, validEmail, validLink, validPhone, weakLead, wrongRegionSpelling } from "./detect";
import { CHECKS, GROUPS, type Score, type ScoreInput, gapsIn, scoreCv } from "./score";

const NOW = new Date("2026-11-23T12:00:00Z");
const base = (): CvDoc => ({ ...(fernCv() as CvDoc), level: "experienced", accepted: [] });
const exp = (cv: CvDoc) => cv.sections.find((s) => s.kind === "experience") as EntrySection;
const run = (cv: CvDoc, more: Partial<ScoreInput> = {}): Score => scoreCv({ cv, now: NOW, pages: 1, missingGlyphs: [], files: { pdf: "checked", docx: "checked" }, ...more });
const check = (s: Score, id: string) => s.groups.flatMap((g) => g.checks).find((c) => c.id === id)!;
/** A CV whose only bullets are the ones given, under one current role. */
function withBullets(texts: string[], change?: (cv: CvDoc) => void): CvDoc {
  const cv = base();
  cv.sections = cv.sections.filter((s) => ["summary", "experience", "skills"].includes(s.kind));
  const e = exp(cv);
  e.entries = [{ ...e.entries[0], orgInfo: "", bullets: texts.map((t) => newBullet(t)) }];
  change?.(cv);
  return cv;
}
const found = (cv: CvDoc, id: string) => check(run(cv), id).findings;

describe("the shape of the score", () => {
  it("has 35 checks in four groups that add up to 100", () => {
    expect(CHECKS).toHaveLength(35);
    expect(GROUPS.map((g) => [g.id, g.points])).toEqual([["evidence", 45], ["clarity", 20], ["structure", 20], ["software", 15]]);
    for (const g of GROUPS) expect(CHECKS.filter((c) => c.group === g.id).reduce((n, c) => n + c.weight, 0), g.id).toBe(g.points);
    expect(CHECKS.filter((c) => c.group === "evidence").map((c) => c.weight)).toEqual([10, 9, 8, 5, 6, 5, 2]);
    expect(CHECKS.find((c) => c.id === "punctuation")!.weight).toBe(1);
  });

  it("an empty CV has no score, no findings and no floor", () => {
    const cv = { ...newCv("u", { name: "x", level: "experienced", region: "uk", targetTitle: "", targetEmployer: "", targetAdvert: "" }, NOW.toISOString()) };
    const s = scoreCv({ cv, now: NOW });
    expect(s).toMatchObject({ empty: true, total: 0, shown: 0, findings: [], gaps: [], goodEnough: false });
  });

  it("each group's checks are worth exactly the group's points, whatever does not apply", () => {
    for (const cv of [base(), withBullets(["Ran the till"]), withBullets([], (c) => (c.contact.phone = ""))]) {
      const s = run(cv);
      for (const g of s.groups) expect(Math.round(g.checks.reduce((n, c) => n + c.points, 0)), g.id).toBe(g.points);
      expect(s.total).toBeLessThanOrEqual(100);
      // Each group is rounded to a tenth for display; the total is rounded once, from the exact sum.
      expect(Math.abs(s.total - s.groups.reduce((n, g) => n + g.earned, 0))).toBeLessThanOrEqual(0.2);
    }
  });

  it("a check that does not apply hands its weight to the rest of its group", () => {
    const cv = base();
    const withPhone = run(cv);
    cv.contact.phone = "";
    const without = run(cv);
    expect(check(without, "phone").state).toBe("na");
    expect(check(without, "phone").points).toBe(0);
    expect(check(without, "name").points).toBeGreaterThan(check(withPhone, "name").points);
    expect(without.groups.find((g) => g.id === "structure")!.points).toBe(20);
  });

  it("a per-item check earns in proportion to the items that pass", () => {
    const s = run(withBullets(["Cut late orders by 12% over the year", "Looked after the stock room", "Ran the till", "Wrote the rota each week"]));
    const c = check(s, "outcome");
    expect([c.passed, c.total, c.unit]).toEqual([2, 4, "bullets"]);
    expect(c.earned).toBeCloseTo(c.points / 2, 1);
    expect(c.findings).toHaveLength(2);
    // What each finding is worth adds back up to what the check lost.
    expect(c.findings.reduce((n, f) => n + f.points, 0)).toBeCloseTo(c.points - c.earned, 0);
  });

  it("file checks that have not run are pending, neither earned nor lost", () => {
    const s = run(base(), { files: {} });
    expect(check(s, "pdf-readback")).toMatchObject({ state: "pending", earned: 0, points: 3 });
    expect(s.pending).toBe(6);
    const done = run(base());
    expect(done.pending).toBe(0);
    expect(done.total).toBeCloseTo(s.total + 6, 1);
    expect(check(run(base(), { files: { pdf: "loss", docx: "checked" } }), "pdf-readback")).toMatchObject({ state: "scored", earned: 0 });
  });

  it("is good enough at 85, and not before", () => {
    const strong = withBullets(
      ["Catalogued 3,200 maps in two years by rebuilding the intake process", "Wrote a 40-page handling guide used at every induction since March 2024", "Trained 40 volunteers to handle paper safely each term", "Cut retrieval time from 3 days to 1 by re-shelving the reading room"],
      (c) => {
        (c.sections.find((s) => s.kind === "skills") as SkillsSection).groups = [{ id: "g_1", name: "", visible: true, skills: ["Cataloguing", "handling", "maps", "volunteers", "induction", "intake", "reading room", "re-shelving"].map((name, i) => ({ id: `k_${i}00`, name, visible: true })) }];
        (c.sections.find((s) => s.kind === "summary") as SummarySection).text = "Archive assistant caring for paper maps. Catalogued 3,200 maps in two years. Trained 40 volunteers to handle paper safely.";
      },
    );
    const s = run(strong);
    expect(s.shown).toBeGreaterThanOrEqual(85);
    expect(s.goodEnough).toBe(true);
    expect(run(withBullets(["Helped out"])).goodEnough).toBe(false);
  });

  it("punctuation alone cannot move the score by more than a point or so", () => {
    const texts = ["Catalogued 3,200 maps in two years", "Wrote the handling guide for volunteers", "Trained 40 volunteers each term"];
    const tidy = run(withBullets(texts));
    const untidy = run(withBullets([`${texts[0]}.`, texts[1], texts[2]]));
    expect(tidy.total - untidy.total).toBeGreaterThan(0);
    // One point of a hundred; a little more when other clarity checks do not apply and hand their weight on.
    expect(tidy.total - untidy.total).toBeLessThanOrEqual(1.5);
  });

  it("every finding points at a line, and has the same id each time", () => {
    const cv = withBullets(["I was responsible for various tasks", "Helped the team"]);
    const a = run(cv).findings;
    const b = run(cv).findings;
    expect(a.map((f) => f.id)).toEqual(b.map((f) => f.id));
    expect(new Set(a.map((f) => f.id)).size).toBe(a.length);
    for (const f of a) {
      expect(f.at.section).toBeTruthy();
      expect(f.reason).toBeTruthy();
      expect(f.action).toBeTruthy();
    }
    // Issues come before suggestions.
    const kinds = a.map((f) => f.severity);
    expect(kinds.lastIndexOf("issue")).toBeLessThan(kinds.indexOf("suggestion") === -1 ? Infinity : kinds.indexOf("suggestion"));
  });

  it("what is switched off is not scored", () => {
    const cv = withBullets(["Catalogued 3,200 maps in two years", "I was responsible for various tasks"]);
    expect(found(cv, "duty")).toHaveLength(1);
    exp(cv).entries[0].bullets[1].visible = false;
    expect(found(cv, "duty")).toHaveLength(0);
    expect(check(run(cv), "duty").total).toBe(1);
  });
});

describe("evidence", () => {
  it("a line drafted with no record of the person's words fails; their own lines pass", () => {
    const cv = withBullets(["Catalogued 3,200 maps", "Wrote the guide"]);
    exp(cv).entries[0].bullets[1].origin = "assisted";
    expect(found(cv, "sources").map((f) => f.excerpt)).toEqual(["Wrote the guide"]);
    exp(cv).entries[0].bullets[1].sources = [{ kind: "typed", text: "I wrote the guide" }];
    expect(found(cv, "sources")).toEqual([]);
  });

  it("flags a bullet that does not say what the person's own part was", () => {
    expect(unclearContribution("Helped the events team run a conference")!.text).toBe("Helped");
    expect(unclearContribution("We launched a new website")!.text).toBe("We");
    expect(unclearContribution("Responsible for the till")!.text).toBe("Responsible for");
    expect(unclearContribution("Worked with the design lead on a rebrand")!.text).toBe("Worked with");
    expect(unclearContribution("Ran the weekly planning meeting")).toBeNull();
    const f = found(withBullets(["Helped the events team run a conference for 300 people"]), "contribution")[0];
    expect(f.span).toEqual([0, 6]);
    expect(f.reason).toBe("“Helped” doesn’t say what your own part was.");
  });

  it("an outcome is a figure, a result or a thing that was made", () => {
    for (const t of ["Cut late orders by 12%", "Wrote the handling guide", "Introduced weekly pacing that stopped overspend", "Reorganised the store room so that orders left on time", "Built the intake spreadsheet"]) expect(hasOutcome(t), t).toBe(true);
    for (const t of ["Looked after the stock room", "Answered the phones", "Dealt with customer queries"]) expect(hasOutcome(t), t).toBe(false);
  });

  it("scale is a number or a description with clear edges, and the fix offered is to add the number", () => {
    for (const t of ["Trained 40 volunteers", "Inducted every new starter", "Covered the tills across the Leeds site", "Wrote the weekly bulletin"]) expect(hasScale(t), t).toBe(true);
    expect(hasScale("Trained volunteers to handle paper")).toBe(false);
    expect(found(withBullets(["Trained volunteers to handle paper"]), "scale")[0]).toMatchObject({ fix: "add-number" });
  });

  it("a listed skill needs a line that shows it", () => {
    const cv = withBullets(["Catalogued 3,200 maps in two years"], (c) => {
      (c.sections.find((s) => s.kind === "skills") as SkillsSection).groups = [{ id: "g_1", name: "", visible: true, skills: [{ id: "k_100", name: "Cataloguing", visible: true }, { id: "k_200", name: "Python", visible: true }, { id: "k_300", name: "Excel", visible: false }] }];
      (c.sections.find((s) => s.kind === "summary") as SummarySection).text = "";
    });
    const c = check(run(cv), "skills-shown");
    expect([c.passed, c.total]).toEqual([1, 2]);
    expect(c.findings[0]).toMatchObject({ excerpt: "Python", at: { field: "k_200" } });
  });

  it("a big claim needs context; with none, the check does not apply", () => {
    expect(bigClaim("Won the award for best newcomer")!.text).toBe("award");
    expect(bigClaim("Grew sign-ups by 80% in a quarter")!.text).toBe("80%");
    expect(bigClaim("Managed a £2m budget")!.text).toBe("£2m");
    expect(bigClaim("Cut late orders by 12%")).toBeNull();
    expect(hasContext("Doubled sign-ups by rebuilding the landing page")).toBe(true);
    expect(hasContext("Doubled sign-ups")).toBe(false);
    expect(check(run(withBullets(["Cut late orders by 12%"])), "challenge").state).toBe("na");
    expect(found(withBullets(["Doubled sign-ups"]), "challenge")).toHaveLength(1);
    expect(found(withBullets(["Doubled sign-ups by rebuilding the landing page"]), "challenge")).toHaveLength(0);
    // The line about the employer counts as context.
    expect(found(withBullets(["Doubled sign-ups"], (c) => (exp(c).entries[0].orgInfo = "A 12-person charity")), "challenge")).toHaveLength(0);
  });

  it("flags the second of two bullets that say the same thing", () => {
    const cv = withBullets(["Trained 40 volunteers to handle paper", "Wrote the guide", "Trained 40 volunteers to handle paper."]);
    const f = found(cv, "repeat");
    expect(f).toHaveLength(1);
    expect(f[0].at.field).toBe(exp(cv).entries[0].bullets[2].id);
  });

  it("a CV with no bullets earns nothing for evidence", () => {
    const s = run(withBullets([]));
    expect(s.groups.find((g) => g.id === "evidence")!.earned).toBeLessThanOrEqual(6);
    expect(check(s, "outcome")).toMatchObject({ earned: 0, total: 0 });
  });
});

describe("clarity", () => {
  it("finds weak verbs, duty openings, filler, buzzwords, passives and “I”, with the phrase", () => {
    expect(weakLead("Helped with stock takes")!.text).toBe("Helped");
    expect(weakLead("Handled customer queries")!.text).toBe("Handled");
    expect(weakLead("Catalogued maps")).toBeNull();
    expect(dutyLead("Responsible for opening the shop")!.text).toBe("Responsible for");
    expect(dutyLead("Duties included cashing up")!.text).toBe("Duties included");
    expect(dutyLead("Opened the shop")).toBeNull();
    expect(filler("Worked in order to meet various targets").map((h) => h.text)).toEqual(["in order to", "various"]);
    expect(filler("Managed the variety show")).toEqual([]);
    expect(buzzwords("A results-driven team player").map((h) => h.text)).toEqual(["results-driven", "team player"]);
    expect(passive("The rota was written each week")!.text).toBe("was written");
    expect(passive("Wrote the rota each week")).toBeNull();
    expect(firstPerson("I ran the till")!.text).toBe("I");
    expect(firstPerson("Ran the till with my manager")!.text).toBe("my");
    expect(firstPerson("Ran the IT helpdesk in Iowa")).toBeNull();
    expect(fragment("Stock control")).toBe(true);
    expect(fragment("Ran the weekly stock control")).toBe(false);
  });

  it("puts each on the line it is about, with where the phrase is", () => {
    const cv = withBullets(["Catalogued maps in order to free shelf space for 200 boxes"]);
    const f = found(cv, "filler")[0];
    expect(f.at).toEqual({ section: exp(cv).id, entry: exp(cv).entries[0].id, field: exp(cv).entries[0].bullets[0].id });
    expect(exp(cv).entries[0].bullets[0].text.slice(...f.span!)).toBe("in order to");
  });

  it("checks the profile as well as the bullets for filler, buzzwords and “I”", () => {
    const cv = withBullets(["Catalogued 3,200 maps"], (c) => ((c.sections.find((s) => s.kind === "summary") as SummarySection).text = "I am a passionate archivist."));
    expect(found(cv, "first-person")[0].at.field).toBe("text");
    expect(found(cv, "buzzword")[0].excerpt).toContain("passionate");
  });

  it("flags the other region's spelling, offers the right one, and leaves accepted words alone", () => {
    expect(wrongRegionSpelling("Organized the color catalog", "uk").map((h) => [h.text, h.suggest])).toEqual([["Organized", "Organised"], ["color", "colour"], ["catalog", "catalogue"]]);
    expect(wrongRegionSpelling("Organised the colour catalogue", "us").map((h) => h.suggest)).toEqual(["Organized", "color", "catalog"]);
    expect(wrongRegionSpelling("Organised the colour catalogue", "uk")).toEqual([]);
    // Words that are right in both, or mean something else, are left alone.
    expect(wrongRegionSpelling("Wrote a program to check each license and practice", "uk")).toEqual([]);
    expect(wrongRegionSpelling("Worked at the Color Lab", "uk", ["Color"])).toEqual([]);
    const cv = withBullets(["Organized 3,200 maps by region"]);
    const f = found(cv, "spelling")[0];
    expect(f).toMatchObject({ fix: "accept", word: "Organized", excerpt: "Organized" });
    expect(found({ ...cv, accepted: ["Organized"] }, "spelling")).toEqual([]);
    expect(found({ ...cv, region: "us" }, "spelling")).toEqual([]);
  });

  it("asks for the past tense only in roles that have ended", () => {
    expect(presentLead("Manage the till")!.text).toBe("Manage");
    expect(presentLead("Manages the till")!.text).toBe("Manages");
    expect(presentLead("Managed the till")).toBeNull();
    const current = withBullets(["Manage the till each day", "Cut waste by 12% last year"]);
    expect(check(run(current), "tense").state).toBe("na");
    const past = withBullets(["Manage the till each day", "Cut waste by 12% last year"], (c) => Object.assign(exp(c).entries[0], { current: false, end: "2024-06" }));
    expect(found(past, "tense").map((f) => f.excerpt)).toEqual(["Manage the till each day"]);
  });

  it("asks for an acronym to be spelt out once, never guesses it, and can be told to leave it", () => {
    expect(unexplainedAcronyms(["Ran PPC campaigns", "Reported PPC results"]).map((a) => [a.at, a.hit.text])).toEqual([[0, "PPC"]]);
    expect(unexplainedAcronyms(["Ran pay-per-click (PPC) campaigns", "Reported PPC results"])).toEqual([]);
    expect(unexplainedAcronyms(["Worked for the NHS in the UK on IT and HR"])).toEqual([]);
    expect(unexplainedAcronyms(["Ran PPC campaigns"], ["ppc"])).toEqual([]);
    const f = found(withBullets(["Ran PPC campaigns for six clients"]), "acronym")[0];
    expect(f).toMatchObject({ fix: "accept", word: "PPC" });
    expect(f.action).toContain("We won’t guess what it stands for");
    expect(check(run(withBullets(["Ran campaigns for six clients"])), "acronym").state).toBe("na");
  });

  it("asks for bullets to end the same way, and flags the odd ones out", () => {
    expect(found(withBullets(["One two three four.", "Five six seven eight", "Nine ten eleven twelve"]), "punctuation").map((f) => f.excerpt)).toEqual(["One two three four."]);
    expect(found(withBullets(["One two three four.", "Five six seven eight.", "Nine ten eleven twelve"]), "punctuation").map((f) => f.excerpt)).toEqual(["Nine ten eleven twelve"]);
    expect(found(withBullets(["One two three four", "Five six seven eight"]), "punctuation")).toEqual([]);
  });
});

describe("structure", () => {
  it("a missing name or email earns nothing for it", () => {
    const cv = base();
    cv.contact.fullName = "";
    cv.contact.email = "fern@";
    const s = run(cv);
    expect(check(s, "name")).toMatchObject({ earned: 0 });
    expect(check(s, "email").findings[0]).toMatchObject({ severity: "issue", at: { section: "contact", field: "email" }, reason: "“fern@” is not a complete email address." });
  });

  it("knows a usable email, phone and link", () => {
    expect([validEmail("fern@example.com"), validEmail("fern@example"), validEmail("fern example.com")]).toEqual([true, false, false]);
    expect([validPhone("07700 900123"), validPhone("+44 (0)20 7946 0018"), validPhone("12345"), validPhone("call me")]).toEqual([true, true, false, false]);
    expect([validLink("linkedin.com/in/fern-example"), validLink("https://fern.example/work"), validLink("my portfolio"), validLink("fern")]).toEqual([true, true, false, false]);
  });

  it("checks dates for order, the future and a mix of years and months", () => {
    const cv = base();
    const [a, b] = exp(cv).entries;
    Object.assign(a, { start: "2024-06", end: "2023-01", current: false });
    Object.assign(b, { start: "2021", end: "2023" });
    const f = found(cv, "dates");
    expect(f.find((x) => x.at.entry === a.id)).toMatchObject({ severity: "issue", reason: "Archive assistant ends before it starts." });
    expect(f.find((x) => x.at.entry === b.id)).toMatchObject({ severity: "suggestion" });
    Object.assign(a, { start: "2031-01", end: "", current: true });
    expect(found(cv, "dates").find((x) => x.at.entry === a.id)!.reason).toBe("Archive assistant starts in the future.");
    Object.assign(a, { start: "", end: "", current: false });
    expect(found(cv, "dates").find((x) => x.at.entry === a.id)!.reason).toBe("Archive assistant has no dates.");
  });

  it("asks for 3 to 6 bullets a role, fewer for a short placement", () => {
    const cv = withBullets(["One two three four"]);
    expect(found(cv, "bullets-per-role")[0].reason).toBe("Archive assistant has 1 bullet.");
    Object.assign(exp(cv).entries[0], { start: "2024-01", end: "2024-03", current: false });
    expect(found(cv, "bullets-per-role")).toEqual([]);
    const many = withBullets(Array.from({ length: 7 }, (_, i) => `Did thing number ${i} well`));
    expect(found(many, "bullets-per-role")[0].reason).toBe("Archive assistant has 7 bullets.");
  });

  it("judges a student's evidence across projects and volunteering as well", () => {
    const cv = base();
    cv.level = "student";
    expect(check(run(cv), "bullets-per-role").total).toBe(4);
    cv.level = "experienced";
    expect(check(run(cv), "bullets-per-role").total).toBe(2);
  });

  it("a profile is three to four sentences; with none, the check does not apply", () => {
    const cv = base();
    const summary = cv.sections.find((s) => s.kind === "summary") as SummarySection;
    summary.text = "One. Two.";
    expect(found(cv, "profile-length")[0].reason).toBe("Your profile is 2 sentences.");
    summary.text = "One. Two. Three.";
    expect(found(cv, "profile-length")).toEqual([]);
    summary.text = "";
    expect(check(run(cv), "profile-length").state).toBe("na");
  });

  it("the page count allowed depends on the level, and is pending until the page is laid out", () => {
    const cv = base();
    expect(check(run(cv, { pages: 2 }), "page-count").earned).toBeGreaterThan(0);
    expect(check(run(cv, { pages: 3 }), "page-count")).toMatchObject({ earned: 0 });
    cv.level = "early";
    expect(check(run(cv, { pages: 2 }), "page-count").findings[0].reason).toBe("Your CV runs to 2 pages. At your level, one page is expected.");
    expect(check(run(cv, { pages: undefined }), "page-count").state).toBe("pending");
  });

  it("word count is a guide worth two points", () => {
    const c = check(run(withBullets(["Ran the till"])), "word-count");
    expect(c.earned).toBe(0);
    expect(c.findings[0].reason).toMatch(/^Your CV is \d+ words\.$/);
    expect(c.weight).toBe(2);
  });
});

describe("readable by software", () => {
  it("a custom heading is flagged; a standard one is not", () => {
    const cv = base();
    expect(found(cv, "headings")).toEqual([]);
    const custom = { ...emptySection("custom", "Side quests"), entries: [{ ...exp(cv).entries[0], id: "e_custom01" }] } as EntrySection;
    cv.sections.push(custom);
    expect(found(cv, "headings").map((f) => f.excerpt)).toEqual(["Side quests"]);
  });

  it("characters the fonts cannot draw are not real text", () => {
    const c = check(run(base(), { missingGlyphs: ["陈"] }), "real-text");
    expect(c.earned).toBe(0);
    expect(c.findings[0].excerpt).toBe("陈");
  });

  it("with no name, the file name is not usable", () => {
    const cv = base();
    cv.contact.fullName = "";
    expect(check(run(cv), "file-name").earned).toBe(0);
  });
});

describe("gaps in work", () => {
  const gapCv = (dates: [string, string, boolean?][]) => {
    const cv = base();
    exp(cv).entries = dates.map(([start, end, current], i) => ({ ...exp(cv).entries[0], id: `e_gap0000${i}`, start, end, current: !!current }));
    cv.sections = cv.sections.filter((s) => s.kind === "experience");
    return cv;
  };

  it("reports more than six whole months with nothing in them", () => {
    const gaps = gapsIn(gapCv([["2018-01", "2019-03"], ["2020-06", "", true]]));
    expect(gaps).toEqual([expect.objectContaining({ from: "2019-04", to: "2020-05", months: 14 })]);
  });

  it("says nothing about six months or fewer", () => {
    expect(gapsIn(gapCv([["2018-01", "2019-03"], ["2019-10", "", true]]))).toEqual([]);
    expect(gapsIn(gapCv([["2018-01", "2019-03"], ["2019-11", "", true]]))).toHaveLength(1);
  });

  it("merges overlapping roles first", () => {
    expect(gapsIn(gapCv([["2018-01", "2019-03"], ["2018-06", "2021-01"], ["2021-03", "", true]]))).toEqual([]);
  });

  it("never claims a gap that year-only dates do not prove", () => {
    // 2019 could end in December and 2020 could start in January.
    expect(gapsIn(gapCv([["2018", "2019"], ["2020", "2021"]]))).toEqual([]);
    expect(gapsIn(gapCv([["2016", "2017"], ["2019", "2021"]]))).toEqual([expect.objectContaining({ months: 12 })]);
  });

  it("costs no points", () => {
    const withGap = gapCv([["2018-01", "2019-03"], ["2021-06", "", true]]);
    const without = gapCv([["2018-01", "2021-05"], ["2021-06", "", true]]);
    expect(run(withGap).gaps).toHaveLength(1);
    expect(run(withGap).total).toBe(run(without).total);
  });
});
