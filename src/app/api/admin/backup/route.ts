import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured } from "@/lib/storage/mongodb";
import { getBlogPostsAsync } from "@/lib/blog/store";
import { getHomepageContentAsync } from "@/lib/site/site-content";
import { APPLY_COLLECTIONS } from "@/lib/apply/db";
import { forBackup } from "@/lib/storage/backup";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") !== "false";

    const timestamp = new Date().toISOString();
    const dateSlug = timestamp.split("T")[0];

    // Collections map
    const collectionsData: Record<string, unknown[]> = {};
    let totalDocuments = 0;
    let source = "Local Resilient Disk Cache";

    if (isMongoConfigured()) {
      try {
        const db = await getMongoDb();
        if (db) {
          source = "MongoDB Atlas Cloud Cluster";
          const cols = await db.listCollections().toArray();
          const colNames = Array.from(
            new Set([
              ...cols.map((c) => c.name),
              "blogs",
              "site_content",
              "storage",
              ...Object.values(APPLY_COLLECTIONS),
            ])
          );

          for (const name of colNames) {
            try {
              const docs = (await db.collection(name).find({}).toArray()) as unknown as Record<string, unknown>[];
              // Sessions are left out and password hashes are blanked: see lib/storage/backup.ts.
              const kept = docs.length ? forBackup(name, docs) : null;
              if (kept) {
                collectionsData[name] = kept;
                totalDocuments += kept.length;
              }
            } catch {
              // Ignore single collection error
            }
          }
        }
      } catch (mongoErr) {
        console.warn("[admin-backup] Mongo export warning:", mongoErr);
      }
    }

    // Always ensure blogs and site_content are present if not already captured
    if (!collectionsData["blogs"]) {
      try {
        const { posts } = await getBlogPostsAsync({ publishedOnly: false });
        if (posts && posts.length > 0) {
          collectionsData["blogs"] = posts;
          totalDocuments += posts.length;
        }
      } catch {
        // fallback
      }
    }

    if (!collectionsData["site_content"]) {
      try {
        const content = await getHomepageContentAsync();
        collectionsData["site_content"] = [content];
        totalDocuments += 1;
      } catch {
        // fallback
      }
    }

    const payload = {
      backupVersion: "1.0",
      system: "Hakkiri Studio",
      exportedAt: timestamp,
      source,
      summary: {
        totalCollections: Object.keys(collectionsData).length,
        totalDocuments,
        collectionsExported: Object.keys(collectionsData),
      },
      collections: collectionsData,
    };

    if (!isDownload) {
      return NextResponse.json({
        success: true,
        summary: payload.summary,
        exportedAt: payload.exportedAt,
        source: payload.source,
      });
    }

    const jsonString = JSON.stringify(payload, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="hakkiri-studio-backup-${dateSlug}.json"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[admin-backup] Export error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to generate backup",
      },
      { status: 500 }
    );
  }
}
