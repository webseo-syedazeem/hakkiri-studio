import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser, createSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (error || !code) {
    console.warn("[google/callback] OAuth error or missing code:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error ?? "Google sign-in cancelled")}`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+not+fully+configured", origin));
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errJson = await tokenRes.json().catch(() => ({}));
      console.error("[google/callback] Token exchange error:", errJson);
      return NextResponse.redirect(new URL("/login?error=Google+token+exchange+failed", origin));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/login?error=Failed+to+fetch+Google+profile", origin));
    }

    const profile = (await userRes.json()) as { email: string; name?: string; picture?: string; sub?: string };
    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=No+email+provided+by+Google", origin));
    }

    // 3. Find or create user in MongoDB
    const user = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      provider: "google",
      providerId: profile.sub,
    });

    // 4. Create session and set cookie
    const sessionToken = await createSession(user.id ?? profile.email, profile.email);

    const res = NextResponse.redirect(new URL("/", origin));
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
    console.error("[google/callback] OAuth callback failure:", err);
    return NextResponse.redirect(new URL("/login?error=Google+sign-in+failed", origin));
  }
}
