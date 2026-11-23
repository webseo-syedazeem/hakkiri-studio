import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FONT_FILES, FONT_KEYS, fontKey } from "./fonts";
import { parseFont, subsetFont } from "./ttf";

const load = (file: string) => new Uint8Array(fs.readFileSync(path.join(__dirname, "fonts", file)));

describe("the CV fonts", () => {
  it.each(FONT_KEYS)("%s is a static TrueType font with the characters a CV needs", (key) => {
    const bytes = load(FONT_FILES[key].file);
    const font = parseFont(bytes);
    expect(font.unitsPerEm).toBeGreaterThanOrEqual(1000);
    expect(font.ascent).toBeGreaterThan(0);
    expect(font.descent).toBeLessThan(0);
    expect(font.capHeight).toBeGreaterThan(font.unitsPerEm * 0.5);
    // Not a variable font: one weight per file, so the PDF and the screen agree.
    expect(new TextDecoder("latin1").decode(bytes.subarray(0, 600))).not.toContain("fvar");
    const needed = "ABCxyz0123456789 .,;:!?'\"()-–—‘’“”•·&@/%+£$€éèüñçøåÉÖßłŁšžćı…";
    const missing = [...needed].filter((ch) => font.glyph(ch.codePointAt(0)!) === 0);
    expect(missing).toEqual([]);
    expect(font.advance(font.glyph(0x20))).toBeGreaterThan(0);
  });

  it("an italic font says it is italic", () => {
    expect(parseFont(load(FONT_FILES["serif-400i"].file)).italicAngle).toBeLessThan(0);
    expect(parseFont(load(FONT_FILES["serif-400"].file)).italicAngle).toBe(0);
  });

  it("a character the font does not have comes back as glyph 0, so it can be reported and not printed as a box", () => {
    const font = parseFont(load(FONT_FILES["inter-400"].file));
    expect(font.glyph("你".codePointAt(0)!)).toBe(0);
    expect(font.glyph("😀".codePointAt(0)!)).toBe(0);
  });

  it("measures text the same every time (widths come from the font file)", () => {
    const font = parseFont(load(FONT_FILES["inter-400"].file));
    const width = (s: string) => [...s].reduce((w, ch) => w + font.advance(font.glyph(ch.codePointAt(0)!)), 0) / font.unitsPerEm;
    expect(width("iii")).toBeLessThan(width("mmm"));
    expect(width("Paid Media Manager")).toBeCloseTo(width("Paid Media ") + width("Manager"), 6);
  });

  it("falls back to the upright weight when a family has no italic", () => {
    expect(fontKey("serif", 400, true)).toBe("serif-400i");
    expect(fontKey("inter", 400, true)).toBe("inter-400");
  });
});

describe("subsetting a font for the PDF", () => {
  it("keeps the used glyphs, with the same numbers and widths, in a far smaller file", () => {
    const full = parseFont(load(FONT_FILES["inter-400"].file));
    const text = "Cut cost per lead by 18% – £1.2m é";
    const used = new Set([...text].map((ch) => full.glyph(ch.codePointAt(0)!)));
    const bytes = subsetFont(full, used);
    expect(bytes.length).toBeLessThan(full.bytes.length / 4);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0)).toBe(0x00010000);
    // The subset is itself a readable font file: its tables are where the directory says.
    const n = view.getUint16(4);
    const tags: string[] = [];
    for (let i = 0; i < n; i++) {
      const rec = 12 + i * 16;
      tags.push(String.fromCharCode(bytes[rec], bytes[rec + 1], bytes[rec + 2], bytes[rec + 3]));
      expect(view.getUint32(rec + 8) + view.getUint32(rec + 12)).toBeLessThanOrEqual(bytes.length);
    }
    expect(tags).toEqual(expect.arrayContaining(["glyf", "head", "hhea", "hmtx", "loca", "maxp"]));
    expect(tags).toEqual([...tags].sort());
    // Widths are untouched.
    const hmtx = tags.indexOf("hmtx");
    const hmtxAt = view.getUint32(12 + hmtx * 16 + 8);
    for (const g of used) expect(view.getUint16(hmtxAt + g * 4)).toBe(full.advance(g));
  });

  it("a used glyph has its outline and an unused one is empty", () => {
    const full = parseFont(load(FONT_FILES["lora-700"].file));
    const a = full.glyph("A".codePointAt(0)!);
    const z = full.glyph("Z".codePointAt(0)!);
    const bytes = subsetFont(full, [a]);
    const view = new DataView(bytes.buffer);
    const n = view.getUint16(4);
    let loca = 0;
    for (let i = 0; i < n; i++) if (String.fromCharCode(...bytes.subarray(12 + i * 16, 16 + i * 16)) === "loca") loca = view.getUint32(12 + i * 16 + 8);
    const len = (g: number) => view.getUint32(loca + (g + 1) * 4) - view.getUint32(loca + g * 4);
    expect(len(a)).toBeGreaterThan(0);
    expect(len(z)).toBe(0);
  });

  it("brings along the parts of an accented letter built from other glyphs", () => {
    const full = parseFont(load(FONT_FILES["inter-400"].file));
    const e = full.glyph("é".codePointAt(0)!);
    const alone = subsetFont(full, [e]);
    const plain = subsetFont(full, []);
    expect(alone.length).toBeGreaterThan(plain.length);
  });
});
