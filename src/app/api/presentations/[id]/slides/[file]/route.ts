import { loadSlideImage } from "@/lib/pitch/store";

export const runtime = "nodejs";

const TYPE: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** GET /api/presentations/{id}/slides/{file}: a slide picture saved at set-up. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  if (!/^[\w-]+$/.test(id) || !/^[\w-]+\.(jpg|png|webp)$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  const ext = file.match(/^[\w-]+\.(jpg|png|webp)$/)?.[1];
  const data = ext ? loadSlideImage(id, file) : null;
  if (!data || !ext) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), { headers: { "content-type": TYPE[ext], "cache-control": "private, max-age=86400, immutable" } });
}
