import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth/admin";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { createUser, createSession } from "@/lib/auth/user-db";
import { readJson } from "@/lib/http/body";
import { clientKey, rateLimited } from "@/lib/usage/limits";

export const dynamic = "force-dynamic";

// Lengths are checked again, with messages for the person, when the account is made.
const Body = z.object({ email: z.string().max(400), password: z.string().max(2000), name: z.string().max(400).optional() });

export async function POST(req: NextRequest) {
  try {
    // At most 5 sign-ups in 10 minutes from one address.
    if (rateLimited(`auth:signup:${clientKey(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Too many sign-up attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }

    const read = await readJson(req, Body, { max: 8_000 });
    if (!read.ok) return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: read.response.status });
    const { email, password, name } = read.data;
    if (!email.trim() || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
    }

    const result = await createUser(email, password, name ?? "");
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    const sessionToken = await createSession(result.user.id as string, result.user.email as string);
    const response = NextResponse.json({
      ok: true,
      user: { ...result.user, isAdmin: isAdminUser(result.user) },
    });
    response.cookies.set(sessionCookie(sessionToken, req));
    return response;
  } catch (err) {
    console.error("[api/auth/signup] error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
