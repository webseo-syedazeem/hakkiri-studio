import { NextResponse } from "next/server";
import { getBlogPostsAsync } from "@/lib/blog/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    // Whole numbers within bounds: "limit=1e9" or "offset=-5" is not passed on as it comes.
    const whole = (v: string | null, fallback: number, max: number) => {
      const n = v ? parseInt(v, 10) : fallback;
      return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback;
    };
    const limit = whole(searchParams.get("limit"), 50, 100);
    const offset = whole(searchParams.get("offset"), 0, 10_000);

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
      { error: "Internal Server Error", message: "Failed to load posts" },
      { status: 500 }
    );
  }
}
