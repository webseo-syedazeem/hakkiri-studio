import { NextResponse } from "next/server";
import { z } from "zod";
import { EditableSchema, MAX_SAVE_BYTES, badInput, failure, makingTooFast, newCvId, notFound, readJson, requireUserId, sectionIdsDiffer, tooBig, tooBigToSave } from "@/lib/cv/access";
import { TOO_MANY_CVS, atCvLimit, getOwnCv, saveCv } from "@/lib/cv/store";

const BodySchema = z.object({ changes: EditableSchema.optional() }).strict();

/**
 * POST /api/cv/versions/[id]/duplicate: a separate copy of a CV, named
 * "Copy of …". Changing one never changes the other. `changes` are applied to
 * the copy only: that is how unsaved edits are kept as a separate version when
 * the same CV was changed in two places.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const fast = makingTooFast(userId);
    if (fast) return fast;
    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
    const read = await readJson(req, MAX_SAVE_BYTES);
    if (!read.ok && read.reason === "too-big") return tooBigToSave();
    const parsed = BodySchema.safeParse(read.ok ? read.body : {});
    if (!parsed.success || !sectionIdsDiffer(parsed.data.changes?.sections) || tooBig(parsed.data.changes?.sections)) return badInput("The copy could not be made.");
    const { target, letter, name, ...changes } = parsed.data.changes ?? {};
    const now = new Date().toISOString();
    const copy = await saveCv({
      ...structuredClone(cv),
      ...changes,
      target: target === null ? undefined : (target ?? cv.target),
      letter: letter === null ? undefined : (letter ?? structuredClone(cv.letter)),
      id: newCvId(),
      userId,
      rev: 1,
      lastSaveId: undefined,
      importId: undefined,
      name: `Copy of ${name ?? cv.name}`.slice(0, 120),
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: copy.id, name: copy.name }, { status: 201 });
  } catch (err) {
    return failure("api/cv/versions/[id]/duplicate POST", err, "The CV could not be duplicated.");
  }
}
