import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth/admin";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { authenticateUser, createSession } from "@/lib/auth/user-db";
import { readJson } from "@/lib/http/body";
import { clientKey, noteHit, rateLimited, recentHits } from "@/lib/usage/limits";

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().max(400), password: z.string().max(2000) });

/** Wrong passwords allowed for one account before it has to wait. */
const FAILS = 10;
const FAIL_WINDOW = 15 * 60_000;

export async function POST(req: NextRequest) {
  try {
    // At most 10 tries a minute from one address.
    if (rateLimited(`auth:login:${clientKey(req)}`, 10, 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const read = await readJson(req, Body, { max: 8_000 });
    if (!read.ok) return NextResponse.json({ ok: false, error: "Please enter your email and password." }, { status: read.response.status });
    const { email, password } = read.data;
    if (!email.trim() || !password) {
      return NextResponse.json({ ok: false, error: "Please enter your email and password." }, { status: 400 });
    }

    // And at most 10 wrong passwords in 15 minutes for one account, whichever addresses they come from:
    // guessing a password from many machines at once is slowed just the same. The count is kept against a
    // hash of the address, and it is the same answer whether or not the account exists.
    const failKey = `auth:fail:${createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32)}`;
    if (recentHits(failKey, FAIL_WINDOW) >= FAILS) {
      return NextResponse.json(
        { ok: false, error: "Too many wrong passwords for this account. Wait 15 minutes, then try again." },
        { status: 429 },
      );
    }

    const result = await authenticateUser(email, password);
    if (!result.ok) {
      noteHit(failKey);
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }

    const sessionToken = await createSession(result.user.id as string, result.user.email as string);
    const response = NextResponse.json({
      ok: true,
      user: { ...result.user, isAdmin: isAdminUser(result.user) },
    });
    response.cookies.set(sessionCookie(sessionToken, req));
    return response;
  } catch (err) {
    console.error("[api/auth/login] error:", err);
    return NextResponse.json(
      { ok: false, error: "Authentication failed. Please try again." },
      { status: 500 },
    );
  }
}
