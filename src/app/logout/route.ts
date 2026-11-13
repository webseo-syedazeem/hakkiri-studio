import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/user-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("hakkiri_session")?.value;
    if (sessionCookie) {
      await deleteSession(sessionCookie);
    }
  } catch (err) {
    console.error("[logout] error:", err);
  }
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.delete("hakkiri_session");
  return response;
}
