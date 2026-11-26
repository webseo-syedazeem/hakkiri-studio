import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { checkReport } from "@/lib/cv/check/report";
import { deleteDocCheck, getOwnDocCheck } from "@/lib/cv/store";

export const runtime = "nodejs";

/**
 * GET /api/cv/check/[id]: the report for one of the person's own checks,
 * worked out again from what was checked. The text itself is not sent back.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const check = await getOwnDocCheck((await params).id, userId);
    if (!check) return notFound("Check");
    return NextResponse.json({ id: check.id, createdAt: check.createdAt, expiresAt: check.expiresAt, report: checkReport(check) });
  } catch (err) {
    return failure("api/cv/check/[id] GET", err, "We couldn’t complete your report. Try again.");
  }
}

/** DELETE /api/cv/check/[id]: removes the check and the text that was checked. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const check = await getOwnDocCheck((await params).id, userId);
    if (!check) return notFound("Check");
    await deleteDocCheck(check.id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return failure("api/cv/check/[id] DELETE", err, "The check could not be deleted. Try again.");
  }
}
