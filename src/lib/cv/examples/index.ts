import { BUSINESS } from "./data/business";
import { COMMERCIAL } from "./data/commercial";
import { HEALTHCARE } from "./data/healthcare";
import { TECHNOLOGY } from "./data/technology";
import type { ExampleSpec } from "./types";

/** Every example CV, each written for the UK and the US. */
export const EXAMPLES: ExampleSpec[] = [...TECHNOLOGY, ...BUSINESS, ...COMMERCIAL, ...HEALTHCARE];

export const exampleById = (id: string) => EXAMPLES.find((e) => e.id === id);
