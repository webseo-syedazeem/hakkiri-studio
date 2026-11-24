import { describe, expect, it } from "vitest";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { readCapped, readForm, readJson, readJsonValue } from "./body";
import { audioType, servableAudioType, sniffAudio } from "./sniff";

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

describe("a route with its own words for a bad request", () => {
  it("gets the parsed JSON, null when it isn't JSON, and a 413 when it is too large", async () => {
    expect(await readJsonValue(post(JSON.stringify({ a: 1 })), 100)).toEqual({ ok: true, json: { a: 1 } });
    expect(await readJsonValue(post("{ nope"), 100)).toEqual({ ok: true, json: null });
    expect(await readJsonValue(post(""), 100)).toEqual({ ok: true, json: null });
    const big = await readJsonValue(post(JSON.stringify({ a: "x".repeat(500) })), 100);
    expect(big.ok).toBe(false);
    if (!big.ok) expect(big.response.status).toBe(413);
  });
});

describe("an upload", () => {
  const upload = (bytes: number, extra: Record<string, string> = {}) => {
    const form = new FormData();
    form.set("audio", new Blob([new Uint8Array(bytes)], { type: "audio/webm" }), "answer.webm");
    form.set("k", "2");
    return new Request("http://localhost/x", { method: "POST", body: form, headers: extra });
  };

  it("is read when it is within the limit, with its fields and files", async () => {
    const read = await readForm(upload(1000), 10_000);
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(read.data.get("k")).toBe("2");
    expect((read.data.get("audio") as Blob).size).toBe(1000);
  });

  it("is refused with 413 when it is over the limit, whether or not its size was declared", async () => {
    const over = await readForm(upload(50_000), 10_000);
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.response.status).toBe(413);
    const declared = await readForm(new Request("http://localhost/x", { method: "POST", body: "x", headers: { "content-type": "multipart/form-data; boundary=x", "content-length": "99999999" } }), 10_000);
    expect(declared.ok).toBe(false);
    if (!declared.ok) expect(declared.response.status).toBe(413);
  });

  it("is a 400, with the route's own words, when it isn't a form at all", async () => {
    for (const req of [post(JSON.stringify({ audio: "x" }), { "content-type": "application/json" }), post("plain text"), new Request("http://localhost/x", { method: "POST" })]) {
      const read = await readForm(req, 10_000, "Missing the recording.");
      expect(read.ok).toBe(false);
      if (!read.ok) {
        expect(read.response.status).toBe(400);
        expect(((await read.response.json()) as { message: string }).message).toBe("Missing the recording.");
      }
    }
  });
});

describe("what a file is, read from the file", () => {
  const bytes = (...head: number[]) => new Uint8Array([...head, ...new Array(Math.max(0, 16 - head.length)).fill(0)]);
  const text = (t: string) => new TextEncoder().encode(t.padEnd(16, " "));

  it("knows the recordings browsers make", () => {
    expect(audioType(bytes(0x1a, 0x45, 0xdf, 0xa3))).toBe("audio/webm");
    expect(audioType(text("OggS"))).toBe("audio/ogg");
    expect(audioType(text("\0\0\0 ftypM4A "))).toBe("audio/mp4");
    expect(audioType(text("RIFF....WAVEfmt "))).toBe("audio/wav");
    expect(audioType(text("fLaC"))).toBe("audio/flac");
    expect(audioType(text("ID3"))).toBe("audio/mpeg");
    expect(audioType(bytes(0xff, 0xfb, 0x90))).toBe("audio/mpeg");
  });

  it("is not fooled by the name or the type a file is sent with", async () => {
    for (const fake of ["<!doctype html><script>alert(1)</script>", "<svg onload=alert(1)>", "%PDF-1.7 not audio", "GIF89a not audio", "{\"audio\": true}", "RIFF....AVI LIST", ""]) {
      expect(audioType(text(fake)), fake).toBeNull();
      expect(await sniffAudio(new Blob([fake], { type: "audio/webm" })), fake).toBeNull();
    }
    expect(audioType(new Uint8Array([0x1a, 0x45, 0xdf]))).toBeNull();
    expect(await sniffAudio(new Blob([bytes(0x1a, 0x45, 0xdf, 0xa3)], { type: "text/html" }))).toBe("audio/webm");
  });

  it("a saved recording is only ever served as audio", () => {
    expect(servableAudioType("audio/webm;codecs=opus")).toBe("audio/webm");
    expect(servableAudioType("audio/mp4")).toBe("audio/mp4");
    for (const bad of ["text/html", "image/svg+xml", "application/javascript", "", undefined]) expect(servableAudioType(bad), String(bad)).toBe("audio/webm");
  });
});

describe("every route reads its body through these", () => {
  const root = path.join(process.cwd(), "src/app/api");
  const routes = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? routes(path.join(dir, e.name)) : e.name === "route.ts" ? [path.join(dir, e.name)] : []));

  it("no route outside the CV and Apply sections reads an unlimited body", () => {
    const raw: string[] = [];
    for (const file of routes(root)) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      // Those two sections have their own body handling and are checked by their own tests.
      if (rel.startsWith("cv/") || rel.startsWith("apply/")) continue;
      const source = fs.readFileSync(file, "utf8");
      for (const call of source.match(/\b(req|request)\.(json|formData|text|arrayBuffer|blob)\(\)/g) ?? []) raw.push(`${rel}: ${call}`);
    }
    expect(raw).toEqual([]);
  });

  it("a route file exports only its handlers and Next's own settings", () => {
    const allowed = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "runtime", "dynamic", "maxDuration", "revalidate", "fetchCache", "preferredRegion"]);
    const extra: string[] = [];
    for (const file of routes(root)) {
      const source = fs.readFileSync(file, "utf8");
      for (const m of source.matchAll(/^export (?:async )?(?:function|const|let|class) (\w+)/gm)) if (!allowed.has(m[1])) extra.push(`${path.relative(root, file)}: ${m[1]}`);
    }
    expect(extra).toEqual([]);
  });
});
