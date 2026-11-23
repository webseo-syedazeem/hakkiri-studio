/** Where to send someone after they sign in: an address inside this app, or the app's home. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || typeof next !== "string" || next.length > 500) return fallback;
  // One leading slash and nothing that a browser would read as another site ("//host", "/\\host") or a scheme.
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || /[\u0000-\u001f]/.test(next)) return fallback;
  if (next === "/" || /^\/(login|signup|logout|api)(\/|\?|$)/.test(next)) return fallback;
  return next;
}
