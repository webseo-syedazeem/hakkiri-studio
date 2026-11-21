import { NextResponse } from "next/server";
import { getHomepageContentAsync, saveHomepageContentAsync } from "@/lib/site/site-content";

export const runtime = "nodejs";

export async function GET() {
  try {
    const content = await getHomepageContentAsync();
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await saveHomepageContentAsync(body);
    return NextResponse.json({ success: true, content: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to update content" },
      { status: 500 }
    );
  }
}
