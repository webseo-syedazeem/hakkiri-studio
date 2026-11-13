import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "./user-db";
import type { User } from "@/lib/types";

export type { User };

/**
 * Ensures a valid user session for Server Components / Pages.
 * Redirects immediately to /login if unauthenticated, preventing parallel RSC streaming leaks.
 */
export async function requirePageUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect("/login");
  }
  return user;
}

/**
 * Retrieves the currently authenticated user from the session cookie, or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hakkiri_session")?.value;
    if (!token) return null;
    return await validateSession(token);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    if (process.env.NODE_ENV !== "test") {
      console.error("[requireUser] Error validating session cookie:", err);
    }
    return null;
  }
}

/**
 * Ensures a valid session exists. Throws a 401 response if unauthenticated.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Response(
      JSON.stringify({
        error: "unauthorised",
        message: "You must be signed in to perform this action.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return user;
}
