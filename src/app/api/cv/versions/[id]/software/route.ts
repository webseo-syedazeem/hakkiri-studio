import { NextResponse } from "next/server";
import { failure, notFound, requireUserId } from "@/lib/cv/access";
import { softwareView } from "@/lib/cv/render/software";
import { cvIsEmpty } from "@/lib/cv/schema";
import { getOwnCv, noteFileChecks } from "@/lib/cv/store";
import { guard } from "@/lib/usage/limits";

export const runtime = "nodejs";

/**
 * GET /api/cv/versions/[id]/software?format=pdf|docx: the Software view.
 * Makes the real file, reads it back, and returns what was read beside what
 * the CV says: every line, and the fields a parser sorts them into.
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
    if (cvIsEmpty(cv)) return NextResponse.json({ error: "empty", message: "Create a file to see what it contains. Add your details first." }, { status: 409 });
    const view = await softwareView(cv, format);
    // The file was made and read back here too: that result is kept like any other check of this revision.
    await noteFileChecks(cv, { [format]: { status: view.status, made: view.status === "failed" ? true : undefined, name: view.name, pages: view.pages, missing: view.missing, unexpected: view.unexpected, unsupported: view.unsupported } });
    return NextResponse.json(view);
  } catch (err) {
    return failure("api/cv/versions/[id]/software GET", err, "The file could not be made and read.");
  }
}
