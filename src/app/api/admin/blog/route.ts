import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { getBlogPostsAsync, saveBlogPostAsync } from "@/lib/blog/store";
import { getCurrentUser } from "@/lib/auth/require";
import type { BlogPost } from "@/lib/blog/types";
import { slugify } from "@/lib/blog/seo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const user = await getCurrentUser();
    // Allow studio users or admin access
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getBlogPostsAsync({
      publishedOnly: false, // Return both drafts and published
      category,
      search,
    });

    return NextResponse.json({ ...result, user: user ? { email: user.email } : null });
  } catch (err) {
    console.error("[api/admin/blog] GET error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load posts" },
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

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const title = body.title.trim();
    const slug = (body.slug ? slugify(body.slug) : slugify(title)) || `post-${Date.now()}`;
    const id = body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const post: BlogPost = {
      id,
      slug,
      title,
      excerpt: (body.excerpt || "").trim(),
      content: (body.content || "").trim(),
      category: (body.category || "General").trim(),
      tags: Array.isArray(body.tags) ? body.tags.map((t: string) => t.trim()).filter(Boolean) : [],
      author: {
        name: body.author?.name || "Hakkiri Editorial Team",
        title: body.author?.title || "Career & Interview Specialist",
        avatarUrl: body.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      coverImage: body.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      readingTimeMinutes: body.readingTimeMinutes || 5,
      published: Boolean(body.published),
      publishedAt: body.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {
        metaTitle: (body.seo?.metaTitle || title).trim(),
        metaDescription: (body.seo?.metaDescription || body.excerpt || "").trim(),
        focusKeyword: (body.seo?.focusKeyword || "").trim(),
        secondaryKeywords: Array.isArray(body.seo?.secondaryKeywords) ? body.seo.secondaryKeywords : [],
        canonicalUrl: body.seo?.canonicalUrl || `https://hakkiri.com/blog/${slug}`,
        ogTitle: body.seo?.ogTitle || body.seo?.metaTitle || title,
        ogDescription: body.seo?.ogDescription || body.seo?.metaDescription || body.excerpt || "",
        ogImage: body.seo?.ogImage || body.coverImage || "",
        noIndex: Boolean(body.seo?.noIndex),
      },
    };

    const saved = await saveBlogPostAsync(post);
    return NextResponse.json({ post: saved });
  } catch (err) {
    console.error("[api/admin/blog] POST error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to save post" },
      { status: 500 }
    );
  }
}
