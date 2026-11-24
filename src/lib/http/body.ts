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

const tooLarge = () => NextResponse.json({ error: "too-large", message: "That is too large to send." }, { status: 413 });

/**
 * The JSON of a body of at most `max` bytes, for a route that checks the
 * shape itself and has its own words for "that isn't right". `json` is null
 * when the body isn't JSON, which no schema accepts. Too large is the 413 to
 * send back.
 */
export async function readJsonValue(req: Request, max = 64_000): Promise<{ ok: true; json: unknown } | { ok: false; response: Response }> {
  const raw = await readCapped(req, max).catch(() => "");
  if (raw === null) return { ok: false, response: tooLarge() };
  try {
    return { ok: true, json: JSON.parse(raw) };
  } catch {
    return { ok: true, json: null };
  }
}

/**
 * A form (with its uploaded files) of at most `max` bytes in all. The size is
 * counted as the upload arrives and the upload is dropped the moment it goes
 * over, so a huge file is never held in memory to be measured afterwards.
 * `{ok: false}` carries the response: 413 when too large, 400 when it isn't
 * a form at all.
 */
export async function readForm(req: Request, max: number, message = "That couldn’t be read. Try again."): Promise<Read<FormData>> {
  const bad = () => ({ ok: false as const, response: NextResponse.json({ error: "bad-request", message }, { status: 400 }) });
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > max) return { ok: false, response: tooLarge() };
  if (!req.body) return bad();
  let size = 0;
  const counted = req.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > max) controller.error(new Error("too large"));
        else controller.enqueue(chunk);
      },
    }),
  );
  try {
    const form = await new Response(counted, { headers: { "content-type": req.headers.get("content-type") ?? "" } }).formData();
    return { ok: true, data: form };
  } catch {
    return size > max ? { ok: false, response: tooLarge() } : bad();
  }
}
