import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Question } from "@/lib/types";
import type { Fix } from "@/lib/mocks/report";
import { likelyQuestions, prepPriorities, prepStage } from "./prep-view";

const q = (over: Partial<Question>): Question => ({ id: "q1", group: "competency", text: "Tell me about a time you fixed a recurring error.", short: "Fixing an error", type: "competency", ...over });
const fix = (over: Partial<Fix> = {}): Fix => ({ id: "lead", title: "Lead with your decision or first step", detail: "Late in questions 1 and 2.", count: 2, practiseQuestionId: "q1", ...over });

describe("what to work on first", () => {
  it("is empty until an interview has been scored or the job has a gap", () => {
    expect(prepPriorities({ interviewId: "iv", fixes: [], gaps: [], stories: [] })).toEqual([]);
  });

  it("is the latest interview's own fixes, then the job's skills no story covers yet", () => {
    const got = prepPriorities({ interviewId: "iv-1", fixes: [fix()], gaps: [{ skill: "Stakeholder management", question: "Tell me about a difficult stakeholder." }, { skill: "Budgeting", question: "Describe a budget you owned." }], stories: [{ skill: "budgeting" }] });
    expect(got).toEqual([
      { kind: "fix", title: "Lead with your decision or first step", detail: "Late in questions 1 and 2.", href: "/mock/iv-1?q=q1", action: "Practise it" },
      {
        kind: "gap",
        title: "Build a story: stakeholder management",
        detail: "The job asks for it and none of your stories shows it yet. A question that tests it: “Tell me about a difficult stakeholder.”",
        href: "/interviews/iv-1/story?skill=Stakeholder%20management&question=Tell%20me%20about%20a%20difficult%20stakeholder.",
        action: "Build the story",
      },
    ]);
  });

  it("a gap goes once a story has been built for that skill", () => {
    const gaps = [{ skill: "Stakeholder management", question: "Tell me about a difficult stakeholder." }];
    expect(prepPriorities({ interviewId: "iv", fixes: [], gaps, stories: [] })).toHaveLength(1);
    expect(prepPriorities({ interviewId: "iv", fixes: [], gaps, stories: [{ skill: " stakeholder MANAGEMENT " }] })).toEqual([]);
  });
});

describe("the questions to expect", () => {
  const questions = [
    q({ id: "cv1", group: "cv", type: "competency", text: "Walk me through your time at Acme." }),
    q({ id: "c1" }),
    q({ id: "open", slot: "opening", type: "tell-me-about-yourself", text: "Tell me about yourself." }),
    q({ id: "close", slot: "closing", type: "questions-for-us", text: "What questions do you have for us?" }),
    q({ id: "pay1", pay: true, text: "What are your salary expectations?" }),
    q({ id: "old", retired: true, text: "A question that was set aside." }),
    q({ id: "t1", drillOnly: true, text: "A topic-drill question." }),
    q({ id: "why", group: "motivation", type: "why-us", text: "Why do you want to work here?" }),
  ];

  it("are this interview's own questions, the most important first, without the set-aside, pay and drill-only ones", () => {
    const got = likelyQuestions({ questions });
    expect(got.map((x) => x.id)).toEqual(["open", "why", "c1", "cv1"]);
    expect(got.map((x) => x.text)).toContain("Why do you want to work here?");
  });

  it("each says how that kind of question is scored, not a stock tip for another job", () => {
    const [open] = likelyQuestions({ questions });
    expect(open.approach).toBe("Now, then background, then why this role. What counts most: relevance to the role, a clear hook. Aim for 1:00 to 1:30.");
  });

  it("an interview with no questions has none", () => {
    expect(likelyQuestions({ questions: [] })).toEqual([]);
  });
});

describe("the stage a sheet is for", () => {
  it("is the interview's own next stage, or nothing", () => {
    expect(prepStage({})).toBeNull();
    expect(prepStage({ stages: [] })).toBeNull();
    expect(prepStage({ stages: [{ name: "Recruiter call", status: "completed" }, { name: "Panel", status: "next" }, { name: "Final" }] })).toBe("Panel");
    expect(prepStage({ stages: [{ name: "Recruiter call", status: "completed" }, { name: "Final" }] })).toBe("Final");
    expect(prepStage({ stages: [{ name: "Only round" }] })).toBe("Only round");
  });
});

describe("the prep sheet page itself", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../app/(studio)/interviews/[id]/prep/page.tsx"), "utf8");

  it("holds none of another person's story or the stock advice an earlier build showed for every interview", () => {
    for (const stock of [
      "Fernway",
      "41% to 58%",
      "17%",
      "payments software",
      "Product judgement",
      "Balance conversion, fraud",
      "commercial judgement",
      "career transitions",
      "Roadmap change",
      "balance conversion and fraud risk",
      "changed a roadmap",
      "engineers who disagree",
      "biggest payment challenges",
      "Senior Product Manager",
      '"Halden"',
      "Stage 2: Hiring manager",
    ]) {
      expect(source.includes(stock), stock).toBe(false);
    }
  });
});
