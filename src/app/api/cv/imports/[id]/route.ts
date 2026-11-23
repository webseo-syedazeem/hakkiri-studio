import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { DraftSchema } from "@/lib/cv/import/record";
import { deleteImport, getOwnImport, saveImport } from "@/lib/cv/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    return imp ? NextResponse.json({ import: imp }) : notFound("Upload");
  } catch (err) {
    return failure("api/cv/imports/[id] GET", err, "The upload could not be loaded.");
  }
}

/** What the person can change while checking: the fields themselves, each doubt's answer, what happens to leftover text, and which steps are done. */
const PatchSchema = z
  .object({
    draft: DraftSchema.optional(),
    flags: z.array(z.object({ id: z.string().max(40), state: z.enum(["open", "confirmed", "edited", "blank"]) })).max(200).optional(),
    unassigned: z.array(z.object({ id: z.string().max(40), state: z.enum(["open", "assigned", "dismissed"]) })).max(200).optional(),
    reviewed: z.array(z.string().max(40)).max(40).optional(),
  })
  .strict();

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    if (!imp) return notFound("Upload");
    if (imp.status !== "needs-review") return NextResponse.json({ error: "closed", message: "This upload is no longer open for checking." }, { status: 409 });
    const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return badInput("That change could not be saved.");
    const { draft, flags, unassigned, reviewed } = parsed.data;
    const flagState = new Map((flags ?? []).map((f) => [f.id, f.state]));
    const textState = new Map((unassigned ?? []).map((u) => [u.id, u.state]));
    const saved = await saveImport({
      ...imp,
      draft: draft ?? imp.draft,
      flags: imp.flags.map((f) => ({ ...f, state: flagState.get(f.id) ?? f.state })),
      unassigned: imp.unassigned.map((u) => ({ ...u, state: textState.get(u.id) ?? u.state })),
      reviewed: reviewed ? [...new Set(reviewed)] : imp.reviewed,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ import: saved });
  } catch (err) {
    return failure("api/cv/imports/[id] PATCH", err, "That change could not be saved.");
  }
}

/** Discards the upload. The CV it was for stays, empty, with the set-up answers. */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    if (!imp) return notFound("Upload");
    await deleteImport(imp.id);
    return NextResponse.json({ ok: true, versionId: imp.versionId });
  } catch (err) {
    return failure("api/cv/imports/[id] DELETE", err, "The upload could not be discarded.");
  }
}
