import { NextResponse } from "next/server";
import { getLiveAnalyticsSummary } from "@/lib/analytics/tracker";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getLiveAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[admin/analytics] error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
