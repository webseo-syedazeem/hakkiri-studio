import { z } from "zod";

/**
 * What an administrator may send when writing a post. Only these fields are
 * taken: a post used to be saved with whatever else the request carried merged
 * into it.
 */
const text = (max: number) => z.string().max(max);
const Seo = z
  .object({
    metaTitle: text(300),
    metaDescription: text(1000),
    focusKeyword: text(200),
    secondaryKeywords: z.array(text(200)).max(40),
    canonicalUrl: text(1000),
    ogTitle: text(300),
    ogDescription: text(1000),
    ogImage: text(2000),
    noIndex: z.boolean(),
  })
  .partial();

export const PostBody = z.object({
  id: text(120).regex(/^[\w-]+$/).optional(),
  title: text(300).optional(),
  slug: text(300).optional(),
  excerpt: text(2000).optional(),
  content: text(600_000).optional(),
  category: text(120).optional(),
  tags: z.array(text(80)).max(40).optional(),
  author: z.object({ name: text(120), title: text(160), avatarUrl: text(2000) }).partial().optional(),
  coverImage: text(2000).optional(),
  readingTimeMinutes: z.number().min(0).max(600).optional(),
  published: z.boolean().optional(),
  publishedAt: text(60).optional(),
  seo: Seo.optional(),
});

/** A post body is at most this many bytes (a long article with its markup is well under it). */
export const POST_MAX_BYTES = 1_000_000;
