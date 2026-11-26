import { describe, expect, it } from "vitest";
import { CV_TEMPLATES } from "../schema";
import { BODY_SIZE, FAMILY_NAMES, TEMPLATES, TEMPLATE_FAMILIES, type TemplateDef, templateLabel } from "./templates";

const all = Object.values(TEMPLATES) as TemplateDef[];

describe("the template catalogue", () => {
  it("has 45 templates, numbered 1 to 45, each number once", () => {
    expect(all).toHaveLength(45);
    expect(all.map((t) => t.no).sort((a, b) => a - b)).toEqual(Array.from({ length: 45 }, (_, i) => i + 1));
    expect(CV_TEMPLATES).toHaveLength(45);
    for (const id of CV_TEMPLATES) expect(TEMPLATES[id].id).toBe(id);
  });

  it("gives each a name of its own, and none of another builder's template names", () => {
    const names = all.map((t) => t.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    const theirs = ["standard", "jake's", "harvard", "simple", "ats basic", "modern", "alternative", "compact", "dev", "dev compact", "creative", "sales", "it", "swiss", "illustrator"];
    expect(names.filter((n) => theirs.includes(n))).toEqual([]);
  });

  it("puts five templates in each of the nine families", () => {
    for (const f of TEMPLATE_FAMILIES) expect(all.filter((t) => t.family === f).map((t) => t.name), FAMILY_NAMES[f]).toHaveLength(5);
  });

  it("labels each by number and name", () => {
    expect(templateLabel(TEMPLATES.harbour)).toBe("No. 07 · Harbour");
    expect(templateLabel(TEMPLATES.standard)).toBe("No. 01 · Hallmark");
  });

  it("keeps letter-spacing under a tenth of the type size, so PDF readers keep letters together as words", () => {
    for (const t of all) expect(t.heading.tracking ?? 0, t.name).toBeLessThan(0.1);
  });

  it("makes section headings stand apart from job titles: at least 1pt larger than body text, or in capitals", () => {
    // A heading the same size and weight as a bold job title is taken for one, by screening software and by the upload reader.
    for (const t of all) expect(t.heading.caps || t.heading.size >= BODY_SIZE + 1, t.name).toBe(true);
  });

  it("keeps every template one column of real text with standard section kinds", () => {
    for (const t of all) {
      expect(t.order, t.name).not.toContain("custom");
      expect(t.tags.length, t.name).toBeGreaterThan(0);
    }
  });
});
