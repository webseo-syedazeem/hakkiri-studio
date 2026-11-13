import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestPlan } from "@/lib/pitch/server";
import { guard } from "@/lib/usage/limits";
import { setUsageContext } from "@/lib/usage/store";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  title: z.string().max(120),
  audience: z.enum(["investors", "leadership", "client", "team", "conference"]),
  ask: z.string().max(240),
  limitSec: z.number().int().min(60).max(5400),
  slides: z
    .array(z.object({ title: z.string().max(200), lines: z.array(z.string().max(400)).max(30), notes: z.string().max(4000).optional() }))
    .min(1)
    .max(80),
});

/**
 * POST /api/presentations/plan: suggested timing for each slide and the point
 * each needs to land (design screen 11). Uses the main model when there's a
 * key, otherwise an estimate from what's on each slide; either way the times
 * add up to your limit.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = guard(req, "ai");
  if (blocked) return blocked;
  setUsageContext({ feature: "presentation" });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Those slides couldn’t be read." }, { status: 400 });
  return NextResponse.json(await suggestPlan(parsed.data));
}
