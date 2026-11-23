import "server-only";
import { NextResponse } from "next/server";
import { getCv } from "@/lib/apply/db";
import { requireUser } from "@/lib/auth/require";
import type { Cv } from "@/lib/apply/schema";

/**
 * Loads a CV only if it belongs to this user. Anything else (no such CV, or
 * someone else's) answers the same 404, so an address can't be used to find
 * out that another person's CV exists.
 */
export async function loadOwnCv(id: string, userId: string): Promise<Cv | null> {
  if (!id || !userId) return null;
  const cv = await getCv(id);
  if (!cv || cv.userId !== userId) return null;
  return cv;
}

export function cvNotFound() {
  return NextResponse.json({ error: "not_found", message: "CV not found." }, { status: 404 });
}

/** The signed-in person's id. Throws the same 401 response as requireUser when signed out. */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id as string;
}
