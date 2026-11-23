import { NextResponse } from "next/server";
import { runAuditLogic } from "@/lib/robot-test/tester";
import { adminDenied } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const report = runAuditLogic();
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate robot test audit" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Administrators only. Who is asking comes from the session, never from an address in the request.
  const denied = await adminDenied();
  if (denied) return denied;

  let runIteration = 1;
  try {
    const body = await req.json();
    runIteration = Number(body?.runIteration) || 1;
  } catch {}

  try {
    const report = runAuditLogic(runIteration);
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run robot test audit" },
      { status: 500 }
    );
  }
}
