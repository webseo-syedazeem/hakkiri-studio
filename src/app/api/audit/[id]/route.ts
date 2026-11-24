import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/require";
import { getCheck, unlockedView } from "@/lib/cv/score/publicCheck";

const GONE = { error: "not_found", message: "Audit report not found." };

/**
 * GET /api/audit/[id]: a free check. The id must be one this app made; a
 * check past its date is gone. Until it is unlocked only the score and the
 * first findings are sent. The pasted text is never sent back.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const audit = await getCheck(id);
    if (!audit) return NextResponse.json(GONE, { status: 404 });

    const user = await getCurrentUser().catch(() => null);
    const isOwner = !!user?.id && audit.userId === user.id;
    if (!audit.unlockedBy && !isOwner) {
      return NextResponse.json({
        id: audit.id,
        score: audit.score,
        subscores: audit.subscores,
        teaser: audit.teaser,
        teaserFindings: audit.findings.filter((f) => audit.teaser.includes(f.id)),
        totalFindingsCount: audit.findings.length,
        isUnlocked: false,
      });
    }
    return NextResponse.json(unlockedView(audit));
  } catch (err: unknown) {
    console.error("[api/audit/[id]] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load audit." }, { status: 500 });
  }
}
