import { NextResponse } from "next/server";
import { getAudit, saveAudit, saveLead, getLead } from "@/lib/apply/db";
import crypto from "node:crypto";
import { readJsonValue } from "@/lib/http/body";
import { normaliseEmail } from "@/lib/auth/user-db";
import { clientKey, rateLimited } from "@/lib/usage/limits";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (rateLimited(`audit-unlock:${clientKey(req)}`, 10, 60_000)) {
      return NextResponse.json({ error: "slow-down", message: "That’s a lot of requests in a short time. Wait a minute, then try again." }, { status: 429 });
    }
    const { id } = await params;
    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json({ error: "not_found", message: "Audit not found." }, { status: 404 });
    }

    const sent = await readJsonValue(req, 2_000);
    if (!sent.ok) return sent.response;
    const body = (sent.json && typeof sent.json === "object" && !Array.isArray(sent.json) ? sent.json : {}) as Record<string, unknown>;
    const marketing = body.marketing === true;
    const cleanEmail = normaliseEmail(body.email);
    if (!cleanEmail) {
      return NextResponse.json({ error: "invalid_email", message: "Please enter a valid email address." }, { status: 400 });
    }

    const now = new Date().toISOString();

    let lead = await getLead(cleanEmail);
    if (!lead) {
      lead = {
        id: `lead_${crypto.randomBytes(8).toString("hex")}`,
        email: cleanEmail,
        firstAuditId: audit.id,
        consent: {
          marketing: Boolean(marketing),
          at: now,
          wording: "Terms and Privacy Policy agreed to unlock free diagnostic report.",
          version: "2026.1",
        },
        source: "audit_unlock",
        createdAt: now,
        updatedAt: now,
      };
      await saveLead(lead);
    }

    // Unlock audit
    audit.unlockedBy = lead.id;
    audit.updatedAt = now;
    await saveAudit(audit);

    return NextResponse.json({
      success: true,
      audit,
      message: "Report unlocked successfully.",
    });
  } catch (err: unknown) {
    console.error("[api/audit/[id]/unlock] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to unlock audit." }, { status: 500 });
  }
}
