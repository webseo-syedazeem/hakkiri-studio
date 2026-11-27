import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Saved CVs go to a throwaway folder, never into the project's own .data folder.
process.env.HAKKIRI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-examples-"));
const { EXAMPLE_TEMPLATES, instantiateTemplate } = await import("./examples");
const { CvDocSchema } = await import("@/lib/cv/schema");
const { saveCv } = await import("@/lib/cv/store");

describe("CV Example Templates", () => {
  it("every example template instantiates into a valid, schema-compliant CvDoc and can be saved", async () => {
    expect(EXAMPLE_TEMPLATES.length).toBeGreaterThan(0);
    for (const template of EXAMPLE_TEMPLATES) {
      const doc = instantiateTemplate(template, "user_test_123");
      const parsed = CvDocSchema.safeParse(doc);
      expect(parsed.success, `Template ${template.id} failed schema parsing: ${parsed.error?.message}`).toBe(true);
      expect(doc.sections.length).toBeGreaterThan(0);
      expect(doc.name).toContain(template.title);

      const saved = await saveCv(doc);
      expect(saved.id).toBe(doc.id);
    }
  }, 60_000);
});
