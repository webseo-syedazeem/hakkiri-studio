import type { BlogSeoData, BlogSeoAnalysis, SeoDiagnosticCheck } from "./types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Extracts plain paragraphs from Markdown/HTML text.
 */
export function extractParagraphs(content: string): string[] {
  // Normalize line breaks
  const normalized = content.replace(/\r\n/g, "\n");
  // Split by double line breaks
  const rawBlocks = normalized.split(/\n\s*\n/);
  const paragraphs: string[] = [];

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Skip Markdown headings, tables, or code fences
    if (trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("|")) {
      continue;
    }
    // Strip markdown formatting characters for clean word analysis
    const clean = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[*_~`]/g, "") // bold, italic, code
      .replace(/^>\s*/gm, "") // quotes
      .replace(/^[-*+]\s+/gm, ""); // list bullets
    if (clean.length > 20) {
      paragraphs.push(clean);
    }
  }

  return paragraphs;
}

/**
 * Extracts headings from Markdown content.
 */
export function extractHeadings(content: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim().replace(/[*_`]/g, ""),
      });
    }
  }

  return headings;
}

/**
 * Real-time SEO and readability analyzer for blog posts.
 */
export function analyzeBlogSeo(params: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seo: BlogSeoData;
}): BlogSeoAnalysis {
  const { title, slug, content, seo } = params;
  const focusKeyword = (seo.focusKeyword || "").trim().toLowerCase();
  const metaTitle = (seo.metaTitle || title || "").trim();
  const metaDescription = (seo.metaDescription || params.excerpt || "").trim();

  // Words calculation
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = calculateReadingTimeMinutes(content);

  // Paragraphs calculation
  const paragraphs = extractParagraphs(content);
  const headings = extractHeadings(content);

  // Check long paragraphs (>120 words)
  const longParagraphIndices: number[] = [];
  paragraphs.forEach((p, idx) => {
    const pWords = p.split(/\s+/).filter(Boolean).length;
    if (pWords > 120) {
      longParagraphIndices.push(idx + 1);
    }
  });
  const hasLongParagraphs = longParagraphIndices.length > 0;

  // Keyword occurrences and density
  let keywordOccurrences = 0;
  let keywordDensity = 0;

  if (focusKeyword && wordCount > 0) {
    const escaped = focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = content.match(regex);
    keywordOccurrences = matches ? matches.length : 0;
    const kwWords = focusKeyword.split(/\s+/).length;
    keywordDensity = Number(((keywordOccurrences * kwWords * 100) / wordCount).toFixed(2));
  }

  const checks: SeoDiagnosticCheck[] = [];

  // 1. Focus Keyword presence
  if (!focusKeyword) {
    checks.push({
      id: "focus_keyword_missing",
      label: "Target Focus Keyword",
      status: "fail",
      message: "No focus keyword set.",
      recommendation: "Define a target search term (e.g. 'NHS nursing interview') to optimize your ranking.",
    });
  } else {
    // 2. Keyword in Title
    const titleLower = title.toLowerCase();
    if (titleLower.includes(focusKeyword)) {
      checks.push({
        id: "keyword_in_title",
        label: "Focus Keyword in Title",
        status: "pass",
        message: `Focus keyword "${focusKeyword}" appears in the main title.`,
      });
    } else {
      checks.push({
        id: "keyword_in_title",
        label: "Focus Keyword in Title",
        status: "fail",
        message: `Keyword "${focusKeyword}" is missing from the title.`,
        recommendation: "Include your primary keyword near the start of the title.",
      });
    }

    // 3. Keyword in URL Slug
    const slugLower = slug.toLowerCase();
    const slugKeyword = slugify(focusKeyword);
    if (slugLower.includes(slugKeyword) || slugLower.includes(focusKeyword.replace(/\s+/g, "-"))) {
      checks.push({
        id: "keyword_in_slug",
        label: "Focus Keyword in URL Slug",
        status: "pass",
        message: "URL slug cleanly incorporates the focus keyword.",
      });
    } else {
      checks.push({
        id: "keyword_in_slug",
        label: "Focus Keyword in URL Slug",
        status: "warn",
        message: "Focus keyword is not fully in the URL slug.",
        recommendation: `Consider shortening the slug to contain "${slugKeyword}".`,
      });
    }

    // 4. Keyword in First Paragraph (Introduction)
    const firstParagraph = paragraphs[0] || "";
    if (firstParagraph.toLowerCase().includes(focusKeyword)) {
      checks.push({
        id: "keyword_in_intro",
        label: "Focus Keyword in Introduction",
        status: "pass",
        message: "Focus keyword appears in the first paragraph.",
      });
    } else {
      checks.push({
        id: "keyword_in_intro",
        label: "Focus Keyword in Introduction",
        status: "fail",
        message: "Focus keyword is missing in the opening paragraph.",
        recommendation: "Introduce your target keyword in the first 100-150 words.",
      });
    }

    // 5. Keyword in Headings (H2 / H3)
    const kwInHeadings = headings.some((h) => h.text.toLowerCase().includes(focusKeyword));
    if (kwInHeadings) {
      checks.push({
        id: "keyword_in_headings",
        label: "Focus Keyword in Headings",
        status: "pass",
        message: "At least one H2/H3 subheading includes the focus keyword.",
      });
    } else {
      checks.push({
        id: "keyword_in_headings",
        label: "Focus Keyword in Headings",
        status: "warn",
        message: "Focus keyword does not appear in any subheadings.",
        recommendation: "Add your keyword or an exact variation to an H2 section title.",
      });
    }

    // 6. Keyword Density Check
    if (keywordDensity >= 0.8 && keywordDensity <= 2.5) {
      checks.push({
        id: "keyword_density",
        label: "Focus Keyword Density",
        status: "pass",
        message: `Healthy density (${keywordDensity}%, ${keywordOccurrences} occurrences).`,
      });
    } else if (keywordDensity > 0 && keywordDensity < 0.8) {
      checks.push({
        id: "keyword_density",
        label: "Focus Keyword Density",
        status: "warn",
        message: `Keyword density is a bit low (${keywordDensity}%, ${keywordOccurrences} occurrences).`,
        recommendation: "Mention the keyword 2-3 more times naturally across body paragraphs.",
      });
    } else if (keywordDensity > 2.5) {
      checks.push({
        id: "keyword_density",
        label: "Focus Keyword Density",
        status: "fail",
        message: `High keyword density (${keywordDensity}%). Risk of keyword stuffing.`,
        recommendation: "Use synonyms or reduce repetitive mentions.",
      });
    } else {
      checks.push({
        id: "keyword_density",
        label: "Focus Keyword Density",
        status: "fail",
        message: `Focus keyword never appears in the body text (0 occurrences).`,
        recommendation: "Weave the keyword naturally throughout your article content.",
      });
    }
  }

  // 7. SEO Meta Title Length
  const titleLen = metaTitle.length;
  if (titleLen >= 48 && titleLen <= 65) {
    checks.push({
      id: "meta_title_len",
      label: "SEO Title Length",
      status: "pass",
      message: `Optimal length (${titleLen} / 60 characters).`,
    });
  } else if ((titleLen >= 35 && titleLen < 48) || (titleLen > 65 && titleLen <= 75)) {
    checks.push({
      id: "meta_title_len",
      label: "SEO Title Length",
      status: "warn",
      message: `Acceptable length (${titleLen} characters), but may truncate or lack punch in Google SERP.`,
      recommendation: "Aim for 50-60 characters for crisp search snippet rendering.",
    });
  } else {
    checks.push({
      id: "meta_title_len",
      label: "SEO Title Length",
      status: "fail",
      message: titleLen === 0 ? "SEO Title is missing." : `Title is too ${titleLen < 35 ? "short" : "long"} (${titleLen} characters).`,
      recommendation: "Keep between 50 and 60 characters for optimal click-through rates.",
    });
  }

  // 8. Meta Description Length & Keyword
  const descLen = metaDescription.length;
  if (descLen >= 120 && descLen <= 160) {
    const kwInDesc = focusKeyword ? metaDescription.toLowerCase().includes(focusKeyword) : true;
    checks.push({
      id: "meta_desc_len",
      label: "Meta Description Length",
      status: kwInDesc ? "pass" : "warn",
      message: `Great length (${descLen} / 155 characters).${!kwInDesc ? " (Warning: missing focus keyword)" : ""}`,
      recommendation: !kwInDesc ? "Include your target keyword in the meta description." : undefined,
    });
  } else if ((descLen >= 80 && descLen < 120) || (descLen > 160 && descLen <= 175)) {
    checks.push({
      id: "meta_desc_len",
      label: "Meta Description Length",
      status: "warn",
      message: `Description is ${descLen < 120 ? "a bit short" : "slightly long"} (${descLen} characters).`,
      recommendation: "Target 120 to 160 characters for maximum SERP snippet impact.",
    });
  } else {
    checks.push({
      id: "meta_desc_len",
      label: "Meta Description Length",
      status: "fail",
      message: descLen === 0 ? "Meta Description is empty." : `Description length (${descLen} characters) is out of bounds.`,
      recommendation: "Provide a compelling summary between 120 and 160 characters.",
    });
  }

  // 9. Article Content Depth (Word Count)
  if (wordCount >= 1000) {
    checks.push({
      id: "word_count",
      label: "Content Length & Depth",
      status: "pass",
      message: `In-depth content (${wordCount.toLocaleString()} words, ~${readingTimeMinutes} min read).`,
    });
  } else if (wordCount >= 500) {
    checks.push({
      id: "word_count",
      label: "Content Length & Depth",
      status: "warn",
      message: `Moderate length (${wordCount.toLocaleString()} words). Solid, but long-form content ranks higher.`,
      recommendation: "Expand on practical examples or FAQs to reach 900+ words.",
    });
  } else {
    checks.push({
      id: "word_count",
      label: "Content Length & Depth",
      status: "fail",
      message: `Thin content (${wordCount} words). Thin articles struggle to rank on Google.`,
      recommendation: "Write at least 600 words of actionable advice.",
    });
  }

  // 10. Headings Hierarchy
  if (headings.length >= 3) {
    checks.push({
      id: "headings_structure",
      label: "Subheadings & Structure",
      status: "pass",
      message: `Well structured with ${headings.length} subheadings.`,
    });
  } else if (headings.length >= 1) {
    checks.push({
      id: "headings_structure",
      label: "Subheadings & Structure",
      status: "warn",
      message: `Only ${headings.length} subheading found.`,
      recommendation: "Add more H2 and H3 sections to make content skimmable for readers.",
    });
  } else {
    checks.push({
      id: "headings_structure",
      label: "Subheadings & Structure",
      status: "fail",
      message: "No H2/H3 subheadings found in article content.",
      recommendation: "Break up text with descriptive H2 headings.",
    });
  }

  // 11. Readability: Paragraph Length
  if (!hasLongParagraphs) {
    checks.push({
      id: "paragraph_readability",
      label: "Paragraph Readability",
      status: "pass",
      message: "All paragraphs are concise and scannable (under 120 words).",
    });
  } else {
    checks.push({
      id: "paragraph_readability",
      label: "Paragraph Readability",
      status: longParagraphIndices.length > 2 ? "fail" : "warn",
      message: `${longParagraphIndices.length} paragraph(s) exceed 120 words (e.g. paragraph #${longParagraphIndices.slice(0, 3).join(", #")}).`,
      recommendation: "Break walls of text into 2-3 shorter paragraphs to enhance mobile readability.",
    });
  }

  // Score computation
  let passedCount = 0;
  let warnCount = 0;
  let failCount = 0;

  checks.forEach((c) => {
    if (c.status === "pass") passedCount++;
    else if (c.status === "warn") warnCount++;
    else failCount++;
  });

  const totalChecks = checks.length;
  // Weighted: pass = 100%, warn = 50%, fail = 0%
  const score = totalChecks > 0 ? Math.round(((passedCount * 1.0 + warnCount * 0.5) / totalChecks) * 100) : 0;

  let grade: BlogSeoAnalysis["grade"] = "Needs Improvement";
  if (score >= 85) grade = "Excellent";
  else if (score >= 70) grade = "Good";
  else if (score >= 50) grade = "Needs Improvement";
  else grade = "Poor";

  return {
    score,
    grade,
    wordCount,
    readingTimeMinutes,
    headingCount: headings.length,
    paragraphsCount: paragraphs.length,
    hasLongParagraphs,
    longParagraphIndices,
    keywordDensity,
    keywordOccurrences,
    checks,
  };
}
