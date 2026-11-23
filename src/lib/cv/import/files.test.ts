import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { type Entry, type EntrySection, type ListSection, type Section, type SkillsSection, type SummarySection, CvDocSchema, cvStrings, emptyContact } from "../schema";
import { DATE_WORD } from "./dates";
import { parseXml } from "./docx";
import { IMPORT_ERRORS, ImportError, type ReadCv, readCvFile, readCvText, sniff } from "./index";

/**
 * Real files, made by different programs (Chromium's PDF printer, LibreOffice
 * Writer, python-docx, and Word-style XML written by hand), read from disk the
 * way an upload is. See e2e/fixtures/cv/src for how they are built. Every
 * person in them is made up.
 */
const FIXTURES = path.join(__dirname, "../../../../e2e/fixtures/cv");
const file = (name: string) => new Uint8Array(fs.readFileSync(path.join(FIXTURES, name)));
const read = (name: string) => readCvFile(file(name));

const section = <T extends Section>(r: ReadCv, kind: string) => r.sections.find((s) => s.kind === kind) as T;
const entries = (r: ReadCv, kind: string) => section<EntrySection>(r, kind)?.entries ?? [];
const role = (e: Entry) => `${e.title} | ${e.org} | ${e.location} | ${e.start}→${e.current ? "now" : e.end}`;
const course = (e: Entry) => `${e.title} | ${e.subject} | ${e.org} | ${e.start}→${e.end} | ${e.grade}`;
const skills = (r: ReadCv) => section<SkillsSection>(r, "skills").groups.map((g) => `${g.name}: ${g.skills.map((k) => k.name).join(", ")}`);
const words = (s: string) => (s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => !DATE_WORD.test(w));

/** Every word in the CV must be a word from the file: the reader sorts text into boxes and writes none of its own. */
function expectNothingInvented(r: ReadCv) {
  const inFile = new Set(r.lines.flatMap((l) => words(l.text)));
  const added = cvStrings(r).flatMap(words).filter((w) => !inFile.has(w));
  expect(added).toEqual([]);
}

/** Every word in the file must be in the CV, in the unassigned text, in the omitted lines or in a heading. */
function expectNothingLost(r: ReadCv) {
  const kept = new Set([...cvStrings(r), ...r.unassigned.map((u) => u.text), ...r.omitted.map((o) => o.text), ...r.lines.filter((l) => l.heading).map((l) => l.text)].flatMap(words));
  // Labels and address parts the reader tidies away on purpose.
  const tidied = new Set(["www", "https", "http", "linkedin", "email", "tel", "location", "in", "of", "at", "page", "profile"]);
  const lost = r.lines.flatMap((l) => words(l.text)).filter((w) => !kept.has(w) && !tidied.has(w));
  expect(lost).toEqual([]);
}

/** What was read must fit the CV's own rules for a saved document. */
function expectValidCv(r: ReadCv) {
  const now = new Date().toISOString();
  const parsed = CvDocSchema.safeParse({ id: "cv_0123456789abcdef", userId: "u", name: "Test", contact: r.contact, sections: r.sections, design: {}, createdAt: now, updatedAt: now });
  expect(parsed.error?.issues ?? []).toEqual([]);
  // Saving must not change anything the reader produced (nothing cut short or reshaped).
  expect(cvStrings(parsed.data!)).toEqual(cvStrings(r));
}

describe("the same CV from three programs reads the same", () => {
  const expected = {
    contact: { fullName: "Maya Chen", email: "maya.chen@example.com", phone: "07700 900456", location: "Leeds, UK", links: ["linkedin.com/in/maya-chen-ppc"] },
    roles: ["Paid Media Manager | Northlight Agency | Leeds | 2021-03→now", "Senior PPC Executive | Harbour Travel Group | Manchester | 2018-06→2021-02", "PPC Executive | Brightside Digital Ltd |  | 2016→2018"],
    bullets: [
      ["Run Google Ads and Meta campaigns for six retail clients with a combined budget of £1.2m a year, reporting results to each client's marketing director every month", "Cut average cost per lead by 18% in six months by rebuilding account structure", "Manage two junior executives and review their weekly reports"],
      ["Managed search campaigns across 12 European markets", "Introduced weekly budget pacing that stopped overspend in peak season"],
      ["Built and optimised campaigns for 20 small business accounts", "Wrote monthly performance reports for clients"],
    ],
    education: ["BA (Hons) | Marketing | University of Leeds | 2013→2016 | 2:1", "A-Levels |  | Notre Dame Sixth Form College | →2013 | Business (A), English (B), Psychology (B)"],
    skills: ["Platforms: Google Ads, Meta Ads Manager, Microsoft Advertising, Google Analytics 4", "Tools: Looker Studio, Excel, Supermetrics"],
    certificates: ["Google Ads Search Certification | Google | 2023", "Meta Certified Media Buying Professional | Meta | 2022"],
    languages: [
      ["English", "native"],
      ["Mandarin", "conversational"],
    ],
  };

  it.each([
    ["maya-chen.chrome.pdf", "pdf"],
    ["maya-chen.writer.pdf", "pdf"],
    ["maya-chen.writer.docx", "docx"],
  ])("%s", async (name, source) => {
    const r = await read(name);
    expect(r.source).toBe(source);
    expect(r.contact).toEqual(expected.contact);
    expect(section<SummarySection>(r, "summary").text).toBe("Paid media manager with six years' experience running Google and Meta campaigns for retail and travel brands. Comfortable owning budgets of up to £1.2m a year and reporting to client directors.");
    expect(entries(r, "experience").map(role)).toEqual(expected.roles);
    expect(entries(r, "experience").map((e) => e.bullets.map((b) => b.text))).toEqual(expected.bullets);
    expect(entries(r, "education").map(course)).toEqual(expected.education);
    expect(skills(r)).toEqual(expected.skills);
    expect(entries(r, "certificates").map((e) => `${e.title} | ${e.org} | ${e.end}`)).toEqual(expected.certificates);
    expect(section<ListSection>(r, "languages").items.map((i) => [i.name, i.level])).toEqual(expected.languages);
    expect(r.flags).toEqual([]);
    expect(r.unassigned).toEqual([]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });
});

describe("layouts", () => {
  it("two columns: the side column does not get mixed into the roles", async () => {
    const r = await read("daniel-okoye.two-column.pdf");
    expect(r.contact).toEqual({ fullName: "Daniel Okoye", email: "daniel.okoye@example.com", phone: "+44 7700 900812", location: "Bristol", links: ["github.com/dokoye"] });
    expect(entries(r, "experience").map(role)).toEqual(["Senior Software Engineer | Parcelwise Ltd | Bristol | 2020-01→now", "Software Engineer | Parcelwise Ltd | Bristol | 2017-03→2019-12", "Junior Developer | Greenbox Retail | Bath | 2015-09→2017-02"]);
    expect(entries(r, "experience").map((e) => e.bullets.length)).toEqual([2, 1, 2]);
    expect(entries(r, "education").map(course)).toEqual(["BSc | Computer Science | University of Bristol | 2012→2015 | First Class Honours"]);
    expect(skills(r)).toEqual([": TypeScript, React, Node.js, PostgreSQL, AWS, Leadership"]);
    expect(section<ListSection>(r, "languages").items.map((i) => `${i.name}: ${i.level}`)).toEqual(["English: native", "Igbo: fluent", "French: B1"]);
    // The second role at the same employer is an assumption, so it is flagged for the person to confirm.
    expect(r.flags.map((f) => f.code)).toEqual(["employer-carried"]);
    // The line under the name has no box of its own in a CV, so it is handed back, not dropped.
    expect(r.unassigned.map((u) => u.text)).toEqual(["Senior Software Engineer"]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });

  it.each(["priya-nair.table.docx", "priya-nair.table.pdf"])("a US resume laid out in a table: %s", async (name) => {
    const r = await read(name);
    expect(r.contact).toEqual({ fullName: "Priya Nair", email: "priya.nair@example.com", phone: "(415) 555-0132", location: "San Francisco, CA", links: ["linkedin.com/in/priyanair"] });
    expect(entries(r, "experience").map(role)).toEqual(["Senior Product Designer | Lumen Pay Inc. | San Francisco, CA | 2021-05→now", "Product Designer | Cardinal Bank | Oakland, CA | 2018-08→2021-04", "Design Intern | Northbay Studio LLC | Remote | 2017-06→2018-07"]);
    expect(entries(r, "experience").map((e) => e.bullets.map((b) => b.text))).toEqual([
      ["Led the checkout redesign, raising completed payments from 71% to 79%", "Run weekly research sessions with eight customers", "Mentor three junior designers"],
      ["Designed the first mobile onboarding flow, used by 300,000 new customers", "Built the design system with two engineers"],
      ["Produced wireframes for five client projects"],
    ]);
    expect(entries(r, "education").map(course)).toEqual(["B.A. | Cognitive Science | University of California, Berkeley | 2013→2017 | GPA: 3.8/4.0"]);
    expect(skills(r)).toEqual(["Design: Figma, prototyping, user research, design systems", "Technical: HTML, CSS, basic SQL"]);
    expect(entries(r, "awards").map((e) => `${e.title} | ${e.org} | ${e.end}`)).toEqual(["Webby Honoree | Financial Services category | 2022"]);
    expect(r.flags.map((f) => f.code)).toEqual(["name-caps"]);
    expect(r.unassigned).toEqual([]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });

  it("a graduate CV with the name in the page header, Word heading styles and education first", async () => {
    const r = await read("tom-reilly.graduate.docx");
    expect(r.contact).toEqual({ fullName: "Tom Reilly", email: "tom.reilly@example.com", phone: "07700 900377", location: "Nottingham", links: [] });
    expect(r.sections.map((s) => s.kind)).toEqual(["summary", "education", "experience", "volunteering", "skills", "interests"]);
    expect(entries(r, "education").map(course)).toEqual(["BSc | Economics | University of Nottingham | 2022-09→2025-06 | predicted 2:1", "A-Levels |  | Bilborough Sixth Form College | 2020→2022 | Maths (A), Economics (A), Geography (B)"]);
    expect(entries(r, "education")[0].bullets.map((b) => b.text)).toEqual(["Dissertation on regional house prices, using ONS data for 2010 to 2023", "Modules include Econometrics, Public Finance and Behavioural Economics"]);
    expect(entries(r, "experience").map(role)).toEqual(["Sales Assistant | Hartley's Books |  | 2023-06→now", "Summer Intern | Trent Valley Council |  | 2024→2024"]);
    expect(entries(r, "volunteering").map(role)).toEqual(["Treasurer | Economics Society |  | 2023→2024"]);
    expect(section<EntrySection>(r, "volunteering").title).toBe("Positions of Responsibility");
    // Left out on purpose, each with its reason: date of birth, the street address, references.
    expect(r.omitted.map((o) => o.text).sort()).toEqual(["14 Canal Street, Nottingham NG1 7EH", "Date of birth: 3 May 2004", "References available on request"]);
    expect(cvStrings(r).join(" ")).not.toMatch(/Canal Street|NG1|3 May 2004/);
    expect(r.flags.map((f) => f.code).sort()).toEqual(["address", "approx-date", "paragraph"]);
    expect(r.unassigned).toEqual([]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });

  it("Word's own XML habits: split words, a text box, a content control, tracked changes, a link behind a label", async () => {
    const r = await read("sofia-marino.word-quirks.docx");
    // "So" + "fia Mar" + "ino" in three runs is one name; the text box holds the email and town.
    expect(r.contact).toEqual({ fullName: "Sofia Marino", email: "sofia.marino@example.com", phone: "", location: "Glasgow", links: ["linkedin.com/in/sofia-marino-ops"] });
    expect(entries(r, "experience").map(role)).toEqual(["Operations Coordinator | Clyde Freight Services Ltd | Glasgow | 2019-09→now"]);
    // The deleted words ("by half") are gone and the inserted ones are in; "&amp;" is "&".
    expect(entries(r, "experience")[0].bullets.map((b) => b.text)).toEqual(["Schedule 40 drivers a day across three depots", "Cut late deliveries from 12% to 5% in a year", "Trained six new coordinators & wrote the depot handbook"]);
    expect(entries(r, "education").map(course)).toEqual(["HND | Business | City of Glasgow College | →2017 | "]);
    expect(skills(r)).toEqual([": Route planning, rota management, Microsoft Excel"]);
    expect(r.unassigned).toEqual([]);
    expectValidCv(r);
  });

  it("LinkedIn's “Save to PDF” layout", async () => {
    const r = await read("amara-lindqvist.linkedin.pdf");
    expect(r.source).toBe("linkedin-pdf");
    expect(r.contact).toEqual({ fullName: "Amara Lindqvist", email: "amara.lindqvist@example.com", phone: "", location: "Manchester, England, United Kingdom", links: ["linkedin.com/in/amara-lindqvist-78b21"] });
    expect(section<SummarySection>(r, "summary").text).toMatch(/^I plan and run supply chains/);
    // The employer comes first in this layout, "(3 years 8 months)" is dropped, and two roles share one employer.
    expect(entries(r, "experience").map(role)).toEqual(["Supply Chain Manager | Fjord Outdoor | Manchester, England, United Kingdom | 2021-04→now", "Senior Supply Chain Analyst | Kestrel Sportswear |  | 2018-06→2021-03", "Supply Chain Analyst | Kestrel Sportswear |  | 2016-02→2018-05"]);
    expect(entries(r, "experience")[0].bullets.map((b) => b.text)).toEqual(["Responsible for demand planning across 14 countries.", "Reduced stock-outs on core lines from 9% to 3% in two seasons."]);
    expect(entries(r, "education").map(course)).toEqual(["Master of Science - MS | Logistics | Lund University | 2013→2015 | ", "Bachelor of Science - BS | Business Studies | Uppsala University | 2010→2013 | "]);
    expect(skills(r)).toEqual([": Supply Chain Management, Demand Planning, SAP"]);
    expect(section<ListSection>(r, "languages").items.map((i) => `${i.name}: ${i.level}`)).toEqual(["Swedish: Native or Bilingual", "English: Full Professional"]);
    expect(entries(r, "certificates").map((e) => e.title)).toEqual(["CIPS Level 4 Diploma"]);
    expect(r.unassigned.map((u) => u.text)).toEqual(["Supply Chain Manager at Fjord Outdoor"]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });

  it("the app's older sample CV, with bullets drawn as shapes", async () => {
    const r = await readCvFile(new Uint8Array(fs.readFileSync(path.join(FIXTURES, "../sam-okafor-cv.pdf"))));
    expect(entries(r, "experience").map(role)).toEqual(["Analyst | Brightline Energy |  | 2022→now", "Junior analyst | Moxa Retail |  | 2021→2021"]);
    expect(entries(r, "experience").map((e) => e.bullets.length)).toEqual([3, 1]);
    expect(entries(r, "education").map(course)).toEqual(["BSc | Economics | University of Leeds | →2020 | "]);
    expectNothingInvented(r);
    expectNothingLost(r);
  });
});

describe("files that cannot be read each say why", () => {
  const fails = async (bytes: Uint8Array) => {
    try {
      await readCvFile(bytes);
    } catch (e) {
      if (e instanceof ImportError) return e.code;
      throw e;
    }
    return "read";
  };

  it("a scan (a picture of a CV) has no text", async () => expect(await fails(file("scanned.pdf"))).toBe("scanned"));
  it("a password-protected PDF", async () => expect(await fails(file("password.pdf"))).toBe("password"));
  it("an old .doc file", async () => expect(await fails(file("old-word.doc"))).toBe("old-word"));
  it("a rich text file", async () => expect(await fails(new TextEncoder().encode("{\\rtf1\\ansi " + "x".repeat(200) + "}"))).toBe("old-word"));
  it("something that is not a document", async () => expect(await fails(new Uint8Array(500).fill(7))).toBe("not-supported"));
  it("a PNG named cv.pdf is judged by its contents, not its name", async () => expect(await fails(new Uint8Array([0x89, 0x50, 0x4e, 0x47, ...new Array(300).fill(0)]))).toBe("not-supported"));
  it("a damaged PDF", async () => expect(await fails(new TextEncoder().encode("%PDF-1.7\n" + "garbage ".repeat(60)))).toBe("unreadable"));
  it("a damaged Word file", async () => expect(await fails(new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new Array(300).fill(1)]))).toBe("unreadable"));
  it("a zip that is not a Word file", async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    zip.file("notes.txt", "hello ".repeat(100));
    expect(await fails(await zip.generateAsync({ type: "uint8array" }))).toBe("unreadable");
  });
  it("an empty file", async () => expect(await fails(new Uint8Array(10))).toBe("empty"));
  it("a file over 5 MB", async () => expect(await fails(new Uint8Array(5 * 1024 * 1024 + 1))).toBe("too-big"));
  it("pasted text that is almost empty", () => expect(() => readCvText("  hello  ")).toThrow(ImportError));

  it("every reason has plain words and a way forward", () => {
    for (const info of Object.values(IMPORT_ERRORS)) {
      expect(info.message.length).toBeGreaterThan(30);
      expect(info.offer.length).toBeGreaterThan(0);
    }
    expect(IMPORT_ERRORS.scanned.offer[0]).toBe("paste");
  });

  it("tells file types apart by their first bytes", () => {
    expect(sniff(file("maya-chen.chrome.pdf"))).toBe("pdf");
    expect(sniff(file("maya-chen.writer.docx"))).toBe("zip");
    expect(sniff(file("old-word.doc"))).toBe("old-word");
  });
});

describe("pasted text (the way through for scans and old files)", () => {
  it("reads into the same structure", () => {
    const r = readCvText("Maya Chen\nmaya@example.com\n\nEXPERIENCE\nPaid Media Manager, Northlight Agency\tMar 2021 – Present\n• Run Google Ads campaigns for six retail clients\n\nSKILLS\nGoogle Ads, Excel");
    expect(r.source).toBe("text");
    expect(entries(r, "experience").map(role)).toEqual(["Paid Media Manager | Northlight Agency |  | 2021-03→now"]);
    expectNothingInvented(r);
    expectNothingLost(r);
    expectValidCv(r);
  });
});

describe("the Word XML reader", () => {
  it("reads elements, attributes, entities and self-closing tags", () => {
    const root = parseXml('<?xml version="1.0"?><!-- note --><a x="1" y=\'two &amp; three\'><b/>text &lt;here&gt; &#233;&#x20AC;<c>inner</c></a>');
    const a = root.children[0];
    expect(a.name).toBe("a");
    expect(a.attrs).toEqual({ x: "1", y: "two & three" });
    expect(a.text).toBe("text <here> é€");
    expect(a.children.map((c) => c.name)).toEqual(["b", "c"]);
    expect(a.children[1].text).toBe("inner");
  });

  it("an empty contact block is valid", () => expect(emptyContact()).toEqual({ fullName: "", email: "", phone: "", location: "", links: [] }));
});
