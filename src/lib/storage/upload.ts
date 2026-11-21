import fs from "node:fs";
import path from "node:path";
import { isMongoConfigured, saveToMongo, loadFromMongo } from "./mongodb";

export interface UploadedMedia {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Saves uploaded file from PC to public/uploads and mirrors to MongoDB Atlas for cloud persistence.
 */
export async function saveUploadedFileAsync(params: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}): Promise<UploadedMedia> {
  const { buffer, filename, contentType } = params;
  const ext = path.extname(filename) || ".png";
  const baseName = path.basename(filename, ext).replace(/[^\w-]/g, "_").toLowerCase();
  const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanFilename = `${baseName}-${Date.now()}${ext}`;

  // 1. Save to public/uploads directory if accessible
  try {
    ensureUploadsDir();
    const filePath = path.join(PUBLIC_UPLOADS_DIR, cleanFilename);
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.warn("[upload] Local disk write error:", err);
  }

  // 2. Format data URL for high-res fallback
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;
  const staticUrl = `/uploads/${cleanFilename}`;

  const mediaRecord: UploadedMedia = {
    id,
    filename: cleanFilename,
    contentType,
    size: buffer.length,
    dataUrl: buffer.length < 500000 ? dataUrl : staticUrl, // Keep small files in memory for fast preview
    createdAt: new Date().toISOString(),
  };

  // 3. Mirror to MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      await saveToMongo("media_uploads", id, mediaRecord);
    } catch (err) {
      console.warn("[upload] MongoDB save error:", err);
    }
  }

  return mediaRecord;
}

export async function listUploadedMediaAsync(): Promise<UploadedMedia[]> {
  const list: UploadedMedia[] = [];

  // 1. Read from public/uploads
  try {
    ensureUploadsDir();
    const files = fs.readdirSync(PUBLIC_UPLOADS_DIR);
    for (const f of files) {
      if (f.startsWith(".")) continue;
      const stat = fs.statSync(path.join(PUBLIC_UPLOADS_DIR, f));
      list.push({
        id: `file-${f}`,
        filename: f,
        contentType: f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") || f.endsWith(".jpeg") ? "image/jpeg" : "image/webp",
        size: stat.size,
        dataUrl: `/uploads/${f}`,
        createdAt: stat.birthtime.toISOString(),
      });
    }
  } catch {
    // ignore
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}
