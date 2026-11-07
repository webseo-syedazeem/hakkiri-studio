import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("hakkiri_session")?.value;
    if (sessionCookie) {
      await deleteSession(sessionCookie);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.delete("hakkiri_session");
    return response;
  } catch (err) {
    console.error("[api/auth/logout] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("hakkiri_session")?.value;
    if (sessionCookie) {
      await deleteSession(sessionCookie);
    }
  } catch (err) {
    console.error("[api/auth/logout] error:", err);
  }
  const response = NextResponse.redirect(new URL("/landing", req.url));
  response.cookies.delete("hakkiri_session");
  return response;
}
