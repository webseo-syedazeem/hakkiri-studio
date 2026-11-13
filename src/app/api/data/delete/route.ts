import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteAll } from "@/lib/data/account";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";

const Body = z.object({ confirm: z.literal("delete") });

/** POST /api/data/delete {confirm: "delete"}: "Delete all my data". Can't be undone. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Type delete to confirm." }, { status: 400 });
  deleteAll(user.id);
  return NextResponse.json({ ok: true });
}
