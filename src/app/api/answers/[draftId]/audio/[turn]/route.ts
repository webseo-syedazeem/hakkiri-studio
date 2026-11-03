import { getRecording } from "@/lib/answers/audio";

export const runtime = "nodejs";

/**
 * GET /api/answers/{answerId}/audio/{turn}: a saved recording (turn 0 is the
 * answer, 1 and 2 the follow-up replies). Supports byte ranges so the
 * browser's audio player can seek.
 * (The folder is named [draftId] because a scored answer keeps its draft's id.)
 */
export async function GET(req: Request, { params }: { params: Promise<{ draftId: string; turn: string }> }) {
  const { draftId, turn } = await params;
  const rec = getRecording(draftId, Number(turn));
  if (!rec) return new Response("Not found", { status: 404 });
  const bytes = new Uint8Array(rec.data);
  const headers = { "content-type": rec.type || "audio/webm", "accept-ranges": "bytes", "cache-control": "private, max-age=3600" };
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
    if (start >= bytes.length || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${bytes.length}` } });
    return new Response(bytes.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${bytes.length}`, "content-length": String(end - start + 1) },
    });
  }
  return new Response(bytes, { headers: { ...headers, "content-length": String(bytes.length) } });
}
