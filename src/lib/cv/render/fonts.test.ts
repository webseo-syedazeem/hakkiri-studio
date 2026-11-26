import { describe, expect, it } from "vitest";
import { FAMILIES, FONT_FILES, type FamilyId, WORD_FALLBACK, WORD_KIND, fontKey } from "./fonts";
import { layoutCv } from "./layout";
import { writePdf } from "./pdf";
import { readBackPdf } from "./readback";
import { TEMPLATES } from "./templates";
import { fernCv, loadAllFonts } from "./testing";

const fonts = loadAllFonts();

describe("the font families", () => {
  it("each have a regular, semibold and bold file, a Word fallback and a kind", () => {
    for (const f of Object.keys(FAMILIES) as FamilyId[]) {
      for (const w of [400, 600, 700] as const) expect(FONT_FILES[fontKey(f, w)], `${f} ${w}`).toBeDefined();
      expect(WORD_FALLBACK[f]).toBeTruthy();
      expect(WORD_KIND[f]).toBeTruthy();
    }
  });

  // Every family, as heading and as body type, must draw every character of a real CV (£, €, accents, dashes)
  // and give a PDF that reads back word for word.
  it.each(Object.keys(FAMILIES) as FamilyId[])("%s sets a whole CV that reads back word for word", async (family) => {
    const cv = fernCv();
    const { layout, flow } = layoutCv({ ...cv, contact: { ...cv.contact, fullName: "Zoë Müller-Łukasz" }, design: { ...cv.design, headingFont: family, bodyFont: family } }, fonts);
    expect(layout.missing).toEqual([]);
    const check = await readBackPdf(writePdf(layout, flow, fonts, { title: flow.title, lang: flow.lang, created: new Date("2026-11-26T12:00:00Z") }), flow);
    expect({ missing: check.missing, unexpected: check.unexpected }).toEqual({ missing: [], unexpected: [] });
  });

  it("are all used by at least one template", () => {
    const used = new Set(Object.values(TEMPLATES).flatMap((t) => [t.fonts.heading, t.fonts.body]));
    for (const f of Object.keys(FAMILIES)) expect(used.has(f as FamilyId), f).toBe(true);
  });
});
