import { NextResponse } from "next/server";
import { saveUploadedFileAsync, listUploadedMediaAsync } from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function GET() {
  try {
    const list = await listUploadedMediaAsync();
    return NextResponse.json({ files: list });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Failed to list uploads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = file as Blob;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = (file as any).name || "upload.png";
    const contentType = blob.type || "image/png";

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
      { error: "Internal Server Error", message: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
