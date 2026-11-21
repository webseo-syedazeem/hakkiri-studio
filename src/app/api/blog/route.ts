import { NextResponse } from "next/server";
import { getBlogPostsAsync } from "@/lib/blog/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await getBlogPostsAsync({
      publishedOnly: true,
      category,
      tag,
      search,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/blog] GET error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to load posts" },
      { status: 500 }
    );
  }
}
