"use client";

/** A failed request, with the server's plain message and any field-by-field messages. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "",
    public fields: Record<string, string> = {},
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Calls the CV API. Throws an ApiError carrying what the server said, or a plain message when there was no answer at all. */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, json === undefined ? rest : { ...rest, headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) }, body: JSON.stringify(json) });
  } catch {
    throw new ApiError(0, "No connection. Check you’re online and try again.", "offline");
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(res.status, typeof body.message === "string" ? body.message : "Something went wrong. Please try again.", typeof body.error === "string" ? body.error : "", (body.fields as Record<string, string>) ?? {}, body);
  return body as T;
}

export const messageOf = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Please try again.");
