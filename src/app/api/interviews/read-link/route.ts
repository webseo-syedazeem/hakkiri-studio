import { NextResponse } from "next/server";
import { z } from "zod";
import { readLink } from "@/lib/interviews/links";
import { guard } from "@/lib/usage/limits";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({ url: z.string().min(3).max(500), kind: z.enum(["company", "job"]) });

/**
 * POST /api/interviews/read-link: reads a company website or a job link for
 * set-up, so you can see straight away whether it worked. Returns the
 * page's readable text, or a plain message if it can't be read.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = guard(req, "read");
  if (blocked) return blocked;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "That doesn’t look like a web address." }, { status: 400 });
  return NextResponse.json(await readLink(parsed.data.url, parsed.data.kind));
}
