/**
 * The sign-in cookie, set the same way wherever a session starts: not
 * readable by scripts on the page, sent on ordinary navigation from other
 * sites but not on their form posts or requests (SameSite=Lax), and sent over
 * HTTPS only everywhere except a server running on this machine.
 */
export const SESSION_COOKIE = "hakkiri_session";
export const SESSION_DAYS = 30;

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * HTTPS-only in production, unless the request really is to this machine
 * (a local `next start`, where there is no HTTPS and some browsers refuse a
 * Secure cookie). Behind a proxy the forwarded scheme decides.
 */
export function cookieIsSecure(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (req.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https") return true;
  try {
    const url = new URL(req.url);
    if (url.protocol === "https:") return true;
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
    return !LOOPBACK.has(new URL(`http://${host}`).hostname);
  } catch {
    return true;
  }
}

export function sessionCookie(token: string, req: Request) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: cookieIsSecure(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
