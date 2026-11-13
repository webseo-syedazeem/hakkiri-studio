import { exportAll } from "@/lib/data/account";
import { londonToday } from "@/lib/dates";
import { guard } from "@/lib/usage/limits";
import { requireUser } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/data/export: "Download my data", a zip of everything Hakkiri holds about you. */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const blocked = guard(req, "read");
  if (blocked) return blocked;
  const zip = await exportAll(user.id);
  return new Response(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="hakkiri-data-${londonToday()}.zip"`,
      "cache-control": "no-store",
    },
  });
}
