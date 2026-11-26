import { describe, expect, it } from "vitest";
import type { Design } from "../schema";
import { writeDocx } from "./docx";
import { layoutCv } from "./layout";
import { writePdf } from "./pdf";
import { readBackDocx, readBackPdf } from "./readback";
import { paperStyle } from "./templates";
import { fernCv, loadAllFonts } from "./testing";

const fonts = loadAllFonts();
const WHEN = new Date("2026-11-26T12:00:00Z");

/** The CV with some design options changed. */
const withDesign = (design: Partial<Design>) => {
  const cv = fernCv();
  return { ...cv, design: { ...cv.design, ...design } };
};

async function readsBack(design: Partial<Design>) {
  const cv = withDesign(design);
  const { layout, flow, style } = layoutCv(cv, fonts);
  const pdf = await readBackPdf(writePdf(layout, flow, fonts, { title: flow.title, lang: flow.lang, created: WHEN }), flow);
  const docx = await readBackDocx(await writeDocx(flow, style, { title: flow.title, lang: flow.lang, created: WHEN }), flow);
  return { layout, pdf: { missing: pdf.missing, unexpected: pdf.unexpected }, docx: { missing: docx.missing, unexpected: docx.unexpected } };
}

describe("design options", () => {
  it("leave a CV that sets none of them exactly as its template draws it", () => {
    const s = paperStyle(fernCv().design);
    expect({ bullet: s.bullet, separator: s.separator, entryIndent: s.entryIndent, header: s.header, dash: s.dash }).toEqual({ bullet: "•", separator: " · ", entryIndent: 0, header: "plain", dash: "solid" });
  });

  const CASES: [string, Partial<Design>][] = [
    ["dash bullets, bar separators", { bullet: "dash", contactSeparator: "bar" }],
    ["arrow bullets, bullet separators", { bullet: "arrow", contactSeparator: "bullet" }],
    ["no bullet marks", { bullet: "none" }],
    ["entries indented", { entryIndent: 12 }],
    ["a band behind the name", { header: "band" }],
    ["dashed dividers, capital headings", { dividerStyle: "dashed", headingCaps: true }],
    ["dotted dividers, a large name", { dividerStyle: "dots", nameSize: 36 }],
    ["an accent bar, no dividers on another template", { dividerStyle: "accent-bar", template: "minimal" }],
    ["fonts chosen one at a time", { headingFont: "garamond", bodyFont: "sans3" }],
    ["everything at once", { bullet: "arrow", contactSeparator: "bar", entryIndent: 18, header: "band", dividerStyle: "dashed", headingCaps: true, nameSize: 30, headingFont: "manrope", bodyFont: "work" }],
  ];

  it.each(CASES)("%s: every word reads back from both files", async (_name, design) => {
    const { layout, pdf, docx } = await readsBack(design);
    expect(layout.missing).toEqual([]);
    expect(pdf).toEqual({ missing: [], unexpected: [] });
    expect(docx).toEqual({ missing: [], unexpected: [] });
  });

  it("draw a band behind the name, under the text, with the name in white", () => {
    const { layout } = layoutCv(withDesign({ header: "band" }), fonts);
    const band = layout.rules.find((r) => r.under)!;
    expect(band).toMatchObject({ x: 0, y: 0, width: layout.width });
    const name = layout.blocks.find((b) => b.tag === "H1")!;
    expect(name.lines[0].runs[0].color).toBe("#FFFFFF");
    expect(band.height).toBeGreaterThan(name.lines[0].top + name.lines[0].height);
  });

  it("keep the plain header when a pale custom colour would leave white text unreadable", () => {
    expect(paperStyle({ ...fernCv().design, header: "band", customAccent: "#F5D76E" }).header).toBe("plain");
  });

  it("indent an entry's lines and bullet marks together", () => {
    const { layout, style } = layoutCv(withDesign({ entryIndent: 12 }), fonts);
    const bullet = layout.blocks.find((b) => b.tag === "LI")!;
    expect(bullet.mark!.x).toBeCloseTo(style.page.marginX + 12 + 2.5);
    expect(bullet.lines[0].runs[0].x).toBeCloseTo(style.page.marginX + 12 + style.indentation);
    const entry = layout.blocks.find((b) => b.tag === "H3")!;
    expect(entry.lines[0].runs[0].x).toBeCloseTo(style.page.marginX + 12);
  });

  it("draw dashed and dotted dividers as short pieces", () => {
    const solid = layoutCv(withDesign({}), fonts).layout.rules.length;
    expect(layoutCv(withDesign({ dividerStyle: "dashed" }), fonts).layout.rules.length).toBeGreaterThan(solid * 10);
    expect(layoutCv(withDesign({ dividerStyle: "none" }), fonts).layout.rules.length).toBeLessThan(solid);
  });

  it("write the chosen bullet mark and dividers into the Word file", async () => {
    const JSZip = (await import("jszip")).default;
    const cv = withDesign({ bullet: "arrow", dividerStyle: "dashed", entryIndent: 12 });
    const { flow, style } = layoutCv(cv, fonts);
    const zip = await JSZip.loadAsync(await writeDocx(flow, style, { title: flow.title, lang: flow.lang, created: WHEN }));
    expect(await zip.file("word/numbering.xml")!.async("string")).toContain('<w:lvlText w:val="›"/>');
    const doc = await zip.file("word/document.xml")!.async("string");
    expect(doc).toContain('w:val="dashed"');
    expect(doc).toContain('<w:ind w:left="240"/>');
  });
});
