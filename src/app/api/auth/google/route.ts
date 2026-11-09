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

  // 2. If GOOGLE_CLIENT_ID is not configured in Vercel environment variables,
  // redirect to the Google Sign-in screen where the candidate can enter their actual Google email and password:
  return NextResponse.redirect(new URL("/login/google", req.url));
}
