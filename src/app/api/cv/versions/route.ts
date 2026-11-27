import { NextResponse } from "next/server";
import { QuickStartSchema, SetupSchema, badInput, failure, fieldErrors, makingTooFast, newCv, quickCv, requireUserId } from "@/lib/cv/access";
import { TOO_MANY_CVS, atCvLimit, listCvSummaries, saveCv } from "@/lib/cv/store";

/** The person's own CVs, newest first. A new account has none: nothing is made up for them. */
export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json({ cvs: await listCvSummaries(userId) });
  } catch (err) {
    return failure("api/cv/versions GET", err, "Your CVs could not be loaded.");
  }
}

/** Creates an empty CV: from the set-up answers, or with `{ quick: true }` and nothing asked. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const fast = makingTooFast(userId);
    if (fast) return fast;
    const body = await req.json().catch(() => null);
    // A blank page, three questions or the assistant: nothing asked first. The editor says what isn't known yet.
    const quick = QuickStartSchema.safeParse(body);
    const parsed = quick.success ? null : SetupSchema.safeParse(body);
    if (parsed && !parsed.success) return badInput("Check the highlighted answers.", fieldErrors(parsed.error));
    if (await atCvLimit(userId)) return badInput(TOO_MANY_CVS);
    const now = new Date().toISOString();
    const cv = await saveCv(quick.success ? quickCv(userId, quick.data.template, now) : newCv(userId, parsed!.data, now));
    return NextResponse.json({ id: cv.id }, { status: 201 });
  } catch (err) {
    return failure("api/cv/versions POST", err, "The CV could not be created.");
  }
}
