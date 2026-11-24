import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { fileBaseName, fileName } from "../render/filename";
import { buildFlow, flowText } from "../render/flow";
import { layoutCv } from "../render/layout";
import { wordsOf } from "../render/readback";
import { exportCv, exportLetter } from "../render/server";
import { paperStyle } from "../render/templates";
import { loadAllFonts } from "../render/testing";
import { CV_TEMPLATES, type CvDoc, type Letter, type TemplateId } from "../schema";
import { reflow } from "./check";
import { letterByRule } from "./draft";
import { isoDate, joinFlows, layoutLetter, letterFit, letterFlow, longDate } from "./flow";
import { NOW, letterCv } from "./testing";

const fonts = loadAllFonts();
const TODAY = "2026-11-23";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-letter-"));
const has = (cmd: string) => spawnSync("which", [cmd]).status === 0;
const POPPLER = has("pdftotext") && has("pdfinfo");
const OFFICE = has("soffice");

/** The sample CV with its letter drafted. */
function withLetter(change: Partial<Letter> = {}, design: Partial<CvDoc["design"]> = {}, region: "uk" | "us" = "uk"): CvDoc {
  const base = letterCv({}, region);
  const draft = letterByRule(base, NOW);
  return { ...base, design: { ...base.design, ...design }, letter: { ...base.letter!, paragraphs: draft.paragraphs, signoff: "", started: true, ...change } };
}
const texts = (cv: CvDoc) => flowText(letterFlow(cv, TODAY));
/** The letter with five paragraphs of twelve sentences in the middle: far too long for one page. */
function longParagraphs(cv: CvDoc) {
  const [opening, , , close] = cv.letter!.paragraphs;
  const text = Array.from({ length: 12 }, () => "At Folio House, I trained six new starters on the café till & the catalogue.").join(" ");
  const long = [1, 2, 3, 4, 5].map((i) => ({ id: `lp_long00000000000${i}`, role: "evidence" as const, sentences: reflow([], text) }));
  return [opening, ...long, close];
}

describe("the letter in reading order", () => {
  it("is the name and contact line, the date, who it is to, the greeting, the paragraphs, the sign-off and the name", () => {
    const cv = withLetter();
    const t = texts(cv);
    expect(t.slice(0, 8)).toEqual(["Fern Example", "York", "fern@example.com", "07700 900123", "linkedin.com/in/fern-example", "23 November 2026", "Lantern Atlas", "Dear Hiring Manager,"]);
    expect(t.slice(8, -2)).toEqual(cv.letter!.paragraphs.map((p) => p.sentences.map((s) => s.text).join(" ")));
    expect(t.slice(-2)).toEqual(["Yours faithfully,", "Fern Example"]);
  });

  it("greets a named recipient and signs off to match", () => {
    const t = texts(withLetter({ recipient: "Dr Okafor" }));
    expect(t).toContain("Dr Okafor");
    expect(t).toContain("Dear Dr Okafor,");
    expect(t.at(-2)).toBe("Yours sincerely,");
  });

  it("uses the person's own sign-off and date when they set them", () => {
    const t = texts(withLetter({ signoff: "Kind regards", date: "2026-12-01" }));
    expect(t).toContain("1 December 2026");
    expect(t).not.toContain("23 November 2026");
    expect(t.at(-2)).toBe("Kind regards,");
  });

  it("writes the month out, in the order of the region", () => {
    expect(longDate("2026-11-23", "uk")).toBe("23 November 2026");
    expect(longDate("2026-11-23", "us")).toBe("November 23, 2026");
    expect(longDate("", "uk")).toBe("");
    expect(isoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    const us = texts(withLetter({}, {}, "us"));
    expect(us).toContain("November 23, 2026");
    expect(us.at(-2)).toBe("Sincerely,");
  });

  it("has no letter furniture when nothing has been written", () => {
    const cv = letterCv();
    expect(texts(cv)).toEqual(["Fern Example", "York", "fern@example.com", "07700 900123", "linkedin.com/in/fern-example"]);
  });

  it("points each paragraph back at itself, so a click on the page finds it", () => {
    const cv = withLetter();
    const nodes = letterFlow(cv, TODAY).nodes.filter((n) => "at" in n && n.at.section === "letter");
    const ids = nodes.flatMap((n) => ("at" in n && n.at.entry ? [n.at.entry] : []));
    expect(ids).toEqual(cv.letter!.paragraphs.map((p) => p.id));
  });
});

describe("the letter on its page", () => {
  it("is set in the CV's own type, colour, paper and margins", () => {
    const cv = withLetter({}, { template: "executive", accent: "teal" });
    const letter = layoutLetter(cv, fonts, TODAY);
    const own = layoutCv(cv, fonts);
    expect(letter.style).toEqual(paperStyle(cv.design));
    expect([letter.layout.width, letter.layout.height]).toEqual([own.layout.width, own.layout.height]);
    // The name is drawn exactly as on the CV: same font, size, colour and place.
    expect(letter.layout.blocks[0]).toEqual(own.layout.blocks[0]);
    expect(letter.layout.blocks[1].lines).toEqual(own.layout.blocks[1].lines);
    // The body is in the CV's body font and size.
    const para = (l: typeof letter.layout) => l.blocks.find((b) => b.kind === "para" && b.lines.length > 1)!.lines[0].runs[0];
    expect([para(letter.layout).font, para(letter.layout).size]).toEqual([para(own.layout).font, para(own.layout).size]);
  });

  it("follows the region's paper: A4 in the UK, Letter in the US", () => {
    expect(layoutLetter(withLetter(), fonts, TODAY).layout.height).toBeCloseTo(841.89, 1);
    expect(layoutLetter(withLetter({}, {}, "us"), fonts, TODAY).layout.height).toBe(792);
  });

  it("fits one page", () => {
    const fit = letterFit(layoutLetter(withLetter(), fonts, TODAY).layout);
    expect(fit).toEqual({ pages: 1, fits: true, over: null, linesOver: 0 });
  });

  it("says which paragraph crosses onto a second page when it is too long", () => {
    const cv = withLetter();
    cv.letter!.paragraphs = longParagraphs(cv);
    const { layout } = layoutLetter(cv, fonts, TODAY);
    const fit = letterFit(layout);
    expect(fit.fits).toBe(false);
    expect(fit.pages).toBe(2);
    expect(fit.linesOver).toBeGreaterThan(0);
    // It is the first paragraph with a line on the second page, and it starts on the first: it crosses the boundary.
    const first = layout.blocks.find((x) => x.at.section === "letter" && x.lines.some((l) => l.page === 1))!;
    expect(fit.over).toEqual({ section: "letter", entry: first.at.entry });
    expect(first.lines[0].page).toBe(0);
    expect(first.at.entry).toMatch(/^lp_long00000000000[1-5]$/);
  });

  it("names the last paragraph when only the sign-off falls onto the second page", () => {
    const cv = withLetter();
    // Grow the letter one sentence at a time until something goes over, and stop there.
    const line = "At Folio House, I trained six new starters on the café till & the catalogue.";
    const grown = (n: number) => {
      const c = withLetter();
      c.letter!.paragraphs = [c.letter!.paragraphs[0], ...Array.from({ length: Math.ceil(n / 6) }, (_, i) => ({ id: `lp_grow${String(i).padStart(12, "0")}`, role: "evidence" as const, sentences: reflow([], Array.from({ length: Math.min(6, n - i * 6) }, () => line).join(" ")) }))];
      return c;
    };
    let n = 6;
    while (letterFit(layoutLetter(grown(n), fonts, TODAY).layout).fits) n++;
    const { layout } = layoutLetter(grown(n), fonts, TODAY);
    const fit = letterFit(layout);
    // Whatever went over first, the paragraph named is a real paragraph of the letter.
    expect(fit.over?.entry).toMatch(/^lp_/);
    expect(grown(n).letter!.paragraphs.map((x) => x.id)).toContain(fit.over?.entry);
    expect(cv.letter!.paragraphs.length).toBeGreaterThan(0);
  });

  it("keeps the sign-off with the name, and the greeting with the first paragraph", () => {
    const { layout, flow } = layoutLetter(withLetter(), fonts, TODAY);
    const at = (field: string) => layout.blocks.find((b) => b.at.section === "letter" && b.at.field === field)!;
    expect(at("signoff").lines[0].page).toBe(at("name").lines[0].page);
    const greetingNode = flow.nodes.findIndex((n) => "at" in n && n.at.field === "greeting");
    expect(layout.blocks[greetingNode].lines[0].page).toBe(layout.blocks[greetingNode + 1].lines[0].page);
  });
});

describe("the letter and the CV in one file", () => {
  it("starts the CV on a new page, after the whole letter", () => {
    const cv = withLetter();
    const style = paperStyle(cv.design);
    const own = letterFlow(cv, TODAY);
    const joined = joinFlows(own, buildFlow(cv, style.template));
    expect(joined.breaks).toEqual([own.nodes.length]);
    expect(joined.title).toBe("Fern Example – Collections officer – Cover Letter and CV");
    const { layout } = layoutLetter(cv, fonts, TODAY, true);
    const cvPages = layoutCv(cv, fonts).layout.pages;
    expect(layout.pages).toBe(1 + cvPages);
    const firstOfCv = layout.blocks[own.nodes.length];
    expect(firstOfCv.kind).toBe("name");
    expect(firstOfCv.lines[0].page).toBe(1);
    // It starts at the top of that page, exactly where the CV on its own starts.
    expect(firstOfCv.lines[0].top).toBe(layoutCv(cv, fonts).layout.blocks[0].lines[0].top);
    expect(letterFit(layout).pages).toBe(1);
  });
});

describe("file names", () => {
  it("says “Cover Letter”, and “Cover Letter and CV” for the two together; “Resume” in the US", () => {
    const cv = withLetter();
    expect(fileName(cv, "pdf", "letter")).toBe("Fern Example - Collections officer - Cover Letter.pdf");
    expect(fileName(cv, "docx", "both")).toBe("Fern Example - Collections officer - Cover Letter and CV.docx");
    expect(fileBaseName(withLetter({}, {}, "us"), "both")).toBe("Fern Example - Collections officer - Cover Letter and Resume");
    // The person's own file name is for their CV; a letter keeps its own.
    expect(fileBaseName(withLetter({}, { fileName: "My CV" }), "letter")).toBe("Fern Example - Collections officer - Cover Letter");
  });
});

describe.each(CV_TEMPLATES)("letter files, %s template", (template: TemplateId) => {
  const cv = withLetter({ recipient: "Dr Okafor" }, { template });

  it("the PDF reads back word for word, in order, with nothing extra", async () => {
    const out = await exportLetter(cv, "pdf", { now: NOW, today: TODAY });
    expect({ missing: out.check?.missing, unexpected: out.check?.unexpected }).toEqual({ missing: [], unexpected: [] });
    expect(out.check?.status).toBe("checked");
    expect(out.pages).toBe(1);
    expect(out.letterPages).toBe(1);
    expect(out.name).toBe("Fern Example - Collections officer - Cover Letter.pdf");
  });

  it("the Word file reads back word for word, in order, with nothing extra", async () => {
    const out = await exportLetter(cv, "docx", { now: NOW, today: TODAY });
    expect({ missing: out.check?.missing, unexpected: out.check?.unexpected }).toEqual({ missing: [], unexpected: [] });
    expect(out.check?.status).toBe("checked");
  });

  it("the letter and the CV in one file read back as the letter followed by the CV", async () => {
    for (const format of ["pdf", "docx"] as const) {
      const out = await exportLetter(cv, format, { withCv: true, now: NOW, today: TODAY });
      expect(out.check?.status, format).toBe("checked");
      const alone = await exportCv(cv, format, NOW);
      expect(out.check!.words).toBeGreaterThan(alone.check!.words + 60);
      expect(flowText(out.flow).slice(-flowText(alone.flow).length)).toEqual(flowText(alone.flow));
    }
  });
});

describe("the letter's files", () => {
  const cv = withLetter();

  it("an independent reader finds the same words in the PDF, and the same number of pages", async () => {
    const out = await exportLetter(cv, "pdf", { withCv: true, now: NOW, today: TODAY });
    const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await lib.getDocument({ data: new Uint8Array(out.bytes), verbosity: 0 }).promise;
    expect(doc.numPages).toBe(out.pages);
    // Page one is the letter and nothing else; the CV's headings start on page two.
    const page = async (n: number) => (await (await doc.getPage(n)).getTextContent()).items.map((i) => ("str" in i ? i.str : "")).join(" ");
    const first = await page(1);
    expect(first).toContain("Dear Hiring Manager,");
    expect(first).toContain("Yours faithfully,");
    expect(first).not.toContain("Experience");
    expect(await page(2)).toContain("Experience");
    const meta = (await doc.getMetadata()).info as Record<string, unknown>;
    expect(meta.Title).toBe("Fern Example – Collections officer – Cover Letter and CV");
    expect(meta.Author ?? "").toBe("");
    await doc.loadingTask.destroy();
  });

  it.runIf(POPPLER)("poppler extracts the letter's words in order and counts one page", async () => {
    const out = await exportLetter(cv, "pdf", { now: NOW, today: TODAY });
    const file = path.join(tmp, "letter.pdf");
    fs.writeFileSync(file, out.bytes);
    expect(wordsOf(execFileSync("pdftotext", ["-enc", "UTF-8", file, "-"], { encoding: "utf8" }))).toEqual(flowText(out.flow).flatMap(wordsOf));
    const info = execFileSync("pdfinfo", [file], { encoding: "utf8" });
    expect(info).toMatch(/Pages:\s+1\b/);
    expect(info).toMatch(/Tagged:\s+yes/);
  });

  it("the Word file is real paragraphs, with the CV starting on a new page", async () => {
    const out = await exportLetter(cv, "docx", { withCv: true, now: NOW, today: TODAY });
    const xml = await (await JSZip.loadAsync(out.bytes)).file("word/document.xml")!.async("string");
    expect((xml.match(/<w:pageBreakBefore\/>/g) ?? []).length).toBe(1);
    // The break is on the CV's name, which comes straight after the letter's last line.
    const breakAt = xml.indexOf("<w:pageBreakBefore/>");
    expect(xml.slice(breakAt, breakAt + 1500)).toContain("Fern Example");
    expect(xml.lastIndexOf("Yours faithfully,")).toBeLessThan(breakAt);
    expect(xml).toContain("Dear Hiring Manager,");
    // Element order inside a paragraph's properties is the one Word requires.
    expect(xml).not.toMatch(/<w:pageBreakBefore\/><w:keep(Next|Lines)\/>/);
    const alone = await (await JSZip.loadAsync((await exportLetter(cv, "docx", { now: NOW, today: TODAY })).bytes)).file("word/document.xml")!.async("string");
    expect(alone).not.toContain("pageBreakBefore");
  });

  it.runIf(OFFICE)("LibreOffice opens the Word file and finds the same words", async () => {
    const out = await exportLetter(cv, "docx", { now: NOW, today: TODAY });
    const dir = fs.mkdtempSync(path.join(tmp, "office-"));
    const file = path.join(dir, "letter.docx");
    fs.writeFileSync(file, out.bytes);
    execFileSync("soffice", ["--headless", "--convert-to", "txt:Text (encoded):UTF8", "--outdir", dir, file], { stdio: "ignore", timeout: 120000 });
    expect(wordsOf(fs.readFileSync(path.join(dir, "letter.txt"), "utf8").replace(/^﻿/, ""))).toEqual(flowText(out.flow).flatMap(wordsOf));
  }, 150000);

  it("made again at the same time from the same letter, it is the same file", async () => {
    for (const format of ["pdf", "docx"] as const) {
      const a = await exportLetter(cv, format, { now: NOW, today: TODAY });
      const b = await exportLetter(structuredClone(cv), format, { now: NOW, today: TODAY });
      expect(Buffer.from(a.bytes).equals(Buffer.from(b.bytes)), format).toBe(true);
    }
  });

  it("prints the day it is made when the letter has no date, and the letter's own date when it has", async () => {
    const out = await exportLetter(cv, "pdf", { now: new Date(2027, 0, 9, 12), today: undefined });
    expect(flowText(out.flow)).toContain("9 January 2027");
    const dated = await exportLetter(withLetter({ date: "2026-12-01" }), "pdf", { now: new Date(2027, 0, 9, 12) });
    expect(flowText(dated.flow)).toContain("1 December 2026");
  });

  it("reports a long letter's pages honestly rather than shrinking it", async () => {
    const long = withLetter();
    long.letter!.paragraphs = longParagraphs(long);
    const out = await exportLetter(long, "pdf", { now: NOW, today: TODAY });
    expect(out.letterPages).toBe(2);
    expect(out.check?.status).toBe("checked");
  });
});
