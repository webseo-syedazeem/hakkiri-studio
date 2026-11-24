import { extractDocx } from "../import/docx";
import { isOnlyDates } from "../import/dates";
import { extractPdf } from "../import/pdf";
import { type Flow, flowText } from "./flow";

/**
 * Reads an exported file back and compares it with the CV it was made from.
 * The reading is done by the upload reader (pdf.js for PDFs, the Word reader
 * for .docx), which shares no code with the writers, so a fault in a writer
 * cannot hide itself. A file passes only if every word of the CV is in the
 * file, in the same order, with nothing extra.
 */

export interface ReadBack {
  /** "checked": the file says exactly what the CV says, in order. "loss": it does not. */
  status: "checked" | "loss";
  /** Pieces of the CV whose words are missing from the file, or out of place. */
  missing: string[];
  /** Words in the file that are not in the CV (text that was switched off, say). */
  unexpected: string[];
  /** How many words were compared. */
  words: number;
  pages: number;
}

/** Words as a reader would compare them: case and the marks drawn around text (bullets, separators) put aside. */
export function wordsOf(text: string): string[] {
  return text
    .normalize("NFKC")
    // Characters that take no space and cannot be seen (a soft hyphen pasted in from a web page) are not words.
    .replace(/[\u00ad\u200b-\u200f\u2028\u2029\u2060\ufeff]/g, "")
    .toLowerCase()
    // Curly and straight quotes are the same words; the readers tidy one into the other.
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[•·\t]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * How many of the file's words, starting at `from`, join up to make `word`
 * exactly: 0 when they do not. Only for a word long enough that a page could
 * not hold it on one line; two ordinary words run together are a difference.
 */
function piecesOf(word: string, got: string[], from: number): number {
  if (word.length < 30 || !word.startsWith(got[from]) || got[from].length >= word.length) return 0;
  let joined = got[from];
  let n = 1;
  while (joined.length < word.length && from + n < got.length && word.startsWith(joined + got[from + n])) {
    joined += got[from + n];
    n++;
  }
  return joined === word ? n : 0;
}

/** Compares what the CV should say with what a file's text says. */
export function compareText(flow: Flow, fileText: string, pages = 0): ReadBack {
  const pieces = flowText(flow);
  const expected = pieces.map(wordsOf);
  const want = expected.flat();
  const got = wordsOf(fileText);
  if (want.length === got.length && want.every((w, i) => w === got[i])) return { status: "checked", missing: [], unexpected: [], words: want.length, pages };

  // Walk both in step. Where they part, look a little way ahead in each for the place they meet again.
  const missing = new Set<number>();
  const unexpected: string[] = [];
  const owner: number[] = [];
  expected.forEach((ws, p) => ws.forEach(() => owner.push(p)));
  let i = 0;
  let j = 0;
  const AHEAD = 40;
  while (i < want.length && j < got.length) {
    if (want[i] === got[j]) {
      i++;
      j++;
      continue;
    }
    // A word too long for one line of the page (a web address) is drawn on two lines or more, and is read back in
    // pieces. Pieces that, put together in order, are exactly the word are that word: nothing is lost or added.
    const pieces = piecesOf(want[i], got, j);
    if (pieces) {
      i++;
      j += pieces;
      continue;
    }
    let skipWant = -1;
    let skipGot = -1;
    for (let k = 1; k <= AHEAD && skipWant < 0 && skipGot < 0; k++) {
      if (i + k < want.length && want[i + k] === got[j] && (want[i + k + 1] === undefined || want[i + k + 1] === got[j + 1])) skipWant = k;
      else if (j + k < got.length && got[j + k] === want[i] && (got[j + k + 1] === undefined || got[j + k + 1] === want[i + 1])) skipGot = k;
    }
    if (skipWant > 0) {
      for (let k = 0; k < skipWant; k++) missing.add(owner[i + k]);
      i += skipWant;
    } else if (skipGot > 0) {
      unexpected.push(...got.slice(j, j + skipGot));
      j += skipGot;
    } else {
      missing.add(owner[i]);
      unexpected.push(got[j]);
      i++;
      j++;
    }
  }
  for (; i < want.length; i++) missing.add(owner[i]);
  unexpected.push(...got.slice(j));
  // Every difference turned out to be a word drawn in pieces: the file says what the CV says.
  if (!missing.size && !unexpected.length) return { status: "checked", missing: [], unexpected: [], words: want.length, pages };
  return { status: "loss", missing: [...missing].sort((a, b) => a - b).map((p) => pieces[p]), unexpected, words: want.length, pages };
}

/** Reads a PDF back with pdf.js and compares it with the CV. */
export async function readBackPdf(bytes: Uint8Array, flow: Flow): Promise<ReadBack> {
  // Our own files have no running headers or footers, so no line is set aside as one.
  // The text is read as it is on the page. The upload reader's tidying (taking list marks off, joining a line that
  // ends in a hyphen to the next) is for other people's files; on ours it would report differences that are not there.
  const file = await extractPdf(bytes, isOnlyDates, { keepEdges: true, raw: true });
  return compareText(flow, file.lines.map((l) => l.text).join("\n"), file.pages);
}

/** Reads a Word file back with the .docx reader and compares it with the CV. */
export async function readBackDocx(bytes: Uint8Array, flow: Flow): Promise<ReadBack> {
  const file = await extractDocx(bytes, { raw: true });
  return compareText(flow, file.lines.map((l) => l.text).join("\n"), file.pages);
}
