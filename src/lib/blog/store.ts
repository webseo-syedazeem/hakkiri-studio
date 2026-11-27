import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { BlogPost } from "./types";
import { SEED_BLOG_POSTS } from "./seed";
import { isMongoConfigured, getMongoDb } from "@/lib/storage/mongodb";
import { calculateReadingTimeMinutes } from "./seo";

function resolveStorageDirectory(): string {
  if (process.env.HAKKIRI_DATA_DIR) {
    return process.env.HAKKIRI_DATA_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "hakkiri-data");
  }
  return path.join(process.cwd(), ".hakkiri-data");
}

/** Placeholder posts that shipped as seeds and were later withdrawn; removed from storage on load. */
export const RETIRED_SEED_IDS = [
  "post-nhs-nursing-band-5-6",
  "post-executive-star-technique",
  "post-presentation-anxiety-boardroom",
  "post-civil-service-success-profiles",
];
const isRetired = (p: BlogPost) => RETIRED_SEED_IDS.includes(p.id);

const DATA_FILE = path.join(resolveStorageDirectory(), "blogs.json");

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Local file-based storage cache */
function loadLocalPosts(): BlogPost[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw) as BlogPost[];
    }
  } catch (err) {
    console.warn("[blog store] local load error:", err);
  }
  return [...SEED_BLOG_POSTS];
}

function saveLocalPosts(posts: BlogPost[]): void {
  try {
    ensureDir(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.warn("[blog store] local save error:", err);
  }
}

let memoryCache: BlogPost[] | null = null;
let initialized = false;

export async function initializeBlogStoreAsync(): Promise<BlogPost[]> {
  if (memoryCache && initialized) {
    return memoryCache;
  }

  // Attempt to load from MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection<BlogPost>("blogs");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await col.deleteMany({ id: { $in: RETIRED_SEED_IDS } } as any);
        const count = await col.countDocuments();
        if (count === 0) {
          // Seed MongoDB with default rich posts
          for (const post of SEED_BLOG_POSTS) {
            await col.replaceOne(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { id: post.id } as any,
              post,
              { upsert: true }
            );
          }
          memoryCache = [...SEED_BLOG_POSTS];
        } else {
          // Check for any missing seed posts and upsert them
          for (const post of SEED_BLOG_POSTS) {
            await col.updateOne(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { id: post.id } as any,
              { $setOnInsert: post },
              { upsert: true }
            );
          }
          const docs = await col.find({}).sort({ publishedAt: -1 }).toArray();
          memoryCache = docs.map((d) => {
            // strip MongoDB _id if present
            const { _id, ...rest } = d as unknown as { _id?: unknown; [key: string]: unknown };
            return rest as unknown as BlogPost;
          });
        }
        initialized = true;
        saveLocalPosts(memoryCache);
        return memoryCache;
      }
    } catch (err) {
      console.warn("[blog store] Mongo load error, falling back to disk:", err);
    }
  }

  // Fallback to local disk storage
  const loaded = loadLocalPosts();
  const local = loaded.filter((p) => !isRetired(p));
  if (local.length !== loaded.length) saveLocalPosts(local);
  if (local.length === 0) {
    saveLocalPosts(SEED_BLOG_POSTS);
    memoryCache = [...SEED_BLOG_POSTS];
  } else {
    // Merge any missing seed posts into existing disk cache
    const existingIds = new Set(local.map((p) => p.id));
    const existingSlugs = new Set(local.map((p) => p.slug.toLowerCase()));
    let hasAdditions = false;
    for (const seedPost of SEED_BLOG_POSTS) {
      if (!existingIds.has(seedPost.id) && !existingSlugs.has(seedPost.slug.toLowerCase())) {
        local.unshift(seedPost);
        hasAdditions = true;
      }
    }
    if (hasAdditions) {
      saveLocalPosts(local);
    }
    memoryCache = local;
  }

  initialized = true;
  return memoryCache;
}

export async function getBlogPostsAsync(options?: {
  publishedOnly?: boolean;
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: BlogPost[]; total: number; categories: string[] }> {
  const all = await initializeBlogStoreAsync();

  // Extract all unique categories
  const categoriesSet = new Set<string>();
  all.forEach((p) => {
    if (p.category) categoriesSet.add(p.category);
  });
  const categories = Array.from(categoriesSet).sort();

  let filtered = [...all];

  if (options?.publishedOnly) {
    filtered = filtered.filter((p) => p.published);
  }

  if (options?.category && options.category.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === options.category?.toLowerCase()
    );
  }

  if (options?.tag) {
    filtered = filtered.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.seo.focusKeyword?.toLowerCase().includes(q)
    );
  }

  // Sort descending by publishedAt (or updatedAt)
  filtered.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.updatedAt).getTime();
    const dateB = new Date(b.publishedAt || b.updatedAt).getTime();
    return dateB - dateA;
  });

  const total = filtered.length;
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 50;
  const paginated = filtered.slice(offset, offset + limit);

  return { posts: paginated, total, categories };
}

export async function getBlogPostBySlugAsync(
  slug: string,
  includeUnpublished = false
): Promise<BlogPost | null> {
  const all = await initializeBlogStoreAsync();
  const normalized = slug.trim().toLowerCase();
  const found = all.find((p) => p.slug.toLowerCase() === normalized);

  if (!found) return null;
  if (!includeUnpublished && !found.published) return null;
  return found;
}

export async function getBlogPostByIdAsync(id: string): Promise<BlogPost | null> {
  const all = await initializeBlogStoreAsync();
  const found = all.find((p) => p.id === id);
  return found || null;
}

export async function saveBlogPostAsync(post: BlogPost): Promise<BlogPost> {
  const all = await initializeBlogStoreAsync();
  const now = new Date().toISOString();

  // Auto-calculate reading time if missing
  const readingTimeMinutes =
    post.readingTimeMinutes || calculateReadingTimeMinutes(post.content || "");

  const updatedPost: BlogPost = {
    ...post,
    readingTimeMinutes,
    updatedAt: now,
    publishedAt: post.publishedAt || now,
  };

  const existingIndex = all.findIndex((p) => p.id === post.id);
  if (existingIndex >= 0) {
    all[existingIndex] = updatedPost;
  } else {
    all.unshift(updatedPost);
  }

  memoryCache = all;
  saveLocalPosts(all);

  // Sync to MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection<BlogPost>("blogs");
        await col.replaceOne(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { id: updatedPost.id } as any,
          updatedPost,
          { upsert: true }
        );
      }
    } catch (err) {
      console.warn("[blog store] Mongo save error:", err);
    }
  }

  return updatedPost;
}

export async function deleteBlogPostAsync(id: string): Promise<boolean> {
  const all = await initializeBlogStoreAsync();
  const initialLength = all.length;
  const filtered = all.filter((p) => p.id !== id);

  if (filtered.length === initialLength) {
    return false;
  }

  memoryCache = filtered;
  saveLocalPosts(filtered);

  // Delete from MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection("blogs");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await col.deleteOne({ id: id as any });
      }
    } catch (err) {
      console.warn("[blog store] Mongo delete error:", err);
    }
  }

  return true;
}
