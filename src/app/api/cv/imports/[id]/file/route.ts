import { NextResponse } from "next/server";
import { badInput, failure, notFound, requireUserId } from "@/lib/cv/access";
import { IMPORT_ERRORS } from "@/lib/cv/import";
import { readForm, readUpload } from "@/lib/cv/import/server";
import { getOwnCv, getOwnImport, saveImport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * Replaces the file of an upload, or reads pasted text in its place: the way
 * forward when a file was a scan, password-protected or read badly. What was
 * read before is replaced; nothing has reached the CV yet.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    const imp = await getOwnImport((await params).id, userId);
    if (!imp) return notFound("Upload");
    if (imp.status === "confirmed") return NextResponse.json({ error: "closed", message: "This upload has already been opened in the builder." }, { status: 409 });
    const cv = await getOwnCv(imp.versionId, userId);
    if (!cv) return notFound();
    const form = await readForm(req);
    if (form === "too-big") return NextResponse.json({ error: "too_big", message: IMPORT_ERRORS["too-big"].message }, { status: 413 });
    const file = form?.get("file");
    const text = form?.get("text");
    const hasFile = file instanceof File && file.size > 0;
    const hasText = typeof text === "string" && text.trim().length > 0;
    if (!hasFile && !hasText) return badInput("Choose a file or paste the text of your CV.");
    const now = new Date().toISOString();
    const next = await saveImport(await readUpload({ id: imp.id, userId, versionId: imp.versionId, createdAt: imp.createdAt }, cv, { file: hasFile ? (file as File) : null, text: hasText ? (text as string) : null }, now));
    return NextResponse.json({ importId: next.id, versionId: next.versionId, status: next.status, error: next.error });
  } catch (err) {
    return failure("api/cv/imports/[id]/file POST", err, "The file could not be read.");
  }
}
