import { describe, expect, it } from "vitest";
import { MARGIN_FLOOR, MARGIN_FLOOR_MM, TEXT_FLOOR, fitChanges, fitHonestly, marginPt, mmOf, textPt } from "./fit";
import { layoutCv } from "./layout";
import { fernCv, loadAllFonts, longCv } from "./testing";

const fonts = loadAllFonts();
const pagesOf = (cv: ReturnType<typeof longCv>, design = cv.design) => layoutCv({ ...cv, design }, fonts).layout.pages;

/** The first test CV, by length, and a page target, for which `pick` holds. */
function find(pick: (cv: ReturnType<typeof longCv>, target: number) => boolean): { cv: ReturnType<typeof longCv>; target: number } | null {
  for (let roles = 1; roles <= 9; roles++)
    for (let points = 1; points <= 6; points++) {
      const cv = longCv(roles, points);
      for (let target = 1; target <= 3; target++) if (pick(cv, target)) return { cv, target };
    }
  return null;
}

describe("fit to one page, honestly", () => {
  it("changes nothing when the CV already fits", () => {
    const cv = fernCv();
    const target = pagesOf(cv);
    const fit = fitHonestly(cv, fonts, target);
    expect(fit).toMatchObject({ fits: true, over: [], overLines: 0, changed: { spacing: false, text: false, margins: false } });
    expect(fit.design).toEqual(cv.design);
    expect(fitChanges(fit)).toBe("");
  });

  it("tightens the spacing first, and stops there when that is enough", () => {
    const found = find((c, t) => pagesOf(c) === t + 1 && pagesOf(c, { ...c.design, density: "tighter" }) === t);
    expect(found).not.toBeNull();
    const fit = fitHonestly(found!.cv, fonts, found!.target);
    expect(fit).toMatchObject({ fits: true, pages: found!.target, changed: { spacing: true, text: false, margins: false } });
    expect(fit.design.density).toBe("tighter");
    expect(fitChanges(fit)).toBe("spacing tighter, text size unchanged");
  });

  it("then makes the text smaller, a step at a time and never below 10 pt", () => {
    const found = find((c, t) => pagesOf(c, { ...c.design, density: "tighter" }) === t + 1 && pagesOf(c, { ...c.design, density: "tighter", fontSize: TEXT_FLOOR }) === t);
    expect(found).not.toBeNull();
    const { cv, target } = found!;
    const fit = fitHonestly(cv, fonts, target);
    expect(fit).toMatchObject({ fits: true, pages: target, changed: { spacing: true, text: true, margins: false } });
    expect(textPt(fit.design)).toBeGreaterThanOrEqual(TEXT_FLOOR);
    expect(textPt(fit.design)).toBeLessThan(textPt(cv.design));
    // Half a point larger would not have fitted: it went only as far as it had to.
    if (textPt(fit.design) + 0.5 < textPt(cv.design)) expect(pagesOf(cv, { ...fit.design, fontSize: textPt(fit.design) + 0.5 })).toBe(target + 1);
    expect(fitChanges(fit)).toMatch(/^spacing tighter, text \d+(\.5)? pt$/);
  });

  it("then narrows the margins, never below 12 mm", () => {
    const found = find((c, t) => pagesOf(c, { ...c.design, density: "tighter", fontSize: TEXT_FLOOR }) === t + 1 && pagesOf(c, { ...c.design, density: "tighter", fontSize: TEXT_FLOOR, margin: MARGIN_FLOOR }) === t);
    expect(found).not.toBeNull();
    const fit = fitHonestly(found!.cv, fonts, found!.target);
    expect(fit).toMatchObject({ fits: true, pages: found!.target, changed: { spacing: true, text: true, margins: true } });
    expect(marginPt(fit.design)).toBeGreaterThanOrEqual(MARGIN_FLOOR);
    expect(MARGIN_FLOOR / (72 / 25.4)).toBeGreaterThanOrEqual(MARGIN_FLOOR_MM);
    expect(fitChanges(fit)).toMatch(/margins \d+ mm$/);
  });

  it("when nothing fits, stops at the floors and lists what still runs over, without touching the words", () => {
    const cv = longCv(9, 6);
    const before = JSON.stringify(cv.sections);
    const fit = fitHonestly(cv, fonts, 1);
    expect(fit.fits).toBe(false);
    expect(textPt(fit.design)).toBe(TEXT_FLOOR);
    expect(marginPt(fit.design)).toBe(MARGIN_FLOOR);
    expect(mmOf(marginPt(fit.design))).toBe(12);
    expect(fit.overLines).toBeGreaterThan(0);
    expect(fit.over.reduce((n, o) => n + o.lines, 0)).toBe(fit.overLines);
    expect(fit.over.every((o) => o.at.section && o.text.length > 0)).toBe(true);
    // The count is the real one: the same layout, measured again.
    const again = layoutCv({ ...cv, design: fit.design }, fonts).layout;
    expect(again.blocks.reduce((n, b) => n + b.lines.filter((l) => l.page >= 1).length, 0)).toBe(fit.overLines);
    expect(JSON.stringify(cv.sections)).toBe(before);
  });

  it("never makes text or margins larger, and leaves text already under 10 pt as it is", () => {
    const cv = longCv(9, 6);
    const small = { ...cv, design: { ...cv.design, fontSize: 9, margin: 30 } };
    const fit = fitHonestly(small, fonts, 1);
    expect(textPt(fit.design)).toBe(9);
    expect(marginPt(fit.design)).toBe(30);
    expect(fit.changed.text || fit.changed.margins).toBe(false);
  });
});
