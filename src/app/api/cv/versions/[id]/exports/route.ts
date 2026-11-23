import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { getOwnCv, listOwnExports } from "@/lib/cv/store";

/** GET /api/cv/versions/[id]/exports: the downloads remembered for this CV, newest first, without their contents. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const records = await listOwnExports(userId, cv.id);
    return NextResponse.json({ exports: records.map(({ cv: _cv, userId: _u, ...r }) => r), rev: cv.rev });
  } catch (err) {
    return failure("api/cv/versions/[id]/exports GET", err, "Your downloads could not be listed.");
  }
}
