import { NextResponse } from "next/server";
import { z } from "zod";
import { badInput, failure, requireUserId } from "@/lib/cv/access";
import { DesignSchema, STYLE_KEYS, newId } from "@/lib/cv/schema";
import { MAX_STYLES, listOwnStyles, saveStyle } from "@/lib/cv/store";

export const runtime = "nodejs";

const Body = z.object({ name: z.string().trim().min(1, "Give the style a name.").max(60), design: DesignSchema }).strict();

/** GET /api/cv/styles: the looks this person has saved, to use again on any CV. */
export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json({ styles: await listOwnStyles(userId) });
  } catch (err) {
    return failure("api/cv/styles GET", err, "Your saved styles couldn’t be loaded.");
  }
}

/** POST /api/cv/styles: saves a CV's look (its template and every change to it) under a name. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success) return badInput(body.error.issues[0]?.message ?? "That style couldn’t be read.", { name: body.error.issues.find((i) => i.path[0] === "name")?.message ?? "" });
    if ((await listOwnStyles(userId)).length >= MAX_STYLES) return badInput(`You can keep up to ${MAX_STYLES} styles. Delete one you no longer use first.`);
    // Only the look is kept: the page size, page target, order and file name belong to the CV it came from.
    const design = Object.fromEntries(STYLE_KEYS.filter((k) => body.data.design[k] !== undefined).map((k) => [k, body.data.design[k]]));
    const style = await saveStyle({ id: newId("sty_"), userId, name: body.data.name, design: design as never, createdAt: new Date().toISOString() });
    return NextResponse.json({ style }, { status: 201 });
  } catch (err) {
    return failure("api/cv/styles POST", err, "The style couldn’t be saved.");
  }
}
