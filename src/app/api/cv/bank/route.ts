import { NextResponse } from "next/server";
import { AchievementInput, badInput, failure, requireUserId } from "@/lib/cv/access";
import { newId } from "@/lib/cv/schema";
import { achievementUse, listOwnAchievements, saveAchievement } from "@/lib/cv/store";

const MAX_ACHIEVEMENTS = 500;

/** GET /api/cv/bank: the person's saved achievements, newest first, each with the CVs that use it. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const [achievements, use] = await Promise.all([listOwnAchievements(userId), achievementUse(userId)]);
    return NextResponse.json({ achievements: achievements.map((a) => ({ ...a, usedIn: use[a.id] ?? [] })) });
  } catch (err) {
    return failure("api/cv/bank GET", err, "Your achievements could not be loaded.");
  }
}

/** POST /api/cv/bank: saves an achievement in the person's own, approved wording. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const parsed = AchievementInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return badInput("That achievement could not be saved.");
    if (!parsed.data.text) return badInput("Write the achievement first.", { text: "Write what you did." });
    if ((await listOwnAchievements(userId)).length >= MAX_ACHIEVEMENTS) return badInput("You have reached the limit of saved achievements. Delete some you no longer need.");
    const now = new Date().toISOString();
    const saved = await saveAchievement({ ...parsed.data, id: newId("ach_").slice(0, 20), userId, createdAt: now, updatedAt: now });
    return NextResponse.json({ achievement: { ...saved, usedIn: [] } }, { status: 201 });
  } catch (err) {
    return failure("api/cv/bank POST", err, "That achievement could not be saved.");
  }
}
