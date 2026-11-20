import { NextResponse } from "next/server";
import { runAuditLogic } from "@/lib/robot-test/tester";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = runAuditLogic();
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate robot test audit", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const report = runAuditLogic();
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run robot test audit", detail: String(error) },
      { status: 500 }
    );
  }
}
