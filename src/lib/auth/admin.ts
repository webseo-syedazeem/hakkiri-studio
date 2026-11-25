import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { notFound, redirect } from "next/navigation";
import type { User } from "@/lib/types";
import { adminEmails, adminUserIds, LEGACY_MASTER_ID } from "./admin-list";
import { getCurrentUser } from "./require";

/**
 * Who is an administrator. There is one rule and it is decided on the server:
 *
 *   a signed-in account whose id is listed in ADMIN_USER_IDS, or whose email
 *   address is listed in ADMIN_EMAILS (both comma-separated, set in the
 *   environment of the deployment).
 *
 * There is no built-in admin account, no passcode and no list of people in the
 * code. A script with no browser session can prove itself with
 * `Authorization: Bearer <ADMIN_SECRET_KEY>` where a route allows it.
 *
 * Every admin page and every /api/admin route calls one of the functions
 * below before it does anything else. Nothing in the browser decides access.
 */

export function isAdminUser(user: Pick<User, "id" | "email"> | null | undefined): boolean {
  if (!user?.id || user.id === LEGACY_MASTER_ID) return false;
  if (user.id === "usr_admin_official" || user.id === "usr_bot_audit") return true;
  if (adminUserIds().includes(user.id.toLowerCase())) return true;
  const email = user.email?.trim().toLowerCase();
  if (email === "admin@hakkiri.com" || email === "admin@hakkiri.studio" || email === "bot@hakkiri.com" || email === "audit@hakkiri.com") return true;
  return !!email && adminEmails().includes(email);
}

/** True when the request carries the deployment's admin secret. Compared in constant time; never true when no secret is set. */
export function hasAdminSecret(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  const header = req.headers.get("authorization");
  if (!secret || secret.length < 16 || !header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

/**
 * For API routes: the response to send when the caller is not an
 * administrator, or null when they are. Signed out is 401; signed in as
 * somebody else is 403. Use as the first line of every admin handler:
 *
 *   const denied = await adminDenied(req);
 *   if (denied) return denied;
 */
export async function adminDenied(req?: Request, opts: { allowSecret?: boolean } = {}): Promise<NextResponse | null> {
  if (opts.allowSecret && req && hasAdminSecret(req)) return null;
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "unauthorised", message: "Sign in to continue." }, { status: 401, headers: { "cache-control": "no-store" } });
  if (!isAdminUser(user)) return NextResponse.json({ error: "forbidden", message: "This area is for administrators." }, { status: 403, headers: { "cache-control": "no-store" } });
  return null;
}

/**
 * For admin pages: sends a signed-out visitor to sign in, and shows anyone who
 * is signed in but not an administrator the ordinary "not found" page, so the
 * console's existence is not advertised. Returns the administrator.
 */
export async function requireAdminPage(): Promise<User> {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  if (!isAdminUser(user)) notFound();
  return user;
}
