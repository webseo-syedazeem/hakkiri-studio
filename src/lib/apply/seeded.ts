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
