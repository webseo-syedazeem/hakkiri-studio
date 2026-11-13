import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("hakkiri_session")?.value;
    if (sessionCookie) {
      await deleteSession(sessionCookie);
    }
    const response = NextResponse.redirect(new URL("/login", req.url), 303);
    response.cookies.delete("hakkiri_session");
    return response;
  } catch (err) {
    console.error("[logout] error:", err);
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }
}

/**
 * Reject GET requests to prevent cross-site GET-based logout via image tags or links.
 */
export async function GET() {
  return new NextResponse("Method Not Allowed. Use POST to log out.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
