import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, makingTooFast, newCvId, notFound, requireUserId } from "@/lib/cv/access";
import { TOO_MANY_CVS, atCvLimit, getOwnCv, saveCv } from "@/lib/cv/store";
import { extractRequirements } from "@/lib/cv/tailor/requirements";

/** "Base name – Employer", within 120 characters. A long base name is the part that gives way, so the job is always named. */
function tailoredName(base: string, job: string): string {
  const tail = ` – ${[...job].slice(0, 60).join("")}`;
  const head = [...base.replace(/ – .*$/, "")].slice(0, 120 - [...tail].length).join("").trimEnd();
  return `${head}${tail}`;
}

const text = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/\s+/g, " ").trim().slice(0, max));
const Body = z.object({ title: text(160).default(""), employer: text(160).default(""), advert: z.string().max(40000).transform((s) => s.replace(/\r/g, "").trim().slice(0, 20000)) }).strict();

/**
 * POST /api/cv/versions/[id]/tailor: a tailored version of a CV for one job.
 * The version is a copy linked to its base: the base is not changed by
 * anything done to the copy. The advert is kept word for word, and what it
 * asks for is read from it by rule, in its own words.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const cv = await getOwnCv((await params).id, userId);
    if (!cv) return notFound();
    const fast = makingTooFast(userId);
    if (fast) return fast;
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return badInput("Those details could not be read.");
    const { title, employer, advert } = parsed.data;
    const fields: Record<string, string> = {};
    if (!title && !employer) fields.title = "Give the job title or the employer, so you can tell this version from the others.";
    if (advert.replace(/\s/g, "").length < 40) fields.advert = "Paste the job advert. It is what this version is tailored to.";
    if (Object.keys(fields).length) return badInput("Add the job this version is for.", fields);
    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
    const now = new Date().toISOString();
    // A version of a version still hangs off the original base.
    const base = cv.kind === "tailored" && cv.parentId ? cv.parentId : cv.id;
    const made = await saveCv({
      ...structuredClone(cv),
      id: newCvId(),
      userId,
      rev: 1,
      lastSaveId: undefined,
      importId: undefined,
      kind: "tailored",
      parentId: base,
      parentRev: cv.rev,
      name: tailoredName(cv.name, employer || title),
      target: { title, employer, advert },
      requirements: extractRequirements(advert),
      changes: [],
      // A cover letter belongs to one job: the new version starts without one.
      letter: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: made.id, name: made.name, requirements: made.requirements.length }, { status: 201 });
  } catch (err) {
    return failure("api/cv/versions/[id]/tailor POST", err, "The tailored version could not be made.");
  }
}
