import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";

// The store writes to a throwaway folder, and each test chooses who is signed in.
process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-cv-check-"));
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

const checkRoute = await import("@/app/api/cv/check/route");
const oneCheck = await import("@/app/api/cv/check/[id]/route");
const fromCheck = await import("@/app/api/cv/imports/from-check/route");
const confirm = await import("@/app/api/cv/imports/[id]/confirm/route");
const store = await import("@/lib/cv/store");
const { advertHeading, checkReport } = await import("./report");

let people = 0;
// A new person for each test: checks are limited to ten a minute for each person.
const fresh = () => ({ id: `usr_check_${++people}`, email: `p${people}@example.com` });
let alice = fresh();
const bob = { id: "usr_check_bob", email: "bob@example.com" };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const FIXTURES = path.join(__dirname, "../../../../e2e/fixtures/cv");

const CV = `Priya Shah
priya.shah@example.com · 07700 900123 · Leeds

Experience
Marketing Manager, Kinetix Home, Leeds
Mar 2021 – Present
• Grew qualified leads by 52% in a year by rebuilding the email programme in HubSpot
• Led a team of 4 across email, social and paid search
• Cut cost per lead from £38 to £21 by moving budget to paid search
• Present monthly results to the board

Marketing Executive, Brightwater Foods, York
Jun 2018 – Feb 2021
• Ran 30 product launch campaigns across email and social
• Wrote the monthly newsletter for 40,000 customers

Education
BA Marketing, University of Leeds, 2018

Skills
Email marketing, Google Ads, HubSpot, copywriting, reporting`;

const ADVERT = `Head of Growth Marketing
Fernbrook Outdoor, Brighton (hybrid)

Fernbrook Outdoor makes camping and walking gear and sells online across the UK.

What you'll need
- Experience leading a small marketing team
- A track record of growing qualified leads through email marketing
- Confidence managing paid search budgets
- Strong reporting skills and comfort presenting results to the board
- Experience with Salesforce Marketing Cloud`;

const LETTER = `Dear Ms Patel,

I am applying for the Head of Growth Marketing role at Fernbrook Outdoor. I want to work for a brand whose gear I already use, and I am keen to grow its online sales.

At Kinetix Home I lead a team of 4 across email, social and paid search. In a year we grew qualified leads by 52% by rebuilding the email programme in HubSpot.

I also managed a £2 million budget at Unilever and won three national awards.

I would welcome the chance to talk about your plans for next season.

Yours sincerely,
Priya Shah`;

function form(fields: Record<string, string>, files: Record<string, File> = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  for (const [k, v] of Object.entries(files)) f.set(k, v);
  return new Request("http://localhost/api/cv/check", { method: "POST", body: f });
}
async function make(fields: Record<string, string>, files: Record<string, File> = {}) {
  const res = await checkRoute.POST(form(fields, files));
  const body = await res.json();
  return { status: res.status, body };
}
async function report(id: string) {
  const res = await oneCheck.GET(new Request("http://localhost/api"), ctx(id));
  return { status: res.status, body: await res.json() };
}
async function docx(paragraphs: string[]) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.map((p) => `<w:p><w:r><w:t xml:space="preserve">${esc(p)}</w:t></w:r></w:p>`).join("")}</w:body></w:document>`);
  return new File([new Uint8Array(await zip.generateAsync({ type: "uint8array" }))], "letter.docx");
}

describe("advertHeading", () => {
  it("reads the job title and employer from the top of an advert", () => {
    expect(advertHeading(ADVERT)).toEqual({ title: "Head of Growth Marketing", employer: "Fernbrook Outdoor" });
  });
  it("does not take a sentence for a title", () => {
    expect(advertHeading("We are looking for a brilliant person to join our friendly team in Leeds.\nApply now.")).toEqual({ title: "", employer: "" });
  });
});

describe("POST /api/cv/check", () => {
  it("needs a signed-in person", async () => {
    signedIn = null;
    expect((await make({ docType: "cv", cvText: CV })).status).toBe(401);
  });

  it("says what is missing, in the words the screen uses", async () => {
    alice = fresh();
    signedIn = alice;
    const a = await make({ docType: "both", cvText: CV, letterText: "" });
    expect(a.status).toBe(400);
    expect(a.body.fields.letter).toBe("Add your document text before checking.");
    const b = await make({ docType: "cv", cvText: CV, jobOn: "1", jobText: "" });
    expect(b.body.fields.job).toBe("Add the job advert or turn off the job check.");
    const c = await make({ docType: "cv", cvText: CV, jobOn: "1", jobText: "We are a friendly company in Leeds and we would love to hear from you soon." });
    expect(c.body.fields.job).toBe("We couldn’t identify requirements in this advert. Check the text.");
  });

  it("checks a pasted CV: a score in four parts, findings with their words, and no file read-back", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv", region: "uk", cvText: CV });
    expect(made.status).toBe(201);
    expect(made.body.id).toMatch(/^chk_[a-f0-9]{16}$/);
    const { body } = await report(made.body.id);
    const cv = body.report.cv;
    expect(cv.parts.map((p: { name: string }) => p.name)).toEqual(["Evidence", "Clarity", "Structure", "Readable by software"]);
    expect(cv.shown).toBeGreaterThan(0);
    expect(cv.read).toBeNull();
    expect(body.report.letter).toBeNull();
    expect(body.report.job).toBeNull();
    // The text itself is not sent back with the report.
    expect(JSON.stringify(body)).not.toContain("07700 900123");
  });

  it("matches a CV against a job: each requirement with the advert's line, the CV's line, and its status", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv", region: "uk", cvText: CV, jobOn: "1", jobText: ADVERT });
    const { job } = (await report(made.body.id)).body.report;
    expect(job.title).toBe("Head of Growth Marketing");
    expect(job.employer).toBe("Fernbrook Outdoor");
    expect(job.total).toBe(job.rows.length);
    const leads = job.rows.find((r: { requirement: string }) => /qualified leads/.test(r.requirement));
    expect(leads.status).not.toBe("Missing");
    expect(leads.evidence).toMatch(/Grew qualified leads by 52%/);
    const sf = job.rows.find((r: { requirement: string }) => /Salesforce/.test(r.requirement));
    expect(sf.status).toBe("Missing");
    expect(sf.evidence).toBeNull();
    expect(job.score).toBeGreaterThan(0);
    expect(job.score).toBeLessThan(100);
  });

  it("checks a CV and its letter: the letter's own score, and the claim the CV doesn't back", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "both", region: "uk", cvText: CV, letterText: LETTER, jobOn: "1", jobText: ADVERT });
    const { letter } = (await report(made.body.id)).body.report;
    expect(letter.parts.map((p: { name: string; points: number }) => `${p.name} ${p.points}`)).toEqual(["Relevance 25", "Clarity 25", "Structure 25", "Evidence 25"]);
    const claims = letter.checks.find((c: { id: string }) => c.id === "claims");
    expect(claims.state).toBe("review");
    expect(claims.items).toEqual(["I also managed a £2 million budget at Unilever and won three national awards."]);
    expect(letter.checks.find((c: { id: string }) => c.id === "greeting").state).toBe("ok");
  });

  it("reads an uploaded CV and says what software read from it", async () => {
    alice = fresh();
    signedIn = alice;
    const file = new File([fs.readFileSync(path.join(FIXTURES, "maya-chen.writer.pdf"))], "maya-chen.pdf");
    const made = await make({ docType: "cv", region: "uk" }, { cvFile: file });
    expect(made.status).toBe(201);
    const { cv } = (await report(made.body.id)).body.report;
    expect(cv.read.name).toBe("maya-chen.pdf");
    expect(cv.read.kind).toBe("pdf");
    expect(cv.read.contact).toContain("Name");
    expect(cv.read.sections.length).toBeGreaterThanOrEqual(2);
    expect(cv.read.words).toBeGreaterThan(100);
  });

  it("reads a cover letter from a Word file, paragraph by paragraph", async () => {
    alice = fresh();
    signedIn = alice;
    const file = await docx(LETTER.split("\n\n").flatMap((b) => b.split("\n")));
    const made = await make({ docType: "cover", region: "uk" }, { letterFile: file });
    expect(made.status).toBe(201);
    const { letter, cv } = (await report(made.body.id)).body.report;
    expect(cv).toBeNull();
    expect(letter.read).toEqual({ name: "letter.docx", kind: "docx", pages: expect.any(Number) });
    expect(letter.greeting).toBe("Dear Ms Patel,");
    expect(letter.paragraphs).toHaveLength(4);
    // No CV and no advert: those checks are not checked, not failed.
    expect(letter.checks.find((c: { id: string }) => c.id === "claims").state).toBe("not-checked");
    expect(letter.checks.find((c: { id: string }) => c.id === "copied").detail).toBe("Job advert not provided.");
  });

  it("refuses a file that is not a PDF or Word file", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv" }, { cvFile: new File([fs.readFileSync(path.join(FIXTURES, "old-word.doc"))], "old.doc") });
    expect(made.status).toBe(400);
    expect(made.body.fields.cv).toBe("We couldn’t read this file. Try another file or paste the text.");
  });
});

describe("the report belongs to the person who made it", () => {
  it("is not found for anyone else, and goes when deleted", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv", cvText: CV });
    signedIn = bob;
    expect((await report(made.body.id)).status).toBe(404);
    expect((await oneCheck.DELETE(new Request("http://localhost/api", { method: "DELETE" }), ctx(made.body.id))).status).toBe(404);
    signedIn = alice;
    expect((await oneCheck.DELETE(new Request("http://localhost/api", { method: "DELETE" }), ctx(made.body.id))).status).toBe(200);
    expect((await report(made.body.id)).status).toBe(404);
  });

  it("is in Download my data and goes with Delete all my data", async () => {
    alice = fresh();
    signedIn = alice;
    await make({ docType: "cv", cvText: CV });
    expect((await store.exportCvData(alice.id)).documentChecks.length).toBeGreaterThan(0);
    await store.deleteCvData(alice.id);
    expect((await store.exportCvData(alice.id)).documentChecks).toEqual([]);
  });

  it("is gone after 30 days", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv", cvText: CV });
    const later = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
    expect(await store.getOwnDocCheck(made.body.id, alice.id, later)).toBeNull();
    expect(await store.getOwnDocCheck(made.body.id, alice.id)).toBeNull();
  });
});

describe("Fix this in the builder", () => {
  it("starts a CV from the check, aimed at its job and with its letter, and opens tailoring once confirmed", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "both", region: "uk", cvText: CV, letterText: LETTER, jobOn: "1", jobText: ADVERT });
    const res = await fromCheck.POST(new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ auditId: made.body.id, then: "tailor" }) }));
    expect(res.status).toBe(201);
    const { versionId, importId } = await res.json();
    const cv = await store.getOwnCv(versionId, alice.id);
    expect(cv!.target).toMatchObject({ title: "Head of Growth Marketing", employer: "Fernbrook Outdoor" });
    expect(cv!.letter!.paragraphs.length).toBe(4);
    expect(cv!.letter!.paragraphs[0].sentences[0]).toMatchObject({ origin: "typed", text: "I am applying for the Head of Growth Marketing role at Fernbrook Outdoor." });
    const done = await confirm.POST(new Request("http://localhost/api", { method: "POST" }), ctx(importId));
    expect((await done.json()).next).toBe("tailor");
    // Someone else can't start a CV from it.
    signedIn = bob;
    const theirs = await fromCheck.POST(new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ auditId: made.body.id }) }));
    expect(theirs.status).toBe(404);
  });

  it("opens a letter-only check in the letter builder once, and goes back to the same one after that", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cover", region: "uk", letterText: LETTER, jobOn: "1", jobText: ADVERT });
    const ask = () => fromCheck.POST(new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ auditId: made.body.id, then: "letter" }) }));
    const first = await ask();
    expect(first.status).toBe(201);
    const { versionId, status } = await first.json();
    expect(status).toBe("confirmed");
    const cv = await store.getOwnCv(versionId, alice.id);
    expect(cv!.name).toBe("Cover letter for Head of Growth Marketing");
    expect(cv!.letter!.paragraphs.length).toBe(4);
    // A reload, the Back button, or "Fix this in the builder" on a second finding: the same one, nothing new.
    const again = await ask();
    expect(again.status).toBe(200);
    expect((await again.json()).versionId).toBe(versionId);
    expect((await store.listOwnCvs(alice.id)).length).toBe(1);
    signedIn = bob;
    expect((await ask()).status).toBe(404);
  });

  it("works out the report again from what was checked", async () => {
    alice = fresh();
    signedIn = alice;
    const made = await make({ docType: "cv", cvText: CV });
    const stored = await store.getOwnDocCheck(made.body.id, alice.id);
    expect(checkReport(stored!).cv!.shown).toBe(stored!.cvScore);
  });
});
