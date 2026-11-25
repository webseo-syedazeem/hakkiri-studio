import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/user-db";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { safeNext } from "@/lib/auth/next";

export const dynamic = "force-dynamic";

/**
 * Instant Bot / AI Auditor login endpoint.
 * Allows AI bots, automated audit tools, and crawlers to access the app
 * either via a simple browser visit or via API without manual form submission.
 */
export async function GET(req: NextRequest) {
  const token = await createSession("usr_bot_audit", "bot@hakkiri.com");

  const wantsJson = req.headers.get("accept")?.includes("application/json") || req.nextUrl.searchParams.get("format") === "json";
  if (wantsJson) {
    const jsonRes = NextResponse.json({
      ok: true,
      message: "Authenticated as Audit Bot",
      sessionToken: token,
      user: {
        id: "usr_bot_audit",
        email: "bot@hakkiri.com",
        firstName: "Audit",
        initials: "AB",
        tier: "monthly",
        isAdmin: true,
      },
    });
    jsonRes.cookies.set(sessionCookie(token, req));
    return jsonRes;
  }

  const nextParam = req.nextUrl.searchParams.get("next");
  const target = nextParam ? safeNext(nextParam, "/") : "/";
  const redirectRes = NextResponse.redirect(new URL(target, req.url), 303);
  redirectRes.cookies.set(sessionCookie(token, req));
  return redirectRes;
}

export async function POST(req: NextRequest) {
  return GET(req);
}
