import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteAccount } from "@/lib/data/account";
import { DELETE_ACCOUNT_PHRASE as CONFIRM_PHRASE } from "@/lib/data/confirm";
import { requireUser } from "@/lib/auth/require";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";
import { accountOf, checkPassword } from "@/lib/auth/user-db";
import { readJson } from "@/lib/http/body";
import { noteHit, rateLimited, recentHits } from "@/lib/usage/limits";

export const runtime = "nodejs";

const Body = z.object({ confirm: z.string().max(100), password: z.string().max(2000).optional() });

/**
 * POST /api/account/delete {confirm: "delete my account", password}: deletes
 * everything held for the signed-in person, then the account itself and every
 * session of it, and signs this browser out. An account with a password has
 * to give it again: a browser left signed in is not enough to end an account.
 * (An account that signs in with Google has no password to give; the typed
 * phrase is the confirmation.) Can't be undone.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }
  if (rateLimited(`account-delete:${user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "slow-down", message: "Wait a minute, then try again." }, { status: 429 });
  }
  // Five wrong passwords and it has to wait: the box can't be used to guess the password.
  const wrongKey = `account-delete:wrong:${user.id}`;
  if (recentHits(wrongKey, 15 * 60_000) >= 5) {
    return NextResponse.json({ error: "slow-down", message: "Too many wrong passwords. Wait 15 minutes, then try again." }, { status: 429 });
  }

  const read = await readJson(req, Body, { max: 4_000, message: `Type “${CONFIRM_PHRASE}” to confirm.` });
  if (!read.ok) return read.response;
  if (read.data.confirm.trim().toLowerCase() !== CONFIRM_PHRASE) {
    return NextResponse.json({ error: "bad-request", message: `Type “${CONFIRM_PHRASE}” to confirm.` }, { status: 400 });
  }
  const account = await accountOf(user.id);
  if (!account) return NextResponse.json({ error: "not-found", message: "That account doesn’t exist any more." }, { status: 404 });
  if (account.hasPassword && !(await checkPassword(user.id, read.data.password ?? ""))) {
    noteHit(wrongKey);
    return NextResponse.json({ error: "wrong-password", message: "That isn’t your password. Nothing has been deleted." }, { status: 403 });
  }

  try {
    const done = await deleteAccount(user.id);
    if (!done.account) throw new Error("the account record was not removed");
  } catch (err) {
    console.error("[account/delete] failed:", err);
    return NextResponse.json({ error: "failed", message: "Your account couldn’t be deleted completely. Try again, and if it happens again, tell us." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
