import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminUser } from "@/lib/auth/admin";
import { requirePageUser } from "@/lib/auth/require";

/**
 * Applications (the job tracker, matches and applying) come after the beta. Until then the
 * Apply area is for administrators only: everyone else gets "not found", decided on the server.
 * The old /apply/cvs addresses still lead to the CV section (next.config.ts redirects).
 */
export default async function ApplyLayout({ children }: { children: ReactNode }) {
  const user = await requirePageUser();
  if (!isAdminUser(user)) notFound();
  return <>{children}</>;
}
