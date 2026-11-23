import { describe, expect, it, beforeEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The CV store writes to a throwaway folder, and each test chooses who is signed in.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-api-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string } | null = null;
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

describe("your data", () => {
  it("everything held for a person can be listed and deleted, without touching anyone else's", async () => {
    await makeImport();
    await makeCv();
    signedIn = bob;
    const bobs = await makeCv({ name: "Bob", level: "early", region: "uk" });
    const held = await store.exportCvData(alice.id);
    expect([held.cvs.length, held.uploads.length]).toEqual([2, 1]);
    expect(await store.deleteCvData(alice.id)).toBe(3);
    expect(await store.exportCvData(alice.id)).toEqual({ cvs: [], uploads: [] });
    expect(await store.getOwnCv(bobs, bob.id)).not.toBeNull();
  });
});
