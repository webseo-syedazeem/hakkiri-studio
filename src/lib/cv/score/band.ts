/**
 * The plain label beside a score out of 100, always shown with the number and
 * its reasons, never instead of them. Each label has its own colour on the
 * score ring: red, orange, lime and green.
 */
export const BANDS = [
  { name: "Poor", key: "poor", from: 0 },
  { name: "Average", key: "average", from: 40 },
  { name: "Good", key: "good", from: 60 },
  { name: "Strong", key: "strong", from: 80 },
] as const;
export type Band = (typeof BANDS)[number]["name"];
export type BandKey = (typeof BANDS)[number]["key"];

export const bandOf = (score: number) => [...BANDS].reverse().find((b) => score >= b.from) ?? BANDS[0];
export const band = (score: number): Band => bandOf(score).name;
