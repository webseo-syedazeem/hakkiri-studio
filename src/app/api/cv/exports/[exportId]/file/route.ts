import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { exportCv, exportLetter } from "@/lib/cv/render/server";
import { getOwnExport } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * GET /api/cv/exports/[exportId]/file: the file as it was sent. It is made
 * again from the copy of the CV kept with the record, at the same time stamp,
 * which gives the same file. No new record is kept for it.
 */
export async function GET(req: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const limited = guard(req, "read");
  if (limited) return limited;
  try {
    const userId = await requireUserId();
    const record = await getOwnExport((await params).exportId, userId);
    if (!record) return notFound("Download");
    const kept = { ...record.cv, design: { ...record.cv.design } };
    const out = record.what === "cv" ? await exportCv(kept, record.format, new Date(record.at)) : await exportLetter(kept, record.format, { withCv: record.what === "both", now: new Date(record.at) });
    if (record.checked && out.check?.status !== "checked") return NextResponse.json({ error: "loss", message: "This file can no longer be made exactly as it was." }, { status: 409 });
    return new Response(out.bytes as unknown as BodyInit, { headers: { ...out.headers, "content-disposition": out.headers["content-disposition"].replace(/filename="[^"]*"/, `filename="${record.name.replace(/[^\x20-\x7e]|["\\]/g, "")}"`).replace(/filename\*=UTF-8''[^;]*/, `filename*=UTF-8''${encodeURIComponent(record.name)}`), "x-cv-check": record.checked ? "checked" : "unchecked" } });
  } catch (err) {
    return failure("api/cv/exports/[exportId]/file GET", err, "The file could not be made.");
  }
}
