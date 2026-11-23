import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { getHomepageContentAsync, saveHomepageContentAsync } from "@/lib/site/site-content";

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
    const body = await req.json();
    const updated = await saveHomepageContentAsync(body);
    return NextResponse.json({ success: true, content: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update content" },
      { status: 500 }
    );
  }
}
