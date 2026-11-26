import { describe, expect, it, beforeEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The CV store writes to a throwaway folder, and each test chooses who is signed in.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-api-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
// The reader that checks exported files can be made to fail, to see what happens when it is down.
const reader = vi.hoisted(() => ({ down: false }));
vi.mock("@/lib/cv/render/readback", async (original) => {
  const real = await original<typeof import("@/lib/cv/render/readback")>();
  const orFail =
    <A extends unknown[], R>(fn: (...args: A) => R) =>
    (...args: A): R => {
      if (reader.down) throw new Error("the reader is down");
      return fn(...args);
    };
  return { ...real, readBackPdf: orFail(real.readBackPdf), readBackDocx: orFail(real.readBackDocx) };
});

vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const versions = await import("@/app/api/cv/versions/route");
const version = await import("@/app/api/cv/versions/[id]/route");
const imports = await import("@/app/api/cv/imports/route");
const oneImport = await import("@/app/api/cv/imports/[id]/route");
const importFile = await import("@/app/api/cv/imports/[id]/file/route");
const importConfirm = await import("@/app/api/cv/imports/[id]/confirm/route");
const store = await import("@/lib/cv/store");
const { cvIsEmpty, cvStrings, isEntrySection } = await import("@/lib/cv/schema");
const { reviewSteps, openFlags } = await import("@/lib/cv/import/record");

const alice = { id: "usr_alice", email: "alice@example.com" };
const bob = { id: "usr_bob", email: "bob@example.com" };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const get = () => new Request("http://localhost/api");
const FIXTURES = path.join(__dirname, "../../../e2e/fixtures/cv");
const SETUP = { name: "Maya Chen – Paid Media Manager", level: "experienced", region: "uk" };

function upload(fields: Record<string, string>, fileName?: string) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  if (fileName) form.set("file", new File([fs.readFileSync(path.join(FIXTURES, fileName))], fileName));
  return new Request("http://localhost/api", { method: "POST", body: form });
}

async function makeCv(setup: Record<string, unknown> = SETUP) {
  const res = await versions.POST(json(setup));
  expect(res.status).toBe(201);
  return (await res.json()).id as string;
}
async function makeImport(fileName = "maya-chen.chrome.pdf", fields: Record<string, string> = SETUP) {
  const res = await imports.POST(upload(fields, fileName));
  expect(res.status).toBe(201);
  return (await res.json()) as { importId: string; versionId: string; status: string; error?: { code: string; message: string } };
}

beforeEach(() => {
  signedIn = alice;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
  (globalThis as unknown as { __hakkiriRate?: Map<string, number[]> }).__hakkiriRate?.clear();
});

describe("starting a CV", () => {
  it("a new account has no CVs: nothing is made up", async () => {
    expect(await (await versions.GET()).json()).toEqual({ cvs: [] });
  });

  it("a new CV is empty: the four core sections with nothing in them", async () => {
    const id = await makeCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    expect(cvIsEmpty(cv)).toBe(true);
    expect(cvStrings(cv)).toEqual([]);
    expect(cv.sections.map((s) => s.kind)).toEqual(["summary", "experience", "education", "skills"]);
    expect(cv).toMatchObject({ name: SETUP.name, level: "experienced", region: "uk", kind: "base", rev: 1, userId: alice.id, design: { template: "standard", pageSize: "a4" } });
    expect(cv.target).toBeUndefined();
    const [row] = (await (await versions.GET()).json()).cvs;
    expect(row).toMatchObject({ id, name: SETUP.name, empty: true, roles: 0 });
  });

  it("a student or graduate starts with education first; a US resume is Letter size", async () => {
    const id = await makeCv({ name: "Tom", level: "student", region: "us" });
    const cv = (await store.getOwnCv(id, alice.id))!;
    expect(cv.sections.map((s) => s.kind)).toEqual(["summary", "education", "experience", "skills"]);
    expect(cv.design).toMatchObject({ template: "graduate", pageSize: "letter" });
  });

  it("keeps the target job when one is given", async () => {
    const id = await makeCv({ ...SETUP, targetTitle: "Head of Paid Media", targetEmployer: "Lantern Atlas", targetAdvert: "We need someone who…\n\nYou will run a team of four." });
    expect((await store.getOwnCv(id, alice.id))!.target).toEqual({ title: "Head of Paid Media", employer: "Lantern Atlas", advert: "We need someone who…\n\nYou will run a team of four." });
  });

  it("says which answer is wrong, field by field", async () => {
    const res = await versions.POST(json({ name: "  ", level: "wizard", region: "uk" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.fields).sort()).toEqual(["level", "name"]);
    expect(await (await versions.GET()).json()).toEqual({ cvs: [] });
  });

  it("signed-out requests are refused", async () => {
    signedIn = null;
    expect((await versions.GET()).status).toBe(401);
    expect((await versions.POST(json(SETUP))).status).toBe(401);
    expect((await imports.POST(upload(SETUP, "maya-chen.chrome.pdf"))).status).toBe(401);
  });
});

describe("one person's CV is theirs alone", () => {
  it("the owner can open, change and delete it", async () => {
    const id = await makeCv();
    expect((await version.GET(get(), ctx(id))).status).toBe(200);
    const saved = await version.PATCH(json({ rev: 1, name: "Renamed" }, "PATCH"), ctx(id));
    expect(saved.status).toBe(200);
    expect((await saved.json()).cv).toMatchObject({ name: "Renamed", rev: 2 });
    expect((await version.DELETE(get(), ctx(id))).status).toBe(200);
    expect(await store.getOwnCv(id, alice.id)).toBeNull();
  });

  it("another account gets “not found” for reading, changing and deleting, and the CV is untouched", async () => {
    const id = await makeCv();
    signedIn = bob;
    expect((await version.GET(get(), ctx(id))).status).toBe(404);
    expect((await version.PATCH(json({ rev: 1, name: "Taken" }, "PATCH"), ctx(id))).status).toBe(404);
    expect((await version.DELETE(get(), ctx(id))).status).toBe(404);
    expect(await (await versions.GET()).json()).toEqual({ cvs: [] });
    const cv = (await store.getOwnCv(id, alice.id))!;
    expect(cv).toMatchObject({ name: SETUP.name, userId: alice.id, rev: 1 });
  });

  it("an unknown id is “not found”, and nothing is created in its place", async () => {
    expect((await version.GET(get(), ctx("cv_0000000000000000"))).status).toBe(404);
    expect(await (await versions.GET()).json()).toEqual({ cvs: [] });
  });

  it("the owner, id and dates cannot be changed from the browser", async () => {
    const id = await makeCv();
    for (const extra of [{ userId: bob.id }, { id: "cv_ffffffffffffffff" }, { createdAt: "2000-01-01" }, { kind: "tailored" }]) {
      expect((await version.PATCH(json({ rev: 1, ...extra }, "PATCH"), ctx(id))).status).toBe(400);
    }
    expect((await store.getOwnCv(id, alice.id))!).toMatchObject({ userId: alice.id, id, kind: "base", rev: 1 });
  });

  it("signed out, nothing can be read or changed", async () => {
    const id = await makeCv();
    signedIn = null;
    expect((await version.GET(get(), ctx(id))).status).toBe(401);
    expect((await version.PATCH(json({ rev: 1, name: "x" }, "PATCH"), ctx(id))).status).toBe(401);
    expect((await version.DELETE(get(), ctx(id))).status).toBe(401);
  });
});

describe("saving", () => {
  it("a save from an out-of-date copy is refused, with the current CV, so nothing is silently overwritten", async () => {
    const id = await makeCv();
    expect((await version.PATCH(json({ rev: 1, name: "From tab one" }, "PATCH"), ctx(id))).status).toBe(200);
    const stale = await version.PATCH(json({ rev: 1, name: "From tab two" }, "PATCH"), ctx(id));
    expect(stale.status).toBe(409);
    expect((await stale.json()).cv).toMatchObject({ name: "From tab one", rev: 2 });
    expect((await store.getOwnCv(id, alice.id))!.name).toBe("From tab one");
  });

  it("the same save sent twice is applied once", async () => {
    const id = await makeCv();
    const body = { rev: 1, saveId: "save-abc", name: "Once" };
    expect((await (await version.PATCH(json(body, "PATCH"), ctx(id))).json()).cv.rev).toBe(2);
    const again = await version.PATCH(json(body, "PATCH"), ctx(id));
    expect(again.status).toBe(200);
    expect((await again.json()).cv.rev).toBe(2);
  });

  it("saves what the person typed, tidied but not reworded", async () => {
    const id = await makeCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    const experience = cv.sections.find((s) => s.kind === "experience")!;
    const entry = { id: "e_test0001", visible: true, title: "  Paid   Media Manager ", org: "Northlight Agency", orgInfo: "", location: "Leeds", start: "2021-03", end: "", current: true, subject: "", grade: "", link: "", bullets: [{ id: "b_test0001", text: "Cut cost per lead by 18%\u0007 in six months", visible: true, origin: "typed", sources: [] }] };
    const res = await version.PATCH(json({ rev: 1, contact: { fullName: "Maya Chen", email: "maya@example.com", phone: "", location: "Leeds", links: [] }, sections: cv.sections.map((s) => (s.id === experience.id ? { ...s, entries: [entry] } : s)) }, "PATCH"), ctx(id));
    expect(res.status).toBe(200);
    const saved = (await store.getOwnCv(id, alice.id))!;
    const e = saved.sections.find(isEntrySection)!.entries[0];
    expect(e.title).toBe("Paid Media Manager");
    expect(e.bullets[0].text).toBe("Cut cost per lead by 18% in six months");
    expect(saved.contact.fullName).toBe("Maya Chen");
    const [row] = (await (await versions.GET()).json()).cvs;
    expect(row).toMatchObject({ empty: false, roles: 1 });
  });

  it("refuses dates that are not a year or a month, and two sections with the same id", async () => {
    const id = await makeCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    const bad = cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: [{ id: "e_test0001", title: "x", start: "March 2021" }] } : s));
    expect((await version.PATCH(json({ rev: 1, sections: bad }, "PATCH"), ctx(id))).status).toBe(400);
    expect((await version.PATCH(json({ rev: 1, sections: [cv.sections[0], cv.sections[0]] }, "PATCH"), ctx(id))).status).toBe(400);
    expect((await store.getOwnCv(id, alice.id))!.rev).toBe(1);
  });

  it("a target job can be added and removed", async () => {
    const id = await makeCv();
    await version.PATCH(json({ rev: 1, target: { title: "Head of Paid Media", employer: "", advert: "" } }, "PATCH"), ctx(id));
    expect((await store.getOwnCv(id, alice.id))!.target?.title).toBe("Head of Paid Media");
    await version.PATCH(json({ rev: 2, target: null }, "PATCH"), ctx(id));
    expect((await store.getOwnCv(id, alice.id))!.target).toBeUndefined();
  });
});

describe("uploading a CV", () => {
  it("reads the file into an upload to check; the CV itself stays empty until it is opened in the builder", async () => {
    const made = await makeImport();
    expect(made.status).toBe("needs-review");
    const cv = (await store.getOwnCv(made.versionId, alice.id))!;
    expect(cvIsEmpty(cv)).toBe(true);
    const imp = (await (await oneImport.GET(get(), ctx(made.importId))).json()).import;
    expect(imp).toMatchObject({ status: "needs-review", source: "pdf", fileName: "maya-chen.chrome.pdf", versionId: made.versionId });
    expect(imp.draft.contact.fullName).toBe("Maya Chen");
    expect(imp.lines.length).toBeGreaterThan(20);
    // The dashboard row says the upload is waiting.
    const [row] = (await (await versions.GET()).json()).cvs;
    expect(row).toMatchObject({ id: made.versionId, empty: true, pendingImportId: made.importId });
  });

  it("the steps of the check are contact, each section with something in it, then unassigned text", async () => {
    const made = await makeImport("daniel-okoye.two-column.pdf");
    const imp = (await store.getOwnImport(made.importId, alice.id))!;
    const steps = reviewSteps(imp);
    expect(steps.map((s) => s.key)).toEqual(["contact", "summary", "experience", "education", "skills", "languages", "unassigned"]);
    expect(steps.map((s) => openFlags(imp, s))).toEqual([0, 0, 1, 0, 0, 0, 1]);
  });

  it("the unassigned step is there even when nothing was left over", async () => {
    const made = await makeImport("maya-chen.writer.docx");
    const imp = (await store.getOwnImport(made.importId, alice.id))!;
    expect(reviewSteps(imp).at(-1)).toEqual({ key: "unassigned" });
    expect(imp.unassigned).toEqual([]);
  });

  it("“Open in builder” puts the checked upload into the CV, each bullet pointing back at its source line", async () => {
    const made = await makeImport();
    const res = await importConfirm.POST(json({}), ctx(made.importId));
    expect(res.status).toBe(200);
    const cv = (await store.getOwnCv(made.versionId, alice.id))!;
    expect(cv).toMatchObject({ importId: made.importId, rev: 2, contact: { fullName: "Maya Chen", email: "maya.chen@example.com" } });
    const first = cv.sections.find((s) => s.kind === "experience" && isEntrySection(s));
    const bullet = (first as { entries: { bullets: { text: string; origin: string; sources: { kind: string; ref?: string; text: string }[] }[] }[] }).entries[0].bullets[1];
    expect(bullet).toMatchObject({ text: "Cut average cost per lead by 18% in six months by rebuilding account structure", origin: "upload", sources: [{ kind: "upload", ref: made.importId, text: "Cut average cost per lead by 18% in six months by rebuilding account structure" }] });
    expect((await store.getOwnImport(made.importId, alice.id))!.status).toBe("confirmed");
    const [row] = (await (await versions.GET()).json()).cvs;
    expect(row).toMatchObject({ empty: false, roles: 3 });
    expect(row.pendingImportId).toBeUndefined();
    // Sent a second time, it changes nothing.
    expect((await importConfirm.POST(json({}), ctx(made.importId))).status).toBe(200);
    expect((await store.getOwnCv(made.versionId, alice.id))!.rev).toBe(2);
  });

  it("what the person corrects while checking is what reaches the CV", async () => {
    const made = await makeImport("daniel-okoye.two-column.pdf");
    const imp = (await store.getOwnImport(made.importId, alice.id))!;
    const draft = { ...imp.draft, contact: { ...imp.draft.contact, fullName: "Daniel C. Okoye" } };
    const flag = imp.flags[0];
    const text = imp.unassigned[0];
    const res = await oneImport.PATCH(json({ draft, flags: [{ id: flag.id, state: "confirmed" }], unassigned: [{ id: text.id, state: "dismissed" }], reviewed: ["contact", "contact", "experience"] }, "PATCH"), ctx(made.importId));
    expect(res.status).toBe(200);
    const after = (await store.getOwnImport(made.importId, alice.id))!;
    expect(after.flags[0].state).toBe("confirmed");
    expect(after.unassigned[0].state).toBe("dismissed");
    expect(after.reviewed).toEqual(["contact", "experience"]);
    expect(reviewSteps(after).map((s) => openFlags(after, s))).toEqual([0, 0, 0, 0, 0, 0, 0]);
    await importConfirm.POST(json({}), ctx(made.importId));
    expect((await store.getOwnCv(made.versionId, alice.id))!.contact.fullName).toBe("Daniel C. Okoye");
  });

  it("an upload can go into an existing CV only while that CV is empty", async () => {
    const id = await makeCv();
    const ok = await imports.POST(upload({ versionId: id }, "maya-chen.writer.docx"));
    expect(ok.status).toBe(201);
    expect((await ok.json()).versionId).toBe(id);
    await version.PATCH(json({ rev: 1, contact: { fullName: "Typed by hand", email: "", phone: "", location: "", links: [] } }, "PATCH"), ctx(id));
    expect((await imports.POST(upload({ versionId: id }, "maya-chen.writer.docx"))).status).toBe(409);
    // And an upload checked later does not overwrite what was typed meanwhile.
    const first = (await store.listOwnImports(alice.id))[0];
    expect((await importConfirm.POST(json({}), ctx(first.id))).status).toBe(409);
    expect((await store.getOwnCv(id, alice.id))!.contact.fullName).toBe("Typed by hand");
  });

  it("the set-up answers are checked before any file is read", async () => {
    const res = await imports.POST(upload({ name: "", level: "experienced", region: "uk" }, "maya-chen.chrome.pdf"));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.name).toBeTruthy();
    expect(await store.listOwnCvs(alice.id)).toEqual([]);
    expect((await imports.POST(upload(SETUP))).status).toBe(400);
  });
});

describe("files that cannot be read", () => {
  it.each([
    ["scanned.pdf", "scanned"],
    ["password.pdf", "password"],
    ["old-word.doc", "old-word"],
  ])("%s keeps the set-up answers and says why, with a way forward", async (fileName, code) => {
    const made = await makeImport(fileName);
    expect(made.status).toBe("failed");
    expect(made.error?.code).toBe(code);
    expect(made.error?.message.length).toBeGreaterThan(30);
    expect((await store.getOwnCv(made.versionId, alice.id))!.name).toBe(SETUP.name);
    // It cannot be opened in the builder as it is.
    expect((await importConfirm.POST(json({}), ctx(made.importId))).status).toBe(409);
  });

  it("pasting the text is the way through for a scan", async () => {
    const made = await makeImport("scanned.pdf");
    const form = new FormData();
    form.set("text", "Maya Chen\nmaya@example.com\n\nEXPERIENCE\nPaid Media Manager, Northlight Agency\tMar 2021 – Present\n• Run Google Ads campaigns for six retail clients");
    const res = await importFile.POST(new Request("http://localhost/api", { method: "POST", body: form }), ctx(made.importId));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ importId: made.importId, versionId: made.versionId, status: "needs-review" });
    const imp = (await store.getOwnImport(made.importId, alice.id))!;
    expect(imp).toMatchObject({ source: "text", fileName: "Pasted text" });
    expect(imp.error).toBeUndefined();
    expect(imp.draft.contact.fullName).toBe("Maya Chen");
  });

  it("another file can replace the one that failed", async () => {
    const made = await makeImport("password.pdf");
    const res = await importFile.POST(upload({}, "maya-chen.writer.docx"), ctx(made.importId));
    expect(await res.json()).toMatchObject({ status: "needs-review" });
    expect((await store.getOwnImport(made.importId, alice.id))!.source).toBe("docx");
  });

  it("a request far over the size limit is refused before it is read", async () => {
    const res = await imports.POST(new Request("http://localhost/api", { method: "POST", headers: { "content-length": String(9 * 1024 * 1024), "content-type": "multipart/form-data; boundary=x" }, body: "--x--" }));
    expect(res.status).toBe(413);
  });
});

describe("one person's upload is theirs alone", () => {
  it("another account cannot read, change, replace, open or discard it", async () => {
    const made = await makeImport();
    signedIn = bob;
    expect((await oneImport.GET(get(), ctx(made.importId))).status).toBe(404);
    expect((await oneImport.PATCH(json({ reviewed: ["contact"] }, "PATCH"), ctx(made.importId))).status).toBe(404);
    expect((await importFile.POST(upload({}, "maya-chen.writer.docx"), ctx(made.importId))).status).toBe(404);
    expect((await importConfirm.POST(json({}), ctx(made.importId))).status).toBe(404);
    expect((await oneImport.DELETE(get(), ctx(made.importId))).status).toBe(404);
    // Nor upload into someone else's CV.
    expect((await imports.POST(upload({ versionId: made.versionId }, "maya-chen.writer.docx"))).status).toBe(404);
    expect((await store.getOwnImport(made.importId, alice.id))!.status).toBe("needs-review");
    expect(cvIsEmpty((await store.getOwnCv(made.versionId, alice.id))!)).toBe(true);
  });

  it("discarding an upload keeps the CV, empty, with its set-up answers", async () => {
    const made = await makeImport();
    expect((await oneImport.DELETE(get(), ctx(made.importId))).status).toBe(200);
    expect(await store.getOwnImport(made.importId, alice.id)).toBeNull();
    const cv = (await store.getOwnCv(made.versionId, alice.id))!;
    expect(cv.name).toBe(SETUP.name);
    expect(cvIsEmpty(cv)).toBe(true);
  });

  it("deleting a CV deletes the uploads made for it", async () => {
    const made = await makeImport();
    await version.DELETE(get(), ctx(made.versionId));
    expect(await store.getOwnImport(made.importId, alice.id)).toBeNull();
  });

  it("an upload that has been opened in the builder can no longer be changed", async () => {
    const made = await makeImport();
    await importConfirm.POST(json({}), ctx(made.importId));
    expect((await oneImport.PATCH(json({ reviewed: ["contact"] }, "PATCH"), ctx(made.importId))).status).toBe(409);
    expect((await importFile.POST(upload({}, "maya-chen.writer.docx"), ctx(made.importId))).status).toBe(409);
  });
});

describe("downloading a CV", () => {
  const exportRoute = () => import("@/app/api/cv/versions/[id]/export/route");
  const checkRoute = () => import("@/app/api/cv/versions/[id]/check/route");
  const duplicateRoute = () => import("@/app/api/cv/versions/[id]/duplicate/route");
  const file = (format: string) => new Request(`http://localhost/api?format=${format}`);

  async function filledCv() {
    const made = await makeImport();
    await importConfirm.POST(json({}), ctx(made.importId));
    return made.versionId;
  }

  it("sends a real PDF and a real Word file, each checked against the CV, with the right file name", async () => {
    const id = await filledCv();
    const { GET } = await exportRoute();
    const pdf = await GET(file("pdf"), ctx(id));
    expect(pdf.status).toBe(200);
    expect(pdf.headers.get("content-type")).toBe("application/pdf");
    expect(pdf.headers.get("content-disposition")).toContain('filename="Maya Chen - CV.pdf"');
    expect(pdf.headers.get("x-cv-check")).toBe("checked");
    const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
    expect(new TextDecoder().decode(pdfBytes.subarray(0, 8))).toContain("%PDF-1.7");
    const docx = await GET(file("docx"), ctx(id));
    expect(docx.status).toBe(200);
    expect(docx.headers.get("content-disposition")).toContain('filename="Maya Chen - CV.docx"');
    expect([...new Uint8Array(await docx.arrayBuffer()).subarray(0, 2)]).toEqual([0x50, 0x4b]);
    // The upload reader, given the downloaded PDF, finds the same person and roles.
    const { readCvFile } = await import("@/lib/cv/import");
    const back = await readCvFile(pdfBytes);
    expect(back.contact.fullName).toBe("Maya Chen");
    expect(back.sections.find((s) => s.kind === "experience" && isEntrySection(s) && s.entries.length === 3)).toBeTruthy();
  });

  it("checks both files and says which revision was checked", async () => {
    const id = await filledCv();
    const { POST } = await checkRoute();
    const res = await POST(json({}), ctx(id));
    const body = await res.json();
    expect(body.rev).toBe(2);
    expect(body.pdf).toMatchObject({ status: "checked", name: "Maya Chen - CV.pdf", missing: [], unexpected: [], unsupported: [] });
    expect(body.docx).toMatchObject({ status: "checked", name: "Maya Chen - CV.docx", missing: [], unexpected: [] });
    expect(body.pdf.pages).toBeGreaterThanOrEqual(1);
  });

  it("withholds a file that does not read back the same as the CV", async () => {
    const id = await filledCv();
    const cv = (await store.getOwnCv(id, alice.id))!;
    // A character none of the fonts can draw would print as an empty box.
    await store.saveCv({ ...cv, contact: { ...cv.contact, fullName: "Maya 陈 Chen" } });
    const { GET } = await exportRoute();
    const res = await GET(file("pdf"), ctx(id));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("loss");
    expect(body.unsupported).toEqual(["陈"]);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("when the checker itself is down, a file is never called checked: it is sent only when asked for as unchecked", async () => {
    const id = await filledCv();
    const { GET } = await exportRoute();
    reader.down = true;
    const silent = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const refused = await GET(file("pdf"), ctx(id));
      expect(refused.status).toBe(503);
      expect((await refused.json()).error).toBe("check_failed");
      const sent = await GET(new Request("http://localhost/api?format=pdf&unchecked=1"), ctx(id));
      expect(sent.status).toBe(200);
      expect(sent.headers.get("x-cv-check")).toBe("unchecked");
      expect(new TextDecoder().decode(new Uint8Array(await sent.arrayBuffer()).subarray(0, 5))).toBe("%PDF-");
      const checked = await (await (await checkRoute()).POST(json({}), ctx(id))).json();
      expect(checked.pdf).toMatchObject({ status: "failed", made: true });
      expect(checked.docx).toMatchObject({ status: "failed", made: true });
    } finally {
      reader.down = false;
      silent.mockRestore();
    }
    // With the checker back, asking for "unchecked" changes nothing: a file with a known difference is still withheld.
    const cv = (await store.getOwnCv(id, alice.id))!;
    await store.saveCv({ ...cv, contact: { ...cv.contact, fullName: "Maya 陈 Chen" } });
    expect((await GET(new Request("http://localhost/api?format=pdf&unchecked=1"), ctx(id))).status).toBe(409);
  });

  it("an empty CV has nothing to download or check", async () => {
    const id = await makeCv();
    expect((await (await exportRoute()).GET(file("pdf"), ctx(id))).status).toBe(409);
    expect((await (await checkRoute()).POST(json({}), ctx(id))).status).toBe(409);
  });

  it("only PDF and Word can be asked for", async () => {
    const id = await filledCv();
    expect((await (await exportRoute()).GET(file("exe"), ctx(id))).status).toBe(400);
  });

  it("another account cannot download, check or duplicate someone else's CV", async () => {
    const id = await filledCv();
    signedIn = bob;
    expect((await (await exportRoute()).GET(file("pdf"), ctx(id))).status).toBe(404);
    expect((await (await checkRoute()).POST(json({}), ctx(id))).status).toBe(404);
    expect((await (await duplicateRoute()).POST(json({}), ctx(id))).status).toBe(404);
    signedIn = null;
    expect((await (await exportRoute()).GET(file("pdf"), ctx(id))).status).toBe(401);
  });

  it("a duplicate is a separate CV: changing one leaves the other alone", async () => {
    const id = await filledCv();
    const res = await (await duplicateRoute()).POST(json({}), ctx(id));
    expect(res.status).toBe(201);
    const copyId = (await res.json()).id as string;
    expect(copyId).not.toBe(id);
    const copy = (await store.getOwnCv(copyId, alice.id))!;
    expect(copy).toMatchObject({ name: `Copy of ${SETUP.name}`, rev: 1, userId: alice.id });
    expect(copy.importId).toBeUndefined();
    expect(cvStrings(copy)).toEqual(cvStrings((await store.getOwnCv(id, alice.id))!));
    await version.PATCH(json({ rev: 1, contact: { ...copy.contact, fullName: "Changed in the copy" } }, "PATCH"), ctx(copyId));
    expect((await store.getOwnCv(id, alice.id))!.contact.fullName).toBe("Maya Chen");
  });

  it("unsaved changes can be kept as a separate version, leaving the original as it was", async () => {
    const id = await filledCv();
    const before = (await store.getOwnCv(id, alice.id))!;
    const res = await (await duplicateRoute()).POST(json({ changes: { contact: { ...before.contact, phone: "07700 900123" } } }), ctx(id));
    expect(res.status).toBe(201);
    const copy = (await store.getOwnCv((await res.json()).id, alice.id))!;
    expect(copy.contact.phone).toBe("07700 900123");
    expect(copy.sections).toEqual(before.sections);
    expect((await store.getOwnCv(id, alice.id))!.contact.phone).toBe(before.contact.phone);
    // The copy takes only what a save could change: never the owner or the id.
    expect((await (await duplicateRoute()).POST(json({ changes: { userId: bob.id } }), ctx(id))).status).toBe(400);
    expect((await (await duplicateRoute()).POST(json({ changes: { id: "cv_0000000000000000" } }), ctx(id))).status).toBe(400);
  });

  it("the design can be changed, and only to what is allowed", async () => {
    const id = await makeCv();
    const ok = await version.PATCH(json({ rev: 1, design: { template: "executive", pageSize: "a4", density: "tighter", pageTarget: 1, accent: "plum", fonts: "research", fileName: "My CV" } }, "PATCH"), ctx(id));
    expect(ok.status).toBe(200);
    expect((await store.getOwnCv(id, alice.id))!.design).toMatchObject({ template: "executive", density: "tighter", pageTarget: 1, accent: "plum", fonts: "research", fileName: "My CV" });
    for (const bad of [{ template: "two-column" }, { density: "microscopic" }, { pageTarget: 5 }, { accent: "neon" }]) {
      expect((await version.PATCH(json({ rev: 2, design: { template: "standard", pageSize: "a4", density: "default", pageTarget: 2, ...bad } }, "PATCH"), ctx(id))).status).toBe(400);
    }
  });

  it("serves only the listed font files", async () => {
    const { GET } = await import("@/app/api/cv/fonts/[file]/route");
    const ok = await GET(get(), { params: Promise.resolve({ file: "Inter_400Regular.ttf" }) });
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toContain("immutable");
    expect((await ok.arrayBuffer()).byteLength).toBeGreaterThan(100000);
    for (const bad of ["../../../package.json", "OFL-inter.txt", "nope.ttf"]) expect((await GET(get(), { params: Promise.resolve({ file: bad }) })).status).toBe(404);
  });
});

describe("the Software view and the record of each download", () => {
  const softwareRoute = () => import("@/app/api/cv/versions/[id]/software/route");
  const exportRoute = () => import("@/app/api/cv/versions/[id]/export/route");
  const listRoute = () => import("@/app/api/cv/versions/[id]/exports/route");
  const oneRoute = () => import("@/app/api/cv/exports/[exportId]/route");
  const fileRoute = () => import("@/app/api/cv/exports/[exportId]/file/route");
  const of = (format: string) => new Request(`http://localhost/api?format=${format}`);
  const rec = (exportId: string) => ({ params: Promise.resolve({ exportId }) });
  async function filled() {
    const made = await makeImport();
    await importConfirm.POST(json({}), ctx(made.versionId ? made.importId : made.importId));
    return made.versionId;
  }

  it("shows what a program reads from the real file, beside what the CV says", async () => {
    const id = await filled();
    for (const format of ["pdf", "docx"]) {
      const res = await (await softwareRoute()).GET(of(format), ctx(id));
      expect(res.status).toBe(200);
      const view = await res.json();
      expect(view).toMatchObject({ format, status: "checked", missing: [], unexpected: [], unsupported: [], rev: 2 });
      expect(view.expected[0]).toBe("Maya Chen");
      expect(view.read.join("\n")).toContain("Maya Chen");
      const field = (label: string) => view.fields.find((f: { label: string }) => f.label === label);
      expect(field("Name")).toMatchObject({ expected: "Maya Chen", read: "Maya Chen", ok: true });
      expect(field("Email").ok).toBe(true);
      expect(field("Role 1")).toMatchObject({ expected: "Paid Media Manager · Northlight Agency", ok: true });
      expect(field("Role 1: dates")).toMatchObject({ expected: "Mar 2021 – Present", ok: true });
      expect(field("Role 2: dates").ok).toBe(true);
      expect(field("Role 1: bullets").ok).toBe(true);
      expect(field("Section headings").expected).toContain("Experience");
    }
  });

  it("gives “ATS-ready” only to a file that reads back, has standard headings and every field in place", async () => {
    const id = await filled();
    const view = await (await (await softwareRoute()).GET(of("pdf"), ctx(id))).json();
    expect(view.why).toEqual([]);
    expect(view.atsReady).toBe(true);
    // A heading software does not look for takes the label away, and says why.
    const cv = (await store.getOwnCv(id, alice.id))!;
    await store.saveCv({ ...cv, sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, title: "Where I have been" } : s)) });
    const odd = await (await (await softwareRoute()).GET(of("pdf"), ctx(id))).json();
    expect(odd.status).toBe("checked");
    expect(odd.atsReady).toBe(false);
    expect(odd.why.join(" ")).toContain("“Where I have been”");
    // A character that would print as a box does too.
    await store.saveCv({ ...cv, contact: { ...cv.contact, fullName: "Maya 陈 Chen" } });
    const boxes = await (await (await softwareRoute()).GET(of("pdf"), ctx(id))).json();
    expect(boxes).toMatchObject({ status: "loss", atsReady: false, unsupported: ["陈"] });
  });

  it("keeps a record of each download, and makes the same file again from it", async () => {
    const id = await filled();
    const first = await (await exportRoute()).GET(of("pdf"), ctx(id));
    const exportId = first.headers.get("x-cv-export")!;
    expect(exportId).toMatch(/^exp_[a-f0-9]{16}$/);
    const sent = new Uint8Array(await first.arrayBuffer());
    const list = await (await (await listRoute()).GET(get(), ctx(id))).json();
    expect(list.exports).toHaveLength(1);
    expect(list.exports[0]).toMatchObject({ id: exportId, format: "pdf", name: "Maya Chen - CV.pdf", checked: true, rev: 2 });
    expect(list.exports[0].cv).toBeUndefined();

    // The CV changes afterwards. The record does not.
    const cv = (await store.getOwnCv(id, alice.id))!;
    await store.saveCv({ ...cv, rev: 3, contact: { ...cv.contact, fullName: "Maya Chen-Okafor" } });
    const one = await (await (await oneRoute()).GET(get(), rec(exportId))).json();
    expect(one.export.cv.contact.fullName).toBe("Maya Chen");
    expect(one.export.userId).toBeUndefined();
    const again = await (await fileRoute()).GET(get(), rec(exportId));
    expect(again.status).toBe(200);
    expect(again.headers.get("content-disposition")).toContain('filename="Maya Chen - CV.pdf"');
    const bytes = new Uint8Array(await again.arrayBuffer());
    expect(Buffer.from(bytes).equals(Buffer.from(sent))).toBe(true);
  });

  it("a file that was withheld leaves no record", async () => {
    const id = await filled();
    const cv = (await store.getOwnCv(id, alice.id))!;
    await store.saveCv({ ...cv, contact: { ...cv.contact, fullName: "Maya 陈 Chen" } });
    expect((await (await exportRoute()).GET(of("pdf"), ctx(id))).status).toBe(409);
    expect((await (await (await listRoute()).GET(get(), ctx(id))).json()).exports).toEqual([]);
  });

  it("keeps the newest thirty downloads for a CV", async () => {
    const id = await filled();
    const cv = (await store.getOwnCv(id, alice.id))!;
    for (let i = 0; i < 33; i++) await store.saveExport({ id: `exp_${i.toString(16).padStart(16, "0")}`, userId: alice.id, versionId: id, rev: 2, format: "pdf", what: "cv", name: `n${i}.pdf`, at: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(), checked: true, pages: 1, cv });
    const kept = await store.listOwnExports(alice.id, id);
    expect(kept).toHaveLength(30);
    expect(kept[0].name).toBe("n32.pdf");
    expect(kept.at(-1)!.name).toBe("n3.pdf");
  });

  it("another account cannot see the Software view or anyone else's downloads", async () => {
    const id = await filled();
    const exportId = (await (await exportRoute()).GET(of("docx"), ctx(id))).headers.get("x-cv-export")!;
    signedIn = bob;
    expect((await (await softwareRoute()).GET(of("pdf"), ctx(id))).status).toBe(404);
    expect((await (await listRoute()).GET(get(), ctx(id))).status).toBe(404);
    expect((await (await oneRoute()).GET(get(), rec(exportId))).status).toBe(404);
    expect((await (await fileRoute()).GET(get(), rec(exportId))).status).toBe(404);
    expect((await (await oneRoute()).DELETE(get(), rec(exportId))).status).toBe(404);
    signedIn = alice;
    expect((await (await oneRoute()).DELETE(get(), rec(exportId))).status).toBe(200);
    expect(await store.listOwnExports(alice.id, id)).toEqual([]);
  });

  it("downloads are part of “Download my data” and go with “Delete all my data”", async () => {
    const id = await filled();
    await (await exportRoute()).GET(of("pdf"), ctx(id));
    expect((await store.exportCvData(alice.id)).exports).toHaveLength(1);
    await store.deleteCvData(alice.id);
    expect((await store.exportCvData(alice.id)).exports).toEqual([]);
  });
});

describe("a tailored version for one job", () => {
  const tailorRoute = () => import("@/app/api/cv/versions/[id]/tailor/route");
  const ADVERT = "Paid Media Lead at Example Travel.\n\nEssential\n- Experience running Google Ads campaigns\n- Experience managing budgets\n\nDesirable\n- Knowledge of SQL\n\nWe offer 28 days holiday.";
  async function base() {
    const made = await makeImport();
    await importConfirm.POST(json({}), ctx(made.importId));
    return made.versionId;
  }

  it("is a copy linked to its base, with the advert kept word for word and its requirements read from it", async () => {
    const id = await base();
    const res = await (await tailorRoute()).POST(json({ title: "Paid media lead", employer: "Example Travel", advert: ADVERT }), ctx(id));
    expect(res.status).toBe(201);
    const made = await res.json();
    const parent = (await store.getOwnCv(id, alice.id))!;
    const copy = (await store.getOwnCv(made.id, alice.id))!;
    expect(copy).toMatchObject({ kind: "tailored", parentId: id, parentRev: parent.rev, rev: 1, name: `${SETUP.name.replace(/ – .*$/, "")} – Example Travel` });
    expect(copy.target).toEqual({ title: "Paid media lead", employer: "Example Travel", advert: ADVERT });
    expect(copy.requirements.map((r) => [r.quote, r.priority])).toEqual([["Experience running Google Ads campaigns", "required"], ["Experience managing budgets", "required"], ["Knowledge of SQL", "preferred"]]);
    expect(cvStrings(copy)).toEqual(cvStrings(parent));
    // The base knows nothing of the job, and is not changed by it.
    expect(parent.kind).toBe("base");
    expect(parent.requirements).toEqual([]);
  });

  it("changing the tailored version never changes the base", async () => {
    const id = await base();
    const made = await (await (await tailorRoute()).POST(json({ title: "Paid media lead", employer: "", advert: ADVERT }), ctx(id))).json();
    const copy = (await store.getOwnCv(made.id, alice.id))!;
    const before = JSON.stringify((await store.getOwnCv(id, alice.id))!.sections);
    const sections = copy.sections.map((s) => (isEntrySection(s) ? { ...s, entries: s.entries.map((e) => ({ ...e, visible: false })) } : s));
    expect((await version.PATCH(json({ rev: 1, sections }, "PATCH"), ctx(made.id))).status).toBe(200);
    expect(JSON.stringify((await store.getOwnCv(id, alice.id))!.sections)).toBe(before);
  });

  it("needs a job and an advert", async () => {
    const id = await base();
    const none = await (await tailorRoute()).POST(json({ title: "", employer: "", advert: "" }), ctx(id));
    expect(none.status).toBe(400);
    expect(Object.keys((await none.json()).fields)).toEqual(["title", "advert"]);
    expect(await store.listOwnCvs(alice.id)).toHaveLength(1);
  });

  it("a version made from a version still hangs off the original base", async () => {
    const id = await base();
    const first = await (await (await tailorRoute()).POST(json({ title: "A", employer: "", advert: ADVERT }), ctx(id))).json();
    const second = await (await (await tailorRoute()).POST(json({ title: "B", employer: "", advert: ADVERT }), ctx(first.id))).json();
    expect((await store.getOwnCv(second.id, alice.id))!.parentId).toBe(id);
  });

  it("another account cannot tailor someone else's CV", async () => {
    const id = await base();
    signedIn = bob;
    expect((await (await tailorRoute()).POST(json({ title: "A", employer: "", advert: ADVERT }), ctx(id))).status).toBe(404);
  });

  it("the list shows each CV's score, and job fit where there is an advert", async () => {
    const id = await base();
    const made = await (await (await tailorRoute()).POST(json({ title: "Paid media lead", employer: "Example Travel", advert: ADVERT }), ctx(id))).json();
    const rows = (await (await versions.GET()).json()).cvs as { id: string; kind: string; parentId?: string; score?: number; fit?: number }[];
    const tailored = rows.find((r) => r.id === made.id)!;
    const parent = rows.find((r) => r.id === id)!;
    expect(tailored).toMatchObject({ kind: "tailored", parentId: id });
    expect(tailored.fit).toBeGreaterThan(0);
    expect(tailored.fit).toBeLessThanOrEqual(100);
    expect(parent.fit).toBeUndefined();
    expect(parent.score).toBeGreaterThan(40);
    // An empty CV has neither.
    const emptyId = await makeCv();
    const empty = ((await (await versions.GET()).json()).cvs as { id: string; score?: number; fit?: number }[]).find((r) => r.id === emptyId)!;
    expect([empty.score, empty.fit]).toEqual([undefined, undefined]);
  });

  it("requirements and change records are saved with the version, and only in the shape allowed", async () => {
    const id = await base();
    const made = await (await (await tailorRoute()).POST(json({ title: "Paid media lead", employer: "", advert: ADVERT }), ctx(id))).json();
    const copy = (await store.getOwnCv(made.id, alice.id))!;
    const requirements = copy.requirements.map((r, i) => (i === 0 ? { ...r, gap: true } : r));
    const changes = [{ id: "c_0000000000000001", at: new Date().toISOString(), kind: "off", where: "A role", before: "A line", after: "", reason: "Shows nothing this advert asks for." }];
    expect((await version.PATCH(json({ rev: 1, requirements, changes }, "PATCH"), ctx(made.id))).status).toBe(200);
    const saved = (await store.getOwnCv(made.id, alice.id))!;
    expect(saved.requirements[0].gap).toBe(true);
    expect(saved.changes).toHaveLength(1);
    expect((await version.PATCH(json({ rev: 2, requirements: [{ ...requirements[0], priority: "vital" }] }, "PATCH"), ctx(made.id))).status).toBe(400);
  });
});

describe("your data, from Settings", () => {
  it("“Download my data” includes the CVs and uploads; “Delete all my data” removes them", async () => {
    const JSZip = (await import("jszip")).default;
    const { GET: exportRoute } = await import("@/app/api/data/export/route");
    const { POST: deleteRoute } = await import("@/app/api/data/delete/route");
    const made = await makeImport();
    const zip = await JSZip.loadAsync(await (await exportRoute(get())).arrayBuffer());
    const held = JSON.parse(await zip.file("cvs.json")!.async("string"));
    expect(held.cvs.map((c: { id: string }) => c.id)).toEqual([made.versionId]);
    expect(held.uploads[0]).toMatchObject({ id: made.importId, fileName: "maya-chen.chrome.pdf" });
    expect(await zip.file("README.txt")!.async("string")).toContain("cvs.json");
    expect((await deleteRoute(json({ confirm: "delete" }))).status).toBe(200);
    expect(await store.exportCvData(alice.id)).toEqual({ cvs: [], uploads: [], achievements: [], exports: [], fileChecks: [], freeChecks: [], styles: [] });
  });
});

describe("your data", () => {
  it("everything held for a person can be listed and deleted, without touching anyone else's", async () => {
    await makeImport();
    await makeCv();
    signedIn = bob;
    const bobs = await makeCv({ name: "Bob", level: "early", region: "uk" });
    const held = await store.exportCvData(alice.id);
    expect([held.cvs.length, held.uploads.length]).toEqual([2, 1]);
    expect(await store.deleteCvData(alice.id)).toBe(3);
    expect(await store.exportCvData(alice.id)).toEqual({ cvs: [], uploads: [], achievements: [], exports: [], fileChecks: [], freeChecks: [], styles: [] });
    expect(await store.getOwnCv(bobs, bob.id)).not.toBeNull();
  });
});
