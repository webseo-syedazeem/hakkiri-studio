import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteEverything } from "@/lib/data/account";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { rateLimited } from "@/lib/usage/limits";

export const runtime = "nodejs";

const Body = z.object({ confirm: z.literal("delete") });

/**
 * POST /api/data/delete {confirm: "delete"}: "Delete all my data". Everything
 * held for the signed-in person goes, here and in the database, before this
 * answers. The account stays. Can't be undone.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  if (rateLimited(`data-delete:${user.id}`, 5, 60_000)) return NextResponse.json({ error: "slow-down", message: "Wait a minute, then try again." }, { status: 429 });

  const read = await readJson(req, Body, { max: 1_000, message: "Type delete to confirm." });
  if (!read.ok) return read.response;
  try {
    await deleteEverything(user.id);
  } catch (err) {
    console.error("[data/delete] failed:", err);
    return NextResponse.json({ error: "failed", message: "Not everything could be deleted. Try again, and if it happens again, tell us." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
