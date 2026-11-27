import type { CvDoc, Density, Locator } from "../schema";
import { type Fonts, type Layout, layoutCv } from "./layout";
import { BODY_SIZE } from "./templates";

/**
 * Fit to one page, honestly (DESIGN-SPEC-v3 §03). Only the formatting changes, in this order, and only
 * as far as it has to: tighter spacing, then smaller text (never below 10 pt), then narrower margins
 * (never below 12 mm). Each step is measured with the same layout as the PDF. Nothing is cut, reworded
 * or hidden: what still runs over is listed, line by line, for the person to switch off or shorten.
 */

type Printable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target">;
type Design = CvDoc["design"];

/** The smallest text the fit will use, in points. */
export const TEXT_FLOOR = 10;
/** The narrowest margins the fit will use, in millimetres. */
export const MARGIN_FLOOR_MM = 12;
const PT_PER_MM = 72 / 25.4;
/** 12 mm in points, rounded up so the margin is never under 12 mm. */
export const MARGIN_FLOOR = Math.ceil(MARGIN_FLOOR_MM * PT_PER_MM * 10) / 10;
const TEXT_STEP = 0.5;
const MARGIN_STEP = 2;
const DENSITIES: Density[] = ["looser", "default", "tighter"];

/** The side margin a design draws, in points: the same numbers the renderer uses. */
export function marginPt(design: Pick<Design, "margin">): number {
  const m = design.margin;
  if (typeof m === "number") return Math.max(15, Math.min(72, m));
  if (m === "compact") return 36;
  if (m === "relaxed") return 64;
  return 50;
}
export const mmOf = (pt: number) => Math.round(pt / PT_PER_MM);
export const textPt = (design: Pick<Design, "fontSize">) => design.fontSize ?? BODY_SIZE;

export interface OverLine {
  at: Locator;
  /** The words of the piece that runs over, as printed. */
  text: string;
  /** How many of its printed lines are past the target page. */
  lines: number;
}

/** What runs past the page target in a layout: each piece, with its printed lines there. */
export function overTarget(layout: Pick<Layout, "blocks">, target: number): { over: OverLine[]; lines: number } {
  const over: OverLine[] = [];
  let lines = 0;
  for (const b of layout.blocks) {
    const past = b.lines.filter((l) => l.page >= target).length;
    if (!past) continue;
    lines += past;
    over.push({ at: b.at, text: b.lines.map((l) => l.runs.map((r) => r.text).join("")).join(" ").trim(), lines: past });
  }
  return { over, lines };
}

export interface HonestFit {
  fits: boolean;
  /** Pages with the design below. */
  pages: number;
  /** The design to use: the first step that fits, or every step taken when nothing fits. The person's words are not part of it. */
  design: Design;
  /** What changed from the design it started with. */
  changed: { spacing: boolean; text: boolean; margins: boolean };
  /** What still runs over with that design, line by line. Empty when it fits. */
  over: OverLine[];
  overLines: number;
}

/** The steps, in order: spacing, then text, then margins. Each is the design after that step. */
function steps(start: Design): Design[] {
  const out: Design[] = [];
  let d = start;
  for (const density of DENSITIES.slice(DENSITIES.indexOf(start.density) + 1)) out.push((d = { ...d, density }));
  const size = textPt(start);
  if (size > TEXT_FLOOR) {
    for (let s = Math.round((size - TEXT_STEP) * 10) / 10; s > TEXT_FLOOR + 1e-9; s = Math.round((s - TEXT_STEP) * 10) / 10) out.push((d = { ...d, fontSize: s }));
    out.push((d = { ...d, fontSize: TEXT_FLOOR }));
  }
  const margin = marginPt(start);
  if (margin > MARGIN_FLOOR) {
    for (let m = margin - MARGIN_STEP; m > MARGIN_FLOOR + 1e-9; m -= MARGIN_STEP) out.push((d = { ...d, margin: m }));
    out.push((d = { ...d, margin: MARGIN_FLOOR }));
  }
  return out;
}

export function fitHonestly(cv: Printable, fonts: Fonts, target: number = cv.design.pageTarget): HonestFit {
  const start = cv.design;
  const measure = (design: Design) => layoutCv({ ...cv, design }, fonts).layout;
  const result = (design: Design, layout: Layout): HonestFit => {
    const { over, lines } = overTarget(layout, target);
    return {
      fits: layout.pages <= target,
      pages: layout.pages,
      design,
      changed: { spacing: design.density !== start.density, text: textPt(design) !== textPt(start), margins: marginPt(design) !== marginPt(start) },
      over: layout.pages <= target ? [] : over,
      overLines: layout.pages <= target ? 0 : lines,
    };
  };
  const first = measure(start);
  if (first.pages <= target) return result(start, first);
  let last: { design: Design; layout: Layout } = { design: start, layout: first };
  for (const design of steps(start)) {
    const layout = measure(design);
    if (layout.pages <= target) return result(design, layout);
    last = { design, layout };
  }
  return result(last.design, last.layout);
}

/** "spacing tighter, text 10 pt, margins 12 mm": what a fit changed, from its own numbers. Empty when nothing changed. */
export function fitChanges(fit: Pick<HonestFit, "changed" | "design">): string {
  const parts: string[] = [];
  if (fit.changed.spacing) parts.push(`spacing ${fit.design.density === "tighter" ? "tighter" : "standard"}`);
  parts.push(fit.changed.text ? `text ${textPt(fit.design)} pt` : "text size unchanged");
  if (fit.changed.margins) parts.push(`margins ${mmOf(marginPt(fit.design))} mm`);
  return fit.changed.spacing || fit.changed.text || fit.changed.margins ? parts.join(", ") : "";
}
