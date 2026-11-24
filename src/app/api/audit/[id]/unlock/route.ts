import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getLead, saveLead } from "@/lib/apply/db";
import { getCurrentUser } from "@/lib/auth/require";
import { readJson } from "@/lib/cv/access";
import { validEmail } from "@/lib/cv/score/detect";
import { UNLOCKS_A_MINUTE, getCheck, saveCheck } from "@/lib/cv/score/publicCheck";
import { clientKey, rateLimited } from "@/lib/usage/limits";

const BAD_EMAIL = { error: "invalid_email", message: "Please enter a valid email address." };

/**
 * POST /api/audit/[id]/unlock: opens the full report in return for an email
 * address. It needs no account, so it is limited by address, the body is
 * counted as it arrives, and the email must have the shape of one.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (rateLimited(`audit-unlock:${clientKey(req)}`, UNLOCKS_A_MINUTE, 60_000)) {
    return NextResponse.json({ error: "slow-down", message: "That’s a lot of requests in a short time. Wait a minute, then try again." }, { status: 429 });
  }
  try {
    const { id } = await params;
    const audit = await getCheck(id);
    if (!audit) return NextResponse.json({ error: "not_found", message: "Audit not found." }, { status: 404 });

    const read = await readJson(req, 8 * 1024);
    const body = read.ok && read.body && typeof read.body === "object" ? (read.body as { email?: unknown; marketing?: unknown }) : {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!read.ok || email.length > 160 || !validEmail(email)) return NextResponse.json(BAD_EMAIL, { status: 400 });

    const now = new Date().toISOString();
    let lead = await getLead(email);
    if (!lead) {
      lead = {
        id: `lead_${crypto.randomBytes(8).toString("hex")}`,
        email,
        firstAuditId: audit.id,
        consent: { marketing: body.marketing === true, at: now, wording: "Terms and Privacy Policy agreed to unlock free diagnostic report.", version: "2026.1" },
        source: "audit_unlock",
        createdAt: now,
        updatedAt: now,
      };
      await saveLead(lead);
    }

    // Unlocked while signed in: the check then belongs to that account, and goes with it if the account's data is deleted.
    const user = await getCurrentUser().catch(() => null);
    await saveCheck({ ...audit, unlockedBy: lead.id, userId: audit.userId ?? (user?.id ? String(user.id) : undefined), updatedAt: now });

    return NextResponse.json({ success: true, id: audit.id, message: "Report unlocked successfully." });
  } catch (err: unknown) {
    console.error("[api/audit/[id]/unlock] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to unlock audit." }, { status: 500 });
  }
}
