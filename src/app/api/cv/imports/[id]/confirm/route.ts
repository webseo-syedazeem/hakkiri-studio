import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { applyImport } from "@/lib/cv/import/record";
import { cvIsEmpty } from "@/lib/cv/schema";
import { getOwnCv, getOwnImport, saveCv, saveImport } from "@/lib/cv/store";

/**
 * "Open in builder": puts the checked upload into its CV. Safe to send twice:
 * the second time finds the upload already confirmed and changes nothing.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    if (!imp) return notFound("Upload");
    const cv = await getOwnCv(imp.versionId, userId);
    if (!cv) return notFound();
    if (imp.status === "confirmed") return NextResponse.json({ versionId: cv.id });
    if (imp.status !== "needs-review") return NextResponse.json({ error: "not_ready", message: "This file could not be read. Choose another file or paste the text first." }, { status: 409 });
    // The CV was made for this upload and should still be empty. If the person has typed into it since, keep their typing.
    if (!cvIsEmpty(cv)) return NextResponse.json({ error: "not_empty", message: "This CV already has content, so the upload was not added to it." }, { status: 409 });
    const now = new Date().toISOString();
    await saveCv(applyImport(cv, imp, now));
    await saveImport({ ...imp, status: "confirmed", updatedAt: now });
    return NextResponse.json({ versionId: cv.id });
  } catch (err) {
    return failure("api/cv/imports/[id]/confirm POST", err, "The CV could not be opened in the builder.");
  }
}
