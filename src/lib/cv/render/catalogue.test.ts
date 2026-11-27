import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { wrongRegionSpelling } from "../score/detect";
import { CV_TEMPLATES } from "../schema";
import { galleryItems } from "../templates/gallery";
import { BODY_SIZE, FAMILY_NAMES, GALLERY_V3, MERGED_INTO, TEMPLATES, TEMPLATE_FAMILIES, type TemplateDef, allTemplates, catalogue, galleryTemplates, isOffered, templateBySlug, templateLabel, templateMeta, templatePreview, templateSlug } from "./templates";

const all = Object.values(TEMPLATES) as TemplateDef[];

describe("the template catalogue", () => {
  it("has the 45 original templates, numbered 1 to 45, plus the five v3 designs, each number once", () => {
    expect(all).toHaveLength(50);
    expect(all.map((t) => t.no).sort((a, b) => a - b)).toEqual([...Array.from({ length: 45 }, (_, i) => i + 1), 46, 47, 49, 51, 52]);
    expect(CV_TEMPLATES).toHaveLength(50);
    for (const id of CV_TEMPLATES) expect(TEMPLATES[id].id).toBe(id);
  });

  it("offers the v3 gallery of 20 designs, covering all nine families, and keeps every saved design openable", () => {
    expect(galleryTemplates().map((t) => t.no)).toEqual([...GALLERY_V3]);
    for (const f of TEMPLATE_FAMILIES) expect(galleryTemplates().some((t) => t.family === f), FAMILY_NAMES[f]).toBe(true);
    // Healthcare and Teaching stay on offer.
    expect(galleryTemplates().map((t) => t.id)).toEqual(expect.arrayContaining(["ward", "chalkboard"]));
    for (const t of all) expect(templateBySlug(templateSlug(t))?.id).toBe(t.id);
  });

  it("gives each a name of its own, and none of another builder's template names", () => {
    const names = all.map((t) => t.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    const theirs = ["standard", "jake's", "harvard", "simple", "ats basic", "modern", "alternative", "compact", "dev", "dev compact", "creative", "sales", "it", "swiss", "illustrator"];
    expect(names.filter((n) => theirs.includes(n))).toEqual([]);
  });

  it("puts five of the original 45 templates in each of the nine families", () => {
    for (const f of TEMPLATE_FAMILIES) expect(allTemplates().filter((t) => t.no <= 45 && t.family === f).map((t) => t.name), FAMILY_NAMES[f]).toHaveLength(5);
  });

  it("merges every design no longer offered into one that is (TEMPLATES-v3 §01), and the public galleries list the same 20 as the app", () => {
    for (const [from, to] of Object.entries(MERGED_INTO)) {
      expect(TEMPLATES[from as keyof typeof TEMPLATES], from).toBeDefined();
      expect(isOffered(TEMPLATES[to!]), `${from} → ${to}`).toBe(true);
    }
    expect(Object.keys(MERGED_INTO)).toHaveLength(30);
    for (const t of allTemplates()) expect(isOffered(t) !== !!MERGED_INTO[t.id], t.name).toBe(true);
    expect(catalogue().map((t) => t.no)).toEqual([...GALLERY_V3]);
    expect(galleryItems("uk")).toHaveLength(20);
  });

  it("labels each by number and name", () => {
    expect(templateLabel(TEMPLATES.harbour)).toBe("No. 07 · Header Band");
    expect(templateLabel(TEMPLATES.standard)).toBe("No. 01 · Clean Sans");
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
    expect(templateSlug(TEMPLATES.harbour)).toBe("07-header-band");
    expect(templateSlug(TEMPLATES["first-light"])).toBe("28-graduate-band");
    expect(templateSlug(TEMPLATES.tally)).toBe("17-compact-two-page");
    const slugs = all.map(templateSlug);
    expect(new Set(slugs).size).toBe(all.length);
    for (const t of all) expect(templateBySlug(templateSlug(t))?.id).toBe(t.id);
    expect(templateBySlug("07-clean-sans")).toBeUndefined();
    expect(templateSlug(TEMPLATES["margin-notes"])).toBe("49-margin-notes");
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
