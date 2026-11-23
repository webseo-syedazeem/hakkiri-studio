// Opens the files the browser tests download and reads their text back, with tools that share nothing
// with the code that wrote them: pdf.js for PDFs, and the .docx's own XML for Word files.
const fs = require("node:fs");
const JSZip = require("jszip");

/** A PDF's text in reading order, its page count and size, and what it says about itself. */
async function readPdf(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: false, verbosity: 0 }).promise;
  const parts = [];
  let size = [0, 0];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    if (p === 1) size = [page.view[2] - page.view[0], page.view[3] - page.view[1]];
    const content = await page.getTextContent();
    for (const item of content.items) if ("str" in item) parts.push(item.str);
  }
  const meta = await doc.getMetadata().catch(() => ({ info: {} }));
  const mark = await doc.getMarkInfo().catch(() => null);
  const marked = !!(mark && (mark instanceof Map ? mark.get("Marked") : mark.Marked));
  const out = { text: parts.join(" "), pages: doc.numPages, size, title: meta.info?.Title ?? "", author: meta.info?.Author ?? "", lang: meta.info?.Language ?? "", marked };
  await doc.loadingTask.destroy();
  return out;
}

const unescapeXml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** A Word file's paragraphs (text and style), in order. */
async function readDocx(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const xml = await zip.file("word/document.xml").async("string");
  const paragraphs = [];
  for (const m of xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)) {
    const style = /<w:pStyle w:val="([^"]+)"/.exec(m[0])?.[1] ?? "";
    const text = [...m[0].matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)].map((t) => unescapeXml(t[1])).join("");
    if (text) paragraphs.push({ style, text });
  }
  const size = /<w:pgSz w:w="(\d+)" w:h="(\d+)"/.exec(xml);
  return { text: paragraphs.map((p) => p.text).join("\n"), paragraphs, tables: (xml.match(/<w:tbl>/g) ?? []).length, size: size ? [Number(size[1]) / 20, Number(size[2]) / 20] : [0, 0] };
}

/** Text with every space and line break taken out, so that where a line happened to wrap makes no difference. */
const squash = (s) => s.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, "");

/**
 * What a CV should and should not say on paper: every piece that is switched on, and every piece that
 * is switched off (or sits inside something switched off). Worked out here from the saved CV, separately
 * from the app's own layout code.
 */
function expectedText(cv) {
  const on = [];
  const off = [];
  const c = cv.contact;
  on.push(c.fullName, c.email, c.phone, c.location, ...c.links);
  for (const s of cv.sections) {
    const put = (visible, ...texts) => (visible ? on : off).push(...texts);
    if (s.kind === "summary") put(s.visible, ...s.text.split(/\n+/));
    else if (s.kind === "skills") for (const g of s.groups) for (const k of g.skills) put(s.visible && g.visible && k.visible, k.name);
    else if (s.items) for (const i of s.items) put(s.visible && i.visible, i.name, i.level);
    else if (s.entries)
      for (const e of s.entries) {
        put(s.visible && e.visible, e.title, e.org, e.orgInfo, e.subject, e.location, s.kind === "education" ? e.grade : "", e.link);
        for (const b of e.bullets) put(s.visible && e.visible && b.visible, b.text);
      }
  }
  const tidy = (list) => [...new Set(list.map((t) => (t || "").trim()).filter(Boolean))];
  const shown = tidy(on);
  // Something switched off can share its words with something that is on (the same employer twice); only what is nowhere on the page must be absent.
  const all = squash(shown.join(" "));
  return { on: shown, off: tidy(off).filter((t) => !all.includes(squash(t))) };
}

/** Compares a file's text with the CV: what is missing from the file, and what is in it that should not be. */
function compareWithCv(fileText, cv) {
  const text = squash(fileText);
  const { on, off } = expectedText(cv);
  return { missing: on.filter((t) => !text.includes(squash(t))), leaked: off.filter((t) => text.includes(squash(t))), pieces: on.length };
}

module.exports = { readPdf, readDocx, squash, expectedText, compareWithCv };
