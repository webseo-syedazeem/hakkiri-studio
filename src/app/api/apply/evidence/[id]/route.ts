import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require";
import { getDoc, saveDoc, deleteDoc, APPLY_COLLECTIONS } from "@/lib/apply/db";
import type { Evidence } from "@/lib/apply/schema";

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

    const body = await req.json();
    const updated: Evidence = {
      ...existing,
      ...body,
      id: existing.id,
      userId: user.id,
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
