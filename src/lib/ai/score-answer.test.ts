import { describe, expect, it } from "vitest";
import { buildScorePrompt, checkScoreResult, checkScoreWithFollowUps, ScoreResultSchema, ScoreWithFollowUpsSchema, type ScoreInput, type ScoreResult } from "./score-answer";
import { roadmapAnswer } from "@/lib/mock-data";
import { mockFollowUpScores, mockFollowUpTranscript } from "./mock";

const good: ScoreResult = {
  content: { score: 4, evidence: ["payment completion went up from 41% to 58% in six weeks"] },
  structure: { score: 3, evidence: ["I took that to my director"] },
  pointSentence: "I took that to my director and we, um, agreed to pause onboarding and move two engineers onto payments for six weeks.",
  fillerPhrases: ["like", "you know"],
  strength: "A specific result with numbers and a timeframe.",
  oneFix: "Open with the decision, then the reason.",
  notes: [{ tone: "fix", title: "Lead with the decision", body: "It arrives at 0:52.", quote: "I took that to my director" }],
  strongerVersion: "I paused a quarter's roadmap because 60% of new users dropped at payment. Completion went from 41% to 58%.",
};

describe("ScoreResultSchema", () => {
  it("accepts a well-formed result", () => {
    expect(ScoreResultSchema.safeParse(good).success).toBe(true);
  });
  it("rejects a score outside 1–5", () => {
    expect(ScoreResultSchema.safeParse({ ...good, content: { score: 7, evidence: [] } }).success).toBe(false);
  });
});

describe("checkScoreResult", () => {
  it("passes when quotes and numbers come from the answer", () => {
    expect(checkScoreResult(good, roadmapAnswer.words)).toEqual([]);
  });
  it("catches an invented quote", () => {
    const bad = { ...good, notes: [{ ...good.notes[0], quote: "I single-handedly saved the company" }] };
    expect(checkScoreResult(bad, roadmapAnswer.words)[0]).toMatch(/Quote not in transcript/);
  });
  it("catches a number added to the stronger version", () => {
    const bad = { ...good, strongerVersion: "Completion went from 41% to 75%." };
    expect(checkScoreResult(bad, roadmapAnswer.words)).toContain("Stronger version adds a number the speaker never said: 75");
  });
});

describe("buildScorePrompt", () => {
  it("includes the profile and the rule against judging accent", () => {
    const { system, user } = buildScorePrompt({
      question: "Tell me about a time you changed a roadmap.",
      type: "competency",
      role: "Senior Product Manager, Payments",
      seniority: "Senior",
      jobSummary: "Payments product role",
      words: roadmapAnswer.words,
      examples: [],
    });
    expect(system).toMatch(/Never judge accent/);
    expect(user).toMatch(/Target length: 1:30 to 2:00/);
    expect(user).toMatch(/<transcript>/);
  });
});

describe("the stronger version uses your CV, not generic facts", () => {
  const cv = "Product manager at Fernway since 2022. Led a team of 5. Payment completion rose to 75% after the redesign.";
  it("allows a number from your CV, and still catches one from nowhere", () => {
    const fromCv = { ...good, strongerVersion: "I led a team of 5. Completion went from 41% to 75%." };
    expect(checkScoreResult(fromCv, roadmapAnswer.words, [cv])).toEqual([]);
    const invented = { ...good, strongerVersion: "Completion went from 41% to 90%." };
    expect(checkScoreResult(invented, roadmapAnswer.words, [cv])).toContain("Stronger version adds a number the speaker never said: 90");
  });
  it("gives the CV to the model with the same-story rule", () => {
    const { system, context } = buildScorePrompt({ question: "Tell me about a time you changed the roadmap.", type: "competency", role: "PM", seniority: "Senior", jobSummary: "Payments", words: roadmapAnswer.words, examples: [], background: cv });
    expect(system).toMatch(/only when it belongs to the same story/);
    expect(context).toContain("<cv>");
    const without = buildScorePrompt({ question: "Q?", type: "competency", role: "PM", seniority: "Senior", jobSummary: "Payments", words: roadmapAnswer.words, examples: [] });
    expect(without.context).not.toContain("<cv>");
    expect(without.system).toMatch(/must not add any fact/);
  });
});

describe("one call per answer, with the job and CV cached", () => {
  const cv = "Product manager at Fernway since 2022. Led a team of 5.";
  const base: ScoreInput = { question: "Tell me about a time you changed a roadmap.", type: "competency", role: "PM", seniority: "Senior", jobSummary: "Payments", words: roadmapAnswer.words, examples: [], background: cv };
  const reply = mockFollowUpTranscript();

  it("keeps everything that changes per question out of the cached part", () => {
    const a = buildScorePrompt(base);
    const b = buildScorePrompt({ ...base, question: "Why do you want this job?", type: "why-us", words: reply, followUps: [{ asked: "What was your part?", words: reply }] });
    expect(b.system).toBe(a.system);
    expect(b.context).toBe(a.context);
    expect(a.context).not.toMatch(/Question:|<transcript>/);
    expect(b.user).toMatch(/<follow-up n="1">\nInterviewer asked: What was your part\?/);
    expect(a.user).not.toMatch(/<follow-up/);
  });

  it("checks each follow-up score against its own reply", () => {
    const input = { ...base, followUps: [{ asked: "What was your part?", words: reply }] };
    const ok = { ...good, followUps: mockFollowUpScores(1).followUps };
    expect(ScoreWithFollowUpsSchema.safeParse(ok).success).toBe(true);
    expect(checkScoreWithFollowUps(ok, input)).toEqual([]);
    expect(checkScoreWithFollowUps(good, input).join()).toMatch(/Expected 1 follow-up scores, got 0/);
    expect(checkScoreWithFollowUps(ok, base).join()).toMatch(/no follow-up questions/);
    const wrongPlace = { ...ok, followUps: [{ ...ok.followUps[0], note: { ...ok.followUps[0].note, quote: "I took that to my director" } }] };
    expect(checkScoreWithFollowUps(wrongPlace, input).join()).toMatch(/quote not in the reply/);
  });
});
