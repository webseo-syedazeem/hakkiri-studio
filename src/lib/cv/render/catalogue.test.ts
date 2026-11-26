import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { wrongRegionSpelling } from "../score/detect";
import { CV_TEMPLATES } from "../schema";
import { galleryItems } from "../templates/gallery";
import { BODY_SIZE, FAMILY_NAMES, TEMPLATES, TEMPLATE_FAMILIES, type TemplateDef, catalogue, templateBySlug, templateLabel, templateMeta, templatePreview, templateSlug } from "./templates";

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

  it("gives each a web address from its number and name, and finds it again", () => {
    expect(templateSlug(TEMPLATES.harbour)).toBe("07-harbour");
    expect(templateSlug(TEMPLATES["first-light"])).toBe("28-first-light");
    const slugs = all.map(templateSlug);
    expect(new Set(slugs).size).toBe(all.length);
    for (const t of all) expect(templateBySlug(templateSlug(t))?.id).toBe(t.id);
    expect(templateBySlug("07-hallmark")).toBeUndefined();
    expect(catalogue().map((t) => t.no)).toEqual(Array.from({ length: all.length }, (_, i) => i + 1));
  });

  it("has a CV and a cover letter preview image for every template (scripts/template-previews.cjs)", () => {
    for (const t of all) for (const size of ["large", "small"] as const) for (const kind of ["cv", "letter"] as const) expect(existsSync(join(process.cwd(), "public", templatePreview(t, size, kind))), templatePreview(t, size, kind)).toBe(true);
  });

  it("words each template in the region's spelling for the UK and US galleries", () => {
    for (const region of ["uk", "us"] as const) {
      for (const item of galleryItems(region)) {
        for (const text of [item.suits, ...item.tags]) expect(wrongRegionSpelling(text, region).filter((h) => !h.isTypo), `${region}: ${text}`).toEqual([]);
      }
      for (const t of all) {
        const meta = templateMeta(t, region === "us" ? "resume" : "cv");
        expect(wrongRegionSpelling(meta.description, region).filter((h) => !h.isTypo), meta.description).toEqual([]);
        expect(meta.title).toContain(region === "us" ? "resume template" : "CV template");
      }
    }
    expect(galleryItems("us").find((t) => t.id === "harbour")?.tags.join(" ")).not.toMatch(/colour|centred/);
  });
});
