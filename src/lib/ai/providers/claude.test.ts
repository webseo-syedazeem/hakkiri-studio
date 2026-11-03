import { afterEach, describe, expect, it, vi } from "vitest";
import { callClaude, modelFields } from "./claude";
import { allUsage } from "@/lib/usage/store";

afterEach(() => vi.unstubAllGlobals());

describe("model-specific request fields", () => {
  it("never sends temperature to Claude 5-generation models, and turns their thinking off", () => {
    expect(modelFields("claude-sonnet-5", 0)).toEqual({ thinking: { type: "disabled" } });
    expect(modelFields("claude-haiku-5-5", 0.3)).toEqual({ thinking: { type: "disabled" } });
    expect(modelFields("claude-sonnet-5-5", 0)).toEqual({ thinking: { type: "between_tools" } });
    expect(modelFields("claude-opus-5-5", 0.2)).toEqual({});
  });

  it("keeps temperature for older models", () => {
    expect(modelFields("claude-haiku-4-5-20251001", 0.3)).toEqual({ temperature: 0.3 });
  });

  it("sends the right body, reads only text blocks and records usage", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ content: [{ type: "thinking", thinking: "" }, { type: "text", text: '{"ok":true}' }], usage: { input_tokens: 100, output_tokens: 20 } }), { status: 200, headers: { "content-type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const text = await callClaude({ model: "claude-sonnet-5", system: "s", user: "u", maxTokens: 50, temperature: 0, label: "test" }, { apiKey: "k" });
    expect(text).toBe('{"ok":true}');
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.temperature).toBeUndefined();
    expect(body.thinking).toEqual({ type: "disabled" });
    expect(body.max_tokens).toBe(50);
    expect(body.messages[0].content).toBe("u");
  });

  it("caches the shared context, and counts cache reads and writes in the cost", async () => {
    const usage = { input_tokens: 800, output_tokens: 1000, cache_creation_input_tokens: 2000, cache_read_input_tokens: 0 };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "{}" }], usage }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await callClaude({ model: "claude-sonnet-5", system: "s", context: "job and CV", user: "question and transcript", maxTokens: 50, label: "cache-test" }, { apiKey: "k" });
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.messages[0].content).toEqual([
      { type: "text", text: "job and CV", cache_control: { type: "ephemeral" } },
      { type: "text", text: "question and transcript" },
    ]);
    const entry = allUsage().filter((e) => e.label === "cache-test").at(-1)!;
    expect(entry.cacheWriteTokens).toBe(2000);
    // 800 in at $2, 1,000 out at $10, 2,000 written at $2.50 (per million)
    expect(entry.costUsd).toBeCloseTo((800 * 2 + 1000 * 10 + 2000 * 2.5) / 1e6, 9);
  });
});
