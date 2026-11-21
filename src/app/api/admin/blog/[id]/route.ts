import { NextResponse } from "next/server";
import { getBlogPostByIdAsync, saveBlogPostAsync, deleteBlogPostAsync } from "@/lib/blog/store";
import type { BlogPost } from "@/lib/blog/types";
import { slugify } from "@/lib/blog/seo";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const post = await getBlogPostByIdAsync(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to load post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const existing = await getBlogPostByIdAsync(id);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = (body.title || existing.title).trim();
    const slug = body.slug ? slugify(body.slug) : existing.slug;

    const updated: BlogPost = {
      ...existing,
      ...body,
      id,
      title,
      slug,
      updatedAt: new Date().toISOString(),
      seo: {
        ...existing.seo,
        ...(body.seo || {}),
        canonicalUrl: body.seo?.canonicalUrl || `https://hakkiri.com/blog/${slug}`,
      },
    };

    const saved = await saveBlogPostAsync(updated);
    return NextResponse.json({ post: saved });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const deleted = await deleteBlogPostAsync(id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to delete post" },
      { status: 500 }
    );
  }
}
