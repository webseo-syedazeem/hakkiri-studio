import { NextResponse } from "next/server";
import { runAuditLogic } from "@/lib/robot-test/tester";
import { getCurrentUser } from "@/lib/auth/require";
import { isAdminEmail } from "@/lib/auth/admins";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
  }

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
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
  }

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
