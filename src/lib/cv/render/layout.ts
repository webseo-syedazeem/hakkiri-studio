import type { CvDoc, Density, Locator } from "../schema";
import { type Flow, type FlowNode, buildFlow } from "./flow";
import { type FontKey, fontKey } from "./fonts";
import { BODY_SIZE, type Grid, HAIRLINE, INK, MUTED, type PaperStyle, paperStyle } from "./templates";
import type { Font } from "./ttf";

/**
 * Lays a CV out on pages: where every word sits, on which page. It works from
 * the font files' own measurements, so the preview on screen and the PDF break
 * every line in the same place and agree on the page count. Top to bottom, in
 * reading order; a v3 design may set short items beside the main text, or
 * headings and dates in a margin, but never changes the reading order. Text is
 * never cropped and never made smaller to fit: when a CV is too long, the
 * layout says which lines ran over.
 */

export type Fonts = Partial<Record<FontKey, Font>>;

export interface Run {
  text: string;
  font: FontKey;
  size: number;
  color: string;
  /** Distance from the left edge of the page, and the width, in points. */
  x: number;
  width: number;
  /** Extra space between letters, in points. */
  tracking: number;
  link?: string;
  /** For the contact line: which item this is. */
  item?: number;
}

export interface Line {
  page: number;
  /** The baseline, measured down from the top of the page. */
  baseline: number;
  top: number;
  height: number;
  runs: Run[];
}

export type Tag = "H1" | "H2" | "H3" | "P" | "LI";

export interface Block {
  /** Which piece of the CV this is (its place in the flow). */
  node: number;
  tag: Tag;
  kind: FlowNode["kind"];
  at: Locator;
  sectionId?: string;
  entryId?: string;
  lines: Line[];
  /** A bullet's mark, drawn beside its first line. */
  mark?: { text: string; font: FontKey; size: number; x: number; color: string };
}

/** A drawn line or bar: decoration only, never content. */
export interface Rule {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** Drawn before the text, behind it (a band of colour under the name). */
  under?: boolean;
}

export interface Layout {
  width: number;
  height: number;
  pages: number;
  blocks: Block[];
  rules: Rule[];
  /** Characters none of the fonts can draw. They are reported, not silently replaced. */
  missing: string[];
}

/** The font files a style needs. */
export function fontsNeeded(style: PaperStyle): FontKey[] {
  const { fonts, template } = style;
  return [...new Set([fontKey(fonts.body, 400), fontKey(fonts.body, 600), fontKey(fonts.title, template.title.weight), fontKey(fonts.heading, template.heading.weight, template.heading.italic)])];
}

export interface Piece {
  text: string;
  font: FontKey;
  size: number;
  color: string;
  tracking?: number;
  link?: string;
  item?: number;
  /** Keep this piece on one line (a phone number, an email address). */
  whole?: boolean;
  /** A separator between items: dropped at the start or end of a line. */
  separator?: boolean;
}

interface Atom {
  text: string;
  piece: number;
  width: number;
  /** There was a space before this word in the text. */
  spaced: boolean;
  separator?: boolean;
}

class Measurer {
  missing = new Set<string>();
  constructor(private fonts: Fonts) {}
  font(key: FontKey): Font {
    const f = this.fonts[key];
    if (!f) throw new Error(`The font ${key} has not been loaded.`);
    return f;
  }
  width(text: string, key: FontKey, size: number, tracking = 0): number {
    const f = this.font(key);
    let units = 0;
    let count = 0;
    for (const ch of text) {
      const g = f.glyph(ch.codePointAt(0)!);
      const lacking = g === 0 && !!ch.trim();
      if (lacking) this.missing.add(ch);
      // A character the font lacks is drawn on screen by whatever font the browser falls back to. It is given the
      // room such a character takes (a full square for Chinese, Japanese, Korean and emoji), so that in the preview
      // the characters of a name sit side by side and not on top of each other.
      units += lacking ? Math.max(f.advance(g), (ch.codePointAt(0)! >= 0x2e80 ? 1 : 0.6) * f.unitsPerEm) : f.advance(g);
      count++;
    }
    return (units / f.unitsPerEm) * size + tracking * count;
  }
}

/** Breaks styled text into lines no wider than `max`. Words are never split unless one is wider than the line. */
function wrap(pieces: Piece[], max: number, m: Measurer): Omit<Run, "x">[][] {
  const atoms: Atom[] = [];
  // A space at the end of one piece ("Tools: ") belongs before the first word of the next.
  let carried = false;
  pieces.forEach((p, pi) => {
    if (p.whole || p.separator) {
      let rest = p.text;
      // An item kept whole (a contact detail) that is wider than the line itself, such as a very long web address,
      // is broken where it has to be. Left whole it ran off the edge of the page and the end of it was lost.
      while (!p.separator && m.width(rest, p.font, p.size, p.tracking) > max && rest.length > 1) {
        let cut = rest.length - 1;
        while (cut > 1 && m.width(rest.slice(0, cut), p.font, p.size, p.tracking) > max) cut--;
        atoms.push({ text: rest.slice(0, cut), piece: pi, width: m.width(rest.slice(0, cut), p.font, p.size, p.tracking), spaced: false });
        rest = rest.slice(cut);
      }
      atoms.push({ text: rest, piece: pi, width: m.width(rest, p.font, p.size, p.tracking), spaced: false, separator: p.separator });
      carried = false;
      return;
    }
    const leading = /^\s/.test(p.text) || carried;
    carried = /\s$/.test(p.text);
    p.text.split(/\s+/).forEach((word, wi) => {
      if (!word) return;
      const spaced = wi > 0 || leading;
      let rest = word;
      // A word wider than the whole line (a long web address) is broken where it has to be.
      while (m.width(rest, p.font, p.size, p.tracking) > max && rest.length > 1) {
        let cut = rest.length - 1;
        while (cut > 1 && m.width(rest.slice(0, cut), p.font, p.size, p.tracking) > max) cut--;
        atoms.push({ text: rest.slice(0, cut), piece: pi, width: m.width(rest.slice(0, cut), p.font, p.size, p.tracking), spaced: spaced && rest === word });
        rest = rest.slice(cut);
      }
      atoms.push({ text: rest, piece: pi, width: m.width(rest, p.font, p.size, p.tracking), spaced: rest === word ? spaced : false });
    });
  });

  const lines: Atom[][] = [[]];
  let used = 0;
  for (const a of atoms) {
    const line = lines[lines.length - 1];
    const p = pieces[a.piece];
    const space = a.spaced && line.length ? m.width(" ", p.font, p.size, p.tracking) : 0;
    if (line.length && used + space + a.width > max + 0.01) {
      // A separator is not carried to the next line, nor left hanging at the end of this one.
      while (line.length && line[line.length - 1].separator) line.pop();
      if (a.separator) {
        lines.push([]);
        used = 0;
        continue;
      }
      lines.push([a]);
      used = a.width;
    } else {
      if (a.separator && !line.length) continue;
      line.push(a);
      used += space + a.width;
    }
  }
  for (const line of lines) while (line.length && line[line.length - 1].separator) line.pop();

  // Words from the same piece on the same line are written as one run, spaces included, so the file's text reads naturally.
  return lines
    .filter((l) => l.length)
    .map((line) => {
      const runs: Omit<Run, "x">[] = [];
      line.forEach((a, i) => {
        const p = pieces[a.piece];
        const last = runs[runs.length - 1];
        const gap = a.spaced && i > 0 ? " " : "";
        const prev = i > 0 ? pieces[line[i - 1].piece] : null;
        if (last && prev === p && !p.whole && !p.separator) last.text += gap + a.text;
        else {
          // A space between two differently styled pieces belongs to the earlier one.
          if (last && gap) last.text += gap;
          runs.push({ text: a.text, font: p.font, size: p.size, color: p.color, tracking: p.tracking ?? 0, link: p.link, item: p.item, width: 0 });
        }
      });
      for (const r of runs) r.width = m.width(r.text, r.font, r.size, r.tracking);
      return runs;
    });
}

/** What decoration a paragraph carries. It is drawn, not typed, and never counts as content. */
export type RuleSpec = { type: "title-below" | "contact-below" | "hairline-below" | "short-below" | "short-above" | "bar-before" | "band" | "header-below" | "name-bar"; color: string; /** For a header rule: its thickness and the space above it. For a name bar: its width. */ height?: number; gap?: number };

/**
 * One paragraph of the CV with everything about how it is set: its text and
 * fonts, its spacing, and what it must stay with. The page layout and the Word
 * file are both made from these, so they are set the same way.
 */
export interface ParaSpec {
  node: number;
  tag: Tag;
  kind: FlowNode["kind"];
  at: Locator;
  sectionId?: string;
  entryId?: string;
  pieces: Piece[];
  lineHeight: number;
  size: number;
  font: FontKey;
  align: "left" | "center" | "right";
  indent: number;
  before: number;
  after: number;
  keepWithNext: boolean;
  mark?: { text: string; font: FontKey; size: number; color: string };
  rule?: RuleSpec;
  /** For a bullet: how far its mark sits in from the margin (the entry's own indent). */
  markIndent?: number;
  /** Starts a new page. */
  pageBreak?: boolean;
  /** For a paragraph: dates and place, a line about the employer, or body text. */
  role?: "meta" | "context" | "body";
}

/** Describes each paragraph of a flow in a style. Needs no fonts: nothing is measured yet. */
export function describeFlow(flow: Flow, style: PaperStyle): ParaSpec[] {
  const { template: t, density: d, accent } = style;
  const bodySize = style.fontSize ?? BODY_SIZE;
  const lineSpacingFactor = style.lineSpacing ?? 1.0;
  const bulletIndent = style.indentation ?? 13;
  const body = fontKey(style.fonts.body, 400);
  const bold = fontKey(style.fonts.body, 600);
  const titleFont = fontKey(style.fonts.title, t.title.weight);
  const leading = t.leading ?? 1.38;
  const headFont = fontKey(style.fonts.heading, t.heading.weight, t.heading.italic);
  const entryIndent = style.entryIndent ?? 0;
  const band = style.header === "band";
  const specs: ParaSpec[] = [];
  const nodes = flow.nodes;
  // A header rule (v3) goes under the contact details, or under the name when there are none.
  const lastHeader = nodes.findLastIndex((n) => n.kind === "name" || n.kind === "contact");
  const headerRule = (i: number): Pick<ParaSpec, "rule" | "after"> | null => (t.headerRule && i === lastHeader ? { rule: { type: "header-below", color: accent, height: t.headerRule.height, gap: t.headerRule.gap }, after: t.headerRule.gap + t.headerRule.height + 13 } : null);

  nodes.forEach((n, i) => {
    const prev = nodes[i - 1];
    const next = nodes[i + 1];
    const base = { node: i, kind: n.kind, at: "at" in n ? n.at : { section: "contact" }, indent: 0, after: 0, align: "left" as const, pageBreak: flow.breaks?.includes(i) || undefined };
    if (n.kind === "name") {
      const size = t.title.size;
      specs.push({
        ...base,
        tag: "H1",
        pieces: [{ text: n.text, font: titleFont, size, color: band ? "#FFFFFF" : t.title.accent ? accent : (t.titleColor ?? INK), tracking: t.nameBar ? -0.035 * size : t.headerRule || t.topBar ? -0.025 * size : 0 }],
        lineHeight: size * (t.nameBar || t.headerRule || t.topBar ? 1.14 : 1.16),
        size,
        font: titleFont,
        align: t.title.align,
        indent: t.nameBar ? t.nameBar.inset : 0,
        before: 0,
        after: band ? 14 : t.title.ruleBelow ? 9 : 2,
        keepWithNext: true,
        rule: band ? { type: "band", color: accent } : t.title.ruleBelow ? { type: "title-below", color: accent } : t.nameBar ? { type: "name-bar", color: accent, height: t.nameBar.width } : undefined,
        ...headerRule(i),
      });
    } else if (n.kind === "contact") {
      const size = t.contact.tight ? 9.5 : 10;
      const pieces: Piece[] = [];
      n.items.forEach((item, k) => {
        if (k) pieces.push({ text: style.separator ?? " · ", font: body, size, color: MUTED, separator: true });
        pieces.push({ text: item.text, font: body, size, color: MUTED, link: item.link, item: k, whole: true });
      });
      specs.push({
        ...base,
        at: n.items[0]?.at ?? { section: "contact" },
        tag: "P",
        pieces,
        lineHeight: size * (t.contact.tight ? 1.3 : 1.45),
        size,
        font: body,
        align: t.contact.align,
        before: 3,
        after: t.contact.ruleBelow ? 8 : 0,
        keepWithNext: false,
        rule: t.contact.ruleBelow ? { type: "contact-below", color: HAIRLINE } : undefined,
        ...headerRule(i),
      });
    } else if (n.kind === "heading") {
      const h = t.heading;
      const size = h.size;
      const ruleColor = h.ruleAccent ? accent : (t.ruleColor ?? HAIRLINE);
      specs.push({
        ...base,
        tag: "H2",
        sectionId: n.sectionId,
        pieces: [{ text: h.caps ? n.text.toUpperCase() : n.text, font: headFont, size, color: h.accent ? accent : INK, tracking: (h.tracking ?? 0) * size }],
        lineHeight: size * 1.28,
        size,
        font: headFont,
        align: h.align,
        indent: h.rule === "bar-before" ? 9 : 0,
        before: t.space.section * d + (h.rule === "short-above" ? 5 : 0),
        after: (h.rule === "hairline-below" ? 6.5 : h.rule === "short-below" ? 8 : h.rule === "none" ? 3.5 : 4) * d,
        keepWithNext: true,
        rule: h.rule === "none" ? undefined : { type: h.rule, color: ruleColor },
      });
    } else if (n.kind === "entry") {
      specs.push({
        ...base,
        tag: "H3",
        sectionId: n.sectionId,
        entryId: n.entryId,
        pieces: n.runs.map((r) => ({ text: r.text, font: bold, size: bodySize, color: INK, link: r.link })),
        lineHeight: bodySize * leading * lineSpacingFactor,
        size: bodySize,
        font: bold,
        indent: entryIndent,
        before: prev?.kind === "heading" ? 0 : t.space.entry * d,
        keepWithNext: !!next && "entryId" in next && next.entryId === n.entryId,
      });
    } else if (n.kind === "para") {
      const meta = n.role === "meta";
      const size = meta ? Math.max(7, bodySize - 1) : bodySize;
      const sameEntryBefore = !!prev && "entryId" in prev && !!n.entryId && prev.entryId === n.entryId;
      const before = n.space !== undefined ? n.space * d : prev?.kind === "heading" ? 0 : sameEntryBefore ? (meta ? 1 : 2.5 * d) : prev?.kind === "para" && prev.role === "body" ? 3.5 * d : t.space.entry * d;
      specs.push({
        ...base,
        tag: "P",
        sectionId: n.sectionId,
        entryId: n.entryId,
        pieces: n.runs.map((r) => ({ text: r.text, font: r.bold ? bold : body, size, color: meta ? MUTED : INK, link: r.link })),
        lineHeight: size * leading * lineSpacingFactor,
        size,
        font: body,
        role: n.role,
        // The dates and the line about the employer sit under the entry they belong to.
        indent: n.role !== "body" && n.entryId ? entryIndent : 0,
        before,
        keepWithNext: n.keep ? !!next : n.role !== "body" && !!next && "entryId" in next && next.entryId === n.entryId,
      });
    } else {
      const sameEntryBefore = !!prev && "entryId" in prev && prev.entryId === n.entryId;
      const firstOfEntry = !(prev?.kind === "bullet" && sameEntryBefore);
      specs.push({
        ...base,
        tag: "LI",
        sectionId: n.sectionId,
        entryId: n.entryId,
        pieces: [{ text: n.text, font: body, size: bodySize, color: INK }],
        lineHeight: bodySize * leading * lineSpacingFactor,
        size: bodySize,
        font: body,
        indent: entryIndent + bulletIndent,
        markIndent: entryIndent,
        before: prev?.kind === "heading" ? 0 : !sameEntryBefore ? t.space.entry * d : firstOfEntry ? 3.5 * d : 2.2 * d,
        keepWithNext: false,
        mark: style.bullet === "" ? undefined : { text: style.bullet ?? "•", font: body, size: bodySize, color: INK },
      });
    }
  });
  return specs;
}

/** The width of a piece of text in a font, in points: the same sum the layout uses. */
export function textWidth(fonts: Fonts, key: FontKey, text: string, size: number, tracking = 0): number {
  return new Measurer(fonts).width(text, key, size, tracking);
}

/** Where a paragraph is set: its column, and for the side columns how it sits beside the text. */
interface Col {
  x: number;
  w: number;
  /** "head": a section heading in the margin beside its content. "gutter": a role's dates beside the role. "rail": short items beside the main text. */
  side?: "head" | "gutter" | "rail";
}

/**
 * Lays out a flow with a style. Every font the style needs must be loaded. A design with a rail of short items
 * (46, 47, 51) is set in two columns only when the whole CV then fits on one page; otherwise it is one column,
 * the short items after the main text, so that no page puts them ahead of text that comes before them.
 * Letters are always one column (`grid: false`).
 */
export function layoutFlow(flow: Flow, style: PaperStyle, fonts: Fonts, opts: { grid?: boolean } = {}): Layout {
  const grid = opts.grid === false ? undefined : style.template.grid;
  if (grid?.kind === "rail") {
    const two = layoutWith(flow, style, fonts, grid);
    if (two.pages === 1) return two;
    return layoutWith(flow, style, fonts, undefined);
  }
  return layoutWith(flow, style, fonts, grid);
}

function layoutWith(flow: Flow, style: PaperStyle, fonts: Fonts, grid: Grid | undefined): Layout {
  const m = new Measurer(fonts);
  const { page, template: t } = style;
  const left = page.marginX;
  const width = page.width - 2 * page.marginX;
  const specs = describeFlow(flow, style);
  const kindOf = (sectionId?: string) => (sectionId ? flow.kinds?.[sectionId] : undefined);
  const full: Col = { x: left, w: width };

  // Each paragraph's column.
  let cols: Col[] = specs.map(() => full);
  let colsStart = -1;
  if (grid?.kind === "rail") {
    const rx = grid.side === "right" ? left + width - grid.width : left;
    const edge = grid.line ? 1 : grid.outline ? 2 : 0;
    const rail: Col = { x: rx + (grid.line || grid.outline ? 1 : 0) + grid.padX, w: grid.width - edge - grid.padX * (grid.line ? 1 : 2), side: "rail" };
    const main: Col = { x: grid.side === "right" ? left : left + grid.width + grid.gap, w: width - grid.width - grid.gap };
    const framed = (s: ParaSpec) => !!t.frame && kindOf(s.sectionId) === "summary";
    cols = specs.map((s) => (s.kind === "name" || s.kind === "contact" || framed(s) ? full : grid.kinds.includes(kindOf(s.sectionId)!) ? rail : main));
    // Without short items there is no rail, and without main text nothing to sit beside: one column.
    if (!cols.some((c) => c.side === "rail") || !cols.some((c) => c === main)) cols = specs.map(() => full);
    else colsStart = cols.findIndex((c) => c === main || c === rail);
  } else if (grid?.kind === "margin-heads") {
    const head: Col = { x: left, w: grid.width, side: "head" };
    const content: Col = { x: left + grid.width + grid.gap, w: width - grid.width - grid.gap };
    cols = specs.map((s) => (s.kind === "name" || s.kind === "contact" ? full : s.kind === "heading" ? head : content));
  } else if (grid?.kind === "date-gutter") {
    const entries = new Set(specs.filter((s) => s.kind === "entry" && s.entryId).map((s) => s.entryId!));
    // A date line with a web address stays with the role: an address is never broken to fit the narrow gutter.
    const dated = new Set(specs.filter((s) => s.kind === "para" && s.role === "meta" && s.entryId && entries.has(s.entryId) && !s.pieces.some((p) => p.link)).map((s) => s.entryId!));
    const gutter: Col = { x: left, w: grid.width - 1 - 9, side: "gutter" };
    const content: Col = { x: left + grid.width + grid.gap, w: width - grid.width - grid.gap };
    cols = specs.map((s) => (s.entryId && dated.has(s.entryId) ? (s.kind === "para" && s.role === "meta" ? gutter : content) : full));
  }
  // The framed profile (51): inside a thin outline, its heading without a rule.
  if (t.frame)
    specs.forEach((s, i) => {
      if (kindOf(s.sectionId) !== "summary") return;
      cols[i] = { x: left + 1 + t.frame!.padX, w: width - 2 - 2 * t.frame!.padX };
      if (s.kind === "heading") s.rule = undefined;
    });

  let drafts = specs.map((spec, i) => ({ ...spec, col: cols[i], lines: wrap(spec.pieces, cols[i].w - spec.indent, m) }));
  // A margin heading that needs two lines is set above its section instead: beside it, its second line would be read with the content's.
  drafts = drafts.map((d) => (d.col.side === "head" && d.lines.length > 1 ? { ...d, col: full, lines: wrap(d.pieces, width - d.indent, m) } : d));

  /** Where a paragraph's decoration is drawn. */
  const drawRule = (r: RuleSpec, b: (typeof drafts)[number], pg: number, topY: number, bottomY: number, baseline: number, textX: number): Rule => {
    const { x: cx, w: cw } = b.col;
    // A band of colour from the top edge of the page to just below the name, behind it.
    if (r.type === "band") return { page: pg, x: 0, y: 0, width: page.width, height: bottomY + 10, color: r.color, under: true };
    if (r.type === "header-below") return { page: pg, x: left, y: bottomY + (r.gap ?? 6), width, height: r.height ?? 1, color: r.color };
    if (r.type === "name-bar") return { page: pg, x: left, y: topY + 2, width: r.height ?? 4, height: bottomY - topY - 4, color: r.color };
    if (r.type === "title-below") return { page: pg, x: cx, y: bottomY + 5, width: cw, height: 1.4, color: r.color };
    if (r.type === "contact-below") return { page: pg, x: cx, y: bottomY + 6, width: cw, height: 0.7, color: r.color };
    if (r.type === "hairline-below") return { page: pg, x: cx, y: bottomY + 2.2, width: cw, height: 0.6, color: r.color };
    if (r.type === "short-below") return { page: pg, x: b.align === "center" ? cx + cw / 2 - 15 : textX, y: bottomY + 3, width: 30, height: 1.3, color: r.color };
    if (r.type === "short-above") return { page: pg, x: textX, y: topY - 4.5, width: 26, height: 1.7, color: r.color };
    return { page: pg, x: cx, y: baseline - b.size * 0.74, width: 3.2, height: b.size * 0.78, color: r.color };
  };

  /** A horizontal line as dashes or dots, when the person chose them. Bars and bands are always solid. */
  const dashed = (r: Rule): Rule[] => {
    if (style.dash === "solid" || r.under || r.height > 2.5 || r.width < 12) return [r];
    const [on, off] = style.dash === "dashed" ? [4, 2.5] : [Math.max(1, r.height * 1.4), 2];
    const out: Rule[] = [];
    for (let x = r.x; x < r.x + r.width - 0.5; x += on + off) out.push({ ...r, x, width: Math.min(on, r.x + r.width - x) });
    return out;
  };
  /** The four sides of a thin outline. */
  const outline = (pg: number, x: number, y: number, w: number, h: number, color: string, weight = 1): Rule[] => [
    { page: pg, x, y, width: w, height: weight, color },
    { page: pg, x, y: y + h - weight, width: w, height: weight, color },
    { page: pg, x, y, width: weight, height: h, color },
    { page: pg, x: x + w - weight, y, width: weight, height: h, color },
  ];

  // Place the lines on pages. A heading stays with what follows it; an entry's first line stays with its dates and first bullet.
  const top = page.marginY;
  const bottom = page.height - page.marginY;
  const blocks: Block[] = [];
  const rules: Rule[] = [];
  let pg = 0;
  let y = top;
  let lastPage = 0;
  const metrics = (key: FontKey, size: number) => {
    const f = m.font(key);
    return { asc: (f.ascent / f.unitsPerEm) * size, desc: (-f.descent / f.unitsPerEm) * size };
  };
  // A bar across the top of the first page (47).
  if (t.topBar && drafts.length && !drafts[0].pageBreak) {
    rules.push({ page: 0, x: left, y: top, width, height: t.topBar.height, color: style.accent });
    y = top + t.topBar.height + t.topBar.gap;
  }
  /** Text set beside the main text (a margin heading, a role's dates) ends here: what follows starts below it. */
  let beside: { pg: number; y: number } | null = null;
  const clearBeside = () => {
    if (beside && beside.pg === pg) y = Math.max(y, beside.y);
    beside = null;
  };
  /** The role being set beside its dates (52): where it started, for the dates and the gutter's rule. */
  let role: { id: string; pg: number; top: number } | null = null;
  const closeRole = () => {
    if (!role || grid?.kind !== "date-gutter") return (role = null);
    const end = beside && beside.pg === pg ? Math.max(y, beside.y) : y;
    const x = left + grid.width - 1;
    if (role.pg === pg) rules.push({ page: pg, x, y: role.top, width: 1, height: Math.max(0, end - role.top), color: grid.rule });
    else {
      rules.push({ page: role.pg, x, y: role.top, width: 1, height: Math.max(0, bottom - role.top), color: grid.rule });
      rules.push({ page: pg, x, y: top, width: 1, height: Math.max(0, end - top), color: grid.rule });
    }
    role = null;
  };
  // The rail (46, 47, 51): where the columns start, and where the main text ended.
  let columnsTop: { pg: number; y: number } | null = null;
  let railFrom: { pg: number; y: number } | null = null;
  let frameFrom: { pg: number; y: number } | null = null;
  const framed = (d: (typeof drafts)[number]) => !!t.frame && kindOf(d.sectionId) === "summary";
  let skipBefore = false;

  for (let i = 0; i < drafts.length; ) {
    // The run of pieces that must start on the same page.
    let end = i;
    while (drafts[end].keepWithNext && end + 1 < drafts.length && !drafts[end + 1].pageBreak) end++;
    // A piece that starts a new page (the CV after a cover letter).
    if (drafts[i].pageBreak && blocks.length) {
      pg++;
      y = top;
    }
    // The short items start beside the main text, at the top of the columns.
    if (drafts[i].col.side === "rail" && !railFrom && columnsTop && grid?.kind === "rail") {
      railFrom = { pg, y };
      pg = columnsTop.pg;
      y = columnsTop.y + grid.padY;
    }
    let need = 0;
    for (let k = i; k <= end; k++) {
      const b = drafts[k];
      const first = k === i && y === top;
      // Text set beside other text takes no height of its own: a margin heading only its section's rule and space.
      if (b.col.side === "head") {
        need += (first ? 0 : b.before) + 7.75;
        continue;
      }
      if (b.col.side === "gutter") continue;
      // Of the last piece, only its first lines must fit (two, or all of a short one).
      const lines = k === end && b.lines.length > 3 ? 2 : b.lines.length;
      need += (first ? 0 : b.before) + lines * b.lineHeight + (k === end ? 0 : b.after);
    }
    if (y > top && y + need > bottom + 0.01) {
      closeRole();
      beside = null;
      pg++;
      y = top;
    }
    for (let k = i; k <= end; k++) {
      const b = drafts[k];
      const prev = drafts[k - 1];
      // Leaving a role, a section or the profile's frame.
      if (role && b.entryId !== role.id) closeRole();
      if (b.col.side !== "gutter" && (b.kind === "heading" || b.col === full || (grid?.kind === "date-gutter" && b.kind === "entry"))) clearBeside();
      if (frameFrom && !framed(b)) {
        rules.push(...outline(frameFrom.pg, left, frameFrom.y, width, y + t.frame!.padY - frameFrom.y, t.frame!.color));
        // 12 pt below the frame; the section after it adds no space of its own.
        y += t.frame!.padY + 12;
        frameFrom = null;
        skipBefore = true;
      }
      if (colsStart === k && !columnsTop) columnsTop = { pg, y };
      let resume = -1;
      if (framed(b) && !frameFrom && b.kind === "heading") {
        if (y > top) y += b.before;
        frameFrom = { pg, y };
        y += 1 + t.frame!.padY;
      } else if (b.col.side === "gutter" && role && role.pg === pg) {
        // A role's dates: beside the role, from its first line; the role's own text goes on from where it was.
        resume = y;
        y = role.top;
      } else if (skipBefore) skipBefore = false;
      else if (y > top && !(prev?.col.side === "head" && b.col !== full)) y += b.before;
      // 49: every section starts with a thin rule across the page; its heading sits in the margin beside its first line.
      if (grid?.kind === "margin-heads" && b.kind === "heading") {
        rules.push({ page: pg, x: left, y, width, height: 0.75, color: grid.rule });
        y += 0.75 + 7;
      }
      // 52: every dated role starts with a rule across the page.
      if (grid?.kind === "date-gutter" && b.kind === "entry" && drafts.some((d) => d.entryId === b.entryId && d.col.side === "gutter")) {
        rules.push({ page: pg, x: left, y, width, height: 1, color: grid.rule });
        y += 1 + 8;
        role = { id: b.entryId!, pg, top: y };
      }
      const startY = y;
      const startPg = pg;
      const { asc, desc } = metrics(b.font, b.size);
      const placed: Line[] = [];
      const splittable = b.lines.length > 3 && !b.col.side;
      b.lines.forEach((runs, li) => {
        // Move to a new page when the line will not fit; never leave one line of a long paragraph alone.
        const remaining = b.lines.length - li;
        const wants = splittable && remaining === 2 && li > 0 ? 2 * b.lineHeight : b.lineHeight;
        if (y > top && y + wants > bottom + 0.01 && (splittable ? li !== 1 : li === 0)) {
          pg++;
          y = top;
        } else if (y + b.lineHeight > bottom + 0.01 && y > top) {
          pg++;
          y = top;
        }
        const lineWidth = runs.reduce((w, r) => w + r.width, 0);
        const room = b.col.w - b.indent;
        const x0 = b.col.x + b.indent + (b.align === "center" ? (room - lineWidth) / 2 : b.align === "right" ? room - lineWidth : 0);
        let x = x0;
        const baseline = y + (b.lineHeight - (asc + desc)) / 2 + asc;
        placed.push({
          page: pg,
          top: y,
          height: b.lineHeight,
          baseline,
          runs: runs.map((r) => {
            const run = { ...r, x };
            x += r.width;
            return run;
          }),
        });
        y += b.lineHeight;
      });
      lastPage = Math.max(lastPage, pg);
      const first = placed[0];
      const last = placed[placed.length - 1];
      if (b.rule && first) rules.push(...dashed(drawRule(b.rule, b, last.page, first.top, last.top + last.height, first.baseline, first.runs[0]?.x ?? left)));
      blocks.push({ node: b.node, tag: b.tag, kind: b.kind, at: b.at, sectionId: b.sectionId, entryId: b.entryId, lines: placed, mark: b.mark ? { ...b.mark, x: b.col.x + (b.markIndent ?? 0) + 2.5 } : undefined });
      if (b.col.side === "head" && pg === startPg) {
        // The section's content starts level with its heading.
        beside = { pg, y };
        y = startY;
      } else if (resume >= 0 && pg === startPg) {
        beside = { pg, y };
        y = resume;
      } else y += b.after;
    }
    i = end + 1;
  }
  closeRole();
  clearBeside();
  if (frameFrom) {
    rules.push(...outline(frameFrom.pg, left, frameFrom.y, width, y + t.frame!.padY - frameFrom.y, t.frame!.color));
    y += t.frame!.padY;
  }
  // The rail's own line, fill or outline, from the top of the columns to the end of its short items.
  if (grid?.kind === "rail" && columnsTop && railFrom) {
    const rx = grid.side === "right" ? left + width - grid.width : left;
    const h = y + grid.padY - columnsTop.y;
    if (grid.fill) rules.push({ page: columnsTop.pg, x: rx, y: columnsTop.y, width: grid.width, height: h, color: grid.fill, under: true });
    if (grid.line) rules.push({ page: columnsTop.pg, x: rx, y: columnsTop.y, width: 1, height: h, color: grid.line });
    if (grid.outline) rules.push(...outline(columnsTop.pg, rx, columnsTop.y, grid.width, h, grid.outline));
  }

  return { width: page.width, height: page.height, pages: blocks.length ? lastPage + 1 : 1, blocks, rules, missing: [...m.missing] };
}

export type Printable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target">;

/** The whole way from a CV to its pages. */
export function layoutCv(cv: Printable, fonts: Fonts): { flow: Flow; layout: Layout; style: PaperStyle } {
  const style = paperStyle(cv.design);
  const flow = buildFlow(cv, style.template);
  return { flow, layout: layoutFlow(flow, style, fonts), style };
}

export interface Fit {
  /** The spacing that was chosen. */
  density: Density;
  pages: number;
  /** False when even the tightest spacing runs past the page target. */
  fits: boolean;
  /** When it does not fit: the pieces that ran onto the page after the target, for the person to shorten or switch off. */
  over: { at: Locator; text: string }[];
}

/**
 * Fits a CV to whole pages: the loosest spacing that keeps it within the page
 * target. Only spacing changes. If the tightest spacing still runs over, the
 * CV is not shrunk or cropped: the lines that ran over are returned instead.
 */
export function fitToPages(cv: Printable, fonts: Fonts, target: number = cv.design.pageTarget): Fit {
  let tightest: { layout: Layout; flow: Flow } | null = null;
  for (const density of ["looser", "default", "tighter"] as const) {
    const { layout, flow } = layoutCv({ ...cv, design: { ...cv.design, density } }, fonts);
    if (layout.pages <= target) return { density, pages: layout.pages, fits: true, over: [] };
    tightest = { layout, flow };
  }
  const { layout } = tightest!;
  const over = layout.blocks
    .filter((b) => b.lines.some((l) => l.page >= target))
    .map((b) => ({ at: b.at, text: b.lines.map((l) => l.runs.map((r) => r.text).join("")).join(" ") }));
  return { density: "tighter", pages: layout.pages, fits: false, over };
}
