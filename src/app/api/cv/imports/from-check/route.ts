import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, makingTooFast, newCv, readJson, requireUserId } from "@/lib/cv/access";
import { newImportId } from "@/lib/cv/import/record";
import { readUpload } from "@/lib/cv/import/server";
import { getCheck, isCheckId, saveCheck } from "@/lib/cv/score/publicCheck";
import { TOO_MANY_CVS, atCvLimit, deleteCv, deleteImport, listOwnImports, saveCv, saveImport } from "@/lib/cv/store";

export const runtime = "nodejs";

const Body = z.object({ auditId: z.string().max(60) }).strict();
const GONE = "That check is no longer available. Checks are kept for 30 days. Paste the text of your CV to start again.";

/**
 * POST /api/cv/imports/from-check: starts a CV from the text of a free check,
 * through the same reader as pasted text. The person then checks what was
 * read, as with any upload, and lands on the CV's score with its findings.
 *
 * Asked twice for the same check (a reload, the Back button), it gives back
 * the upload it made the first time and makes nothing new.
 */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const read = await readJson(req, 4 * 1024);
    const parsed = Body.safeParse(read.ok ? read.body : null);
    if (!parsed.success || !isCheckId(parsed.data.auditId)) return badInput(GONE);
    const { auditId } = parsed.data;

    const before = (await listOwnImports(userId)).find((i) => i.checkId === auditId);
    if (before) return NextResponse.json({ importId: before.id, versionId: before.versionId, status: before.status });

    const audit = await getCheck(auditId);
    // The text of a check is given only to whoever unlocked it, or to the account it was made from.
    if (!audit || (!audit.unlockedBy && audit.userId !== userId)) return NextResponse.json({ error: "not_found", message: GONE }, { status: 404 });
    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
    const fast = makingTooFast(userId);
    if (fast) return fast;

    const now = new Date().toISOString();
    const region = audit.region === "us" ? "us" : "uk";
    const cv = newCv(userId, { name: region === "us" ? "Resume from my free check" : "CV from my free check", level: "experienced", region, targetTitle: "", targetEmployer: "", targetAdvert: "" }, now);
    const imp = { ...(await readUpload({ id: newImportId(), userId, versionId: cv.id, createdAt: now }, cv, { text: audit.text }, now)), checkId: auditId };
    try {
      await saveCv(cv);
      await saveImport(imp);
    } catch (err) {
      await deleteCv(cv.id).catch(() => {});
      await deleteImport(imp.id).catch(() => {});
      throw err;
    }
    // The check now belongs to this account, so it is in "Download my data" and goes with "Delete all my data".
    if (!audit.userId) await saveCheck({ ...audit, userId, updatedAt: now }).catch((err) => console.error("[api/cv/imports/from-check] the check could not be tied to the account:", err));
    return NextResponse.json({ importId: imp.id, versionId: cv.id, status: imp.status }, { status: 201 });
  } catch (err) {
    return failure("api/cv/imports/from-check POST", err, "The CV could not be started from your check.");
  }
}
