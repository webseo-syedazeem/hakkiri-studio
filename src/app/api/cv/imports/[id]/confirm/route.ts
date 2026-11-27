import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { applyImport } from "@/lib/cv/import/record";
import { CV_LEVELS, CV_REGIONS, cvIsEmpty } from "@/lib/cv/schema";
import { z } from "zod";
import { getOwnCv, getOwnImport, saveCv, saveImport } from "@/lib/cv/store";

/**
 * "Open in builder": puts the checked upload into its CV. Safe to send twice:
 * the second time finds the upload already confirmed and changes nothing.
 */
/** Upload first: the name, UK or US and level the person settled on before opening the editor. */
const AboutSchema = z.object({ name: z.string().trim().min(1).max(120), region: z.enum(CV_REGIONS), level: z.enum(CV_LEVELS) }).partial();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    if (!imp) return notFound("Upload");
    const cv = await getOwnCv(imp.versionId, userId);
    if (!cv) return notFound();
    // A CV started from a free check opens on its score, where the findings the person saw are; any other on the builder.
    const next = imp.then ?? (imp.checkId ? "findings" : "edit");
    if (imp.status === "confirmed") return NextResponse.json({ versionId: cv.id, next });
    if (imp.status !== "needs-review") return NextResponse.json({ error: "not_ready", message: "This file could not be read. Choose another file or paste the text first." }, { status: 409 });
    // The CV was made for this upload and should still be empty. If the person has typed into it since, keep their typing.
    if (!cvIsEmpty(cv)) return NextResponse.json({ error: "not_empty", message: "This CV already has content, so the upload was not added to it." }, { status: 409 });
    const now = new Date().toISOString();
    const about = AboutSchema.safeParse(await req.json().catch(() => ({})));
    if (imp.about && about.success) {
      const a = about.data;
      const known = { region: a.region ?? imp.about.region, level: a.level ?? imp.about.level };
      if (!known.region || !known.level) return NextResponse.json({ error: "not_known", message: "Choose UK or US and your level before opening the editor." }, { status: 400 });
      cv.name = a.name ?? cv.name;
      cv.region = known.region;
      cv.level = known.level;
      cv.design = { ...cv.design, pageSize: known.region === "us" ? "letter" : "a4", pageTarget: known.level === "student" || known.level === "early" ? 1 : 2 };
    }
    await saveCv(applyImport(cv, imp, now));
    await saveImport({ ...imp, status: "confirmed", updatedAt: now });
    return NextResponse.json({ versionId: cv.id, next });
  } catch (err) {
    return failure("api/cv/imports/[id]/confirm POST", err, "The CV could not be opened in the builder.");
  }
}
