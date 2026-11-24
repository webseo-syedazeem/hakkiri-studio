import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { readJson } from "@/lib/http/body";
import { getDoc, saveDoc, deleteDoc, APPLY_COLLECTIONS } from "@/lib/apply/db";
import type { Evidence } from "@/lib/apply/schema";

/** What a person can change about a piece of their evidence. Its owner and where it came from can't be sent in. */
const Patch = z
  .object({
    text: z.string().trim().min(5).max(5000).optional(),
    numbers: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
    skillTags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
    confirmed: z.boolean().optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getDoc<Evidence>(APPLY_COLLECTIONS.EVIDENCE, id);

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "Evidence not found." }, { status: 404 });
    }

    const read = await readJson(req, Patch, { max: 40_000, message: "That change couldn’t be saved." });
    if (!read.ok) return read.response;
    const updated: Evidence = {
      ...existing,
      ...read.data,
      updatedAt: new Date().toISOString(),
    };

    await saveDoc(APPLY_COLLECTIONS.EVIDENCE, id, updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/evidence/[id] PATCH] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to update evidence." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getDoc<Evidence>(APPLY_COLLECTIONS.EVIDENCE, id);

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "not_found", message: "Evidence not found." }, { status: 404 });
    }

    await deleteDoc(APPLY_COLLECTIONS.EVIDENCE, id);
    return NextResponse.json({ success: true, message: "Evidence deleted." });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    console.error("[api/apply/evidence/[id] DELETE] Error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to delete evidence." }, { status: 500 });
  }
}
