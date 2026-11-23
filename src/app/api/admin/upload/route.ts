import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { saveUploadedFileAsync, listUploadedMediaAsync } from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function GET() {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const list = await listUploadedMediaAsync();
    return NextResponse.json({ files: list });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to list uploads" },
      { status: 500 }
    );
  }
}

/** What kind of picture a file is, from its first bytes. Null for anything else. */
function sniffImage(b: Buffer): { ext: string; type: string } | null {
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", type: "image/png" };
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b.length >= 6 && (b.subarray(0, 6).toString("latin1") === "GIF87a" || b.subarray(0, 6).toString("latin1") === "GIF89a")) return { ext: "gif", type: "image/gif" };
  if (b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}

export async function POST(req: Request) {
  // Administrators only, decided on the server before anything else happens.
  const denied = await adminDenied();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = file as Blob;
    // Refuse an over-size file before reading it into memory.
    if (blob.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Pictures only, and the kind is read from the file itself, not from its name or what the browser says it is.
    // The stored name gets the extension that matches, so an HTML or script file can never be saved under /uploads.
    const kind = sniffImage(buffer);
    if (!kind) {
      return NextResponse.json({ error: "Only PNG, JPEG, GIF and WebP pictures can be uploaded." }, { status: 400 });
    }
    const given = String((file as { name?: unknown }).name ?? "upload");
    const filename = `${given.replace(/\.[^./\\]*$/, "").slice(0, 80) || "upload"}.${kind.ext}`;
    const contentType = kind.type;

    // Validate size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const uploaded = await saveUploadedFileAsync({
      buffer,
      filename,
      contentType,
    });

    return NextResponse.json({
      success: true,
      url: uploaded.dataUrl,
      filename: uploaded.filename,
      size: uploaded.size,
    });
  } catch (err) {
    console.error("[api/admin/upload] POST error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Upload failed" },
      { status: 500 }
    );
  }
}
