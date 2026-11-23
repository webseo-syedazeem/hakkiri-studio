import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { parseXml } from "../import/docx";
import { BulletSchema, type EntrySection, type SummarySection, SummarySectionSchema, storable } from "../schema";
import { contentDisposition, fileName } from "./filename";
import { flowText, href } from "./flow";
import { wordsOf } from "./readback";
import { exportCv } from "./server";
import { fernCv, longCv } from "./testing";

/**
 * Ordinary punctuation must not stop a download. The file is read back and
 * compared with the CV word for word; these are the cases where the reader's
 * own tidying once made a correct file look wrong, and the characters that
 * cannot be seen or cannot be written to a file at all.
 */

const WHEN = new Date("2026-11-23T12:00:00Z");
const experience = (cv: ReturnType<typeof fernCv>) => cv.sections.find((s) => s.kind === "experience") as EntrySection;
const summary = (cv: ReturnType<typeof fernCv>) => cv.sections.find((s) => s.kind === "summary") as SummarySection;

async function bothChecked(cv: ReturnType<typeof fernCv>, what: string) {
  for (const format of ["pdf", "docx"] as const) {
    const out = await exportCv(cv, format, WHEN);
    expect({ format, what, missing: out.check?.missing, unexpected: out.check?.unexpected }).toEqual({ format, what, missing: [], unexpected: [] });
    expect(out.check?.status).toBe("checked");
  }
}

describe("ordinary punctuation downloads as checked, as PDF and as Word", () => {
  it("a spaced hyphen in a long line, wherever the line happens to wrap", async () => {
    const line = "Rebuilt the induction for new front-of-house volunteers at the Leeds and Bradford museum sites - from a two-day course to a half-day session";
    // Shift the wrap one word at a time, so the hyphen lands at the end of a line, at the start of one and in between.
    for (let pad = 0; pad < 14; pad++) {
      const cv = fernCv();
      experience(cv).entries[0].bullets[0].text = `${Array.from({ length: pad }, () => "and").join(" ")} ${line}`.trim();
      await bothChecked(cv, `pad ${pad}`);
    }
  });

  it("“pre- and post-launch” at any wrap", async () => {
    for (let pad = 0; pad < 16; pad++) {
      const cv = fernCv();
      experience(cv).entries[0].bullets[0].text = `${Array.from({ length: pad }, () => "the").join(" ")} Ran pre- and post-launch reviews of every one of the new handling sessions for volunteers across both sites`.trim();
      await bothChecked(cv, `pad ${pad}`);
    }
  });

  it.each([
    ["a profile that starts with a dash", (cv: ReturnType<typeof fernCv>) => void (summary(cv).text = "– Gallery assistant with four years’ experience caring for paper collections.")],
    ["a bullet that starts “- ”", (cv: ReturnType<typeof fernCv>) => void (experience(cv).entries[0].bullets[0].text = "- Catalogued incoming paper maps")],
    ["a bullet that starts “* ”", (cv: ReturnType<typeof fernCv>) => void (experience(cv).entries[0].bullets[0].text = "* Catalogued incoming paper maps")],
    ["a job title that starts “2) ”", (cv: ReturnType<typeof fernCv>) => void (experience(cv).entries[0].title = "2) Curator")],
    ["a bullet that is only a number and a full stop away from a list mark", (cv: ReturnType<typeof fernCv>) => void (experience(cv).entries[0].bullets[0].text = "1. Catalogued incoming paper maps")],
    ["a soft hyphen and a zero-width space inside words", (cv: ReturnType<typeof fernCv>) => void (experience(cv).entries[0].bullets[0].text = "Cata­logued in​coming paper maps")],
  ])("%s", async (what, change) => {
    const cv = fernCv();
    change(cv);
    await bothChecked(cv, what);
  });

  it("a CV of more than twelve pages can still be checked", async () => {
    const cv = longCv(40, 6);
    const out = await exportCv(cv, "pdf", WHEN);
    expect(out.pages).toBeGreaterThan(12);
    expect(out.check?.status).toBe("checked");
  }, 60000);

  it("a CV with only a name on it can be checked too", async () => {
    const cv = fernCv();
    cv.sections = [];
    cv.contact = { fullName: "Fern", email: "", phone: "", location: "", links: [] };
    await bothChecked(cv, "name only");
  });
});

describe("characters that cannot be seen, or cannot be in a file", () => {
  it("are taken out when text is saved", () => {
    expect(storable("Cata­logued in​coming﻿ maps⁠")).toBe("Catalogued incoming maps");
    expect(BulletSchema.parse({ id: "b_0001", text: "Trained￿ six new‍ starters" }).text).toBe("Trained six new starters");
    // Half of an emoji is not a character.
    expect(BulletSchema.parse({ id: "b_0001", text: "Ran the stall \ud83d" }).text).toBe("Ran the stall");
    expect(SummarySectionSchema.parse({ id: "s_0001", kind: "summary", text: "Line one Line two" }).text).toBe("Line one\nLine two");
  });

  it("text is cut by whole characters, never through an emoji", () => {
    const text = `${"a".repeat(599)}😀`;
    const kept = BulletSchema.parse({ id: "b_0001", text }).text;
    expect([...kept]).toHaveLength(600);
    expect(kept.endsWith("😀")).toBe(true);
    expect(BulletSchema.parse({ id: "b_0001", text: `${"a".repeat(600)}😀` }).text).toBe("a".repeat(600));
  });

  it("the comparison ignores them, so an older saved CV that still holds one is not refused", () => {
    expect(wordsOf("Cata­logued in​coming maps")).toEqual(["catalogued", "incoming", "maps"]);
  });

  it("the Word file is well-formed even when the text holds a character XML does not allow", async () => {
    const cv = fernCv();
    experience(cv).entries[0].bullets[0].text = "Catalogued￿ incoming\u0001 paper maps";
    const out = await exportCv(cv, "docx", WHEN);
    const xml = await (await JSZip.loadAsync(out.bytes)).file("word/document.xml")!.async("string");
    expect(/[￾￿\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(xml)).toBe(false);
    expect(() => parseXml(xml)).not.toThrow();
    expect(xml).toContain("Catalogued incoming paper maps");
  });
});

describe("file names and links", () => {
  it("a file name that ends on an emoji never breaks the download", () => {
    const cv = fernCv({ fileName: `${"n".repeat(79)}😀` });
    const name = fileName(cv, "pdf");
    expect(() => contentDisposition(name)).not.toThrow();
    expect(/[\uD800-\uDFFF]/u.test(name)).toBe(false);
    // And one that was cut through an emoji by an older save.
    expect(() => contentDisposition(`${"n".repeat(79)}\ud83d.pdf`)).not.toThrow();
  });

  it("only web and email addresses are made into live links", async () => {
    expect(href("linkedin.com/in/fern")).toBe("https://linkedin.com/in/fern");
    expect(href("https://example.com/x")).toBe("https://example.com/x");
    expect(href("mailto:fern@example.com")).toBe("mailto:fern@example.com");
    expect(href("javascript:alert(1)")).toBeUndefined();
    expect(href("file:///etc/passwd")).toBeUndefined();
    expect(href("data:text/html,x")).toBeUndefined();
    const cv = fernCv();
    cv.contact.links = ["javascript:alert(1)"];
    const out = await exportCv(cv, "docx", WHEN);
    const zip = await JSZip.loadAsync(out.bytes);
    const rels = await zip.file("word/_rels/document.xml.rels")!.async("string");
    expect(rels).not.toContain("javascript");
    // The words are still printed: nothing the person typed is dropped.
    expect(flowText(out.flow)).toContain("javascript:alert(1)");
    const pdf = await exportCv(cv, "pdf", WHEN);
    expect(new TextDecoder("latin1").decode(pdf.bytes)).not.toContain("javascript:alert");
  });
});
