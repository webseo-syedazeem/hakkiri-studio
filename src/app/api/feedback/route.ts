import { NextResponse } from "next/server";
import { z } from "zod";
import { addFeedback } from "@/lib/feedback/store";
import { clientKey, rateLimited } from "@/lib/usage/limits";
import { getCurrentUser } from "@/lib/auth/require";

export const runtime = "nodejs";

const Body = z.object({
  page: z.string().max(300),
  mood: z.enum(["good", "ok", "bad"]),
  text: z.string().trim().min(1).max(2000),
  screen: z.string().max(60).optional(),
  lead: z.string().max(200).optional(),
});

/** POST /api/feedback: a note from the Feedback button. */
export async function POST(req: Request) {
  if (rateLimited(`feedback:${clientKey(req)}`, 10, 60_000))
    return NextResponse.json({ error: "slow-down" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const user = await getCurrentUser();
  const f = await addFeedback({ ...parsed.data, userId: user?.id });
  return NextResponse.json({ id: f.id });
}
