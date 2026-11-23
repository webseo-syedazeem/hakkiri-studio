import { NextResponse } from "next/server";
import { SetupSchema, badInput, failure, fieldErrors, makingTooFast, newCv, notFound, requireUserId } from "@/lib/cv/access";
import { IMPORT_ERRORS } from "@/lib/cv/import";
import { newImportId } from "@/lib/cv/import/record";
import { readForm, readUpload } from "@/lib/cv/import/server";
import { cvIsEmpty } from "@/lib/cv/schema";
import { TOO_MANY_CVS, atCvLimit, deleteCv, deleteImport, getOwnCv, saveCv, saveImport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * Starts a CV from an uploaded file or pasted text. Sent as a form with the
 * set-up answers (or the id of an existing empty CV) and either `file` or
 * `text`. The CV itself stays empty until the person has checked what was
 * read and opened it in the builder.
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
    const hasFile = file instanceof File && file.size > 0;
    const hasText = typeof text === "string" && text.trim().length > 0;
    if (!hasFile && !hasText) return badInput("Choose a file or paste the text of your CV.", { file: "Choose a file or paste the text of your CV." });

    const now = new Date().toISOString();
    const versionId = form.get("versionId");
    let cv;
    let isNew = false;
    if (typeof versionId === "string" && versionId) {
      cv = await getOwnCv(versionId, userId);
      if (!cv) return notFound();
      if (!cvIsEmpty(cv)) return NextResponse.json({ error: "not_empty", message: "This CV already has content. Start a new CV to upload a file." }, { status: 409 });
    } else {
      const setup = SetupSchema.safeParse(Object.fromEntries(["name", "level", "region", "targetTitle", "targetEmployer", "targetAdvert"].map((k) => [k, form.get(k) ?? undefined])));
      if (!setup.success) return badInput("Check the highlighted answers.", fieldErrors(setup.error));
      if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
      const fast = makingTooFast(userId);
      if (fast) return fast;
      // Made here, saved further down: a CV is only kept once there is an upload record to go with it.
      cv = newCv(userId, setup.data, now);
      isNew = true;
    }

    // Reading never throws: a file that cannot be read gives a record that says why.
    const imp = await readUpload({ id: newImportId(), userId, versionId: cv.id, createdAt: now }, cv, { file: hasFile ? (file as File) : null, text: hasText ? (text as string) : null }, now);
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
