import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminLayoutClient } from "./AdminLayoutClient";

// Decided per request, never cached: who is signed in is read each time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Console | Hakkiri",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The admin console. Access is decided here, on the server, before any of it
 * is sent: a signed-out visitor goes to sign in, and anyone who is not an
 * administrator gets "not found". Nothing in the browser can unlock it.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminPage();
  return <AdminLayoutClient email={admin.email ?? ""}>{children}</AdminLayoutClient>;
}
