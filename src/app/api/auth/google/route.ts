import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // 1. If Google OAuth Client ID is configured, redirect to Google consent screen
  if (clientId) {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    // Cryptographic state & PKCE code challenge
    const state = crypto.randomBytes(32).toString("hex");
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "select_account",
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    };
    const qs = new URLSearchParams(options);

    const res = NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
    res.cookies.set({
      name: "g_oauth_state",
      value: JSON.stringify({ state, codeVerifier }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });
    return res;
  }

  // 2. If GOOGLE_CLIENT_ID is not configured in Vercel environment variables,
  // redirect to login with a clear informational error message:
  return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
}
