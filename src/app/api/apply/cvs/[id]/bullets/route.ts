import { NextResponse } from "next/server";
import { saveCv, saveEvidence } from "@/lib/apply/db";
import { loadOwnCv, cvNotFound, requireUserId } from "@/lib/cv/access";
import crypto from "node:crypto";

/**
 * Adds a bullet from what the person typed. Their words are kept as they are
 * (only trimmed, with a capital first letter and no trailing full stop): no
 * verb is prefixed, no number or second bullet is made up. The notes are also
 * saved as evidence so later writing help can trace every fact back to them.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const cv = await loadOwnCv(id, userId);
    if (!cv) return cvNotFound();

    const body = await req.json().catch(() => ({}));
    const notes = typeof body.notes === "string" ? body.notes.replace(/\s+/g, " ").trim() : "";
    const roleId = typeof body.roleId === "string" && body.roleId ? body.roleId : "role-1";

    if (notes.length < 10) {
      return NextResponse.json({ error: "too_short", message: "Please say a little more about what you did." }, { status: 400 });
    }
    if (notes.length > 600) {
      return NextResponse.json({ error: "too_long", message: "Please keep one bullet under 600 characters." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const evId = `ev_${crypto.randomBytes(6).toString("hex")}`;
    await saveEvidence({
      id: evId,
      userId: userId,
      text: notes,
      numbers: notes.match(/[£$€]?\d[\d,.]*\s*(?:%|k|m|bn)?/gi) || [],
      skillTags: [],
      sourceKind: "typed-note",
      confirmed: true,
      createdAt: now,
      updatedAt: now,
    });

    const text = (notes.charAt(0).toUpperCase() + notes.slice(1)).replace(/\.$/, "");
    const bullet = { id: `b_${crypto.randomBytes(6).toString("hex")}`, roleId, text, evidenceIds: [evId], origin: "person" as const, visible: true };
    cv.bullets = [...cv.bullets, bullet];
    cv.updatedAt = now;
    await saveCv(cv);

    return NextResponse.json({ success: true, newBullets: [bullet], cv });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/cvs/[id]/bullets] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to add the bullet." }, { status: 500 });
  }
}
