import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/require";
import { readJson } from "@/lib/cv/access";
import { ImportError } from "@/lib/cv/import";
import { auditText } from "@/lib/cv/score/audit";
import { MAX_CHECK_BYTES, MAX_CHECK_TEXT, checkRecord, purgeExpiredChecks, saveCheck, summaryOf } from "@/lib/cv/score/publicCheck";
import { guard } from "@/lib/usage/limits";

const TOO_SHORT = "Please provide at least 50 characters of CV text or upload a document.";
const TOO_LONG = `That is more text than a CV holds. Paste up to ${MAX_CHECK_TEXT.toLocaleString("en-GB")} characters.`;

/** What may be sent. Anything else in the body is ignored, and nothing is stored that is not named here. */
const Body = z.object({
  text: z.string(),
  jobText: z.string().optional().nullable(),
  region: z.enum(["uk", "us"]).catch("uk").default("uk"),
  docType: z.enum(["cv", "cover", "both"]).catch("cv").default("cv"),
});

/**
 * POST /api/audit: the free public check. No account is needed, so the
 * request is held to limits before anything is done with it: how many a
 * minute, how many bytes (counted as they arrive), which fields, how long.
 */
export async function POST(req: Request) {
  const g = guard(req, "audit");
  if (g) return g;

  try {
    const read = await readJson(req, MAX_CHECK_BYTES);
    if (!read.ok) {
      if (read.reason === "too-big") return NextResponse.json({ error: "too_large", message: TOO_LONG }, { status: 413 });
      return NextResponse.json({ error: "invalid_input", message: TOO_SHORT }, { status: 400 });
    }
    const parsed = Body.safeParse(read.body);
    if (!parsed.success || parsed.data.text.trim().length < 50) return NextResponse.json({ error: "invalid_input", message: TOO_SHORT }, { status: 400 });
    const { text, jobText, region, docType } = parsed.data;
    if (text.length > MAX_CHECK_TEXT) return NextResponse.json({ error: "too_large", message: TOO_LONG }, { status: 400 });

    const now = new Date();
    // The same checks the builder runs, so the number here is the number after signing up. No floor, and no AI call.
    let result;
    try {
      result = auditText(text, region, now);
    } catch (err) {
      // Too little text to read as a CV.
      if (err instanceof ImportError) return NextResponse.json({ error: "invalid_input", message: TOO_SHORT }, { status: 400 });
      throw err;
    }

    // A check made while signed in belongs to that account, so "Delete all my data" removes it.
    const user = await getCurrentUser().catch(() => null);
    const auditId = `aud_${crypto.randomBytes(8).toString("hex")}`;
    await saveCheck(checkRecord({ id: auditId, text, jobText: jobText ?? undefined, region, docType, textHash: crypto.createHash("sha256").update(text.trim()).digest("hex"), userId: user?.id ? String(user.id) : undefined }, result, now));
    // Checks past their date are cleared out as new ones are made.
    await purgeExpiredChecks(now).catch((err) => console.error("[api/audit] old checks could not be cleared:", err));

    return NextResponse.json({
      auditId,
      score: result.score,
      subscores: result.subscores,
      teaser: result.teaser,
      teaserFindings: result.findings.filter((f) => result.teaser.includes(f.id)),
      totalFindingsCount: result.findings.length,
      isGoodEnough: result.isGoodEnough,
      // One or two sentences made from this check's own results.
      summary: summaryOf(result, region === "us" ? "resume" : "CV"),
      // Points that wait on the finished file (its page count, and how the PDF and Word file read back).
      pendingPoints: result.pending,
      interviewerQuestionsCount: result.interviewerQuestions.length,
    });
  } catch (err: unknown) {
    console.error("[api/audit] Error processing audit:", err);
    return NextResponse.json({ error: "server_error", message: "An unexpected error occurred while auditing your document." }, { status: 500 });
  }
}
