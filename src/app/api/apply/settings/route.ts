import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getApplySettings, saveApplySettings } from "@/lib/apply/db";
import type { ApplySettings } from "@/lib/apply/schema";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const settings = await getApplySettings(userId);
    return NextResponse.json(settings);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/settings GET] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load settings." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const userId = user.id || "usr_guest";
    const existing = await getApplySettings(userId);
    const body = await req.json();

    const updated: ApplySettings = {
      ...existing,
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await saveApplySettings(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/settings PUT] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to save settings." }, { status: 500 });
  }
}
