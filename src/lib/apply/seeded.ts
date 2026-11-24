import type { Evidence } from "./schema";

/**
 * Three invented achievements that an earlier build wrote into every new
 * account's Evidence Bank, marked as confirmed. Nobody typed them, so they are
 * never shown and are deleted when the account's bank is next read. Only an
 * exact match counts: an entry the person has edited is theirs and is kept.
 */
const SEEDED_TEXTS = new Set([
  "Spearheaded migration of core billing pipeline to AWS serverless, reducing monthly infrastructure costs by 38% (£45k annual saving).",
  "Resolved major production database deadlock during Black Friday sales rush, coordinating 4 senior engineers and restoring traffic within 12 minutes.",
  "Implemented end-to-end automated testing with Playwright, improving sprint release velocity by 2.5x and dropping defect escape rate to 0.4%.",
]);

export const isSeededEvidence = (e: Pick<Evidence, "text">) => SEEDED_TEXTS.has(e.text);

/* --------------------------------------------------------------------------
   The same for the rest of what an earlier build wrote into every account:
   a career profile, a "voice", job preferences and two job matches. None of
   it was the person's. It is recognised here, by exact value, and removed
   when the account's data is next read. Anything the person changed no
   longer matches and is kept.
-------------------------------------------------------------------------- */

export const SEEDED_PROFILE = {
  phone: "+44 7700 900123",
  location: "London, UK",
  links: ["https://linkedin.com"],
  headline: "Senior Software Engineer & Tech Lead",
  summary: "Results-driven engineering leader with 8+ years building scalable distributed cloud systems.",
  roleEmployer: "FinTech Scaleup",
  roleTitle: "Senior Full Stack Engineer",
  bullets: [
    "Architected real-time payment reconciliation engine processing £14M+ daily transactions with 99.99% uptime.",
    "Mentored 5 junior engineers and introduced TypeScript/Next.js best practices across 3 cross-functional teams.",
  ],
  institution: "University of Manchester",
  qualification: "BSc Computer Science",
  skills: ["TypeScript", "Next.js", "MongoDB", "Cloud Architecture"],
  extra: "AWS Certified Solutions Architect",
  rightToWork: "Yes (UK Citizen)",
  salaryMin: 85000,
} as const;

export const SEEDED_VOICE = {
  sentenceMean: 14.2,
  sentenceSpread: 4.8,
  opens: ["Direct", "Context-first"],
  closes: ["Action-oriented", "Impact-led"],
  signature: ["driven by customer impact", "high-velocity delivery", "rigorous architectural trade-offs"],
  never: ["passionate", "synergy", "spearheaded", "utilize", "rockstar", "delve"],
  neverFromSample: ["passionate", "synergy", "spearheaded"],
} as const;

export const SEEDED_SETTINGS = {
  titles: ["Product Manager", "Lead Developer", "Operations Specialist"],
  locations: ["London", "UK Remote"],
  salaryMin: 60000,
} as const;

const SEEDED_MATCH_REASONS = new Set(["Strong TypeScript & Next.js commercial experience", "Mentored engineering teams and established sprint cadence"]);
/** One of the two invented job matches (fit 88 and 82) written into every account. */
export const isSeededMatch = (m: { fit: number; reasons: string[] }) => (m.fit === 88 || m.fit === 82) && m.reasons.some((r) => SEEDED_MATCH_REASONS.has(r));
