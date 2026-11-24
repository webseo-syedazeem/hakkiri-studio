import { NextResponse } from "next/server";
import { getBlogPostBySlugAsync } from "@/lib/blog/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const post = await getBlogPostBySlugAsync(slug, false);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[api/blog/[slug]] GET error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load post" },
      { status: 500 }
    );
  }
}
