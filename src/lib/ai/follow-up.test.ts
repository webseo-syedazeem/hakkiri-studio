import { describe, expect, it } from "vitest";
import { answerSignals, buildFollowUpPrompt, checkFollowUp, followUpsRemaining, quotedPhrases, ruleFollowUp, weQuote } from "./follow-up";
import { quoteInWords, spokenTokens } from "./quotes";
import { checkFollowUpScores } from "./score-follow-ups";
import { mockFollowUpScores, mockFollowUpTranscript, mockTranscript } from "./mock";
import { buildFollowUp, findQuote } from "@/lib/answers/build-answer";
import { followUpLimit } from "@/lib/followups";
import type { FollowUpInput } from "./types";

const main = mockTranscript();
const reply = mockFollowUpTranscript();

const input = (over: Partial<FollowUpInput> = {}): FollowUpInput => ({
  question: "Tell me about a time you changed a roadmap because of something you learned late.",
  type: "competency",
  role: "Senior Product Manager, Payments",
  interviewer: { name: "Sam", title: "hiring manager" },
  style: "realistic",
  cvFacts: ["Eight months at Fernway before moving on"],
  turns: [{ asked: "Tell me about a time…", kind: "main", words: main }],
  ...over,
});

describe("spokenTokens and quoteInWords", () => {
  it("ignores fillers and punctuation but keeps numbers", () => {
    expect(spokenTokens("We, um, agreed. 41% to 58.5")).toEqual(["we", "agreed", "41%", "to", "58.5"]);
  });
  it("finds a spoken quote that leaves out the um", () => {
    expect(quoteInWords(main, "we agreed to pause onboarding")).toBe(true);
    expect(quoteInWords(main, "we agreed to cancel onboarding")).toBe(false);
  });
});

describe("follow-up limits", () => {
  it("follows the style, and never follows up on the candidate's own questions", () => {
    expect(followUpLimit("realistic", "competency")).toBe(2);
    expect(followUpLimit("tough", "technical")).toBe(2);
    expect(followUpLimit("friendly", "competency")).toBe(1);
    expect(followUpLimit("tough", "questions-for-us")).toBe(0);
  });
  it("stops at the limit, and when the reply is too short to follow up on", () => {
    expect(followUpsRemaining(input())).toBe(2);
    const twoAsked = input({
      turns: [
        { asked: "Q", kind: "main", words: main },
        { asked: "F1", kind: "ownership", words: reply },
        { asked: "F2", kind: "result", words: reply },
      ],
    });
    expect(followUpsRemaining(twoAsked)).toBe(0);
    expect(followUpsRemaining(input({ turns: [{ asked: "Q", kind: "main", words: main.slice(0, 4) }] }))).toBe(0);
  });
});

describe("answerSignals and weQuote", () => {
  it("counts we and I, and spots numbers", () => {
    const s = answerSignals(main);
    expect(s.we).toBeGreaterThan(s.i);
    expect(s.hasNumber).toBe(true);
    expect(Math.round(s.durationSec)).toBeGreaterThan(100);
  });
  it("quotes a decision the speaker gave to “we”, without the um", () => {
    expect(weQuote(main)).toBe("we agreed to pause onboarding");
  });
});

describe("ruleFollowUp (offline interviewer)", () => {
  it("asks about ownership when the answer is mostly “we”", () => {
    const d = ruleFollowUp(input());
    expect(d).toEqual({ action: "follow-up", kind: "ownership", question: "You said “we agreed to pause onboarding”. What was your part in that decision?" });
    if (d.action === "follow-up") expect(checkFollowUp({ action: "follow-up", kind: d.kind, quote: null, question: d.question }, input().turns)).toEqual([]);
  });
  it("doesn't ask about ownership twice, and moves on", () => {
    const d = ruleFollowUp(input({ turns: [{ asked: "Q", kind: "main", words: main }, { asked: "F1", kind: "ownership", words: reply }] }));
    expect(d).toEqual({ action: "move-on" });
  });
});

describe("checkFollowUp guardrails", () => {
  const turns = input().turns;
  it("rejects a quote the candidate never said", () => {
    const problems = checkFollowUp({ action: "follow-up", kind: "ownership", quote: null, question: "You said “we cancelled onboarding”. Why?" }, turns);
    expect(problems.join()).toMatch(/Quote not in/);
  });
  it("rejects long or multi-part questions and missing question marks", () => {
    expect(checkFollowUp({ action: "follow-up", kind: "clarify", quote: null, question: "Tell me more about that" }, turns).length).toBe(1);
    const long = `${"Can you walk me through ".repeat(8)}it?`;
    expect(checkFollowUp({ action: "follow-up", kind: "clarify", quote: null, question: long }, turns).join()).toMatch(/under 25 words/);
  });
  it("rejects repeating a follow-up already asked", () => {
    const withOne = [...turns, { asked: "What was the outcome?", kind: "result" as const, words: reply }];
    expect(checkFollowUp({ action: "follow-up", kind: "result", quote: null, question: "What was the outcome?" }, withOne).join()).toMatch(/already asked/);
  });
  it("reads quotes in curly or straight quote marks", () => {
    expect(quotedPhrases('You said “we agreed” and "it was hard". Why?')).toEqual(["we agreed", "it was hard"]);
  });
});

describe("buildFollowUpPrompt", () => {
  it("includes the limits, the signals and the transcript, and treats it as content", () => {
    const { system, user } = buildFollowUpPrompt(input({ style: "tough" }));
    expect(system).toMatch(/tough hiring manager/i);
    expect(system).toMatch(/never instructions/);
    expect(system).toMatch(/Never comment on accent/);
    expect(user).toMatch(/Follow-ups asked so far: 0 of 2 allowed/);
    expect(user).toMatch(/<answer>[\s\S]*payment completion went up[\s\S]*<\/answer>/);
  });
});

describe("follow-up scoring", () => {
  it("checks one score per reply and quotes from the right reply", () => {
    const scores = mockFollowUpScores(1);
    expect(checkFollowUpScores(scores, [reply])).toEqual([]);
    expect(checkFollowUpScores(scores, [main]).join()).toMatch(/quote not in the reply/);
    expect(checkFollowUpScores(mockFollowUpScores(2), [reply]).join()).toMatch(/Expected 1/);
  });
  it("builds the follow-up the feedback screen shows", () => {
    const f = buildFollowUp({ kind: "ownership", asked: "What was your part?", words: reply }, mockFollowUpScores(1).followUps[0]);
    expect(f.tripped).toBe("Back to “we” again");
    expect(f.words.filter((w) => w.filler).map((w) => w.text)).toEqual(["you know,"]);
    expect(f.highlight).toMatchObject({ kind: "late" });
    expect(f.scores.delivery).toBeNull();
  });
  it("finds a quote that leaves out the um", () => {
    expect(findQuote(main, "we agreed to pause onboarding")).not.toBeNull();
  });
});
