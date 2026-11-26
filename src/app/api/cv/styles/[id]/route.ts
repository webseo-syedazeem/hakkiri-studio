import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { deleteStyle, getOwnStyle } from "@/lib/cv/store";

export const runtime = "nodejs";

/** DELETE /api/cv/styles/[id]: removes one of the person's saved styles. CVs that used it keep their look. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    if (!(await getOwnStyle(id, userId))) return notFound("Style");
    await deleteStyle(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("api/cv/styles/[id] DELETE", err, "The style couldn’t be deleted.");
  }
}
