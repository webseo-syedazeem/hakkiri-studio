import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { presentationFromForm } from "@/lib/pitch/payload";
import { savePresentation } from "@/lib/pitch/store";

export const runtime = "nodejs";

/** POST /api/presentations: saves a new presentation from the set-up form (design screen 11). */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad-request", message: "That presentation couldn’t be read. Try again." }, { status: 400 });
  const id = randomUUID().slice(0, 12);
  const p = await presentationFromForm(form, id);
  if ("message" in p) return NextResponse.json({ error: "bad-request", message: p.message }, { status: 400 });
  savePresentation(p);
  return NextResponse.json({ id });
}
