import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { isMongoConfigured, getMongoDb } from "@/lib/storage/mongodb";

export interface HomepageContent {
  badgeText: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  subtext: string;
  heroImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  announcementActive: boolean;
  announcementText: string;
  updatedAt: string;
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  badgeText: "Beta · Free for everyone, for a limited time",
  headline: "AI interview practice for the interview you actually have.",
  subheadline:
    "Hakkiri is a free AI mock interview platform. Add the job description and your CV or resume, and a live AI interviewer asks questions out loud, follows up on what you say, and shows you exactly what to fix.",
  primaryCtaText: "Sign up free",
  primaryCtaLink: "/signup",
  secondaryCtaText: "See how it works",
  secondaryCtaLink: "#how",
  subtext: "Free for a limited time. No card. Takes about two minutes.",
  heroImageUrl: "/landing/interview-live.webp",
  metaTitle: "Free AI Interview Practice From Your Job Description | Hakkiri",
  metaDescription:
    "Free AI mock interview practice built from your job description and CV. A live AI interviewer asks out loud, follows up and scores every answer.",
  announcementActive: false,
  announcementText: "",
  updatedAt: "2026-11-23T00:00:00.000Z",
};

function resolveStorageDirectory(): string {
  if (process.env.HAKKIRI_DATA_DIR) {
    return process.env.HAKKIRI_DATA_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "hakkiri-data");
  }
  return path.join(process.cwd(), ".hakkiri-data");
}

const DATA_FILE = path.join(resolveStorageDirectory(), "site-content.json");

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let cachedContent: HomepageContent | null = null;

export async function getHomepageContentAsync(): Promise<HomepageContent> {
  if (cachedContent) return cachedContent;

  // 1. Try loading from MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection<{ _id: string; content: HomepageContent }>("site_content");
        const doc = await col.findOne({ _id: "homepage" as any });
        if (doc && doc.content) {
          cachedContent = doc.content;
          return cachedContent;
        }
      }
    } catch (err) {
      console.warn("[site-content] MongoDB load error, checking local file:", err);
    }
  }

  // 2. Try loading from local disk cache
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      cachedContent = JSON.parse(raw);
      return cachedContent!;
    }
  } catch {
    // fallback
  }

  cachedContent = { ...DEFAULT_HOMEPAGE_CONTENT };
  return cachedContent;
}

export async function saveHomepageContentAsync(
  newContent: Partial<HomepageContent>
): Promise<HomepageContent> {
  const current = await getHomepageContentAsync();
  const updated: HomepageContent = {
    ...current,
    ...newContent,
    updatedAt: new Date().toISOString(),
  };

  cachedContent = updated;

  // Save to local disk
  try {
    ensureDir(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("[site-content] Disk write error:", err);
  }

  // Save to MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection("site_content");
        await col.replaceOne(
          { _id: "homepage" as any },
          { _id: "homepage" as any, content: updated },
          { upsert: true }
        );
      }
    } catch (err) {
      console.warn("[site-content] MongoDB save error:", err);
    }
  }

  return updated;
}
