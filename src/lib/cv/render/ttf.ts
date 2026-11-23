/**
 * Reads a TrueType font: which glyph draws each character, how wide each glyph
 * is, and the font's vertical measurements. The same code runs in the browser
 * (to lay the paper out as you type) and on the server (to write the PDF), so
 * both break lines in exactly the same places.
 *
 * `subsetFont` writes a copy of the font holding only the glyphs a document
 * uses, which is what gets embedded in the PDF.
 */

export interface Font {
  bytes: Uint8Array;
  unitsPerEm: number;
  /** Above and below the baseline, in font units (descent is negative). */
  ascent: number;
  descent: number;
  capHeight: number;
  italicAngle: number;
  bbox: [number, number, number, number];
  numGlyphs: number;
  /** The glyph for a character, or 0 when the font has none. */
  glyph(codePoint: number): number;
  /** A glyph's width in font units. */
  advance(glyph: number): number;
}

interface Table {
  offset: number;
  length: number;
}

function tables(view: DataView): Map<string, Table> {
  const out = new Map<string, Table>();
  const n = view.getUint16(4);
  for (let i = 0; i < n; i++) {
    const at = 12 + i * 16;
    const tag = String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
    out.set(tag, { offset: view.getUint32(at + 8), length: view.getUint32(at + 12) });
  }
  return out;
}

/** Builds the character-to-glyph lookup from the font's cmap table (formats 4 and 12). */
function readCmap(view: DataView, cmap: Table): (cp: number) => number {
  const count = view.getUint16(cmap.offset + 2);
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < count; i++) {
    const rec = cmap.offset + 4 + i * 8;
    const platform = view.getUint16(rec);
    const encoding = view.getUint16(rec + 2);
    const offset = cmap.offset + view.getUint32(rec + 4);
    const format = view.getUint16(offset);
    // Prefer the full Unicode table (format 12), then the basic one (format 4).
    const score = format === 12 && (platform === 3 ? encoding === 10 : platform === 0) ? 3 : format === 4 && (platform === 3 ? encoding === 1 : platform === 0) ? 2 : 0;
    if (score > bestScore) {
      bestScore = score;
      best = offset;
    }
  }
  if (best < 0 || bestScore === 0) throw new Error("The font has no Unicode character map.");
  const map = new Map<number, number>();
  if (view.getUint16(best) === 12) {
    const groups = view.getUint32(best + 12);
    for (let g = 0; g < groups; g++) {
      const at = best + 16 + g * 12;
      const start = view.getUint32(at);
      const end = view.getUint32(at + 4);
      const glyph = view.getUint32(at + 8);
      for (let c = start; c <= end && c - start < 70000; c++) map.set(c, glyph + (c - start));
    }
  } else {
    const segs = view.getUint16(best + 6) / 2;
    const endAt = best + 14;
    const startAt = endAt + segs * 2 + 2;
    const deltaAt = startAt + segs * 2;
    const rangeAt = deltaAt + segs * 2;
    for (let s = 0; s < segs; s++) {
      const end = view.getUint16(endAt + s * 2);
      const start = view.getUint16(startAt + s * 2);
      const delta = view.getInt16(deltaAt + s * 2);
      const range = view.getUint16(rangeAt + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        let glyph: number;
        if (range === 0) glyph = (c + delta) & 0xffff;
        else {
          const g = view.getUint16(rangeAt + s * 2 + range + (c - start) * 2);
          glyph = g === 0 ? 0 : (g + delta) & 0xffff;
        }
        if (glyph) map.set(c, glyph);
      }
    }
  }
  return (cp) => map.get(cp) ?? 0;
}

export function parseFont(bytes: Uint8Array): Font {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const t = tables(view);
  const need = (tag: string) => {
    const table = t.get(tag);
    if (!table) throw new Error(`The font has no ${tag} table.`);
    return table;
  };
  const head = need("head");
  const hhea = need("hhea");
  const maxp = need("maxp");
  const hmtx = need("hmtx");
  need("glyf");
  need("loca");
  const unitsPerEm = view.getUint16(head.offset + 18);
  const numGlyphs = view.getUint16(maxp.offset + 4);
  const numHMetrics = view.getUint16(hhea.offset + 34);
  const os2 = t.get("OS/2");
  const post = t.get("post");
  const ascent = view.getInt16(hhea.offset + 4);
  const descent = view.getInt16(hhea.offset + 6);
  const capHeight = os2 && view.getUint16(os2.offset) >= 2 && os2.length >= 90 ? view.getInt16(os2.offset + 88) : Math.round(ascent * 0.72);
  const italicAngle = post ? view.getInt32(post.offset + 4) / 65536 : 0;
  const glyph = readCmap(view, need("cmap"));
  const advance = (g: number) => view.getUint16(hmtx.offset + Math.min(g, numHMetrics - 1) * 4);
  return {
    bytes,
    unitsPerEm,
    ascent,
    descent,
    capHeight,
    italicAngle,
    bbox: [view.getInt16(head.offset + 36), view.getInt16(head.offset + 38), view.getInt16(head.offset + 40), view.getInt16(head.offset + 42)],
    numGlyphs,
    glyph,
    advance,
  };
}

/* -------------------------------------------------------------------- subsetting */

const pad4 = (n: number) => (n + 3) & ~3;

function checksum(data: Uint8Array): number {
  let sum = 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const whole = data.length & ~3;
  for (let i = 0; i < whole; i += 4) sum = (sum + view.getUint32(i)) >>> 0;
  if (whole < data.length) {
    let last = 0;
    for (let i = whole; i < data.length; i++) last |= data[i] << (24 - (i - whole) * 8);
    sum = (sum + (last >>> 0)) >>> 0;
  }
  return sum;
}

/**
 * A copy of the font with only the given glyphs' outlines. Glyph numbers stay
 * the same, so text written with the full font's glyph numbers still works;
 * every other glyph is simply empty. Character maps and layout tables are
 * left out: a PDF addresses glyphs by number and does not need them.
 */
export function subsetFont(font: Font, used: Iterable<number>): Uint8Array {
  const src = font.bytes;
  const view = new DataView(src.buffer, src.byteOffset, src.byteLength);
  const t = tables(view);
  const head = t.get("head")!;
  const loca = t.get("loca")!;
  const glyf = t.get("glyf")!;
  const longLoca = view.getInt16(head.offset + 50) === 1;
  const offsetOf = (g: number) => (longLoca ? view.getUint32(loca.offset + g * 4) : view.getUint16(loca.offset + g * 2) * 2);

  // Glyph 0 (the "missing" box) is always kept, as are the parts of any glyph built from other glyphs.
  const keep = new Set<number>([0]);
  const queue = [...used];
  while (queue.length) {
    const g = queue.pop()!;
    if (g < 0 || g >= font.numGlyphs || keep.has(g)) continue;
    keep.add(g);
    const from = glyf.offset + offsetOf(g);
    const to = glyf.offset + offsetOf(g + 1);
    if (to - from < 10 || view.getInt16(from) >= 0) continue;
    // A composite glyph: follow its components.
    let at = from + 10;
    for (;;) {
      const flags = view.getUint16(at);
      queue.push(view.getUint16(at + 2));
      at += 4 + (flags & 1 ? 4 : 2) + (flags & 8 ? 2 : flags & 0x40 ? 4 : flags & 0x80 ? 8 : 0);
      if (!(flags & 0x20)) break;
    }
  }
  keep.add(0);

  // New glyf and loca tables.
  const parts: Uint8Array[] = [];
  const newLoca = new Uint8Array((font.numGlyphs + 1) * 4);
  const locaView = new DataView(newLoca.buffer);
  let at = 0;
  for (let g = 0; g < font.numGlyphs; g++) {
    locaView.setUint32(g * 4, at);
    if (!keep.has(g)) continue;
    const from = glyf.offset + offsetOf(g);
    const len = offsetOf(g + 1) - offsetOf(g);
    if (len <= 0) continue;
    const data = new Uint8Array(pad4(len));
    data.set(src.subarray(from, from + len));
    parts.push(data);
    at += data.length;
  }
  locaView.setUint32(font.numGlyphs * 4, at);
  const newGlyf = new Uint8Array(at);
  let w = 0;
  for (const p of parts) {
    newGlyf.set(p, w);
    w += p.length;
  }

  const newHead = src.slice(head.offset, head.offset + head.length);
  const headView = new DataView(newHead.buffer);
  headView.setUint32(8, 0); // checkSumAdjustment, filled in below
  headView.setInt16(50, 1); // loca is written in the long format

  const out: [string, Uint8Array][] = [];
  for (const tag of ["cvt ", "fpgm", "glyf", "head", "hhea", "hmtx", "loca", "maxp", "prep"]) {
    const table = t.get(tag);
    if (tag === "glyf") out.push([tag, newGlyf]);
    else if (tag === "loca") out.push([tag, newLoca]);
    else if (tag === "head") out.push([tag, newHead]);
    else if (table) out.push([tag, src.subarray(table.offset, table.offset + table.length)]);
  }

  const n = out.length;
  const headerSize = 12 + n * 16;
  const total = headerSize + out.reduce((sum, [, d]) => sum + pad4(d.length), 0);
  const file = new Uint8Array(total);
  const fv = new DataView(file.buffer);
  const pow = 2 ** Math.floor(Math.log2(n));
  fv.setUint32(0, 0x00010000);
  fv.setUint16(4, n);
  fv.setUint16(6, pow * 16);
  fv.setUint16(8, Math.log2(pow));
  fv.setUint16(10, n * 16 - pow * 16);
  let offset = headerSize;
  let headAt = 0;
  out.forEach(([tag, data], i) => {
    const rec = 12 + i * 16;
    for (let c = 0; c < 4; c++) fv.setUint8(rec + c, tag.charCodeAt(c));
    fv.setUint32(rec + 4, checksum(data));
    fv.setUint32(rec + 8, offset);
    fv.setUint32(rec + 12, data.length);
    file.set(data, offset);
    if (tag === "head") headAt = offset;
    offset += pad4(data.length);
  });
  fv.setUint32(headAt + 8, (0xb1b0afba - checksum(file)) >>> 0);
  return file;
}
