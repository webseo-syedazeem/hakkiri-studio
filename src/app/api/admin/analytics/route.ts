import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { getLiveAnalyticsSummary } from "@/lib/analytics/tracker";

export const dynamic = "force-dynamic";

export async function GET() {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const summary = await getLiveAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[admin/analytics] error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
