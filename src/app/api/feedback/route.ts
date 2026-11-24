import { NextResponse } from "next/server";
import { z } from "zod";
import { addFeedback } from "@/lib/feedback/store";
import { rateLimited } from "@/lib/usage/limits";
import { requireUser } from "@/lib/auth/require";
import { readJsonValue } from "@/lib/http/body";

export const runtime = "nodejs";

const Body = z.object({
  page: z.string().max(300),
  mood: z.enum(["good", "ok", "bad"]),
  text: z.string().trim().min(1).max(2000),
  screen: z.string().max(60).optional(),
  lead: z.string().max(200).optional(),
});

/**
 * POST /api/feedback: a note from the Feedback button. The button is only in
 * the app, so a note comes from a signed-in person: it is kept with their
 * account (they can download and delete it), and counted against them, ten a
 * minute. It used to be open to anyone, which let anybody fill the team's
 * alert channel.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  if (rateLimited(`feedback:user:${user.id}`, 10, 60_000)) return NextResponse.json({ error: "slow-down" }, { status: 429 });
  const sent = await readJsonValue(req, 16_000);
  if (!sent.ok) return sent.response;
  const parsed = Body.safeParse(sent.json);
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const f = await addFeedback({ ...parsed.data, userId: user.id });
  return NextResponse.json({ id: f.id });
}
