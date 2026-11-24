import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * One number everywhere, and nothing left behind. The list of CVs, the builder
 * and a reloaded builder must show the same score for the same saved CV; a
 * deleted CV must take its records with it; and one person cannot make CVs
 * without end, or faster than anyone clicking could.
 */

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-numbers-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const versions = await import("@/app/api/cv/versions/route");
const one = await import("@/app/api/cv/versions/[id]/route");
const check = await import("@/app/api/cv/versions/[id]/check/route");
const download = await import("@/app/api/cv/versions/[id]/export/route");
const software = await import("@/app/api/cv/versions/[id]/software/route");
const duplicate = await import("@/app/api/cv/versions/[id]/duplicate/route");
const tailor = await import("@/app/api/cv/versions/[id]/tailor/route");
const store = await import("@/lib/cv/store");
const { NEW_CVS_A_MINUTE, newCv } = await import("./access");
const { scoreCv } = await import("./score/score");
const { fontsNeeded, layoutCv } = await import("./render/layout");
const { loadFonts } = await import("./render/server");
const { paperStyle } = await import("./render/templates");
const { fernCv } = await import("./render/testing");
type CvDoc = import("./schema").CvDoc;

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const get = (query = "") => new Request(`http://localhost/api${query}`);
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const ADVERT = "Collections Assistant\n\nEssential\n- Experience of cataloguing museum collections\n- Ability to supervise volunteers and placement students";

async function filled(name = "Fern CV"): Promise<CvDoc> {
  const id = (await (await versions.POST(json({ name, level: "experienced", region: "uk" }))).json()).id as string;
  const cv = (await store.getOwnCv(id, signedIn!.id))!;
  const fern = fernCv();
  return store.saveCv({ ...cv, contact: fern.contact, sections: fern.sections });
}
const listed = async (id: string) => ((await (await versions.GET()).json()).cvs as { id: string; score?: number }[]).find((c) => c.id === id)!;
const loaded = async (id: string) => (await (await one.GET(get(), ctx(id))).json()) as { cv: CvDoc; files?: { rev: number; pdf?: { status: string; missing?: string[] }; docx?: { status: string } } };
/** The score as the builder works it out: the page it lays out, the characters its fonts lack, and the file checks it holds. */
function builderScore(cv: CvDoc, files: { pdf?: "checked" | "loss" | "failed"; docx?: "checked" | "loss" | "failed" }): number {
  const { layout } = layoutCv(cv, loadFonts(fontsNeeded(paperStyle(cv.design))));
  return scoreCv({ cv, pages: layout.pages, missingGlyphs: layout.missing, files, now: new Date() }).shown;
}

beforeEach(() => {
  signedIn = alice;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
  (globalThis as unknown as { __hakkiriCvNumbers?: Map<string, unknown> }).__hakkiriCvNumbers?.clear();
});

describe("one score everywhere", () => {
  it("the list shows the number the builder shows, before and after the files are checked", async () => {
    const cv = await filled();
    // Before any file is checked: the page count is known (the page is laid out), the file checks are pending.
    expect((await listed(cv.id)).score).toBe(builderScore(cv, {}));
    expect((await loaded(cv.id)).files).toBeUndefined();

    const checked = await (await check.POST(json({}), ctx(cv.id))).json();
    expect([checked.pdf.status, checked.docx.status]).toEqual(["checked", "checked"]);
    const after = builderScore(cv, { pdf: "checked", docx: "checked" });
    expect((await listed(cv.id)).score).toBe(after);
    expect(after).toBeGreaterThan(builderScore(cv, {}));
  });

  it("a reload does not forget the file checks: they come back with the CV, for the revision they were made on", async () => {
    const cv = await filled();
    await check.POST(json({}), ctx(cv.id));
    const again = await loaded(cv.id);
    expect(again.files).toMatchObject({ rev: cv.rev, pdf: { status: "checked" }, docx: { status: "checked" } });
    // Once the CV changes, the checks are out of date: they are not sent, and the list's number says "pending" again.
    const saved = (await (await one.PATCH(json({ rev: cv.rev, name: "Fern CV, renamed" }, "PATCH"), ctx(cv.id))).json()).cv as CvDoc;
    expect(saved.rev).toBe(cv.rev + 1);
    expect((await loaded(cv.id)).files).toBeUndefined();
    expect((await listed(cv.id)).score).toBe(builderScore(saved, {}));
  });

  it("a download and the Software view each record the check they made", async () => {
    const cv = await filled();
    const file = await download.GET(get("?format=pdf"), ctx(cv.id));
    expect(file.headers.get("x-cv-check")).toBe("checked");
    let files = (await loaded(cv.id)).files!;
    expect([files.pdf?.status, files.docx?.status]).toEqual(["checked", undefined]);
    expect((await listed(cv.id)).score).toBe(builderScore(cv, { pdf: "checked" }));
    expect((await (await software.GET(get("?format=docx"), ctx(cv.id))).json()).status).toBe("checked");
    files = (await loaded(cv.id)).files!;
    expect([files.pdf?.status, files.docx?.status]).toEqual(["checked", "checked"]);
  });

  it("a check made on an older revision never replaces a newer one", async () => {
    const cv = await filled();
    await store.noteFileChecks({ id: cv.id, userId: alice.id, rev: 5 }, { pdf: { status: "checked" } });
    await store.noteFileChecks({ id: cv.id, userId: alice.id, rev: 4 }, { pdf: { status: "loss" } });
    expect(await store.currentFileChecks({ id: cv.id, userId: alice.id, rev: 5 })).toMatchObject({ rev: 5, pdf: { status: "checked" } });
    // And nobody else's checks are ever read as this person's.
    expect(await store.currentFileChecks({ id: cv.id, userId: bob.id, rev: 5 })).toBeNull();
  });

  it("the list does not score a CV again until it changes", async () => {
    const cv = await filled();
    const kept = () => (globalThis as unknown as { __hakkiriCvNumbers: Map<string, unknown> }).__hakkiriCvNumbers;
    await listed(cv.id);
    await listed(cv.id);
    await listed(cv.id);
    expect(kept().size).toBe(1);
    const first = [...kept().values()][0];
    await listed(cv.id);
    // The very same answer is handed back, not a new one worked out.
    expect([...kept().values()][0]).toBe(first);
    await one.PATCH(json({ rev: cv.rev, name: "Changed" }, "PATCH"), ctx(cv.id));
    await listed(cv.id);
    expect(kept().size).toBe(2);
  });
});

describe("deleting a CV removes what was kept for it", () => {
  it("its download records and file checks go with it; another CV's stay", async () => {
    const cv = await filled();
    const other = await filled("Second CV");
    await download.GET(get("?format=pdf"), ctx(cv.id));
    await download.GET(get("?format=docx"), ctx(cv.id));
    await download.GET(get("?format=pdf"), ctx(other.id));
    await check.POST(json({}), ctx(cv.id));
    expect((await store.listOwnExports(alice.id)).map((r) => r.versionId).sort()).toEqual([cv.id, cv.id, other.id].sort());
    expect((await store.listOwnFileChecks(alice.id)).map((r) => r.id).sort()).toEqual([cv.id, other.id].sort());

    expect((await one.DELETE(get(), ctx(cv.id))).status).toBe(200);
    // Each record held a full copy of the CV as it was downloaded: none is left.
    expect((await store.listOwnExports(alice.id)).map((r) => r.versionId)).toEqual([other.id]);
    expect((await store.listOwnFileChecks(alice.id)).map((r) => r.id)).toEqual([other.id]);
    expect(await store.getOwnCv(cv.id, alice.id)).toBeNull();
  });

  it("someone else cannot delete it, and their attempt removes nothing", async () => {
    const cv = await filled();
    await download.GET(get("?format=pdf"), ctx(cv.id));
    signedIn = bob;
    expect((await one.DELETE(get(), ctx(cv.id))).status).toBe(404);
    expect(await store.listOwnExports(alice.id)).toHaveLength(1);
    expect(await store.getOwnCv(cv.id, alice.id)).not.toBeNull();
  });

  it("“Delete all my data” removes the file checks too, and “Download my data” includes them", async () => {
    const cv = await filled();
    await check.POST(json({}), ctx(cv.id));
    expect((await store.exportCvData(alice.id)).fileChecks).toHaveLength(1);
    await store.deleteCvData(alice.id);
    const left = await store.exportCvData(alice.id);
    expect([left.cvs.length, left.uploads.length, left.achievements.length, left.exports.length, left.fileChecks.length]).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("how many CVs, and how fast", () => {
  it("making, copying and tailoring all stop at the same limit", async () => {
    const first = await filled();
    const now = new Date().toISOString();
    for (let i = 1; i < store.MAX_CVS; i++) await store.saveCv(newCv(alice.id, { name: `CV ${i}`, level: "experienced", region: "uk", targetTitle: "", targetEmployer: "", targetAdvert: "" }, now));
    expect(await store.atCvLimit(alice.id)).toBe(true);
    for (const res of [
      await versions.POST(json({ name: "One more", level: "experienced", region: "uk" })),
      await duplicate.POST(json({}), ctx(first.id)),
      await tailor.POST(json({ title: "Collections Assistant", employer: "Harbour Museum", advert: ADVERT }), ctx(first.id)),
    ]) {
      expect(res.status).toBe(400);
      expect((await res.json()).message).toBe(store.TOO_MANY_CVS);
    }
    expect((await store.listOwnCvs(alice.id)).length).toBe(store.MAX_CVS);
    // Someone else's CVs do not count towards it.
    signedIn = bob;
    expect((await versions.POST(json({ name: "Bob's", level: "experienced", region: "uk" }))).status).toBe(201);
  });

  it("one person cannot make CVs faster than anyone clicking could, and is not slowed by someone else", async () => {
    const first = await filled();
    for (let i = 1; i < NEW_CVS_A_MINUTE; i++) expect((await duplicate.POST(json({}), ctx(first.id))).status, `copy ${i}`).toBe(201);
    for (const res of [await duplicate.POST(json({}), ctx(first.id)), await versions.POST(json({ name: "x", level: "experienced", region: "uk" })), await tailor.POST(json({ title: "Collections Assistant", employer: "", advert: ADVERT }), ctx(first.id))]) {
      expect(res.status).toBe(429);
      expect((await res.json()).message).toBe("That’s a lot of new CVs in a short time. Wait a minute, then try again.");
    }
    signedIn = bob;
    expect((await versions.POST(json({ name: "Bob's", level: "experienced", region: "uk" }))).status).toBe(201);
  });
});

describe("small promises kept", () => {
  it("a tailored version's name always says which job it is for, however long the base name", async () => {
    const cv = await filled("N".repeat(120));
    const made = await (await tailor.POST(json({ title: "Collections Assistant", employer: "Harbour Museum", advert: ADVERT }), ctx(cv.id))).json();
    expect(made.name).toHaveLength(120);
    expect(made.name.endsWith(" – Harbour Museum")).toBe(true);
    expect(made.name).not.toBe(cv.name);
  });

  it("“ATS-ready” is not said of a CV with almost nothing on it, though its file reads back perfectly", async () => {
    const id = (await (await versions.POST(json({ name: "Thin", level: "experienced", region: "uk" }))).json()).id as string;
    const cv = (await store.getOwnCv(id, alice.id))!;
    const fern = fernCv();
    const sections = cv.sections.map((s) => (s.kind === "experience" && "entries" in s ? { ...s, entries: [{ ...(fern.sections.find((x) => x.kind === "experience") as typeof s).entries[0], bullets: [(fern.sections.find((x) => x.kind === "experience") as typeof s).entries[0].bullets[0]] }] } : s));
    await store.saveCv({ ...cv, contact: fern.contact, sections });
    const thin = await (await software.GET(get("?format=pdf"), ctx(id))).json();
    expect(thin.status).toBe("checked");
    expect(thin.atsReady).toBe(false);
    expect(thin.why.join(" ")).toMatch(/too little on the CV to call it ready\. It still needs: 6 different lines saying what you did \(it has 1\); a qualification, certificate or course\./);
    // A CV with what a CV needs is not held back by this.
    const full = await filled();
    const view = await (await software.GET(get("?format=pdf"), ctx(full.id))).json();
    expect(view.why.join(" ")).not.toMatch(/too little/);
  });
});
