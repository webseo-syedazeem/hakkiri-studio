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

/** Every template as the gallery lists it, in the region's spelling. */
export function galleryItems(region: CvRegion) {
  return catalogue().map((t) => ({ id: t.id, no: t.no, name: t.name, family: t.family, ...templateWords(t, region) }));
}
