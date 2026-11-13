import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterview, getInterviewAsync } from "@/lib/interviews/store";
import { mixIsValid, presetFor } from "@/lib/interviews/settings";
import { SettingsBody } from "@/lib/interviews/settings-schema";
import { PlanError, planDrill, planInterview, planRerun } from "@/lib/sessions/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { flushStorage } from "@/lib/storage/disk";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 180;

const Group = z.enum(["motivation", "competency", "technical", "cv", "curveball"]);

const Body = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("interview"), settings: SettingsBody }),
  z.object({ kind: z.literal("rerun"), sessionId: z.string() }),
  z.object({
    kind: z.literal("drill"),
    drill: z.object({
      kind: z.enum(["fix", "category", "habit", "pressure", "pay", "topic"]),
      questionId: z.string().optional(),
      group: Group.optional(),
      habit: z.enum(["lead", "ownership", "numbers", "short", "fillers", "full"]).optional(),
      topic: z.string().max(80).optional(),
      fromSession: z.string().optional(),
      before: z.number().optional(),
    }),
  }),
]);

/**
 * POST /api/interviews/{id}/sessions: plans an interview (new questions),
 * a re-run of one, or a drill, and returns where to start it. Planning an
 * interview may write new questions first, which takes up to a minute.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const { id } = await params;
  const blocked = guard(req, "plan", { practice: true });
  if (blocked) return blocked;
  setUsageContext({ userId: user.id, interviewId: id, feature: "questions" });
  if (!((await getInterviewAsync(id, user.id)) ?? getInterview(id, user.id))) return NextResponse.json({ error: "not-found", message: "That interview doesn’t exist any more." }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Those settings couldn’t be used. Check them and try again." }, { status: 400 });
  const body = parsed.data;
  try {
    let sessionId: string;
    if (body.kind === "interview") {
      if (!mixIsValid(body.settings.mix)) return NextResponse.json({ error: "bad-request", message: "The question mix has to add up to 100%." }, { status: 400 });
      const settings = { ...body.settings, preset: presetFor(body.settings.mix) };
      sessionId = (await planInterview(id, settings, user.id)).id;
    } else if (body.kind === "rerun") {
      sessionId = planRerun(id, body.sessionId, user.id).id;
    } else {
      sessionId = (await planDrill(id, body.drill, user.id)).id;
    }
    await flushStorage();
    return NextResponse.json({ id: sessionId, href: `/mock/${id}?session=${sessionId}` });
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: "cant-plan", message: err.message }, { status: 409 });
    console.error("[sessions] planning failed:", err);
    return NextResponse.json({ error: "failed", message: "Your interview couldn’t be set up. Try again." }, { status: 500 });
  }
}
