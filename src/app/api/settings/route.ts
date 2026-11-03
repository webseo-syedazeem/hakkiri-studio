import { NextResponse } from "next/server";
import { z } from "zod";
import { saveSettings } from "@/lib/settings/store";
import { pruneRecordings } from "@/lib/answers/audio";

export const runtime = "nodejs";

const Body = z.object({ retentionDays: z.union([z.literal(30), z.literal(90), z.literal(365), z.literal(0)]) });

/** POST /api/settings: change how long recordings are kept (older ones go straight away). */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const settings = saveSettings(parsed.data);
  const removed = pruneRecordings({ force: true });
  return NextResponse.json({ settings, removed });
}
