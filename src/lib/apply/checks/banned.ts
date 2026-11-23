export const CV_CLICHES = [
  "results-driven",
  "passionate",
  "proven track record",
  "team player",
  "detail-oriented",
  "dynamic",
  "synergy",
  "go-getter",
  "think outside the box",
  "rockstar",
  "guru",
  "hardworking",
  "self-starter",
];

export const MODEL_HABITS = [
  "delve",
  "tapestry",
  "testament to",
  "in today's fast-paced world",
  "i am writing to express my interest",
  "it is worth noting",
  "pivotal",
  "robust",
  "seamless",
  "landscape",
  "leverage",
  "spearheaded",
  "foster",
  "plethora",
  "beacon",
  "realm",
];

export const ALL_BANNED = [...CV_CLICHES, ...MODEL_HABITS];

export function findBannedPhrases(text: string, customNever: string[] = []): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  const list = [...ALL_BANNED, ...customNever.map((s) => s.toLowerCase())];

  for (const phrase of list) {
    if (!phrase) continue;
    // Word boundary match
    const regex = new RegExp(`\\b${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      hits.push(phrase);
    }
  }

  // Structural checks
  if (lower.startsWith("why ") || lower.startsWith("have you ever ")) {
    hits.push("rhetorical question opener");
  }

  return Array.from(new Set(hits));
}
