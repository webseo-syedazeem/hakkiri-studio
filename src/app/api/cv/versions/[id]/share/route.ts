import { NextResponse } from "next/server";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { cvIsEmpty } from "@/lib/cv/schema";
import { type Share, newShareToken, shareable } from "@/lib/cv/share";
import { deleteShare, getOwnCv, getOwnShareFor, saveShare } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

const view = (share: Share | null, rev: number) => ({
  share: share ? { path: `/s/${share.id}`, rev: share.rev, publishedAt: share.publishedAt, current: share.rev === rev } : null,
  rev,
});

/** GET: whether this CV has a read-only link, and which revision it shows. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    return NextResponse.json(view(await getOwnShareFor(cv.id, userId), cv.rev));
  } catch (err) {
    return failure("api/cv/versions/[id]/share GET", err, "We couldn’t check whether this CV is shared.");
  }
}

/**
 * POST: turns sharing on, or shares the CV as it is now. The link keeps its
 * address when the shared version is updated; only what is on the page goes
 * into it.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const limited = guard(req, "plan", { userId });
    if (limited) return limited;
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    if (cvIsEmpty(cv)) return badInput("There is nothing on this CV to share yet. Add your details first.");
    const now = new Date().toISOString();
    const before = await getOwnShareFor(cv.id, userId);
    const share = await saveShare({ id: before?.id ?? newShareToken(), userId, versionId: cv.id, rev: cv.rev, cv: shareable(cv), publishedAt: now, createdAt: before?.createdAt ?? now });
    return NextResponse.json(view(share, cv.rev), { status: before ? 200 : 201 });
  } catch (err) {
    return failure("api/cv/versions/[id]/share POST", err, "We couldn’t create the link. Try again.");
  }
}

/** DELETE: turns sharing off. The link stops working at once and its copy of the CV is deleted. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const share = await getOwnShareFor(cv.id, userId);
    if (share) await deleteShare(share.id);
    return NextResponse.json(view(null, cv.rev));
  } catch (err) {
    return failure("api/cv/versions/[id]/share DELETE", err, "We couldn’t turn sharing off. Try again.");
  }
}
