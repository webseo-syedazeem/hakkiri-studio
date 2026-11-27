import { NextResponse } from "next/server";
import { SetupSchema, badInput, failure, fieldErrors, makingTooFast, newCv, notFound, requireUserId } from "@/lib/cv/access";
import { IMPORT_ERRORS } from "@/lib/cv/import";
import { readLinkedInProfile } from "@/lib/cv/import/linkedin";
import { newImportId } from "@/lib/cv/import/record";
import { readForm, readUpload } from "@/lib/cv/import/server";
import { coreSections, cvIsEmpty } from "@/lib/cv/schema";
import { inferAbout } from "@/lib/cv/import/infer";
import { TOO_MANY_CVS, atCvLimit, deleteCv, deleteImport, getOwnCv, saveCv, saveImport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * Starts a CV from an uploaded file, pasted text, or LinkedIn profile.
 * Sent as a form with the set-up answers (or the id of an existing empty CV)
 * and `file`, `text`, or `linkedinUrl`.
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
    const hasLinkedIn = typeof linkedinUrl === "string" && linkedinUrl.trim().length > 0;
    let hasText = typeof text === "string" && text.trim().length > 0;
    let finalText = hasText ? (text as string) : "";

    if (hasLinkedIn) {
      const parsedLinkedIn = await readLinkedInProfile(
        linkedinUrl as string,
        typeof linkedinText === "string" ? (linkedinText as string) : undefined
      );
      finalText = parsedLinkedIn.text;
      hasText = true;
    }

    if (!hasFile && !hasText) {
      return badInput("Choose a file, paste the text of your CV, or enter your LinkedIn profile.", { file: "Choose a file or enter your LinkedIn profile." });
    }

    const now = new Date().toISOString();
    const versionId = form.get("versionId");
    let cv;
    let isNew = false;
    if (typeof versionId === "string" && versionId) {
      cv = await getOwnCv(versionId, userId);
      if (!cv) return notFound();
      if (!cvIsEmpty(cv)) return NextResponse.json({ error: "not_empty", message: "This CV already has content. Start a new CV to upload a file." }, { status: 409 });
    } else {
      // Upload first: with no set-up answers sent, the name, UK or US and level are read from the file afterwards.
      const inferring = !form.get("name") && !form.get("level") && !form.get("region");
      const fields = Object.fromEntries(["name", "level", "region", "targetTitle", "targetEmployer", "targetAdvert", "template"].map((k) => [k, form.get(k) ?? undefined]));
      const setup = SetupSchema.safeParse(inferring ? { ...fields, name: "New CV", level: "experienced", region: "uk" } : fields);
      if (!setup.success) return badInput("Check the highlighted answers.", fieldErrors(setup.error));
      if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
      const fast = makingTooFast(userId);
      if (fast) return fast;
      // Made here, saved further down: a CV is only kept once there is an upload record to go with it.
      cv = newCv(userId, setup.data, now);
      isNew = true;
      if (inferring) cv.name = "";
    }

    // Reading never throws: a file that cannot be read gives a record that says why.
    let imp = await readUpload({ id: newImportId(), userId, versionId: cv.id, createdAt: now }, cv, { file: hasFile ? (file as File) : null, text: hasText ? finalText : null }, now);
    if (isNew && !cv.name) {
      // What the file shows is used where it is clear; the rest waits for the person, as "not known yet".
      const about = imp.status === "needs-review" ? inferAbout(imp) : { name: imp.fileName.replace(/\.(pdf|docx?)$/i, "") || "My CV", region: null, level: null, why: { region: "", level: "" } };
      imp = { ...imp, about };
      const level = about.level ?? cv.level;
      const region = about.region ?? cv.region;
      cv = {
        ...cv,
        name: about.name,
        level,
        region,
        sections: coreSections(level),
        design: { ...cv.design, pageSize: region === "us" ? ("letter" as const) : ("a4" as const), pageTarget: level === "student" || level === "early" ? (1 as const) : (2 as const), template: cv.design.template === "graduate" || cv.design.template === "standard" ? (level === "student" ? ("graduate" as const) : ("standard" as const)) : cv.design.template },
      };
    }
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
