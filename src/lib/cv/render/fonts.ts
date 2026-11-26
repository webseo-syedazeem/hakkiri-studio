/**
 * The fonts a CV can be set in. Every family is under the SIL Open Font
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
  "sans3-400": { file: "SourceSans3_400Regular.ttf", family: "Source Sans 3", weight: 400, italic: false, post: "SourceSans3-Regular" },
  "sans3-600": { file: "SourceSans3_600SemiBold.ttf", family: "Source Sans 3", weight: 600, italic: false, post: "SourceSans3-SemiBold" },
  "sans3-700": { file: "SourceSans3_700Bold.ttf", family: "Source Sans 3", weight: 700, italic: false, post: "SourceSans3-Bold" },
  "work-400": { file: "WorkSans_400Regular.ttf", family: "Work Sans", weight: 400, italic: false, post: "WorkSans-Regular" },
  "work-600": { file: "WorkSans_600SemiBold.ttf", family: "Work Sans", weight: 600, italic: false, post: "WorkSans-SemiBold" },
  "work-700": { file: "WorkSans_700Bold.ttf", family: "Work Sans", weight: 700, italic: false, post: "WorkSans-Bold" },
  "franklin-400": { file: "LibreFranklin_400Regular.ttf", family: "Libre Franklin", weight: 400, italic: false, post: "LibreFranklin-Regular" },
  "franklin-600": { file: "LibreFranklin_600SemiBold.ttf", family: "Libre Franklin", weight: 600, italic: false, post: "LibreFranklin-SemiBold" },
  "franklin-700": { file: "LibreFranklin_700Bold.ttf", family: "Libre Franklin", weight: 700, italic: false, post: "LibreFranklin-Bold" },
  "manrope-400": { file: "Manrope_400Regular.ttf", family: "Manrope", weight: 400, italic: false, post: "Manrope-Regular" },
  "manrope-600": { file: "Manrope_600SemiBold.ttf", family: "Manrope", weight: 600, italic: false, post: "Manrope-SemiBold" },
  "manrope-700": { file: "Manrope_700Bold.ttf", family: "Manrope", weight: 700, italic: false, post: "Manrope-Bold" },
  "garamond-400": { file: "EBGaramond_400Regular.ttf", family: "EB Garamond", weight: 400, italic: false, post: "EBGaramond-Regular" },
  "garamond-400i": { file: "EBGaramond_400Regular_Italic.ttf", family: "EB Garamond", weight: 400, italic: true, post: "EBGaramond-Italic" },
  "garamond-600": { file: "EBGaramond_600SemiBold.ttf", family: "EB Garamond", weight: 600, italic: false, post: "EBGaramond-SemiBold" },
  "garamond-700": { file: "EBGaramond_700Bold.ttf", family: "EB Garamond", weight: 700, italic: false, post: "EBGaramond-Bold" },
  "crimson-400": { file: "CrimsonPro_400Regular.ttf", family: "Crimson Pro", weight: 400, italic: false, post: "CrimsonPro-Regular" },
  "crimson-400i": { file: "CrimsonPro_400Regular_Italic.ttf", family: "Crimson Pro", weight: 400, italic: true, post: "CrimsonPro-Italic" },
  "crimson-600": { file: "CrimsonPro_600SemiBold.ttf", family: "Crimson Pro", weight: 600, italic: false, post: "CrimsonPro-SemiBold" },
  "crimson-700": { file: "CrimsonPro_700Bold.ttf", family: "Crimson Pro", weight: 700, italic: false, post: "CrimsonPro-Bold" },
  "mono-400": { file: "IBMPlexMono_400Regular.ttf", family: "IBM Plex Mono", weight: 400, italic: false, post: "IBMPlexMono-Regular" },
  "mono-600": { file: "IBMPlexMono_600SemiBold.ttf", family: "IBM Plex Mono", weight: 600, italic: false, post: "IBMPlexMono-SemiBold" },
  "mono-700": { file: "IBMPlexMono_700Bold.ttf", family: "IBM Plex Mono", weight: 700, italic: false, post: "IBMPlexMono-Bold" },
} as const;

export type FontKey = keyof typeof FONT_FILES;
export const FONT_KEYS = Object.keys(FONT_FILES) as FontKey[];

/** The families, by the short name used in font keys. */
export const FAMILIES = {
  inter: "Inter",
  lora: "Lora",
  plex: "IBM Plex Sans",
  serif: "Source Serif 4",
  sans3: "Source Sans 3",
  work: "Work Sans",
  franklin: "Libre Franklin",
  manrope: "Manrope",
  garamond: "EB Garamond",
  crimson: "Crimson Pro",
  mono: "IBM Plex Mono",
} as const;
export type FamilyId = keyof typeof FAMILIES;

/** What Word should fall back to on a computer that does not have the font. */
export const WORD_FALLBACK: Record<FamilyId, string> = { inter: "Arial", lora: "Georgia", plex: "Arial", serif: "Georgia", sans3: "Calibri", work: "Arial", franklin: "Arial", manrope: "Arial", garamond: "Garamond", crimson: "Georgia", mono: "Consolas" };

/** How Word groups a family when it has to choose a substitute: sans serif, serif or fixed width. */
export const WORD_KIND: Record<FamilyId, "swiss" | "roman" | "modern"> = { inter: "swiss", lora: "roman", plex: "swiss", serif: "roman", sans3: "swiss", work: "swiss", franklin: "swiss", manrope: "swiss", garamond: "roman", crimson: "roman", mono: "modern" };

/** The font for a family at a weight, falling back to the nearest weight the family ships. */
export function fontKey(family: FamilyId, weight: 400 | 600 | 700, italic = false): FontKey {
  const exact = `${family}-${weight}${italic ? "i" : ""}`;
  if (exact in FONT_FILES) return exact as FontKey;
  return `${family}-${weight}` as FontKey;
}

/**
 * True for a character from a script that none of the fonts here has: Chinese,
 * Japanese, Korean, Arabic, Hebrew, the scripts of India, emoji. The fonts
 * cover Latin, Greek and Cyrillic letters and the common symbols; for those a
 * different pairing can have a character that this one lacks.
 */
export function beyondOurFonts(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return cp >= 0x0530 && !(cp >= 0x1e00 && cp <= 0x2bff) && !(cp >= 0xfb00 && cp <= 0xfb06);
}

/**
 * What to do about characters the fonts cannot draw, said truthfully. When no
 * font here has them, choosing another pairing cannot help, so it is not
 * suggested. The Word file is drawn with the fonts on the computer that opens
 * it, so it can hold them.
 */
export function cannotDrawAdvice(chars: string[]): string {
  return chars.some(beyondOurFonts)
    ? "None of our fonts can draw these, so they can’t go in the PDF. Write them in Latin letters, or use the Word file, which is drawn with the fonts on the computer that opens it."
    : "These fonts can’t draw them, so they can’t go in the PDF. Replace them, try a different font pairing, or use the Word file.";
}
