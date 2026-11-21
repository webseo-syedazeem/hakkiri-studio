import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics/tracker";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = body.referrer || request.headers.get("referer") || "";
    const path = body.path || "/";
    const visitorId = body.visitorId || "";

    // Record non-blocking
    await recordPageView({
      path,
      referrer,
      userAgent,
      visitorId,
    });

    return NextResponse.json({ success: true, path });
  } catch (err) {
    console.error("[analytics/track] error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
