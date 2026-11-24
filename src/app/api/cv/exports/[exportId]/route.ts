import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { deleteExport, getOwnExport } from "@/lib/cv/store";

type Ctx = { params: Promise<{ exportId: string }> };

/** GET /api/cv/exports/[exportId]: one remembered download, with the CV exactly as it was. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const record = await getOwnExport((await params).exportId, userId);
    if (!record) return notFound("Download");
    const { userId: _u, ...rest } = record;
    return NextResponse.json({ export: rest });
  } catch (err) {
    return failure("api/cv/exports/[exportId] GET", err, "That download could not be opened.");
  }
}

/** DELETE /api/cv/exports/[exportId]: forgets one download. The CV itself is untouched. */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const record = await getOwnExport((await params).exportId, userId);
    if (!record) return notFound("Download");
    await deleteExport(record.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("api/cv/exports/[exportId] DELETE", err, "That record could not be deleted.");
  }
}
