"use client";

/**
 * Reading your CV, cover letter or job spec in the browser (interview
 * set-up). Only the text is sent on to build your plan; the file itself
 * isn't uploaded or kept.
 */

export interface ReadDoc {
  name: string;
  text: string;
  /** "2 pages", "640 words" */
  detail: string;
}

export const MAX_DOC_TEXT = 20_000;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

async function pdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/api/pdf-worker";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 20); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const it of content.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      const y = Math.round(it.transform[5] / 2) * 2;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x: it.transform[4], s: it.str });
    }
    pages.push(
      [...rows.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, parts]) => parts.sort((a, b) => a.x - b.x).map((p) => p.s).join(" ").replace(/\s+/g, " ").trim())
        .join("\n"),
    );
  }
  return { text: pages.join("\n\n"), pages: doc.numPages };
}

async function docxText(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const xml = await zip.file("word/document.xml")?.async("text");
  if (!xml) throw new Error("That doesn’t look like a Word file. Try saving it as .docx or PDF.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.getElementsByTagName("w:p")]
    .map((p) =>
      [...p.getElementsByTagName("w:t")]
        .map((t) => t.textContent ?? "")
        .join("")
        .trim(),
    )
    .filter(Boolean)
    .join("\n");
}

/** Text from a PDF, Word (.docx) or plain text file. Throws a plain message if it can't be read. */
export async function readDocument(file: File, opts: { minWords?: number } = {}): Promise<ReadDoc> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  let text = "";
  let detail = "";
  if (ext === "pdf") {
    const r = await pdfText(file);
    text = r.text;
    detail = `${r.pages} page${r.pages === 1 ? "" : "s"}`;
  } else if (ext === "docx") {
    text = await docxText(file);
  } else if (ext === "txt" || ext === "md" || ext === "rtf") {
    text = await file.text();
  } else if (["doc", "pages", "odt"].includes(ext)) {
    throw new Error("Save it as a PDF or Word (.docx) file first, then choose it again.");
  } else {
    throw new Error("Choose a PDF, Word (.docx) or text file.");
  }
  text = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_DOC_TEXT);
  const n = words(text);
  if (n < (opts.minWords ?? 40)) {
    throw new Error(ext === "pdf" ? "No text was found in that PDF (it may be a scanned image). Paste the text instead." : "That file looks almost empty. Paste the text instead.");
  }
  return { name: file.name, text, detail: detail || `${n} words` };
}

/** Pasted text as a document. */
export function pastedDocument(label: string, text: string): ReadDoc {
  const clean = text.replace(/\r/g, "").trim().slice(0, MAX_DOC_TEXT);
  return { name: label, text: clean, detail: `${words(clean)} words` };
}
