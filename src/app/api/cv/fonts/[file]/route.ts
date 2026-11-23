import fs from "node:fs/promises";
import path from "node:path";
import { FONT_FILES } from "@/lib/cv/render/fonts";
import { FONT_DIR } from "@/lib/cv/render/server";

export const runtime = "nodejs";

const ALLOWED = new Set<string>(Object.values(FONT_FILES).map((f) => f.file));

/**
 * GET /api/cv/fonts/[file]: one of the CV fonts, for the paper preview. The
 * preview measures and draws with the very file the PDF embeds, so the two
 * break lines in the same places. Only the listed font files are served.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!ALLOWED.has(file)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(FONT_DIR, file));
    return new Response(new Uint8Array(bytes), { headers: { "content-type": "font/ttf", "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Font not installed.", { status: 500 });
  }
}
