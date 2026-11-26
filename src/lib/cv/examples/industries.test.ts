import { describe, expect, it } from "vitest";
import { misspelled } from "@/test/cv-quality";
import { wrongRegionSpelling } from "../score/detect";
import { pick, pickList } from "./build";
import { EXAMPLES } from "./index";
import { INDUSTRIES } from "./industries";
import { REGIONS } from "./types";

/** Words in the industry packs that are names of qualifications, bodies or tools. */
const NAMES = ["CompTIA", "PRINCE2", "ScrumMaster", "Propertymark", "HubSpot", "Salesforce", "SHRM", "Figma", "Adobe", "QA", "UX", "SEO", "HR", "PR", "HGV", "B1", "B2", "Juris", "Practising"];

describe("industry packs", () => {
  it("cover 30 industries, each once", () => {
    expect(INDUSTRIES).toHaveLength(30);
    expect(new Set(INDUSTRIES.map((i) => i.id)).size).toBe(30);
  });

  it("name each role once across all industries, with an id that works in a web address", () => {
    const ids = INDUSTRIES.flatMap((i) => i.roles.map((r) => r.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(ids.length).toBeGreaterThanOrEqual(100);
  });

  it("list every example under its industry's roles", () => {
    for (const e of EXAMPLES) expect(INDUSTRIES.find((i) => i.id === e.industry)?.roles.map((r) => r.id), e.id).toContain(e.id);
  });

  it("use only standard section headings, so screening software finds each section", () => {
    for (const i of INDUSTRIES) expect(i.sections, i.id).not.toContain("custom");
  });

  it.each(REGIONS)("are spelled correctly for the %s, with no spelling from the other region", (region) => {
    const texts = INDUSTRIES.flatMap((i) => [pick(i.name, region), ...i.roles.map((r) => pick(r.title, region)), ...pickList(i.credentials, region), ...pickList(i.keywords, region)]);
    expect(misspelled(texts, region, NAMES)).toEqual([]);
    expect(texts.flatMap((t) => wrongRegionSpelling(t, region).map((h) => `${t}: ${h.text}`))).toEqual([]);
  });
});
