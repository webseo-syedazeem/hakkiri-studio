import { describe, expect, it } from "vitest";
import { readAssessment, suggestWeights, toHundred } from "./focus-detect";
import { templatePlan, templateUnderstanding } from "./plan";
import { weightsToMix } from "./settings";
import { savedFocus } from "./setup-form";

/** The Cabinet Office advert a client tested with (shortened, same structure). */
const CABINET_OFFICE = `Job summary
Shared Services for Government mission is to unlock the energies and talent of Civil Servants to deliver for the public, by investing in modern systems and efficient processes so Civil Servants spend less time completing and managing processes.
Job description
The role will provide support to the relationship management and process team within shared services to ensure it can deliver against its objectives.
Person specification
Creating and delivering transformation projects across government. Ensuring that projects deliver quality outcomes within time and cost constraints.
Essential Experience
Have significant experience in delivering either complex or high-risk projects within agreed time, cost and quality constraints.
Behaviours
We'll assess you against these behaviours during the selection process:
Changing and Improving
Communicating and Influencing
Seeing the Big Picture
Leadership
Benefits
Alongside your salary of £59,207, Cabinet Office contributes £17,152 towards you being a member of the Civil Service Defined Benefit Pension scheme.
Selection process details
This vacancy is using Success Profiles, and will assess your Behaviours and Experience.
Selection process
A sift will be conducted on the CV and Personal Statement. The success profiles to be assessed at the interview are listed in this advert.`;

describe("reading what an advert assesses", () => {
  it("finds Behaviours and Experience and the four named behaviours, and nothing else", () => {
    const read = readAssessment("Government Transformation Project Manager", CABINET_OFFICE);
    expect(read.assessed).toEqual(["competency", "experience"]);
    expect(read.behaviours).toEqual(["Seeing the Big Picture", "Changing and Improving", "Leadership", "Communicating and Influencing"]);
    expect(read.publicSector).toBe(true);
    expect(read.source).toBe("advert");
  });

  it("suggests Competency & Behavioural first, never Strengths or Technical the advert doesn't mention", () => {
    const w = suggestWeights("Government Transformation Project Manager", CABINET_OFFICE);
    expect(w.competency).toBe(80);
    expect(w.experience).toBe(20);
    expect(w.strengths).toBe(0);
    expect(w.technical).toBe(0);
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("reads strengths-based and technical interviews from other adverts", () => {
    expect(readAssessment("Graduate", "This is a strengths-based interview. You will also complete a technical test as part of the selection process.").assessed).toEqual(["strengths", "technical"]);
  });

  it("falls back to the job title when the advert says nothing", () => {
    const read = readAssessment("Software Engineer", "We build great products and want you to join us.");
    expect(read.source).toBe("job-title");
    expect(suggestWeights("Software Engineer", "We build great products.").technical).toBeGreaterThan(0);
  });
});

describe("the person's own weighting", () => {
  it("keeps 100% Competency with every other type at 0", () => {
    const mine = { ...toHundred({ competency: 1 }) };
    expect(savedFocus(mine).competency).toBe(100);
    expect(weightsToMix(mine)).toEqual({ technical: 0, competency: 100, cv: 0, motivation: 0, curveball: 0 });
  });

  it("scales a total that isn't 100 and switches nothing back on", () => {
    const scaled = savedFocus({ competency: 60, strengths: 0, technical: 0, experience: 20, motivation: 0, situational: 0, caseStudy: 0, leadership: 0, curveball: 0, valuesCulture: 0 });
    expect(scaled.competency + scaled.experience).toBe(100);
    expect(scaled.strengths).toBe(0);
  });
});

describe("without AI, the advert still shapes the interview", () => {
  it("understands the job from the advert, not generic text", () => {
    const u = templateUnderstanding({ company: "Cabinet Office", role: "Government Transformation Project Manager", skills: [], job: CABINET_OFFICE });
    expect(u.field).toMatch(/relationship management and process team/);
    expect(u.meanings.competency).toMatch(/Changing and Improving/);
    expect(u.meanings.cv).toMatch(/complex or high-risk projects/);
    expect(u.meanings.technical).toMatch(/transformation projects/);
    for (const m of Object.values(u.meanings)) expect(m.length).toBeLessThanOrEqual(160);
    expect(u.field.length).toBeLessThanOrEqual(120);
  });

  it("asks behaviour questions for the behaviours the advert names", () => {
    const plan = templatePlan({ company: "Cabinet Office", role: "Government Transformation Project Manager", counts: { competency: 4, cv: 1, technical: 1, motivation: 1, curveball: 1 }, interviewerTitle: "hiring manager", job: CABINET_OFFICE, difficulty: "medium" });
    const comp = plan.questions.filter((q) => q.group === "competency");
    expect(comp).toHaveLength(4);
    expect(comp.map((q) => q.short)).toEqual(["Seeing the Big Picture", "Changing and Improving", "Leadership", "Communicating and Influencing"]);
    expect(comp.every((q) => q.type === "competency")).toBe(true);
  });
});
