/**
 * The fonts a CV can be set in. All four families are under the SIL Open Font
 * Licence (the licence texts sit beside the font files), which allows them to
 * be embedded in the files people download.
 */

export const FONT_FILES = {
  "inter-400": { file: "Inter_400Regular.ttf", family: "Inter", weight: 400, italic: false, post: "Inter-Regular" },
  "inter-600": { file: "Inter_600SemiBold.ttf", family: "Inter", weight: 600, italic: false, post: "Inter-SemiBold" },
  "inter-700": { file: "Inter_700Bold.ttf", family: "Inter", weight: 700, italic: false, post: "Inter-Bold" },
  "lora-400": { file: "Lora_400Regular.ttf", family: "Lora", weight: 400, italic: false, post: "Lora-Regular" },
  "lora-600": { file: "Lora_600SemiBold.ttf", family: "Lora", weight: 600, italic: false, post: "Lora-SemiBold" },
  "lora-700": { file: "Lora_700Bold.ttf", family: "Lora", weight: 700, italic: false, post: "Lora-Bold" },
  "plex-400": { file: "IBMPlexSans_400Regular.ttf", family: "IBM Plex Sans", weight: 400, italic: false, post: "IBMPlexSans-Regular" },
  "plex-600": { file: "IBMPlexSans_600SemiBold.ttf", family: "IBM Plex Sans", weight: 600, italic: false, post: "IBMPlexSans-SemiBold" },
  "plex-700": { file: "IBMPlexSans_700Bold.ttf", family: "IBM Plex Sans", weight: 700, italic: false, post: "IBMPlexSans-Bold" },
  "serif-400": { file: "SourceSerif4_400Regular.ttf", family: "Source Serif 4", weight: 400, italic: false, post: "SourceSerif4-Regular" },
  "serif-400i": { file: "SourceSerif4_400Regular_Italic.ttf", family: "Source Serif 4", weight: 400, italic: true, post: "SourceSerif4-Italic" },
  "serif-600": { file: "SourceSerif4_600SemiBold.ttf", family: "Source Serif 4", weight: 600, italic: false, post: "SourceSerif4-SemiBold" },
  "serif-700": { file: "SourceSerif4_700Bold.ttf", family: "Source Serif 4", weight: 700, italic: false, post: "SourceSerif4-Bold" },
} as const;

export type FontKey = keyof typeof FONT_FILES;
export const FONT_KEYS = Object.keys(FONT_FILES) as FontKey[];

/** The families, by the short name used in font keys. */
export const FAMILIES = { inter: "Inter", lora: "Lora", plex: "IBM Plex Sans", serif: "Source Serif 4" } as const;
export type FamilyId = keyof typeof FAMILIES;

/** What Word should fall back to on a computer that does not have the font. */
export const WORD_FALLBACK: Record<FamilyId, string> = { inter: "Arial", lora: "Georgia", plex: "Arial", serif: "Georgia" };

/** The font for a family at a weight, falling back to the nearest weight the family ships. */
export function fontKey(family: FamilyId, weight: 400 | 600 | 700, italic = false): FontKey {
  const exact = `${family}-${weight}${italic ? "i" : ""}`;
  if (exact in FONT_FILES) return exact as FontKey;
  return `${family}-${weight}` as FontKey;
}
