import { NextResponse } from "next/server";
import { z } from "zod";
import { EditableSchema, MAX_SAVE_BYTES, badInput, failure, notFound, readJson, requireUserId, saveProblem, sectionIdsDiffer, tooBig, tooBigToSave } from "@/lib/cv/access";
import { currentFileChecks, deleteCvAndRecords, getOwnCv, saveCv } from "@/lib/cv/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    // With the CV: how its files read back, if they were checked for the CV exactly as it is now.
    const files = await currentFileChecks(cv);
    return NextResponse.json({ cv, files: files ? { rev: files.rev, pdf: files.pdf, docx: files.docx } : undefined });
  } catch (err) {
    return failure("api/cv/versions/[id] GET", err, "The CV could not be loaded.");
  }
}

/**
 * A save. `rev` is the revision the change was made on: a save from an
 * out-of-date copy is refused, so one tab can never silently overwrite another.
 * `saveId` names this save, so the same save sent twice is applied once.
 */
const PatchSchema = EditableSchema.extend({ rev: z.number().int().min(1), saveId: z.string().max(40).optional() }).strict();

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    // The body is counted as it arrives: one far larger than any CV is refused without being read to the end.
    const read = await readJson(req, MAX_SAVE_BYTES);
    if (!read.ok && read.reason === "too-big") return tooBigToSave();
    const parsed = PatchSchema.safeParse(read.ok ? read.body : null);
    // The reason is said, so the screen can show it: a save that is refused is never shown as saved.
    if (!parsed.success) return badInput(saveProblem(parsed.error));
    const { rev, saveId, target, letter, ...changes } = parsed.data;
    if (saveId && cv.lastSaveId === saveId) return NextResponse.json({ cv });
    if (rev !== cv.rev) return NextResponse.json({ error: "conflict", message: "This CV was changed somewhere else.", cv }, { status: 409 });
    if (!sectionIdsDiffer(changes.sections)) return badInput("Two parts of this CV have the same id, so the change could not be saved. Reload the page and try again.");
    const big = tooBig(changes.sections);
    if (big) return badInput(big);
    const saved = await saveCv({
      ...cv,
      ...changes,
      target: target === null ? undefined : (target ?? cv.target),
      letter: letter === null ? undefined : (letter ?? cv.letter),
      rev: cv.rev + 1,
      lastSaveId: saveId,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ cv: saved });
  } catch (err) {
    return failure("api/cv/versions/[id] PATCH", err, "The CV could not be saved.");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    // Everything kept for this CV alone goes with it: its uploads, the copies kept of what was downloaded, its file checks.
    await deleteCvAndRecords(cv);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("api/cv/versions/[id] DELETE", err, "The CV could not be deleted.");
  }
}
