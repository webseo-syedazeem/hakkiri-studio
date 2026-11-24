import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { presentationFromForm } from "@/lib/pitch/payload";
import { savePresentation } from "@/lib/pitch/store";
import { requireUser } from "@/lib/auth/require";
import { readForm } from "@/lib/http/body";

export const runtime = "nodejs";

/** POST /api/presentations: saves a new presentation from the set-up form (design screen 11). */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (r) {
    return r as Response;
  }

  // A deck's text and its slide pictures: 64 MB in all is far more than a real deck, and nothing larger is read in.
  const read = await readForm(req, 64 * 1024 * 1024, "That presentation couldn’t be read. Try again.");
  if (!read.ok) return read.response;
  const form = read.data;
  const id = randomUUID().slice(0, 12);
  const p = await presentationFromForm(form, id);
  if ("message" in p) return NextResponse.json({ error: "bad-request", message: p.message }, { status: 400 });
  p.userId = user.id;
  savePresentation(p, user.id);
  return NextResponse.json({ id });
}
