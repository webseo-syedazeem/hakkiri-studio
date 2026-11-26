import "server-only";
import { ImportError, MAX_UPLOAD_BYTES, readCvFile, readCvText, sniff } from "../import";
import { isOnlyDates } from "../import/dates";
import { extractDocx } from "../import/docx";
import { extractPdf } from "../import/pdf";
import { linesToLetter } from "../letter/score";
import { type FileRead, type LetterRead, MAX_LETTER_TEXT, cvTextOf, fileReadOf } from "./record";

/** What to say when a file can't be used, in the words the check screen uses. */
export const UNREADABLE = "We couldn’t read this file. Try another file or paste the text.";
export const WRONG_FILE = "Choose a PDF or Word file up to 5 MB.";

export interface ReadDoc<R> {
  text: string;
  read: R | null;
}

/** A CV from a file or pasted text: its text, its parts, and (for a file) what software read from it. */
export async function readCvInput(file: File | null, text: string): Promise<ReadDoc<FileRead> & { cv: Awaited<ReturnType<typeof readCvFile>> }> {
  if (file && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) throw new ImportError("too-big", WRONG_FILE);
    const read = await readCvFile(new Uint8Array(await file.arrayBuffer()));
    return { text: cvTextOf(read), read: fileReadOf(read, file.name), cv: read };
  }
  return { text, read: null, cv: readCvText(text) };
}

/**
 * A cover letter from a file: its text, put back into paragraphs. A Word file
 * keeps one line a paragraph; a PDF keeps one line a printed line, so its
 * lines are joined back into paragraphs.
 */
export async function readLetterFile(file: File): Promise<ReadDoc<LetterRead>> {
  if (file.size > MAX_UPLOAD_BYTES) throw new ImportError("too-big", WRONG_FILE);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength < 100) throw new ImportError("empty", UNREADABLE);
  const kind = sniff(bytes);
  if (kind !== "pdf" && kind !== "zip") throw new ImportError("not-supported", WRONG_FILE);
  const got = kind === "pdf" ? await extractPdf(bytes, isOnlyDates) : await extractDocx(bytes);
  const lines = got.lines.map((l) => l.text);
  const text = (kind === "pdf" ? linesToLetter(lines) : lines.map((l) => l.replace(/\t+/g, " ").trim()).filter(Boolean).join("\n\n")).slice(0, MAX_LETTER_TEXT);
  if (text.replace(/\s/g, "").length < 40) throw new ImportError("empty", UNREADABLE);
  return { text, read: { name: (file.name || "Your file").slice(0, 200), kind: kind === "pdf" ? "pdf" : "docx", pages: Math.min(100, got.pages) } };
}
