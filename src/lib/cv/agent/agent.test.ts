import { describe, expect, it } from "vitest";
import { type CvDoc, type EntrySection, coreSections, cvStrings, emptyContact, isEntrySection } from "../schema";
import { type Editable, type Op, applyOps } from "./ops";
import { nextStep, outline } from "./plan";
import { looksLikeAdvert, rulesTurn } from "./rules";
import { aiTells, plainerWords, styleProblems, tidyLine } from "./style";
import { runTurn, type Said } from "./turn";
import { checkOps } from "./validate";

const NOW = new Date("2026-11-26T12:00:00Z");

function blank(level: CvDoc["level"] = "experienced"): CvDoc {
  return {
    id: "cv_0123456789abcdef",
    userId: "u1",
    rev: 1,
    name: "Test CV",
    kind: "base",
    level,
    region: "uk",
    contact: emptyContact(),
    sections: coreSections(level),
    design: { template: "standard", pageSize: "a4", density: "default", pageTarget: 2 },
    accepted: [],
    requirements: [],
    changes: [],
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
  };
}

const ctx = (words: string[]) => ({ words, latest: words[words.length - 1] ?? "", now: NOW });
const experience = (cv: Pick<CvDoc, "sections">) => cv.sections.find((s) => s.kind === "experience") as EntrySection;

/** A whole conversation, one message at a time, the way the builder runs it: the reply's edits are applied before the next message. */
async function talk(messages: string[], start = blank()) {
  let cv: CvDoc = start;
  const words: string[] = [];
  const history: Said[] = [];
  let about: string | undefined;
  let step: string | undefined = nextStep(cv).key;
  let skipped: string[] = [];
  const replies = [];
  for (const message of messages) {
    const reply = await runTurn({ cv, hidden: new Set(), message, words, history, spoken: false, about, step, skipped, now: NOW });
    const applied = applyOps(cv, reply.ops);
    cv = { ...cv, contact: applied.contact, sections: applied.sections, target: applied.target };
    about = reply.about ? (applied.refs[reply.about] ?? reply.about) : undefined;
    step = reply.step;
    skipped = reply.skipped;
    words.push(message);
    history.push({ who: "you", text: message }, { who: "assistant", text: `${reply.say} ${reply.ask}` });
    replies.push(reply);
  }
  return { cv, replies };
}

describe("plain words for screeners", () => {
  it("finds AI phrasing and buzzwords", () => {
    expect(aiTells("Spearheaded a robust, results-driven rollout")).toEqual(["Spearheaded", "robust", "results-driven"]);
    expect(aiTells("Built the SQL checks that catch payroll errors")).toEqual([]);
  });

  it("refuses AI phrasing the person didn't use, and leaves their own words alone", () => {
    expect(styleProblems("Spearheaded the SQL checks", ["I built the SQL checks"])[0]).toContain("“Spearheaded”");
    expect(styleProblems("Leveraged Python to automate checks", ["I leveraged Python to automate checks"])).toEqual([]);
    expect(plainerWords("Leveraged Python to automate checks")).toEqual([{ word: "Leveraged", plainer: "used" }]);
  });

  it("puts punctuation back to how a CV line reads", () => {
    expect(tidyLine("Built the checks — errors fell to 5 a month.")).toBe("Built the checks, errors fell to 5 a month");
    expect(tidyLine("- Ran the rota;")).toBe("Ran the rota");
  });

  it("keeps a line to one point", () => {
    const long = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ");
    expect(styleProblems(long, [long]).join(" ")).toContain("split it into two lines");
  });
});

describe("edits are checked against what the person said", () => {
  const said = ["I'm a data analyst at Acme Payroll since 2021", "I built the SQL checks that catch payroll errors before pay day. Errors went down a lot."];
  const withRole = (): Editable => {
    const cv = blank();
    const applied = applyOps(cv, [{ op: "add_entry", ref: "new1", section: "experience", title: "Data Analyst", org: "Acme Payroll", location: "", start: "2021", end: "", current: true, subject: "", grade: "" }]);
    return { ...cv, sections: applied.sections };
  };
  const roleId = (cv: Editable) => experience(cv).entries[0].id;

  it("keeps a line made from their words, with the words it came from", () => {
    const cv = withRole();
    const op: Op = { op: "add_bullet", entry: roleId(cv), text: "Built the SQL checks that catch payroll errors before pay day", quotes: ["I built the SQL checks that catch payroll errors before pay day."] };
    expect(checkOps(cv, [op], ctx(said)).left).toEqual([]);
    const bullet = experience(applyOps(cv, [op], { spoken: true })).entries[0].bullets[0];
    expect(bullet.sources).toEqual([{ kind: "spoken", text: "I built the SQL checks that catch payroll errors before pay day." }]);
  });

  it("never lets a number in that they didn't give", () => {
    const cv = withRole();
    const { ops, left } = checkOps(cv, [{ op: "add_bullet", entry: roleId(cv), text: "Built SQL checks that cut payroll errors by 90%", quotes: [] }], ctx(said));
    expect(ops).toEqual([]);
    expect(left[0].why).toContain("“90%”");
  });

  it("refuses AI phrasing and a bigger claim", () => {
    const cv = withRole();
    expect(checkOps(cv, [{ op: "add_bullet", entry: roleId(cv), text: "Spearheaded SQL checks that catch payroll errors", quotes: [] }], ctx(said)).left).toHaveLength(1);
    expect(checkOps(cv, [{ op: "add_bullet", entry: roleId(cv), text: "Led the SQL checks that catch payroll errors", quotes: [] }], ctx(said)).left[0].why).toBe("It says “led”, which your words don’t.");
  });

  it("refuses contact details, skills, employers and years they haven't said", () => {
    const cv = withRole();
    const { ops, left } = checkOps(
      cv,
      [
        { op: "set_contact", field: "email", value: "sam@example.com" },
        { op: "set_contact", field: "phone", value: "07700 900123" },
        { op: "add_skills", names: ["Tableau"] },
        { op: "add_entry", ref: "new1", section: "experience", title: "Data Analyst", org: "Monzo", location: "", start: "2018", end: "2020", current: false, subject: "", grade: "" },
        { op: "add_skills", names: ["SQL"] },
      ],
      ctx(said),
    );
    expect(left.map((l) => l.why)).toEqual(["The email address “sam@example.com” isn’t in what you said.", "The phone number “07700 900123” isn’t in what you said.", "You haven’t said you use “Tableau”.", "“Monzo” isn’t in what you said."]);
    expect(ops).toEqual([{ op: "add_skills", names: ["SQL"] }]);
  });

  it("lets a line go under an entry made earlier in the same reply", () => {
    const cv = blank();
    const { ops, left } = checkOps(
      cv,
      [
        { op: "add_entry", ref: "new1", section: "experience", title: "Data Analyst", org: "Acme Payroll", location: "", start: "2021", end: "", current: true, subject: "", grade: "" },
        { op: "add_bullet", entry: "new1", text: "Built the SQL checks that catch payroll errors before pay day", quotes: [] },
      ],
      ctx(said),
    );
    expect(left).toEqual([]);
    expect(ops).toHaveLength(2);
  });

  it("rewords a line only to say the same thing, unless the person asked for a change", () => {
    const cv = withRole();
    const added = applyOps(cv, [{ op: "add_bullet", entry: roleId(cv), text: "Orchestrated the payroll checks", quotes: [] }]);
    const state = { ...cv, sections: added.sections };
    const id = experience(state).entries[0].bullets[0].id;
    const reword: Op = { op: "reword_bullet", bullet: id, text: "Organised the payroll checks" };
    expect(checkOps(state, [reword], ctx(["I orchestrated the payroll checks"])).left[0].why).toContain("“Organised”");
    expect(checkOps(state, [reword], ctx(["I orchestrated the payroll checks", "use organised instead"])).left).toEqual([]);
    // Asked for a change or not, nothing new may come in.
    expect(checkOps(state, [{ ...reword, text: "Organised the payroll checks for 4,000 firms" }], ctx(["I orchestrated the payroll checks", "use organised instead"])).left).toHaveLength(1);
  });

  it("switches a line off rather than deleting it", () => {
    const cv = withRole();
    const added = applyOps(cv, [{ op: "add_bullet", entry: roleId(cv), text: "Ran the rota", quotes: [] }]);
    const id = experience(added).entries[0].bullets[0].id;
    const hidden = applyOps({ ...cv, sections: added.sections }, [{ op: "hide_bullet", bullet: id }]);
    expect(experience(hidden).entries[0].bullets).toEqual([expect.objectContaining({ id, text: "Ran the rota", visible: false })]);
  });

  it("puts a new job in date order, newest first", () => {
    const cv = withRole();
    const older = applyOps(cv, [{ op: "add_entry", ref: "new1", section: "experience", title: "Analyst", org: "Leeds Council", location: "", start: "2018", end: "2021", current: false, subject: "", grade: "" }]);
    expect(experience(older).entries.map((e) => e.org)).toEqual(["Acme Payroll", "Leeds Council"]);
  });
});

describe("what to ask next", () => {
  it("asks in the order an interviewer would", () => {
    const cv = blank();
    expect(nextStep(cv).key).toBe("target");
    expect(nextStep(cv, { skipped: ["target"] }).key).toBe("name");
    const named = { ...cv, contact: { ...cv.contact, fullName: "Sam Okafor", email: "sam@example.com", phone: "07700 900123", location: "Leeds" } };
    expect(nextStep(named, { skipped: ["target"] }).key).toBe("first-role");
    expect(nextStep({ ...named, level: "student" }, { skipped: ["target"] }).key).toBe("education");
  });

  it("asks what the advert wants that the CV doesn't show, one thing at a time", () => {
    const advert = "As a Data Analyst you will work with finance teams. Experience with SQL, Python and Tableau is essential. We are looking for someone careful.";
    const cv = blank();
    const full = applyOps(cv, [
      { op: "set_contact", field: "fullName", value: "Sam" },
      { op: "set_contact", field: "email", value: "s@x.com" },
      { op: "set_contact", field: "phone", value: "07700900123" },
      { op: "set_contact", field: "location", value: "Leeds" },
      { op: "add_entry", ref: "new1", section: "experience", title: "Analyst", org: "Acme", location: "", start: "2021", end: "", current: true, subject: "", grade: "" },
      { op: "add_bullet", entry: "new1", text: "Built 12 SQL checks", quotes: [] },
      { op: "add_bullet", entry: "new1", text: "Ran the monthly report", quotes: [] },
      { op: "add_bullet", entry: "new1", text: "Trained the finance team", quotes: [] },
      { op: "add_entry", ref: "new2", section: "education", title: "BSc Economics", org: "Leeds", location: "", start: "", end: "2020", current: false, subject: "", grade: "" },
      { op: "add_skills", names: ["SQL"] },
    ]);
    const state = { ...cv, contact: full.contact, sections: full.sections, target: { title: "Data Analyst", employer: "", advert } };
    const step = nextStep(state, { skipped: ["more-roles"] });
    expect(step.key).toBe("advert:python");
    expect(step.ask).toContain("Python");
    expect(nextStep(state, { skipped: ["more-roles", "advert:python", "advert:tableau"] }).key).toBe("profile");
  });

  it("shows the assistant every line by id, and hides nothing it might edit", () => {
    const cv = blank();
    const applied = applyOps(cv, [
      { op: "add_entry", ref: "new1", section: "experience", title: "Analyst", org: "Acme", location: "", start: "2021", end: "", current: true, subject: "", grade: "" },
      { op: "add_bullet", entry: "new1", text: "Built SQL checks", quotes: [] },
    ]);
    const text = outline({ ...cv, sections: applied.sections });
    const e = experience(applied).entries[0];
    expect(text).toContain(`ENTRY ${e.id} title="Analyst" org="Acme" dates=2021 to present`);
    expect(text).toContain(`LINE ${e.bullets[0].id} "Built SQL checks"`);
  });
});

describe("the assistant without a model", () => {
  it("knows a pasted advert from a message about the person", () => {
    const advert = "About the role: you will own our payroll accuracy dashboards. Requirements: SQL and Python. We are looking for someone who explains data simply. ".repeat(3);
    expect(looksLikeAdvert(advert)).toBe(true);
    expect(looksLikeAdvert("I built the SQL checks that catch payroll errors before pay day.")).toBe(false);
    expect(rulesTurn(blank(), advert, { now: NOW }).ops[0].op).toBe("set_advert");
  });

  it("builds a CV from a conversation, and every word on it is the person's", async () => {
    const messages = [
      "I'm going for a Data Analyst role at Monzo",
      "My name is Sam Okafor. My email is sam.okafor@example.com and my phone is 07700 900123. I live in Leeds.",
      "I work as a data analyst at Acme Payroll since March 2021.",
      "I built the SQL checks that catch payroll errors before pay day. We cut payroll errors from about 40 a month to 5. I present the findings to leadership every month.",
      "no more jobs",
      "I studied a BSc in Economics at the University of Leeds, graduating in 2020.",
      "SQL, Python, Excel and Power BI",
    ];
    const { cv, replies } = await talk(messages);
    expect(replies.every((r) => r.by === "rules")).toBe(true);
    expect(cv.target).toEqual({ title: "Data Analyst", employer: "Monzo", advert: "" });
    expect(cv.contact).toMatchObject({ fullName: "Sam Okafor", email: "sam.okafor@example.com", phone: "07700 900123", location: "Leeds" });
    const role = experience(cv).entries[0];
    expect(role).toMatchObject({ title: "Data Analyst", org: "Acme Payroll", start: "2021-03", current: true });
    expect(role.bullets.map((b) => b.text)).toEqual([
      "Built the SQL checks that catch payroll errors before pay day",
      "Cut payroll errors from about 40 a month to 5, as part of the team",
      "Present the findings to leadership every month",
    ]);
    // Every line keeps the exact words it was made from.
    expect(role.bullets.every((b) => b.sources.length === 1 && messages[3].includes(b.sources[0].text))).toBe(true);
    const study = cv.sections.find((s) => s.kind === "education") as EntrySection;
    expect(study.entries[0]).toMatchObject({ title: "BSc in Economics", org: "University of Leeds", end: "2020", subject: "Economics" });
    const skills = cv.sections.find((s) => s.kind === "skills");
    expect(skills?.kind === "skills" && skills.groups[0].skills.map((k) => k.name)).toEqual(["SQL", "Python", "Excel", "Power BI"]);
    // Nothing on the CV that the person didn't say.
    const said = messages.join(" ").toLowerCase();
    for (const s of cvStrings(cv)) for (const w of s.toLowerCase().match(/[a-z]{4,}/g) ?? []) if (!["part", "team"].includes(w)) expect(said).toContain(w);
    // After the skills, the profile is what's left to do.
    expect(replies[replies.length - 1].step).toBe("profile");
  });

  it("writes the profile from the CV when asked", async () => {
    const { cv } = await talk(["skip", "My name is Sam Okafor", "I work as a data analyst at Acme Payroll since 2021.", "I built the SQL checks that catch payroll errors before pay day.", "write my profile"]);
    const profile = cv.sections.find((s) => s.kind === "summary");
    expect(profile?.kind === "summary" && profile.text).toMatch(/^Data Analyst/);
  });

  it("passes on a question when the person says so, and moves on", async () => {
    const { replies } = await talk(["skip"]);
    expect(replies[0].ops).toEqual([]);
    expect(replies[0].skipped).toContain("target");
    expect(replies[0].step).toBe("name");
  });

  it("tells the person what it left out, and why", async () => {
    const cv = blank();
    const reply = await runTurn({ cv, hidden: new Set(), message: "I work as a data analyst at Acme Payroll since 2021.", words: [], history: [], spoken: false, step: "first-role", skipped: ["target", "name", "contact"], now: NOW });
    expect(reply.ops.map((o) => o.op)).toEqual(["add_entry"]);
    expect(reply.say).toBe("I made one change.");
    expect(applyOps(cv, reply.ops).changes[0].say).toBe("Added “Data Analyst at Acme Payroll” to Experience");
    expect(reply.step).toMatch(/^role-did:/);
    expect(reply.ask).toContain("Data Analyst at Acme Payroll");
    expect(isEntrySection(cv.sections[1])).toBe(true);
  });
});
