import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * GET /api/pdf-worker: pdf.js's worker, served from the installed package so
 * reading a PDF works the same in development and in production. The legacy
 * build carries polyfills, so Safari and older Firefox can read PDFs too.
 */
export async function GET() {
  try {
    const file = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs");
    return new Response(await fs.readFile(file), { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=86400" } });
  } catch {
    return new Response("pdf.js worker not installed. Run npm install.", { status: 500 });
  }
}
