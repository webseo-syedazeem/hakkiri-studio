"use client";

import type { SlideLayout } from "@/lib/pitch/types";

/**
 * Reading slides in the browser (design screen 11: "Hakkiri reads your
 * slides"). Nothing is uploaded until you start, and nothing here needs a key.
 * - PDF: each page as a picture, plus its text (pdf.js).
 * - PowerPoint: each slide's title, text, speaker notes and first picture.
 * - Notes: your own words, split into sections.
 */

export interface ParsedSlide {
  title: string;
  lines: string[];
  notes?: string;
  layout?: SlideLayout;
  image?: { kind: "page" | "picture"; blob: Blob; url: string } | null;
}

export const MAX_SLIDES = 80;

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const cap = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** A picture made smaller (and white behind any transparency), as a JPEG. */
async function toJpeg(source: CanvasImageSource & { width: number; height: number }, maxWidth: number): Promise<Blob> {
  const scale = Math.min(1, maxWidth / source.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn’t make a picture"))), "image/jpeg", 0.85));
}

// ---------------------------------------------------------------------- PDF

interface PdfTextItem {
  str: string;
  transform: number[];
  height: number;
}

/** Groups a page's text into lines, top to bottom, and picks the biggest text near the top as the title. */
function pageText(items: PdfTextItem[]): { title: string; lines: string[] } {
  const rows = new Map<number, { x: number; str: string; size: number }[]>();
  for (const it of items) {
    if (!it.str.trim()) continue;
    const y = Math.round(it.transform[5] / 3) * 3;
    const size = it.height || Math.hypot(it.transform[0], it.transform[1]);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)!.push({ x: it.transform[4], str: it.str, size });
  }
  const lines = [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => ({ text: clean(parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(" ")), size: Math.max(...parts.map((p) => p.size)) }))
    .filter((l) => l.text);
  if (!lines.length) return { title: "", lines: [] };
  const top = lines.slice(0, 4);
  const biggest = top.reduce((a, b) => (b.size > a.size ? b : a), top[0]);
  const title = biggest.text;
  return { title: cap(title, 160), lines: lines.filter((l) => l !== biggest).map((l) => cap(l.text, 380)).slice(0, 30) };
}

export async function parsePdf(file: File, onProgress?: (done: number, total: number) => void): Promise<ParsedSlide[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/api/pdf-worker";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (doc.numPages > MAX_SLIDES) throw new Error(`That file has ${doc.numPages} pages. Hakkiri can rehearse up to ${MAX_SLIDES} slides.`);
  const out: ParsedSlide[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1600 / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, viewport }).promise;
    const blob = await toJpeg(canvas, 1600);
    const text = await page.getTextContent();
    const { title, lines } = pageText(text.items.flatMap((x) => ("str" in x ? [{ str: x.str, transform: x.transform as number[], height: x.height }] : [])));
    out.push({ title: title || `Slide ${i}`, lines, image: { kind: "page", blob, url: URL.createObjectURL(blob) } });
    onProgress?.(i, doc.numPages);
  }
  return out;
}

// --------------------------------------------------------------- PowerPoint

const xml = (s: string) => new DOMParser().parseFromString(s, "application/xml");
const textOf = (el: Element) => clean([...el.getElementsByTagName("a:t")].map((t) => t.textContent ?? "").join(""));
const paragraphs = (el: Element) => [...el.getElementsByTagName("a:p")].map(textOf).filter(Boolean);

function resolve(base: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1);
  const parts = base.split("/").slice(0, -1);
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

function relsOf(doc: Document): Map<string, { type: string; target: string }> {
  return new Map([...doc.getElementsByTagName("Relationship")].map((r) => [r.getAttribute("Id") ?? "", { type: r.getAttribute("Type") ?? "", target: r.getAttribute("Target") ?? "" }]));
}

export async function parsePptx(file: File, onProgress?: (done: number, total: number) => void): Promise<ParsedSlide[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const read = async (path: string) => (await zip.file(path)?.async("text")) ?? null;
  const pres = await read("ppt/presentation.xml");
  const presRels = await read("ppt/_rels/presentation.xml.rels");
  if (!pres || !presRels) throw new Error("That doesn’t look like a PowerPoint file. Try saving it as .pptx or PDF.");
  const rels = relsOf(xml(presRels));
  const order = [...xml(pres).getElementsByTagName("p:sldId")].map((s) => rels.get(s.getAttribute("r:id") ?? "")?.target).filter((t): t is string => Boolean(t));
  if (order.length > MAX_SLIDES) throw new Error(`That deck has ${order.length} slides. Hakkiri can rehearse up to ${MAX_SLIDES}.`);

  const out: ParsedSlide[] = [];
  for (const [i, target] of order.entries()) {
    const path = resolve("ppt/presentation.xml", target);
    const body = await read(path);
    if (!body) continue;
    const doc = xml(body);
    let title = "";
    const lines: string[] = [];
    for (const sp of [...doc.getElementsByTagName("p:sp")]) {
      const type = sp.getElementsByTagName("p:ph")[0]?.getAttribute("type") ?? "";
      const ps = paragraphs(sp);
      if (!ps.length || type === "sldNum" || type === "dt" || type === "ftr") continue;
      if ((type === "title" || type === "ctrTitle") && !title) title = ps.join(" ");
      else lines.push(...ps);
    }
    for (const tbl of [...doc.getElementsByTagName("a:tbl")]) {
      for (const tr of [...tbl.getElementsByTagName("a:tr")]) {
        const row = [...tr.getElementsByTagName("a:tc")].map(textOf).filter(Boolean).join(" | ");
        if (row) lines.push(row);
      }
    }
    if (!title && lines.length) title = lines.shift()!;

    // Speaker notes and the first picture, from the slide's relationships.
    let notes: string | undefined;
    let image: ParsedSlide["image"] = null;
    const relPath = path.replace(/slides\/(slide\d+\.xml)$/, "slides/_rels/$1.rels");
    const slideRelsXml = await read(relPath);
    if (slideRelsXml) {
      const slideRels = relsOf(xml(slideRelsXml));
      const notesRel = [...slideRels.values()].find((r) => r.type.endsWith("/notesSlide"));
      if (notesRel) {
        const notesXml = await read(resolve(path, notesRel.target));
        if (notesXml) {
          const nd = xml(notesXml);
          const bodySp = [...nd.getElementsByTagName("p:sp")].find((sp) => sp.getElementsByTagName("p:ph")[0]?.getAttribute("type") === "body");
          const text = bodySp ? paragraphs(bodySp).join("\n") : "";
          if (text) notes = text.slice(0, 3900);
        }
      }
      const embed = doc.getElementsByTagName("p:pic")[0]?.getElementsByTagName("a:blip")[0]?.getAttribute("r:embed");
      const picRel = embed ? slideRels.get(embed) : undefined;
      if (picRel && /\.(png|jpe?g|gif|bmp|webp)$/i.test(picRel.target)) {
        const data = await zip.file(resolve(path, picRel.target))?.async("blob");
        if (data) {
          try {
            const bitmap = await createImageBitmap(data);
            const blob = await toJpeg(bitmap, 1200);
            image = { kind: "picture", blob, url: URL.createObjectURL(blob) };
          } catch {
            image = null; // a picture the browser can't read: leave it out
          }
        }
      }
    }
    const short = lines.join(" ").length < 90 && lines.length <= 2;
    out.push({
      title: cap(title || `Slide ${i + 1}`, 160),
      lines: lines.map((l) => cap(l, 380)).slice(0, 30),
      notes,
      layout: i === 0 && short && !image ? "title" : "bullets",
      image,
    });
    onProgress?.(i + 1, order.length);
  }
  if (!out.length) throw new Error("No slides were found in that file.");
  return out;
}

// -------------------------------------------------------------------- notes

/**
 * Your notes as slides: a blank line or a heading ("# Opening", "1. Opening")
 * starts a new section; its first line is the section's title.
 */
export function parseNotes(text: string): ParsedSlide[] {
  const rawLines = text.replace(/\r/g, "").split("\n");
  const sections: string[][] = [];
  let current: string[] = [];
  const heading = /^\s*(#{1,3}\s+|\d+[.)]\s+|slide\s+\d+[:.]?\s*)/i;
  for (const line of rawLines) {
    if (!line.trim()) {
      if (current.length) sections.push(current);
      current = [];
      continue;
    }
    if (heading.test(line) && current.length) {
      sections.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length) sections.push(current);
  return sections.slice(0, MAX_SLIDES).map((sec, i) => {
    const [first, ...rest] = sec.map((l) => clean(l.replace(heading, "").replace(/^[-•*]\s+/, "")));
    const long = rest.length === 0 && first.length > 90;
    return {
      title: cap(long ? `Part ${i + 1}` : first, 160),
      lines: (long ? [first] : rest).filter(Boolean).map((l) => cap(l, 380)).slice(0, 30),
      layout: "bullets" as const,
      image: null,
    };
  });
}

/** A name for the presentation from the file or the first slide. */
export function suggestTitle(fileName: string | null, slides: ParsedSlide[]): string {
  const first = slides[0]?.title?.trim();
  if (first && first.length <= 60 && !/^slide \d+$/i.test(first)) return first;
  if (fileName) return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 80);
  return "My presentation";
}
