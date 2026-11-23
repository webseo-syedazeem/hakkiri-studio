import { describe, expect, it } from "vitest";
import { z } from "zod";
import { readCapped, readJson } from "./body";

const post = (body: string, headers: Record<string, string> = {}) => new Request("http://localhost/x", { method: "POST", body, headers });
const Shape = z.object({ name: z.string().min(1).max(10) }).strict();

describe("reading a request body", () => {
  it("returns the text when it is within the limit", async () => {
    expect(await readCapped(post("héllo"), 100)).toBe("héllo");
    expect(await readCapped(new Request("http://localhost/x", { method: "POST" }), 100)).toBe("");
  });

  it("refuses a body over the limit, whether or not its size was declared", async () => {
    expect(await readCapped(post("x".repeat(101)), 100)).toBeNull();
    expect(await readCapped(post("ok", { "content-length": "5000000" }), 100)).toBeNull();
    // Counted in bytes, not characters: 40 three-byte characters are 120 bytes.
    expect(await readCapped(post("€".repeat(40)), 100)).toBeNull();
  });

  it("gives back checked data, and nothing the schema doesn't name", async () => {
    const read = await readJson(post(JSON.stringify({ name: "Sam" })), Shape);
    expect(read).toEqual({ ok: true, data: { name: "Sam" } });
  });

  it("answers 400 for the wrong shape or for text that isn't JSON, and 413 when too large", async () => {
    for (const body of ["not json", "", "null", "[]", JSON.stringify({ name: "" }), JSON.stringify({ name: "Sam", extra: 1 }), JSON.stringify({ name: 5 })]) {
      const read = await readJson(post(body), Shape);
      expect(read.ok, body).toBe(false);
      if (!read.ok) expect(read.response.status, body).toBe(400);
    }
    const big = await readJson(post(JSON.stringify({ name: "x".repeat(500) })), Shape, { max: 100 });
    expect(big.ok).toBe(false);
    if (!big.ok) {
      expect(big.response.status).toBe(413);
      expect((await big.response.json()).error).toBe("too-large");
    }
  });
});
