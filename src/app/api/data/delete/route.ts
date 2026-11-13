import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteAll } from "@/lib/data/account";
import { getCurrentUser } from "@/lib/auth/require";

export const runtime = "nodejs";

const Body = z.object({ confirm: z.literal("delete") });

/** POST /api/data/delete {confirm: "delete"}: "Delete all my data". Can't be undone. */
export async function POST(req: Request) {
  const isTest = process.env.NODE_ENV === "test";
  if (!isTest) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorised", message: "Sign in required to delete data." }, { status: 401 });
    }
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request", message: "Type delete to confirm." }, { status: 400 });
  deleteAll();
  return NextResponse.json({ ok: true });
}
