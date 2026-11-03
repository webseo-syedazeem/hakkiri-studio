import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { usageFor, allUsage } from "@/lib/usage/store";

const call = (body: unknown, ip = "198.51.100.7") => POST(new Request("http://x/api/voice", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/voice", () => {
  it("says no (501) without an ElevenLabs key, so the browser voice is used", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    expect((await call({ text: "Tell me about yourself.", voice: "medium" })).status).toBe(501);
  });

  it("says no in test mode, so nothing is spent", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    vi.stubEnv("HAKKIRI_MOCK_AI", "1");
    expect((await call({ text: "Hello", voice: "easy" })).status).toBe(501);
  });

  it("asks ElevenLabs for the difficulty's voice and records the characters", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    vi.stubEnv("HAKKIRI_MOCK_AI", "");
    const fetchMock = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { "content-type": "audio/mpeg" } }));
    vi.stubGlobal("fetch", fetchMock);
    const before = allUsage().filter((e) => e.service === "elevenlabs").length;
    const res = await call({ text: "Walk me through a time you disagreed with your manager.", voice: "hard" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("audio/mpeg");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/v1/text-to-speech/onwK4e9ZLuTAKqWW03F9");
    expect((init.headers as Record<string, string>)["xi-api-key"]).toBe("test-key");
    expect(JSON.parse(String(init.body))).toMatchObject({ model_id: "eleven_flash_v2_5" });
    const voice = allUsage().filter((e) => e.service === "elevenlabs");
    expect(voice.length).toBe(before + 1);
    expect(voice.at(-1)).toMatchObject({ characters: 55, feature: "voice" });
    expect(usageFor({}).length).toBeGreaterThan(0);
  });

  it("hands back to the browser voice (502) if ElevenLabs fails", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    vi.stubEnv("HAKKIRI_MOCK_AI", "");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("quota exceeded", { status: 401 })));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await call({ text: "Why this role?", voice: "medium" }, "198.51.100.8")).status).toBe(502);
  });

  it("rejects empty text", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    vi.stubEnv("HAKKIRI_MOCK_AI", "");
    expect((await call({ text: "  ", voice: "medium" }, "198.51.100.9")).status).toBe(400);
  });
});
