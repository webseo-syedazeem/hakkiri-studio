import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser, createSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Verify OAuth state and PKCE verifier
  const oauthCookie = req.cookies.get("g_oauth_state")?.value;
  let storedState: string | undefined;
  let storedVerifier: string | undefined;
  if (oauthCookie) {
    try {
      const parsed = JSON.parse(oauthCookie);
      storedState = parsed.state;
      storedVerifier = parsed.codeVerifier;
    } catch {
      // invalid cookie JSON
    }
  }

  if (!state || !storedState || state !== storedState || !storedVerifier) {
    console.warn("[google/callback] OAuth state mismatch or missing verifier");
    const errRes = NextResponse.redirect(new URL("/login?error=invalid_state", origin));
    errRes.cookies.delete("g_oauth_state");
    return errRes;
  }

  if (error || !code) {
    console.warn("[google/callback] OAuth error or missing code:", error);
    const errRes = NextResponse.redirect(new URL("/login?error=google_cancelled", origin));
    errRes.cookies.delete("g_oauth_state");
    return errRes;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[google/callback] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    const errRes = NextResponse.redirect(new URL("/login?error=google_not_configured", origin));
    errRes.cookies.delete("g_oauth_state");
    return errRes;
  }

  try {
    // 1. Exchange authorization code for tokens (with PKCE code_verifier)
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: storedVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const errJson = await tokenRes.json().catch(() => ({}));
      console.error("[google/callback] Token exchange error:", errJson);
      return NextResponse.redirect(new URL("/login?error=google_token_failed", origin));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      console.error("[google/callback] Failed to fetch Google profile");
      return NextResponse.redirect(new URL("/login?error=google_profile_failed", origin));
    }

    const profile = (await userRes.json()) as {
      email: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=no_email_provided", origin));
    }

    if (profile.email_verified === false) {
      return NextResponse.redirect(new URL("/login?error=google_email_unverified", origin));
    }

    // 3. Find or create user in MongoDB
    const user = await findOrCreateOAuthUser({
      email: profile.email.toLowerCase().trim(),
      name: profile.name,
      picture: profile.picture,
      provider: "google",
      providerId: profile.sub,
    });

    // 4. Create session and set cookie
    const sessionToken = await createSession(user.id ?? profile.email, profile.email);

    const res = NextResponse.redirect(new URL("/dashboard", origin));
    res.cookies.set({
      name: "hakkiri_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    res.cookies.delete("g_oauth_state");

    return res;
  } catch (err) {
    console.error("[google/callback] OAuth callback exception:", err);
    return NextResponse.redirect(new URL("/login?error=google_failed", origin));
  }
}
