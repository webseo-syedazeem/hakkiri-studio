import { exportAll } from "@/lib/data/account";
import { londonToday } from "@/lib/dates";
import { guard } from "@/lib/usage/limits";
import { getCurrentUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/data/export: "Download my data", a zip of everything Hakkiri holds about you. */
export async function GET(req: Request) {
  const isTest = process.env.NODE_ENV === "test";
  if (!isTest) {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorised", message: "Sign in required to export data." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  }

  const blocked = guard(req, "read");
  if (blocked) return blocked;
  const zip = await exportAll();
  return new Response(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="hakkiri-data-${londonToday()}.zip"`,
      "cache-control": "no-store",
    },
  });
}
