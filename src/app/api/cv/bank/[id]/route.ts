import { NextResponse } from "next/server";
import { AchievementInput, badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { deleteAchievement, getOwnAchievement, saveAchievement } from "@/lib/cv/store";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/cv/bank/[id]: changes an achievement's wording, role, skills or privacy. CVs that already use it keep the wording they have. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const existing = await getOwnAchievement((await params).id, userId);
    if (!existing) return notFound("Achievement");
    const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const parsed = AchievementInput.partial().strict().safeParse(raw);
    if (!parsed.success || !raw) return badInput("That change could not be saved.");
    // Only what was sent is changed: a field left out keeps its value (and is not reset to its default).
    const changes = Object.fromEntries(Object.entries(parsed.data).filter(([k]) => k in raw));
    if ("text" in changes && !changes.text) return badInput("An achievement cannot be empty.", { text: "Write what you did." });
    const saved = await saveAchievement({ ...existing, ...changes, updatedAt: new Date().toISOString() });
    return NextResponse.json({ achievement: saved });
  } catch (err) {
    return failure("api/cv/bank/[id] PATCH", err, "That change could not be saved.");
  }
}

/** DELETE /api/cv/bank/[id]: removes the saved achievement. Lines already on a CV stay there. */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const existing = await getOwnAchievement((await params).id, userId);
    if (!existing) return notFound("Achievement");
    await deleteAchievement(existing.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("api/cv/bank/[id] DELETE", err, "That achievement could not be deleted.");
  }
}
