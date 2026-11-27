import { NextResponse } from "next/server";
import { SetupSchema, badInput, failure, fieldErrors, makingTooFast, newCv, notFound, quickCv, requireUserId, withInferred } from "@/lib/cv/access";
import { IMPORT_ERRORS } from "@/lib/cv/import";
import { inferSetup } from "@/lib/cv/import/infer";
import { LINKEDIN_HOW, linkedInText } from "@/lib/cv/import/linkedin";
import { newImportId } from "@/lib/cv/import/record";
import { readForm, readUpload } from "@/lib/cv/import/server";
import { CV_TEMPLATES, type TemplateId, cvIsEmpty } from "@/lib/cv/schema";
import { TOO_MANY_CVS, atCvLimit, deleteCv, deleteImport, getOwnCv, saveCv, saveImport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * Starts a CV from an uploaded file, pasted text, or LinkedIn profile.
 * Sent as a form with the set-up answers (or the id of an existing empty CV)
 * and `file`, `text`, or `linkedinUrl`. With `quick=1` nothing is asked first
 * (DESIGN-SPEC-v3 §01): the name, UK or US and the level come from the file,
 * and what it doesn't show is marked "Not known yet".
 */
export async function POST(req: Request) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    // The bytes are counted as they arrive: a request that hides or misstates its size is still stopped at the limit.
    const form = await readForm(req);
    if (form === "too-big") return NextResponse.json({ error: "too_big", message: IMPORT_ERRORS["too-big"].message }, { status: 413 });
    if (!form) return badInput("Send the form again.");
    const file = form.get("file");
    const text = form.get("text");
    const linkedinUrl = form.get("linkedinUrl");
    const linkedinText = form.get("linkedinText");
    const hasFile = file instanceof File && file.size > 0;
    const hasLinkedIn = (typeof linkedinUrl === "string" && linkedinUrl.trim().length > 0) || (typeof linkedinText === "string" && linkedinText.trim().length > 0);
    let hasText = typeof text === "string" && text.trim().length > 0;
    let finalText = hasText ? (text as string) : "";

    // LinkedIn: only what the person pasted is read. Nothing is fetched from LinkedIn, and nothing is filled in.
    if (hasLinkedIn && !hasFile && !hasText) {
      const fromProfile = linkedInText(typeof linkedinUrl === "string" ? linkedinUrl : "", typeof linkedinText === "string" ? linkedinText : "");
      if (!fromProfile) return badInput(LINKEDIN_HOW, { linkedin: LINKEDIN_HOW });
      finalText = fromProfile;
      hasText = true;
    }

    if (!hasFile && !hasText) {
      return badInput("Choose a file, paste the text of your CV, or enter your LinkedIn profile.", { file: "Choose a file or enter your LinkedIn profile." });
    }

    const now = new Date().toISOString();
    const versionId = form.get("versionId");
    const quick = form.get("quick") === "1" && !(typeof versionId === "string" && versionId);
    const asked = form.get("template");
    const template = typeof asked === "string" && (CV_TEMPLATES as readonly string[]).includes(asked) ? (asked as TemplateId) : undefined;
    let cv;
    let isNew = false;
    if (typeof versionId === "string" && versionId) {
      cv = await getOwnCv(versionId, userId);
      if (!cv) return notFound();
      if (!cvIsEmpty(cv)) return NextResponse.json({ error: "not_empty", message: "This CV already has content. Start a new CV to upload a file." }, { status: 409 });
    } else if (quick) {
      if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
      const fast = makingTooFast(userId);
      if (fast) return fast;
      cv = quickCv(userId, template, now);
      isNew = true;
    } else {
      const setup = SetupSchema.safeParse(Object.fromEntries(["name", "level", "region", "targetTitle", "targetEmployer", "targetAdvert", "template"].map((k) => [k, form.get(k) ?? undefined])));
      if (!setup.success) return badInput("Check the highlighted answers.", fieldErrors(setup.error));
      if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
      const fast = makingTooFast(userId);
      if (fast) return fast;
      // Made here, saved further down: a CV is only kept once there is an upload record to go with it.
      cv = newCv(userId, setup.data, now);
      isNew = true;
    }

    // Reading never throws: a file that cannot be read gives a record that says why.
    const imp = await readUpload({ id: newImportId(), userId, versionId: cv.id, createdAt: now }, cv, { file: hasFile ? (file as File) : null, text: hasText ? finalText : null }, now);
    // Nothing asked first: what the file shows sets the name, UK or US and the level; the rest says "Not known yet".
    if (quick) cv = withInferred(cv, inferSetup({ fullName: imp.draft.contact.fullName, sections: imp.draft.sections, text: imp.lines.map((l) => l.text).join("\n"), fileName: imp.fileName || (hasFile ? (file as File).name : "") }, new Date(now)), Boolean(template));
    try {
      if (isNew) await saveCv(cv);
      await saveImport(imp);
    } catch (err) {
      // Neither half is left behind without the other.
      if (isNew) await deleteCv(cv.id).catch(() => {});
      await deleteImport(imp.id).catch(() => {});
      throw err;
    }
    return NextResponse.json({ importId: imp.id, versionId: cv.id, status: imp.status, error: imp.error }, { status: 201 });
  } catch (err) {
    return failure("api/cv/imports POST", err, "The file could not be uploaded.");
  }
}
