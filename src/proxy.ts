import { NextResponse, type NextRequest } from "next/server";

/**
 * Global edge/proxy guard:
 * 1. Blocks cross-site request forgery (CSRF) on mutating API calls.
 * 2. Bounces cookie-less requests to protected pages before Server Components render,
 *    preventing RSC data streaming leaks on unauthenticated redirects.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Redirect www.hakkiri.studio to hakkiri.studio (301 Permanent)
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  if (host.startsWith("www.hakkiri.studio")) {
    const targetUrl = new URL(req.url);
    targetUrl.protocol = "https:";
    targetUrl.host = "hakkiri.studio";
    return NextResponse.redirect(targetUrl, 301);
  }

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

  // 2a. A shared CV link is open to whoever has it, and never indexed by search engines.
  if (pathname.startsWith("/s/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  // 2. Allow public pages, blog, free audits, and static files. The admin console is NOT public:
  //    a request for it with no session goes to sign in, and the pages check for an administrator themselves.
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/landing" ||
    pathname === "/present" ||
    pathname === "/about" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/interview-questions") ||
    pathname.startsWith("/cv-audit") ||
    pathname.startsWith("/cv-templates") ||
    pathname.startsWith("/resume-templates") ||
    pathname.startsWith("/cover-letter-templates") ||
    pathname.startsWith("/cv-examples") ||
    pathname.startsWith("/resume-examples") ||
    pathname.startsWith("/cover-letter-audit") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Protected studio and live pages: bounce unauthenticated requests immediately
  const sessionToken = req.cookies.get("hakkiri_session")?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", req.url);
    // After signing in the person is taken to the page they asked for (the sign-in form checks it is one of ours).
    if (pathname !== "/dashboard") loginUrl.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next|interview-questions|cv-audit|cover-letter-audit|audit|blog|login|signup|privacy|terms|about|present|landing|robots.txt|sitemap.xml|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|$).*)",
  ],
};
