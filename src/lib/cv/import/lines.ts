/**
 * A CV file, whatever its format, is first turned into plain lines with a few
 * hints about how each looked. Everything after that works on these lines, so
 * PDF, Word and pasted text share one reader.
 */
export interface DocLine {
  /** The text. A tab marks a wide gap, a tab stop or a table cell boundary ("Title\tMar 2021 – Present"). */
  text: string;
  /** A list item, or a line that began with a bullet mark (the mark is removed from the text). */
  bullet: boolean;
  /** The whole line is bold. */
  bold: boolean;
  /** Text size in points; 0 when unknown. */
  size: number;
  /** A heading style from Word or a tagged PDF: 1 is the top level; 0 for none. */
  heading: number;
  /** Indent from the left edge of its column in points; 0 when unknown. */
  indent: number;
  /** Link targets attached to the line (a "LinkedIn" label that points at a profile address). */
  links: string[];
  /** Which page and column it came from. */
  page: number;
  col: number;
  /** Its position in the file's text, set by the reader, so every field can point back to its source line. */
  n: number;
}

export function makeLine(text: string, hints: Partial<DocLine> = {}): DocLine {
  return { text, bullet: false, bold: false, size: 0, heading: 0, indent: 0, links: [], page: 1, col: 0, n: -1, ...hints };
}

/** Characters used as list marks, including the private-use glyphs Word's Symbol and Wingdings bullets become. */
const BULLET_MARK = /^\s*(?:[•◦▪▫■□●○◆◇▶►➢➤➔→‣⁃∙·✓✔✦❖*»›\u2219\u25aa\u2043\ue000-\uf8ff]|[-–—](?=\s)|o(?=\s{1,3}[A-Z]))\s*/;
const PRIVATE_USE = /[\ue000-\uf8ff]/g;

/**
 * Splits a leading list mark from a line. "o Managed…" counts only where it is
 * clearly a hollow-bullet glyph read as a letter. A line that is nothing but a
 * mark comes back as a bullet with no text, so the caller can attach it to the
 * line that follows.
 */
export function splitBullet(raw: string): { bullet: boolean; text: string } {
  const m = raw.match(BULLET_MARK);
  if (!m) return { bullet: false, text: raw.replace(PRIVATE_USE, "").trim() };
  return { bullet: true, text: raw.slice(m[0].length).replace(PRIVATE_USE, "").trim() };
}

/** Numbered list marks: "1." or "1)" at the start. */
export function splitNumbered(raw: string): { bullet: boolean; text: string } {
  const m = raw.match(/^\s*\d{1,2}[.)]\s+(?=\S)/);
  return m ? { bullet: true, text: raw.slice(m[0].length).trim() } : { bullet: false, text: raw };
}

const LIGATURES: Record<string, string> = { "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬅ": "st", "ﬆ": "st" };

/**
 * Tidies text read from a file without changing what it says: ligatures are
 * spelled out, odd spaces become ordinary ones, and soft hyphens and
 * zero-width characters go. Accents, currency signs and dashes are kept.
 */
export function cleanText(s: string): string {
  return s
    .replace(/[ﬀ-ﬆ]/g, (c) => LIGATURES[c] ?? c)
    .replace(/[\u00a0\u2000-\u200a\u202f\u205f\u3000]/g, " ")
    .replace(/[\u00ad\u200b-\u200f\u2028\u2029\u2060\ufeff]/g, "")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/ *\t[ \t]*/g, "\t")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** The line with gaps shown as plain spaces. */
export const plain = (l: DocLine | string) => (typeof l === "string" ? l : l.text).replace(/\t+/g, "  ").trim();

/** The parts of a line either side of its wide gaps. */
export const parts = (l: DocLine) => l.text.split("\t").map((p) => p.trim()).filter(Boolean);

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Mostly capitals: "PROFESSIONAL EXPERIENCE". */
export function isAllCaps(s: string): boolean {
  const letters = s.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

/** "MAYA CHEN" → "Maya Chen", leaving short words such as "UK" and "IT" alone when asked. */
export function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s\-'’(/])([a-zà-ÿ])/g, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}

/** Lines from pasted text. Blank lines are dropped; leading marks become bullets. */
export function linesFromText(text: string): DocLine[] {
  const out: DocLine[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const indent = (raw.match(/^[ \t]*/)?.[0].replace(/\t/g, "    ").length ?? 0) * 3;
    const cleaned = cleanText(raw.replace(/\t+/g, "\t").replace(/ {3,}/g, "\t"));
    if (!cleaned) continue;
    let b = splitBullet(cleaned);
    if (!b.bullet) b = splitNumbered(cleaned);
    if (!b.text) continue;
    out.push(makeLine(b.text, { bullet: b.bullet, indent }));
  }
  return out;
}
