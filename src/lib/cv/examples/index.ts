import { BUSINESS } from "./data/business";
import { COMMERCIAL } from "./data/commercial";
import { HEALTHCARE } from "./data/healthcare";
import { INDUSTRY_OFFICE } from "./data/industry-office";
import { INDUSTRY_PEOPLE } from "./data/industry-people";
import { INDUSTRY_SERVICES } from "./data/industry-services";
import { INDUSTRY_TECHNICAL } from "./data/industry-technical";
import { LETTERS } from "./data/letters";
import { MORE_A } from "./data/more-a";
import { MORE_B } from "./data/more-b";
import { MORE_C } from "./data/more-c";
import { MORE_D } from "./data/more-d";
import { MORE_E } from "./data/more-e";
import { MORE_F } from "./data/more-f";
import { MORE_G } from "./data/more-g";
import { TECHNOLOGY } from "./data/technology";
import type { ExampleSpec } from "./types";

/** Every example CV, each written for the UK and the US, with its cover letter. */
export const EXAMPLES: ExampleSpec[] = [...TECHNOLOGY, ...BUSINESS, ...COMMERCIAL, ...HEALTHCARE, ...INDUSTRY_PEOPLE, ...INDUSTRY_TECHNICAL, ...INDUSTRY_SERVICES, ...INDUSTRY_OFFICE, ...MORE_A, ...MORE_B, ...MORE_C, ...MORE_D, ...MORE_E, ...MORE_F, ...MORE_G].map((spec) => {
  const extra = LETTERS[spec.id];
  if (!extra || spec.letter) return spec;
  const { names, ...letter } = extra;
  return { ...spec, letter, names: [...(spec.names ?? []), ...(names ?? [])] };
});

export const exampleById = (id: string) => EXAMPLES.find((e) => e.id === id);
