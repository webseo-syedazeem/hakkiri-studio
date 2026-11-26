import { NextResponse } from "next/server";
import { badInput, failure, requireUserId } from "@/lib/cv/access";
import { readCvInput, readLetterFile, UNREADABLE, WRONG_FILE } from "@/lib/cv/check/read";
import { DOC_CHECK_DAYS, type DocCheck, MAX_ADVERT_TEXT, MAX_CV_TEXT, MAX_LETTER_TEXT, newDocCheckId } from "@/lib/cv/check/record";
import { checkReport } from "@/lib/cv/check/report";
import { ImportError, MAX_UPLOAD_BYTES } from "@/lib/cv/import";
import { readForm } from "@/lib/cv/import/server";
import { purgeOwnDocChecks, saveDocCheck } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/** Two files of up to 5 MB each, and the form around them. */
const MAX_CHECK_REQUEST = 2 * MAX_UPLOAD_BYTES + 512 * 1024;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const fileOf = (v: FormDataEntryValue | null) => (v instanceof File && v.size > 0 ? v : null);

/**
 * POST /api/cv/check: "Check my CV or cover letter", signed in. Takes a form:
 * docType (cv, cover or both), region (uk or us), and for each document either
 * a file (cvFile, letterFile) or text (cvText, letterText); jobText for the
 * optional job check. No AI is called: the CV is scored by the builder's own
 * checks and the letter by its own. Answers with the check's id; the report
 * is at /cv/check/{id}.
 */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const limited = guard(req, "audit", { userId });
    if (limited) return limited;
    const form = await readForm(req, MAX_CHECK_REQUEST);
    if (form === "too-big") return NextResponse.json({ error: "too_big", message: WRONG_FILE }, { status: 413 });
    if (!form) return badInput("Send the form again.");

    const docType = (["cv", "cover", "both"] as const).find((d) => d === str(form.get("docType"))) ?? "cv";
    const region = str(form.get("region")) === "us" ? "us" : "uk";
    const wantsCv = docType !== "cover";
    const wantsLetter = docType !== "cv";
    const cvFile = fileOf(form.get("cvFile"));
    const letterFile = fileOf(form.get("letterFile"));
    const cvText = str(form.get("cvText")).trim();
    const letterText = str(form.get("letterText")).trim();
    const jobOn = str(form.get("jobOn")) === "1";
    const jobText = str(form.get("jobText")).trim();

    const fields: Record<string, string> = {};
    if (wantsCv && !cvFile && cvText.length < 50) fields.cv = "Add your document text before checking.";
    if (wantsLetter && !letterFile && letterText.length < 50) fields.letter = "Add your document text before checking.";
    if (jobOn && jobText.length < 40) fields.job = "Add the job advert or turn off the job check.";
    if (cvText.length > MAX_CV_TEXT) fields.cv = `That is more text than a CV holds. Paste up to ${MAX_CV_TEXT.toLocaleString("en-GB")} characters.`;
    if (letterText.length > MAX_LETTER_TEXT) fields.letter = `That is more text than a cover letter holds. Paste up to ${MAX_LETTER_TEXT.toLocaleString("en-GB")} characters.`;
    if (jobText.length > MAX_ADVERT_TEXT) fields.job = `That is longer than a job advert. Paste up to ${MAX_ADVERT_TEXT.toLocaleString("en-GB")} characters.`;
    if (Object.keys(fields).length) return badInput(Object.values(fields)[0], fields);

    let cv: Awaited<ReturnType<typeof readCvInput>> | null = null;
    let letter: Awaited<ReturnType<typeof readLetterFile>> | null = null;
    try {
      if (wantsCv) cv = await readCvInput(cvFile, cvText);
    } catch (err) {
      if (err instanceof ImportError) return badInput(cvFile ? (err.code === "too-big" || err.code === "not-supported" || err.code === "old-word" ? WRONG_FILE : UNREADABLE) : "Add your document text before checking.", { cv: cvFile ? UNREADABLE : "Add your document text before checking." });
      throw err;
    }
    try {
      if (wantsLetter) letter = letterFile ? await readLetterFile(letterFile) : { text: letterText, read: null };
    } catch (err) {
      if (err instanceof ImportError) return badInput(err.code === "too-big" || err.code === "not-supported" ? WRONG_FILE : UNREADABLE, { letter: UNREADABLE });
      console.error("[api/cv/check] a letter file could not be read:", err);
      return badInput(UNREADABLE, { letter: UNREADABLE });
    }

    const now = new Date();
    const record: DocCheck = {
      id: newDocCheckId(),
      userId,
      docType,
      region,
      cvText: cv?.text ?? "",
      cv: cv ? { contact: cv.cv.contact, sections: cv.cv.sections } : undefined,
      cvRead: cv?.read ?? undefined,
      letterText: letter?.text ?? "",
      letterRead: letter?.read ?? undefined,
      jobText: jobOn ? jobText : "",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + DOC_CHECK_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    };
    const report = checkReport(record, now);
    if (record.jobText && report.noRequirements) return badInput("We couldn’t identify requirements in this advert. Check the text.", { job: "We couldn’t identify requirements in this advert. Check the text." });
    const saved = await saveDocCheck({ ...record, cvScore: report.cv?.shown, letterScore: report.letter?.shown, matchScore: report.job ? report.job.score : undefined });
    await purgeOwnDocChecks(userId, now).catch((err) => console.error("[api/cv/check] old checks could not be cleared:", err));
    return NextResponse.json({ id: saved.id }, { status: 201 });
  } catch (err) {
    return failure("api/cv/check POST", err, "We couldn’t complete the check. Your text is still here.");
  }
}
