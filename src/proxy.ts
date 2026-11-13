import { NextResponse, type NextRequest } from "next/server";

/**
 * Global edge/proxy guard:
 * 1. Blocks cross-site request forgery (CSRF) on mutating API calls.
 * 2. Bounces cookie-less requests to protected pages before Server Components render,
 *    preventing RSC data streaming leaks on unauthenticated redirects.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. API routes: protect against cross-site CSRF on mutating requests
  if (pathname.startsWith("/api/")) {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      return NextResponse.next();
    }
    const site = req.headers.get("sec-fetch-site");
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    let foreign = site === "cross-site" || site === "same-site";
    if (!foreign && origin && origin !== "null" && host) {
      try {
        foreign = new URL(origin).host !== host;
      } catch {
        foreign = true;
      }
    }
    if (foreign) {
      return NextResponse.json(
        { error: "forbidden", message: "That request came from another website." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Allow public pages and static files
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/landing" ||
    pathname === "/present" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Protected studio and live pages: bounce unauthenticated requests immediately
  const sessionToken = req.cookies.get("hakkiri_session")?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next|login|signup|privacy|terms|present|landing|robots.txt|sitemap.xml|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|$).*)",
  ],
};
