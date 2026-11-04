import { NextResponse } from "next/server";

function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("hk_auth");
  res.cookies.delete("hk_assessed");
  res.cookies.delete("hk_user");
  res.cookies.delete("hk_user_id");
  res.cookies.delete("hk_role");
  res.cookies.delete("hk_welcomed");
  return res;
}

export function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  return clearAuthCookies(res);
}

export function POST() {
  const res = NextResponse.json({ ok: true, message: "Logged out successfully" });
  return clearAuthCookies(res);
}
