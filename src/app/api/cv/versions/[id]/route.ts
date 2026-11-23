import { NextResponse } from "next/server";
import { z } from "zod";
import { EditableSchema, badInput, failure, notFound, requireUserId, saveProblem, sectionIdsDiffer, tooBig } from "@/lib/cv/access";
import { deleteCv, deleteImport, getOwnCv, listOwnImports, saveCv } from "@/lib/cv/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    return cv ? NextResponse.json({ cv }) : notFound();
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
    const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
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
    // The uploads made for this CV go with it.
    for (const imp of await listOwnImports(userId)) if (imp.versionId === cv.id) await deleteImport(imp.id);
    await deleteCv(cv.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("api/cv/versions/[id] DELETE", err, "The CV could not be deleted.");
  }
}
