import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/config", () => ({
  aiConfig: { anthropicKey: "test-key", anthropicWorkspaceId: "", deepgramKey: "", mainModel: "claude-sonnet-5", fastModel: "claude-haiku-4-5-20251001" },
  missingKeys: () => [],
}));

import { addQuestions, buildInterview, rethink, type BuildInput } from "./build";
import { deleteInterview, getInterview, saveInterview, updateInterview } from "./store";
import { GROUP_ORDER } from "@/lib/labels";
import { bankCounts } from "@/lib/ai/interview/build-plan";
import { PRESETS } from "./settings";

const input: BuildInput = {
  company: { name: "Acme Payroll", siteText: "Acme Payroll runs payroll for 4,000 small businesses in the UK." },
  job: { title: "Data Analyst", text: "Own the SQL models behind payroll accuracy. Python a plus." },
  cv: { text: "Sam Okafor. Analyst at Brightline Energy since 2022: churn models, cut reporting from 3 days to 4 hours, found a billing error worth 120,000 pounds.", label: "cv.pdf" },
  date: "2026-11-01T10:00:00.000Z",
  format: "video",
  settings: { difficulty: "medium", minutes: 30, preset: "final", mix: PRESETS.final.mix },
};

const counts = bankCounts(input.settings);

function plan(dropTechnical = false) {
  const questions = GROUP_ORDER.filter((g) => !(dropTechnical && g === "technical")).flatMap((g) =>
    Array.from({ length: counts[g] }, (_, k) => ({
      group: g,
      type: g === "motivation" ? "why-us" : g === "technical" ? "technical" : g === "curveball" ? "situational" : "competency",
      text: g === "motivation" && k === 0 ? "Why do you want to work at Acme Payroll?" : `${g} ${k + 1}: tell me about it?`,
      short: `${g} ${k + 1}`,
    })),
  );
  return JSON.stringify({
    company: "Acme Payroll",
    role: "Data Analyst",
    seniority: "Mid-level",
    interviewerTitle: "analytics lead",
    jobSummary: "An analyst role owning payroll accuracy data.",
    skills: ["SQL", "Python", "Payroll data"],
    understanding: {
      role: "Data Analyst",
      level: "Mid-level",
      field: "payroll accuracy data for small businesses",
      technicalLabel: "Technical",
      meanings: { cv: "Your analyst work at Brightline.", competency: "Times you found and fixed data problems.", technical: "SQL models, Python checks and dashboards.", motivation: "Why Acme Payroll and payroll data.", curveball: "What you'd do if the numbers looked wrong." },
    },
    brief: { whatTheyDo: "Payroll for 4,000 small UK businesses.", whyYou: ["You found a billing error worth 120,000 pounds at Brightline."], toKnow: ["They serve small businesses."] },
    probes: [{ ask: "Moving from energy to payroll", handle: "Link the billing error to getting pay right." }],
    questionsToAsk: ["How do you measure payroll accuracy today?"],
    stories: [{ title: "Finding the billing error", source: "Brightline Energy, 2022", parts: { situation: true, task: true, action: true, result: true }, fits: 5, useFor: ["Spotting errors"] }],
    gaps: [{ skill: "Presenting to leadership", question: "Tell me about a time you presented findings to senior leaders." }],
    questions,
  });
}

function fakeClaude(...replies: string[]) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      calls.push(JSON.parse(String(init.body)).messages[0].content);
      const text = replies[Math.min(calls.length - 1, replies.length - 1)];
      return new Response(JSON.stringify({ content: [{ type: "text", text }] }), { status: 200 });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("building an interview with Claude", () => {
  it("retries a plan that fails its checks, drops what the relevance check flags, and saves the rest", async () => {
    const calls = fakeClaude(plan(true), plan(), '{"drop":[{"index":4,"reason":"Too senior"}]}');
    const { interview, notes } = await buildInterview(input);
    expect(calls).toHaveLength(3);
    expect(calls[1]).toMatch(/Your last reply had these problems/);
    expect(calls[1]).toMatch(new RegExp(`Write ${counts.technical} technical questions, not 0`));
    expect(calls[2]).toMatch(/Reply with {"drop"/);
    expect(notes).toEqual([]);
    expect(interview.planBy).toBe("model");
    expect(interview.understanding?.field).toBe("payroll accuracy data for small businesses");
    expect(interview.likelyAsks).toEqual(["Moving from energy to payroll"]);
    // Opening and closing are added by code, outside the mix.
    expect(interview.questions[0]).toMatchObject({ id: "open", slot: "opening" });
    expect(interview.questions.at(-1)).toMatchObject({ id: "close", slot: "closing" });
    const total = GROUP_ORDER.reduce((n, g) => n + counts[g], 0);
    expect(interview.questions.filter((q) => !q.slot)).toHaveLength(total - 1);
    expect(interview.stories?.[0].id).toBe("s1");
    expect(interview.settings?.preset).toBe("final");
    expect(interview.round).toBe("final");
    expect(getInterview(interview.id)?.company).toBe("Acme Payroll");
  });

  it("falls back to the standard questions if Claude can't produce a valid plan", async () => {
    fakeClaude("not json", "still not json");
    const { interview, notes } = await buildInterview(input);
    expect(interview.planBy).toBe("templates");
    expect(interview.understanding?.role).toBe("Data Analyst");
    expect(interview.questions.filter((q) => !q.slot)).toHaveLength(GROUP_ORDER.reduce((n, g) => n + counts[g], 0));
    expect(notes[0]).toMatch(/couldn’t build your questions/);
  });

  it("writes new questions that never repeat one in the bank, following your rules", async () => {
    fakeClaude("not json", "still not json");
    const { interview } = await buildInterview(input);
    const withRules = { ...interview, rules: ["No coding questions: this is a payroll analyst job."] };
    const calls = fakeClaude(
      JSON.stringify({ questions: [{ group: "technical", type: "technical", text: "How would you check a payroll run for errors before it goes out?", short: "Checking a payroll run" }, { group: "technical", type: "technical", text: "Which SQL checks would you automate first?", short: "SQL checks" }] }),
      '{"drop":[]}',
    );
    const { added } = await addQuestions(withRules, { technical: 1 });
    expect(calls[0]).toMatch(/No coding questions: this is a payroll analyst job/);
    expect(calls[0]).toMatch(/Questions already written \(do not repeat or reword\)/);
    expect(added).toHaveLength(1);
    expect(added[0].id).toMatch(/^t\d+$/);
    expect(getInterview(interview.id)?.questions.some((q) => q.text.startsWith("How would you check a payroll run"))).toBe(true);
  });

  it("rethinks the job from your feedback", async () => {
    fakeClaude("not json", "still not json");
    const { interview } = await buildInterview(input);
    fakeClaude(
      JSON.stringify({
        understanding: { ...interview.understanding, role: "Payroll Data Analyst", field: "checking payroll data, not building software" },
        rules: ["No software engineering questions."],
      }),
    );
    const r = await rethink(interview, { reasons: ["wrong-kind"], note: "I'm getting software engineering questions", asked: ["Design a distributed system."] });
    expect(r.by).toBe("model");
    expect(r.after.role).toBe("Payroll Data Analyst");
    expect(r.rules).toEqual(["No software engineering questions."]);
  });

  it("without Claude, makes rules only from your words and the questions you skipped", async () => {
    fakeClaude("not json", "still not json");
    const { interview } = await buildInterview(input);
    fakeClaude("not json", "still not json");
    const asked = await rethink(interview, { reasons: ["wrong-kind"], note: "", asked: ["Tell me about a time you led a sales team."] });
    expect(asked.by).toBe("rules");
    expect(asked.rules.join(" ")).not.toMatch(/No questions like/);
    const skipped = await rethink(interview, { reasons: ["wrong-kind", "not-true"], note: "It's an analyst job.", asked: [], skipped: ["Tell me about a time you led a sales team."] });
    expect(skipped.rules).toEqual(["It's an analyst job.", "Only ask about things that are in the CV or the cover letter.", "No questions like: “Tell me about a time you led a sales team.”"]);
  });
});

describe("adding questions in the background", () => {
  it("doesn't bring back an interview deleted while the model was thinking, and keeps rules set meanwhile", async () => {
    fakeClaude(plan(), '{"drop":[]}');
    const { interview } = await buildInterview(input);
    const q = JSON.stringify({ questions: [{ group: "technical", type: "technical", text: "How do you reconcile a payroll run?", short: "Reconciling" }, { group: "technical", type: "technical", text: "Which checks first?", short: "Checks" }] });
    // Deleted during the call: nothing is saved.
    fakeClaude(q, '{"drop":[]}');
    deleteInterview(interview.id);
    await addQuestions(interview, { technical: 1 });
    expect(getInterview(interview.id)).toBeUndefined();
    // Rules written during the call survive: only the questions are replaced.
    saveInterview(interview);
    fakeClaude(q, '{"drop":[]}');
    const pending = addQuestions(interview, { technical: 1 });
    updateInterview(interview.id, (i) => ({ ...i, rules: ["Keep it to payroll."] }));
    await pending;
    const after = getInterview(interview.id)!;
    expect(after.rules).toEqual(["Keep it to payroll."]);
    expect(after.questions.some((x) => x.text.startsWith("How do you reconcile"))).toBe(true);
  });
});
