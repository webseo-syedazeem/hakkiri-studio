import { BUSINESS } from "./data/business";
import { COMMERCIAL } from "./data/commercial";
import { HEALTHCARE } from "./data/healthcare";
import { LETTERS } from "./data/letters";
import { TECHNOLOGY } from "./data/technology";
import type { ExampleSpec } from "./types";

/** Every example CV, each written for the UK and the US, with its cover letter. */
export const EXAMPLES: ExampleSpec[] = [...TECHNOLOGY, ...BUSINESS, ...COMMERCIAL, ...HEALTHCARE].map((spec) => {
  const extra = LETTERS[spec.id];
  if (!extra || spec.letter) return spec;
  const { names, ...letter } = extra;
  return { ...spec, letter, names: [...(spec.names ?? []), ...(names ?? [])] };
});

export const exampleById = (id: string) => EXAMPLES.find((e) => e.id === id);
