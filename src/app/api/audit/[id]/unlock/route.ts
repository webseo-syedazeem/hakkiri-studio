import { NextResponse } from "next/server";
import { getAudit, saveAudit, saveLead, getLead } from "@/lib/apply/db";
import crypto from "node:crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json({ error: "not_found", message: "Audit not found." }, { status: 404 });
    }

    const body = await req.json();
    const { email, marketing = false } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email", message: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
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
