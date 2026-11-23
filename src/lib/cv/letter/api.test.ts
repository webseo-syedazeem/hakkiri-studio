import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The store writes to a throwaway folder; each test chooses who is signed in and what the AI service replies.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-letter-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

/** A stand-in for the AI service: like the real helper, a reply that fails the caller's check is retried once and then given up on. */
const ai = vi.hoisted(() => ({ mode: "ai" as "ai" | "rules" | "off", replies: [] as unknown[], calls: [] as { label: string; system: string; user: string }[] }));
vi.mock("@/lib/ai/mock", async (original) => ({ ...(await original<typeof import("@/lib/ai/mock")>()), mockAiEnabled: () => ai.mode === "rules" }));
vi.mock("@/lib/ai/config", () => ({
  aiConfig: {
    get anthropicKey() {
      return ai.mode === "ai" ? "test-key" : "";
    },
    geminiKey: "",
    mainModel: "test-model",
    fastModel: "test-model",
  },
  missingKeys: () => [],
}));
vi.mock("@/lib/ai/ask", () => ({
  ask: async (o: { label: string; system: string; user: string; schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } }; check: (v: unknown) => string[] }) => {
    ai.calls.push({ label: o.label, system: o.system, user: o.user });
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!ai.replies.length) return null;
      const parsed = o.schema.safeParse(ai.replies.shift());
      if (parsed.success && o.check(parsed.data).length === 0) return parsed.data;
    }
    return null;
  },
}));

const versions = await import("@/app/api/cv/versions/route");
const one = await import("@/app/api/cv/versions/[id]/route");
const duplicate = await import("@/app/api/cv/versions/[id]/duplicate/route");
const tailor = await import("@/app/api/cv/versions/[id]/tailor/route");
const letterRoute = await import("@/app/api/cv/versions/[id]/letter/[tool]/route");
const cvExport = await import("@/app/api/cv/versions/[id]/export/route");
const cvCheck = await import("@/app/api/cv/versions/[id]/check/route");
const exportsRoute = await import("@/app/api/cv/versions/[id]/exports/route");
const exportOne = await import("@/app/api/cv/exports/[exportId]/route");
const exportFile = await import("@/app/api/cv/exports/[exportId]/file/route");
const store = await import("@/lib/cv/store");
const { extractPdf } = await import("@/lib/cv/import/pdf");
const { isOnlyDates } = await import("@/lib/cv/import/dates");
const { letterByRule } = await import("./draft");
const { reviewLetter, reflow } = await import("./check");
const { ADVERT, REASON, letterCv, lineAt, experience } = await import("./testing");
type CvDoc = import("../schema").CvDoc;
type Letter = import("../schema").Letter;

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const json = (body: unknown, method = "POST", url = "http://localhost/api") => new Request(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const get = (url = "http://localhost/api") => new Request(url);
const tool = (id: string, name: string) => ({ params: Promise.resolve({ id, tool: name }) });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

/** The sample CV with its advert and a letter's inputs, owned by whoever is signed in. `letter` is merged over the inputs. */
async function saved(letter: Partial<Letter> | null = {}, change: (cv: CvDoc) => void = () => {}): Promise<string> {
  const id = (await (await versions.POST(json({ name: "Fern CV", level: "experienced", region: "uk", targetTitle: "Collections officer", targetEmployer: "Lantern Atlas", targetAdvert: ADVERT }))).json()).id as string;
  const mine = (await store.getOwnCv(id, signedIn!.id))!;
  const sample = letterCv(letter ?? {});
  const next: CvDoc = { ...mine, contact: sample.contact, sections: sample.sections, requirements: sample.requirements, target: sample.target, letter: letter === null ? undefined : sample.letter };
  change(next);
  await store.saveCv(next);
  return id;
}
/** The same, with the rule-assembled letter already in place. */
async function withLetter(change: (cv: CvDoc) => void = () => {}): Promise<string> {
  return saved({}, (cv) => {
    cv.letter = { ...cv.letter!, paragraphs: letterByRule(cv, new Date()).paragraphs, started: true };
    change(cv);
  });
}
const post = async (id: string, name: string, body: unknown = {}, query = "") => {
  const res = await letterRoute.POST(json(body, "POST", `http://localhost/api/cv/versions/${id}/letter/${name}${query}`), tool(id, name));
  return { status: res.status, body: await res.json() };
};
const file = (id: string, query: string) => letterRoute.GET(get(`http://localhost/api/cv/versions/${id}/letter/export?${query}`), tool(id, "export"));
const sentences = (paragraphs: { sentences: { text: string }[] }[]) => paragraphs.map((p) => p.sentences.map((s) => s.text));

beforeEach(() => {
  signedIn = alice;
  ai.mode = "rules";
  ai.replies = [];
  ai.calls = [];
  // Each test starts with an empty store.
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
});

describe("drafting a letter", () => {
  it("needs the person's reason and at least one line of their CV", async () => {
    const id = await saved({ reason: "", evidence: [] });
    const { status, body } = await post(id, "draft");
    expect(status).toBe(400);
    expect(Object.keys(body.fields).sort()).toEqual(["evidence", "reason"]);
    // A line that is no longer on the CV does not count as chosen.
    const gone = await saved({ evidence: [{ section: "s_nope", entry: "e_nope", field: "b_nope" }] });
    expect((await post(gone, "draft")).body.fields).toEqual({ evidence: "Choose one or two lines of your CV for the letter to use." });
  });

  it("is not there for somebody else's CV", async () => {
    const id = await saved();
    signedIn = bob;
    for (const name of ["draft", "shorten", "check"]) expect((await post(id, name)).status).toBe(404);
    expect((await file(id, "format=pdf")).status).toBe(404);
  });

  it("in test mode gives the letter assembled from the person's own words, and calls no model", async () => {
    const id = await saved();
    const { status, body } = await post(id, "draft");
    expect(status).toBe(200);
    expect(body.by).toBe("rules");
    expect(body.mode).toBe("rules");
    expect(sentences(body.paragraphs)[0]).toEqual(["I’m applying for the Collections officer role at Lantern Atlas.", REASON]);
    expect(ai.calls).toEqual([]);
    // Nothing is written by drafting: the letter is saved only when the person takes it.
    expect((await store.getOwnCv(id, alice.id))!.letter!.paragraphs).toEqual([]);
  });

  it("with AI, returns the model's letter when every sentence passes the source check", async () => {
    ai.mode = "ai";
    const id = await saved();
    ai.replies = [
      {
        paragraphs: [
          { role: "opening", sentences: ["I’m applying for the Collections officer role at Lantern Atlas.", "I’ve loved maps since I was a child, and I want to work somewhere that opens its collection to the public."] },
          { role: "evidence", sentences: ["Your advert asks for experience training volunteers.", "At Folio House, I trained six new starters on the café till & the catalogue."] },
          { role: "close", sentences: ["I’d welcome the chance to talk about how I could contribute to Lantern Atlas."] },
        ],
      },
    ];
    const { body } = await post(id, "draft");
    expect(body.by).toBe("ai");
    expect(body.paragraphs).toHaveLength(3);
    expect(body.paragraphs[1].sentences[1].sources[0]).toMatchObject({ kind: "cv", text: "Trained six new starters on the café till & the catalogue." });
    expect(body.paragraphs[1].sentences[0].sources[0]).toMatchObject({ kind: "advert" });
    expect(ai.calls[0].label).toBe("cv-letter");
    expect(ai.calls[0].system).toContain("You never add a fact");
    expect(ai.calls[0].system).toContain("they use contractions");
    // The model is given the person's own material and nothing else.
    const given = JSON.parse(ai.calls[0].user);
    expect(given.reason_in_their_words).toBe(REASON);
    expect(given.chosen_lines).toHaveLength(2);
  });

  it.each([
    ["experience taken from the advert", "I have five years’ experience with Spectrum."],
    ["an invented figure", "At Folio House, I trained sixty new starters on the café till & the catalogue."],
    ["praise the person never wrote", "I am a passionate and dedicated archivist."],
    ["a fact about the employer that is not in the advert", "Lantern Atlas is the UK’s leading map museum."],
  ])("with AI, a draft with %s is never shown: the person's own words are used instead", async (_what, bad) => {
    ai.mode = "ai";
    const id = await saved();
    const reply = {
      paragraphs: [
        { role: "opening", sentences: ["I’m applying for the Collections officer role at Lantern Atlas."] },
        { role: "evidence", sentences: [bad] },
        { role: "close", sentences: ["Thank you for considering my application."] },
      ],
    };
    ai.replies = [reply, reply];
    const { body } = await post(id, "draft");
    expect(body.by).toBe("rules");
    expect(sentences(body.paragraphs).flat().join(" ")).not.toContain(bad);
    expect(body.notes.at(-1)).toBe("The AI draft didn’t pass the source check, so this letter is assembled from your own words instead.");
    expect(ai.calls).toHaveLength(1);
  });

  it("without keys, still gives the assembled letter and says AI drafting isn’t available", async () => {
    ai.mode = "off";
    const id = await saved();
    const { body } = await post(id, "draft");
    expect(body.by).toBe("rules");
    expect(body.mode).toBe("off");
    expect(body.notes.at(-1)).toContain("AI drafting isn’t available right now");
    expect(ai.calls).toEqual([]);
  });
});

describe("a shorter wording", () => {
  const paragraphOf = async (id: string) => (await store.getOwnCv(id, alice.id))!.letter!.paragraphs[2];

  it("is offered only with AI, and only when it keeps every source and every figure", async () => {
    const id = await withLetter((cv) => {
      cv.letter!.paragraphs[2].sentences = reflow([], "At Folio House, I trained six new starters on the café till & the catalogue. I prepared reading-room requests for visiting researchers.");
    });
    const p = await paragraphOf(id);
    expect((await post(id, "shorten", { paragraphId: p.id })).body.sentences).toBeNull();
    ai.mode = "ai";
    ai.replies = [{ sentences: ["At Folio House, I trained six new starters and prepared reading-room requests."] }];
    const good = await post(id, "shorten", { paragraphId: p.id });
    expect(good.body.sentences.map((s: { text: string }) => s.text)).toEqual(["At Folio House, I trained six new starters and prepared reading-room requests."]);
    // Dropping the figure is refused, and so is anything not shorter.
    ai.replies = [{ sentences: ["At Folio House, I trained new starters."] }, { sentences: ["At Folio House, I trained new starters."] }];
    expect((await post(id, "shorten", { paragraphId: p.id })).body.sentences).toBeNull();
    expect((await post(id, "shorten", { paragraphId: "lp_nope" })).status).toBe(400);
  });
});

describe("downloading a letter", () => {
  it("refuses while there is no letter", async () => {
    const id = await saved();
    const res = await file(id, "format=pdf");
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("empty");
    expect((await file(id, "format=txt")).status).toBe(400);
  });

  it("refuses while a sentence has no source, and names the sentence", async () => {
    const id = await withLetter((cv) => {
      cv.letter!.paragraphs[2].sentences = reflow(cv.letter!.paragraphs[2].sentences, `${cv.letter!.paragraphs[2].sentences.map((s) => s.text).join(" ")} I have five years’ experience with Spectrum.`);
    });
    const res = await file(id, "format=pdf");
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("unsourced");
    expect(body.message).toBe("One sentence needs a source before this letter can be downloaded.");
    expect(body.sentences).toHaveLength(1);
    expect(body.sentences[0]).toMatchObject({ text: "I have five years’ experience with Spectrum.", state: "unsupported" });
    expect((await post(id, "check")).status).toBe(409);
    expect((await store.listOwnExports(alice.id, id))).toEqual([]);
  });

  it("refuses while a sentence rests on a CV line that has since changed", async () => {
    const id = await withLetter();
    const cv = (await store.getOwnCv(id, alice.id))!;
    experience(cv).entries[1].bullets[1].text = "Trained eight new starters on the café till & the catalogue.";
    await store.saveCv(cv);
    const body = await (await file(id, "format=docx")).json();
    expect(body.error).toBe("unsourced");
    expect(body.sentences[0].state).toBe("review");
  });

  it("sends a PDF that was read back first, dated the person's own today, and remembers it", async () => {
    const id = await withLetter();
    const res = await file(id, "format=pdf&today=2026-11-24");
    expect(res.status).toBe(200);
    expect(res.headers.get("x-cv-check")).toBe("checked");
    expect(res.headers.get("x-cv-pages")).toBe("1");
    expect(res.headers.get("x-cv-letter-pages")).toBe("1");
    expect(res.headers.get("content-disposition")).toContain("Fern%20Example%20-%20Collections%20officer%20-%20Cover%20Letter.pdf");
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Read with the upload reader, which shares no code with the writer.
    const text = (await extractPdf(bytes, isOnlyDates, { keepEdges: true })).lines.map((l) => l.text).join("\n");
    expect(text).toContain("24 November 2026");
    expect(text).toContain("Dear Hiring Manager,");
    expect(text).toContain("At Folio House, I trained six new starters");
    const [record] = await store.listOwnExports(alice.id, id);
    expect(record).toMatchObject({ what: "letter", format: "pdf", checked: true, pages: 1, name: "Fern Example - Collections officer - Cover Letter.pdf" });
    // The record keeps the letter, the CV and the advert as they were, with the date it was sent with.
    expect(record.cv.letter!.date).toBe("2026-11-24");
    expect(record.cv.letter!.paragraphs).toHaveLength(4);
    expect(record.cv.target!.advert).toBe(ADVERT);
    expect(res.headers.get("x-cv-export")).toBe(record.id);
  });

  it("can put the letter and the CV in one file, as Word or PDF", async () => {
    const id = await withLetter();
    const res = await file(id, "format=docx&with=cv");
    expect(res.status).toBe(200);
    expect(res.headers.get("x-cv-check")).toBe("checked");
    expect(res.headers.get("content-disposition")).toContain("Cover%20Letter%20and%20CV.docx");
    const pdf = await file(id, "format=pdf&with=cv");
    expect(Number(pdf.headers.get("x-cv-pages"))).toBeGreaterThanOrEqual(2);
    expect(pdf.headers.get("x-cv-letter-pages")).toBe("1");
    expect((await store.listOwnExports(alice.id, id)).map((r) => r.what).sort()).toEqual(["both", "both"]);
  });

  it("makes the same file again from the record, even after the letter and the CV have changed", async () => {
    const id = await withLetter();
    const first = new Uint8Array(await (await file(id, "format=pdf&today=2026-11-24")).arrayBuffer());
    const [record] = await store.listOwnExports(alice.id, id);
    const cv = (await store.getOwnCv(id, alice.id))!;
    cv.letter!.paragraphs = cv.letter!.paragraphs.slice(0, 1);
    cv.contact.fullName = "Somebody Else";
    await store.saveCv(cv);
    const again = await exportFile.GET(get(), { params: Promise.resolve({ exportId: record.id }) });
    expect(again.status).toBe(200);
    expect(Buffer.from(new Uint8Array(await again.arrayBuffer())).equals(Buffer.from(first))).toBe(true);
    // The record can be opened with the letter as it was, and is listed without its contents.
    const opened = (await (await exportOne.GET(get(), { params: Promise.resolve({ exportId: record.id }) })).json()).export;
    expect(opened.cv.letter.paragraphs).toHaveLength(4);
    expect(opened.cv.contact.fullName).toBe("Fern Example");
    const listed = (await (await exportsRoute.GET(get(), ctx(id))).json()).exports;
    expect(listed[0]).toMatchObject({ id: record.id, what: "letter" });
    expect(listed[0].cv).toBeUndefined();
    signedIn = bob;
    expect((await exportFile.GET(get(), { params: Promise.resolve({ exportId: record.id }) })).status).toBe(404);
  });

  it("checks both files without downloading either", async () => {
    const id = await withLetter();
    const { status, body } = await post(id, "check", {}, "?with=cv");
    expect(status).toBe(200);
    expect(body.withCv).toBe(true);
    expect(body.pdf).toMatchObject({ status: "checked", name: "Fern Example - Collections officer - Cover Letter and CV.pdf" });
    expect(body.docx).toMatchObject({ status: "checked" });
    expect(await store.listOwnExports(alice.id, id)).toEqual([]);
  });
});

describe("the letter is part of its version", () => {
  it("is saved, changed and removed with the CV's ordinary save", async () => {
    const id = await saved(null);
    const cv = (await store.getOwnCv(id, alice.id))!;
    expect(cv.letter).toBeUndefined();
    const letter = { ...letterCv().letter!, evidence: [lineAt(cv, 0, 1)], reason: "  I want this role because of the maps.  " };
    const put = await (await one.PATCH(json({ rev: cv.rev, letter }, "PATCH"), ctx(id))).json();
    expect(put.cv.letter.reason).toBe("I want this role because of the maps.");
    expect(put.cv.rev).toBe(cv.rev + 1);
    // A change to something else leaves the letter alone.
    const renamed = await (await one.PATCH(json({ rev: put.cv.rev, name: "Renamed" }, "PATCH"), ctx(id))).json();
    expect(renamed.cv.letter.reason).toBe("I want this role because of the maps.");
    const removed = await (await one.PATCH(json({ rev: renamed.cv.rev, letter: null }, "PATCH"), ctx(id))).json();
    expect(removed.cv.letter).toBeUndefined();
  });

  it("refuses a letter that is not a letter", async () => {
    const id = await saved(null);
    const cv = (await store.getOwnCv(id, alice.id))!;
    for (const letter of [{ paragraphs: "nope" }, { ...letterCv().letter!, date: "23/11/2026" }, { ...letterCv().letter!, paragraphs: [{ id: "x", sentences: [] }] }]) {
      expect((await one.PATCH(json({ rev: cv.rev, letter }, "PATCH"), ctx(id))).status).toBe(400);
    }
    signedIn = bob;
    expect((await one.PATCH(json({ rev: cv.rev, letter: letterCv().letter }, "PATCH"), ctx(id))).status).toBe(404);
  });

  it("goes with a duplicate, and not with a version tailored to another job", async () => {
    const id = await withLetter();
    const copy = (await (await duplicate.POST(json({}), ctx(id))).json()).id as string;
    expect((await store.getOwnCv(copy, alice.id))!.letter!.paragraphs).toHaveLength(4);
    const other = (await (await tailor.POST(json({ title: "Archivist", employer: "Other Museum", advert: "Essential\n- Experience cataloguing paper collections and maps in a public archive" }), ctx(id))).json()).id as string;
    expect((await store.getOwnCv(other, alice.id))!.letter).toBeUndefined();
  });

  it("shows on the list of CVs, and is in “Download my data” and “Delete all my data”", async () => {
    const id = await withLetter();
    const rows = await store.listCvSummaries(alice.id);
    expect(rows.find((r) => r.id === id)!.letter).toBe(true);
    await file(id, "format=pdf");
    const held = await store.exportCvData(alice.id);
    expect(held.cvs[0].letter!.reason).toBe(REASON);
    expect(held.exports[0].cv.letter!.paragraphs).toHaveLength(4);
    await store.deleteCvData(alice.id);
    expect(await store.exportCvData(alice.id)).toEqual({ cvs: [], uploads: [], achievements: [], exports: [] });
  });

  it("a saved letter passes the same review on the server as on the screen", async () => {
    const id = await withLetter();
    expect(reviewLetter((await store.getOwnCv(id, alice.id))!, new Date()).open).toEqual([]);
  });
});

describe("achievements marked private stay out of what is sent", () => {
  const ACH = "ach_00000000000000aa";
  /** A letter whose second evidence line comes from a saved achievement. */
  async function withPrivate(isPrivate: boolean) {
    const id = await withLetter((cv) => void (experience(cv).entries[1].bullets[1].bankId = ACH));
    const now = new Date().toISOString();
    await store.saveAchievement({ id: ACH, userId: alice.id, text: "Trained six new starters on the café till & the catalogue.", original: "", sources: [], role: "Library assistant", org: "Folio House", skills: [], private: isPrivate, createdAt: now, updatedAt: now });
    return id;
  }

  it("a CV that uses one is not made into a file, and the line is named", async () => {
    const id = await withPrivate(true);
    const res = await cvExport.GET(get(`http://localhost/api/cv/versions/${id}/export?format=pdf`), ctx(id));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("private");
    expect(body.message).toBe("This CV uses a line from an achievement you marked private: “Trained six new starters on the café till & the catalogue.” (Library assistant · Folio House). Remove or reword it, or make the achievement not private, and then download.");
    expect(body.lines).toHaveLength(1);
    expect((await cvCheck.POST(json({}), ctx(id))).status).toBe(409);
    expect(await store.listOwnExports(alice.id, id)).toEqual([]);
  });

  it("nor is a letter that rests on it, alone or with the CV", async () => {
    const id = await withPrivate(true);
    for (const query of ["format=pdf", "format=docx&with=cv"]) {
      const res = await file(id, query);
      expect(res.status, query).toBe(409);
      expect((await res.json()).error).toBe("private");
    }
    expect((await post(id, "check")).body.error).toBe("private");
  });

  it("a letter that does not rest on the line can go on its own, but not with the CV", async () => {
    const id = await withPrivate(true);
    const cv = (await store.getOwnCv(id, alice.id))!;
    cv.letter!.paragraphs = cv.letter!.paragraphs.filter((p) => !p.sentences.some((s) => s.text.includes("six new starters")));
    await store.saveCv(cv);
    expect((await file(id, "format=pdf")).status).toBe(200);
    expect((await (await file(id, "format=pdf&with=cv")).json()).error).toBe("private");
  });

  it("once the line is switched off, or the achievement is no longer private, the files are made", async () => {
    const id = await withPrivate(false);
    expect((await cvExport.GET(get(`http://localhost/api/cv/versions/${id}/export?format=pdf`), ctx(id))).status).toBe(200);
    expect((await file(id, "format=pdf&with=cv")).status).toBe(200);
    const again = await withPrivate(true);
    const cv = (await store.getOwnCv(again, alice.id))!;
    experience(cv).entries[1].bullets[1].visible = false;
    await store.saveCv(cv);
    expect((await cvExport.GET(get(`http://localhost/api/cv/versions/${again}/export?format=pdf`), ctx(again))).status).toBe(200);
    // The letter still rests on the line that was switched off: that is "Review source", not a privacy matter.
    expect((await (await file(again, "format=pdf")).json()).error).toBe("unsourced");
  });
});
