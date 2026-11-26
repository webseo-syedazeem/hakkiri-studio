import { deflateSync } from "node:zlib";
import type { Flow } from "./flow";
import { FONT_FILES, type FontKey } from "./fonts";
import type { Block, Fonts, Layout, Run } from "./layout";
import { subsetFont } from "./ttf";

/**
 * Writes a laid-out CV as a PDF. The file holds real text (not pictures of
 * text) in embedded fonts, each glyph mapped back to its character, so the
 * words can be selected, searched and read by software. It is tagged: the
 * name is a level-1 heading, each section a level-2 heading inside its own
 * section, entries are level-3 headings, bullets are list items, links are
 * links, and drawn lines are marked as decoration. The tag order is the
 * reading order.
 *
 * Its details say only what the file is: a title, a language, "Hakkiri" as
 * the tool that made it and the time. No author, subject, keywords or ids.
 */

export const PDF_PRODUCER = "Hakkiri CV renderer 1";

export interface PdfInfo {
  title: string;
  /** "en-GB" or "en-US". */
  lang: string;
  created: Date;
}

/* ----------------------------------------------------------------- low level */

const enc = new TextEncoder();
const num = (n: number) => (Math.round(n * 1000) / 1000).toString();
const isAscii = (s: string) => /^[\x20-\x7e]*$/.test(s);

/** A PDF string: plain where it can be, UTF-16 otherwise. */
function str(s: string): string {
  if (isAscii(s)) return `(${s.replace(/[\\()]/g, "\\$&")})`;
  let hex = "FEFF";
  for (let i = 0; i < s.length; i++) hex += s.charCodeAt(i).toString(16).padStart(4, "0").toUpperCase();
  return `<${hex}>`;
}

const pdfDate = (d: Date) => `D:${d.toISOString().replace(/[-:T]/g, "").slice(0, 14)}Z`;

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${num(((n >> 16) & 255) / 255)} ${num(((n >> 8) & 255) / 255)} ${num((n & 255) / 255)}`;
}

class Writer {
  private objects: (Uint8Array | null)[] = [];
  reserve(): number {
    this.objects.push(null);
    return this.objects.length;
  }
  set(id: number, body: string | Uint8Array) {
    this.objects[id - 1] = typeof body === "string" ? enc.encode(body) : body;
  }
  add(body: string | Uint8Array): number {
    const id = this.reserve();
    this.set(id, body);
    return id;
  }
  stream(dict: string, data: Uint8Array, compress = true): number {
    const bytes = compress ? new Uint8Array(deflateSync(data)) : data;
    const head = enc.encode(`<< ${dict}${compress ? " /Filter /FlateDecode" : ""} /Length ${bytes.length} >>\nstream\n`);
    const tail = enc.encode("\nendstream");
    const out = new Uint8Array(head.length + bytes.length + tail.length);
    out.set(head);
    out.set(bytes, head.length);
    out.set(tail, head.length + bytes.length);
    return this.add(out);
  }
  build(root: number, info: number, fileId: string): Uint8Array {
    const chunks: Uint8Array[] = [enc.encode("%PDF-1.7\n%âãÏÓ\n")];
    let at = chunks[0].length;
    const offsets: number[] = [];
    this.objects.forEach((body, i) => {
      if (!body) throw new Error(`PDF object ${i + 1} was never written.`);
      const head = enc.encode(`${i + 1} 0 obj\n`);
      const tail = enc.encode("\nendobj\n");
      offsets.push(at);
      chunks.push(head, body, tail);
      at += head.length + body.length + tail.length;
    });
    const n = this.objects.length + 1;
    let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
    for (const o of offsets) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
    xref += `trailer\n<< /Size ${n} /Root ${root} 0 R /Info ${info} 0 R /ID [<${fileId}> <${fileId}>] >>\nstartxref\n${at}\n%%EOF\n`;
    chunks.push(enc.encode(xref));
    const out = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
    let w = 0;
    for (const c of chunks) {
      out.set(c, w);
      w += c.length;
    }
    return out;
  }
}

/** A short, stable hash for the font subset tag and the file id. */
function hash(text: string): number[] {
  let a = 0x811c9dc5;
  let b = 0x1b873593;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 0x01000193) >>> 0;
    b = Math.imul(b + text.charCodeAt(i), 0x85ebca6b) >>> 0;
    b = ((b << 13) | (b >>> 19)) >>> 0;
  }
  return [a, b];
}

/* --------------------------------------------------------------------- fonts */

class PdfFont {
  /** Glyph number → the character(s) it stands for, for the files' text to be read back. */
  used = new Map<number, string>();
  constructor(
    public key: FontKey,
    public name: string,
    private fonts: Fonts,
  ) {}
  /** The glyph numbers for a piece of text, as the hex string a PDF draws. */
  encode(text: string): string {
    const f = this.fonts[this.key]!;
    let hex = "";
    for (const ch of text) {
      const g = f.glyph(ch.codePointAt(0)!);
      if (!this.used.has(g)) this.used.set(g, ch);
      hex += g.toString(16).padStart(4, "0").toUpperCase();
    }
    return hex;
  }
  write(w: Writer): number {
    const f = this.fonts[this.key]!;
    const meta = FONT_FILES[this.key];
    const gids = [...this.used.keys()].sort((a, b) => a - b);
    const tag = hash(this.key + gids.join(","))
      .map((n) => Array.from({ length: 3 }, (_, i) => String.fromCharCode(65 + ((n >>> (i * 5)) % 26))).join(""))
      .join("");
    const base = `/${tag}+${meta.post}`;
    const scale = 1000 / f.unitsPerEm;
    const subset = subsetFont(f, gids);
    const file = w.stream(`/Length1 ${subset.length}`, subset);
    const flags = 32 | (meta.italic ? 64 : 0);
    const descriptor = w.add(
      `<< /Type /FontDescriptor /FontName ${base} /Flags ${flags} /FontBBox [${f.bbox.map((v) => Math.round(v * scale)).join(" ")}] /ItalicAngle ${num(f.italicAngle)} /Ascent ${Math.round(f.ascent * scale)} /Descent ${Math.round(f.descent * scale)} /CapHeight ${Math.round(f.capHeight * scale)} /StemV ${meta.weight >= 600 ? 120 : 80} /FontFile2 ${file} 0 R >>`,
    );
    const widths = gids.map((g) => `${g} [${Math.round(f.advance(g) * scale)}]`).join(" ");
    const cid = w.add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont ${base} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /DW 1000 /W [${widths}] /CIDToGIDMap /Identity >>`);
    // Which character each glyph stands for.
    const pairs = gids.filter((g) => g !== 0).map((g) => {
      const ch = this.used.get(g)!;
      let hex = "";
      for (let i = 0; i < ch.length; i++) hex += ch.charCodeAt(i).toString(16).padStart(4, "0").toUpperCase();
      return `<${g.toString(16).padStart(4, "0").toUpperCase()}> <${hex}>`;
    });
    let cmap = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n";
    for (let i = 0; i < pairs.length; i += 100) {
      const part = pairs.slice(i, i + 100);
      cmap += `${part.length} beginbfchar\n${part.join("\n")}\nendbfchar\n`;
    }
    cmap += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n";
    const toUnicode = w.stream("", enc.encode(cmap));
    return w.add(`<< /Type /Font /Subtype /Type0 /BaseFont ${base} /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${toUnicode} 0 R >>`);
  }
}

/* ----------------------------------------------------------------- structure */

/** One element of the tag tree. Its children are other elements, pieces of page content, or a link's clickable area. */
class Elem {
  id = 0;
  kids: (Elem | { page: number; mcid: number } | { annot: number; page: number })[] = [];
  constructor(
    public role: string,
    public parent: Elem | null,
  ) {
    parent?.kids.push(this);
  }
}

/* ----------------------------------------------------------------- the file */

export function writePdf(layout: Layout, flow: Flow, fonts: Fonts, info: PdfInfo): Uint8Array {
  const w = new Writer();
  const catalog = w.reserve();
  const pagesId = w.reserve();
  const pageIds = Array.from({ length: layout.pages }, () => w.reserve());
  const content: string[] = Array.from({ length: layout.pages }, () => "");
  const mcids: Elem[][] = Array.from({ length: layout.pages }, () => []);
  const annots: number[][] = Array.from({ length: layout.pages }, () => []);
  const linkParents: Elem[] = [];
  const pdfFonts = new Map<FontKey, PdfFont>();
  const fontFor = (key: FontKey) => {
    if (!pdfFonts.has(key)) pdfFonts.set(key, new PdfFont(key, `F${pdfFonts.size + 1}`, fonts));
    return pdfFonts.get(key)!;
  };
  const H = layout.height;

  /** Draws runs as one piece of tagged content belonging to `owner`. */
  const draw = (page: number, owner: Elem, tag: string, pieces: { run: Pick<Run, "text" | "font" | "size" | "color" | "x" | "tracking">; baseline: number }[]) => {
    const mcid = mcids[page].length;
    mcids[page].push(owner);
    owner.kids.push({ page, mcid });
    let s = `/${tag} << /MCID ${mcid} >> BDC\nBT\n`;
    for (const { run, baseline } of pieces) {
      const f = fontFor(run.font);
      s += `/${f.name} ${num(run.size)} Tf\n${rgb(run.color)} rg\n${num(run.tracking)} Tc\n1 0 0 1 ${num(run.x)} ${num(H - baseline)} Tm\n<${f.encode(run.text)}> Tj\n`;
    }
    content[page] += `${s}ET\nEMC\n`;
  };

  // The tag tree: Document → name, contact line, then a section for each heading.
  const doc = new Elem("Document", null);
  let sect: Elem | null = null;
  let list: Elem | null = null;
  let listEntry = "";
  for (const b of layout.blocks) {
    if (b.kind === "heading") sect = new Elem("Sect", doc);
    const parent: Elem = b.kind === "name" || b.kind === "contact" ? doc : (sect ?? doc);
    let body: Elem;
    if (b.kind === "bullet") {
      // Consecutive bullets of one entry are one list.
      if (!list || listEntry !== `${b.sectionId}/${b.entryId}` || list.parent !== parent) list = new Elem("L", parent);
      listEntry = `${b.sectionId}/${b.entryId}`;
      const item = new Elem("LI", list);
      const label = new Elem("Lbl", item);
      body = new Elem("LBody", item);
      if (b.mark && b.lines[0]) draw(b.lines[0].page, label, "Lbl", [{ run: { ...b.mark, tracking: 0 }, baseline: b.lines[0].baseline }]);
    } else {
      list = null;
      body = new Elem(b.tag, parent);
    }
    emitBlock(b, body);
  }

  /** A block's text: plain stretches belong to the block; each link is its own Link element with a clickable area. */
  function emitBlock(b: Block, body: Elem) {
    const tag = b.kind === "bullet" ? "LBody" : b.tag;
    let pending: { run: Run; baseline: number }[] = [];
    let pendingPage = -1;
    const flush = () => {
      if (pending.length) draw(pendingPage, body, tag, pending);
      pending = [];
    };
    let link: { elem: Elem; key: string } | null = null;
    for (const line of b.lines) {
      if (line.page !== pendingPage) flush();
      pendingPage = line.page;
      for (const run of line.runs) {
        if (!run.link) {
          link = null;
          pending.push({ run, baseline: line.baseline });
          continue;
        }
        flush();
        const key = `${run.link}#${run.item ?? ""}`;
        if (!link || link.key !== key) link = { elem: new Elem("Link", body), key };
        draw(line.page, link.elem, "Link", [{ run, baseline: line.baseline }]);
        const top = H - line.top - 1;
        const bottom = H - (line.top + line.height) + 1;
        const key2 = pageIds.length + linkParents.length;
        const annot = w.add(`<< /Type /Annot /Subtype /Link /Rect [${num(run.x)} ${num(bottom)} ${num(run.x + run.width)} ${num(top)}] /Border [0 0 0] /F 4 /A << /Type /Action /S /URI /URI ${str(run.link)} >> /Contents ${str(run.text)} /StructParent ${key2} >>`);
        annots[line.page].push(annot);
        linkParents.push(link.elem);
        link.elem.kids.push({ annot, page: line.page });
      }
    }
    flush();
  }

  // Decoration: drawn lines and bars, marked so that software skips them. A band behind the name is drawn first, under the text.
  const artifact = (r: (typeof layout.rules)[number]) => `/Artifact << /Type /Layout >> BDC\n${rgb(r.color)} rg\n${num(r.x)} ${num(H - r.y - r.height)} ${num(r.width)} ${num(r.height)} re\nf\nEMC\n`;
  for (const r of layout.rules) {
    if (r.under) content[r.page] = artifact(r) + content[r.page];
    else content[r.page] += artifact(r);
  }

  // Write the tag tree.
  const treeRoot = w.reserve();
  const assign = (e: Elem) => {
    e.id = w.reserve();
    for (const k of e.kids) if (k instanceof Elem) assign(k);
  };
  assign(doc);
  const emit = (e: Elem, parentRef: number) => {
    const kids = e.kids
      .map((k) => (k instanceof Elem ? `${k.id} 0 R` : "annot" in k ? `<< /Type /OBJR /Obj ${k.annot} 0 R /Pg ${pageIds[k.page]} 0 R >>` : `<< /Type /MCR /Pg ${pageIds[k.page]} 0 R /MCID ${k.mcid} >>`))
      .join(" ");
    w.set(e.id, `<< /Type /StructElem /S /${e.role} /P ${parentRef} 0 R /K [${kids}] >>`);
    for (const k of e.kids) if (k instanceof Elem) emit(k, e.id);
  };
  emit(doc, treeRoot);
  const nums = [...mcids.map((owners, page) => `${page} [${owners.map((o) => `${o.id} 0 R`).join(" ")}]`), ...linkParents.map((e, i) => `${pageIds.length + i} ${e.id} 0 R`)].join(" ");
  w.set(treeRoot, `<< /Type /StructTreeRoot /K [${doc.id} 0 R] /ParentTree << /Nums [${nums}] >> /ParentTreeNextKey ${pageIds.length + linkParents.length} >>`);

  // Pages. Fonts are written last, once every glyph used is known.
  const contentIds = content.map((c) => w.stream("", enc.encode(c)));
  const fontIds = new Map<FontKey, number>();
  for (const [key, f] of pdfFonts) fontIds.set(key, f.write(w));
  const resources = `<< /Font << ${[...pdfFonts.values()].map((f) => `/${f.name} ${fontIds.get(f.key)} 0 R`).join(" ")} >> >>`;
  pageIds.forEach((id, i) => {
    w.set(id, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(layout.width)} ${num(layout.height)}] /Resources ${resources} /Contents ${contentIds[i]} 0 R /StructParents ${i} /Tabs /S${annots[i].length ? ` /Annots [${annots[i].map((a) => `${a} 0 R`).join(" ")}]` : ""} >>`);
  });
  w.set(pagesId, `<< /Type /Pages /Kids [${pageIds.map((p) => `${p} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);

  // What the file says about itself.
  const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const when = info.created.toISOString().replace(/\.\d+Z$/, "Z");
  const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>\n<x:xmpmeta xmlns:x="adobe:ns:meta/">\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">\n<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xml(info.title)}</rdf:li></rdf:Alt></dc:title>\n<dc:language><rdf:Bag><rdf:li>${xml(info.lang)}</rdf:li></rdf:Bag></dc:language>\n<dc:format>application/pdf</dc:format>\n<xmp:CreatorTool>Hakkiri</xmp:CreatorTool>\n<xmp:CreateDate>${when}</xmp:CreateDate>\n<xmp:ModifyDate>${when}</xmp:ModifyDate>\n<pdf:Producer>${xml(PDF_PRODUCER)}</pdf:Producer>\n</rdf:Description>\n</rdf:RDF>\n</x:xmpmeta>\n<?xpacket end="w"?>`;
  const metadata = w.stream("/Type /Metadata /Subtype /XML", enc.encode(xmp), false);
  const infoId = w.add(`<< /Title ${str(info.title)} /Creator (Hakkiri) /Producer ${str(PDF_PRODUCER)} /CreationDate (${pdfDate(info.created)}) /ModDate (${pdfDate(info.created)}) >>`);
  w.set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R /Lang ${str(info.lang)} /MarkInfo << /Marked true >> /StructTreeRoot ${treeRoot} 0 R /ViewerPreferences << /DisplayDocTitle true >> /Metadata ${metadata} 0 R >>`);
  const fileId = hash(content.join("") + info.title + when)
    .concat(hash(when + flow.nodes.length + info.lang))
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("")
    .toUpperCase();
  return w.build(catalog, infoId, fileId);
}
