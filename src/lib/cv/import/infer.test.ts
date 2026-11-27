import { describe, expect, it } from "vitest";
import { type Section, emptyEntry, emptySection } from "../schema";
import { inferLevel, inferName, inferRegion, inferSetup } from "./infer";

const NOW = new Date("2026-11-27T12:00:00Z");

function withEntries(kind: "experience" | "education", entries: Partial<ReturnType<typeof emptyEntry>>[]): Section {
  const s = emptySection(kind);
  if (!("entries" in s)) throw new Error("entry section expected");
  return { ...s, entries: entries.map((e) => ({ ...emptyEntry(), ...e })) };
}

describe("inferRegion", () => {
  it("reads a UK phone number, postcode and spelling", () => {
    const r = inferRegion("Chloe Bennett\n07700 900123 · Leeds LS1 4AP\nOrganised the programme and analysed results");
    expect(r.region).toBe("uk");
    expect(r.why).toMatch(/^UK phone number and postcode and spelling$/);
  });

  it("reads a US phone number, state and spelling", () => {
    const r = inferRegion("Jordan Lee\n(415) 555-0134 · San Francisco, CA 94103\nOrganized the program and analyzed results; GPA 3.8");
    expect(r.region).toBe("us");
    expect(r.why).toMatch(/^US phone number and state and spelling$/);
  });

  it("says when nothing points either way: not known", () => {
    const r = inferRegion("Sam Patel\nsam@example.com\nShop assistant");
    expect(r.known).toBe(false);
    expect(r.why).toBe("Nothing in the file said UK or US");
  });

  it("does not choose when the file shows both, about equally", () => {
    const r = inferRegion("07700 900123\nOrganized the program in Boston, MA");
    expect(r.known).toBe(false);
    expect(r.why).toMatch(/^The file shows both/);
  });

  it("does not take a UK number for a US one", () => {
    expect(inferRegion("+44 7700 900123").region).toBe("uk");
  });
});

describe("inferLevel", () => {
  it("uses the years since the first role", () => {
    expect(inferLevel([withEntries("experience", [{ start: "2010-03" }, { start: "2019-01" }])], NOW)).toEqual({ level: "senior", why: "16 years since your first role", known: true });
    expect(inferLevel([withEntries("experience", [{ start: "2021-09" }])], NOW)).toEqual({ level: "experienced", why: "5 years since your first role", known: true });
    expect(inferLevel([withEntries("experience", [{ start: "2026-02" }])], NOW).level).toBe("early");
  });

  it("calls recent study with little work history student", () => {
    expect(inferLevel([withEntries("education", [{ end: "2026-06" }])], NOW).level).toBe("student");
    expect(inferLevel([withEntries("education", [{ current: true }]), withEntries("experience", [{ start: "2026-05" }])], NOW).level).toBe("student");
  });

  it("does not guess from dates it cannot read", () => {
    const r = inferLevel([withEntries("experience", [{ start: "" }, { start: "sometime" }])], NOW);
    expect(r).toEqual({ level: "experienced", why: "No dated work history", known: false });
  });

  it("ignores dates in the future or before 1950", () => {
    expect(inferLevel([withEntries("experience", [{ start: "2031-01" }, { start: "1900-01" }, { start: "2022-01" }])], NOW).why).toBe("4 years since your first role");
  });
});

describe("inferName", () => {
  const exp = [withEntries("experience", [{ title: "Marketing Manager" }, { title: "Marketing Executive" }])];
  it("names the CV after the person and their latest role", () => {
    expect(inferName("Chloe Bennett", exp, "cv.pdf")).toBe("Chloe Bennett – Marketing Manager");
    expect(inferName("Chloe Bennett", [], "cv.pdf")).toBe("Chloe Bennett");
  });

  it("falls back to the file's name, then to My CV", () => {
    expect(inferName("", exp, "chloe_bennett-cv-2026.docx")).toBe("chloe bennett cv 2026");
    expect(inferName("", [], "Pasted text")).toBe("My CV");
    expect(inferName(" ", [], "")).toBe("My CV");
  });
});

describe("inferSetup", () => {
  it("puts the three together, each with why", () => {
    const out = inferSetup({ fullName: "Chloe Bennett", sections: [withEntries("experience", [{ title: "Marketing Manager", start: "2018-04" }])], text: "07700 900123 Leeds LS1 4AP", fileName: "cv.pdf" }, NOW);
    expect(out).toEqual({ region: "uk", level: "experienced", name: "Chloe Bennett – Marketing Manager", why: { region: "UK phone number and postcode", level: "8 years since your first role" }, unknown: [] });
    expect(inferSetup({ fullName: "", sections: [], text: "", fileName: "Pasted text" }, NOW).unknown).toEqual(["region", "level"]);
  });
});
