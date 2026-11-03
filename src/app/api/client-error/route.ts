import { NextResponse } from "next/server";
import { z } from "zod";
import { reportProblem } from "@/lib/alerts/store";
import { clientKey, rateLimited } from "@/lib/usage/limits";

export const runtime = "nodejs";

const Body = z.object({ message: z.string().max(400), stack: z.string().max(1500).optional(), path: z.string().max(300), agent: z.string().max(160).optional() });

/** POST /api/client-error: a crash in someone's browser (from src/instrumentation-client.ts). */
export async function POST(req: Request) {
  if (rateLimited(`client-error:${clientKey(req)}`, 20, 60_000)) return new NextResponse(null, { status: 204 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const { message, stack, path, agent } = parsed.data;
  const browser = agent ? (/Firefox\//.test(agent) ? "Firefox" : /Edg\//.test(agent) ? "Edge" : /Chrome\//.test(agent) ? "Chrome" : /Safari\//.test(agent) ? "Safari" : "Other browser") : "Browser";
  await reportProblem({ source: "browser", where: `${path.split("?")[0]} (${browser})`, message, stack });
  return new NextResponse(null, { status: 204 });
}
