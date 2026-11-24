import "server-only";
import fs from "node:fs";
import path from "node:path";
import { type LetterPrintable, isoDate, layoutLetter, letterFit } from "../letter/flow";
import type { CvDoc } from "../schema";
import { writeDocx } from "./docx";
import type { Flow } from "./flow";
import { contentDisposition, fileName } from "./filename";
import { FONT_FILES, type FontKey } from "./fonts";
import { type Fonts, fontsNeeded, layoutCv } from "./layout";
import { writePdf } from "./pdf";
import { type ReadBack, readBackDocx, readBackPdf } from "./readback";
import { paperStyle } from "./templates";
import { parseFont } from "./ttf";

/** Where the font files are. Read from disk once and kept. */
export const FONT_DIR = path.join(process.cwd(), "src", "lib", "cv", "render", "fonts");

const g = globalThis as unknown as { __hakkiriCvFonts?: Fonts };

export function loadFonts(keys: FontKey[]): Fonts {
  const cache = (g.__hakkiriCvFonts ??= {});
  for (const key of keys) cache[key] ??= parseFont(new Uint8Array(fs.readFileSync(path.join(FONT_DIR, FONT_FILES[key].file))));
  return cache;
}

export type ExportFormat = "pdf" | "docx";
export const MIME: Record<ExportFormat, string> = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

export interface Exported {
  bytes: Uint8Array;
  name: string;
  mime: string;
  /** Pages in the PDF layout. A Word file's page count depends on the fonts on the computer that opens it. */
  pages: number;
  /** The file, read back and compared with the CV. Null when the file was made but the reader itself failed, so nothing is known about it. */
  check: ReadBack | null;
  /** Characters the fonts cannot draw. */
  missing: string[];
  /** The headers for sending the file as a download. */
  headers: Record<string, string>;
  /** The CV as it was printed, in reading order. */
  flow: Flow;
}

type Printable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target">;

/**
 * Makes the file for a CV and reads it straight back. The bytes returned are
 * the bytes that were checked.
 */
export async function exportCv(cv: Printable, format: ExportFormat, now = new Date()): Promise<Exported> {
  const fonts = loadFonts(fontsNeeded(paperStyle(cv.design)));
  const { flow, layout, style } = layoutCv(cv, fonts);
  const info = { title: flow.title, lang: flow.lang, created: now };
  const bytes = format === "pdf" ? writePdf(layout, flow, fonts, info) : await writeDocx(flow, style, info);
  let check: ReadBack | null = null;
  try {
    check = format === "pdf" ? await readBackPdf(bytes, flow) : await readBackDocx(bytes, flow);
  } catch (err) {
    // The file exists; what failed is the reading of it. That is reported as "not checked", never as "checked".
    console.error(`[cv export] the ${format} file could not be read back:`, err);
  }
  const name = fileName(cv, format);
  return { bytes, name, mime: MIME[format], pages: layout.pages, check, missing: layout.missing, flow, headers: { "content-type": MIME[format], "content-disposition": contentDisposition(name), "cache-control": "no-store" } };
}

export interface ExportedLetter extends Exported {
  /** Pages the letter itself takes: it is meant to take one. */
  letterPages: number;
}

/**
 * Makes the file for a cover letter, on its own or followed by the CV, and
 * reads it straight back. The letter is set in the CV's own template, fonts,
 * colour and paper size. `today` is the date printed when the letter has none
 * of its own.
 */
export async function exportLetter(cv: LetterPrintable, format: ExportFormat, opts: { withCv?: boolean; now?: Date; today?: string } = {}): Promise<ExportedLetter> {
  const now = opts.now ?? new Date();
  const fonts = loadFonts(fontsNeeded(paperStyle(cv.design)));
  const { flow, layout, style } = layoutLetter(cv, fonts, opts.today ?? isoDate(now), opts.withCv);
  const info = { title: flow.title, lang: flow.lang, created: now };
  const bytes = format === "pdf" ? writePdf(layout, flow, fonts, info) : await writeDocx(flow, style, info);
  let check: ReadBack | null = null;
  try {
    check = format === "pdf" ? await readBackPdf(bytes, flow) : await readBackDocx(bytes, flow);
  } catch (err) {
    console.error(`[cv export] the ${format} letter could not be read back:`, err);
  }
  const name = fileName(cv, format, opts.withCv ? "both" : "letter");
  return { bytes, name, mime: MIME[format], pages: layout.pages, letterPages: letterFit(layout).pages, check, missing: layout.missing, flow, headers: { "content-type": MIME[format], "content-disposition": contentDisposition(name), "cache-control": "no-store" } };
}
