import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter your email and password." },
        { status: 400 },
      );
    }

    const result = await authenticateUser(email, password);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 401 },
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
    console.error("[api/auth/login] error:", err);
    return NextResponse.json(
      { ok: false, error: "Authentication failed. Please try again." },
      { status: 500 },
    );
  }
}
