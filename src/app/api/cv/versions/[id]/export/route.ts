import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { exportCv } from "@/lib/cv/render/server";
import { cvIsEmpty } from "@/lib/cv/schema";
import { cvIsEmpty as isEmpty, newId } from "@/lib/cv/schema";
import { getOwnCv, saveExport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * GET /api/cv/versions/[id]/export?format=pdf|docx: the CV as a file.
 *
 * The file is made, read straight back and compared with the CV. Only a file
 * that says exactly what the CV says is sent, and the bytes sent are the bytes
 * that were checked. If the check finds a difference the file is withheld and
 * the differences are returned instead.
 *
 * If the file was made but the reader itself broke, nothing is known about the
 * file. It is then sent only when asked for by name (`unchecked=1`), and is
 * labelled as unchecked. A file with a known difference is never sent.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const format = new URL(req.url).searchParams.get("format");
    if (format !== "pdf" && format !== "docx") return NextResponse.json({ error: "invalid_input", message: "Choose PDF or Word." }, { status: 400 });
    if (cvIsEmpty(cv)) return NextResponse.json({ error: "empty", message: "There is nothing to download yet. Add your details first." }, { status: 409 });
    const now = new Date();
    const out = await exportCv(cv, format, now);
    /** Remembers this download: the CV exactly as it was, so the same file can be made again later. */
    const remember = async (checked: boolean) => {
      if (isEmpty(cv)) return "";
      const id = newId("exp_").slice(0, 20);
      await saveExport({ id, userId, versionId: cv.id, rev: cv.rev, format, name: out.name, at: now.toISOString(), checked, pages: out.pages, cv: { name: cv.name, level: cv.level, region: cv.region, target: cv.target, contact: cv.contact, sections: cv.sections, design: cv.design } }).catch((err) => console.error("[cv export] the record of this download could not be saved:", err));
      return id;
    };
    if (!out.check) {
      if (new URL(req.url).searchParams.get("unchecked") !== "1") {
        return NextResponse.json({ error: "check_failed", message: "The file was made, but it could not be read back to check it." }, { status: 503 });
      }
      return new Response(out.bytes as unknown as BodyInit, { headers: { ...out.headers, "x-cv-check": "unchecked", "x-cv-pages": String(out.pages), "x-cv-rev": String(cv.rev), "x-cv-export": await remember(false) } });
    }
    if (out.check.status !== "checked") {
      return NextResponse.json({ error: "loss", message: "The file did not read back the same as your CV, so it has not been sent.", check: out.check, unsupported: out.missing }, { status: 409 });
    }
    return new Response(out.bytes as unknown as BodyInit, { headers: { ...out.headers, "x-cv-check": "checked", "x-cv-pages": String(out.pages), "x-cv-rev": String(cv.rev), "x-cv-export": await remember(true) } });
  } catch (err) {
    return failure("api/cv/versions/[id]/export GET", err, "The file could not be made.");
  }
}
