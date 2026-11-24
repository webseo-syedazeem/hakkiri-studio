import { describe, expect, it } from "vitest";
import { fernCv } from "../render/testing";
import type { CvDoc, EntrySection } from "../schema";
import { suggestSkills } from "./skills";

const withAdvert = (advert: string, change?: (cv: CvDoc) => void) => {
  const cv = { ...(fernCv() as CvDoc), target: { title: "Collections officer", employer: "Example Museum", advert } };
  change?.(cv);
  return cv;
};
const names = (cv: CvDoc) => suggestSkills(cv).map((s) => s.name);

describe("skills worth adding", () => {
  it("suggests nothing for a CV with no advert and no named tools in its bullets", () => {
    expect(suggestSkills({ ...(fernCv() as CvDoc), target: undefined })).toEqual([]);
  });

  it("reads what an advert asks for from its own phrases", () => {
    const cv = withAdvert("We need experience with collections databases, Spectrum and object handling. Knowledge of SQL is desirable. You will be proficient in Adlib or similar.");
    expect(names(cv)).toEqual(expect.arrayContaining(["collections databases", "Spectrum", "object handling", "SQL", "Adlib"]));
    expect(names(cv)).not.toContain("SQL is desirable");
    expect(names(cv)).not.toContain("similar");
  });

  it("does not suggest a skill the person already lists, however it is cased", () => {
    const cv = withAdvert("Experience with EXCEL, cataloguing and condition reporting.");
    expect(names(cv)).toEqual([]);
  });

  it("gives the line of the CV that shows a skill, when one does", () => {
    const cv = withAdvert("Experience with fragile maps and digitisation.");
    const out = suggestSkills(cv);
    const shown = out.find((s) => s.name === "fragile maps")!;
    expect(shown.evidence!.text).toContain("fragile maps");
    const exp = cv.sections.find((s) => s.kind === "experience") as EntrySection;
    expect(shown.evidence!.at).toMatchObject({ section: exp.id, entry: exp.entries[0].id });
    // Not shown anywhere on the CV: it starts unconfirmed.
    expect(out.find((s) => s.name === "digitisation")).toEqual({ name: "digitisation", from: "advert", evidence: undefined });
  });

  it("puts skills the CV already shows before those it does not", () => {
    const out = suggestSkills(withAdvert("Experience with digitisation, Spectrum and fragile maps."));
    expect(out.map((s) => !!s.evidence)).toEqual([true, false, false]);
  });

  it("never offers a line that is switched off as evidence", () => {
    const cv = withAdvert("Experience with fragile maps.", (c) => {
      for (const e of (c.sections.find((s) => s.kind === "experience") as EntrySection).entries) for (const b of e.bullets) b.visible = false;
    });
    expect(suggestSkills(cv).find((s) => s.name === "fragile maps")!.evidence).toBeUndefined();
  });

  it("finds tools named in the person's own bullets", () => {
    const cv = withAdvert("", (c) => {
      const role = (c.sections.find((s) => s.kind === "experience") as EntrySection).entries[0];
      role.bullets[0].text = "Moved 3,200 catalogue records into Axiell Collections and checked each in GA4";
    });
    const out = suggestSkills(cv);
    expect(out.map((s) => s.name)).toEqual(["Axiell Collections", "GA4"]);
    for (const s of out) expect(s).toMatchObject({ from: "cv" });
    for (const s of out) expect(s.evidence!.text).toContain(s.name);
  });

  it("does not take a name, an employer or a place for a skill", () => {
    const cv = withAdvert("Based in York at Paper Kite Archive. Experience with Fern Example is not a skill.", (c) => {
      const role = (c.sections.find((s) => s.kind === "experience") as EntrySection).entries[0];
      role.bullets[0].text = "Catalogued maps for Paper Kite Archive in York";
    });
    expect(names(cv)).toEqual([]);
  });

  it("does not run two names together across a comma", () => {
    expect(names(withAdvert("Tools: Google Ads, Tableau, Looker Studio."))).toEqual(["Google Ads", "Tableau", "Looker Studio"]);
  });
});
