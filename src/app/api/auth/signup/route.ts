import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/auth/user-db";
import { clientKey, rateLimited } from "@/lib/usage/limits";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = clientKey(req);
    // Max 5 signup attempts per 10 minutes per IP
    if (rateLimited(`auth:signup:${ip}`, 5, 10 * 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Too many sign-up attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as { email?: string; password?: string; name?: string };
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    const result = await createUser(email, password, name ?? "");
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }

    // Create session
    const sessionToken = await createSession(result.user.id ?? email, email);

    const response = NextResponse.json({
      ok: true,
      user: result.user,
    });

    response.cookies.set({
      name: "hakkiri_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error("[api/auth/signup] error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
