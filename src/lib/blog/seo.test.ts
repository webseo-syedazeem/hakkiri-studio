import { describe, it, expect } from "vitest";
import {
  slugify,
  calculateReadingTimeMinutes,
  extractParagraphs,
  extractHeadings,
  analyzeBlogSeo,
} from "./seo";
import { markdownToHtml } from "./markdown";
import type { BlogPost } from "./types";

describe("Blog SEO Analysis Engine", () => {
  it("slugifies titles into clean, URL-friendly strings", () => {
    expect(slugify("How to Ace Your NHS Band 5 Interview in 2026!"))
      .toBe("how-to-ace-your-nhs-band-5-interview-in-2026");
    expect(slugify("  Special @# Characters & Symbols --- "))
      .toBe("special-characters-symbols");
  });

  it("calculates reading time correctly based on 200 words per minute", () => {
    const text100Words = Array(100).fill("word").join(" ");
    expect(calculateReadingTimeMinutes(text100Words)).toBe(1);

    const text450Words = Array(450).fill("word").join(" ");
    expect(calculateReadingTimeMinutes(text450Words)).toBe(3);
  });

  it("extracts paragraphs and isolates long paragraphs (>120 words)", () => {
    const shortPara = "This is a concise paragraph describing clinical governance in healthcare.";
    const longPara = Array(130).fill("evidence").join(" ");
    const content = `${shortPara}\n\n${longPara}`;

    const paras = extractParagraphs(content);
    expect(paras.length).toBe(2);

    const analysis = analyzeBlogSeo({
      title: "Clinical Governance Guide for Nurses",
      slug: "clinical-governance-guide-for-nurses",
      content,
      excerpt: "A complete guide to clinical governance and patient safety.",
      seo: {
        focusKeyword: "clinical governance",
        metaTitle: "Clinical Governance Guide for NHS Nurses in 2026",
        metaDescription: "Learn clinical governance frameworks and audit strategies for your upcoming nursing interview with confidence.",
      },
    });

    expect(analysis.hasLongParagraphs).toBe(true);
    expect(analysis.longParagraphIndices).toContain(2);
  });

  it("evaluates high-scoring SEO when all criteria are met", () => {
    const content = `Preparing for your **NHS nursing interview** is the most crucial step in landing a Band 5 or Band 6 position on the ward.

## Key NHS nursing interview Questions

During the NHS nursing interview, the panel will assess clinical prioritization and patient safety under pressure. You should prepare detailed clinical examples.

## Clinical Governance and SBAR

Always remember to structure your NHS nursing interview answers with clear SBAR communication protocols. Demonstrating the 6Cs is essential.

## Final Recommendations

Review trust values and rehearse with voice feedback before your NHS nursing interview day.
`;

    const analysis = analyzeBlogSeo({
      title: "How to Prepare for Your NHS Nursing Interview",
      slug: "how-to-prepare-for-your-nhs-nursing-interview",
      content,
      excerpt: "Proven strategies and clinical scenario formulas to help you pass your upcoming NHS nursing interview.",
      seo: {
        focusKeyword: "NHS nursing interview",
        metaTitle: "NHS Nursing Interview Guide: Proven Band 5 Questions & Answers",
        metaDescription: "Proven strategies and clinical scenario formulas to help you pass your upcoming NHS nursing interview with top panel scores.",
      },
    });

    expect(analysis.score).toBeGreaterThanOrEqual(75);
    const kwTitleCheck = analysis.checks.find((c) => c.id === "keyword_in_title");
    expect(kwTitleCheck?.status).toBe("pass");

    const kwIntroCheck = analysis.checks.find((c) => c.id === "keyword_in_intro");
    expect(kwIntroCheck?.status).toBe("pass");

    const kwHeadingsCheck = analysis.checks.find((c) => c.id === "keyword_in_headings");
    expect(kwHeadingsCheck?.status).toBe("pass");
  });

  it("flags missing keyword in title and first paragraph", () => {
    const content = "Here is some general text without the focus search term.";
    const analysis = analyzeBlogSeo({
      title: "General Article Title",
      slug: "general-article-title",
      content,
      excerpt: "Some excerpt text.",
      seo: {
        focusKeyword: "executive coaching",
        metaTitle: "General Article Title",
        metaDescription: "Some excerpt text.",
      },
    });

    const titleCheck = analysis.checks.find((c) => c.id === "keyword_in_title");
    expect(titleCheck?.status).toBe("fail");

    const introCheck = analysis.checks.find((c) => c.id === "keyword_in_intro");
    expect(introCheck?.status).toBe("fail");
  });
});

describe("Markdown-to-HTML Parser", () => {
  it("converts headings, bold, callouts, and lists", () => {
    const md = `## Section Title
> [!NOTE]
> This is a key clinical note.

- Bullet 1
- Bullet 2

A paragraph with **bold** text and [Hakkiri](https://hakkiri.com).`;

    const html = markdownToHtml(md);
    expect(html).toContain("<h2");
    expect(html).toContain("Section Title");
    expect(html).toContain("Note");
    expect(html).toContain("This is a key clinical note.");
    expect(html).toContain("<li");
    expect(html).toContain("<strong");
    expect(html).toContain('<a href="https://hakkiri.com"');
  });
});
