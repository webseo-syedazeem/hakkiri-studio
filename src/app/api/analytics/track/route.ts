import { NextResponse } from "next/server";
import { z } from "zod";
import { recordPageView } from "@/lib/analytics/tracker";
import { readJsonValue } from "@/lib/http/body";
import { clientKey, rateLimited } from "@/lib/usage/limits";

const Body = z.object({ path: z.string().max(300).optional(), referrer: z.string().max(500).optional(), visitorId: z.string().max(80).optional() });

/**
 * POST /api/analytics/track: one page view, from the public pages. Open to
 * visitors, so it is counted per address, takes a small checked body, and
 * keeps only a path, a referrer and the page's own random visitor id.
 */
export async function POST(request: Request) {
  if (rateLimited(`track:${clientKey(request)}`, 120, 60_000)) return NextResponse.json({ success: false }, { status: 429 });
  const sent = await readJsonValue(request, 2_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json ?? {});
  if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });
  try {
    const path = parsed.data.path || "/";
    await recordPageView({
      path,
      referrer: parsed.data.referrer || request.headers.get("referer") || "",
      userAgent: request.headers.get("user-agent") || "",
      visitorId: parsed.data.visitorId || "",
    });
    return NextResponse.json({ success: true, path });
  } catch (err) {
    console.error("[analytics/track] error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
