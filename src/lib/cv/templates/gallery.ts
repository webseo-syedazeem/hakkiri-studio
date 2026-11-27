import { respell } from "@/lib/cv/examples/build";
import { type TemplateDef, catalogue } from "@/lib/cv/render/templates";
import type { CvRegion } from "@/lib/cv/schema";

/**
 * A template's words for one region's gallery: written in UK spelling and
 * respelled for the US ("colour band" becomes "color band").
 */
export function templateWords(t: TemplateDef, region: CvRegion) {
  return { suits: respell(t.suits, region), tags: t.tags.map((g) => respell(g, region)) };
}

/** The 20 designs offered (TEMPLATES-v3 §01) as the gallery lists them, in the region's spelling. */
export function galleryItems(region: CvRegion) {
  return catalogue().map((t) => ({ id: t.id, no: t.no, name: t.name, family: t.family, columns: !!t.grid, ...templateWords(t, region) }));
}
