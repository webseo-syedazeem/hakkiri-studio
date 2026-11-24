import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

/**
 * Uploads, attacked. A file can be made to lie about its size, to never close
 * its comments, to nest a hundred thousand deep or to draw one line a hundred
 * thousand times; and an ordinary file can simply hold more than a CV does.
 * None of these may take the server down, answer with a bare error, or leave
 * a CV behind with no upload to go with it. Every file here is made by hand
 * in this test: nothing is read from disk.
 */

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-hostile-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const imports = await import("@/app/api/cv/imports/route");
const replace = await import("@/app/api/cv/imports/[id]/file/route");
const versions = await import("@/app/api/cv/versions/route");
const store = await import("@/lib/cv/store");
const { newCv } = await import("../access");
const { extractDocx, parseXml } = await import("./docx");
const { extractPdf } = await import("./pdf");
const { isOnlyDates } = await import("./dates");
const { fitRead, RECORD_LIMITS } = await import("./fit");
const { ImportError, readCvFile, readCvText } = await import("./index");
const { CvImportSchema } = await import("./record");
const { MAX_REQUEST_BYTES } = await import("./server");
const { LIMITS } = await import("../schema");
type EntrySection = import("../schema").EntrySection;
type SkillsSection = import("../schema").SkillsSection;

const alice = { id: "usr_alice", email: "alice@example.com" };

/* ------------------------------------------------------------ files by hand */

const latin = (s: string) => Buffer.from(s, "latin1");
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
/** A zip written by hand, so the size a part gives for itself can be made to lie. */
function zip(files: { name: string; data: Buffer; declared?: number; compressed?: Buffer }[]): Buffer {
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const comp = f.compressed ?? zlib.deflateRawSync(f.data, { level: 9 });
    const crc = crc32(f.data);
    const size = f.declared ?? f.data.length;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(size, 22);
    lh.writeUInt16LE(name.length, 26);
    locals.push(lh, name, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(size, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += 30 + name.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const PARAS = ["Ada Example", "ada@example.com", "Experience", "Gallery Assistant, Northgate Museum 2019 - 2023", "Catalogued 1,200 objects in the collections database", "Education", "BA History, University of Leeds 2016 - 2019"];
const para = (p: string) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`;
const docXml = (paras = PARAS, after = "") => `<?xml version="1.0" encoding="UTF-8"?><w:document ${NS}><w:body>${paras.map(para).join("")}</w:body></w:document>${after}`;
const TYPES = { name: "[Content_Types].xml", data: Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>') };
const docx = (documentXml: string | Buffer, extra: Parameters<typeof zip>[0] = [], declared?: number) => zip([TYPES, { name: "word/document.xml", data: Buffer.isBuffer(documentXml) ? documentXml : Buffer.from(documentXml), declared }, ...extra]);

/** A minimal PDF: one content stream a page. */
function pdf(pages: string[]): Buffer {
  const objs: (Buffer | null)[] = [];
  const add = (body: Buffer | null) => (objs.push(body), objs.length);
  const catalog = add(null);
  const tree = add(null);
  const font = add(latin("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"));
  const kids = pages.map((text) => {
    const data = zlib.deflateSync(latin(text), { level: 9 });
    const content = add(Buffer.concat([latin(`<< /Length ${data.length} /Filter /FlateDecode >>\nstream\n`), data, latin("\nendstream")]));
    return add(latin(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`));
  });
  objs[catalog - 1] = latin(`<< /Type /Catalog /Pages ${tree} 0 R >>`);
  objs[tree - 1] = latin(`<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`);
  const chunks: Buffer[] = [latin("%PDF-1.4\n")];
  let at = chunks[0].length;
  const offs: number[] = [];
  objs.forEach((b, i) => {
    const head = latin(`${i + 1} 0 obj\n`);
    const tail = latin("\nendobj\n");
    offs.push(at);
    chunks.push(head, b!, tail);
    at += head.length + b!.length + tail.length;
  });
  chunks.push(latin(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${at}\n%%EOF\n`));
  return Buffer.concat(chunks);
}
const textPage = (lines: string[]) => `BT\n/F1 10 Tf\n${lines.map((l, i) => `1 0 0 1 50 ${800 - i * 12} Tm (${l.replace(/[\\()]/g, "\\$&")}) Tj`).join("\n")}\nET`;
const CV_LINES = ["Ada Example", "ada@example.com", "", "Experience", "Gallery Assistant, Northgate Museum 2019 - 2023", "- Catalogued 1,200 objects in the collections database", "Education", "BA History, University of Leeds 2016 - 2019"];

/** How long something took, and what it gave or threw. */
async function timed<T>(run: () => Promise<T> | T): Promise<{ ms: number; value?: T; error?: unknown }> {
  const start = Date.now();
  try {
    return { value: await run(), ms: Date.now() - start };
  } catch (error) {
    return { error, ms: Date.now() - start };
  }
}
const codeOf = (e: unknown) => (e instanceof ImportError ? e.code : `not an ImportError: ${String(e)}`);

/* ------------------------------------------------------------------ sending */

const SETUP = { name: "My CV", level: "experienced", region: "uk" };
function form(fields: Record<string, string>, file?: { bytes: Uint8Array; name: string }): Request {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  if (file) fd.set("file", new File([file.bytes as BlobPart], file.name));
  return new Request("http://localhost/api", { method: "POST", body: fd });
}
const send = async (fields: Record<string, string>, file?: { bytes: Uint8Array; name: string }) => {
  const res = await imports.POST(form(fields, file));
  return { status: res.status, body: (await res.json()) as { importId?: string; versionId?: string; status?: string; error?: { code: string; message: string } | string; message?: string } };
};
const paste = (text: string) => send({ ...SETUP, text });
const record = async (id: string) => (await store.getOwnImport(id, alice.id))!;
/** Every CV the person has, with whether an upload record goes with it. */
async function cvsAndUploads() {
  const [cvs, uploads] = await Promise.all([store.listOwnCvs(alice.id), store.listOwnImports(alice.id)]);
  return { cvs: cvs.length, orphans: cvs.filter((c) => !uploads.some((u) => u.versionId === c.id)).length, uploads: uploads.length };
}

beforeEach(() => {
  signedIn = alice;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------- tests */

describe("the XML reader is walked once, whatever is in it", () => {
  it("reads what Word writes: elements, attributes, text, comments, CDATA and a stray “<”", () => {
    const root = parseXml('<?xml version="1.0"?><a x="1" y=\'two &amp; three\'><!-- a note --><b>one &lt; two</b><c/><d><![CDATA[kept <as> is]]></d>3 < 4</a>');
    const a = root.children[0];
    expect(a.attrs).toEqual({ x: "1", y: "two & three" });
    expect(a.children.map((c) => [c.name, c.text])).toEqual([["b", "one < two"], ["c", ""], ["d", "kept <as> is"]]);
    expect(a.text).toBe("3 < 4");
  });

  it("80,000 comments that never close cost one look, not 80,000", async () => {
    const xml = docXml(PARAS, "<!--".repeat(80_000));
    const run = await timed(() => parseXml(xml));
    expect(run.error).toBeUndefined();
    expect(run.ms).toBeLessThan(1000);
    // What came before the comment is still read.
    const body = run.value!.children[0].children[0];
    expect(body.children).toHaveLength(PARAS.length);
    // The same for a declaration and a CDATA block that never end.
    for (const open of ["<?", "<![CDATA["]) expect((await timed(() => parseXml(docXml(PARAS, open.repeat(80_000))))).ms).toBeLessThan(1000);
  });

  it("refuses a file nested deeper than Word writes, and one with more elements than any CV", () => {
    expect(codeOf(expectThrow(() => parseXml(`<w:document><w:body>${"<w:tbl><w:tr><w:tc>".repeat(70_000)}${para("deep")}`)))).toBe("unreadable");
    expect(codeOf(expectThrow(() => parseXml(`<a>${"<b/>".repeat(400_001)}</a>`)))).toBe("too-much");
  });

  it("refuses a DOCTYPE, so no entity is ever expanded or fetched", () => {
    const bomb = `<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;&lol;&lol;"><!ENTITY xxe SYSTEM "file:///etc/passwd">]><w:document ${NS}><w:body>${para("&lol2; &xxe;")}</w:body></w:document>`;
    expect(codeOf(expectThrow(() => parseXml(bomb)))).toBe("unreadable");
  });

  it("many attributes on a tag that never closes do not slow it down", async () => {
    const run = await timed(() => parseXml(`<a>${para("before")}<w:p ${'x="y" '.repeat(200_000)}`));
    expect(run.error).toBeUndefined();
    expect(run.ms).toBeLessThan(1000);
  });
});

function expectThrow(run: () => unknown): unknown {
  try {
    run();
  } catch (e) {
    return e;
  }
  throw new Error("did not throw");
}

describe("a Word file cannot be made to unpack without end", () => {
  it("reads a small honest file", async () => {
    const out = await extractDocx(new Uint8Array(docx(docXml())));
    expect(out.lines.map((l) => l.text)).toEqual(PARAS);
  });

  it("a part that says it is 1,000 bytes and is really 16 MB is stopped at the limit, not unpacked in full", async () => {
    const body = Buffer.concat([Buffer.from(`<w:document ${NS}><w:body>${PARAS.map(para).join("")}`), Buffer.alloc(16 * 1024 * 1024, 32), Buffer.from("</w:body></w:document>")]);
    const file = docx(body, [], 1000);
    // The whole upload is a few kilobytes.
    expect(file.length).toBeLessThan(64 * 1024);
    const run = await timed(() => extractDocx(new Uint8Array(file)));
    expect(codeOf(run.error)).toBe("too-much");
    expect(run.ms).toBeLessThan(5000);
  });

  it("a part that honestly says it is over the limit is refused before any of it is unpacked", async () => {
    const body = Buffer.concat([Buffer.from(`<w:document ${NS}><w:body>${PARAS.map(para).join("")}`), Buffer.alloc(13 * 1024 * 1024, 32), Buffer.from("</w:body></w:document>")]);
    const run = await timed(() => extractDocx(new Uint8Array(docx(body))));
    expect(codeOf(run.error)).toBe("too-much");
  });

  it("many page headers, each under the limit, are stopped by the limit on the whole file", async () => {
    const hdr = Buffer.concat([Buffer.from(`<w:hdr ${NS}>`), Buffer.from(para("x").repeat(Math.floor((11 * 1024 * 1024) / para("x").length))), Buffer.from("</w:hdr>")]);
    const compressed = zlib.deflateRawSync(hdr, { level: 1 });
    const file = docx(docXml(), Array.from({ length: 6 }, (_, i) => ({ name: `word/header${i + 1}.xml`, data: hdr, compressed })));
    const run = await timed(() => extractDocx(new Uint8Array(file)));
    expect(codeOf(run.error)).toBe("too-much");
  }, 60_000);

  it("a file of 3,001 parts is refused", async () => {
    const file = zip([TYPES, { name: "word/document.xml", data: Buffer.from(docXml()) }, ...Array.from({ length: 3001 }, (_, i) => ({ name: `x/${i}.xml`, data: Buffer.from("<a/>") }))]);
    expect(codeOf((await timed(() => extractDocx(new Uint8Array(file)))).error)).toBe("unreadable");
  });

  it("a file that is nothing but unclosed comments after its text is read, quickly, through the route", async () => {
    const file = docx(docXml(PARAS, "<!--".repeat(80_000)));
    const run = await timed(() => send(SETUP, { bytes: new Uint8Array(file), name: "c.docx" }));
    expect(run.value!.status).toBe(201);
    expect(run.value!.body.status).toBe("needs-review");
    expect(run.ms).toBeLessThan(3000);
  });
});

describe("a PDF cannot be made to draw without end", () => {
  it("reads a small honest file", async () => {
    const out = await extractPdf(new Uint8Array(pdf([textPage(CV_LINES)])), isOnlyDates);
    expect(out.lines.map((l) => l.text)).toContain("Ada Example");
    expect(out.pages).toBe(1);
  });

  it("a page that draws the same line 100,000 times is given up on part-way", async () => {
    const content = `BT\n/F1 10 Tf\n${"1 0 0 1 50 700 Tm (Ada Example catalogued objects) Tj\n".repeat(100_000)}ET`;
    const file = pdf([content]);
    // 5 MB of drawing in a file of a few kilobytes.
    expect(file.length).toBeLessThan(64 * 1024);
    const run = await timed(() => extractPdf(new Uint8Array(file), isOnlyDates));
    expect(codeOf(run.error)).toBe("too-much");
    expect(run.ms).toBeLessThan(15_000);
  }, 30_000);

  it("more pages than a CV has are refused", async () => {
    const run = await timed(() => readCvFile(new Uint8Array(pdf(Array.from({ length: 13 }, () => textPage(CV_LINES))))));
    expect(codeOf(run.error)).toBe("too-long");
  });

  it("through the route, a file that cannot be read gives a record that says why, never a bare error", async () => {
    const content = `BT\n/F1 10 Tf\n${"1 0 0 1 50 700 Tm (Ada Example catalogued objects) Tj\n".repeat(100_000)}ET`;
    const out = await send(SETUP, { bytes: new Uint8Array(pdf([content])), name: "s.pdf" });
    expect(out.status).toBe(201);
    expect(out.body.status).toBe("failed");
    expect(out.body.error).toMatchObject({ code: "too-much", message: "There is far more in that file than a CV holds, so it wasn’t read. Choose the file that holds just your CV, or paste just its text." });
    expect((await cvsAndUploads()).orphans).toBe(0);
  }, 30_000);
});

describe("an ordinary upload that holds more than a CV does", () => {
  const head = "Ada Example\nada@example.com\n07700 900123\nLeeds\n\n";
  const words = "managed the weekly rota for the front of house team and trained new volunteers in object handling and visitor care across both museum sites".split(" ");
  const prose = (n: number) => {
    let s = "";
    for (let i = 0; s.length < n; i++) s += `${words[i % words.length]} `;
    return s.trim();
  };
  const ROLE = "Experience\nGallery Assistant, Northgate Museum 2019 - 2023\n";
  const cases: Record<string, string> = {
    "an ordinary short CV": `${head}${ROLE}- Catalogued 1,200 objects in the collections database\n- Trained four volunteers\n\nEducation\nBA History, University of Leeds 2016 - 2019\n`,
    "a profile of 1,100 characters on one line": `${head}Profile\n${prose(1100)}.\n\n${ROLE}- Catalogued 1,200 objects in the collections database\n`,
    "one role with 35 bullets": `${head}${ROLE}${Array.from({ length: 35 }, (_, i) => `- Catalogued batch ${i + 1} of the ceramics collection`).join("\n")}\n`,
    "a skills line with 60 skills": `${head}Skills\n${Array.from({ length: 60 }, (_, i) => `Skill${i + 1}`).join(", ")}\n\n${ROLE}- Catalogued 1,200 objects\n`,
    "45 jobs": `${head}Experience\n${Array.from({ length: 45 }, (_, i) => `Assistant ${i + 1}, Museum ${i + 1} ${1975 + i} - ${1976 + i}\n- Catalogued objects in store ${i + 1}`).join("\n")}\n`,
    "a document that is not a CV (260 lines of prose)": Array.from({ length: 260 }, (_, i) => `Paragraph ${i + 1}: ${prose(120)}.`).join("\n"),
    "a whole CV pasted as one line of 1,500 characters": `${head}Experience Gallery Assistant, Northgate Museum 2019 - 2023 ${prose(1400)}`.replace(/\n+/g, " "),
    "one bullet of 1,400 characters": `${head}${ROLE}- ${prose(1400)}\n`,
  };

  it("every one of them is read into a record that can be stored, and no CV is left without its upload", async () => {
    for (const [label, text] of Object.entries(cases)) {
      const out = await paste(text);
      expect(out.status, label).toBe(201);
      expect(out.body.status, label).toBe("needs-review");
      const imp = await record(out.body.importId!);
      expect(CvImportSchema.safeParse(imp).success, label).toBe(true);
    }
    const all = await cvsAndUploads();
    expect(all).toEqual({ cvs: Object.keys(cases).length, orphans: 0, uploads: Object.keys(cases).length });
  });

  it("what does not fit is kept under “not placed”, never dropped", async () => {
    const bullets = await record((await paste(cases["one role with 35 bullets"])).body.importId!);
    const role = (bullets.draft.sections.find((s) => s.kind === "experience") as EntrySection).entries[0];
    expect(role.bullets).toHaveLength(LIMITS.bullets);
    expect(bullets.unassigned.map((u) => u.text)).toEqual(Array.from({ length: 5 }, (_, i) => `Catalogued batch ${31 + i} of the ceramics collection`));

    const skills = await record((await paste(cases["a skills line with 60 skills"])).body.importId!);
    const listed = (skills.draft.sections.find((s) => s.kind === "skills") as SkillsSection).groups.flatMap((g) => g.skills.map((k) => k.name));
    expect(listed).toHaveLength(LIMITS.skills);
    const aside = skills.unassigned.flatMap((u) => u.text.split(", "));
    expect([...listed, ...aside].sort()).toEqual(Array.from({ length: 60 }, (_, i) => `Skill${i + 1}`).sort());

    const long = await record((await paste(cases["one bullet of 1,400 characters"])).body.importId!);
    const kept = (long.draft.sections.find((s) => s.kind === "experience") as EntrySection).entries[0].bullets[0].text;
    expect(kept.length).toBeLessThanOrEqual(LIMITS.bullet);
    // The words of the line are all still there, in order: the start in the bullet, the rest set aside.
    const rest = long.unassigned.map((u) => u.text.replace(/^…/, "")).join(" ");
    expect(`${kept} ${rest}`.replace(/\s+/g, " ")).toBe(prose(1400));
  });

  it("a file with far more lines than a CV is refused with a reason", async () => {
    const out = await paste(`${head}${ROLE}${Array.from({ length: 1600 }, (_, i) => `- Item ${i + 1} done`).join("\n")}`);
    expect(out.status).toBe(201);
    expect(out.body.status).toBe("failed");
    expect(out.body.error).toMatchObject({ code: "too-much" });
    expect(codeOf(expectThrow(() => readCvText(`${head}${ROLE}${Array.from({ length: 1600 }, (_, i) => `- Item ${i + 1} done`).join("\n")}`)))).toBe("too-much");
  });

  it("the whole CV stays within what a save allows, so what was uploaded can always be edited and saved", () => {
    const read = readCvText(`${head}Experience\n${Array.from({ length: 45 }, (_, i) => `Assistant ${i + 1}, Museum ${i + 1} ${1975 + i} - ${1976 + i}\n${Array.from({ length: 12 }, (_, k) => `- Catalogued store ${i + 1} shelf ${k + 1}`).join("\n")}`).join("\n")}\n`);
    const fitted = fitRead(read);
    const entries = fitted.sections.flatMap((s) => ("entries" in s ? s.entries : []));
    expect(entries.length).toBeLessThanOrEqual(LIMITS.entries);
    expect(entries.reduce((n, e) => n + e.bullets.length, 0)).toBeLessThanOrEqual(LIMITS.totalLines);
    expect(fitted.unassigned.length).toBeLessThanOrEqual(RECORD_LIMITS.unassigned);
    // When even “not placed” is full, the last piece says how much more there was.
    if (fitted.unassigned.length === RECORD_LIMITS.unassigned) expect(fitted.unassigned.at(-1)!.text).toMatch(/^And \d+ more pieces that could not be placed\./);
  });
});

describe("the route counts what arrives, and leaves nothing half-made", () => {
  /** A body sent in pieces with no length given, as a script can send it. */
  const streamed = (total: number, headers: Record<string, string> = {}) => {
    let sent = 0;
    const piece = new Uint8Array(256 * 1024).fill(65);
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent >= total) return controller.close();
        sent += piece.length;
        controller.enqueue(piece);
      },
    });
    return { req: new Request("http://localhost/api", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=x", ...headers }, body, duplex: "half" } as RequestInit), sentSoFar: () => sent };
  };

  it("a body with no length given is stopped once it passes the limit, not read to the end", async () => {
    const big = streamed(40 * 1024 * 1024);
    const res = await imports.POST(big.req);
    expect(res.status).toBe(413);
    expect((await res.json()).message).toBe("That file is larger than 5 MB. Choose a smaller file, or paste the text of your CV.");
    // Reading stopped just past the limit: nowhere near the 40 MB on offer.
    expect(big.sentSoFar()).toBeLessThan(MAX_REQUEST_BYTES + 2 * 1024 * 1024);
    expect(await cvsAndUploads()).toEqual({ cvs: 0, orphans: 0, uploads: 0 });
  });

  it("a body that says it is small and is not is stopped the same way", async () => {
    const lying = streamed(12 * 1024 * 1024, { "content-length": "2048" });
    expect((await imports.POST(lying.req)).status).toBe(413);
    expect(lying.sentSoFar()).toBeLessThan(MAX_REQUEST_BYTES + 2 * 1024 * 1024);
  });

  it("the same limit holds when a file is replaced", async () => {
    const made = await paste("Ada Example\nada@example.com\n\nExperience\nGallery Assistant, Northgate Museum 2019 - 2023\n- Catalogued 1,200 objects\n");
    const big = streamed(40 * 1024 * 1024);
    const res = await replace.POST(big.req, { params: Promise.resolve({ id: made.body.importId! }) });
    expect(res.status).toBe(413);
  });

  it("if the upload record cannot be saved, the CV made for it is not left behind", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const spy = vi.spyOn(store, "saveImport").mockRejectedValueOnce(new Error("the database is away"));
    const out = await paste("Ada Example\nada@example.com\n\nExperience\nGallery Assistant, Northgate Museum 2019 - 2023\n- Catalogued 1,200 objects\n");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(out.status).toBe(500);
    expect(await cvsAndUploads()).toEqual({ cvs: 0, orphans: 0, uploads: 0 });
  });

  it("an upload that would start a CV past the limit is refused; an upload into a CV that exists is not", async () => {
    const first = (await (await versions.POST(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(SETUP) }))).json()).id as string;
    const now = new Date().toISOString();
    for (let i = 1; i < store.MAX_CVS; i++) await store.saveCv(newCv(alice.id, { name: `CV ${i}`, level: "experienced", region: "uk", targetTitle: "", targetEmployer: "", targetAdvert: "" }, now));
    const text = "Ada Example\nada@example.com\n\nExperience\nGallery Assistant, Northgate Museum 2019 - 2023\n- Catalogued 1,200 objects\n";
    const refused = await paste(text);
    expect(refused.status).toBe(400);
    expect(refused.body.message).toBe(store.TOO_MANY_CVS);
    expect((await send({ versionId: first, text })).status).toBe(201);
    expect((await store.listOwnCvs(alice.id)).length).toBe(store.MAX_CVS);
  });

  it("the list says when an upload could not be read, instead of offering it to be checked", async () => {
    const failed = await send(SETUP, { bytes: new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(500, 1)])), name: "cv.pdf" });
    expect(failed.body.status).toBe("failed");
    const ok = await paste("Ada Example\nada@example.com\n\nExperience\nGallery Assistant, Northgate Museum 2019 - 2023\n- Catalogued 1,200 objects\n");
    const rows = await store.listCvSummaries(alice.id);
    expect(rows.find((r) => r.id === failed.body.versionId)).toMatchObject({ pendingImportId: failed.body.importId, importFailed: true });
    expect(rows.find((r) => r.id === ok.body.versionId)!.importFailed).toBeUndefined();
  });
});
