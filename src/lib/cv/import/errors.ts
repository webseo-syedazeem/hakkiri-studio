/** Why a file could not be read, in a form the screen can act on: each code has its own way forward. */
export type ImportErrorCode =
  | "too-big" // over the size limit
  | "not-supported" // not a PDF or Word file
  | "old-word" // .doc, .rtf, .pages, .odt: save as .docx or PDF
  | "password" // a password-protected PDF
  | "scanned" // a PDF of pictures: no text to read
  | "unreadable" // damaged, or not what its name says
  | "too-long" // far more pages than a CV
  | "too-much" // far more text, or far more inside the file, than a CV holds
  | "empty"; // almost no text

export class ImportError extends Error {
  constructor(
    public code: ImportErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ImportError";
  }
}

/** What to tell the person, and which way forward to offer: another file, or pasting the text. */
export const IMPORT_ERRORS: Record<ImportErrorCode, { message: string; offer: ("replace" | "paste")[] }> = {
  "too-big": { message: "That file is larger than 5 MB. Choose a smaller file, or paste the text of your CV.", offer: ["replace", "paste"] },
  "not-supported": { message: "Choose a PDF or a Word (.docx) file, or paste the text of your CV.", offer: ["replace", "paste"] },
  "old-word": { message: "That file type can’t be read. Save it as a PDF or a Word (.docx) file and choose it again, or paste the text.", offer: ["replace", "paste"] },
  password: { message: "That PDF is password-protected, so it can’t be read. Choose a copy without a password, or paste the text.", offer: ["replace", "paste"] },
  scanned: { message: "That PDF is a scan or a picture of a CV, so there is no text in it to read. Paste the text of your CV, or choose a different file.", offer: ["paste", "replace"] },
  unreadable: { message: "That file couldn’t be read. It may be damaged. Choose a different file, or paste the text of your CV.", offer: ["replace", "paste"] },
  "too-long": { message: "That file has more pages than a CV. Choose the file that holds just your CV, or paste the text.", offer: ["replace", "paste"] },
  "too-much": { message: "There is far more in that file than a CV holds, so it wasn’t read. Choose the file that holds just your CV, or paste just its text.", offer: ["replace", "paste"] },
  empty: { message: "There was almost no text in that file. Paste the text of your CV, or choose a different file.", offer: ["paste", "replace"] },
};
