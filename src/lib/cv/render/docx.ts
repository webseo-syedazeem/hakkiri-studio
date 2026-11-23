import JSZip from "jszip";
import type { Flow } from "./flow";
import { FAMILIES, FONT_FILES, type FamilyId, WORD_FALLBACK } from "./fonts";
import { type ParaSpec, describeFlow } from "./layout";
import type { PaperStyle } from "./templates";

/**
 * Writes a CV as a Word file that can be opened and edited: real paragraphs,
 * real heading styles (the name is Heading 1, sections Heading 2, entries
 * Heading 3), real bulleted lists and real links. Nothing is a picture or a
 * text box, and there are no tables or columns.
 *
 * The fonts are named, not embedded. On a computer without them Word falls
 * back to a common font of the same kind, so the wording is unchanged but the
 * line breaks, and with them the page count, can differ from the PDF.
 */

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const twips = (pt: number) => Math.round(pt * 20);
const half = (pt: number) => Math.round(pt * 2);
const hex = (c: string) => c.replace("#", "").toUpperCase();
const familyOf = (key: keyof typeof FONT_FILES) => FONT_FILES[key].family;

const STYLE_OF: Record<string, string> = { H1: "Heading1", H2: "Heading2", H3: "Heading3", LI: "ListBullet", P: "Normal" };

export interface DocxInfo {
  title: string;
  lang: string;
  created: Date;
}

export async function writeDocx(flow: Flow, style: PaperStyle, info: DocxInfo): Promise<Uint8Array> {
  const specs = describeFlow(flow, style);
  const links: string[] = [];
  const linkId = (url: string) => {
    let i = links.indexOf(url);
    if (i < 0) i = links.push(url) - 1;
    return `rIdLink${i + 1}`;
  };

  const run = (p: ParaSpec["pieces"][number]) => {
    const meta = FONT_FILES[p.font];
    const props = [
      `<w:rFonts w:ascii="${x(meta.family)}" w:hAnsi="${x(meta.family)}" w:cs="${x(meta.family)}"/>`,
      meta.weight >= 600 ? "<w:b/>" : '<w:b w:val="0"/>',
      meta.italic ? "<w:i/>" : '<w:i w:val="0"/>',
      `<w:color w:val="${hex(p.color)}"/>`,
      p.tracking ? `<w:spacing w:val="${twips(p.tracking)}"/>` : "",
      `<w:sz w:val="${half(p.size)}"/><w:szCs w:val="${half(p.size)}"/>`,
    ].join("");
    const r = `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${x(p.text)}</w:t></w:r>`;
    return p.link ? `<w:hyperlink r:id="${linkId(p.link)}" w:history="0">${r}</w:hyperlink>` : r;
  };

  const paragraph = (s: ParaSpec) => {
    const border = (side: string, color: string, size: number, space: number) => `<w:${side} w:val="single" w:sz="${size}" w:space="${space}" w:color="${hex(color)}"/>`;
    // Decoration that Word can draw as a paragraph border is kept; short rules have no equivalent and are left out.
    const borders =
      s.rule?.type === "hairline-below" || s.rule?.type === "title-below" || s.rule?.type === "contact-below"
        ? `<w:pBdr>${border("bottom", s.rule.color, s.rule.type === "title-below" ? 10 : 4, s.rule.type === "hairline-below" ? 2 : 5)}</w:pBdr>`
        : s.rule?.type === "bar-before"
          ? `<w:pBdr>${border("left", s.rule.color, 24, 5)}</w:pBdr>`
          : "";
    const props = [
      `<w:pStyle w:val="${STYLE_OF[s.tag]}"/>`,
      s.keepWithNext ? "<w:keepNext/>" : "",
      s.tag !== "P" || s.kind === "contact" ? "<w:keepLines/>" : "",
      // In the order Word's own files use: keepNext, keepLines, pageBreakBefore.
      s.pageBreak ? "<w:pageBreakBefore/>" : "",
      s.tag === "LI" ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : "",
      borders,
      `<w:spacing w:before="${twips(s.before)}" w:after="${twips(s.after)}" w:line="${twips(s.lineHeight)}" w:lineRule="exact"/>`,
      s.tag === "LI" ? `<w:ind w:left="${twips(s.indent)}" w:hanging="${twips(s.indent - 2.5)}"/>` : s.rule?.type === "bar-before" ? "" : "",
      `<w:jc w:val="${s.align}"/>`,
    ].join("");
    return `<w:p><w:pPr>${props}</w:pPr>${s.pieces.map(run).join("")}</w:p>`;
  };

  const body = specs.map(paragraph).join("");
  const { page } = style;
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${body}<w:sectPr><w:pgSz w:w="${twips(page.width)}" w:h="${twips(page.height)}"/><w:pgMar w:top="${twips(page.marginY)}" w:right="${twips(page.marginX)}" w:bottom="${twips(page.marginY)}" w:left="${twips(page.marginX)}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;

  const bodyFamily = FAMILIES[style.fonts.body];
  const headFamily = FAMILIES[style.fonts.heading];
  const heading = (id: string, name: string, level: number, family: string) =>
    `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="${level}"/></w:pPr><w:rPr><w:rFonts w:ascii="${x(family)}" w:hAnsi="${x(family)}" w:cs="${x(family)}"/></w:rPr></w:style>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${x(bodyFamily)}" w:hAnsi="${x(bodyFamily)}" w:cs="${x(bodyFamily)}"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="${x(info.lang)}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>${heading("Heading1", "heading 1", 0, headFamily)}${heading("Heading2", "heading 2", 1, headFamily)}${heading("Heading3", "heading 3", 2, bodyFamily)}<w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:numPr><w:numId w:val="1"/></w:numPr><w:contextualSpacing/></w:pPr></w:style></w:styles>`;
  const numbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering ${NS}><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="260" w:hanging="210"/></w:pPr><w:rPr><w:rFonts w:ascii="${x(bodyFamily)}" w:hAnsi="${x(bodyFamily)}" w:cs="${x(bodyFamily)}" w:hint="default"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
  const families = [...new Set([style.fonts.body, style.fonts.heading])] as FamilyId[];
  const fontTable = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:fonts ${NS}>${families.map((f) => `<w:font w:name="${x(FAMILIES[f])}"><w:altName w:val="${WORD_FALLBACK[f]}"/><w:family w:val="${f === "inter" || f === "plex" ? "swiss" : "roman"}"/><w:pitch w:val="variable"/></w:font>`).join("")}</w:fonts>`;
  const settings = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings ${NS}><w:themeFontLang w:val="${x(info.lang)}"/></w:settings>`;
  const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="${REL}/styles" Target="styles.xml"/><Relationship Id="rIdNumbering" Type="${REL}/numbering" Target="numbering.xml"/><Relationship Id="rIdFonts" Type="${REL}/fontTable" Target="fontTable.xml"/><Relationship Id="rIdSettings" Type="${REL}/settings" Target="settings.xml"/>${links.map((url, i) => `<Relationship Id="rIdLink${i + 1}" Type="${REL}/hyperlink" Target="${x(url)}" TargetMode="External"/>`).join("")}</Relationships>`;
  const W = "application/vnd.openxmlformats-officedocument.wordprocessingml";
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${W}.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="${W}.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="${W}.numbering+xml"/><Override PartName="/word/fontTable.xml" ContentType="${W}.fontTable+xml"/><Override PartName="/word/settings.xml" ContentType="${W}.settings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
  const top = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="${REL}/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  const when = info.created.toISOString().replace(/\.\d+Z$/, "Z");
  // The file's details: a title, a language and the time. No author.
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(info.title)}</dc:title><dc:language>${x(info.lang)}</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${when}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${when}</dcterms:modified></cp:coreProperties>`;
  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Hakkiri</Application></Properties>`;

  const zip = new JSZip();
  // Fixed dates inside the zip, so the same CV always gives the same file.
  const opts = { date: info.created };
  zip.file("[Content_Types].xml", types, opts);
  zip.file("_rels/.rels", top, opts);
  zip.file("word/document.xml", document, opts);
  zip.file("word/styles.xml", styles, opts);
  zip.file("word/numbering.xml", numbering, opts);
  zip.file("word/fontTable.xml", fontTable, opts);
  zip.file("word/settings.xml", settings, opts);
  zip.file("word/_rels/document.xml.rels", rels, opts);
  zip.file("docProps/core.xml", core, opts);
  zip.file("docProps/app.xml", app, opts);
  void familyOf;
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
