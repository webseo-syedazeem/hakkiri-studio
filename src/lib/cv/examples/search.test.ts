import { describe, expect, it } from "vitest";
import { EXAMPLES } from "./index";
import { findExamples, findTemplates, industriesFor, words } from "./search";

const ids = (q: string, more = {}) => findExamples({ q, ...more }).map((e) => e.id);
const tids = (q: string, more = {}) => findTemplates({ q, ...more }).map((t) => t.id);

describe("finding an example by the job someone wants", () => {
  it.each([
    ["pilot", "first-officer"],
    ["airline pilot", "first-officer"],
    ["nurse", "staff-nurse"],
    ["nurses", "staff-nurse"],
    ["teacher", "primary-teacher"],
    ["marketing", "marketing-lead"],
    ["software engineer", "software-engineer"],
    ["flight attendant", "cabin-crew"],
    ["cabin crew", "cabin-crew"],
    ["realtor", "estate-agent"],
    ["loan officer", "mortgage-adviser"],
    ["chef", "chef"],
    ["carer", "care-worker"],
    ["paralegal", "paralegal"],
    ["lawyer", "paralegal"],
    ["data scientist", "data-scientist"],
    ["warehouse", "warehouse-operative"],
    ["graphic designer", "graphic-designer"],
    ["Registered Nurse", "staff-nurse"],
  ])("“%s” finds %s first", (q, id) => {
    expect(ids(q)[0], ids(q).join(", ")).toBe(id);
  });

  it("finds every example of a job, not only the first", () => {
    expect(ids("pilot")).toEqual(expect.arrayContaining(["first-officer", "cabin-crew"]));
    expect(ids("analyst")).toEqual(expect.arrayContaining(["business-analyst", "finance-analyst", "data-scientist"]));
  });

  it("finds nothing for a word that means nothing here, and everything for an empty search", () => {
    expect(ids("zzzz")).toEqual([]);
    expect(ids("")).toHaveLength(EXAMPLES.length);
    expect(ids("  the   cv  ")).toHaveLength(EXAMPLES.length);
  });

  it("narrows by industry and level", () => {
    expect(ids("", { industry: "aviation" }).sort()).toEqual(["cabin-crew", "first-officer"]);
    expect(ids("", { level: "student" })).toEqual(EXAMPLES.filter((e) => e.level === "student").map((e) => e.id));
    expect(ids("nurse", { industry: "aviation" })).toEqual([]);
  });

  it("reads words plainly", () => {
    expect(words("Nurses, teachers & pilots")).toEqual(["nurse", "teacher", "pilot"]);
    expect(words("Business")).toEqual(["business"]);
    expect([...industriesFor("pilot")]).toEqual(["aviation"]);
  });
});

describe("finding a template for a job", () => {
  it("brings the designs made for that kind of job first", () => {
    expect(tids("nurse")[0]).toBe("ward");
    expect(tids("teacher")[0]).toBe("chalkboard");
    expect(tids("developer").slice(0, 6)).toEqual(expect.arrayContaining(["technical"]));
  });

  it("finds a design by its own name and style", () => {
    expect(tids("clearline")[0]).toBe("clearline");
    expect(tids("compact")).toEqual(expect.arrayContaining(["compact", "index"]));
  });

  it("lists the 20 designs of the v3 gallery by number when nothing is asked, and keeps to one look when asked", () => {
    const all = findTemplates({ q: "" });
    expect(all).toHaveLength(20);
    expect(all.map((t) => t.no)).toEqual([1, 2, 6, 7, 11, 16, 19, 21, 26, 30, 31, 36, 39, 40, 42, 46, 47, 49, 51, 52]);
    expect(findTemplates({ q: "", look: "executive" }).every((t) => t.family === "executive")).toBe(true);
  });
});
