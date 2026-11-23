import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { exportCv } from "@/lib/cv/render/server";
import { cvIsEmpty } from "@/lib/cv/schema";
import { getOwnCv } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * POST /api/cv/versions/[id]/check: makes the PDF and the Word file, reads
 * each back and says, per file, whether it matches the CV. No AI is involved.
 * The answer names the revision that was checked: once the CV changes, the
 * result is out of date.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    if (cvIsEmpty(cv)) return NextResponse.json({ error: "empty", message: "There is nothing to check yet. Add your details first." }, { status: 409 });
    const results: Record<string, unknown> = {};
    for (const format of ["pdf", "docx"] as const) {
      try {
        const out = await exportCv(cv, format);
        // "failed" with `made`: the file exists but could not be read back, so nothing is claimed about it.
        results[format] = out.check
          ? { status: out.check.status, name: out.name, pages: out.pages, words: out.check.words, missing: out.check.missing, unexpected: out.check.unexpected, unsupported: out.missing, size: out.bytes.length }
          : { status: "failed", made: true, name: out.name };
      } catch (err) {
        console.error(`[api/cv check] ${format} failed:`, err);
        results[format] = { status: "failed" };
      }
    }
    return NextResponse.json({ rev: cv.rev, checkedAt: new Date().toISOString(), ...results });
  } catch (err) {
    return failure("api/cv/versions/[id]/check POST", err, "The files could not be checked.");
  }
}
