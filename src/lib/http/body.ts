import { NextResponse } from "next/server";
import type { z } from "zod";

export type Read<T> = { ok: true; data: T } | { ok: false; response: Response };

/**
 * The text of a request body, or null when it is larger than `max` bytes.
 * The size is counted as it arrives, so an oversized body is dropped part-way
 * rather than held in memory and measured afterwards.
 */
export async function readCapped(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > max) return null;
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Reads a JSON body of at most `max` bytes and checks it against a schema.
 * Too large is 413. Not JSON, or not the shape the route accepts, is 400.
 * A route that reads its body this way never hands unchecked input to a store.
 */
export async function readJson<S extends z.ZodType>(req: Request, schema: S, opts: { max?: number; message?: string } = {}): Promise<Read<z.infer<S>>> {
  const raw = await readCapped(req, opts.max ?? 64_000).catch(() => "");
  if (raw === null) return { ok: false, response: NextResponse.json({ error: "too-large", message: "That is too large to save." }, { status: 413 }) };
  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {
    /* not JSON: fails the schema below */
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, response: NextResponse.json({ error: "bad-request", message: opts.message ?? "That couldn’t be saved. Check what you entered and try again." }, { status: 400 }) };
  return { ok: true, data: parsed.data };
}
