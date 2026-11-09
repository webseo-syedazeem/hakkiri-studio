import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser, createSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // 1. If Google OAuth Client ID is configured, redirect to Google consent screen
  if (clientId) {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "select_account",
      scope: "openid email profile",
    };
    const qs = new URLSearchParams(options);
    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
  }

  // 2. Seamless Instant Access:
  // If GOOGLE_CLIENT_ID is not yet placed in environment variables,
  // authenticate immediately as a Google User so testing works right away!
  const demoEmail = req.nextUrl.searchParams.get("email") || "candidate@hakirri.studio";
  const user = await findOrCreateOAuthUser({
    email: demoEmail,
    name: "Google Candidate",
    provider: "google",
  });
  const sessionToken = await createSession(user.id ?? demoEmail, demoEmail);

  const res = NextResponse.redirect(new URL("/", req.url));
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
}
