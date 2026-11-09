import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser, createSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : email.split("@")[0]?.replace(/[._]/g, " ") || "Google User";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid Google email address." }, { status: 400 });
    }

    const user = await findOrCreateOAuthUser({
      email,
      name,
      provider: "google",
    });

    const sessionToken = await createSession(user.id ?? email, email);

    const res = NextResponse.json({ ok: true, email: user.email, name: user.firstName });
    res.cookies.set({
      name: "hakkiri_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("[google/submit] Error signing in with Google:", err);
    return NextResponse.json({ error: "Could not sign in with Google. Please try again." }, { status: 500 });
  }
}
