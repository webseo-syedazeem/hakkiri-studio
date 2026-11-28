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
import { MORE_H } from "./data/more-h";
import { MORE_I } from "./data/more-i";
import { MORE_J } from "./data/more-j";
import { MORE_K } from "./data/more-k";
import { MORE_L } from "./data/more-l";
import { MORE_M } from "./data/more-m";
import { MORE_N } from "./data/more-n";
import { MORE_O } from "./data/more-o";
import { MORE_P } from "./data/more-p";
import { MORE_Q } from "./data/more-q";
import { MORE_R } from "./data/more-r";
import { MORE_S } from "./data/more-s";
import { MORE_T } from "./data/more-t";
import { MORE_U } from "./data/more-u";
import { MORE_V } from "./data/more-v";
import { TECHNOLOGY } from "./data/technology";
import type { ExampleSpec } from "./types";

/** Every example CV, each written for the UK and the US, with its cover letter. */
export const EXAMPLES: ExampleSpec[] = [...TECHNOLOGY, ...BUSINESS, ...COMMERCIAL, ...HEALTHCARE, ...INDUSTRY_PEOPLE, ...INDUSTRY_TECHNICAL, ...INDUSTRY_SERVICES, ...INDUSTRY_OFFICE, ...MORE_A, ...MORE_B, ...MORE_C, ...MORE_D, ...MORE_E, ...MORE_F, ...MORE_G, ...MORE_H, ...MORE_I, ...MORE_J, ...MORE_K, ...MORE_L, ...MORE_M, ...MORE_N, ...MORE_O, ...MORE_P, ...MORE_Q, ...MORE_R, ...MORE_S, ...MORE_T, ...MORE_U, ...MORE_V].map((spec) => {
  const extra = LETTERS[spec.id];
  if (!extra || spec.letter) return spec;
  const { names, ...letter } = extra;
  return { ...spec, letter, names: [...(spec.names ?? []), ...(names ?? [])] };
});

export const exampleById = (id: string) => EXAMPLES.find((e) => e.id === id);
