import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { CV_LEVELS, CV_REGIONS, ContactSchema, DesignSchema, SectionSchema, TargetSchema } from "@/lib/cv/schema";
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
 * What the browser may change. The owner, the id and the dates are never taken
 * from the browser. `rev` is the revision the change was made on: a save from an
 * out-of-date copy is refused, so one tab can never silently overwrite another.
 * `saveId` names this save, so the same save sent twice is applied once.
 */
const PatchSchema = z
  .object({
    rev: z.number().int().min(1),
    saveId: z.string().max(40).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    level: z.enum(CV_LEVELS).optional(),
    region: z.enum(CV_REGIONS).optional(),
    target: TargetSchema.nullable().optional(),
    contact: ContactSchema.optional(),
    sections: z.array(SectionSchema).max(24).optional(),
    design: DesignSchema.optional(),
  })
  .strict();

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return badInput("That change could not be saved.");
    const { rev, saveId, target, ...changes } = parsed.data;
    if (saveId && cv.lastSaveId === saveId) return NextResponse.json({ cv });
    if (rev !== cv.rev) return NextResponse.json({ error: "conflict", message: "This CV was changed somewhere else.", cv }, { status: 409 });
    const ids = (changes.sections ?? []).map((s) => s.id);
    if (new Set(ids).size !== ids.length) return badInput("That change could not be saved.");
    const saved = await saveCv({
      ...cv,
      ...changes,
      target: target === null ? undefined : (target ?? cv.target),
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
