import { NextResponse } from "next/server";
import { getAudit } from "@/lib/apply/db";
import { getCurrentUser } from "@/lib/auth/require";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json({ error: "not_found", message: "Audit report not found." }, { status: 404 });
    }

    const user = await getCurrentUser();
    const isOwner = user?.id && audit.userId === user.id;
    const isUnlocked = Boolean(audit.unlockedBy || isOwner);

    if (!isUnlocked) {
      // Return only teaser version
      const teaserFindings = audit.findings.filter((f) => audit.teaser.includes(f.id));
      return NextResponse.json({
        id: audit.id,
        score: audit.score,
        subscores: audit.subscores,
        teaser: audit.teaser,
        teaserFindings,
        totalFindingsCount: audit.findings.length,
        isUnlocked: false,
      });
    }

    // Return complete full report
    return NextResponse.json({
      ...audit,
      isUnlocked: true,
    });
  } catch (err: unknown) {
    console.error("[api/audit/[id]] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load audit." }, { status: 500 });
  }
}
