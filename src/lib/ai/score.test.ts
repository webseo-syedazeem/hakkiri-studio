import { afterEach, describe, expect, it, vi } from "vitest";
import { scoreAnswer } from "./score";
import { mockFollowUpScores, mockFollowUpTranscript, mockScore } from "./mock";
import { roadmapAnswer } from "@/lib/mock-data";
import type { ScoreInput } from "./score-answer";

afterEach(() => vi.unstubAllGlobals());

const reply = (body: unknown) => new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(body) }], usage: { input_tokens: 900, output_tokens: 1500, cache_read_input_tokens: 2300 } }), { status: 200 });

const input: ScoreInput = {
  question: "Tell me about a time you changed a roadmap.",
  type: "competency",
  role: "Senior Product Manager, Payments",
  seniority: "Senior",
  jobSummary: "Payments product role",
  words: roadmapAnswer.words,
  examples: [],
  background: "Product manager at Fernway since 2022.",
  followUps: [{ asked: "What was your part in that decision?", words: mockFollowUpTranscript() }],
};

describe("scoring an answer and its follow-ups in one call", () => {
  it("sends one cached request and splits the reply", async () => {
    const fetchMock = vi.fn(async () => reply({ ...mockScore(), followUps: mockFollowUpScores(1).followUps }));
    vi.stubGlobal("fetch", fetchMock);
    const { result, followUps } = await scoreAnswer(input);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.oneFix).toBe(mockScore().oneFix);
    expect("followUps" in result).toBe(false);
    expect(followUps?.followUps).toHaveLength(1);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    const [cached, rest] = body.messages[0].content;
    expect(cached.cache_control).toEqual({ type: "ephemeral" });
    expect(cached.text).toContain("<cv>");
    expect(rest.text).toContain("What was your part in that decision?");
    expect(body.max_tokens).toBe(2700);
  });

  it("asks again when the follow-up scores are missing, then gives up", async () => {
    const fetchMock = vi.fn(async () => reply(mockScore()));
    vi.stubGlobal("fetch", fetchMock);
    await expect(scoreAnswer(input)).rejects.toThrow(/Expected 1 follow-up scores, got 0/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retry = JSON.parse(String((fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body));
    expect(retry.messages[0].content[1].text).toMatch(/Your last reply had these problems/);
    // The cached part is unchanged on the retry, so it's still read from the cache.
    expect(retry.messages[0].content[0]).toEqual(JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)).messages[0].content[0]);
  });

  it("returns no follow-ups when there were none", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => reply(mockScore())));
    const { followUps } = await scoreAnswer({ ...input, followUps: [] });
    expect(followUps).toBeNull();
  });
});
