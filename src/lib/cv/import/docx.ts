import JSZip from "jszip";
import { ImportError } from "./errors";
import type { ExtractedFile } from "./pdf";
import { type DocLine, cleanText, makeLine, splitBullet } from "./lines";

/**
 * Reads the text of a Word (.docx) file with what Word knows about each
 * paragraph: its heading style, whether it is a list item, whether it is bold,
 * its size, its tab stops, and the rows of any table. Text in the page header
 * (where some CVs keep the name and contact details) and in text boxes is read
 * too. Nothing is recognised here; the lines go on to the CV reader.
 */

/** The most one part of the file may unpack to, and the most all the parts read may unpack to together. */
const MAX_XML = 12 * 1024 * 1024;
const MAX_UNPACKED = 24 * 1024 * 1024;
/** The most elements one part may hold, and how deeply they may nest. A long CV has a few thousand, a dozen deep. */
const MAX_NODES = 400_000;
const MAX_DEPTH = 200;
/** Page headers read for the name and contact details. A CV has one or two. */
const MAX_HEADERS = 8;

/* ----------------------------------------------------------- a small XML reader */

interface Node {
  name: string;
  attrs: Record<string, string>;
  children: Node[];
  text: string;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ENTITIES[e] ?? m;
  });

/** One element's tag, read from where it starts. */
const TAG = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/y;

/**
 * Parses the XML Word writes. It only needs elements, attributes and text;
 * comments and declarations are skipped.
 *
 * The text is walked once, from each "<" to the next. A comment, a
 * declaration or a CDATA block is found by looking for its end mark, so a
 * file of thousands of comments that never close costs one look, not one look
 * each. A file with more elements than any CV has, or nested deeper, is
 * refused; so is one with a DOCTYPE, which Word never writes.
 */
export function parseXml(xml: string): Node {
  const root: Node = { name: "#root", attrs: {}, children: [], text: "" };
  const stack: Node[] = [root];
  let nodes = 0;
  let last = 0;
  let at = 0;
  /** Text between the last tag and here belongs to the element that is open. */
  const textUpTo = (to: number) => {
    if (to > last) stack[stack.length - 1].text += decode(xml.slice(last, to));
  };
  for (;;) {
    const lt = xml.indexOf("<", at);
    if (lt === -1) break;
    // Things that are skipped whole, each found by its end mark.
    const skipped = xml.startsWith("<!--", lt) ? "-->" : xml.startsWith("<![CDATA[", lt) ? "]]>" : xml.startsWith("<?", lt) ? "?>" : "";
    if (skipped) {
      const end = xml.indexOf(skipped, lt + 2);
      textUpTo(lt);
      // One that never ends takes the rest of the file with it: there is nothing after it to read.
      if (end === -1) {
        last = xml.length;
        break;
      }
      if (skipped === "]]>") stack[stack.length - 1].text += xml.slice(lt + 9, end);
      last = at = end + skipped.length;
      continue;
    }
    if (xml.startsWith("<!DOCTYPE", lt)) throw new ImportError("unreadable", "The Word file is not written the way Word writes one.");
    TAG.lastIndex = lt;
    const m = TAG.exec(xml);
    if (!m) {
      // Not a tag: the "<" is part of the text.
      at = lt + 1;
      continue;
    }
    textUpTo(lt);
    last = at = TAG.lastIndex;
    if (m[1]) {
      // A closing tag: unwind to the element it closes.
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].name === m[2]) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (++nodes > MAX_NODES) throw new ImportError("too-much", "The Word file has far more in it than a CV.");
    const node: Node = { name: m[2], attrs: {}, children: [], text: "" };
    if (m[3]) for (const a of m[3].matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) node.attrs[a[1]] = decode(a[2] ?? a[3] ?? "");
    stack[stack.length - 1].children.push(node);
    if (!m[4]) {
      if (stack.length > MAX_DEPTH) throw new ImportError("unreadable", "The Word file is nested more deeply than Word writes.");
      stack.push(node);
    }
  }
  textUpTo(xml.length);
  return root;
}

const child = (n: Node | undefined, name: string) => n?.children.find((c) => c.name === name);
const on = (n: Node | undefined) => !!n && n.attrs["w:val"] !== "0" && n.attrs["w:val"] !== "false" && n.attrs["w:val"] !== "none";

/* --------------------------------------------------------------------- styles */

interface Style {
  name: string;
  basedOn?: string;
  bold?: boolean;
  size?: number;
  list?: boolean;
  outline?: number;
}

function readStyles(xml: string | undefined): { styles: Map<string, Style>; defaultSize: number } {
  const styles = new Map<string, Style>();
  let defaultSize = 11;
  if (!xml) return { styles, defaultSize };
  const root = child(parseXml(xml), "w:styles");
  const defaults = child(child(child(root, "w:docDefaults"), "w:rPrDefault"), "w:rPr");
  const sz = child(defaults, "w:sz")?.attrs["w:val"];
  if (sz) defaultSize = Number(sz) / 2;
  for (const s of root?.children ?? []) {
    if (s.name !== "w:style") continue;
    const rPr = child(s, "w:rPr");
    const pPr = child(s, "w:pPr");
    const b = child(rPr, "w:b");
    const size = child(rPr, "w:sz")?.attrs["w:val"];
    const outline = child(pPr, "w:outlineLvl")?.attrs["w:val"];
    styles.set(s.attrs["w:styleId"] ?? "", {
      name: child(s, "w:name")?.attrs["w:val"] ?? "",
      basedOn: child(s, "w:basedOn")?.attrs["w:val"],
      bold: b ? on(b) : undefined,
      size: size ? Number(size) / 2 : undefined,
      list: child(pPr, "w:numPr") ? true : undefined,
      outline: outline !== undefined ? Number(outline) : undefined,
    });
  }
  return { styles, defaultSize };
}

/** A style with what it inherits filled in. */
function resolve(styles: Map<string, Style>, id: string | undefined): Style {
  const out: Style = { name: "" };
  const seen = new Set<string>();
  for (let cur = id; cur && !seen.has(cur); ) {
    seen.add(cur);
    const s = styles.get(cur);
    if (!s) break;
    out.name ||= s.name;
    out.bold ??= s.bold;
    out.size ??= s.size;
    out.list ??= s.list;
    out.outline ??= s.outline;
    cur = s.basedOn;
  }
  return out;
}

/* ------------------------------------------------------------------ paragraphs */

interface Ctx {
  styles: Map<string, Style>;
  defaultSize: number;
  links: Map<string, string>;
  out: DocLine[];
  col: number;
  /** Reading back a file this app wrote: the text is kept exactly, with no list marks taken off. */
  raw?: boolean;
}

interface RunText {
  text: string;
  bold: boolean;
  size: number;
}

/** The text of everything inside a paragraph, run by run. Text boxes anchored in it are read as paragraphs of their own. */
function runs(node: Node, ctx: Ctx, style: Style, links: string[], out: RunText[] = []): RunText[] {
  for (const c of node.children) {
    switch (c.name) {
      case "w:r": {
        const rPr = child(c, "w:rPr");
        const rStyle = resolve(ctx.styles, child(rPr, "w:rStyle")?.attrs["w:val"]);
        const b = child(rPr, "w:b");
        const bold = b ? on(b) : (rStyle.bold ?? style.bold ?? false);
        const sz = child(rPr, "w:sz")?.attrs["w:val"];
        const size = sz ? Number(sz) / 2 : (rStyle.size ?? style.size ?? ctx.defaultSize);
        const caps = on(child(rPr, "w:caps"));
        let text = "";
        for (const t of c.children) {
          if (t.name === "w:t") text += t.text;
          else if (t.name === "w:tab" || t.name === "w:ptab") text += "\t";
          else if (t.name === "w:br" || t.name === "w:cr") text += t.attrs["w:type"] === "page" ? "" : "\n";
          else if (t.name === "w:noBreakHyphen") text += "-";
          else if (t.name === "w:sym") text += "•";
          else if (t.name === "mc:AlternateContent" || t.name === "w:drawing" || t.name === "w:pict") textBoxes(t, ctx);
        }
        if (text) out.push({ text: caps ? text.toUpperCase() : text, bold, size });
        break;
      }
      case "w:hyperlink": {
        const target = ctx.links.get(c.attrs["r:id"] ?? "");
        if (target) links.push(target);
        runs(c, ctx, style, links, out);
        break;
      }
      case "w:ins":
      case "w:smartTag":
      case "w:fldSimple":
      case "w:customXml":
      case "w:dir":
      case "w:bdo":
        runs(c, ctx, style, links, out);
        break;
      case "w:sdt":
        runs(child(c, "w:sdtContent") ?? c, ctx, style, links, out);
        break;
      case "mc:AlternateContent":
        textBoxes(c, ctx);
        break;
      default:
        break; // w:pPr, w:del (deleted text), bookmarks, proofing marks
    }
  }
  return out;
}

/** Text boxes: Word stores each twice (a modern form and a fallback). Read the first only. */
function textBoxes(node: Node, ctx: Ctx) {
  if (node.name === "mc:AlternateContent") {
    const pick = child(node, "mc:Choice") ?? child(node, "mc:Fallback");
    if (pick) textBoxes(pick, ctx);
    return;
  }
  for (const c of node.children) {
    if (c.name === "w:txbxContent") blocks(c, ctx);
    else textBoxes(c, ctx);
  }
}

function paragraph(p: Node, ctx: Ctx): DocLine[] {
  const pPr = child(p, "w:pPr");
  const style = resolve(ctx.styles, child(pPr, "w:pStyle")?.attrs["w:val"]);
  const links: string[] = [];
  const parts = runs(p, ctx, style, links);
  const whole = parts.map((r) => r.text).join("");
  if (!whole.trim()) return [];

  const numPr = child(pPr, "w:numPr");
  const numbered = numPr ? child(numPr, "w:numId")?.attrs["w:val"] !== "0" : !!style.list;
  const listStyle = /^list (?:bullet|number|paragraph)|^bullet/i.test(style.name);
  const headingName = style.name.match(/^heading (\d)/i);
  const outline = child(pPr, "w:outlineLvl")?.attrs["w:val"];
  const heading = headingName ? Number(headingName[1]) : outline !== undefined && Number(outline) < 9 ? Number(outline) + 1 : style.outline !== undefined && style.outline < 9 ? style.outline + 1 : 0;
  const visible = parts.filter((r) => r.text.trim());
  const bold = visible.length > 0 && visible.every((r) => r.bold);
  const sizes = new Map<number, number>();
  for (const r of visible) sizes.set(r.size, (sizes.get(r.size) ?? 0) + r.text.trim().length);
  const size = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ctx.defaultSize;
  const ind = child(pPr, "w:ind");
  const indent = Math.max(0, Math.round(Number(ind?.attrs["w:left"] ?? ind?.attrs["w:start"] ?? 0) / 20));

  // A line break inside a paragraph (Shift+Enter) is a new line of the CV.
  return whole
    .split("\n")
    .map((raw, i) => {
      const cleaned = cleanText(raw.replace(/^\t+|\t+$/g, ""));
      if (!cleaned) return null;
      const mark = ctx.raw ? { bullet: false, text: cleaned } : splitBullet(cleaned);
      const text = mark.bullet ? mark.text.replace(/^\t+/, "") : cleaned;
      if (!text) return null;
      return makeLine(text, { bullet: mark.bullet || ((numbered || (listStyle && !!numPr)) && !heading), bold, size, heading, indent, links: i === 0 ? links : [], page: 1, col: ctx.col });
    })
    .filter((l): l is DocLine => l !== null);
}

/** A table row. Short single-paragraph cells become one line with gaps between them; cells with more go one after another. */
function tableRow(tr: Node, ctx: Ctx) {
  const cells = tr.children.filter((c) => c.name === "w:tc" || c.name === "w:sdt").map((c) => (c.name === "w:sdt" ? (child(child(c, "w:sdtContent"), "w:tc") ?? c) : c));
  const contents = cells.map((tc) => {
    const inner: Ctx = { ...ctx, out: [] };
    blocks(tc, inner);
    return inner.out;
  });
  const filled = contents.filter((c) => c.length);
  if (!filled.length) return;
  if (filled.every((c) => c.length === 1)) {
    const first = filled[0][0];
    ctx.out.push({ ...first, text: filled.map((c) => c[0].text).join("\t"), bold: filled.every((c) => c[0].bold), bullet: filled.length === 1 && first.bullet, links: filled.flatMap((c) => c[0].links) });
    return;
  }
  // A narrow first cell (dates, a label) beside a fuller one: put it on the first line of its neighbour.
  if (filled.length === 2 && filled[0].length === 1 && filled[0][0].text.length <= 40 && !filled[1][0].bullet) {
    const [side, main] = filled;
    ctx.out.push({ ...main[0], text: `${main[0].text}\t${side[0].text}` }, ...main.slice(1));
    return;
  }
  for (const c of filled) ctx.out.push(...c);
}

function blocks(parent: Node, ctx: Ctx) {
  for (const c of parent.children) {
    if (c.name === "w:p") ctx.out.push(...paragraph(c, ctx));
    else if (c.name === "w:tbl") {
      for (const tr of c.children) {
        if (tr.name === "w:tr") tableRow(tr, ctx);
        else if (tr.name === "w:sdt") blocks(child(tr, "w:sdtContent") ?? tr, ctx);
      }
    } else if (c.name === "w:sdt") blocks(child(c, "w:sdtContent") ?? c, ctx);
    else if (c.name === "w:tr") tableRow(c, ctx);
    else if (c.name === "w:customXml" || c.name === "w:ins" || c.name === "w:smartTag") blocks(c, ctx);
  }
}

/* ------------------------------------------------------------------- the file */

interface Unpacking {
  on(event: "data", cb: (chunk: Uint8Array) => void): Unpacking;
  on(event: "error", cb: (err: Error) => void): Unpacking;
  on(event: "end", cb: () => void): Unpacking;
  resume(): Unpacking;
  pause(): Unpacking;
}

/**
 * Reads one part of the file as text. The size the file gives for a part is
 * not trusted, because it can be made to lie: the bytes are counted as they
 * are unpacked, and unpacking stops the moment a part, or all the parts
 * together, grow past what a CV could need.
 */
async function read(zip: JSZip, path: string, budget: { left: number }): Promise<string | undefined> {
  const f = zip.file(path);
  if (!f) return undefined;
  const said = (f as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
  const cap = Math.min(MAX_XML, budget.left);
  if (said > cap) throw new ImportError("too-much", "The Word file is too large inside.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  await new Promise<void>((resolve, reject) => {
    const stream = (f as unknown as { internalStream(type: "uint8array"): Unpacking }).internalStream("uint8array");
    stream
      .on("data", (chunk) => {
        size += chunk.length;
        if (size > cap) {
          stream.pause();
          reject(new ImportError("too-much", "The Word file is too large inside."));
        } else chunks.push(chunk);
      })
      .on("error", () => reject(new ImportError("unreadable", "The Word file could not be unpacked.")))
      .on("end", () => resolve())
      .resume();
  });
  budget.left -= size;
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  return new TextDecoder("utf-8").decode(bytes);
}

function relationships(xml: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!xml) return map;
  for (const r of child(parseXml(xml), "Relationships")?.children ?? []) {
    if (r.attrs.TargetMode === "External" && r.attrs.Id && r.attrs.Target) map.set(r.attrs.Id, r.attrs.Target);
  }
  return map;
}

/** Reads a .docx file into lines. Throws an ImportError with a plain reason when the file cannot be read. */
export async function extractDocx(bytes: Uint8Array, opts: { /** Read the text exactly as written: used only to read back a file this app has just made. */ raw?: boolean } = {}): Promise<ExtractedFile> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new ImportError("unreadable", "The Word file could not be opened.");
  }
  if (Object.keys(zip.files).length > 3000) throw new ImportError("unreadable", "The Word file has too many parts.");
  const budget = { left: MAX_UNPACKED };
  const documentXml = await read(zip, "word/document.xml", budget);
  if (!documentXml) throw new ImportError(zip.file("content.xml") || zip.file("index.xml") || zip.file("Index/Document.iwa") ? "old-word" : "unreadable", "The file is not a Word (.docx) document.");

  const { styles, defaultSize } = readStyles(await read(zip, "word/styles.xml", budget));
  const ctx: Ctx = { styles, defaultSize, links: relationships(await read(zip, "word/_rels/document.xml.rels", budget)), out: [], col: 0, raw: opts.raw };
  const body = child(child(parseXml(documentXml), "w:document"), "w:body");
  if (!body) throw new ImportError("unreadable", "The Word file has no text in it.");
  blocks(body, ctx);

  // The page header often holds the name and contact details. Read it first, once.
  const header: DocLine[] = [];
  const seen = new Set(ctx.out.map((l) => l.text));
  for (const path of Object.keys(zip.files).filter((p) => /^word\/header\d*\.xml$/.test(p)).sort().slice(0, MAX_HEADERS)) {
    const xml = await read(zip, path, budget);
    const hdr = xml ? child(parseXml(xml), "w:hdr") : undefined;
    if (!hdr) continue;
    const hctx: Ctx = { ...ctx, links: relationships(await read(zip, path.replace("word/", "word/_rels/") + ".rels", budget)), out: [] };
    blocks(hdr, hctx);
    for (const l of hctx.out) {
      if (seen.has(l.text) || /^(?:page\s*)?\d*$/i.test(l.text)) continue;
      seen.add(l.text);
      header.push(l);
    }
  }
  const lines = [...header, ...ctx.out];
  if (!opts.raw && lines.reduce((n, l) => n + l.text.length, 0) < 40) throw new ImportError("empty", "The Word file has almost no text.");

  let pages = 0;
  const app = await read(zip, "docProps/app.xml", budget);
  const m = app?.match(/<Pages>(\d+)<\/Pages>/);
  if (m) pages = Math.min(100, Number(m[1]));
  return { lines, pages };
}
