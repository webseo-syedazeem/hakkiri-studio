import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, makingTooFast, newCv, readJson, requireUserId } from "@/lib/cv/access";
import { newImportId } from "@/lib/cv/import/record";
import { readUpload } from "@/lib/cv/import/server";
import { isDocCheckId } from "@/lib/cv/check/record";
import { advertHeading } from "@/lib/cv/check/report";
import { splitSentences } from "@/lib/cv/letter/check";
import { letterParts } from "@/lib/cv/letter/score";
import { type CvDoc, type Letter, emptyLetter, newId } from "@/lib/cv/schema";
import { getCheck, isCheckId, saveCheck } from "@/lib/cv/score/publicCheck";
import { TOO_MANY_CVS, atCvLimit, deleteCv, deleteImport, getOwnCv, getOwnDocCheck, listOwnImports, saveCv, saveDocCheck, saveImport } from "@/lib/cv/store";

export const runtime = "nodejs";

const Body = z.object({ auditId: z.string().max(60), then: z.enum(["findings", "tailor", "letter"]).optional() }).strict();
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
    if (!parsed.success || !(isCheckId(parsed.data.auditId) || isDocCheckId(parsed.data.auditId))) return badInput(GONE);
    const { auditId, then } = parsed.data;

    const before = (await listOwnImports(userId)).find((i) => i.checkId === auditId);
    if (before) {
      // Asked again with somewhere else to go once it is confirmed ("Tailor a copy" after "Fix this in the builder").
      if (then && before.then !== then && before.status !== "confirmed") await saveImport({ ...before, then, updatedAt: new Date().toISOString() });
      return NextResponse.json({ importId: before.id, versionId: before.versionId, status: before.status });
    }
    if (isDocCheckId(auditId)) return fromDocCheck(userId, auditId, then);

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

/** The letter that was checked, as the person's own typed paragraphs: the letter builder checks each sentence again. */
function letterFrom(text: string): Letter | undefined {
  const { paragraphs } = letterParts(text);
  if (!paragraphs.length) return undefined;
  const kept = paragraphs.slice(0, 8);
  return {
    ...emptyLetter(),
    started: true,
    paragraphs: kept.map((p, i) => ({
      id: newId("p_"),
      role: i === 0 ? "opening" : i === kept.length - 1 && kept.length > 2 ? "close" : "evidence",
      sentences: splitSentences(p).slice(0, 12).map((t) => ({ id: newId("s_"), text: t.slice(0, 700), origin: "typed" as const, sources: [] })),
    })),
  };
}

/** From "Check my CV or cover letter": the CV that was checked, aimed at the job it was checked against, with its letter. */
async function fromDocCheck(userId: string, id: string, then: "findings" | "tailor" | "letter" | undefined) {
  const check = await getOwnDocCheck(id, userId);
  if (!check || (check.docType === "cover" ? !check.letterText.trim() : !check.cvText.trim())) {
    return NextResponse.json({ error: "not_found", message: GONE }, { status: 404 });
  }
  // A letter-only check has no upload to find again: it remembers the CV it was opened in.
  if (check.docType === "cover" && check.versionId && (await getOwnCv(check.versionId, userId))) {
    return NextResponse.json({ importId: "", versionId: check.versionId, status: "confirmed" });
  }
  if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
  const fast = makingTooFast(userId);
  if (fast) return fast;
  const now = new Date().toISOString();
  const region = check.region;
  const job = check.jobText ? advertHeading(check.jobText) : { title: "", employer: "" };
  const cv: CvDoc = newCv(userId, { name: job.title ? `${region === "us" ? "Resume" : "CV"} for ${job.title}`.slice(0, 120) : region === "us" ? "Resume from my check" : "CV from my check", level: "experienced", region, targetTitle: job.title.slice(0, 160), targetEmployer: job.employer.slice(0, 160), targetAdvert: check.jobText.slice(0, 20000) }, now);
  const letter = check.docType !== "cv" ? letterFrom(check.letterText) : undefined;
  if (letter) cv.letter = letter;
  if (check.docType === "cover") {
    cv.name = (job.title ? `Cover letter for ${job.title}` : "Cover letter from my check").slice(0, 120);
    await saveCv(cv);
    try {
      await saveDocCheck({ ...check, versionId: cv.id });
    } catch (err) {
      await deleteCv(cv.id).catch(() => {});
      throw err;
    }
    return NextResponse.json({ importId: "", versionId: cv.id, status: "confirmed" }, { status: 201 });
  }
  const imp = { ...(await readUpload({ id: newImportId(), userId, versionId: cv.id, createdAt: now }, cv, { text: check.cvText }, now)), checkId: id, then };
  try {
    await saveCv(cv);
    await saveImport(imp);
  } catch (err) {
    await deleteCv(cv.id).catch(() => {});
    await deleteImport(imp.id).catch(() => {});
    throw err;
  }
  return NextResponse.json({ importId: imp.id, versionId: cv.id, status: imp.status }, { status: 201 });
}
