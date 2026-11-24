import { NextResponse } from "next/server";
import { z } from "zod";
import { saveSettings } from "@/lib/settings/store";
import { pruneOldRecordings } from "@/lib/data/account";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";

export const runtime = "nodejs";

const Body = z.object({ retentionDays: z.union([z.literal(30), z.literal(90), z.literal(365), z.literal(0)]) }).strict();

/**
 * POST /api/settings: change how long your recordings are kept. Your own
 * recordings that are already older than that go straight away; nobody
 * else's are touched, and nobody else's setting changes.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  const read = await readJson(req, Body, { max: 1_000 });
  if (!read.ok) return read.response;
  const settings = saveSettings(read.data, user.id);
  const removed = pruneOldRecordings({ force: true, userId: user.id });
  return NextResponse.json({ settings, removed });
}
