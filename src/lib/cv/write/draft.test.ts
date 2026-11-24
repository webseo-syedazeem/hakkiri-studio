import { describe, expect, it } from "vitest";
import { fernCv } from "../render/testing";
import type { CvDoc, EntrySection } from "../schema";
import { checkGrounded, checkMerge, checkProfile, checkRewrite } from "./check";
import { asBullet, bulletsByRule, latestRole, mergeDetail, profilesByRule, questionFor, tidyByRule, visibleText, yearsOfExperience } from "./draft";

const NOW = new Date("2026-11-23T12:00:00Z");

describe("a sentence as a bullet", () => {
  it("drops “I”, the list mark and the full stop, and changes nothing else", () => {
    expect(asBullet("I ran the weekly planning meeting.")).toBe("Ran the weekly planning meeting");
    expect(asBullet("I’ve trained six new starters on the till;")).toBe("Trained six new starters on the till");
  });

  it("keeps “we” as “as part of the team”: a team's work is not turned into the person's alone", () => {
    expect(asBullet("- we cut late orders by 12% over the year")).toBe("Cut late orders by 12% over the year, as part of the team");
    expect(asBullet("We’ve rebuilt the rota.")).toBe("Rebuilt the rota, as part of the team");
    // Already says it was shared: nothing is added.
    expect(asBullet("We worked with the events team to run a conference")).toBe("Worked with the events team to run a conference");
    expect(checkGrounded(asBullet("We cut late orders by 12% over the year"), ["We cut late orders by 12% over the year"]).ok).toBe(true);
    expect(checkGrounded("Cut late orders by 12% over the year", ["We cut late orders by 12% over the year"]).problems[0].say).toBe("It dropped “we”, so it claims more of the work than your words do.");
  });

  it("leaves the rest of a sentence alone", () => {
    expect(asBullet("I’ve trained six new starters on the till;")).toBe("Trained six new starters on the till");
    expect(asBullet("2. Wrote the handling guide")).toBe("Wrote the handling guide");
    expect(asBullet("Also I helped with stock takes")).toBe("Helped with stock takes");
  });
});

describe("bullets from the three answers, by rule", () => {
  const capture = {
    did: "I ran the weekly planning meeting for the Leeds site. I also trained new starters on the order system.",
    changed: "We cut late orders over the year.\nThe team stopped using paper order forms",
    number: "about 12 new starters",
  };
  const notes = [capture.did, capture.changed, capture.number].join("\n");

  it("makes one bullet from each sentence, in the person's words", () => {
    const out = bulletsByRule(capture);
    expect(out.map((b) => b.text)).toEqual(["Ran the weekly planning meeting for the Leeds site", "Trained about 12 new starters on the order system", "Cut late orders over the year, as part of the team", "The team stopped using paper order forms"]);
  });

  it("every bullet says only what its own passages say, and the passages are in the notes word for word", () => {
    for (const b of bulletsByRule(capture)) {
      expect(checkGrounded(b.text, b.quotes).ok, b.text).toBe(true);
      for (const quote of b.quotes) expect(notes).toContain(quote);
    }
  });

  it("puts the number with the sentence it is about, and keeps it an estimate", () => {
    const b = bulletsByRule(capture)[1];
    expect(b.text).toBe("Trained about 12 new starters on the order system");
    expect(b.quotes).toEqual(["I also trained new starters on the order system.", "about 12 new starters"]);
  });

  it("a number that fits no sentence stands as its own line", () => {
    const out = bulletsByRule({ did: "Wrote the handling guide.", changed: "", number: "40 pages in two weeks" });
    expect(out.map((b) => b.text)).toEqual(["Wrote the handling guide", "40 pages in two weeks"]);
  });

  it("never supplies a number: “no” and “I don’t know” add nothing", () => {
    for (const number of ["", "no", "Not really", "I don't know"]) {
      const out = bulletsByRule({ did: "Wrote the handling guide for volunteers.", changed: "", number });
      expect(out.map((b) => b.text)).toEqual(["Wrote the handling guide for volunteers"]);
    }
  });

  it("gives nothing from nothing", () => {
    expect(bulletsByRule({ did: "", changed: "  ", number: "" })).toEqual([]);
    expect(bulletsByRule({ did: "Yes.", changed: "", number: "" })).toEqual([]);
  });
});

describe("putting the person's detail into their bullet", () => {
  it("sets it where the bullet already names the thing", () => {
    expect(mergeDetail("Trained volunteers to handle paper safely", "About 40 volunteers.")).toBe("Trained about 40 volunteers to handle paper safely");
    expect(mergeDetail("Trained new starters on the order system", "about 12 new starters")).toBe("Trained about 12 new starters on the order system");
    // “client accounts” is not “clients”: the detail is not forced in where it would not read.
    expect(mergeDetail("Managed client accounts", "six retail clients")).toBe("Managed client accounts, six retail clients");
  });

  it("adds it at the end when it names something new", () => {
    expect(mergeDetail("Cut average cost per lead by rebuilding account structure.", "18% in six months")).toBe("Cut average cost per lead by rebuilding account structure, 18% in six months");
    expect(mergeDetail("Wrote the handling guide", "Roughly 40")).toBe("Wrote the handling guide, roughly 40");
  });

  it("always keeps both, word for word, so it always passes the check", () => {
    const cases: [string, string][] = [
      ["Trained volunteers to handle paper safely", "about 40 volunteers"],
      ["Cut average cost per lead by rebuilding account structure", "18% in six months"],
      ["Ran the summer school", "over 300 children across 6 weeks"],
      ["Helped run the conference", "up to 300 people"],
      ["Wrote reports", "£1.2m budget"],
    ];
    for (const [bullet, detail] of cases) expect(checkMerge(bullet, detail, mergeDetail(bullet, detail)).ok, `${bullet} + ${detail} → ${mergeDetail(bullet, detail)}`).toBe(true);
  });

  it("an empty detail changes nothing", () => {
    expect(mergeDetail("Wrote the handling guide", "  ")).toBe("Wrote the handling guide");
  });
});

describe("tidying a bullet by rule", () => {
  const cases: [string, string][] = [
    ["I successfully managed the till on a daily basis.", "Managed the till daily"],
    ["We utilised Excel in order to track stock", "Used Excel to track stock, as part of the team"],
    ["I was able to cut waste by 12% in a year", "Cut waste by 12% in a year"],
    ["Managed a wide range of client accounts", "Managed client accounts"],
    ["Wrote reports as well as the weekly bulletin", "Wrote reports and the weekly bulletin"],
  ];

  it("cuts “I” and filler", () => {
    for (const [from, to] of cases) expect(tidyByRule(from)).toBe(to);
  });

  it("keeps every fact: each tidy passes the rewrite check", () => {
    for (const [from] of cases) expect(checkRewrite(from, tidyByRule(from)).ok, from).toBe(true);
  });

  it("leaves a tight bullet exactly as it is", () => {
    const tight = "Cut average cost per lead by 18% in six months by rebuilding account structure";
    expect(tidyByRule(tight)).toBe(tight);
  });

  it("never touches a number, a name or who did the work", () => {
    expect(tidyByRule("I helped the events team run a conference for roughly 300 people")).toBe("Helped the events team run a conference for roughly 300 people");
  });
});

describe("years of experience, from the person's own dates", () => {
  const cv = fernCv() as CvDoc;
  it("counts whole years from the earliest start to today when a role is current", () => {
    // Aug 2021 to Nov 2026.
    expect(yearsOfExperience(cv, NOW)).toBe(5);
  });
  it("ignores roles that are switched off", () => {
    const c = structuredClone(cv);
    (c.sections.find((s) => s.kind === "experience") as EntrySection).entries[1].visible = false;
    // Sep 2023 to Nov 2026.
    expect(yearsOfExperience(c, NOW)).toBe(3);
  });
  it("says nothing when the dates cannot give it", () => {
    const c = structuredClone(cv);
    for (const e of (c.sections.find((s) => s.kind === "experience") as EntrySection).entries) e.start = "";
    expect(yearsOfExperience(c, NOW)).toBeUndefined();
  });
});

describe("two profiles from the CV, by rule", () => {
  const cv = fernCv() as CvDoc;
  const exp = cv.sections.find((s) => s.kind === "experience") as EntrySection;
  const { versions, years } = profilesByRule(cv, { entryId: exp.entries[0].id, skills: ["Cataloguing", "paper handling", "condition reporting"] }, NOW);

  it("gives two versions with a different emphasis", () => {
    expect(versions.map((v) => v.style)).toEqual(["experience", "contribution"]);
    expect(versions[0].text).toMatch(/^Archive assistant with 5 years’ experience, most recently at Paper Kite Archive\. Skilled in Cataloguing, paper handling and condition reporting\./);
    expect(versions[1].text.startsWith("Archive assistant")).toBe(false);
    expect(versions[1].text).toMatch(/Archive assistant at Paper Kite Archive, with 5 years’ experience in Cataloguing, paper handling and condition reporting\.$/);
    expect(versions[0].text).not.toBe(versions[1].text);
  });

  it("says only what the CV says, without “I”, in a few sentences", () => {
    for (const v of versions) {
      expect(checkProfile(v.text, visibleText(cv), { years }).problems, v.text).toEqual([]);
      const count = v.text.split(/(?<=\.)\s+/).length;
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(4);
    }
  });

  it("leads with the lines that carry a figure", () => {
    expect(versions[1].text).toMatch(/^\S.*\d/);
  });

  it("uses nothing that is switched off", () => {
    const c = structuredClone(cv);
    const role = (c.sections.find((s) => s.kind === "experience") as EntrySection).entries[0];
    for (const b of role.bullets) b.visible = false;
    const out = profilesByRule(c, { entryId: role.id, skills: [] }, NOW);
    // With no lines to draw on there is only one way to say it.
    expect(out.versions.map((v) => v.style)).toEqual(["experience"]);
    for (const b of role.bullets) expect(out.versions[0].text).not.toContain(b.text.slice(0, 20));
  });

  it("gives nothing for a CV with no role to write about", () => {
    const c = structuredClone(cv);
    (c.sections.find((s) => s.kind === "experience") as EntrySection).entries = [];
    expect(profilesByRule(c, { skills: [] }, NOW).versions).toEqual([]);
  });

  it("says the years and “most recently” only of the role the dates show to be the latest", () => {
    // A role with no dates (made from notes, which ask for none) beside a current role of seven years elsewhere.
    const c = structuredClone(cv);
    const e = (c.sections.find((s) => s.kind === "experience") as EntrySection).entries;
    e[0] = { ...e[0], title: "Transport planner", org: "Clyde Freight", start: "2019-06", end: "", current: true };
    e[1] = { ...e[1], title: "Night shift lead", org: "Example Depot", start: "", end: "", current: false };
    const undated = profilesByRule(c, { entryId: e[1].id, skills: [] }, NOW);
    expect(undated.years).toBeUndefined();
    expect(undated.versions[0].text).toMatch(/^Night shift lead at Example Depot\./);
    for (const v of undated.versions) expect(v.text).not.toMatch(/years|most recently/);
    // The current role is the latest: of it, both are true.
    const latest = profilesByRule(c, { entryId: e[0].id, skills: [] }, NOW);
    expect(latest.years).toBe(7);
    expect(latest.versions[0].text).toMatch(/^Transport planner with 7 years’ experience, most recently at Clyde Freight\./);
    // An earlier, dated role is not "most recently" either.
    e[1] = { ...e[1], start: "2015-01", end: "2019-05" };
    const earlier = profilesByRule(c, { entryId: e[1].id, skills: [] }, NOW);
    expect(earlier.years).toBeUndefined();
    for (const v of earlier.versions) expect(v.text).not.toMatch(/years|most recently/);
    // Two roles held now: the one that began later is the latest.
    e[1] = { ...e[1], start: "2022-01", end: "", current: true };
    expect(latestRole(e)!.id).toBe(e[1].id);
    expect(latestRole([{ id: "x", start: "", end: "", current: false }])).toBeUndefined();
  });

  it("leaves the years out when the dates cannot give them", () => {
    const c = structuredClone(cv);
    for (const e of (c.sections.find((s) => s.kind === "experience") as EntrySection).entries) e.start = "";
    const out = profilesByRule(c, { skills: [] }, NOW);
    expect(out.years).toBeUndefined();
    expect(out.versions[0].text).toMatch(/^Archive assistant at Paper Kite Archive\./);
    expect(out.versions[0].text).not.toMatch(/years/);
  });
});

describe("a question an interviewer may ask", () => {
  it("asks about the person's own part when the claim says they helped", () => {
    expect(questionFor("Helped the events team run a conference for 300 people")).toBe("What was your own part in this work?");
  });
  it("asks how a figure was reached", () => {
    expect(questionFor("Reduced late orders by roughly 12% over the year")).toBe("How did you arrive at roughly 12%, and what did you do to get there?");
  });
  it("asks about the work itself when there is no figure", () => {
    expect(questionFor("Wrote the handling guide for volunteers.")).toBe("Tell me about how you wrote the handling guide for volunteers. What was your part in it?");
  });
  it("falls back to the fixed question", () => {
    expect(questionFor("Stock control")).toBe("What was your part in this work?");
  });
});
