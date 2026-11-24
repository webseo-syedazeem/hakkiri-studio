import { NextResponse } from "next/server";
import { z } from "zod";
import { runAuditLogic } from "@/lib/robot-test/tester";
import { adminDenied } from "@/lib/auth/admin";
import { readJsonValue } from "@/lib/http/body";

export const dynamic = "force-dynamic";

const Body = z.object({ runIteration: z.number().int().min(1).max(100_000).optional() });

/**
 * GET and POST /api/robot-test: the robot tester's report, for administrators.
 * No automated check is run (see lib/robot-test/tester.ts), so the report says
 * so and carries no results. It used to return scores written into the code.
 */
export async function GET() {
  const denied = await adminDenied();
  if (denied) return denied;
  return NextResponse.json(runAuditLogic());
}

export async function POST(req: Request) {
  // Administrators only. Who is asking comes from the session, never from an address in the request.
  const denied = await adminDenied();
  if (denied) return denied;

  const sent = await readJsonValue(req, 1_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json ?? {});
  const report = runAuditLogic(parsed.success ? (parsed.data.runIteration ?? 1) : 1);
  return NextResponse.json({ ok: true, ran: false, report });
}
