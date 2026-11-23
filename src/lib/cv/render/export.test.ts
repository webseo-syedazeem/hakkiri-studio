import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { parseXml } from "../import/docx";
import { readCvFile } from "../import";
import { CV_TEMPLATES, type TemplateId, cvStrings, isEntrySection } from "../schema";
import { writeDocx } from "./docx";
import { cleanNamePart, contentDisposition, fileBaseName, fileName } from "./filename";
import { buildFlow, flowText } from "./flow";
import { layoutCv } from "./layout";
import { PDF_PRODUCER, writePdf } from "./pdf";
import { compareText, readBackDocx, readBackPdf, wordsOf } from "./readback";
import { exportCv } from "./server";
import { TEMPLATES } from "./templates";
import { fernCv, loadAllFonts, longCv } from "./testing";

const fonts = loadAllFonts();
const WHEN = new Date("2026-11-23T12:00:00Z");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-export-"));
const has = (cmd: string) => spawnSync("which", [cmd]).status === 0;
/** Independent programs, used when they are installed: poppler for PDFs, LibreOffice for Word files. */
const POPPLER = has("pdftotext") && has("pdffonts") && has("pdfinfo");
const OFFICE = has("soffice");

function pdfOf(cv: ReturnType<typeof fernCv>) {
  const { layout, flow, style } = layoutCv(cv, fonts);
  return { bytes: writePdf(layout, flow, fonts, { title: flow.title, lang: flow.lang, created: WHEN }), layout, flow, style };
}
async function docxOf(cv: ReturnType<typeof fernCv>) {
  const { flow, style } = layoutCv(cv, fonts);
  return { bytes: await writeDocx(flow, style, { title: flow.title, lang: flow.lang, created: WHEN }), flow, style };
}
const save = (name: string, bytes: Uint8Array) => {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, bytes);
  return file;
};
const pdfjs = async (bytes: Uint8Array) => {
  const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return lib.getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
};

describe.each(CV_TEMPLATES)("PDF, %s template", (template: TemplateId) => {
  const cv = fernCv({ template });
  const { bytes, layout, flow } = pdfOf(cv);

  it("reads back word for word, in order, with nothing extra", async () => {
    const check = await readBackPdf(bytes, flow);
    expect({ missing: check.missing, unexpected: check.unexpected }).toEqual({ missing: [], unexpected: [] });
    expect(check.status).toBe("checked");
    expect(check.pages).toBe(layout.pages);
    expect(check.words).toBeGreaterThan(150);
  });

  it.runIf(POPPLER)("an independent reader (poppler) extracts the same words in the same order", () => {
    const file = save(`${template}.pdf`, bytes);
    const text = execFileSync("pdftotext", ["-enc", "UTF-8", file, "-"], { encoding: "utf8" });
    expect(wordsOf(text)).toEqual(flowText(flow).flatMap(wordsOf));
    // Every font is embedded, cut down to the glyphs used, and maps glyphs back to characters.
    const table = execFileSync("pdffonts", [file], { encoding: "utf8" }).trim().split("\n").slice(2);
    expect(table.length).toBeGreaterThanOrEqual(2);
    for (const row of table) {
      expect(row).toMatch(/^[A-Z]{6}\+\S+\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/);
    }
    const info = execFileSync("pdfinfo", [file], { encoding: "utf8" });
    expect(info).toMatch(/Tagged:\s+yes/);
    expect(info).toMatch(new RegExp(`Pages:\\s+${layout.pages}\\b`));
    expect(info).not.toMatch(/^(Author|Subject|Keywords):/m);
  });

  it("says what it is and nothing more: title, language, Hakkiri as the tool, the time", async () => {
    const doc = await pdfjs(bytes);
    const meta = await doc.getMetadata();
    const info = meta.info as Record<string, unknown>;
    expect(info.Title).toBe("Fern Example – Collections officer – CV");
    expect(info.Creator).toBe("Hakkiri");
    expect(info.Producer).toBe(PDF_PRODUCER);
    expect(info.Language).toBe("en-GB");
    expect(info.Author ?? "").toBe("");
    expect(info.Subject ?? "").toBe("");
    expect(info.Keywords ?? "").toBe("");
    expect(String(info.CreationDate)).toBe("D:20261123120000Z");
    expect(meta.metadata?.get("dc:title")).toBe("Fern Example – Collections officer – CV");
    expect(String(meta.metadata?.get("dc:language"))).toContain("en-GB");
    expect(meta.metadata?.get("xmp:creatortool")).toBe("Hakkiri");
    expect(((await doc.getViewerPreferences()) as unknown as Map<string, unknown>).get("DisplayDocTitle")).toBe(true);
    expect(((await doc.getMarkInfo()) as unknown as Map<string, unknown>).get("Marked")).toBe(true);
    const raw = new TextDecoder("latin1").decode(bytes);
    expect((raw.match(/\/Tabs \/S/g) ?? []).length).toBe(layout.pages);
    await doc.loadingTask.destroy();
  });

  it("is tagged: one level-1 heading, a section and level-2 heading per section, entries, lists and links, in reading order", async () => {
    const doc = await pdfjs(bytes);
    const roles: string[] = [];
    type Node = { role?: string; type?: string; id?: string; children?: Node[] };
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tree = (await page.getStructTree()) as Node;
      const tagged: string[] = [];
      const walk = (n: Node, path: string) => {
        if (n.role) roles.push(`${path}${n.role}`);
        if (n.type === "content" && n.id) tagged.push(n.id);
        for (const c of n.children ?? []) walk(c, n.role && n.role !== "Root" ? `${path}${n.role}>` : path);
      };
      walk(tree, "");
      // The order of the tags is the order the content is drawn in: reading order.
      const drawn = (await page.getTextContent({ includeMarkedContent: true })).items.flatMap((it) => ("type" in it && it.type === "beginMarkedContentProps" && it.id ? [it.id] : []));
      expect(tagged).toEqual(drawn);
    }
    const count = (r: string) => roles.filter((x) => x === r).length;
    const sections = flow.nodes.filter((n) => n.kind === "heading").length;
    expect(count("Document>H1")).toBe(1);
    expect(count("Document>Sect")).toBe(sections);
    expect(count("Document>Sect>H2")).toBe(sections);
    expect(count("Document>Sect>H3")).toBe(flow.nodes.filter((n) => n.kind === "entry").length);
    const bullets = flow.nodes.filter((n) => n.kind === "bullet").length;
    expect(count("Document>Sect>L>LI>Lbl")).toBe(bullets);
    expect(count("Document>Sect>L>LI>LBody")).toBe(bullets);
    expect(count("Document>P>Link")).toBe(2);
    expect(count("Document>Sect>P>Link")).toBe(1);
    await doc.loadingTask.destroy();
  });

  it("links are real links to the right addresses", async () => {
    const doc = await pdfjs(bytes);
    const urls: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) for (const a of await (await doc.getPage(p)).getAnnotations()) if (a.subtype === "Link") urls.push(a.url ?? a.unsafeUrl);
    expect(urls.sort()).toEqual(["https://linkedin.com/in/fern-example", "https://paperkite.example/maps", "mailto:fern@example.com"]);
    await doc.loadingTask.destroy();
  });

  it("the upload reader, given the PDF, rebuilds the CV's fields", async () => {
    const read = await readCvFile(bytes);
    expect(read.contact).toEqual({ fullName: "Fern Example", email: "fern@example.com", phone: "07700 900123", location: "York", links: ["linkedin.com/in/fern-example"] });
    const exp = read.sections.find((s) => s.kind === "experience");
    expect(exp && isEntrySection(exp) ? exp.entries.map((e) => `${e.title} | ${e.org} | ${e.start}→${e.current ? "now" : e.end} | ${e.bullets.length}`) : []).toEqual(["Archive assistant | Paper Kite Archive | 2023-09→now | 4", "Library assistant | Folio House | 2021-08→2023-08 | 2"]);
  });
});

describe.each(CV_TEMPLATES)("Word, %s template", (template: TemplateId) => {
  const cv = fernCv({ template });

  it("reads back word for word, in order, with nothing extra", async () => {
    const { bytes, flow } = await docxOf(cv);
    const check = await readBackDocx(bytes, flow);
    expect({ missing: check.missing, unexpected: check.unexpected }).toEqual({ missing: [], unexpected: [] });
    expect(check.status).toBe("checked");
  });

  it("is a native Word document: heading styles, list items and links; no tables, pictures or text boxes", async () => {
    const { bytes, flow } = await docxOf(cv);
    const zip = await JSZip.loadAsync(bytes);
    const xml = await zip.file("word/document.xml")!.async("string");
    const body = parseXml(xml).children[0].children[0];
    const paras = body.children.filter((c) => c.name === "w:p");
    const styleOf = (p: (typeof paras)[number]) => p.children.find((c) => c.name === "w:pPr")?.children.find((c) => c.name === "w:pStyle")?.attrs["w:val"];
    const styles = paras.map(styleOf);
    expect(styles.filter((s) => s === "Heading1")).toHaveLength(1);
    expect(styles.filter((s) => s === "Heading2")).toHaveLength(flow.nodes.filter((n) => n.kind === "heading").length);
    expect(styles.filter((s) => s === "Heading3")).toHaveLength(flow.nodes.filter((n) => n.kind === "entry").length);
    const lists = paras.filter((p) => styleOf(p) === "ListBullet");
    expect(lists).toHaveLength(flow.nodes.filter((n) => n.kind === "bullet").length);
    expect(lists.every((p) => p.children.find((c) => c.name === "w:pPr")!.children.some((c) => c.name === "w:numPr"))).toBe(true);
    expect(xml).not.toMatch(/<w:tbl|<w:drawing|<w:pict|txbxContent|<w:cols /);
    expect((xml.match(/<w:hyperlink /g) ?? []).length).toBe(3);
    const rels = await zip.file("word/_rels/document.xml.rels")!.async("string");
    for (const url of ["mailto:fern@example.com", "https://linkedin.com/in/fern-example", "https://paperkite.example/maps"]) expect(rels).toContain(`Target="${url}" TargetMode="External"`);
    // Body text is 10.5pt (21 half-points) or larger.
    const sizes = [...xml.matchAll(/<w:sz w:val="(\d+)"/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(19);
    const core = await zip.file("docProps/core.xml")!.async("string");
    expect(core).toContain("<dc:title>Fern Example – Collections officer – CV</dc:title>");
    expect(core).toContain("<dc:language>en-GB</dc:language>");
    expect(core).not.toMatch(/creator|lastModifiedBy|keywords|subject/i);
    const fontNames = [...new Set([...xml.matchAll(/w:ascii="([^"]+)"/g)].map((m) => m[1]))].sort();
    const want = [...new Set([TEMPLATES[template].fonts.body, TEMPLATES[template].fonts.heading].map((f) => ({ inter: "Inter", lora: "Lora", plex: "IBM Plex Sans", serif: "Source Serif 4" })[f]))].sort();
    expect(fontNames).toEqual(want);
  });

  it.runIf(OFFICE)("LibreOffice opens it and reads the same words in the same order", async () => {
    const { bytes, flow } = await docxOf(cv);
    const dir = fs.mkdtempSync(path.join(tmp, `lo-${template}-`));
    fs.writeFileSync(path.join(dir, "cv.docx"), bytes);
    execFileSync("soffice", ["--headless", "--norestore", "--convert-to", "txt:Text (encoded):UTF8", "cv.docx"], { cwd: dir, stdio: "ignore", env: { ...process.env, HOME: dir }, timeout: 120000 });
    const text = fs.readFileSync(path.join(dir, "cv.txt"), "utf8");
    expect(wordsOf(text)).toEqual(flowText(flow).flatMap(wordsOf));
  }, 180000);
});

describe("what a file must and must not contain", () => {
  it("keeps accents, currency, dashes and curly quotes exactly", async () => {
    const { bytes, flow } = pdfOf(fernCv());
    const text = (await readCvFile(bytes)).lines.map((l) => l.text).join("\n");
    for (const piece of ["café till & the catalogue", "£2,500", "maps – 40 pages", "Français", "1,400 items to 300"]) expect(text).toContain(piece);
    expect(flowText(flow).join(" ")).toContain("years’ experience");
  });

  it("content that is switched off is in neither file", async () => {
    const cv = fernCv();
    const exp = cv.sections.find((s) => s.kind === "experience")!;
    if (!isEntrySection(exp)) throw new Error();
    exp.entries[1].visible = false;
    exp.entries[0].bullets[1].visible = false;
    cv.sections.find((s) => s.kind === "volunteering")!.visible = false;
    for (const format of ["pdf", "docx"] as const) {
      const out = await exportCv(cv, format, WHEN);
      expect(out.check?.status).toBe("checked");
      const raw = format === "pdf" ? (await readCvFile(out.bytes)).lines.map((l) => l.text).join("\n") : await (await JSZip.loadAsync(out.bytes)).file("word/document.xml")!.async("string");
      expect(raw).not.toMatch(/Folio House|Library assistant|handling guide|Hillside Primary|Reading helper/);
      expect(raw).toContain("Paper Kite Archive");
    }
  });

  it("nothing is in a file that is not in the CV", async () => {
    const cv = fernCv();
    const said = new Set(cvStrings(cv).flatMap(wordsOf).flatMap((w) => w.split(/[^\p{L}\p{N}]+/u)));
    const { flow } = pdfOf(cv);
    const standard = new Set(["profile", "experience", "education", "skills", "selected", "achievements", "projects", "certificates", "volunteering", "publications", "languages", "interests", "sep", "aug", "jan", "dec", "present"]);
    const added = flowText(flow)
      .flatMap(wordsOf)
      .flatMap((w) => w.split(/[^\p{L}\p{N}]+/u))
      .filter((w) => w && !said.has(w) && !standard.has(w) && !/^\d+$/.test(w));
    expect(added).toEqual([]);
  });

  it("a long CV runs onto more pages, with every bullet printed once", async () => {
    const cv = longCv(9);
    const { bytes, layout, flow } = pdfOf(cv);
    expect(layout.pages).toBeGreaterThan(2);
    const check = await readBackPdf(bytes, flow);
    expect(check).toMatchObject({ status: "checked", pages: layout.pages });
  });

  it("the same CV at the same time gives the same file, byte for byte", async () => {
    const a = pdfOf(fernCv());
    const b = pdfOf(fernCv());
    // (ids differ between the two CVs; the printed words do not, so neither does the file.)
    expect(Buffer.from(a.bytes).equals(Buffer.from(b.bytes))).toBe(true);
    const c = await docxOf(fernCv());
    const d = await docxOf(fernCv());
    expect(Buffer.from(c.bytes).equals(Buffer.from(d.bytes))).toBe(true);
  });

  it("a US resume is Letter size, in US English, and called a resume", async () => {
    const cv = fernCv({}, "us");
    const pdf = await exportCv(cv, "pdf", WHEN);
    expect(pdf.name).toBe("Fern Example - Collections officer - Resume.pdf");
    const doc = await pdfjs(pdf.bytes);
    const view = (await doc.getPage(1)).getViewport({ scale: 1 });
    expect([view.width, view.height]).toEqual([612, 792]);
    expect(((await doc.getMetadata()).info as Record<string, unknown>).Language).toBe("en-US");
    await doc.loadingTask.destroy();
    const docx = await exportCv(cv, "docx", WHEN);
    const xml = await (await JSZip.loadAsync(docx.bytes)).file("word/document.xml")!.async("string");
    expect(xml).toContain('<w:pgSz w:w="12240" w:h="15840"/>');
    expect(fileName(fernCv(), "docx")).toBe("Fern Example - Collections officer - CV.docx");
  });

  it("reports a character the fonts cannot draw, and the read-back fails for that file", async () => {
    const cv = fernCv();
    cv.contact.fullName = "Fern 例 Example";
    const out = await exportCv(cv, "pdf", WHEN);
    expect(out.missing).toEqual(["例"]);
    expect(out.check?.status).toBe("loss");
  });
});

describe("the read-back check", () => {
  const flow = buildFlow(fernCv(), TEMPLATES.standard);
  const good = flowText(flow).join("\n");

  it("passes a file that says what the CV says, whatever the line breaks, bullet marks or capitals in headings", () => {
    expect(compareText(flow, good).status).toBe("checked");
    expect(compareText(flow, good.replace(/\n/g, "  \n • ").replace("Experience", "EXPERIENCE")).status).toBe("checked");
  });

  it("names the piece that is missing", () => {
    const check = compareText(flow, good.replace("Sep 2023 – Present · York", ""));
    expect(check.status).toBe("loss");
    expect(check.missing).toEqual(["Sep 2023 – Present · York"]);
    expect(check.unexpected).toEqual([]);
  });

  it("catches text that should not be there", () => {
    const check = compareText(flow, good.replace("Library assistant · Folio House", "Library assistant · Folio House\nSecret switched-off bullet"));
    expect(check.status).toBe("loss");
    expect(check.unexpected).toEqual(["secret", "switched-off", "bullet"]);
  });

  it("catches dates attached to the wrong job, even though every word is there", () => {
    const swapped = good.replace("Sep 2023 – Present · York", "XX").replace("Aug 2021 – Aug 2023 · Leeds", "Sep 2023 – Present · York").replace("XX", "Aug 2021 – Aug 2023 · Leeds");
    expect(wordsOf(swapped).sort()).toEqual(wordsOf(good).sort());
    expect(compareText(flow, swapped).status).toBe("loss");
  });

  it("catches a changed number", () => {
    const check = compareText(flow, good.replace("1,400 items to 300", "1,400 items to 30"));
    expect(check.status).toBe("loss");
    expect(check.missing.join(" ")).toContain("1,400 items to 300");
  });

  it("catches an empty file", () => {
    expect(compareText(flow, "")).toMatchObject({ status: "loss" });
  });
});

describe("file names", () => {
  const cv = fernCv();
  it("is “[Name] - [Role] - CV”, leaving out what is empty", () => {
    expect(fileBaseName(cv)).toBe("Fern Example - Collections officer - CV");
    expect(fileBaseName({ ...cv, target: undefined })).toBe("Fern Example - CV");
    expect(fileBaseName({ ...cv, contact: { ...cv.contact, fullName: "" }, target: undefined })).toBe("CV");
    expect(fileBaseName({ ...cv, region: "us" })).toBe("Fern Example - Collections officer - Resume");
    expect(fileBaseName(cv, "letter")).toBe("Fern Example - Collections officer - Cover Letter");
  });
  it("strips characters a file name cannot hold", () => {
    expect(cleanNamePart('Head of R&D / "Ops": <EMEA>?*|\\')).toBe("Head of R&D Ops EMEA");
    expect(cleanNamePart("  ..hidden.. ")).toBe("hidden");
    expect(fileBaseName({ ...cv, target: { title: "Analyst: Risk/Compliance", employer: "", advert: "" } })).toBe("Fern Example - Analyst Risk Compliance - CV");
  });
  it("uses the person's own file name when they have set one", () => {
    expect(fileName({ ...cv, design: { ...cv.design, fileName: "Fern – archive CV (Nov)" } }, "pdf")).toBe("Fern – archive CV (Nov).pdf");
  });
  it("sends names with accents safely", () => {
    expect(contentDisposition("Zoë Müller - CV.pdf")).toBe("attachment; filename=\"Zoe Muller - CV.pdf\"; filename*=UTF-8''Zo%C3%AB%20M%C3%BCller%20-%20CV.pdf");
  });
});
