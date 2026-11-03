import type { ScoreParts } from "@/lib/types";
import type { ContextProfile } from "./profiles";

export const SCORE_LABELS = ["", "Not yet", "Emerging", "Partly", "Effective", "Strong"] as const;

/** 3.7 → "Effective" (rounds to the nearest whole score). */
export function scoreLabel(score: number): string {
  return SCORE_LABELS[Math.min(5, Math.max(1, Math.round(score)))];
}

/**
 * Overall score = weighted average of the parts, to one decimal place.
 * A part that is null (not applicable) or weighted 0 for this context is
 * removed and the remaining weights are rescaled, so "not applicable"
 * never drags the score down (spec: "Rules that make it work").
 */
export function overallScore(parts: ScoreParts, weights: ContextProfile["weights"]): number | null {
  const entries = (Object.keys(parts) as (keyof ScoreParts)[])
    .map((k) => ({ score: parts[k], weight: weights[k] }))
    .filter((e): e is { score: number; weight: number } => e.score != null && e.weight > 0);
  const total = entries.reduce((s, e) => s + e.weight, 0);
  if (total === 0) return null;
  const value = entries.reduce((s, e) => s + e.score * e.weight, 0) / total;
  return Math.round(value * 10) / 10;
}

export type ReadinessLevel = "ready" | "getting-there" | "not-ready";

/** Group readiness from its average score (spec: readiness by question group). */
export function readinessFor(score: number): ReadinessLevel {
  if (score >= 4) return "ready";
  if (score >= 3) return "getting-there";
  return "not-ready";
}

export const READINESS_LABEL: Record<ReadinessLevel, string> = {
  ready: "Ready",
  "getting-there": "Nearly",
  "not-ready": "Not yet",
};

/** A group score of 0 means the group hasn't been practised yet. */
export function readinessText(score: number): string {
  return score > 0 ? READINESS_LABEL[readinessFor(score)] : "Not practised";
}
