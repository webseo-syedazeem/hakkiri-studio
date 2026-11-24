import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { getHomepageContentAsync, saveHomepageContentAsync } from "@/lib/site/site-content";
import { readJsonValue } from "@/lib/http/body";

export const runtime = "nodejs";

export async function GET() {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const content = await getHomepageContentAsync();
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const sent = await readJsonValue(req, 500_000);
    if (!sent.ok) return sent.response;
    const body = sent.json;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Bad Request", message: "The homepage content must be an object." }, { status: 400 });
    }
    const updated = await saveHomepageContentAsync(body as Parameters<typeof saveHomepageContentAsync>[0]);
    return NextResponse.json({ success: true, content: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update content" },
      { status: 500 }
    );
  }
}
