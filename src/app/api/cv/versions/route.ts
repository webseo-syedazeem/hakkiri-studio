import { NextResponse } from "next/server";
import { SetupSchema, badInput, failure, fieldErrors, newCv, requireUserId } from "@/lib/cv/access";
import { listCvSummaries, saveCv } from "@/lib/cv/store";

/** The person's own CVs, newest first. A new account has none: nothing is made up for them. */
export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json({ cvs: await listCvSummaries(userId) });
  } catch (err) {
    return failure("api/cv/versions GET", err, "Your CVs could not be loaded.");
  }
}

/** Creates an empty CV from the set-up form. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const parsed = SetupSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return badInput("Check the highlighted answers.", fieldErrors(parsed.error));
    const cv = await saveCv(newCv(userId, parsed.data, new Date().toISOString()));
    return NextResponse.json({ id: cv.id }, { status: 201 });
  } catch (err) {
    return failure("api/cv/versions POST", err, "The CV could not be created.");
  }
}
