import { describe, expect, it } from "vitest";
import { flowText } from "./flow";
import { type Block, layoutCv } from "./layout";
import { wordsOf } from "./readback";
import { TEMPLATES } from "./templates";
import { fernCv, loadAllFonts, longCv } from "./testing";

/**
 * The v3 designs with text beside text (TEMPLATES-v3 §02): where each piece goes, and that the reading order
 * (the order of the pieces, which is the order the PDF is written in) is the CV's own order every time.
 */
const fonts = loadAllFonts();
const text = (b: Block) => b.lines.map((l) => l.runs.map((r) => r.text).join("")).join(" ");
const x = (b: Block) => Math.min(...b.lines.flatMap((l) => l.runs.map((r) => r.x)));

/** Fern's CV cut to one page: the two latest roles, education and skills. */
function onePage(template: "clearline" | "fieldwork" | "framework") {
  const cv = fernCv({ template });
  cv.sections = cv.sections.map((s) => (["summary", "experience", "education", "skills"].includes(s.kind) ? s : { ...s, visible: false }));
  return cv;
}

function readsInOrder(cv: ReturnType<typeof fernCv>) {
  const { layout, flow } = layoutCv(cv, fonts);
  expect(layout.blocks.map((b) => b.node)).toEqual(flow.nodes.map((_, i) => i).filter((i) => layout.blocks.some((b) => b.node === i)));
  expect(wordsOf(layout.blocks.map(text).join(" "))).toEqual(flowText(flow).flatMap(wordsOf));
  return { layout, flow };
}

describe("a rail of short items (46 Clearline, 47 Fieldwork, 51 Framework)", () => {
  for (const template of ["clearline", "fieldwork", "framework"] as const) {
    it(`${template}: on a one-page CV the skills sit in the rail, level with the top of the main text, and are read after it`, () => {
      const { layout, flow } = readsInOrder(onePage(template));
      expect(layout.pages).toBe(1);
      const grid = TEMPLATES[template].grid!;
      if (grid.kind !== "rail") throw new Error("rail expected");
      const { marginX } = layoutCv(onePage(template), fonts).style.page;
      const width = layout.width - 2 * marginX;
      const railX = grid.side === "right" ? marginX + width - grid.width : marginX;
      const skills = layout.blocks.filter((b) => b.sectionId && flow.kinds?.[b.sectionId] === "skills");
      expect(skills.length).toBeGreaterThan(1);
      for (const b of skills) expect(x(b)).toBeGreaterThanOrEqual(railX - 0.5);
      // The main text: not the name and contact details, and not 51's framed profile, which is full width above both.
      const main = layout.blocks.filter((b) => !skills.includes(b) && b.kind !== "name" && b.kind !== "contact" && !(TEMPLATES[template].frame && flow.kinds?.[b.sectionId!] === "summary"));
      // Nothing in the main column strays into the rail, and the rail's text keeps inside it.
      for (const b of main) for (const l of b.lines) for (const r of l.runs) expect(grid.side === "right" ? r.x + r.width <= railX + 0.5 : r.x >= railX + grid.width - 0.5).toBe(true);
      for (const b of skills) for (const l of b.lines) for (const r of l.runs) expect(r.x + r.width).toBeLessThanOrEqual(railX + grid.width + 0.5);
      // Read after every main piece.
      expect(Math.min(...skills.map((b) => layout.blocks.indexOf(b)))).toBeGreaterThan(Math.max(...main.map((b) => layout.blocks.indexOf(b))));
    });

    it(`${template}: on a longer CV there is no rail: the short items follow the main text, full width`, () => {
      const cv = longCv(6);
      cv.design = { ...cv.design, template };
      const { layout } = readsInOrder(cv);
      expect(layout.pages).toBeGreaterThan(1);
      const { marginX } = layoutCv(cv, fonts).style.page;
      const skillsHeading = layout.blocks.find((b) => b.kind === "heading" && /^skills$/i.test(text(b)))!;
      expect(x(skillsHeading)).toBeCloseTo(marginX, 0);
      const firstRole = layout.blocks.find((b) => b.kind === "entry")!;
      expect(layout.blocks.indexOf(skillsHeading)).toBeGreaterThan(layout.blocks.indexOf(firstRole));
    });
  }

  it("without short items there is no empty rail: the main text takes the full width", () => {
    const cv = onePage("clearline");
    cv.sections = cv.sections.map((s) => (s.kind === "skills" ? { ...s, visible: false } : s));
    const { layout, style } = layoutCv(cv, fonts);
    const right = Math.max(...layout.blocks.flatMap((b) => b.lines.flatMap((l) => l.runs.map((r) => r.x + r.width))));
    expect(right).toBeGreaterThan(layout.width - style.page.marginX - 160);
  });
});

describe("headings in the margin (49 Margin Notes)", () => {
  it("sets each heading beside its section's first line, and reads it first", () => {
    const { layout } = readsInOrder(fernCv({ template: "margin-notes" }));
    const { marginX } = layoutCv(fernCv({ template: "margin-notes" }), fonts).style.page;
    const headings = layout.blocks.filter((b) => b.kind === "heading");
    expect(headings.length).toBeGreaterThan(3);
    let beside = 0;
    for (const h of headings) {
      const next = layout.blocks[layout.blocks.indexOf(h) + 1];
      const wide = Math.max(...h.lines.flatMap((l) => l.runs.map((r) => r.x + r.width))) - marginX > 91;
      expect(x(h)).toBeCloseTo(marginX, 0);
      if (wide) {
        // A heading too long for the 91 pt margin is set above its content, so it is never read in the middle of it.
        expect(next.lines[0].top).toBeGreaterThanOrEqual(h.lines[h.lines.length - 1].top + h.lines[0].height - 0.5);
        continue;
      }
      beside++;
      expect(next.lines[0].top).toBeCloseTo(h.lines[0].top, 0);
      expect(x(next)).toBeGreaterThanOrEqual(marginX + 91 + 12 - 0.5);
    }
    expect(beside).toBeGreaterThan(5);
  });
});

describe("dates in a gutter (52 Chronicle)", () => {
  it("sets each role's dates in the gutter, level with the role, read after the role's heading", () => {
    const { layout } = readsInOrder(fernCv({ template: "chronicle" }));
    const { marginX } = layoutCv(fernCv({ template: "chronicle" }), fonts).style.page;
    const roles = layout.blocks.filter((b) => b.kind === "entry" && b.sectionId && x(b) > marginX + 50);
    expect(roles.length).toBeGreaterThan(2);
    for (const r of roles) {
      const dates = layout.blocks[layout.blocks.indexOf(r) + 1];
      if (x(dates) > marginX + 1) continue;
      expect(dates.lines[0].top).toBeCloseTo(r.lines[0].top, 0);
      for (const l of dates.lines) for (const run of l.runs) expect(run.x + run.width).toBeLessThanOrEqual(marginX + 96 - 9 + 0.5);
      expect(x(r)).toBeCloseTo(marginX + 96 + 15, 0);
    }
  });

  it("never breaks a web address to fit the gutter: a date line with one stays with the role", () => {
    const { layout } = layoutCv(fernCv({ template: "chronicle" }), fonts);
    const linked = layout.blocks.find((b) => b.lines.some((l) => l.runs.some((r) => r.link?.includes("paperkite"))))!;
    expect(text(linked)).toContain("paperkite.example/maps");
  });
});
