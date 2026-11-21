export interface BlogAuthor {
  name: string;
  title: string;
  avatarUrl?: string;
}

export interface BlogSeoData {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or rich text
  category: string;
  tags: string[];
  author: BlogAuthor;
  coverImage: string;
  readingTimeMinutes: number;
  published: boolean;
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  seo: BlogSeoData;
}

export interface SeoDiagnosticCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  recommendation?: string;
}

export interface BlogSeoAnalysis {
  score: number; // 0 - 100
  grade: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  wordCount: number;
  readingTimeMinutes: number;
  headingCount: number;
  paragraphsCount: number;
  hasLongParagraphs: boolean;
  longParagraphIndices: number[];
  keywordDensity: number; // percentage, e.g. 1.8%
  keywordOccurrences: number;
  checks: SeoDiagnosticCheck[];
}
