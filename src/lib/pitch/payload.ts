import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { saveSlideImage } from "./store";
import type { Presentation, Slide } from "./types";

/**
 * The set-up form's payload (design screen 11), checked on the server.
 * Slide pictures come as separate files in the same form; a slide that
 * keeps its existing picture names the stored file instead.
 */

const SlideIn = z.object({
  title: z.string().max(200),
  lines: z.array(z.string().max(400)).max(30),
  notes: z.string().max(4000).optional(),
  layout: z.enum(["title", "bullets", "stat", "quote", "cards", "chart", "timeline", "ask"]).optional(),
  plannedSec: z.number().int().min(5).max(1800),
  point: z.string().max(200),
  image: z
    .union([
      z.object({ kind: z.enum(["page", "picture"]), field: z.string().regex(/^img-\d+$/) }),
      z.object({ kind: z.enum(["page", "picture"]), file: z.string().regex(/^[\w-]+\.(jpg|png|webp)$/) }),
    ])
    .nullable()
    .optional(),
});

export const PresentationIn = z.object({
  title: z.string().trim().min(1).max(120),
  audience: z.enum(["investors", "leadership", "client", "team", "conference"]),
  ask: z.string().trim().max(240),
  date: z.iso.datetime(),
  timeLimitSec: z.number().int().min(60).max(5400),
  qaStyle: z.enum(["curious", "sceptical", "time-pressed", "technical"]).nullable(),
  source: z.object({ kind: z.enum(["pdf", "pptx", "notes", "demo"]), fileName: z.string().max(200).optional() }),
  slides: z.array(SlideIn).min(1).max(80),
  askSlide: z.number().int().min(1),
  warnings: z.array(z.string().max(240)).max(3),
  planBy: z.enum(["model", "estimate", "you"]),
});

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Reads the multipart form into a presentation: checks the fields, saves
 * new slide pictures, and keeps existing ones (on edit). Returns a message
 * on anything it can't accept.
 */
export async function presentationFromForm(form: FormData, id: string, existing?: Presentation): Promise<Presentation | { message: string }> {
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return { message: "That presentation couldn’t be read. Try again." };
  }
  const parsed = PresentationIn.safeParse(raw);
  if (!parsed.success) return { message: "Some of the set-up is missing or too long. Check each field and try again." };
  const d = parsed.data;
  if (d.askSlide > d.slides.length) d.askSlide = d.slides.length;

  const keep = new Set((existing?.slides ?? []).flatMap((s) => (s.image ? [s.image.file] : [])));
  const slides: Slide[] = [];
  for (const [i, s] of d.slides.entries()) {
    let image: Slide["image"] = null;
    if (s.image && "field" in s.image) {
      const file = form.get(s.image.field);
      if (!(file instanceof Blob) || !EXT[file.type] || file.size > MAX_IMAGE_BYTES) return { message: `Slide ${i + 1}’s picture couldn’t be used. Try a smaller file.` };
      const name = `${randomUUID().slice(0, 8)}-${i + 1}.${EXT[file.type]}`;
      saveSlideImage(id, name, await file.arrayBuffer());
      image = { kind: s.image.kind, file: name };
    } else if (s.image && "file" in s.image && keep.has(s.image.file)) {
      image = { kind: s.image.kind, file: s.image.file };
    }
    slides.push({ n: i + 1, title: s.title, lines: s.lines, ...(s.notes ? { notes: s.notes } : {}), ...(s.layout ? { layout: s.layout } : {}), image, plannedSec: s.plannedSec, point: s.point });
  }
  return {
    id,
    title: d.title,
    audience: d.audience,
    ask: d.ask,
    date: d.date,
    timeLimitSec: d.timeLimitSec,
    qaStyle: d.qaStyle,
    source: d.source,
    slides,
    askSlide: d.askSlide,
    warnings: d.warnings,
    planBy: d.planBy,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}
