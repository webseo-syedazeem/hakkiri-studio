import { describe, expect, it } from "vitest";
import { MIN_FIT_MARGIN_PT, MIN_FIT_SIZE, fitHonestly, fitSummary, marginMm } from "./fit";
import { layoutCv } from "./layout";
import { fernCv, loadAllFonts, longCv } from "./testing";

const fonts = loadAllFonts();
const words = (cv: Parameters<typeof layoutCv>[0]) => JSON.stringify(cv.sections) + JSON.stringify(cv.contact);

describe("Fit to one page, honestly (design spec v3 §03)", () => {
  it("changes nothing when the CV already fits", () => {
    const cv = fernCv();
    const pages = layoutCv(cv, fonts).layout.pages;
    const f = fitHonestly(cv, fonts, Math.max(pages, 1));
    expect(f.status).toBe("already");
    expect(f.design).toEqual(cv.design);
    expect(fitSummary(f, pages)).toMatch(/^Already fits/);
  });

  it("tries spacing, then text, then margins — never below 10 pt or 12 mm — and never touches the words", () => {
    const cv = longCv();
    const before = words(cv);
    const f = fitHonestly(cv, fonts, 1);
    expect(words(cv)).toBe(before);
    expect(f.design.density).toBe("tighter");
    expect(f.design.fontSize ?? 10.5).toBeGreaterThanOrEqual(MIN_FIT_SIZE);
    if (typeof f.design.margin === "number") expect(f.design.margin).toBeGreaterThanOrEqual(MIN_FIT_MARGIN_PT);
    expect(marginMm(f.design)).toBeGreaterThanOrEqual(12);
    // The result is measured: the pages it reports are the pages the renderer lays out.
    expect(layoutCv({ ...cv, design: f.design }, fonts).layout.pages).toBe(f.pages);
  });

  it("lists every line still over, exactly as set, with an honest count", () => {
    const cv = longCv();
    const f = fitHonestly(cv, fonts, 1);
    if (f.status === "over") {
      expect(f.over.length).toBeGreaterThan(0);
      expect(f.over.every((l) => l.page >= 2 && l.text.length > 0)).toBe(true);
      expect(fitSummary(f, 1)).toBe(`${f.over.length} ${f.over.length === 1 ? "line still runs" : "lines still run"} onto page 2.`);
    } else {
      expect(f.over).toEqual([]);
      expect(fitSummary(f, 1)).toMatch(/^Fits on 1 page: /);
    }
  });
});
