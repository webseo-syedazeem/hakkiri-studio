import { NextResponse, type NextRequest } from "next/server";

/**
 * Blocks other websites from making changes through Hakkiri's API in your
 * browser (cross-site request forgery): a page elsewhere could otherwise post
 * a form to /api/data/delete or send audio to be scored at your cost.
 * Reading (GET) is left alone; browsers stop other sites reading the replies.
 */
export function proxy(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return NextResponse.next();
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
  if (foreign) return NextResponse.json({ error: "forbidden", message: "That request came from another website." }, { status: 403 });
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
