import { NextResponse } from "next/server";

export function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/studio";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/studio";

  const res = NextResponse.redirect(new URL(safe, req.url));
  res.cookies.set("hk_auth", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  res.cookies.set("hk_assessed", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  res.cookies.set("hk_welcomed", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
