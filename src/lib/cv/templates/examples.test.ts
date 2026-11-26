import { describe, it, expect } from "vitest";
import { EXAMPLE_TEMPLATES, instantiateTemplate } from "./examples";
import { CvDocSchema } from "@/lib/cv/schema";

describe("CV Example Templates", () => {
  it("every example template instantiates into a valid, schema-compliant CvDoc", () => {
    expect(EXAMPLE_TEMPLATES.length).toBeGreaterThan(0);
    for (const template of EXAMPLE_TEMPLATES) {
      const doc = instantiateTemplate(template, "user_test_123");
      const parsed = CvDocSchema.safeParse(doc);
      expect(parsed.success, `Template ${template.id} failed schema parsing: ${parsed.error?.message}`).toBe(true);
      expect(doc.sections.length).toBeGreaterThan(0);
      expect(doc.name).toContain(template.title);
    }
  });
});
