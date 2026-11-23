import { NextResponse } from "next/server";
import { ImportError } from "@/lib/cv/import";
import { auditText } from "@/lib/cv/score/audit";
import { saveAudit } from "@/lib/apply/db";
import { guard } from "@/lib/usage/limits";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const g = guard(req, "audit");
  if (g) return g;

  try {
    const body = await req.json();
    const { text, jobText, region = "uk", docType = "cv" } = body;

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "invalid_input", message: "Please provide at least 50 characters of CV text or upload a document." },
        { status: 400 },
      );
    }

    if (text.length > 25000) {
      return NextResponse.json(
        { error: "too_large", message: "Document exceeds maximum allowed length of 25,000 characters." },
        { status: 400 },
      );
    }

    const textHash = crypto.createHash("sha256").update(text.trim()).digest("hex");
    const auditId = `aud_${crypto.randomBytes(8).toString("hex")}`;
    // The same checks the builder runs, so the number here is the number after signing up. No floor, and no AI call.
    let result;
    try {
      result = auditText(text, region === "us" ? "us" : "uk");
    } catch (err) {
      // Too little text to read as a CV.
      if (err instanceof ImportError) return NextResponse.json({ error: "invalid_input", message: "Please provide at least 50 characters of CV text or upload a document." }, { status: 400 });
      throw err;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const auditDoc = {
      id: auditId,
      docType,
      textHash,
      text: text.slice(0, 20000),
      jobText: jobText ? String(jobText).slice(0, 5000) : undefined,
      score: result.score,
      subscores: result.subscores,
      findings: result.findings,
      teaser: result.teaser,
      interviewerQuestions: result.interviewerQuestions,
      region,
      expiresAt,
      modelVersion: "cv-score",
      rubricVersion: "2026.2",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await saveAudit(auditDoc);

    const topFindings = result.findings.filter((f) => result.teaser.includes(f.id));

    return NextResponse.json({
      auditId,
      score: result.score,
      subscores: result.subscores,
      teaser: result.teaser,
      teaserFindings: topFindings,
      totalFindingsCount: result.findings.length,
      isGoodEnough: result.isGoodEnough,
      // Points that wait on the finished file (its page count, and how the PDF and Word file read back).
      pendingPoints: result.pending,
      interviewerQuestionsCount: result.interviewerQuestions.length,
    });
  } catch (err: unknown) {
    console.error("[api/audit] Error processing audit:", err);
    return NextResponse.json(
      { error: "server_error", message: "An unexpected error occurred while auditing your document." },
      { status: 500 },
    );
  }
}
