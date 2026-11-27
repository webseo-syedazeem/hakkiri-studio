import type { Design, Locator } from "../schema";
import { BODY_SIZE, TEMPLATES } from "./templates";
import { type Fonts, type Printable, layoutCv } from "./layout";

/**
 * Fit to one page, honestly (design spec v3 §03). Formatting only, in a
 * fixed order, measuring the real page after every step:
 *   1. tighter spacing (the existing density control);
 *   2. smaller text, half a point at a time, never below 10 pt;
 *   3. narrower margins, a little at a time, never below 12 mm.
 * Words are never rewritten, cut or hidden. Whatever still runs over is
 * listed line by line for the person to switch off or shorten themselves.
 */

/** 10 pt: the smallest body text a fit may choose. */
export const MIN_FIT_SIZE = 10;
/** 12 mm. Margins are set in points; the vertical margin is 0.92 of the horizontal, so 37 pt keeps both at 12 mm or more. */
export const MIN_FIT_MARGIN_PT = 37;
const MM_PER_PT = 25.4 / 72;

/** The horizontal margin a design uses, in points (as the renderer reads it). */
export function marginPt(design: Pick<Design, "margin"> & Partial<Pick<Design, "template">>): number {
  const m = design.margin;
  if (typeof m === "number") return Math.max(15, Math.min(72, m));
  // A v3 design draws its own margin, the same on every side (TEMPLATES-v3).
  return m === "compact" ? 36 : m === "relaxed" ? 64 : ownMargin(design) ?? 50;
}
const ownMargin = (design: Partial<Pick<Design, "template">>) => (design.template ? TEMPLATES[design.template]?.margin : undefined);
/** The body text size a design draws, in points: the person's own, or the design's (a v3 design has its own). */
export const textPt = (design: Pick<Design, "fontSize"> & Partial<Pick<Design, "template">>) => design.fontSize ?? ((design.template && TEMPLATES[design.template]?.bodySize) || BODY_SIZE);

/** The smaller of the two page margins, in whole millimetres, as a person would read it on the page. */
export function marginMm(design: Pick<Design, "margin"> & Partial<Pick<Design, "template">>): number {
  const x = marginPt(design);
  const own = ownMargin(design);
  const y = own && design.margin !== "compact" && design.margin !== "relaxed" ? x : typeof design.margin === "number" ? Math.round(x * 0.92) : design.margin === "compact" ? 34 : design.margin === "relaxed" ? 58 : 46;
  return Math.round(Math.min(x, y) * MM_PER_PT);
}

export interface FitLine {
  at: Locator;
  /** The exact words of the line as it is set on the page. */
  text: string;
  page: number;
}

export interface HonestFit {
  /** "already": it fitted before anything changed. "fits": it fits now. "over": formatting alone couldn't do it. */
  status: "already" | "fits" | "over";
  /** The design to use: the one that fits, or the tightest tried (never below the minimums). */
  design: Design;
  pages: number;
  /** What changed, step by step, for the result line. */
  changed: { spacing: boolean; textPt: number | null; marginMm: number | null };
  /** The lines that still fall past the target, each as it appears on the page. Empty when it fits. */
  over: FitLine[];
}

function measure(cv: Printable, fonts: Fonts, design: Design) {
  return layoutCv({ ...cv, design }, fonts).layout;
}

export function fitHonestly(cv: Printable, fonts: Fonts, target: number = cv.design.pageTarget): HonestFit {
  const start = cv.design;
  const none = { spacing: false, textPt: null, marginMm: null };
  const first = measure(cv, fonts, start);
  if (first.pages <= target) return { status: "already", design: start, pages: first.pages, changed: none, over: [] };

  let design: Design = { ...start };
  let layout = first;
  const done = () => layout.pages <= target;

  // 1. Tighter spacing.
  if (design.density !== "tighter") {
    design = { ...design, density: "tighter" };
    layout = measure(cv, fonts, design);
  }
  // 2. Smaller text, never below 10 pt (and never larger than the person had it).
  let size = textPt(design);
  while (!done() && size - 0.5 >= MIN_FIT_SIZE) {
    size = Math.round((size - 0.5) * 2) / 2;
    design = { ...design, fontSize: size };
    layout = measure(cv, fonts, design);
  }
  // 3. Narrower margins, never below 12 mm.
  let margin = marginPt(design);
  while (!done() && margin - 3 >= MIN_FIT_MARGIN_PT) {
    margin -= 3;
    design = { ...design, margin };
    layout = measure(cv, fonts, design);
  }
  if (!done() && margin > MIN_FIT_MARGIN_PT) {
    margin = MIN_FIT_MARGIN_PT;
    design = { ...design, margin };
    layout = measure(cv, fonts, design);
  }

  const changed = {
    spacing: design.density !== start.density,
    textPt: textPt(design) !== textPt(start) ? textPt(design) : null,
    marginMm: marginPt(design) !== marginPt(start) ? marginMm(design) : null,
  };
  if (done()) return { status: "fits", design, pages: layout.pages, changed, over: [] };

  const over: FitLine[] = [];
  for (const b of layout.blocks) {
    for (const l of b.lines) {
      if (l.page < target) continue;
      const text = l.runs.map((r) => r.text).join("").trim();
      if (text) over.push({ at: b.at, text, page: l.page + 1 });
    }
  }
  return { status: "over", design, pages: layout.pages, changed, over };
}

/** "Fits on 1 page: spacing tighter, text 10 pt." — from the actual changes. */
export function fitSummary(f: HonestFit, target: number): string {
  const pagesWord = target === 1 ? "1 page" : `${target} pages`;
  if (f.status === "already") return `Already fits on ${pagesWord}. Nothing was changed.`;
  const parts: string[] = [];
  if (f.changed.spacing) parts.push("spacing tighter");
  parts.push(f.changed.textPt != null ? `text ${f.changed.textPt} pt` : "text size unchanged");
  if (f.changed.marginMm != null) parts.push(`margins ${f.changed.marginMm} mm`);
  if (f.status === "fits") return `Fits on ${pagesWord}: ${parts.join(", ")}.`;
  const n = f.over.length;
  const next = target + 1;
  return n > 0 ? `${n} ${n === 1 ? "line still runs" : "lines still run"} onto page ${next}.` : `Some content still runs onto page ${next}.`;
}
