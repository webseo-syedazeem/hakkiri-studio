import { describe, expect, it } from "vitest";
import { headingSlug, markdownToHtml } from "./markdown";

describe("blog headings", () => {
  it("give every heading an anchor that the contents list links to", () => {
    const md = "## Top 4 Clinical & Behavioural Questions to Expect\n\nText.\n\n### 1. \"How do you handle a conflict?\"";
    const html = markdownToHtml(md);
    for (const h of ["Top 4 Clinical & Behavioural Questions to Expect", '1. "How do you handle a conflict?"']) {
      expect(html).toContain(`id="${headingSlug(h)}"`);
    }
    expect(headingSlug("Real Scenario: Deteriorating Patient on Night Shift")).toBe("real-scenario-deteriorating-patient-on-night-shift");
  });
});
