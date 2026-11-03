import { NextResponse } from "next/server";

export function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete("hk_auth");
  res.cookies.delete("hk_assessed");
  res.cookies.delete("hk_user");
  res.cookies.delete("hk_welcomed");
  return res;
}
