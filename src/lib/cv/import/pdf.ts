import { ImportError } from "./errors";
import { type DocLine, cleanText, makeLine, splitBullet, splitNumbered } from "./lines";

/**
 * Reads the text of a PDF with its layout: which words share a line, where a
 * line has a wide gap (a title on the left, dates on the right), which lines
 * are bold or larger, where bullets start, and whether the page has two
 * columns. Nothing is recognised here; the lines go on to the CV reader.
 */

const MAX_PAGES = 12;

interface Item {
  str: string;
  x: number;
  y: number;
  w: number;
  size: number;
  bold: boolean;
}
interface Seg {
  x0: number;
  x1: number;
  text: string;
  size: number;
  bold: boolean;
}
interface Row {
  y: number;
  size: number;
  segs: Seg[];
}
/** A line on the page before wrapped lines are joined. */
interface Raw {
  text: string;
  x: number;
  /** Where the words start, after any bullet mark. */
  textX: number;
  right: number;
  /** Where the last piece of the line starts: the cell that wraps, in a table row. */
  lastX: number;
  y: number;
  size: number;
  bold: boolean;
  bullet: boolean;
  page: number;
  col: number;
  links: string[];
  top: number;
}

const BOLD_FONT = /bold|black|heavy|semibold|demi|extrab/i;
const round = (n: number, to = 0.5) => Math.round(n / to) * to;

/** Words on the same baseline become one row; a wide gap inside a row starts a new segment. */
function toRows(items: Item[]): Row[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: Item[][] = [];
  for (const it of sorted) {
    const last = groups[groups.length - 1];
    if (last && Math.abs(last[0].y - it.y) <= Math.max(1.5, 0.35 * Math.min(last[0].size, it.size))) last.push(it);
    else groups.push([it]);
  }
  return groups.map((g) => {
    g.sort((a, b) => a.x - b.x);
    const segs: Seg[] = [];
    let prev: Item | null = null;
    for (const it of g) {
      // The same words drawn twice a hair apart (imitation bold): keep one.
      if (prev && prev.str === it.str && Math.abs(prev.x - it.x) < 1) continue;
      const seg = segs[segs.length - 1];
      const gap = seg ? it.x - seg.x1 : 0;
      if (!seg || gap > Math.max(14, 1.5 * it.size)) {
        segs.push({ x0: it.x, x1: it.x + it.w, text: it.str, size: it.size, bold: it.bold });
      } else {
        const space = gap > 0.17 * it.size && !/\s$/.test(seg.text) && !/^\s/.test(it.str) ? " " : "";
        seg.text += space + it.str;
        seg.x1 = Math.max(seg.x1, it.x + it.w);
        seg.bold &&= it.bold || !it.str.trim();
        if (it.str.trim().length > seg.text.length / 2) seg.size = it.size;
      }
      prev = it;
    }
    const sizes = segs.map((s) => s.size);
    return { y: g[0].y, size: Math.max(...sizes), segs: segs.filter((s) => s.text.trim()) };
  }).filter((r) => r.segs.length);
}

/**
 * Finds the gap between two columns, if the page has them: a vertical strip
 * that almost no line crosses, with plenty of lines on both sides. A column of
 * nothing but dates (beside the roles they belong to) is not a column of its
 * own: those rows are read across.
 */
function findGutter(rows: Row[], isDates: (s: string) => boolean): number | null {
  if (rows.length < 16) return null;
  const minX = Math.min(...rows.map((r) => r.segs[0].x0));
  const maxX = Math.max(...rows.map((r) => r.segs[r.segs.length - 1].x1));
  const width = maxX - minX;
  if (width < 200) return null;
  const BIN = 2;
  const bins = Math.ceil(width / BIN) + 1;
  const cover = new Array<number>(bins).fill(0);
  for (const r of rows) {
    const seen = new Set<number>();
    for (const s of r.segs) for (let b = Math.floor((s.x0 - minX) / BIN); b <= Math.floor((s.x1 - minX) / BIN); b++) seen.add(b);
    for (const b of seen) cover[b]++;
  }
  const tolerance = Math.max(1, Math.floor(rows.length * 0.06));
  let best: { from: number; to: number } | null = null;
  let run: number | null = null;
  for (let b = 0; b <= bins; b++) {
    const open = b < bins && cover[b] <= tolerance;
    if (open && run === null) run = b;
    if (!open && run !== null) {
      const from = minX + run * BIN;
      const to = minX + b * BIN;
      if (to - from >= 9 && from > minX + 0.15 * width && to < maxX - 0.15 * width && (!best || to - from > best.to - best.from)) best = { from, to };
      run = null;
    }
  }
  if (!best) return null;
  const x = (best.from + best.to) / 2;
  const left = rows.flatMap((r) => r.segs.filter((s) => s.x1 <= x));
  const right = rows.flatMap((r) => r.segs.filter((s) => s.x0 >= x));
  const rowsLeft = rows.filter((r) => r.segs.some((s) => s.x1 <= x)).length;
  const rowsRight = rows.filter((r) => r.segs.some((s) => s.x0 >= x)).length;
  if (rowsLeft < 8 || rowsRight < 8) return null;
  const mostlyDates = (segs: Seg[]) => segs.filter((s) => isDates(s.text)).length >= 0.6 * segs.length;
  if (mostlyDates(left) || mostlyDates(right)) return null;
  return x;
}

function rowToRaw(segs: Seg[], y: number, page: number, col: number, top: number): Raw | null {
  if (!segs.length) return null;
  let parts = segs.map((s) => cleanText(s.text));
  let bullet = false;
  let textX = segs[0].x0;
  // A bullet mark may be a piece of its own, or the start of the first piece.
  const first = splitBullet(parts[0]);
  if (first.bullet) {
    bullet = true;
    if (first.text) {
      parts[0] = first.text;
      textX = segs[0].x0 + (segs[0].x1 - segs[0].x0) * (1 - first.text.length / Math.max(1, parts[0].length + 2));
    } else {
      parts = parts.slice(1);
      textX = segs[1]?.x0 ?? textX;
    }
  } else {
    const numbered = splitNumbered(parts[0]);
    if (numbered.bullet) {
      bullet = true;
      parts[0] = numbered.text;
    }
  }
  const text = parts.filter(Boolean).join("\t");
  if (!text) return null;
  const longest = [...segs].sort((a, b) => b.text.length - a.text.length)[0];
  return { text, x: segs[0].x0, textX, right: segs[segs.length - 1].x1, lastX: segs[segs.length - 1].x0, y, size: round(longest.size), bold: segs.every((s) => s.bold), bullet, page, col, links: [], top };
}

/** Joins lines that are one paragraph or one bullet wrapped across the page. */
function joinWrapped(lines: Raw[]): Raw[] {
  const edges = new Map<string, { left: number; right: number; full: boolean }>();
  for (const l of lines) {
    const k = `${l.page}:${l.col}`;
    const e = edges.get(k) ?? { left: Infinity, right: 0, full: false };
    edges.set(k, { left: Math.min(e.left, l.x), right: Math.max(e.right, l.right), full: false });
  }
  // The right-hand edge is only known where several lines run up to it. In a column of short items
  // (a side column of skills), the longest item is not a margin.
  for (const [k, e] of edges) {
    const reach = lines.filter((l) => `${l.page}:${l.col}` === k && l.right >= e.right - 0.04 * (e.right - e.left)).length;
    e.full = reach >= 3;
  }
  const out: Raw[] = [];
  for (const b of lines) {
    const a = out[out.length - 1];
    const e = a ? edges.get(`${a.page}:${a.col}`) : undefined;
    if (a && e && continues(a, b, e)) {
      a.text += (/-$/.test(a.text) && /^[a-z]/.test(b.text) ? "" : " ") + b.text;
      a.right = b.right;
      a.y = b.y;
      a.links.push(...b.links);
    } else out.push({ ...b, links: [...b.links] });
  }
  return out;
}

const CARRIES_ON = /(?:[,;:–-]|\b(?:and|or|the|of|to|for|with|in|a|an|by|from|that|which|at|on|as|into|across|per))$/i;

function continues(a: Raw, b: Raw, edge: { left: number; right: number; full: boolean }): boolean {
  if (b.bullet || a.page !== b.page || a.col !== b.col) return false;
  if (b.text.includes("\t")) return false;
  // A row of cells ("2013 – 2017 | BA…"): only its last cell can wrap, and the next line must sit under that cell.
  const cells = a.text.includes("\t");
  if (cells && Math.abs(b.x - a.lastX) > 3) return false;
  // An email or web address on a line of its own is complete, unless the address itself broke mid-way.
  const single = !/\s/.test(a.text.trim());
  if (single && /@/.test(a.text)) return false;
  if (single && /\/|\.\w{2,}$/.test(a.text) && !/[-/_.]$/.test(a.text) && !/^\(/.test(b.text)) return false;
  if (Math.abs(a.size - b.size) > 0.6 || (a.bold !== b.bold && !cells)) return false;
  const drop = a.y - b.y;
  if (drop <= 0 || drop > 1.75 * a.size) return false;
  const aligned = cells || Math.abs(b.x - a.textX) <= 3 || Math.abs(b.x - a.x) <= 3 || (a.bullet && b.x >= a.x - 1 && b.x <= a.x + 3.2 * a.size);
  if (!aligned) return false;
  // Under a typed bullet mark, a line with no mark that starts where the bullet's words start carries the bullet on.
  if (a.bullet && b.x > a.x + 4 && b.x <= a.x + 3.2 * a.size) return true;
  // Would the next line's first word have fitted on this one? If so, the break was deliberate.
  const firstWord = b.text.split(/\s+/)[0] ?? "";
  const perChar = (b.right - b.x) / Math.max(1, b.text.length);
  const needed = firstWord.length * perChar + 0.3 * a.size;
  if (a.right + needed <= edge.right - 2) return false;
  // Where the margin is a guess, join only what plainly reads on: a lower-case start, or a line left hanging.
  if (!edge.full && !/^[a-zà-ÿ(]/.test(b.text) && !CARRIES_ON.test(a.text)) return false;
  // An indented line that ends a sentence, followed by a capital: a list whose bullet marks are drawn, not typed.
  if (!a.bullet && a.x - edge.left > 6 && /[.!?;]$/.test(a.text) && /^[A-Z]/.test(b.text)) return false;
  return true;
}

/**
 * Some PDFs draw their bullet marks as shapes, so no mark is in the text. If
 * the file has no typed bullet marks at all, lines set in from the left edge
 * of their column are taken as its bullets.
 */
function markIndentedBullets(lines: Raw[]) {
  if (lines.some((l) => l.bullet)) return;
  const byCol = new Map<string, Raw[]>();
  for (const l of lines) {
    const k = `${l.page}:${l.col}`;
    if (!byCol.has(k)) byCol.set(k, []);
    byCol.get(k)!.push(l);
  }
  for (const group of byCol.values()) {
    const counts = new Map<number, number>();
    for (const l of group) counts.set(Math.round(l.x), (counts.get(Math.round(l.x)) ?? 0) + 1);
    const base = Math.min(...[...counts.entries()].filter(([, n]) => n >= 2).map(([x]) => x), ...group.map((l) => Math.round(l.x)));
    const indented = group.filter((l) => l.x - base >= 8 && l.x - base <= 72 && !l.text.includes("\t"));
    if (indented.length >= 3) for (const l of indented) l.bullet = true;
  }
}

const PAGE_NUMBER = /^(?:page\s*)?\d{1,2}(?:\s*(?:of|\/)\s*\d{1,2})?$/i;

/** Drops running headers and footers: page numbers, and lines repeated at the top or bottom of several pages. */
function dropFurniture(lines: Raw[], pages: number): Raw[] {
  const key = (t: string) => t.toLowerCase().replace(/\d+/g, "#").trim();
  const edge = lines.filter((l) => l.top < 0.07 || l.top > 0.93);
  const seen = new Map<string, Set<number>>();
  for (const l of edge) {
    const k = key(l.text);
    if (!seen.has(k)) seen.set(k, new Set());
    seen.get(k)!.add(l.page);
  }
  return lines.filter((l) => {
    const atEdge = l.top < 0.07 || l.top > 0.93;
    if (!atEdge) return true;
    if (PAGE_NUMBER.test(l.text)) return false;
    return !(pages > 1 && (seen.get(key(l.text))?.size ?? 0) > 1);
  });
}

export interface ExtractedFile {
  lines: DocLine[];
  pages: number;
}

/** Reads a PDF into lines. Throws an ImportError with a plain reason when the file cannot be read. */
export async function extractPdf(bytes: Uint8Array, isDates: (s: string) => boolean): Promise<ExtractedFile> {
  // The legacy build runs on the server without a browser.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), verbosity: 0, fontExtraProperties: true, useSystemFonts: false });
  let doc: Awaited<typeof task.promise>;
  try {
    doc = await task.promise;
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";
    if (name === "PasswordException") throw new ImportError("password", "The PDF is password-protected.");
    throw new ImportError("unreadable", "The PDF could not be opened.");
  }
  try {
    if (doc.numPages > MAX_PAGES) throw new ImportError("too-long", `The PDF has ${doc.numPages} pages.`);
    const raw: Raw[][] = [[], []];
    let chars = 0;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const view = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      // Font names say which text is bold; they are only loaded once the page has been walked.
      const fontBold = new Map<string, boolean>();
      try {
        await page.getOperatorList();
      } catch {
        /* the text is still readable without font names */
      }
      const isBold = (font: string) => {
        if (!fontBold.has(font)) {
          let name = "";
          try {
            name = (page.commonObjs.get(font) as { name?: string } | undefined)?.name ?? "";
          } catch {
            /* not loaded */
          }
          fontBold.set(font, BOLD_FONT.test(name));
        }
        return fontBold.get(font)!;
      };
      const items: Item[] = [];
      for (const it of content.items) {
        if (!("str" in it) || !it.str.trim()) continue;
        const [a, b, c, d, e, f] = it.transform as number[];
        // Text set at an angle (a rotated side label) is not part of the reading order.
        if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01) continue;
        const size = Math.abs(d) || Math.abs(a) || it.height;
        items.push({ str: it.str, x: e, y: f, w: it.width, size, bold: isBold(it.fontName) });
        chars += it.str.trim().length;
      }
      const rows = toRows(items);
      const gutter = findGutter(rows, isDates);
      const links = (await page.getAnnotations().catch(() => [])).filter((a: { url?: string; rect?: number[] }) => a.url && a.rect) as { url: string; rect: number[] }[];
      const pageLines: Raw[][] = [[], []];
      if (gutter === null) {
        for (const r of rows) {
          const l = rowToRaw(r.segs, r.y, p, 0, 1 - r.y / view.height);
          if (l) pageLines[0].push(l);
        }
      } else {
        // The wider side is the main column and is read first; the narrow side follows.
        const minX = Math.min(...rows.map((r) => r.segs[0].x0));
        const maxX = Math.max(...rows.map((r) => r.segs[r.segs.length - 1].x1));
        const mainIsLeft = gutter - minX >= maxX - gutter;
        for (const r of rows) {
          const crossing = r.segs.some((s) => s.x0 < gutter - 4 && s.x1 > gutter + 4);
          const leftSegs = crossing ? r.segs : r.segs.filter((s) => s.x1 <= gutter + 4);
          const rightSegs = crossing ? [] : r.segs.filter((s) => s.x0 >= gutter - 4 && !leftSegs.includes(s));
          const top = 1 - r.y / view.height;
          const l = rowToRaw(leftSegs, r.y, p, mainIsLeft || crossing ? 0 : 1, top);
          const rr = rowToRaw(rightSegs, r.y, p, mainIsLeft ? 1 : 0, top);
          if (l) pageLines[l.col].push(l);
          if (rr) pageLines[rr.col].push(rr);
        }
      }
      for (const link of links) {
        const [x0, y0, x1, y1] = link.rect;
        const cy = (y0 + y1) / 2;
        const hit = [...pageLines[0], ...pageLines[1]].find((l) => Math.abs(l.y + l.size * 0.3 - cy) <= l.size && l.x <= x1 && l.right >= x0);
        if (hit && !hit.links.includes(link.url)) hit.links.push(link.url);
      }
      raw[0].push(...pageLines[0]);
      raw[1].push(...pageLines[1]);
      page.cleanup();
    }
    if (chars < 40) throw new ImportError("scanned", "No text was found in the PDF.");

    // The main column of every page, then the side column of every page.
    const ordered = dropFurniture([...raw[0], ...raw[1]], doc.numPages);
    const joined = joinWrapped(ordered);
    markIndentedBullets(joined);
    const left = new Map<string, number>();
    for (const l of joined) {
      const k = `${l.page}:${l.col}`;
      left.set(k, Math.min(left.get(k) ?? Infinity, l.x));
    }
    const lines = joined.map((l) => makeLine(l.text, { bullet: l.bullet, bold: l.bold, size: l.size, indent: Math.max(0, Math.round(l.x - (left.get(`${l.page}:${l.col}`) ?? l.x))), links: l.links, page: l.page, col: l.col }));
    return { lines, pages: doc.numPages };
  } finally {
    await task.destroy().catch(() => {});
  }
}
