import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildRequest, focusMix, hasDraftContent, mixIsValid, mixLine, roundsSelected, setupProblems, type SetupForm } from "./setup-form";

const CV = "Sam Okafor. Data analyst at Northwind for six years. Built the SQL models behind the finance dashboards and cut reporting errors by a third.";
const stage = (over = {}) => ({ id: "1", name: "Interview stage 1", date: "", time: "", format: "Video call", interviewer: "", status: "next", ...over });
const form = (over: Partial<SetupForm> = {}): SetupForm => ({
  company: "Acme Payroll",
  title: "Data Analyst",
  website: "",
  jobText: "",
  jobUrl: "",
  jobLabel: "",
  cvText: CV,
  cvLabel: "sam-cv.pdf",
  coverText: "",
  coverLabel: "",
  stages: [stage()],
  difficulty: "Medium",
  minutes: 30,
  focus: { technical: 50, skills: 30, experience: 20 },
  ...over,
});

describe("what set-up needs before it can build", () => {
  it("nothing more, when the company, the job and a readable CV are there", () => {
    expect(setupProblems(form())).toEqual([]);
    expect(setupProblems(form({ title: "", jobText: "We need an analyst who knows SQL." }))).toEqual([]);
  });

  it("names each thing that is missing", () => {
    expect(setupProblems(form({ company: " ", title: "", cvText: "" })).map((p) => p.field)).toEqual(["company", "job", "cv"]);
    expect(setupProblems(form({ cvText: "" }))[0].message).toBe("Add your CV: choose a file we can read, or paste its text.");
    expect(setupProblems(form({ cvText: "Sam Okafor, analyst." }))[0].message).toBe("Your CV has too few words to build questions from. Paste the full text.");
  });
});

describe("the request that builds an interview", () => {
  it("is not made while something is missing: an empty form builds nothing", () => {
    expect(buildRequest(form({ company: "", title: "", cvText: "" }))).toBeNull();
    expect(buildRequest(form({ cvText: "" }))).toBeNull();
    expect(buildRequest(form({ company: "" }))).toBeNull();
  });

  it("holds exactly what the person gave", () => {
    expect(buildRequest(form())).toEqual({
      company: { name: "Acme Payroll" },
      job: { title: "Data Analyst" },
      cv: { text: CV, label: "sam-cv.pdf" },
      format: "video",
      settings: { difficulty: "medium", minutes: 30, preset: "custom", mix: { technical: 50, competency: 30, cv: 20, motivation: 0, curveball: 0 } },
      stages: [{ id: "1", name: "Interview stage 1", format: "Video call", status: "next" }],
    });
  });

  it("never supplies a company, a role, CV text, a date or a time the person didn't give", () => {
    const sent = JSON.stringify(buildRequest(form({ stages: [stage({ date: "", time: "" })] })));
    for (const invented of ["Halden", "Senior Product Manager", "CV text for", "CV content for", "Cover letter text", "12 Nov", "10:00", "Target Role"]) expect(sent.includes(invented), invented).toBe(false);
    expect(sent).not.toContain('"date"');
    expect(sent).not.toContain('"time"');
    expect(sent).not.toContain("coverLetter");
  });

  it("includes the optional things when they were given", () => {
    const sent = buildRequest(form({ website: "acme.example", jobText: "  Own the payroll dashboards.  ", jobUrl: "https://jobs.example/1", jobLabel: "advert.pdf", coverText: "Dear Acme, I would like the job.", coverLabel: "letter.docx", stages: [stage({ format: "In person", date: "2026-12-01", time: "09:30", interviewer: "J. Patel" })], difficulty: "Hard", minutes: 45 }))!;
    expect(sent.company).toEqual({ name: "Acme Payroll", url: "acme.example" });
    expect(sent.job).toEqual({ title: "Data Analyst", text: "Own the payroll dashboards.", url: "https://jobs.example/1", label: "advert.pdf" });
    expect(sent.coverLetter).toEqual({ text: "Dear Acme, I would like the job.", label: "letter.docx" });
    expect(sent.format).toBe("in-person");
    expect(sent.settings).toMatchObject({ difficulty: "hard", minutes: 45 });
    expect(sent.stages[0]).toEqual({ id: "1", name: "Interview stage 1", date: "2026-12-01", time: "09:30", format: "In person", interviewer: "J. Patel", status: "next" });
  });

  it("a stage with no name is not sent", () => {
    expect(buildRequest(form({ stages: [stage(), stage({ id: "2", name: "  " })] }))!.stages).toHaveLength(1);
  });
});

describe("the question mix", () => {
  it("sent is the mix shown: each slider's share, in steps of ten, adding up to 100", () => {
    expect(focusMix({ technical: 50, skills: 30, experience: 20 })).toEqual({ technical: 50, competency: 30, cv: 20, motivation: 0, curveball: 0 });
    expect(focusMix({ technical: 80, skills: 80, experience: 40 })).toEqual({ technical: 40, competency: 40, cv: 20, motivation: 0, curveball: 0 });
    expect(focusMix({ technical: 100, skills: 0, experience: 0 })).toEqual({ technical: 100, competency: 0, cv: 0, motivation: 0, curveball: 0 });
  });

  it("is always a valid mix, whatever the sliders say", () => {
    for (const t of [0, 7, 33, 50, 99, 100]) for (const s of [0, 1, 33, 64, 100]) for (const e of [0, 12, 33, 100]) expect(mixIsValid(focusMix({ technical: t, skills: s, experience: e })), `${t}/${s}/${e}`).toBe(true);
    expect(focusMix({ technical: 33, skills: 33, experience: 33 })).toEqual({ technical: 40, competency: 30, cv: 30, motivation: 0, curveball: 0 });
  });

  it("with every slider at zero is the balanced mix, and is no longer always 20/20/20/20/20", () => {
    expect(focusMix({ technical: 0, skills: 0, experience: 0 })).toEqual({ cv: 20, competency: 20, technical: 20, motivation: 20, curveball: 20 });
    expect(buildRequest(form({ focus: { technical: 100, skills: 0, experience: 0 } }))!.settings.mix).not.toEqual({ cv: 20, competency: 20, technical: 20, motivation: 20, curveball: 20 });
  });

  it("is described as it will be sent", () => {
    expect(mixLine(focusMix({ technical: 80, skills: 80, experience: 40 }))).toBe("Technical 40% · Skills 40% · Experience 20%");
    expect(mixLine(focusMix({ technical: 0, skills: 0, experience: 0 }))).toBe("Technical 20% · Skills 20% · Experience 20% · Motivation 20% · Situational 20%");
  });
});

describe("the rounds count", () => {
  it("counts only ticked rounds that exist, once each", () => {
    expect(roundsSelected(["1", "3"], [{ id: "1" }])).toEqual(["1"]);
    expect(roundsSelected(["1", "1", "2"], [{ id: "1" }, { id: "2" }])).toEqual(["1", "2"]);
    expect(roundsSelected(["9"], [{ id: "1" }])).toEqual([]);
  });
});

describe("a draft", () => {
  it("is worth keeping only when something has been entered", () => {
    const empty = { company: "", title: " ", website: "", jobText: "", jobUrl: "", cvText: "", coverText: "" };
    expect(hasDraftContent(empty)).toBe(false);
    expect(hasDraftContent({ ...empty, company: "Acme" })).toBe(true);
    expect(hasDraftContent({ ...empty, cvText: CV })).toBe(true);
  });
});

describe("the set-up screen itself", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../components/interview/InterviewSetup.tsx"), "utf8");

  it("holds no stand-in company, role, CV text, date or time, and no made-up interview id", () => {
    for (const stock of [
      '"Halden"',
      "Senior Product Manager, Payments",
      "halden.com",
      "CV content for",
      "CV text for",
      "Job description for ${",
      "Cover letter for ${",
      "Cover letter text",
      "Target Role",
      "12 Nov 2026",
      '"10:00"',
      "Link attached",
      "saveClientInterview",
      "Date.now().toString(36)",
      'useState<string[]>(["1", "3"])',
      "mix: { cv: 20, competency: 20, technical: 20, motivation: 20, curveball: 20 }",
      'saved locally"',
      "Draft saved to workspace",
    ]) {
      expect(source.includes(stock), stock).toBe(false);
    }
  });
});
