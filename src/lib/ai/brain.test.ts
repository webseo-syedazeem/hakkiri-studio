import { afterEach, describe, expect, it, vi } from "vitest";
import { ClaudeInterviewerBrain } from "./brain";
import { mockTranscript } from "./mock";
import type { FollowUpInput } from "./types";

const input: FollowUpInput = {
  question: "Tell me about a time you changed a roadmap because of something you learned late.",
  type: "competency",
  role: "Senior Product Manager, Payments",
  interviewer: { name: "Sam", title: "hiring manager" },
  style: "realistic",
  cvFacts: [],
  turns: [{ asked: "Q", kind: "main", words: mockTranscript() }],
};

/** Fakes the Claude Messages API, replying with each text in turn. */
function fakeClaude(...replies: string[]) {
  const calls: { model: string; user: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      calls.push({ model: body.model, user: body.messages[0].content });
      const text = replies[Math.min(calls.length - 1, replies.length - 1)];
      return new Response(JSON.stringify({ content: [{ type: "text", text }] }), { status: 200 });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("ClaudeInterviewerBrain", () => {
  it("asks the follow-up the fast model chose", async () => {
    const calls = fakeClaude('{"action":"follow-up","kind":"ownership","quote":"we agreed to pause onboarding","question":"You said “we agreed to pause onboarding”. What was your part?"}');
    const d = await new ClaudeInterviewerBrain().decideFollowUp(input);
    expect(d).toEqual({ action: "follow-up", kind: "ownership", question: "You said “we agreed to pause onboarding”. What was your part?" });
    expect(calls[0].model).toMatch(/haiku/);
  });

  it("retries once when the quote is made up, telling the model why", async () => {
    const calls = fakeClaude(
      '{"action":"follow-up","kind":"ownership","quote":"we cancelled it","question":"You said “we cancelled it”. Why?"}',
      '{"action":"follow-up","kind":"result","quote":null,"question":"How did you measure that?"}',
    );
    const d = await new ClaudeInterviewerBrain().decideFollowUp(input);
    expect(d).toMatchObject({ kind: "result" });
    expect(calls[1].user).toMatch(/Quote not in what the candidate said/);
  });

  it("moves on when the model keeps failing the checks", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fakeClaude("not json at all");
    expect(await new ClaudeInterviewerBrain().decideFollowUp(input)).toEqual({ action: "move-on" });
  });

  it("doesn't call the model once the limit is reached", async () => {
    const calls = fakeClaude('{"action":"move-on"}');
    const full = { ...input, style: "friendly" as const, turns: [...input.turns, { asked: "F1", kind: "ownership" as const, words: mockTranscript() }] };
    expect(await new ClaudeInterviewerBrain().decideFollowUp(full)).toEqual({ action: "move-on" });
    expect(calls).toHaveLength(0);
  });
});
