import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getApplySettings, saveApplySettings } from "@/lib/apply/db";
import type { ApplySettings } from "@/lib/apply/schema";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(await getApplySettings(user.id));
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/settings GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load settings." }, { status: 500 });
  }
}

const item = (max: number) => z.string().trim().min(1).max(max);
/** The preferences a person can set. Each is checked; anything else that is sent is ignored. */
const Put = z
  .object({
    titles: z.array(item(80)).max(8),
    locations: z.array(item(80)).max(20),
    remote: z.boolean(),
    salaryMin: z.number().min(0).max(10_000_000),
    excludeEmployers: z.array(item(120)).max(100),
    minFit: z.number().min(60).max(90),
    dailyCap: z.number().int().min(1).max(10),
    perEmployerCap: z.number().int().min(1).max(20),
    handsOff: z.boolean(),
  })
  .partial();

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const read = await readJson(req, Put, { max: 40_000, message: "Those settings couldn’t be saved. Check each one and try again." });
    if (!read.ok) return read.response;
    const existing = await getApplySettings(user.id);
    const updated: ApplySettings = { ...existing, ...read.data, userId: user.id, updatedAt: new Date().toISOString() };
    await saveApplySettings(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/settings PUT] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to save settings." }, { status: 500 });
  }
}
