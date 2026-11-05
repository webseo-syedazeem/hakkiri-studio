import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("hakkiri_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await validateSession(sessionCookie);
    if (!user) {
      const response = NextResponse.json({ authenticated: false, user: null });
      // Clear invalid cookie
      response.cookies.delete("hakkiri_session");
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err) {
    console.error("[api/auth/me] error:", err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
