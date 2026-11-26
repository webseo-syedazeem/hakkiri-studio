import { describe, expect, it } from "vitest";
import { audit } from "@/test/cv-quality";
import { CvDocSchema } from "../schema";
import { exampleCv, pick } from "./build";
import { EXAMPLES } from "./index";
import { REGIONS, type Regional } from "./types";

/**
 * Every example CV is shown to people as what a strong CV looks like, so each
 * one, in both its UK and US version, must clear the bar in `test/cv-quality`:
 * spelled right for its region, plain grammar, no AI-sounding words, no "I",
 * abbreviations spelt out, both files read back word for word, and nothing at
 * all for the app's own CV score to flag.
 */
describe.each(EXAMPLES.flatMap((spec) => REGIONS.map((region) => [spec.id, region, spec] as const)))("%s (%s)", (_id, region, spec) => {
  const cv = exampleCv(spec, region, "usr_test");

  it("is a valid CV", () => {
    expect(CvDocSchema.safeParse(cv).success).toBe(true);
  });

  it("has nothing for the checks or the CV score to flag", async () => {
    const a = await audit(cv, undefined, spec.names);
    expect({ spelling: a.spelling, otherRegion: a.otherRegion, grammar: a.grammar, aiWords: a.aiWords, firstPerson: a.firstPerson, acronyms: a.acronyms, bulletEnds: a.bulletEnds, files: a.files, issues: a.issues, suggestions: a.suggestions, missing: a.missing }).toEqual({
      spelling: [], otherRegion: [], grammar: [], aiWords: [], firstPerson: [], acronyms: [], bulletEnds: [], files: "", issues: [], suggestions: [], missing: [],
    });
    expect(a.goodEnough).toBe(true);
    expect(a.score).toBeGreaterThanOrEqual(98);
  }, 30_000);
});

describe("the examples as a set", () => {
  it("have unique ids that work in a web address", () => {
    const ids = EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("write money separately for each region: a shared line never carries £ or $", () => {
    const shared: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") {
        if (/[£$]/.test(v)) shared.push(v);
      } else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object" && !("uk" in v && "us" in v)) Object.values(v).forEach(walk);
    };
    for (const spec of EXAMPLES) walk(spec);
    expect(shared).toEqual([]);
  });

  it("use each region's currency in that region's version", () => {
    for (const spec of EXAMPLES)
      for (const region of REGIONS) {
        const text = JSON.stringify(exampleCv(spec, region, "u").sections);
        expect(text.includes(region === "uk" ? "$" : "£"), `${spec.id} ${region}`).toBe(false);
      }
  });

  it("give each person contact details for the region", () => {
    for (const spec of EXAMPLES) {
      expect(pick(spec.person.phone as Regional<string>, "uk")).toMatch(/^07700 900\d{3}$/);
      expect(pick(spec.person.phone as Regional<string>, "us")).toMatch(/^\(\d{3}\) 555-01\d{2}$/);
      expect(spec.person.email).toMatch(/@example\.com$/);
    }
  });
});
