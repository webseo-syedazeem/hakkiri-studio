import { isOnlyDates } from "./dates";
import { extractDocx } from "./docx";
import { ImportError } from "./errors";
import { linesFromText } from "./lines";
import { type ParsedCv, parseCv } from "./parse";
import { extractPdf } from "./pdf";

export { ImportError, IMPORT_ERRORS, type ImportErrorCode } from "./errors";
export { parseCv, whereKey, type ParsedCv, type ParsedFlag, type SourceLine } from "./parse";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PASTE_CHARS = 60_000;

export type ImportSource = "pdf" | "docx" | "linkedin-pdf" | "text";

export interface ReadCv extends ParsedCv {
  source: ImportSource;
  pages: number;
}

const startsWith = (bytes: Uint8Array, ...sig: number[]) => sig.every((b, i) => bytes[i] === b);

/** What a file really is, from its first bytes: the name it was given is not trusted. */
export function sniff(bytes: Uint8Array): "pdf" | "zip" | "old-word" | "rtf" | "unknown" {
  // "%PDF" may follow a few bytes of padding.
  const head = String.fromCharCode(...bytes.slice(0, 1024));
  if (head.includes("%PDF-")) return "pdf";
  if (startsWith(bytes, 0x50, 0x4b, 0x03, 0x04)) return "zip";
  if (startsWith(bytes, 0xd0, 0xcf, 0x11, 0xe0)) return "old-word";
  if (head.startsWith("{\\rtf")) return "rtf";
  return "unknown";
}

/**
 * Reads an uploaded CV (PDF or Word) into a structured CV. The file is read in
 * memory and not kept. Throws an ImportError saying why when it cannot be read.
 */
export async function readCvFile(bytes: Uint8Array): Promise<ReadCv> {
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new ImportError("too-big", "The file is over 5 MB.");
  if (bytes.byteLength < 100) throw new ImportError("empty", "The file is empty.");
  const kind = sniff(bytes);
  if (kind === "old-word" || kind === "rtf") throw new ImportError("old-word", "Old Word and rich text files cannot be read.");
  if (kind === "unknown") throw new ImportError("not-supported", "The file is not a PDF or a Word document.");
  const file = kind === "pdf" ? await extractPdf(bytes, isOnlyDates) : await extractDocx(bytes);
  const parsed = parseCv(file.lines);
  if (parsed.lines.reduce((n, l) => n + l.text.length, 0) < 40) throw new ImportError("empty", "The file has almost no text.");
  return { ...parsed, source: kind === "pdf" ? (parsed.linkedin ? "linkedin-pdf" : "pdf") : "docx", pages: file.pages };
}

/** Reads pasted text into a structured CV: the way through for scans and old file types. */
export function readCvText(text: string): ReadCv {
  const clipped = text.slice(0, MAX_PASTE_CHARS);
  if (clipped.replace(/\s/g, "").length < 40) throw new ImportError("empty", "There is almost no text.");
  return { ...parseCv(linesFromText(clipped)), source: "text", pages: 0 };
}
